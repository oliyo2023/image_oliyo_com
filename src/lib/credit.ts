// src/lib/credit.ts
import db from './db';

// Types for credit service
interface CreditTransactionData {
  userId: string;
  transactionType: 'earned' | 'spent' | 'purchased';
  amount: number;
  description: string;
  relatedModelName?: string;
}

interface CreditBalanceResult {
  success: boolean;
  message: string;
  balance?: number;
  lastUpdated?: Date;
}

interface CreditTransactionResult {
  success: boolean;
  message: string;
  transactionId?: string;
}

interface CreditPurchaseData {
  userId: string;
  credits: number;
  paymentIntentId: string;
}

// Get user's current credit balance
export async function getUserCreditBalance(userId: string): Promise<CreditBalanceResult> {
  try {
    // Validate input
    if (!userId) {
      return {
        success: false,
        message: 'User ID is required'
      };
    }

    // Fetch user from database
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        creditBalance: true,
        lastLogin: true
      }
    });

    // Check if user exists
    if (!user) {
      return {
        success: false,
        message: 'User not found'
      };
    }

    return {
      success: true,
      message: 'Credit balance retrieved successfully',
      balance: user.creditBalance,
      lastUpdated: user.lastLogin || new Date()
    };
  } catch (error) {
    console.error('Error getting user credit balance:', error);
    return {
      success: false,
      message: 'An error occurred while retrieving credit balance'
    };
  }
}

// Get user's credit transaction history
export async function getUserCreditTransactions(userId: string, limit: number = 20, offset: number = 0): Promise<any> {
  try {
    // Validate input
    if (!userId) {
      return {
        success: false,
        message: 'User ID is required'
      };
    }

    // Fetch credit transactions from database
    const transactions = await db.creditTransaction.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: limit,
      skip: offset
    });

    // Get total count for pagination
    const totalCount = await db.creditTransaction.count({
      where: { userId }
    });

    return {
      success: true,
      message: 'Credit transactions retrieved successfully',
      transactions,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasNext: offset + transactions.length < totalCount
      }
    };
  } catch (error) {
    console.error('Error getting user credit transactions:', error);
    return {
      success: false,
      message: 'An error occurred while retrieving credit transactions'
    };
  }
}

// Deduct credits from user account
export async function deductCredits(userId: string, amount: number, description: string, modelName?: string): Promise<CreditTransactionResult> {
  try {
    // Validate input
    if (!userId || !amount || !description) {
      return {
        success: false,
        message: 'User ID, amount, and description are required'
      };
    }

    // Validate that amount is negative for spending
    if (amount > 0) {
      return {
        success: false,
        message: 'Amount must be negative for credit deduction'
      };
    }

    // Check user's current credit balance
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { creditBalance: true }
    });

    // Check if user exists
    if (!user) {
      return {
        success: false,
        message: 'User not found'
      };
    }

    // Check if user has sufficient credits
    if (user.creditBalance < Math.abs(amount)) {
      return {
        success: false,
        message: 'Insufficient credits for this operation'
      };
    }

    // Deduct credits from user account
    await db.user.update({
      where: { id: userId },
      data: {
        creditBalance: {
          decrement: Math.abs(amount)
        }
      }
    });

    // Create credit transaction record
    const transaction = await db.creditTransaction.create({
      data: {
        userId,
        transactionType: 'spent',
        amount,
        description,
        relatedModelName: modelName || null
      }
    });

    return {
      success: true,
      message: 'Credits deducted successfully',
      transactionId: transaction.id
    };
  } catch (error) {
    console.error('Error deducting credits:', error);
    return {
      success: false,
      message: 'An error occurred while deducting credits'
    };
  }
}

// Add credits to user account
export async function addCredits(userId: string, amount: number, description: string, source?: string): Promise<CreditTransactionResult> {
  try {
    // Validate input
    if (!userId || !amount || !description) {
      return {
        success: false,
        message: 'User ID, amount, and description are required'
      };
    }

    // Validate that amount is positive for earning/purchasing
    if (amount <= 0) {
      return {
        success: false,
        message: 'Amount must be positive for credit addition'
      };
    }

    // Check if user exists
    const user = await db.user.findUnique({
      where: { id: userId }
    });

    // Check if user exists
    if (!user) {
      return {
        success: false,
        message: 'User not found'
      };
    }

    // Add credits to user account
    await db.user.update({
      where: { id: userId },
      data: {
        creditBalance: {
          increment: amount
        }
      }
    });

    // Create credit transaction record
    const transaction = await db.creditTransaction.create({
      data: {
        userId,
        transactionType: source || 'earned',
        amount,
        description
      }
    });

    return {
      success: true,
      message: 'Credits added successfully',
      transactionId: transaction.id
    };
  } catch (error) {
    console.error('Error adding credits:', error);
    return {
      success: false,
      message: 'An error occurred while adding credits'
    };
  }
}

// Create credit purchase intent
export async function createCreditPurchaseIntent(purchaseData: CreditPurchaseData): Promise<any> {
  try {
    const { userId, credits, paymentIntentId } = purchaseData;

    // Validate input
    if (!userId || !credits || !paymentIntentId) {
      return {
        success: false,
        message: 'User ID, credits, and paymentIntentId are required'
      };
    }

    // Validate credit amount (must be one of the allowed packages: 100, 500, 1000)
    const validPackages = [100, 500, 1000];
    if (!validPackages.includes(credits)) {
      return {
        success: false,
        message: `Invalid credit package. Must be one of: ${validPackages.join(', ')}`
      };
    }

    // Check if user exists
    const user = await db.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return {
        success: false,
        message: 'User not found'
      };
    }

    // In a real implementation, this would:
    // 1. Verify the payment intent with Stripe
    // 2. Check if the payment intent is valid and successful
    // 3. Get the amount paid from the payment intent
    // 4. Calculate the number of credits based on the amount paid

    // For now, we'll simulate the process
    const amountPaid = credits * 0.1; // $0.10 per credit (example pricing)

    // Add credits to user account
    const addResult = await addCredits(
      userId, 
      credits, 
      `Credit purchase of ${credits} credits`, 
      'purchased'
    );

    if (!addResult.success) {
      return {
        success: false,
        message: addResult.message
      };
    }

    return {
      success: true,
      message: 'Credit purchase confirmed and credits added',
      transactionId: addResult.transactionId,
      creditsAdded: credits,
      amountPaid: amountPaid,
      newBalance: user.creditBalance + credits
    };
  } catch (error) {
    console.error('Error creating credit purchase intent:', error);
    return {
      success: false,
      message: 'An error occurred during credit purchase'
    };
  }
}

// Confirm credit purchase
export async function confirmCreditPurchase(purchaseData: CreditPurchaseData): Promise<any> {
  try {
    const { userId, credits, paymentIntentId } = purchaseData;

    // Validate input
    if (!userId || !credits || !paymentIntentId) {
      return {
        success: false,
        message: 'User ID, credits, and paymentIntentId are required'
      };
    }

    // Validate credit amount (must be one of the allowed packages: 100, 500, 1000)
    const validPackages = [100, 500, 1000];
    if (!validPackages.includes(credits)) {
      return {
        success: false,
        message: `Invalid credit package. Must be one of: ${validPackages.join(', ')}`
      };
    }

    // Check if user exists
    const user = await db.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return {
        success: false,
        message: 'User not found'
      };
    }

    // In a real implementation, this would:
    // 1. Verify the payment intent with Stripe
    // 2. Check if the payment intent is valid and successful
    // 3. Get the amount paid from the payment intent
    // 4. Calculate the number of credits based on the amount paid

    // For now, we'll simulate the process
    const amountPaid = credits * 0.1; // $0.10 per credit (example pricing)

    // Add credits to user account
    const addResult = await addCredits(
      userId, 
      credits, 
      `Credit purchase of ${credits} credits`, 
      'purchased'
    );

    if (!addResult.success) {
      return {
        success: false,
        message: addResult.message
      };
    }

    return {
      success: true,
      message: 'Credit purchase confirmed and credits added',
      transactionId: addResult.transactionId,
      creditsAdded: credits,
      amountPaid: amountPaid,
      newBalance: user.creditBalance + credits
    };
  } catch (error) {
    console.error('Error confirming credit purchase:', error);
    return {
      success: false,
      message: 'An error occurred during credit purchase confirmation'
    };
  }
}

// Get all credit transactions (for admin)
export async function getAllCreditTransactions(limit: number = 50, offset: number = 0) {
  try {
    // Fetch all credit transactions with user information
    const transactions = await db.creditTransaction.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true
          }
        }
      },
      orderBy: { date: 'desc' },
      take: limit,
      skip: offset
    });

    // Get total count for pagination
    const totalCount = await db.creditTransaction.count();

    return {
      success: true,
      transactions: transactions.map(transaction => ({
        id: transaction.id,
        userId: transaction.userId,
        user: transaction.user,
        transactionType: transaction.transactionType,
        amount: transaction.amount,
        date: transaction.date,
        description: transaction.description,
        relatedModelName: transaction.relatedModelName
      })),
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasNext: offset + transactions.length < totalCount
      }
    };
  } catch (error) {
    console.error('Error fetching all credit transactions:', error);
    return {
      success: false,
      message: 'An error occurred while fetching credit transactions'
    };
  }
}

// Get public user stats (for admin dashboard)
export async function getPublicUserStats() {
  try {
    const totalUsers = await db.user.count();
    const activeUsersToday = await db.user.count({
      where: {
        lastLogin: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)) // Today's date at 00:00:00
        }
      }
    });

    return {
      success: true,
      stats: {
        totalUsers,
        activeUsersToday
      }
    };
  } catch (error) {
    console.error('Error fetching public user stats:', error);
    return {
      success: false,
      message: 'An error occurred while fetching user stats'
    };
  }
}