import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UniversityController } from './university.controller';
import { UniversityService } from './university.service';
import { University, UniversitySchema } from './schemas/university.schema';
import { FileUploadService } from './file-upload.service';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: University.name, schema: UniversitySchema },
    ]),
    CloudinaryModule,
  ],
  controllers: [UniversityController],
  providers: [UniversityService, FileUploadService],
  exports: [FileUploadService],
})
export class UniversityModule {}
