import { describe, it, expect } from '@jest/globals';
import { NextApiRequest, NextApiResponse } from 'next';
import { createMocks } from 'node-mocks-http';
import { registerHandler } from '../../src/lib/test-compat/registerHandler';
import { generateHandler } from '../../src/lib/test-compat/generateHandler';

describe('Integration Test: Image Generation Workflow', () => {
  it('should complete full image generation workflow from registration to image creation', async () => {
    // Step 1: Register user (to have credits)
    const { req: registerReq, res: registerRes } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        email: 'image-test@example.com',
        password: 'securePassword123',
        confirmPassword: 'securePassword123'
      },
    });

    await registerHandler(registerReq, registerRes);

    // Verify registration success
    expect(registerRes._getStatusCode()).toBe(201);
    const registerResponse = registerRes._getJSONData();
    expect(registerResponse.success).toBe(true);
    expect(registerResponse.creditBalance).toBe(100); // Initial credits

    // Step 2: Generate an image using one of the AI models
    const { req: generateReq, res: generateRes } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        prompt: 'A futuristic city skyline',
        aiModel: 'qwen-image-edit', // Costs 5 credits
        sessionToken: 'valid-session-token-for-test'
      },
    });

    await generateHandler(generateReq, generateRes);

    // Verify image generation success
    expect(generateRes._getStatusCode()).toBe(200);
    const generateResponse = generateRes._getJSONData();
    expect(generateResponse.success).toBe(true);
    expect(generateResponse.imageId).toBeDefined();
    expect(generateResponse.imageUrl).toBeDefined();
    expect(generateResponse.creditsUsed).toBe(5);
    // The credit balance should be reduced by 5
    expect(generateResponse.finalCreditBalance).toBe(95); // 100 - 5
    expect(generateResponse.message).toBe('Image generated successfully');
  });

  it('should fail image generation with insufficient credits', async () => {
    // Step 1: Register user
    const { req: registerReq, res: registerRes } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        email: 'low-credit-test@example.com',
        password: 'securePassword123',
        confirmPassword: 'securePassword123'
      },
    });

    await registerHandler(registerReq, registerRes);

    // Verify registration success
    expect(registerRes._getStatusCode()).toBe(201);
    const registerResponse = registerRes._getJSONData();
    expect(registerResponse.success).toBe(true);
    expect(registerResponse.creditBalance).toBe(100); // Initial credits

    // Step 2: Try to generate an image when we simulate the user having no credits
    const { req: generateReq, res: generateRes } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        prompt: 'A futuristic city skyline',
        aiModel: 'qwen-image-edit', // Costs 5 credits
        sessionToken: 'valid-session-token-for-no-credits'
      },
    });

    await generateHandler(generateReq, generateRes);

    // Verify payment required error
    expect(generateRes._getStatusCode()).toBe(402);
    const generateResponse = generateRes._getJSONData();
    expect(generateResponse.success).toBe(false);
    expect(generateResponse.error).toBe('Insufficient credits');
  });
});