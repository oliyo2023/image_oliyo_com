export const runtime = 'nodejs';
import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getUserById } from '@/lib/user';
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

    // Parse query parameters for pagination and filtering
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const startDate = url.searchParams.get('startDate') || undefined;
    const endDate = url.searchParams.get('endDate') || undefined;
    
    // Validate limit and offset
    if (isNaN(limit) || limit < 1 || limit > 100) {
      return Response.json(
        { 
          error: 'Invalid input', 
          message: 'Limit must be a number between 1 and 100' 
        },
        { status: 400 }
      );
    }
    
    if (isNaN(offset) || offset < 0) {
      return Response.json(
        { 
          error: 'Invalid input', 
          message: 'Offset must be a non-negative number' 
        },
        { status: 400 }
      );
    }

    // Validate dates if provided
    let startDateObj: Date | undefined;
    let endDateObj: Date | undefined;
    
    if (startDate) {
      startDateObj = new Date(startDate);
      if (isNaN(startDateObj.getTime())) {
        return Response.json(
          { 
            error: 'Invalid input', 
            message: 'startDate must be a valid date' 
          },
          { status: 400 }
        );
      }
    }
    
    if (endDate) {
      endDateObj = new Date(endDate);
      if (isNaN(endDateObj.getTime())) {
        return Response.json(
          { 
            error: 'Invalid input', 
            message: 'endDate must be a valid date' 
          },
          { status: 400 }
        );
      }
    }

    // Build the where clause for filtering
    const whereClause: any = {};
    
    if (startDateObj || endDateObj) {
      whereClause.date = {};
      if (startDateObj) {
        whereClause.date.gte = startDateObj;
      }
      if (endDateObj) {
        whereClause.date.lte = endDateObj;
      }
    }

    // Get admin transactions with pagination
    const transactions = await prisma.creditTransaction.findMany({
      where: whereClause,
      orderBy: {
        date: 'desc',
      },
      take: limit,
      skip: offset,
    });

    // Get total count for pagination
    const total = await prisma.creditTransaction.count({
      where: whereClause,
    });

    // Get user information for each transaction to include email
    const transactionWithUserEmails = await Promise.all(
      transactions.map(async (transaction) => {
        const user = await prisma.user.findUnique({
          where: { id: transaction.userId },
          select: { email: true },
        });

        return {
          id: transaction.id,
          userId: transaction.userId,
          userEmail: user?.email || 'unknown',
          transactionType: transaction.transactionType,
          amount: transaction.amount,
          date: transaction.date,
          description: transaction.description,
          relatedModelName: transaction.relatedModelName,
        };
      })
    );

    return Response.json({
      transactions: transactionWithUserEmails,
      pagination: {
        page: Math.floor(offset / limit) + 1,
        limit,
        total,
      },
    });
  } catch (error: any) {
    console.error('Get admin transactions error:', error);
    return Response.json(
      { 
        error: 'Internal server error',
        message: 'An unexpected error occurred while retrieving transactions'
      },
      { status: 500 }
    );
  }
}