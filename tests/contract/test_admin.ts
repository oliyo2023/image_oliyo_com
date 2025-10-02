// Contract test for admin endpoints
import { describe, it, expect } from '@jest/globals';

describe('Admin API Contract Tests', () => {
  // Test for GET /api/admin/users
  describe('GET /api/admin/users', () => {
    it('should return 200 with list of users when authenticated as admin', async () => {
      const response = await fetch('/api/admin/users', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid_admin_jwt_token',
        },
      });
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('users');
      expect(Array.isArray(data.users)).toBe(true);
      expect(data).toHaveProperty('total');
      expect(typeof data.total).toBe('number');
      expect(data).toHaveProperty('limit');
      expect(typeof data.limit).toBe('number');
      expect(data).toHaveProperty('offset');
      expect(typeof data.offset).toBe('number');
      
      if (data.users.length > 0) {
        const user = data.users[0];
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('email');
        expect(user).toHaveProperty('creditBalance');
        expect(user).toHaveProperty('registrationDate');
        expect(user).toHaveProperty('lastLogin');
        expect(user).toHaveProperty('role');
        expect(user).toHaveProperty('isActive');
      }
    });

    it('should return 401 when unauthorized', async () => {
      const response = await fetch('/api/admin/users', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer invalid_jwt_token',
        },
      });
      
      expect(response.status).toBe(401);
    });

    it('should return 403 when user is not admin', async () => {
      const response = await fetch('/api/admin/users', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid_user_jwt_token', // Regular user token
        },
      });
      
      expect(response.status).toBe(403);
    });
  });

  // Test for GET /api/admin/analytics
  describe('GET /api/admin/analytics', () => {
    it('should return 200 with platform analytics when authenticated as admin', async () => {
      const response = await fetch('/api/admin/analytics', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid_admin_jwt_token',
        },
      });
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('totalUsers');
      expect(typeof data.totalUsers).toBe('number');
      expect(data).toHaveProperty('activeUsersToday');
      expect(typeof data.activeUsersToday).toBe('number');
      expect(data).toHaveProperty('totalImagesGenerated');
      expect(typeof data.totalImagesGenerated).toBe('number');
      expect(data).toHaveProperty('totalCreditsUsed');
      expect(typeof data.totalCreditsUsed).toBe('number');
      expect(data).toHaveProperty('modelUsage');
      expect(data.modelUsage).toHaveProperty('qwen-image-edit');
      expect(data.modelUsage).toHaveProperty('gemini-flash-image');
      
      // Check model usage details
      const qwenUsage = data.modelUsage['qwen-image-edit'];
      expect(qwenUsage).toHaveProperty('usageCount');
      expect(qwenUsage).toHaveProperty('creditsConsumed');
      expect(qwenUsage).toHaveProperty('avgProcessingTime');
      expect(qwenUsage).toHaveProperty('costPerUse');
      
      const geminiUsage = data.modelUsage['gemini-flash-image'];
      expect(geminiUsage).toHaveProperty('usageCount');
      expect(geminiUsage).toHaveProperty('creditsConsumed');
      expect(geminiUsage).toHaveProperty('avgProcessingTime');
      expect(geminiUsage).toHaveProperty('costPerUse');
      
      expect(data).toHaveProperty('revenue');
      expect(data.revenue).toHaveProperty('total');
      expect(data.revenue).toHaveProperty('last30Days');
    });

    it('should return 401 when unauthorized', async () => {
      const response = await fetch('/api/admin/analytics', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer invalid_jwt_token',
        },
      });
      
      expect(response.status).toBe(401);
    });

    it('should return 403 when user is not admin', async () => {
      const response = await fetch('/api/admin/analytics', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid_user_jwt_token', // Regular user token
        },
      });
      
      expect(response.status).toBe(403);
    });
  });

  // Test for GET /api/admin/transactions
  describe('GET /api/admin/transactions', () => {
    it('should return 200 with transaction audit log when authenticated as admin', async () => {
      const response = await fetch('/api/admin/transactions', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid_admin_jwt_token',
        },
      });
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('transactions');
      expect(Array.isArray(data.transactions)).toBe(true);
      
      if (data.transactions.length > 0) {
        const transaction = data.transactions[0];
        expect(transaction).toHaveProperty('id');
        expect(transaction).toHaveProperty('userId');
        expect(transaction).toHaveProperty('userEmail');
        expect(transaction).toHaveProperty('transactionType');
        expect(['earned', 'spent', 'purchased']).toContain(transaction.transactionType);
        expect(transaction).toHaveProperty('amount');
        expect(typeof transaction.amount).toBe('number');
        expect(transaction).toHaveProperty('date');
        expect(typeof transaction.date).toBe('string');
        expect(transaction).toHaveProperty('description');
        expect(typeof transaction.description).toBe('string');
        expect(transaction).toHaveProperty('relatedModelName');
      }
      
      expect(data).toHaveProperty('pagination');
      expect(data.pagination).toHaveProperty('page');
      expect(data.pagination).toHaveProperty('limit');
      expect(data.pagination).toHaveProperty('total');
    });

    it('should return 401 when unauthorized', async () => {
      const response = await fetch('/api/admin/transactions', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer invalid_jwt_token',
        },
      });
      
      expect(response.status).toBe(401);
    });

    it('should return 403 when user is not admin', async () => {
      const response = await fetch('/api/admin/transactions', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid_user_jwt_token', // Regular user token
        },
      });
      
      expect(response.status).toBe(403);
    });
  });

  // Test for POST /api/admin/articles
  describe('POST /api/admin/articles', () => {
    it('should return 201 when article is created successfully', async () => {
      const response = await fetch('/api/admin/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid_admin_jwt_token',
        },
        body: JSON.stringify({
          title: 'How to Create Stunning Landscapes',
          content: '# Creating Beautiful Landscapes\n\nHere are some tips...',
          status: 'published',
          imageUrl: 'https://cdn.example.com/images/article-landscape.jpg'
        }),
      });
      
      expect(response.status).toBe(201);
      
      const data = await response.json();
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('message');
      expect(data).toHaveProperty('article');
      expect(data.article).toHaveProperty('id');
      expect(data.article).toHaveProperty('title');
      expect(data.article).toHaveProperty('authorId');
      expect(data.article).toHaveProperty('publicationDate');
      expect(data.article).toHaveProperty('status');
    });

    it('should return 400 when input is invalid', async () => {
      const response = await fetch('/api/admin/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid_admin_jwt_token',
        },
        body: JSON.stringify({
          title: '', // Missing required field
          content: '',
          status: 'invalid-status'
        }),
      });
      
      expect(response.status).toBe(400);
    });

    it('should return 401 when unauthorized', async () => {
      const response = await fetch('/api/admin/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer invalid_jwt_token',
        },
        body: JSON.stringify({
          title: 'Test Article',
          content: 'Test content',
          status: 'published'
        }),
      });
      
      expect(response.status).toBe(401);
    });

    it('should return 403 when user is not admin', async () => {
      const response = await fetch('/api/admin/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid_user_jwt_token', // Regular user token
        },
        body: JSON.stringify({
          title: 'Test Article',
          content: 'Test content',
          status: 'published'
        }),
      });
      
      expect(response.status).toBe(403);
    });
  });

  // Test for GET /api/admin/articles
  describe('GET /api/admin/articles', () => {
    it('should return 200 with list of articles when authenticated as admin', async () => {
      const response = await fetch('/api/admin/articles', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid_admin_jwt_token',
        },
      });
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('articles');
      expect(Array.isArray(data.articles)).toBe(true);
      
      if (data.articles.length > 0) {
        const article = data.articles[0];
        expect(article).toHaveProperty('id');
        expect(article).toHaveProperty('title');
        expect(article).toHaveProperty('authorId');
        expect(article).toHaveProperty('authorEmail');
        expect(article).toHaveProperty('publicationDate');
        expect(article).toHaveProperty('status');
      }
      
      expect(data).toHaveProperty('pagination');
      expect(data.pagination).toHaveProperty('page');
      expect(data.pagination).toHaveProperty('limit');
      expect(data.pagination).toHaveProperty('total');
    });

    it('should return 401 when unauthorized', async () => {
      const response = await fetch('/api/admin/articles', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer invalid_jwt_token',
        },
      });
      
      expect(response.status).toBe(401);
    });

    it('should return 403 when user is not admin', async () => {
      const response = await fetch('/api/admin/articles', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid_user_jwt_token', // Regular user token
        },
      });
      
      expect(response.status).toBe(403);
    });
  });

  // Test for PUT /api/admin/articles/{id}
  describe('PUT /api/admin/articles/{id}', () => {
    it('should return 200 when article is updated successfully', async () => {
      const response = await fetch('/api/admin/articles/test-article-id', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid_admin_jwt_token',
        },
        body: JSON.stringify({
          title: 'Updated Title',
          content: 'Updated content here...',
          status: 'published'
        }),
      });
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('message');
      expect(data).toHaveProperty('article');
      expect(data.article).toHaveProperty('id');
      expect(data.article).toHaveProperty('title');
      expect(data.article).toHaveProperty('authorId');
      expect(data.article).toHaveProperty('publicationDate');
      expect(data.article).toHaveProperty('status');
    });

    it('should return 400 when input is invalid', async () => {
      const response = await fetch('/api/admin/articles/test-article-id', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid_admin_jwt_token',
        },
        body: JSON.stringify({
          status: 'invalid-status'
        }),
      });
      
      expect(response.status).toBe(400);
    });

    it('should return 401 when unauthorized', async () => {
      const response = await fetch('/api/admin/articles/test-article-id', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer invalid_jwt_token',
        },
        body: JSON.stringify({
          title: 'Updated Title',
          content: 'Updated content',
          status: 'published'
        }),
      });
      
      expect(response.status).toBe(401);
    });

    it('should return 403 when user is not admin', async () => {
      const response = await fetch('/api/admin/articles/test-article-id', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid_user_jwt_token', // Regular user token
        },
        body: JSON.stringify({
          title: 'Updated Title',
          content: 'Updated content',
          status: 'published'
        }),
      });
      
      expect(response.status).toBe(403);
    });

    it('should return 404 when article not found', async () => {
      const response = await fetch('/api/admin/articles/non-existent-id', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid_admin_jwt_token',
        },
        body: JSON.stringify({
          title: 'Updated Title',
          content: 'Updated content',
          status: 'published'
        }),
      });
      
      expect(response.status).toBe(404);
    });
  });
});