import { Storage } from '@google-cloud/storage';
import multer from 'multer';
import { Request } from 'express';

const storage = new Storage({
  // Automatically uses GOOGLE_APPLICATION_CREDENTIALS environment variable or GCP metadata service
});

const PUBLIC_BUCKET_NAME = process.env.GCS_PUBLIC_BUCKET || 'nurses-pillow-public-media';
const PRIVATE_BUCKET_NAME = process.env.GCS_PRIVATE_BUCKET || 'nurses-pillow-verifications-private';

export const storageService = {
  async uploadPublicFile(fileBuffer: Buffer, fileName: string, mimeType: string): Promise<string> {
    const bucket = storage.bucket(PUBLIC_BUCKET_NAME);
    const blob = bucket.file(`listings/${Date.now()}-${fileName}`);
    
    const blobStream = blob.createWriteStream({
      resumable: false,
      contentType: mimeType,
    });

    return new Promise((resolve, reject) => {
      blobStream.on('error', (err) => reject(err));
      blobStream.on('finish', () => {
        const publicUrl = `https://storage.googleapis.com/${PUBLIC_BUCKET_NAME}/${blob.name}`;
        resolve(publicUrl);
      });
      blobStream.end(fileBuffer);
    });
  },

  async getSignedUrlForPrivateDocument(filePath: string, expirationMinutes = 15): Promise<string> {
    const bucket = storage.bucket(PRIVATE_BUCKET_NAME);
    const file = bucket.file(filePath);

    const [url] = await file.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + expirationMinutes * 60 * 1000,
    });

    return url;
  },
};

// Multer upload middleware with strict security checks
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

export const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, WEBP, and PDF files are allowed.'));
    }
  },
});
