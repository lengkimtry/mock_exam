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
  BadRequestException,
  UsePipes,
  ValidationPipe,
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
  @UsePipes(
    new ValidationPipe({ skipMissingProperties: true, transform: true }),
  )
  async createUniversity(
    @Body() body: CreateUniversityDto, // Use DTO for type checking
    @UploadedFile() file?: Express.Multer.File,
  ) {
    try {
      // Manual validation
      if (
        !body?.name ||
        typeof body.name !== 'string' ||
        body.name.trim() === ''
      ) {
        throw new BadRequestException(
          'University name is required and must be a non-empty string',
        );
      }

      // Handle image upload
      let imageUrl = body.image || ''; // Use image if provided
      if (file) {
        imageUrl = await this.fileUploadService.uploadFile(file);
      }

      // Parse and validate numberOfSubjects
      let numberOfSubjects = 0;
      if (body.numberOfSubjects !== undefined) {
        numberOfSubjects = parseInt(body.numberOfSubjects.toString());
        if (isNaN(numberOfSubjects) || numberOfSubjects < 0) {
          throw new BadRequestException(
            'numberOfSubjects must be a number greater than or equal to 0',
          );
        }
      }

      // Create properly typed DTO after manual validation
      const createUniversityDto: CreateUniversityDto = {
        name: body.name.trim(),
        title: body.title?.trim() || body.name.trim(),
        image: imageUrl || '/logo.png',
        numberOfSubjects: numberOfSubjects,
      };

      return await this.universityService.createUniversity(createUniversityDto);
    } catch (error) {
      console.error('Error in createUniversity controller:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to create university';
      throw new BadRequestException(errorMessage);
    }
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
