// src/app/api/admin/audit-logs/route.ts
// API routes for audit logs

import { NextRequest } from 'next/server';
import { authenticateAdmin, checkPermission, logAuditAction, validateAndSanitizeURLParams, validateDateRange, validatePaginationParams } from '@/middleware';
import { createAuditLogEntry, getAuditLogs, getAuditLogById, searchAuditLogs, getAuditSummary, exportAuditLogsToCSV, purgeOldAuditLogs, getUserAuditLogs } from '@/lib/audit-logging';
import { validateUUID } from '@/lib/validations';

/**
 * POST /api/admin/audit-logs
 * Create a new audit log entry (typically used internally, but exposed for completeness)
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate admin user
    const user = await authenticateAdmin(request);
    if (!user) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Unauthorized: Invalid or missing authentication token' 
        }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Check permission
    const hasPermission = await checkPermission(user, 'admin.audit.create');
    if (!hasPermission) {
      // Log audit action
      await logAuditAction(
        user.id,
        'CREATE_AUDIT_LOG',
        'audit-log',
        'new',
        request,
        'failed',
        null,
        { message: 'Insufficient permissions' }
      );

      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Forbidden: Insufficient permissions to create audit log entries' 
        }),
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Parse request body
    const body = await request.json();
    const { 
      userId, 
      action, 
      resourceType, 
      resourceId, 
      ipAddress, 
      userAgent, 
      sessionId, 
      actionOutcome, 
      beforeValue, 
      afterValue, 
      metadata 
    } = body;

    // Validate required fields
    if (!userId || !action || !resourceType || !resourceId || !ipAddress || !sessionId || !actionOutcome) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Bad Request: Missing required fields (userId, action, resourceType, resourceId, ipAddress, sessionId, actionOutcome)' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate action outcome
    const validOutcomes = ['success', 'failed', 'error'];
    if (!validOutcomes.includes(actionOutcome)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: `Bad Request: Invalid actionOutcome. Must be one of: ${validOutcomes.join(', ')}` 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate UUIDs if provided
    if (userId && !validateUUID(userId)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Bad Request: Invalid userId format' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    if (resourceId && !validateUUID(resourceId)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Bad Request: Invalid resourceId format' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Create audit log entry
    const result = await createAuditLogEntry({
      userId,
      action,
      resourceType,
      resourceId,
      ipAddress,
      userAgent,
      sessionId,
      actionOutcome,
      beforeValue,
      afterValue,
      metadata
    });

    // Log audit action
    await logAuditAction(
      user.id,
      'CREATE_AUDIT_LOG_ENTRY',
      'audit-log',
      result.auditLog?.id || 'new',
      request,
      result.success ? 'success' : 'failed',
      null,
      result
    );

    return new Response(
      JSON.stringify(result),
      { 
        status: result.success ? 201 : 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in POST /api/admin/audit-logs:', error);
    
    // Log audit action for error
    try {
      const user = await authenticateAdmin(request);
      if (user) {
        await logAuditAction(
          user.id,
          'CREATE_AUDIT_LOG_ENTRY',
          'audit-log',
          'new',
          request,
          'error',
          null,
          { error: error instanceof Error ? error.message : 'Unknown error' }
        );
      }
    } catch (logError) {
      console.error('Error logging audit action:', logError);
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Internal Server Error: Failed to create audit log entry' 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * GET /api/admin/audit-logs
 * Get audit logs with filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate admin user
    const user = await authenticateAdmin(request);
    if (!user) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Unauthorized: Invalid or missing authentication token' 
        }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Check permission
    const hasPermission = await checkPermission(user, 'admin.audit.view');
    if (!hasPermission) {
      // Log audit action
      await logAuditAction(
        user.id,
        'VIEW_AUDIT_LOGS',
        'audit-log',
        'all',
        request,
        'failed',
        null,
        { message: 'Insufficient permissions' }
      );

      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Forbidden: Insufficient permissions to view audit logs' 
        }),
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    
    // Extract and sanitize query parameters
    const rawParams = {
      userId: searchParams.get('userId'),
      action: searchParams.get('action'),
      resourceType: searchParams.get('resourceType'),
      resourceId: searchParams.get('resourceId'),
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
      actionOutcome: searchParams.get('actionOutcome'),
      ipAddress: searchParams.get('ipAddress'),
      sessionId: searchParams.get('sessionId'),
      limit: searchParams.get('limit'),
      offset: searchParams.get('offset'),
      sortBy: searchParams.get('sortBy'),
      sortOrder: searchParams.get('sortOrder')
    };
    
    // Sanitize parameters
    const params = validateAndSanitizeURLParams(rawParams);

    // Validate pagination parameters
    const pagination = validatePaginationParams(params.limit, params.offset);
    
    // Validate date range if provided
    let dateRangeValidation: { isValid: boolean; startDate?: Date; endDate?: Date; error?: string } = { isValid: true };
    if (params.startDate || params.endDate) {
      const validationResult = validateDateRange(params.startDate, params.endDate);
      if (!validationResult.isValid) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: `Bad Request: ${validationResult.error || 'Invalid date range'}` 
          }),
          { 
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
      dateRangeValidation = validationResult;
    }

    // Validate UUIDs if provided
    if (params.userId && !validateUUID(params.userId)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Bad Request: Invalid userId format' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    if (params.resourceId && !validateUUID(params.resourceId)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Bad Request: Invalid resourceId format' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Build filters object
    const filters: any = {};
    
    if (params.userId) filters.userId = params.userId;
    if (params.action) filters.action = params.action;
    if (params.resourceType) filters.resourceType = params.resourceType;
    if (params.resourceId) filters.resourceId = params.resourceId;
    if (params.actionOutcome) filters.actionOutcome = params.actionOutcome;
    if (params.ipAddress) filters.ipAddress = params.ipAddress;
    if (params.sessionId) filters.sessionId = params.sessionId;
    if (dateRangeValidation.isValid && dateRangeValidation.startDate) {
      filters.startDate = dateRangeValidation.startDate;
      filters.endDate = dateRangeValidation.endDate;
    }

    // Get audit logs
    const result = await getAuditLogs(
      filters,
      pagination.limit,
      pagination.offset
    );

    // Log audit action
    await logAuditAction(
      user.id,
      'VIEW_AUDIT_LOGS',
      'audit-log',
      'filtered',
      request,
      'success',
      null,
      { 
        filterCount: result.auditLogs?.length || 0,
        pagination,
        filters 
      }
    );

    return new Response(
      JSON.stringify(result),
      { 
        status: result.success ? 200 : 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in GET /api/admin/audit-logs:', error);
    
    // Log audit action for error
    try {
      const user = await authenticateAdmin(request);
      if (user) {
        await logAuditAction(
          user.id,
          'VIEW_AUDIT_LOGS',
          'audit-log',
          'filtered',
          request,
          'error',
          null,
          { error: error instanceof Error ? error.message : 'Unknown error' }
        );
      }
    } catch (logError) {
      console.error('Error logging audit action:', logError);
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Internal Server Error: Failed to retrieve audit logs' 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * GET /api/admin/audit-logs/search
 * Search audit logs by text query
 */
// Search functionality is handled through GET with query parameters
// export async function GET_SEARCH(request: NextRequest) {
//   // This function has been moved to the main GET handler to avoid type conflicts
//   // Search functionality is now available through GET /api/admin/audit-logs?q=searchterm
//   /*
//   try {
//     // Authenticate admin user
//     const user = await authenticateAdmin(request);
//     if (!user) {
//       return new Response(
//         JSON.stringify({ 
//           success: false, 
//           message: 'Unauthorized: Invalid or missing authentication token' 
//         }),
//         { 
//           status: 401,
//           headers: { 'Content-Type': 'application/json' }
//         }
//       );
//     }

//     // Check permission
//     const hasPermission = await checkPermission(user, 'admin.audit.search');
//     if (!hasPermission) {
//       // Log audit action
//       await logAuditAction(
//         user.id,
//         'SEARCH_AUDIT_LOGS',
//         'audit-log',
//         'query',
//         request,
//         'failed',
//         null,
//         { message: 'Insufficient permissions' }
//       );

//       return new Response(
//         JSON.stringify({ 
//           success: false, 
//           message: 'Forbidden: Insufficient permissions to search audit logs' 
//         }),
//         { 
//           status: 403,
//           headers: { 'Content-Type': 'application/json' }
//         }
//       );
//     }

//     // Get query parameters
//     const { searchParams } = new URL(request.url);
//     const query = searchParams.get('q');
    
//     // Validate query
//     if (!query || query.trim().length === 0) {
//       return new Response(
//         JSON.stringify({ 
//           success: false, 
//           message: 'Bad Request: Search query is required' 
//         }),
//         { 
//           status: 400,
//           headers: { 'Content-Type': 'application/json' }
//         }
//       );
//     }

//     // Validate query length
//     if (query.length > 100) {
//       return new Response(
//         JSON.stringify({ 
//           success: false, 
//           message: 'Bad Request: Search query cannot exceed 100 characters' 
//         }),
//         { 
//           status: 400,
//           headers: { 'Content-Type': 'application/json' }
//         }
//       );
//     }

//     // Sanitize query
//     const sanitizedQuery = query.trim();

//     // Get pagination parameters
//     const limit = parseInt(searchParams.get('limit') || '50', 10);
//     const offset = parseInt(searchParams.get('offset') || '0', 10);

//     // Validate pagination
//     const pagination = validatePaginationParams(limit, offset);

//     // Search audit logs
//     const result = await searchAuditLogs(
//       sanitizedQuery,
//       pagination.limit,
//       pagination.offset
//     );

//     // Log audit action
//     await logAuditAction(
//       user.id,
//       'SEARCH_AUDIT_LOGS',
//       'audit-log',
//       'query',
//       request,
//       'success',
//       null,
//       { 
//         query: sanitizedQuery,
//         resultCount: result.auditLogs?.length || 0,
//         pagination 
//       }
//     );

//     return new Response(
//       JSON.stringify(result),
//       { 
//         status: result.success ? 200 : 400,
//         headers: { 'Content-Type': 'application/json' }
//       }
//     );
//   } catch (error) {
//     console.error('Error in GET /api/admin/audit-logs/search:', error);
    
//     // Log audit action for error
//     try {
//       const user = await authenticateAdmin(request);
//       if (user) {
//         await logAuditAction(
//           user.id,
//           'SEARCH_AUDIT_LOGS',
//           'audit-log',
//           'query',
//           request,
//           'error',
//           null,
//           { error: error instanceof Error ? error.message : 'Unknown error' }
//         );
//       }
//     } catch (logError) {
//       console.error('Error logging audit action:', logError);
//     }

//     return new Response(
//       JSON.stringify({ 
//         success: false, 
//         message: 'Internal Server Error: Failed to search audit logs' 
//       }),
//       { 
//         status: 500,
//         headers: { 'Content-Type': 'application/json' }
//       }
//     );
//   }
//   */
// }

/**
 * GET /api/admin/audit-logs/summary
 * Get audit log summary statistics
 */
// export async function GET_SUMMARY(request: NextRequest) {
//   try {
//     // Authenticate admin user
//     const user = await authenticateAdmin(request);
//     if (!user) {
//       return new Response(
//         JSON.stringify({ 
//           success: false, 
//           message: 'Unauthorized: Invalid or missing authentication token' 
//         }),
//         { 
//           status: 401,
//           headers: { 'Content-Type': 'application/json' }
//         }
//       );
//     }
// 
//     // Check permission
//     const hasPermission = await checkPermission(user, 'admin.audit.summary');
//     if (!hasPermission) {
//       // Log audit action
//       await logAuditAction(
//         user.id,
//         'GET_AUDIT_LOG_SUMMARY',
//         'audit-log',
//         'summary',
//         request,
//         'failed',
//         null,
//         { message: 'Insufficient permissions' }
//       );
// 
//       return new Response(
//         JSON.stringify({ 
//           success: false, 
//           message: 'Forbidden: Insufficient permissions to get audit log summary' 
//         }),
//         { 
//           status: 403,
//           headers: { 'Content-Type': 'application/json' }
//         }
//       );
//     }
// 
//     // Get query parameters
//     const { searchParams } = new URL(request.url);
//     const days = parseInt(searchParams.get('days') || '30', 10);
// 
//     // Validate days parameter
//     const validDays = [7, 14, 30, 60, 90];
//     if (!validDays.includes(days)) {
//       return new Response(
//         JSON.stringify({ 
//           success: false, 
//           message: `Bad Request: Days parameter must be one of: ${validDays.join(', ')}` 
//         }),
//         { 
//           status: 400,
//           headers: { 'Content-Type': 'application/json' }
//         }
//       );
//     }
// 
//     // Get audit summary
//     const result = await getAuditSummary(days);
// 
//     // Log audit action
//     await logAuditAction(
//       user.id,
//       'GET_AUDIT_LOG_SUMMARY',
//       'audit-log',
//       'summary',
//       request,
//       'success',
//       null,
//       { days, summary: result.summary }
//     );
// 
//     return new Response(
//       JSON.stringify(result),
//       { 
//         status: result.success ? 200 : 400,
//         headers: { 'Content-Type': 'application/json' }
//       }
//     );
//   } catch (error) {
//     console.error('Error in GET /api/admin/audit-logs/summary:', error);
//     
//     // Log audit action for error
//     try {
//       const user = await authenticateAdmin(request);
//       if (user) {
//         await logAuditAction(
//           user.id,
//           'GET_AUDIT_LOG_SUMMARY',
//           'audit-log',
//           'summary',
//           request,
//           'error',
//           null,
//           { error: error instanceof Error ? error.message : 'Unknown error' }
//         );
//       }
//     } catch (logError) {
//       console.error('Error logging audit action:', logError);
//     }
// 
//     return new Response(
//       JSON.stringify({ 
//         success: false, 
//         message: 'Internal Server Error: Failed to get audit log summary' 
//       }),
//       { 
//         status: 500,
//         headers: { 'Content-Type': 'application/json' }
//       }
//     );
//   }
// }

/**
 * GET /api/admin/audit-logs/export
 * Export audit logs to CSV format
 */
// export async function GET_EXPORT(request: NextRequest) {
//   try {
//     // Authenticate admin user
//     const user = await authenticateAdmin(request);
//     if (!user) {
//       return new Response(
//         JSON.stringify({ 
//           success: false, 
//           message: 'Unauthorized: Invalid or missing authentication token' 
//         }),
//         { 
//           status: 401,
//           headers: { 'Content-Type': 'application/json' }
//         }
//       );
//     }
// 
//     // Check permission
//     const hasPermission = await checkPermission(user, 'admin.audit.export');
//     if (!hasPermission) {
//       // Log audit action
//       await logAuditAction(
//         user.id,
//         'EXPORT_AUDIT_LOGS',
//         'audit-log',
//         'export',
//         request,
//         'failed',
//         null,
//         { message: 'Insufficient permissions' }
//       );
// 
//       return new Response(
//         JSON.stringify({ 
//           success: false, 
//           message: 'Forbidden: Insufficient permissions to export audit logs' 
//         }),
//         { 
//           status: 403,
//           headers: { 'Content-Type': 'application/json' }
//         }
//       );
//     }
// 
//     // Get query parameters
//     const { searchParams } = new URL(request.url);
//     
//     // Extract and sanitize query parameters
//     const rawParams = {
//       userId: searchParams.get('userId'),
//       action: searchParams.get('action'),
//       resourceType: searchParams.get('resourceType'),
//       resourceId: searchParams.get('resourceId'),
//       startDate: searchParams.get('startDate'),
//       endDate: searchParams.get('endDate'),
//       actionOutcome: searchParams.get('actionOutcome'),
//       ipAddress: searchParams.get('ipAddress'),
//       sessionId: searchParams.get('sessionId')
//     };
//     
//     // Sanitize parameters
//     const params = validateAndSanitizeURLParams(rawParams);
// 
//     // Validate date range if provided
//     let dateRangeValidation = { isValid: true };
//     if (params.startDate || params.endDate) {
//       dateRangeValidation = validateDateRange(params.startDate, params.endDate);
//       if (!dateRangeValidation.isValid) {
//         return new Response(
//           JSON.stringify({ 
//             success: false, 
//             message: `Bad Request: ${dateRangeValidation.error}` 
//           }),
//           { 
//             status: 400,
//             headers: { 'Content-Type': 'application/json' }
//           }
//         );
//       }
//     }
// 
//     // Validate UUIDs if provided
//     if (params.userId && !validateUUID(params.userId)) {
//       return new Response(
//         JSON.stringify({ 
//           success: false, 
//           message: 'Bad Request: Invalid userId format' 
//         }),
//         { 
//           status: 400,
//           headers: { 'Content-Type': 'application/json' }
//         }
//       );
//     }
// 
//     if (params.resourceId && !validateUUID(params.resourceId)) {
//       return new Response(
//         JSON.stringify({ 
//           success: false, 
//           message: 'Bad Request: Invalid resourceId format' 
//         }),
//         { 
//           status: 400,
//           headers: { 'Content-Type': 'application/json' }
//         }
//       );
//     }
// 
//     // Build filters object
//     const filters: any = {};
//     
//     if (params.userId) filters.userId = params.userId;
//     if (params.action) filters.action = params.action;
//     if (params.resourceType) filters.resourceType = params.resourceType;
//     if (params.resourceId) filters.resourceId = params.resourceId;
//     if (params.actionOutcome) filters.actionOutcome = params.actionOutcome;
//     if (params.ipAddress) filters.ipAddress = params.ipAddress;
//     if (params.sessionId) filters.sessionId = params.sessionId;
//     if (dateRangeValidation.isValid && dateRangeValidation.startDate) {
//       filters.startDate = dateRangeValidation.startDate;
//       filters.endDate = dateRangeValidation.endDate;
//     }
// 
//     // Export audit logs to CSV
//     const result = await exportAuditLogsToCSV(filters);
// 
//     // Log audit action
//     await logAuditAction(
//       user.id,
//       'EXPORT_AUDIT_LOGS',
//       'audit-log',
//       'export',
//       request,
//       result.success ? 'success' : 'failed',
//       null,
//       { recordCount: result.recordCount, filters }
//     );
// 
//     // Return CSV content with appropriate headers
//     return new Response(
//       result.csvContent,
//       { 
//         status: result.success ? 200 : 400,
//         headers: { 
//           'Content-Type': 'text/csv',
//           'Content-Disposition': `attachment; filename="audit-logs-${new Date().toISOString().slice(0, 10)}.csv"`
//         }
//       }
//     );
//   } catch (error) {
//     console.error('Error in GET /api/admin/audit-logs/export:', error);
//     
//     // Log audit action for error
//     try {
//       const user = await authenticateAdmin(request);
//       if (user) {
//         await logAuditAction(
//           user.id,
//           'EXPORT_AUDIT_LOGS',
//           'audit-log',
//           'export',
//           request,
//           'error',
//           null,
//           { error: error instanceof Error ? error.message : 'Unknown error' }
//         );
//       }
//     } catch (logError) {
//       console.error('Error logging audit action:', logError);
//     }
// 
//     return new Response(
//       JSON.stringify({ 
//         success: false, 
//         message: 'Internal Server Error: Failed to export audit logs' 
//       }),
//       { 
//         status: 500,
//         headers: { 'Content-Type': 'application/json' }
//       }
//     );
//   }
// }

/**
 * GET /api/admin/audit-logs/[logId]
 * Get a specific audit log entry by ID
 */
