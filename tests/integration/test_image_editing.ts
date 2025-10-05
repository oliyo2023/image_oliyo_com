import { describe, it, expect } from '@jest/globals';
import { NextApiRequest, NextApiResponse } from 'next';
import { createMocks } from 'node-mocks-http';
import { registerHandler } from '../../src/lib/test-compat/registerHandler';
import { uploadHandler } from '../../src/lib/test-compat/uploadHandler';
import { editHandler } from '../../src/lib/test-compat/editHandler';

describe('Integration Test: Image Editing Workflow', () => {
  it('should complete full image editing workflow from registration to image editing', async () => {
    // Step 1: Register user (to have credits)
    const { req: registerReq, res: registerRes } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        email: 'edit-test@example.com',
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

    // Step 2: Upload an image
    const mockFile = {
      originalname: 'edit-source.jpg',
      buffer: Buffer.from('fake image content for editing'),
      size: 1024 * 512, // 0.5MB
      mimetype: 'image/jpeg'
    };

    const { req: uploadReq, res: uploadRes } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        file: mockFile,
        sessionToken: 'valid-session-token-for-test'
      },
    });

    await uploadHandler(uploadReq, uploadRes);

    // Verify upload success
    expect(uploadRes._getStatusCode()).toBe(200);
    const uploadResponse = uploadRes._getJSONData();
    expect(uploadResponse.success).toBe(true);
    expect(uploadResponse.imageId).toBeDefined();
    const uploadedImageId = uploadResponse.imageId;
    expect(uploadResponse.filename).toBe('edit-source.jpg');

    // Step 3: Edit the uploaded image
    const { req: editReq, res: editRes } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        imageId: uploadedImageId,
        prompt: 'Add a sunset to the sky in this image',
        aiModel: 'gemini-flash-image', // Costs 10 credits
        sessionToken: 'valid-session-token-for-test'
      },
    });

    await editHandler(editReq, editRes);

    // Verify image editing success
    expect(editRes._getStatusCode()).toBe(200);
    const editResponse = editRes._getJSONData();
    expect(editResponse.success).toBe(true);
    expect(editResponse.imageId).toBeDefined();
    expect(editResponse.imageUrl).toBeDefined();
    expect(editResponse.creditsUsed).toBe(10);
    // The credit balance should be reduced by 10, starting from 100
    expect(editResponse.finalCreditBalance).toBe(90); // 100 - 10
    expect(editResponse.originalImageId).toBe(uploadedImageId);
    expect(editResponse.message).toBe('Image edited successfully');
  });

  it('should fail image editing with invalid image ID', async () => {
    // Step 1: Register user (to have credits)
    const { req: registerReq, res: registerRes } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        email: 'edit-fail-test@example.com',
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

    // Step 2: Try to edit an image with invalid ID
    const { req: editReq, res: editRes } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        imageId: 'invalid-image-id', // This should fail
        prompt: 'Add a sunset to the sky in this image',
        aiModel: 'gemini-flash-image',
        sessionToken: 'valid-session-token-for-test'
      },
    });

    await editHandler(editReq, editRes);

    // Verify image editing failure
    expect(editRes._getStatusCode()).toBe(400);
    const editResponse = editRes._getJSONData();
    expect(editResponse.success).toBe(false);
    expect(editResponse.error).toBe('Invalid request parameters');
  });
});