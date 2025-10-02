import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  priceInCents: number; // Price in cents (e.g., $10.00 = 1000)
  description: string;
}

export interface PurchaseIntentParams {
  userId: string;
  credits: number;
  priceInCents: number;
}

export interface PaymentResult {
  success: boolean;
  paymentIntentId?: string;
  clientSecret?: string;
  error?: string;
}

export class PaymentService {
  // Define credit packages that users can purchase
  private creditPackages: CreditPackage[] = [
    {
      id: 'pkg-1',
      name: 'Small Pack',
      credits: 100,
      priceInCents: 999, // $9.99
      description: 'Perfect for getting started'
    },
    {
      id: 'pkg-2',
      name: 'Medium Pack',
      credits: 250,
      priceInCents: 1999, // $19.99
      description: 'Best value option'
    },
    {
      id: 'pkg-3',
      name: 'Large Pack',
      credits: 550,
      priceInCents: 3499, // $34.99
      description: 'Our most popular option'
    },
    {
      id: 'pkg-4',
      name: 'Jumbo Pack',
      credits: 1200,
      priceInCents: 5999, // $59.99
      description: 'Maximum savings'
    }
  ];

  /**
   * Creates a Stripe payment intent for credit purchase
   */
  async createPurchaseIntent(params: PurchaseIntentParams): Promise<PaymentResult> {
    try {
      // Verify the user exists
      const user = await prisma.user.findUnique({
        where: { id: params.userId }
      });

      if (!user) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      // Create a payment intent with Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount: params.priceInCents,
        currency: 'usd',
        metadata: {
          userId: params.userId,
          credits: params.credits.toString(),
        },
        // Use automatic payment methods
        automatic_payment_methods: {
          enabled: true,
        },
      });

      // Store the purchase intent in the database
      await prisma.purchaseIntent.create({
        data: {
          paymentIntentId: paymentIntent.id,
          userId: params.userId,
          credits: params.credits,
          amount: params.priceInCents,
          status: paymentIntent.status,
        }
      });

      return {
        success: true,
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret || undefined
      };
    } catch (error: any) {
      console.error('Error creating purchase intent:', error);
      return {
        success: false,
        error: error.message || 'Error creating purchase intent'
      };
    }
  }

  /**
   * Verifies and confirms a payment intent
   */
  async confirmPaymentIntent(paymentIntentId: string): Promise<PaymentResult> {
    try {
      // Retrieve the payment intent from Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status !== 'succeeded') {
        return {
          success: false,
          error: `Payment not succeeded. Current status: ${paymentIntent.status}`
        };
      }

      // Retrieve the purchase intent from our database
      const purchaseIntent = await prisma.purchaseIntent.findUnique({
        where: { paymentIntentId }
      });

      if (!purchaseIntent) {
        return {
          success: false,
          error: 'Purchase intent not found in our records'
        };
      }

      if (purchaseIntent.confirmed) {
        return {
          success: true,
          paymentIntentId: paymentIntent.id
        };
      }

      // Add credits to user account
      await prisma.user.update({
        where: { id: purchaseIntent.userId },
        data: {
          creditBalance: {
            increment: purchaseIntent.credits
          }
        }
      });

      // Record the credit transaction
      await prisma.creditTransaction.create({
        data: {
          userId: purchaseIntent.userId,
          transactionType: 'CREDIT_PURCHASE',
          amount: purchaseIntent.credits,
          description: `Purchase of ${purchaseIntent.credits} credits`,
        }
      });

      // Update the purchase intent status
      await prisma.purchaseIntent.update({
        where: { paymentIntentId },
        data: {
          confirmed: true,
          confirmedAt: new Date(),
          status: paymentIntent.status
        }
      });

      return {
        success: true,
        paymentIntentId: paymentIntent.id
      };
    } catch (error: any) {
      console.error('Error confirming payment intent:', error);
      return {
        success: false,
        error: error.message || 'Error confirming payment'
      };
    }
  }

  /**
   * Handles Stripe webhook for payment confirmation
   */
  async handleStripeWebhook(payload: Buffer, signature: string): Promise<boolean> {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('Stripe webhook secret not configured');
      return false;
    }

    try {
      const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);

      // Handle the event
      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          console.log(`PaymentIntent succeeded: ${paymentIntent.id}`);
          
          // Confirm the payment in our system
          await this.confirmPaymentIntent(paymentIntent.id);
          break;

        case 'payment_intent.payment_failed':
          const failedPaymentIntent = event.data.object as Stripe.PaymentIntent;
          console.log(`PaymentIntent failed: ${failedPaymentIntent.id}`);
          
          // Update purchase intent status in our database
          await prisma.purchaseIntent.update({
            where: { paymentIntentId: failedPaymentIntent.id },
            data: { status: 'failed' }
          });
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      return true;
    } catch (error: any) {
      console.error('Error verifying webhook:', error);
      return false;
    }
  }

  /**
   * Gets all available credit packages
   */
  getCreditPackages(): CreditPackage[] {
    return this.creditPackages;
  }

  /**
   * Gets a specific credit package by ID
   */
  getCreditPackageById(id: string): CreditPackage | undefined {
    return this.creditPackages.find(pkg => pkg.id === id);
  }

  /**
   * Gets a user's purchase history
   */
  async getUserPurchaseHistory(userId: string) {
    return prisma.purchaseIntent.findMany({
      where: {
        userId,
        confirmed: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }
}