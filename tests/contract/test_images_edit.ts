import { describe, it, expect } from '@jest/globals';
import { NextApiRequest, NextApiResponse } from 'next';
import { createMocks } from 'node-mocks-http';
import { editHandler } from '../../src/lib/test-compat/editHandler';

describe('Contract Test: POST /api/images/edit', () => {
  it('should edit an existing image using a text prompt and AI models', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        imageId: 'existing-image-id',
        prompt: 'Add snow to the mountains in this image',
        aiModel: 'gemini-flash-image',
        sessionToken: 'valid-session-token'
      },
    });

    await editHandler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const response = res._getJSONData();
    expect(response.success).toBe(true);
    expect(response.imageId).toBeDefined();
    expect(response.imageUrl).toBeDefined();
    expect(response.creditsUsed).toBe(10); // gemini-flash-image costs 10 credits
    expect(response.finalCreditBalance).toBeLessThan(100); // Assuming user started with 100
    expect(response.originalImageId).toBe('existing-image-id');
    expect(response.message).toBe('Image edited successfully');
  });

  it('should return error for invalid request parameters', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        imageId: '', // invalid - empty ID
        prompt: 'Valid prompt',
        aiModel: 'valid-model',
        sessionToken: 'valid-session-token'
      },
    });

    await editHandler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const response = res._getJSONData();
    expect(response.success).toBe(false);
    expect(response.error).toBe('Invalid request parameters');
  });
});