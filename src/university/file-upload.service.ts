// src/file-upload.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class FileUploadService {
  [x: string]: any;
  constructor(@Inject('CLOUDINARY') private cloudinary) {}

  private bufferToStream(buffer: Buffer): Readable {
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    return readable;
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const upload = this.cloudinary.uploader.upload_stream(
        { folder: 'university-images' },
        (error: any, result: UploadApiResponse) => {
          if (error || !result) {
            return reject(error || new Error('Upload failed'));
          }
          resolve(result.secure_url);
        },
      );

      this.bufferToStream(file.buffer).pipe(upload);
    });
  }
}
