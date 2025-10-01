// src/app/api/admin/users/[userId]/personalization/route.ts
// API routes for user personalization

import { NextRequest } from 'next/server';
import { authenticateAdmin, checkPermission, logAuditAction } from '@/middleware';
import { getUserPersonalization, updateUserPersonalization, resetUserPersonalization, updateDashboardLayout, updateThemeSettings, updateWidgetPreferences } from '@/lib/personalization';
import { validateUUID, validateAndSanitizeDashboardLayout } from '@/lib/validations';
import { getAdminUserById } from '@/lib/admin-users';

/**
 * GET /api/admin/users/[userId]/personalization
 * Get user personalization settings
 */
export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    // Authenticate admin user
    const user = await authenticateAdmin(request, {} as any);
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

    // Validate user ID
    const { userId } = params;
    if (!userId || !validateUUID(userId)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Bad Request: Invalid or missing user ID' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Check permission - users can view their own personalization, admins can view anyone's
    const isOwnProfile = user.id === userId;
    const hasPermission = isOwnProfile || await checkPermission(user, 'admin.users.view-personalization');
    
    if (!hasPermission) {
      // Log audit action
      await logAuditAction(
        user.id,
        'VIEW_USER_PERSONALIZATION',
        'user',
        userId,
        request,
        'failed',
        null,
        { message: 'Insufficient permissions' }
      );

      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Forbidden: Insufficient permissions to view user personalization' 
        }),
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Get user for audit log
    const targetUser = await getAdminUserById(userId);
    if (!targetUser) {
      // Log audit action for not found
      await logAuditAction(
        user.id,
        'VIEW_USER_PERSONALIZATION',
        'user',
        userId,
        request,
        'failed',
        null,
        { message: 'User not found' }
      );

      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Not Found: User not found' 
        }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Get user personalization settings
    const personalization = await getUserPersonalization(userId);

    // Log audit action
    await logAuditAction(
      user.id,
      'VIEW_USER_PERSONALIZATION',
      'user',
      userId,
      request,
      'success',
      null,
      { userId, hasPersonalization: !!personalization }
    );

    return new Response(
      JSON.stringify({
        success: true,
        personalization
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in GET /api/admin/users/[userId]/personalization:', error);
    
    // Log audit action for error
    try {
      const user = await authenticateAdmin(request, {} as any);
      if (user) {
        const { userId } = params;
        await logAuditAction(
          user.id,
          'VIEW_USER_PERSONALIZATION',
          'user',
          userId,
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
        message: 'Internal Server Error: Failed to retrieve user personalization' 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * PUT /api/admin/users/[userId]/personalization
 * Update user personalization settings
 */
export async function PUT(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    // Authenticate admin user
    const user = await authenticateAdmin(request, {} as any);
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

    // Validate user ID
    const { userId } = params;
    if (!userId || !validateUUID(userId)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Bad Request: Invalid or missing user ID' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Check permission - users can update their own personalization, admins can update anyone's
    const isOwnProfile = user.id === userId;
    const hasPermission = isOwnProfile || await checkPermission(user, 'admin.users.update-personalization');
    
    if (!hasPermission) {
      // Log audit action
      await logAuditAction(
        user.id,
        'UPDATE_USER_PERSONALIZATION',
        'user',
        userId,
        request,
        'failed',
        null,
        { message: 'Insufficient permissions' }
      );

      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Forbidden: Insufficient permissions to update user personalization' 
        }),
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Get user for audit log
    const targetUser = await getAdminUserById(userId);
    if (!targetUser) {
      // Log audit action for not found
      await logAuditAction(
        user.id,
        'UPDATE_USER_PERSONALIZATION',
        'user',
        userId,
        request,
        'failed',
        null,
        { message: 'User not found' }
      );

      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Not Found: User not found' 
        }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Parse request body
    const body = await request.json();
    const { dashboardLayout, themeSettings, widgetPreferences, navigationPreferences, resetToDefaults } = body;

    // If resetToDefaults flag is set, reset personalization to defaults
    if (resetToDefaults) {
      const resetResult = await resetUserPersonalization(userId);

      // Log audit action
      await logAuditAction(
        user.id,
        'RESET_USER_PERSONALIZATION',
        'user',
        userId,
        request,
        resetResult.success ? 'success' : 'failed',
        null,
        { resetResult }
      );

      return new Response(
        JSON.stringify(resetResult),
        { 
          status: resetResult.success ? 200 : 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Get current personalization for audit log
    const currentPersonalization = await getUserPersonalization(userId);

    // Update personalization settings based on provided fields
    let updateResult;
    
    if (dashboardLayout !== undefined) {
      // Validate dashboard layout
      const layoutValidation = validateAndSanitizeDashboardLayout(dashboardLayout);
      if (!layoutValidation.isValid) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: `Bad Request: ${layoutValidation.error}` 
          }),
          { 
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
      
      updateResult = await updateDashboardLayout(userId, layoutValidation.layout);
    } 
    else if (themeSettings !== undefined) {
      updateResult = await updateThemeSettings(userId, themeSettings);
    } 
    else if (widgetPreferences !== undefined) {
      updateResult = await updateWidgetPreferences(userId, widgetPreferences);
    } 
    else if (navigationPreferences !== undefined) {
      // For navigation preferences, we update the entire personalization object
      updateResult = await updateUserPersonalization(userId, {
        navigationPreferences
      });
    } 
    else {
      // If no specific field is provided, update the entire personalization object
      updateResult = await updateUserPersonalization(userId, {
        dashboardLayout,
        themeSettings,
        widgetPreferences,
        navigationPreferences
      });
    }

    // Log audit action
    await logAuditAction(
      user.id,
      'UPDATE_USER_PERSONALIZATION',
      'user',
      userId,
      request,
      updateResult.success ? 'success' : 'failed',
      currentPersonalization,
      updateResult
    );

    return new Response(
      JSON.stringify(updateResult),
      { 
        status: updateResult.success ? 200 : 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in PUT /api/admin/users/[userId]/personalization:', error);
    
    // Log audit action for error
    try {
      const user = await authenticateAdmin(request, {} as any);
      if (user) {
        const { userId } = params;
        await logAuditAction(
          user.id,
          'UPDATE_USER_PERSONALIZATION',
          'user',
          userId,
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
        message: 'Internal Server Error: Failed to update user personalization' 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * DELETE /api/admin/users/[userId]/personalization
 * Reset user personalization to defaults
 */
export async function DELETE(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    // Authenticate admin user
    const user = await authenticateAdmin(request, {} as any);
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

    // Validate user ID
    const { userId } = params;
    if (!userId || !validateUUID(userId)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Bad Request: Invalid or missing user ID' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Check permission - users can reset their own personalization, admins can reset anyone's
    const isOwnProfile = user.id === userId;
    const hasPermission = isOwnProfile || await checkPermission(user, 'admin.users.reset-personalization');
    
    if (!hasPermission) {
      // Log audit action
      await logAuditAction(
        user.id,
        'RESET_USER_PERSONALIZATION',
        'user',
        userId,
        request,
        'failed',
        null,
        { message: 'Insufficient permissions' }
      );

      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Forbidden: Insufficient permissions to reset user personalization' 
        }),
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Get user for audit log
    const targetUser = await getAdminUserById(userId);
    if (!targetUser) {
      // Log audit action for not found
      await logAuditAction(
        user.id,
        'RESET_USER_PERSONALIZATION',
        'user',
        userId,
        request,
        'failed',
        null,
        { message: 'User not found' }
      );

      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Not Found: User not found' 
        }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Get current personalization for audit log
    const currentPersonalization = await getUserPersonalization(userId);

    // Reset user personalization to defaults
    const resetResult = await resetUserPersonalization(userId);

    // Log audit action
    await logAuditAction(
      user.id,
      'RESET_USER_PERSONALIZATION',
      'user',
      userId,
      request,
      resetResult.success ? 'success' : 'failed',
      currentPersonalization,
      resetResult
    );

    return new Response(
      JSON.stringify(resetResult),
      { 
        status: resetResult.success ? 200 : 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in DELETE /api/admin/users/[userId]/personalization:', error);
    
    // Log audit action for error
    try {
      const user = await authenticateAdmin(request, {} as any);
      if (user) {
        const { userId } = params;
        await logAuditAction(
          user.id,
          'RESET_USER_PERSONALIZATION',
          'user',
          userId,
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
        message: 'Internal Server Error: Failed to reset user personalization' 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * PATCH /api/admin/users/[userId]/personalization/layout
 * Update only the dashboard layout
 */
export async function PATCH(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    // Authenticate admin user
    const user = await authenticateAdmin(request, {} as any);
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

    // Validate user ID
    const { userId } = params;
    if (!userId || !validateUUID(userId)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Bad Request: Invalid or missing user ID' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Check permission - users can update their own layout, admins can update anyone's
    const isOwnProfile = user.id === userId;
    const hasPermission = isOwnProfile || await checkPermission(user, 'admin.users.update-layout');
    
    if (!hasPermission) {
      // Log audit action
      await logAuditAction(
        user.id,
        'UPDATE_DASHBOARD_LAYOUT',
        'user',
        userId,
        request,
        'failed',
        null,
        { message: 'Insufficient permissions' }
      );

      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Forbidden: Insufficient permissions to update dashboard layout' 
        }),
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Get user for audit log
    const targetUser = await getAdminUserById(userId);
    if (!targetUser) {
      // Log audit action for not found
      await logAuditAction(
        user.id,
        'UPDATE_DASHBOARD_LAYOUT',
        'user',
        userId,
        request,
        'failed',
        null,
        { message: 'User not found' }
      );

      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Not Found: User not found' 
        }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Parse request body
    const body = await request.json();
    const { dashboardLayout } = body;

    // Validate dashboard layout
    const layoutValidation = validateAndSanitizeDashboardLayout(dashboardLayout);
    if (!layoutValidation.isValid) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: `Bad Request: ${layoutValidation.error}` 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Get current personalization for audit log
    const currentPersonalization = await getUserPersonalization(userId);

    // Update dashboard layout
    const updateResult = await updateDashboardLayout(userId, layoutValidation.layout);

    // Log audit action
    await logAuditAction(
      user.id,
      'UPDATE_DASHBOARD_LAYOUT',
      'user',
      userId,
      request,
      updateResult.success ? 'success' : 'failed',
      currentPersonalization,
      updateResult
    );

    return new Response(
      JSON.stringify(updateResult),
      { 
        status: updateResult.success ? 200 : 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in PATCH /api/admin/users/[userId]/personalization/layout:', error);
    
    // Log audit action for error
    try {
      const user = await authenticateAdmin(request, {} as any);
      if (user) {
        const { userId } = params;
        await logAuditAction(
          user.id,
          'UPDATE_DASHBOARD_LAYOUT',
          'user',
          userId,
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
        message: 'Internal Server Error: Failed to update dashboard layout' 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}