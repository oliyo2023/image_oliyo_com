// src/lib/audit-logging.ts
// Comprehensive audit logging service

import db from './db';
import { v4 as uuidv4 } from 'uuid';

/**
 * Create a new audit log entry
 * @param logData - Object containing audit log data
 * @returns Promise<Object> - Result of the log creation
 */
export async function createAuditLog(logData: {
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  ipAddress: string;
  userAgent?: string;
  sessionId: string;
  actionOutcome: string;
  beforeValue?: any;
  afterValue?: any;
  metadata?: any;
}): Promise<any> {
  try {
    // Validate required fields
    if (!logData.userId || !logData.action || !logData.resourceType || 
        !logData.resourceId || !logData.ipAddress || !logData.sessionId || 
        !logData.actionOutcome) {
      return {
        success: false,
        message: 'Missing required fields for audit log entry'
      };
    }

    // Validate action outcome
    const validOutcomes = ['success', 'failed', 'error'];
    if (!validOutcomes.includes(logData.actionOutcome)) {
      return {
        success: false,
        message: 'Invalid action outcome. Must be one of: success, failed, error'
      };
    }

    // Create the audit log entry
    const auditLog = await db.auditLog.create({
      data: {
        id: uuidv4(),
        userId: logData.userId,
        action: logData.action,
        resourceType: logData.resourceType,
        resourceId: logData.resourceId,
        timestamp: new Date(),
        ipAddress: logData.ipAddress,
        userAgent: logData.userAgent || null,
        sessionId: logData.sessionId,
        actionOutcome: logData.actionOutcome,
        beforeValue: logData.beforeValue ? JSON.stringify(logData.beforeValue) : null,
        afterValue: logData.afterValue ? JSON.stringify(logData.afterValue) : null,
        metadata: logData.metadata ? JSON.stringify(logData.metadata) : null
      }
    });

    return {
      success: true,
      auditLog: {
        id: auditLog.id,
        userId: auditLog.userId,
        action: auditLog.action,
        resourceType: auditLog.resourceType,
        resourceId: auditLog.resourceId,
        timestamp: auditLog.timestamp,
        ipAddress: auditLog.ipAddress,
        userAgent: auditLog.userAgent,
        sessionId: auditLog.sessionId,
        actionOutcome: auditLog.actionOutcome,
        beforeValue: auditLog.beforeValue ? JSON.parse(auditLog.beforeValue) : null,
        afterValue: auditLog.afterValue ? JSON.parse(auditLog.afterValue) : null,
        metadata: auditLog.metadata ? JSON.parse(auditLog.metadata) : null
      },
      message: 'Audit log entry created successfully'
    };
  } catch (error) {
    console.error('Error creating audit log entry:', error);
    return {
      success: false,
      message: 'Failed to create audit log entry'
    };
  }
}

/**
 * Get audit logs with filtering and pagination
 * @param filters - Object containing filter criteria
 * @param limit - Number of logs to return (default: 50)
 * @param offset - Number of logs to skip (default: 0)
 * @returns Promise<Object> - Object containing audit logs and pagination info
 */
export async function getAuditLogs(
  filters: {
    userId?: string;
    action?: string;
    resourceType?: string;
    resourceId?: string;
    startDate?: Date;
    endDate?: Date;
    actionOutcome?: string;
    ipAddress?: string;
    sessionId?: string;
  },
  limit: number = 50,
  offset: number = 0
): Promise<any> {
  try {
    // Build where clause based on filters
    const whereClause: any = {};

    if (filters.userId) {
      whereClause.userId = filters.userId;
    }

    if (filters.action) {
      whereClause.action = filters.action;
    }

    if (filters.resourceType) {
      whereClause.resourceType = filters.resourceType;
    }

    if (filters.resourceId) {
      whereClause.resourceId = filters.resourceId;
    }

    if (filters.actionOutcome) {
      whereClause.actionOutcome = filters.actionOutcome;
    }

    if (filters.ipAddress) {
      whereClause.ipAddress = filters.ipAddress;
    }

    if (filters.sessionId) {
      whereClause.sessionId = filters.sessionId;
    }

    // Handle date range filtering
    if (filters.startDate || filters.endDate) {
      whereClause.timestamp = {};
      
      if (filters.startDate) {
        whereClause.timestamp.gte = filters.startDate;
      }
      
      if (filters.endDate) {
        whereClause.timestamp.lte = filters.endDate;
      }
    }

    // Get audit logs with pagination
    const auditLogs = await db.auditLog.findMany({
      where: whereClause,
      include: {
        adminUser: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      },
      skip: offset,
      take: limit
    });

    // Get total count for pagination
    const totalCount = await db.auditLog.count({
      where: whereClause
    });

    // Parse JSON fields in audit logs
    const processedAuditLogs = auditLogs.map(log => ({
      ...log,
      beforeValue: log.beforeValue ? JSON.parse(log.beforeValue) : null,
      afterValue: log.afterValue ? JSON.parse(log.afterValue) : null,
      metadata: log.metadata ? JSON.parse(log.metadata) : null
    }));

    return {
      success: true,
      auditLogs: processedAuditLogs,
      pagination: {
        totalCount,
        limit,
        offset,
        hasNext: offset + auditLogs.length < totalCount
      }
    };
  } catch (error) {
    console.error('Error getting audit logs:', error);
    return {
      success: false,
      message: 'Failed to retrieve audit logs'
    };
  }
}

/**
 * Get audit log by ID
 * @param logId - ID of the audit log entry
 * @returns Promise<Object> - Audit log entry or null if not found
 */
export async function getAuditLogById(logId: string): Promise<any> {
  try {
    const auditLog = await db.auditLog.findUnique({
      where: { id: logId },
      include: {
        adminUser: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    });

    if (!auditLog) {
      return null;
    }

    // Parse JSON fields
    return {
      ...auditLog,
      beforeValue: auditLog.beforeValue ? JSON.parse(auditLog.beforeValue) : null,
      afterValue: auditLog.afterValue ? JSON.parse(auditLog.afterValue) : null,
      metadata: auditLog.metadata ? JSON.parse(auditLog.metadata) : null
    };
  } catch (error) {
    console.error('Error getting audit log by ID:', error);
    return null;
  }
}

/**
 * Search audit logs by text query
 * @param query - Text to search for in audit logs
 * @param limit - Number of logs to return (default: 50)
 * @param offset - Number of logs to skip (default: 0)
 * @returns Promise<Object> - Object containing matching audit logs and pagination info
 */
export async function searchAuditLogs(
  query: string,
  limit: number = 50,
  offset: number = 0
): Promise<any> {
  try {
    // Search across multiple fields
    const auditLogs = await db.auditLog.findMany({
      where: {
        OR: [
          { action: { contains: query, mode: 'insensitive' } },
          { resourceType: { contains: query, mode: 'insensitive' } },
          { resourceId: { contains: query, mode: 'insensitive' } },
          { ipAddress: { contains: query, mode: 'insensitive' } },
          { sessionId: { contains: query, mode: 'insensitive' } },
          { actionOutcome: { contains: query, mode: 'insensitive' } }
        ]
      },
      include: {
        adminUser: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      },
      skip: offset,
      take: limit
    });

    // Get total count for pagination
    const totalCount = await db.auditLog.count({
      where: {
        OR: [
          { action: { contains: query, mode: 'insensitive' } },
          { resourceType: { contains: query, mode: 'insensitive' } },
          { resourceId: { contains: query, mode: 'insensitive' } },
          { ipAddress: { contains: query, mode: 'insensitive' } },
          { sessionId: { contains: query, mode: 'insensitive' } },
          { actionOutcome: { contains: query, mode: 'insensitive' } }
        ]
      }
    });

    // Parse JSON fields in audit logs
    const processedAuditLogs = auditLogs.map(log => ({
      ...log,
      beforeValue: log.beforeValue ? JSON.parse(log.beforeValue) : null,
      afterValue: log.afterValue ? JSON.parse(log.afterValue) : null,
      metadata: log.metadata ? JSON.parse(log.metadata) : null
    }));

    return {
      success: true,
      auditLogs: processedAuditLogs,
      pagination: {
        totalCount,
        limit,
        offset,
        hasNext: offset + auditLogs.length < totalCount
      }
    };
  } catch (error) {
    console.error('Error searching audit logs:', error);
    return {
      success: false,
      message: 'Failed to search audit logs'
    };
  }
}

/**
 * Get audit summary statistics
 * @param days - Number of days to include in summary (default: 30)
 * @returns Promise<Object> - Summary statistics
 */
export async function getAuditSummary(days: number = 30): Promise<any> {
  try {
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get total audit log count
    const totalLogs = await db.auditLog.count({
      where: {
        timestamp: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    // Get logs by action outcome
    const successLogs = await db.auditLog.count({
      where: {
        timestamp: {
          gte: startDate,
          lte: endDate
        },
        actionOutcome: 'success'
      }
    });

    const failedLogs = await db.auditLog.count({
      where: {
        timestamp: {
          gte: startDate,
          lte: endDate
        },
        actionOutcome: 'failed'
      }
    });

    const errorLogs = await db.auditLog.count({
      where: {
        timestamp: {
          gte: startDate,
          lte: endDate
        },
        actionOutcome: 'error'
      }
    });

    // Get logs by resource type
    const resourceTypeCounts = await db.auditLog.groupBy({
      by: ['resourceType'],
      where: {
        timestamp: {
          gte: startDate,
          lte: endDate
        }
      },
      _count: {
        resourceType: true
      },
      orderBy: {
        _count: {
          resourceType: 'desc'
        }
      },
      take: 10 // Top 10 resource types
    });

    // Get logs by action
    const actionCounts = await db.auditLog.groupBy({
      by: ['action'],
      where: {
        timestamp: {
          gte: startDate,
          lte: endDate
        }
      },
      _count: {
        action: true
      },
      orderBy: {
        _count: {
          action: 'desc'
        }
      },
      take: 10 // Top 10 actions
    });

    // Get unique users
    const uniqueUsers = await db.auditLog.groupBy({
      by: ['userId'],
      where: {
        timestamp: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    return {
      success: true,
      summary: {
        totalLogs,
        successRate: totalLogs > 0 ? (successLogs / totalLogs) * 100 : 0,
        failureRate: totalLogs > 0 ? ((failedLogs + errorLogs) / totalLogs) * 100 : 0,
        uniqueUsers: uniqueUsers.length,
        resourceTypeBreakdown: resourceTypeCounts.map(item => ({
          resourceType: item.resourceType,
          count: item._count.resourceType
        })),
        actionBreakdown: actionCounts.map(item => ({
          action: item.action,
          count: item._count.action
        })),
        dateRange: {
          startDate,
          endDate,
          days
        }
      }
    };
  } catch (error) {
    console.error('Error getting audit summary:', error);
    return {
      success: false,
      message: 'Failed to retrieve audit summary'
    };
  }
}

/**
 * Export audit logs to CSV format
 * @param filters - Object containing filter criteria
 * @returns Promise<Object> - CSV formatted audit logs
 */
export async function exportAuditLogsToCSV(filters: any): Promise<any> {
  try {
    // Get audit logs with filters
    const result = await getAuditLogs(filters, 1000, 0); // Limit to 1000 records for export
    
    if (!result.success) {
      return result;
    }

    // Create CSV header
    let csvContent = 'Timestamp,User,Action,Resource Type,Resource ID,IP Address,Session ID,Action Outcome,Before Value,After Value\n';

    // Add audit log data to CSV
    result.auditLogs.forEach((log: any) => {
      const row = [
        log.timestamp.toISOString(),
        log.adminUser?.email || log.userId,
        log.action,
        log.resourceType,
        log.resourceId,
        log.ipAddress,
        log.sessionId,
        log.actionOutcome,
        log.beforeValue ? JSON.stringify(log.beforeValue).replace(/"/g, '""') : '',
        log.afterValue ? JSON.stringify(log.afterValue).replace(/"/g, '""') : ''
      ].map(field => `"${field}"`).join(',');

      csvContent += row + '\n';
    });

    return {
      success: true,
      csvContent,
      recordCount: result.auditLogs.length
    };
  } catch (error) {
    console.error('Error exporting audit logs to CSV:', error);
    return {
      success: false,
      message: 'Failed to export audit logs to CSV'
    };
  }
}

/**
 * Purge old audit logs
 * @param daysToKeep - Number of days of logs to keep (default: 90)
 * @returns Promise<Object> - Result of the purge operation
 */
export async function purgeOldAuditLogs(daysToKeep: number = 90): Promise<any> {
  try {
    // Calculate cutoff date
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    // Delete logs older than cutoff date
    const deletedLogs = await db.auditLog.deleteMany({
      where: {
        timestamp: {
          lt: cutoffDate
        }
      }
    });

    return {
      success: true,
      deletedCount: deletedLogs.count,
      message: `Successfully purged ${deletedLogs.count} old audit log entries`
    };
  } catch (error) {
    console.error('Error purging old audit logs:', error);
    return {
      success: false,
      message: 'Failed to purge old audit logs'
    };
  }
}

/**
 * Get audit logs for a specific user
 * @param userId - ID of the user
 * @param limit - Number of logs to return (default: 50)
 * @param offset - Number of logs to skip (default: 0)
 * @returns Promise<Object> - Object containing user's audit logs and pagination info
 */
export async function getUserAuditLogs(
  userId: string,
  limit: number = 50,
  offset: number = 0
): Promise<any> {
  try {
    // Get user's audit logs with pagination
    const auditLogs = await db.auditLog.findMany({
      where: {
        userId
      },
      include: {
        adminUser: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      },
      skip: offset,
      take: limit
    });

    // Get total count for pagination
    const totalCount = await db.auditLog.count({
      where: {
        userId
      }
    });

    // Parse JSON fields in audit logs
    const processedAuditLogs = auditLogs.map(log => ({
      ...log,
      beforeValue: log.beforeValue ? JSON.parse(log.beforeValue) : null,
      afterValue: log.afterValue ? JSON.parse(log.afterValue) : null,
      metadata: log.metadata ? JSON.parse(log.metadata) : null
    }));

    return {
      success: true,
      auditLogs: processedAuditLogs,
      pagination: {
        totalCount,
        limit,
        offset,
        hasNext: offset + auditLogs.length < totalCount
      }
    };
  } catch (error) {
    console.error('Error getting user audit logs:', error);
    return {
      success: false,
      message: 'Failed to retrieve user audit logs'
    };
  }
}

/**
 * Alias for createAuditLog to match API route expectations
 * @param logData - Object containing audit log data
 * @returns Promise<Object> - Result of the log creation
 */
export async function createAuditLogEntry(logData: {
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  ipAddress: string;
  userAgent?: string;
  sessionId: string;
  actionOutcome: string;
  beforeValue?: any;
  afterValue?: any;
  metadata?: any;
}): Promise<any> {
  return createAuditLog(logData);
}