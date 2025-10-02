import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { ImageService } from '../../lib/services/image-service';
import { validateImage } from '../../lib/utils/image';
import { getUserIdFromSession } from '../../lib/utils/session';

const imageService = new ImageService();

// Configure Next.js to not parse the body for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    // Verify the session
    const sessionToken = req.headers.authorization?.replace('Bearer ', '') || 
                         (req.body?.sessionToken as string);
    
    if (!sessionToken) {
      return res.status(401).json({ 
        success: false, 
        error: 'Session token is required' 
      });
    }

    const userId = await getUserIdFromSession(sessionToken);
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid or expired session token' 
      });
    }

    // Parse form data
    const form = new formidable.IncomingForm();
    form.maxFileSize = 50 * 1024 * 1024; // 50MB limit

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Form parsing error:', err);
        return res.status(500).json({ 
          success: false, 
          error: 'Error parsing form data' 
        });
      }

      // Get the uploaded file
      const fileArray = files.file;
      if (!fileArray || Array.isArray(fileArray) && fileArray.length === 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'No file uploaded' 
        });
      }

      const file = Array.isArray(fileArray) ? fileArray[0] : fileArray;
      if (!file) {
        return res.status(400).json({ 
          success: false, 
          error: 'No file uploaded' 
        });
      }

      // Validate file properties
      try {
        validateImage(file.size, path.extname(file.originalFilename).substring(1));
      } catch (validationError: any) {
        return res.status(413).json({ 
          success: false, 
          error: validationError.message 
        });
      }

      // For now, save file to a temporary location
      // In production, you might want to save to cloud storage (S3, Cloudinary, etc.)
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const fileExtension = path.extname(file.originalFilename);
      const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${fileExtension}`;
      const filePath = path.join(uploadDir, fileName);

      // Move uploaded file to destination
      fs.copyFileSync(file.filepath, filePath);

      // Create image record in database
      try {
        const image = await imageService.createImage({
          userId,
          originalFilename: file.originalFilename,
          storagePath: `/uploads/${fileName}`,
          fileFormat: fileExtension.substring(1), // Remove the dot
          fileSize: file.size,
          imageType: 'UPLOADED'
        });

        return res.status(200).json({
          success: true,
          imageId: image.id,
          filename: file.originalFilename,
          message: 'Image uploaded successfully'
        });
      } catch (dbError: any) {
        // Clean up uploaded file if DB operation fails
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        
        console.error('Database error during upload:', dbError);
        return res.status(500).json({ 
          success: false, 
          error: 'Error saving image to database' 
        });
      }
    });
  } catch (error: any) {
    console.error('Image upload error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}

// Export the handler function to be used in tests
export { handler as uploadHandler };