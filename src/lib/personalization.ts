// src/lib/personalization.ts
// UI personalization service

import db from './db-server'; // Use server-side database client

/**
 * Get user personalization settings
 * @param userId - The ID of the user
 * @returns Promise<Object> - User personalization settings
 */
export async function getUserPersonalization(userId: string): Promise<any> {
  try {
    // Get user personalization settings from database
    const personalization = await db.userPersonalization.findUnique({
      where: { userId }
    });

    // If no personalization settings exist, return default settings
    if (!personalization) {
      return {
        userId,
        dashboardLayout: getDefaultDashboardLayout(),
        themeSettings: getDefaultThemeSettings(),
        widgetPreferences: getDefaultWidgetPreferences(),
        navigationPreferences: getDefaultNavigationPreferences()
      };
    }

    return personalization;
  } catch (error) {
    console.error('Error getting user personalization:', error);
    // Return default settings on error
    return {
      userId,
      dashboardLayout: getDefaultDashboardLayout(),
      themeSettings: getDefaultThemeSettings(),
      widgetPreferences: getDefaultWidgetPreferences(),
      navigationPreferences: getDefaultNavigationPreferences()
    };
  }
}

/**
 * Update user personalization settings
 * @param userId - The ID of the user
 * @param settings - Object containing personalization settings to update
 * @returns Promise<Object> - Updated personalization settings
 */
export async function updateUserPersonalization(userId: string, settings: any): Promise<any> {
  try {
    // Check if personalization settings already exist for the user
    const existingPersonalization = await db.userPersonalization.findUnique({
      where: { userId }
    });

    let personalization;

    if (existingPersonalization) {
      // Update existing personalization settings
      personalization = await db.userPersonalization.update({
        where: { userId },
        data: {
          ...settings,
          updatedAt: new Date()
        }
      });
    } else {
      // Create new personalization settings
      personalization = await db.userPersonalization.create({
        data: {
          userId,
          ...settings
        }
      });
    }

    return {
      success: true,
      personalization
    };
  } catch (error) {
    console.error('Error updating user personalization:', error);
    return {
      success: false,
      message: 'Failed to update personalization settings'
    };
  }
}

/**
 * Get default dashboard layout
 * @returns Object - Default dashboard layout configuration
 */
function getDefaultDashboardLayout(): any {
  return {
    widgets: [
      { id: 'recent-activity', position: { x: 0, y: 0, width: 2, height: 1 } },
      { id: 'user-stats', position: { x: 2, y: 0, width: 2, height: 1 } },
      { id: 'system-status', position: { x: 0, y: 1, width: 4, height: 1 } }
    ],
    gridConfig: {
      columns: 4,
      rowHeight: 150,
      margin: [10, 10]
    }
  };
}

/**
 * Get default theme settings
 * @returns Object - Default theme settings
 */
function getDefaultThemeSettings(): any {
  return {
    mode: 'light', // 'light' or 'dark'
    primaryColor: '#1a73e8',
    secondaryColor: '#5f6368',
    fontFamily: 'Roboto, sans-serif',
    fontSize: 'medium' // 'small', 'medium', 'large'
  };
}

/**
 * Get default widget preferences
 * @returns Object - Default widget preferences
 */
function getDefaultWidgetPreferences(): any {
  return {
    recentActivity: {
      enabled: true,
      refreshInterval: 30000, // 30 seconds
      showAvatars: true
    },
    userStats: {
      enabled: true,
      showCharts: true,
      dateFormat: 'relative' // 'relative' or 'absolute'
    },
    systemStatus: {
      enabled: true,
      showDetails: true,
      notificationsEnabled: true
    }
  };
}

/**
 * Get default navigation preferences
 * @returns Object - Default navigation preferences
 */
function getDefaultNavigationPreferences(): any {
  return {
    sidebarCollapsed: false,
    sidebarPosition: 'left', // 'left' or 'right'
    topNavVisible: true,
    breadcrumbsEnabled: true,
    quickActions: [
      { id: 'create-user', label: 'Create User', icon: 'person_add' },
      { id: 'view-reports', label: 'View Reports', icon: 'bar_chart' },
      { id: 'manage-roles', label: 'Manage Roles', icon: 'security' }
    ]
  };
}

/**
 * Reset user personalization to defaults
 * @param userId - The ID of the user
 * @returns Promise<Object> - Result of the reset operation
 */
export async function resetUserPersonalization(userId: string): Promise<any> {
  try {
    const personalization = await db.userPersonalization.update({
      where: { userId },
      data: {
        dashboardLayout: getDefaultDashboardLayout(),
        themeSettings: getDefaultThemeSettings(),
        widgetPreferences: getDefaultWidgetPreferences(),
        navigationPreferences: getDefaultNavigationPreferences(),
        updatedAt: new Date()
      }
    });

    return {
      success: true,
      personalization
    };
  } catch (error) {
    console.error('Error resetting user personalization:', error);
    return {
      success: false,
      message: 'Failed to reset personalization settings'
    };
  }
}

/**
 * Update specific dashboard layout
 * @param userId - The ID of the user
 * @param layout - New dashboard layout configuration
 * @returns Promise<Object> - Updated personalization settings
 */
export async function updateDashboardLayout(userId: string, layout: any): Promise<any> {
  try {
    const personalization = await db.userPersonalization.update({
      where: { userId },
      data: {
        dashboardLayout: layout,
        updatedAt: new Date()
      }
    });

    return {
      success: true,
      personalization
    };
  } catch (error) {
    console.error('Error updating dashboard layout:', error);
    return {
      success: false,
      message: 'Failed to update dashboard layout'
    };
  }
}

/**
 * Update theme settings
 * @param userId - The ID of the user
 * @param theme - New theme settings
 * @returns Promise<Object> - Updated personalization settings
 */
export async function updateThemeSettings(userId: string, theme: any): Promise<any> {
  try {
    const personalization = await db.userPersonalization.update({
      where: { userId },
      data: {
        themeSettings: theme,
        updatedAt: new Date()
      }
    });

    return {
      success: true,
      personalization
    };
  } catch (error) {
    console.error('Error updating theme settings:', error);
    return {
      success: false,
      message: 'Failed to update theme settings'
    };
  }
}

/**
 * Update widget preferences
 * @param userId - The ID of the user
 * @param preferences - New widget preferences
 * @returns Promise<Object> - Updated personalization settings
 */
export async function updateWidgetPreferences(userId: string, preferences: any): Promise<any> {
  try {
    const personalization = await db.userPersonalization.update({
      where: { userId },
      data: {
        widgetPreferences: preferences,
        updatedAt: new Date()
      }
    });

    return {
      success: true,
      personalization
    };
  } catch (error) {
    console.error('Error updating widget preferences:', error);
    return {
      success: false,
      message: 'Failed to update widget preferences'
    };
  }
}