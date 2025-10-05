import { describe, it, expect } from '@jest/globals';
import { NextApiRequest, NextApiResponse } from 'next';
import { createMocks } from 'node-mocks-http';
import { generateHandler } from '../../src/lib/test-compat/generateHandler';

describe('Contract Test: POST /api/images/generate', () => {
  it('should generate a new image from a text prompt using AI models', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        prompt: 'A beautiful landscape with mountains and lakes',
        aiModel: 'qwen-image-edit',
        sessionToken: 'valid-session-token'
      },
    });

    await generateHandler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const response = res._getJSONData();
    expect(response.success).toBe(true);
    expect(response.imageId).toBeDefined();
    expect(response.imageUrl).toBeDefined();
    expect(response.creditsUsed).toBe(5); // qwen-image-edit costs 5 credits
    expect(response.finalCreditBalance).toBeLessThan(100); // Assuming user started with 100
    expect(response.message).toBe('Image generated successfully');
  });

  it('should return error for invalid request parameters', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        prompt: '', // invalid - empty prompt
        aiModel: 'invalid-model',
        sessionToken: 'valid-session-token'
      },
    });

    await generateHandler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const response = res._getJSONData();
    expect(response.success).toBe(false);
    expect(response.error).toBe('Invalid request parameters');
  });

  it('should return payment required when insufficient credits', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        prompt: 'A beautiful landscape with mountains and lakes',
        aiModel: 'gemini-flash-image', // costs 10 credits
        sessionToken: 'valid-session-token-with-no-credits'
      },
    });

    await generateHandler(req, res);

    expect(res._getStatusCode()).toBe(402);
    const response = res._getJSONData();
    expect(response.success).toBe(false);
    expect(response.error).toBe('Insufficient credits');
    expect(response.requiredCredits).toBe(10);
    expect(response.currentCredits).toBeLessThan(10);
  });
});