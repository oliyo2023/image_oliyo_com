/**
 * Calculates the cost of an AI model operation
 */
export function calculateModelCost(modelName: string, options?: { 
  complexity?: number, 
  resolution?: number 
}): number {
  // Base costs as defined in the requirements
  const baseCosts: Record<string, number> = {
    'qwen-image-edit': 5,
    'gemini-flash-image': 10,
  };

  const baseCost = baseCosts[modelName] || 10; // Default to 10 if model not found

  // Apply multipliers based on options like complexity or resolution
  let finalCost = baseCost;
  
  if (options?.complexity && options.complexity > 1) {
    finalCost *= options.complexity;
  }
  
  if (options?.resolution && options.resolution > 1024) {  // If resolution is higher than 1024px
    finalCost *= 1.2;  // 20% increase for high resolution
  }

  return Math.round(finalCost); // Round to nearest integer
}

/**
 * Determines if a user has sufficient credits for an operation
 */
export function hasSufficientCredits(userCredits: number, operationCost: number): boolean {
  return userCredits >= operationCost;
}

/**
 * Calculates remaining credits after an operation
 */
export function calculateRemainingCredits(userCredits: number, operationCost: number): number {
  return Math.max(0, userCredits - operationCost); // Ensure non-negative
}

/**
 * Formats credit amount for display
 */
export function formatCredits(credits: number): string {
  return credits.toLocaleString();
}

/**
 * Calculates usage statistics from a list of operations
 */
export function calculateUsageStats(operations: Array<{ model: string, cost: number, count: number }>): {
  totalCost: number;
  modelBreakdown: Record<string, { totalCost: number; count: number; averageCost: number }>;
} {
  const result = {
    totalCost: 0,
    modelBreakdown: {} as Record<string, { totalCost: number; count: number; averageCost: number }>
  };

  for (const op of operations) {
    result.totalCost += op.cost * op.count;
    
    if (!result.modelBreakdown[op.model]) {
      result.modelBreakdown[op.model] = {
        totalCost: 0,
        count: 0,
        averageCost: 0
      };
    }
    
    result.modelBreakdown[op.model].totalCost += op.cost * op.count;
    result.modelBreakdown[op.model].count += op.count;
    result.modelBreakdown[op.model].averageCost = 
      result.modelBreakdown[op.model].totalCost / result.modelBreakdown[op.model].count;
  }

  return result;
}

/**
 * Determines the credit bonus amount based on user activity
 */
export function calculateBonusCredits(activityType: 'signup' | 'referral' | 'achievement' | 'promotion'): number {
  const bonuses = {
    signup: 100,      // As specified in requirements
    referral: 25,
    achievement: 10,
    promotion: 50
  };

  return bonuses[activityType] || 0;
}