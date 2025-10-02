import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getUserById } from '@/lib/user';
import { getAIModelUsageStats } from '@/lib/ai-models';
import prisma from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Extract token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.json(
        { error: 'Unauthorized', message: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify token
    const tokenPayload = await verifyToken(token);
    if (!tokenPayload) {
      return Response.json(
        { error: 'Unauthorized', message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const userId = tokenPayload.userId;
    
    // Check if user has admin role
    const user = await getUserById(userId);
    if (!user || user.role !== 'admin') {
      return Response.json(
        { error: 'Forbidden', message: 'Admin access required' },
        { status: 403 }
      );
    }

    // Get platform analytics
    // Total users
    const totalUsers = await prisma.user.count();
    
    // Active users today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const activeUsersToday = await prisma.user.count({
      where: {
        lastLogin: {
          gte: today,
          lt: tomorrow,
        },
      },
    });
    
    // Total images generated
    const totalImagesGenerated = await prisma.image.count({
      where: {
        status: 'completed',
      },
    });
    
    // Total credits used
    const totalCreditsUsedResult = await prisma.creditTransaction.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        transactionType: 'spent',
      },
    });
    const totalCreditsUsed = Math.abs(totalCreditsUsedResult._sum.amount || 0);
    
    // AI model usage
    const aiModelUsage = await getAIModelUsageStats();
    const modelUsage = {};
    
    for (const model of aiModelUsage) {
      modelUsage[model.name] = {
        usageCount: model.usageCount,
        creditsConsumed: model.usageCount * model.costPerUse, // Simplified calculation
        avgProcessingTime: 15.5, // Placeholder value, would come from actual metrics
        costPerUse: model.costPerUse,
      };
    }
    
    // Revenue (placeholder - in a real implementation, this would come from actual payment data)
    const revenue = {
      total: 12500, // Placeholder in cents
      last30Days: 3200, // Placeholder in cents
    };

    return Response.json({
      totalUsers,
      activeUsersToday,
      totalImagesGenerated,
      totalCreditsUsed,
      modelUsage,
      revenue,
    });
  } catch (error: any) {
    console.error('Get admin analytics error:', error);
    return Response.json(
      { 
        error: 'Internal server error',
        message: 'An unexpected error occurred while retrieving analytics'
      },
      { status: 500 }
    );
  }
}