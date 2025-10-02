import Stripe from 'stripe';
import prisma from './db';
import { adjustUserCredits } from './credit';

// Initialize Stripe with the secret key from environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_missing_config', {
  apiVersion: '2023-10-16', // Use latest API version
});

// Credit packages configuration - mapping ID to credits and amount
const CREDIT_PACKAGES = {
  100: { credits: 100, amount: 999 },    // $9.99 for 100 credits
  500: { credits: 500, amount: 4499 },   // $44.99 for 500 credits  
  1000: { credits: 1000, amount: 8999 }, // $89.99 for 1000 credits
};

export interface CreditPackage {
  credits: number;
  amount: number; // Amount in cents
}

export interface PaymentIntentRequest {
  userId: string;
  credits: number;
  paymentMethodId: string;
}

export interface PaymentConfirmationRequest {
  paymentIntentId: string;
  userId: string;
}

/**
 * Creates a payment intent for credit purchase
 */
export async function createPaymentIntent(request: PaymentIntentRequest) {
  const { userId, credits, paymentMethodId } = request;

  // Validate that the requested credits amount is available in our packages
  if (!CREDIT_PACKAGES[credits]) {
    throw new Error(`Invalid credit amount. Valid amounts: ${Object.keys(CREDIT_PACKAGES).join(', ')}`);
  }

  const packageInfo = CREDIT_PACKAGES[credits];

  try {
    // Create the payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: packageInfo.amount, // Amount in cents
      currency: 'usd',
      payment_method: paymentMethodId,
      confirm: true, // Confirm immediately
      return_url: `${process.env.BASE_URL || 'http://localhost:3000'}/payment-success`,
    });

    // If the payment is successful, update our system
    if (paymentIntent.status === 'succeeded') {
      // Add credits to the user's account
      await adjustUserCredits(
        userId,
        packageInfo.credits,
        `Credit purchase: ${packageInfo.credits} credits`,
        null
      );

      // Record the transaction
      await prisma.creditTransaction.create({
        data: {
          userId,
          transactionType: 'purchased',
          amount: packageInfo.credits,
          description: `Credit purchase: ${packageInfo.credits} credits`,
          relatedModelName: null,
        },
      });

      return {
        success: true,
        message: 'Payment successful and credits added',
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        amount: packageInfo.amount,
        credits: packageInfo.credits,
        newBalance: await prisma.user.findUnique({ where: { id: userId } }).then(u => u?.creditBalance || 0),
      };
    } else {
      // Payment not succeeded yet, return intent for further processing
      return {
        success: true,
        message: 'Payment intent created',
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        amount: packageInfo.amount,
        credits: packageInfo.credits,
      };
    }
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw new Error(error instanceof Error ? error.message : 'Payment processing failed');
  }
}

/**
 * Confirms a payment intent and adds credits to user account
 */
export async function confirmPayment(request: PaymentConfirmationRequest) {
  const { paymentIntentId, userId } = request;

  try {
    // Retrieve the payment intent to check its status
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      // Find the corresponding credit amount 
      // This requires that we store the purchase details when creating the intent
      // For now, we'll look it up in our database
      const purchaseRecord = await prisma.purchaseIntent.findUnique({
        where: { paymentIntentId },
      });

      if (!purchaseRecord) {
        throw new Error('Purchase record not found for this payment intent');
      }

      // Add credits to the user's account
      await adjustUserCredits(
        userId,
        purchaseRecord.credits,
        `Credit purchase confirmation: ${purchaseRecord.credits} credits`,
        null
      );

      // Record the transaction
      await prisma.creditTransaction.create({
        data: {
          userId,
          transactionType: 'purchased',
          amount: purchaseRecord.credits,
          description: `Credit purchase confirmation: ${purchaseRecord.credits} credits`,
          relatedModelName: null,
        },
      });

      // Update purchase record to confirmed
      await prisma.purchaseIntent.update({
        where: { paymentIntentId },
        data: { confirmed: true, confirmedAt: new Date() },
      });

      return {
        success: true,
        message: 'Payment confirmed and credits added',
        newBalance: await prisma.user.findUnique({ where: { id: userId } }).then(u => u?.creditBalance || 0),
        creditsAdded: purchaseRecord.credits,
      };
    } else {
      throw new Error(`Payment not successful. Status: ${paymentIntent.status}`);
    }
  } catch (error) {
    console.error('Error confirming payment:', error);
    throw new Error(error instanceof Error ? error.message : 'Payment confirmation failed');
  }
}

/**
 * Gets available credit packages
 */
export function getCreditPackages(): { [key: number]: CreditPackage } {
  return CREDIT_PACKAGES;
}

/**
 * Creates a payment intent that is not immediately confirmed
 * This is useful for the checkout flow where client confirms later
 */
export async function createPurchaseIntent(userId: string, credits: number) {
  // Validate that the requested credits amount is available in our packages
  if (!CREDIT_PACKAGES[credits]) {
    throw new Error(`Invalid credit amount. Valid amounts: ${Object.keys(CREDIT_PACKAGES).join(', ')}`);
  }

  const packageInfo = CREDIT_PACKAGES[credits];

  try {
    // Create the payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: packageInfo.amount, // Amount in cents
      currency: 'usd',
      metadata: {
        userId,
        credits: credits.toString(),
      },
    });

    // Store the purchase intent information in our DB
    await prisma.purchaseIntent.create({
      data: {
        paymentIntentId: paymentIntent.id,
        userId,
        credits,
        amount: packageInfo.amount,
        status: paymentIntent.status,
      },
    });

    return {
      success: true,
      message: 'Purchase intent created',
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      amount: packageInfo.amount,
      credits: packageInfo.credits,
    };
  } catch (error) {
    console.error('Error creating purchase intent:', error);
    throw new Error(error instanceof Error ? error.message : 'Purchase intent creation failed');
  }
}

/**
 * Handles webhook from Stripe to confirm payment automatically
 */
export async function handleStripeWebhook(payload: Buffer, signature: string) {
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!endpointSecret) {
    throw new Error('Stripe webhook secret not configured');
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    throw new Error('Invalid signature');
  }

  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      // Update our internal records to reflect successful payment
      await processSuccessfulPayment(paymentIntent.id);
      break;
    case 'payment_intent.payment_failed':
      const failedPaymentIntent = event.data.object;
      // Handle failed payment
      console.log(`Payment failed: ${failedPaymentIntent.id}`);
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return { received: true };
}

/**
 * Processes a successful payment
 */
async function processSuccessfulPayment(paymentIntentId: string) {
  try {
    // Retrieve the purchase record
    const purchaseRecord = await prisma.purchaseIntent.findUnique({
      where: { paymentIntentId },
    });

    if (!purchaseRecord || purchaseRecord.confirmed) {
      // Either no record or already processed
      return;
    }

    // Add credits to the user's account
    await adjustUserCredits(
      purchaseRecord.userId,
      purchaseRecord.credits,
      `Credit purchase (webhook): ${purchaseRecord.credits} credits`,
      null
    );

    // Record the transaction
    await prisma.creditTransaction.create({
      data: {
        userId: purchaseRecord.userId,
        transactionType: 'purchased',
        amount: purchaseRecord.credits,
        description: `Credit purchase (webhook): ${purchaseRecord.credits} credits`,
        relatedModelName: null,
      },
    });

    // Update purchase record to confirmed
    await prisma.purchaseIntent.update({
      where: { paymentIntentId },
      data: { confirmed: true, confirmedAt: new Date() },
    });
  } catch (error) {
    console.error('Error processing successful payment:', error);
  }
}

/**
 * Refund a payment
 */
export async function refundPayment(paymentIntentId: string, reason?: string) {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      reason: reason || 'requested_by_customer',
    });

    return refund;
  } catch (error) {
    console.error('Error creating refund:', error);
    throw new Error(error instanceof Error ? error.message : 'Refund creation failed');
  }
}