import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UniversityService } from './university.service';
import { CreateUniversityDto } from './dto/create-university.dto';
import { FileUploadService } from './file-upload.service';

@Controller('/university')
export class UniversityController {
  constructor(
    private readonly universityService: UniversityService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async createUniversity(
    @Body() body: CreateUniversityDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    let imageUrl = body.image;
    if (file) {
      imageUrl = await this.fileUploadService.uploadFile(file); // Now uploads to Cloudinary
    }

    if (!imageUrl) {
      throw new Error('Image is required');
    }

    return this.universityService.createUniversity({
      ...body,
      image: imageUrl,
    });
  }

  @Get()
  async getAllUniversities() {
    return this.universityService.getAllUniversities();
  }

  @Get(':id')
  async getUniversityById(@Param('id') id: string) {
    return this.universityService.getUniversityById(id);
  }

  @Get('list')
  async listUniversities() {
    return this.universityService.getAllUniversities(); // Fetch all universities
  }

  @Put(':id')
  async updateUniversity(
    @Param('id') id: string,
    @Body()
    updateData: Partial<{
      name: string;
      title: string;
      image: string;
      numberOfSubjects: number;
    }>,
  ) {
    return this.universityService.updateUniversity(id, updateData);
  }

  @Delete(':id')
  async deleteUniversity(@Param('id') id: string) {
    return this.universityService.deleteUniversity(id);
  }
}
