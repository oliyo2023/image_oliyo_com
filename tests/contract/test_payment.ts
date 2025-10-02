// Contract test for payment endpoints
import { describe, it, expect } from '@jest/globals';

describe('Payment API Contract Tests', () => {
  // Test for GET /api/credits/balance
  describe('GET /api/credits/balance', () => {
    it('should return 200 with user credit balance when authenticated', async () => {
      const response = await fetch('/api/credits/balance', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid_jwt_token',
        },
      });
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('balance');
      expect(typeof data.balance).toBe('number');
      expect(data).toHaveProperty('lastUpdated');
      expect(typeof data.lastUpdated).toBe('string');
    });

    it('should return 401 when unauthorized', async () => {
      const response = await fetch('/api/credits/balance', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer invalid_jwt_token',
        },
      });
      
      expect(response.status).toBe(401);
    });
  });

  // Test for GET /api/credits/transactions
  describe('GET /api/credits/transactions', () => {
    it('should return 200 with transaction history when authenticated', async () => {
      const response = await fetch('/api/credits/transactions', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid_jwt_token',
        },
      });
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('transactions');
      expect(Array.isArray(data.transactions)).toBe(true);
      
      if (data.transactions.length > 0) {
        const transaction = data.transactions[0];
        expect(transaction).toHaveProperty('id');
        expect(transaction).toHaveProperty('transactionType');
        expect(['earned', 'spent', 'purchased']).toContain(transaction.transactionType);
        expect(transaction).toHaveProperty('amount');
        expect(typeof transaction.amount).toBe('number');
        expect(transaction).toHaveProperty('date');
        expect(typeof transaction.date).toBe('string');
        expect(transaction).toHaveProperty('description');
        expect(typeof transaction.description).toBe('string');
      }
    });

    it('should return 401 when unauthorized', async () => {
      const response = await fetch('/api/credits/transactions', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer invalid_jwt_token',
        },
      });
      
      expect(response.status).toBe(401);
    });
  });

  // Test for POST /api/credits/purchase-intent
  describe('POST /api/credits/purchase-intent', () => {
    it('should return 200 when payment intent is created', async () => {
      const response = await fetch('/api/credits/purchase-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid_jwt_token',
        },
        body: JSON.stringify({
          credits: 100,
          paymentMethodId: 'pm_card_visa',
        }),
      });
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('message');
      expect(data).toHaveProperty('paymentIntentId');
      expect(typeof data.paymentIntentId).toBe('string');
      expect(data).toHaveProperty('clientSecret');
      expect(typeof data.clientSecret).toBe('string');
      expect(data).toHaveProperty('amount');
      expect(typeof data.amount).toBe('number');
      expect(data).toHaveProperty('credits');
      expect(data.credits).toBe(100);
    });

    it('should return 400 when input is invalid', async () => {
      const response = await fetch('/api/credits/purchase-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid_jwt_token',
        },
        body: JSON.stringify({
          credits: -10, // Invalid negative amount
          paymentMethodId: 'pm_card_visa',
        }),
      });
      
      expect(response.status).toBe(400);
    });

    it('should return 401 when unauthorized', async () => {
      const response = await fetch('/api/credits/purchase-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer invalid_jwt_token',
        },
        body: JSON.stringify({
          credits: 100,
          paymentMethodId: 'pm_card_visa',
        }),
      });
      
      expect(response.status).toBe(401);
    });
  });

  // Test for POST /api/credits/purchase-confirm
  describe('POST /api/credits/purchase-confirm', () => {
    it('should return 200 when payment is confirmed and credits added', async () => {
      const response = await fetch('/api/credits/purchase-confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid_jwt_token',
        },
        body: JSON.stringify({
          paymentIntentId: 'pi_123456789',
        }),
      });
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('message');
      expect(data).toHaveProperty('newBalance');
      expect(typeof data.newBalance).toBe('number');
      expect(data).toHaveProperty('creditsAdded');
      expect(typeof data.creditsAdded).toBe('number');
    });

    it('should return 400 when input is invalid', async () => {
      const response = await fetch('/api/credits/purchase-confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid_jwt_token',
        },
        body: JSON.stringify({
          paymentIntentId: '', // Invalid empty ID
        }),
      });
      
      expect(response.status).toBe(400);
    });

    it('should return 401 when unauthorized', async () => {
      const response = await fetch('/api/credits/purchase-confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer invalid_jwt_token',
        },
        body: JSON.stringify({
          paymentIntentId: 'pi_123456789',
        }),
      });
      
      expect(response.status).toBe(401);
    });

    it('should return 402 when payment fails', async () => {
      const response = await fetch('/api/credits/purchase-confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid_jwt_token',
        },
        body: JSON.stringify({
          paymentIntentId: 'pi_invalid_intent', // Invalid intent ID
        }),
      });
      
      expect(response.status).toBe(402);
    });
  });
});