import prisma from './db';
import { CreditTransaction } from '@prisma/client';

/**
 * Adjusts user credits by a given amount with a description
 * @param userId The ID of the user
 * @param amount The amount to adjust (negative to deduct, positive to add)
 * @param description Description of the transaction
 * @param relatedModelName Optional - the AI model related to this transaction
 * @returns Updated user credit balance
 */
export async function adjustUserCredits(
  userId: string,
  amount: number,
  description: string,
  relatedModelName?: string
): Promise<number> {
  return prisma.$transaction(async (tx) => {
    // Update user's credit balance
    const updatedUser = await tx.user.update({
      where: {
        id: userId,
      },
      data: {
        creditBalance: {
          increment: amount,
        },
      },
    });

    // Validate that the balance doesn't go negative (for deductions)
    if (updatedUser.creditBalance < 0) {
      throw new Error(`Credit balance would go negative: ${updatedUser.creditBalance}`);
    }

    // Create a credit transaction record
    const transactionType = amount > 0 ? 'earned' : amount < 0 ? 'spent' : 'adjustment';
    
    await tx.creditTransaction.create({
      data: {
        userId: userId,
        transactionType,
        amount: amount,
        description: description,
        relatedModelName: relatedModelName || null,
      },
    });

    return updatedUser.creditBalance;
  });
}

/**
 * Gets the current credit balance for a user
 * @param userId The ID of the user
 * @returns Current credit balance
 */
export async function getUserCreditBalance(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { creditBalance: true },
  });

  if (!user) {
    throw new Error(`User with ID ${userId} not found`);
  }

  return user.creditBalance;
}

/**
 * Checks if a user has sufficient credits for a specific action
 * @param userId The ID of the user
 * @param requiredAmount The amount of credits required
 * @returns True if user has sufficient credits, false otherwise
 */
export async function hasSufficientCredits(userId: string, requiredAmount: number): Promise<boolean> {
  const currentBalance = await getUserCreditBalance(userId);
  return currentBalance >= requiredAmount;
}

/**
 * Gets the cost of using a specific AI model
 * @param modelName The name of the AI model
 * @returns Cost in credits
 */
export async function getAIModelCost(modelName: string): Promise<number> {
  // Get the model from the database to get its cost
  const aiModel = await prisma.aIModel.findUnique({
    where: { name: modelName },
  });

  if (!aiModel) {
    throw new Error(`AI model ${modelName} not found`);
  }

  return aiModel.costPerUse;
}

/**
 * Gets the credit transaction history for a user
 * @param userId The ID of the user
 * @param limit Number of transactions to return (default 20)
 * @param offset Number of transactions to skip (default 0)
 * @returns Array of credit transactions
 */
export async function getUserCreditHistory(
  userId: string,
  limit: number = 20,
  offset: number = 0
): Promise<CreditTransaction[]> {
  return prisma.creditTransaction.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
    take: limit,
    skip: offset,
  });
}

/**
 * Performs a credit check and deducts credits if sufficient
 * @param userId The ID of the user
 * @param amount Amount to deduct
 * @param description Description of the transaction
 * @param relatedModelName Optional - the AI model related to this transaction
 * @returns Boolean indicating success or failure
 */
export async function deductCreditsIfSufficient(
  userId: string,
  amount: number,
  description: string,
  relatedModelName?: string
): Promise<boolean> {
  if (amount <= 0) {
    throw new Error('Deduction amount must be positive');
  }

  const hasCredits = await hasSufficientCredits(userId, amount);
  if (!hasCredits) {
    return false; // Insufficient credits
  }

  try {
    await adjustUserCredits(userId, -amount, description, relatedModelName);
    return true;
  } catch (error) {
    console.error('Error deducting credits:', error);
    return false;
  }
}

/**
 * Refunds credits to a user
 * @param userId The ID of the user
 * @param amount Amount to refund
 * @param description Description of the refund
 * @param relatedModelName Optional - the AI model related to this transaction
 * @returns New credit balance
 */
export async function refundCredits(
  userId: string,
  amount: number,
  description: string,
  relatedModelName?: string
): Promise<number> {
  if (amount <= 0) {
    throw new Error('Refund amount must be positive');
  }

  return await adjustUserCredits(userId, amount, description, relatedModelName);
}

/**
 * Gets total credits spent by a user
 * @param userId The ID of the user
 * @returns Total amount of credits spent
 */
export async function getTotalCreditsSpent(userId: string): Promise<number> {
  const result = await prisma.creditTransaction.aggregate({
    where: {
      userId,
      transactionType: 'spent',
    },
    _sum: {
      amount: true,
    },
  });

  // Since spent transactions are negative, we need to negate the sum
  return Math.abs(result._sum.amount || 0);
}

/**
 * Gets total credits earned by a user
 * @param userId The ID of the user
 * @returns Total amount of credits earned
 */
export async function getTotalCreditsEarned(userId: string): Promise<number> {
  const result = await prisma.creditTransaction.aggregate({
    where: {
      userId,
      transactionType: 'earned',
    },
    _sum: {
      amount: true,
    },
  });

  return result._sum.amount || 0;
}

/**
 * Gets total credits purchased by a user
 * @param userId The ID of the user
 * @returns Total amount of credits purchased
 */
export async function getTotalCreditsPurchased(userId: string): Promise<number> {
  const result = await prisma.creditTransaction.aggregate({
    where: {
      userId,
      transactionType: 'purchased',
    },
    _sum: {
      amount: true,
    },
  });

  return result._sum.amount || 0;
}