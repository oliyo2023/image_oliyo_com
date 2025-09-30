// src/lib/stripe.ts
import Stripe from 'stripe';
import db from './db';

// Initialize Stripe with the secret key from environment
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

interface CreditPurchaseIntent {
  userId: string;
  credits: number;
  paymentMethodId: string;
}

interface PurchaseConfirmation {
  userId: string;
  paymentIntentId: string;
}

interface PurchaseResult {
  success: boolean;
  message: string;
  paymentIntentId?: string;
  clientSecret?: string;
  amount?: number;
  credits?: number;
  newBalance?: number;
}

export async function createCreditPurchaseIntent(purchaseData: CreditPurchaseIntent): Promise<PurchaseResult> {
  try {
    const { userId, credits, paymentMethodId } = purchaseData;

    // Validate input
    if (!userId || !credits || !paymentMethodId) {
      return {
        success: false,
        message: 'User ID, credits, and payment method ID are required'
      };
    }

    // Define credit packages and their prices (in cents)
    const creditPackages: { [key: number]: number } = {
      100: 999,   // $9.99
      500: 4499,  // $44.99
      1000: 8999  // $89.99
    };

    // Validate that the requested credit amount is a valid package
    if (!creditPackages[credits]) {
      return {
        success: false,
        message: 'Invalid credit package'
      };
    }

    // Verify user exists
    const user = await db.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return {
        success: false,
        message: 'User not found'
      };
    }

    // Create payment intent using Stripe
    const amountInCents = creditPackages[credits];
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      payment_method: paymentMethodId,
      confirm: true, // Confirm the payment immediately
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`,
      metadata: {
        userId,
        credits: credits.toString()
      }
    });

    // Create a pending credit transaction record
    await db.creditTransaction.create({
      data: {
        userId,
        transactionType: 'purchased',
        amount: credits, // Positive amount for purchased credits
        description: `Purchase of ${credits} credits`,
        relatedModelName: null
      }
    });

    return {
      success: true,
      message: 'Payment intent created successfully',
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret || '',
      amount: amountInCents,
      credits: credits
    };
  } catch (error) {
    console.error('Error creating credit purchase intent:', error);
    return {
      success: false,
      message: 'An error occurred during payment processing'
    };
  }
}

export async function confirmCreditPurchase(confirmationData: PurchaseConfirmation): Promise<PurchaseResult> {
  try {
    const { userId, paymentIntentId } = confirmationData;

    // Validate input
    if (!userId || !paymentIntentId) {
      return {
        success: false,
        message: 'User ID and payment intent ID are required'
      };
    }

    // Verify user exists
    const user = await db.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return {
        success: false,
        message: 'User not found'
      };
    }

    // Retrieve the payment intent from Stripe to ensure it's successful
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return {
        success: false,
        message: `Payment not successful, status: ${paymentIntent.status}`
      };
    }

    // Find the pending credit transaction for this payment
    const creditTransaction = await db.creditTransaction.findFirst({
      where: {
        userId,
        description: { contains: 'Purchase' },
        transactionType: 'purchased'
      },
      orderBy: {
        date: 'desc'
      }
    });

    if (!creditTransaction) {
      return {
        success: false,
        message: 'No matching credit purchase found for this payment'
      };
    }

    // Get the number of credits from the transaction description
    const credits = parseInt(creditTransaction.description.match(/(\d+) credits/)?.[1] || '0');

    // Update user's credit balance
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        creditBalance: {
          increment: credits
        }
      }
    });

    // Update the transaction status to completed
    await db.creditTransaction.update({
      where: { id: creditTransaction.id },
      data: {
        description: `Purchase of ${credits} credits - COMPLETED`
      }
    });

    return {
      success: true,
      message: 'Payment confirmed and credits added',
      newBalance: updatedUser.creditBalance,
      credits: credits
    };
  } catch (error) {
    console.error('Error confirming credit purchase:', error);
    return {
      success: false,
      message: 'An error occurred during payment confirmation'
    };
  }
}

// Get credit packages for display to users
export function getCreditPackages() {
  return [
    { credits: 100, price: 9.99, description: 'Starter Pack' },
    { credits: 500, price: 44.99, description: 'Value Pack' },
    { credits: 1000, price: 89.99, description: 'Best Value' }
  ];
}