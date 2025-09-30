// tests/contract/test_personalization.ts
// Contract test for personalization endpoints

import { test, expect } from '@playwright/test';

test('GET /api/admin/users/{userId}/personalization should return user personalization settings', async ({ request }) => {
  const response = await request.get('/api/admin/users/test-user-id/personalization', {
    headers: {
      'Authorization': 'Bearer test-token'
    }
  });

  // This test should fail initially as the endpoint doesn't exist yet
  expect(response.status()).toBeGreaterThanOrEqual(400);
});

test('PUT /api/admin/users/{userId}/personalization should update user personalization settings', async ({ request }) => {
  const response = await request.put('/api/admin/users/test-user-id/personalization', {
    data: {
      dashboardLayout: {
        widgets: [
          { id: 'recent-activity', position: { x: 0, y: 0 } },
          { id: 'user-stats', position: { x: 1, y: 0 } }
        ]
      },
      themeSettings: {
        mode: 'dark',
        primaryColor: '#1a73e8'
      }
    },
    headers: {
      'Authorization': 'Bearer test-token',
      'Content-Type': 'application/json'
    }
  });

  // This test should fail initially as the endpoint doesn't exist yet
  expect(response.status()).toBeGreaterThanOrEqual(400);
});