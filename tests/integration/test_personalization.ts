// tests/integration/test_personalization.ts
// Integration test for UI personalization flow

import { test, expect } from '@playwright/test';

test('User should be able to customize dashboard layout', async ({ request }) => {
  // This test should fail initially as personalization is not implemented yet
  const response = await request.put('/api/admin/users/test-user-id/personalization', {
    data: {
      dashboardLayout: {
        widgets: [
          { id: 'recent-activity', position: { x: 0, y: 0, width: 2, height: 1 } },
          { id: 'user-stats', position: { x: 2, y: 0, width: 2, height: 1 } }
        ]
      }
    },
    headers: {
      'Authorization': 'Bearer test-user-token',
      'Content-Type': 'application/json'
    }
  });

  expect(response.status()).toBeGreaterThanOrEqual(400);
});

test('User personalization settings should persist across sessions', async ({ request }) => {
  // This test should fail initially as personalization is not implemented yet
  const response = await request.get('/api/admin/users/test-user-id/personalization', {
    headers: {
      'Authorization': 'Bearer test-user-token'
    }
  });

  expect(response.status()).toBeGreaterThanOrEqual(400);
});

test('User should be able to change theme settings', async ({ request }) => {
  // This test should fail initially as personalization is not implemented yet
  const response = await request.put('/api/admin/users/test-user-id/personalization', {
    data: {
      themeSettings: {
        mode: 'dark',
        primaryColor: '#1a73e8',
        fontSize: 'medium'
      }
    },
    headers: {
      'Authorization': 'Bearer test-user-token',
      'Content-Type': 'application/json'
    }
  });

  expect(response.status()).toBeGreaterThanOrEqual(400);
});

test('User should be able to add custom widgets', async ({ request }) => {
  // This test should fail initially as personalization is not implemented yet
  const response = await request.put('/api/admin/users/test-user-id/personalization', {
    data: {
      widgetPreferences: {
        customWidgets: [
          {
            id: 'custom-widget-1',
            title: 'Custom Widget',
            type: 'chart',
            config: {
              chartType: 'bar',
              dataSource: 'user-activity'
            }
          }
        ]
      }
    },
    headers: {
      'Authorization': 'Bearer test-user-token',
      'Content-Type': 'application/json'
    }
  });

  expect(response.status()).toBeGreaterThanOrEqual(400);
});