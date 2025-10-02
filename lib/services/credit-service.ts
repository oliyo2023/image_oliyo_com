import { PrismaClient, CreditTransaction, User } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateCreditTransactionInput {
  userId: string;
  transactionType: 'CREDIT_PURCHASE' | 'CREDIT_BONUS' | 'IMAGE_GENERATION' | 'IMAGE_EDIT';
  amount: number;
  description: string;
  aiModelUsed?: string;
}

export interface CreditTransactionWithUser extends CreditTransaction {
  user: User;
}

export class CreditService {
  /**
   * Creates a new credit transaction and updates the user's balance
   */
  async createCreditTransaction(input: CreateCreditTransactionInput): Promise<CreditTransaction> {
    const { userId, transactionType, amount, description, aiModelUsed } = input;
    
    // Validate the amount is not zero
    if (amount === 0) {
      throw new Error('Transaction amount must not be zero');
    }
    
    // Begin a transaction to ensure consistency
    return prisma.$transaction(async (tx) => {
      // Create the transaction record
      const transaction = await tx.creditTransaction.create({
        data: {
          userId,
          transactionType,
          amount,
          description,
          aiModelUsed
        }
      });
      
      // Update user's credit balance
      await tx.user.update({
        where: { id: userId },
        data: {
          creditBalance: {
            increment: amount
          }
        }
      });
      
      return transaction;
    });
  }

  /**
   * Deducts credits from a user's account for an operation
   */
  async deductCredits(userId: string, amount: number, description: string, aiModelUsed?: string): Promise<CreditTransaction> {
    if (amount <= 0) {
      throw new Error('Deduction amount must be positive');
    }
    
    // Check if user has sufficient credits
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user || user.creditBalance < amount) {
      throw new Error(`Insufficient credits. Required: ${amount}, Available: ${user?.creditBalance || 0}`);
    }
    
    // Create a negative transaction to deduct credits
    return this.createCreditTransaction({
      userId,
      transactionType: this.getTransactionTypeForDeduction(description),
      amount: -amount, // Negative amount for deduction
      description,
      aiModelUsed
    });
  }

  /**
   * Adds credits to a user's account (for bonuses, purchases, etc.)
   */
  async addCredits(userId: string, amount: number, description: string, aiModelUsed?: string): Promise<CreditTransaction> {
    if (amount <= 0) {
      throw new Error('Addition amount must be positive');
    }
    
    return this.createCreditTransaction({
      userId,
      transactionType: this.getTransactionTypeForAddition(description),
      amount,
      description,
      aiModelUsed
    });
  }

  /**
   * Gets all credit transactions for a user
   */
  async getUserTransactions(userId: string, limit?: number, offset?: number): Promise<CreditTransaction[]> {
    return prisma.creditTransaction.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      skip: offset || 0,
      take: limit || 50
    });
  }

  /**
   * Gets a specific transaction by ID
   */
  async getTransactionById(id: string): Promise<CreditTransaction | null> {
    return prisma.creditTransaction.findUnique({
      where: { id }
    });
  }

  /**
   * Gets credit transaction history with user info
   */
  async getTransactionHistoryWithUser(limit?: number, offset?: number): Promise<CreditTransactionWithUser[]> {
    return prisma.creditTransaction.findMany({
      include: {
        user: true
      },
      orderBy: { date: 'desc' },
      skip: offset || 0,
      take: limit || 50
    });
  }

  /**
   * Determines transaction type for deduction based on description
   */
  private getTransactionTypeForDeduction(description: string): 'IMAGE_GENERATION' | 'IMAGE_EDIT' {
    if (description.toLowerCase().includes('generate')) {
      return 'IMAGE_GENERATION';
    } else if (description.toLowerCase().includes('edit')) {
      return 'IMAGE_EDIT';
    }
    // Default to IMAGE_GENERATION if not clearly specified
    return 'IMAGE_GENERATION';
  }

  /**
   * Determines transaction type for addition based on description
   */
  private getTransactionTypeForAddition(description: string): 'CREDIT_PURCHASE' | 'CREDIT_BONUS' {
    if (description.toLowerCase().includes('purchase') || description.toLowerCase().includes('buy')) {
      return 'CREDIT_PURCHASE';
    }
    // Default to CREDIT_BONUS for other additions
    return 'CREDIT_BONUS';
  }

  /**
   * Gets user's current credit balance
   */
  async getUserBalance(userId: string): Promise<number> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { creditBalance: true }
    });

    return user?.creditBalance || 0;
  }
}