import { describe, it, expect } from '@jest/globals';
import { NextApiRequest, NextApiResponse } from 'next';
import { createMocks } from 'node-mocks-http';
import { uploadHandler } from '../../../pages/api/images/upload';

describe('Contract Test: POST /api/images/upload', () => {
  it('should upload an image for later editing', async () => {
    // Create a mock file for testing
    const mockFile = {
      originalname: 'test-image.jpg',
      buffer: Buffer.from('fake image content'),
      size: 1024 * 1024, // 1MB
      mimetype: 'image/jpeg'
    };

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        file: mockFile,
        sessionToken: 'valid-session-token'
      },
    });

    await uploadHandler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const response = res._getJSONData();
    expect(response.success).toBe(true);
    expect(response.imageId).toBeDefined();
    expect(response.filename).toBe('test-image.jpg');
    expect(response.message).toBe('Image uploaded successfully');
  });

  it('should return error for file too large', async () => {
    // Create a mock large file for testing
    const largeFile = {
      originalname: 'large-image.jpg',
      buffer: Buffer.alloc(60 * 1024 * 1024), // 60MB, exceeding 50MB limit
      size: 60 * 1024 * 1024, // 60MB
      mimetype: 'image/jpeg'
    };

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        file: largeFile,
        sessionToken: 'valid-session-token'
      },
    });

    await uploadHandler(req, res);

    expect(res._getStatusCode()).toBe(413); // Payload Too Large
    const response = res._getJSONData();
    expect(response.success).toBe(false);
    expect(response.error).toBe('File too large, maximum 50MB allowed');
  });
});