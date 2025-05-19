// src/file-upload.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import toStream = require('buffer-to-stream');

@Injectable()
export class FileUploadService {
  constructor(@Inject('CLOUDINARY') private cloudinary) {}

  async uploadFile(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const upload = this.cloudinary.uploader.upload_stream(
        { folder: 'university-images' },
        (error: any, result: UploadApiResponse) => {
          if (error || !result) {
            return reject(error || new Error('Upload failed'));
          }
          resolve(result.secure_url); // ✅ Always returns string
        },
      );
      toStream(file.buffer).pipe(upload);
    });
  }
}
