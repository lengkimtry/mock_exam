import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SubjectService } from './subject.service';
import { Types } from 'mongoose';
import { FileUploadService } from 'src/university/file-upload.service';

@Controller('/subject') // Ensure the route prefix is correct
export class SubjectController {
  constructor(
    private readonly subjectService: SubjectService,
    private readonly fileUploadService: FileUploadService, // Injecting the fileUploadService
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('file')) // file field from FormData
  async createSubject(
    @UploadedFile() file: Express.Multer.File,
    @Body()
    body: {
      name: string;
      universityId: string;
      questionCount: number;
      duration: number;
    }, // Define a proper type for body
  ) {
    // Manually parse fields from the body
    const { name, universityId, questionCount, duration } = body; // Safely destructure with a defined type

    if (!name || !universityId || questionCount == null || duration == null) {
      throw new Error(
        'Missing required fields: name, universityId, questionCount, or duration.',
      );
    }

    let imageSRC: string | undefined = undefined;
    if (file) {
      imageSRC = await this.fileUploadService.uploadFile(file); // <- Use `uploadFile`
    }

    return this.subjectService.createSubject({
      name,
      universityId,
      questionCount: Number(questionCount),
      duration: Number(duration),
      imageSRC,
    });
  }

  @Get()
  async getAllSubjects() {
    return this.subjectService.getAllSubjects();
  }

  @Get(':id')
  async getSubjectById(@Param('id') id: string) {
    return this.subjectService.getSubjectById(id);
  }

  @Get('list/:universityId')
  async listSubjectsByUniversity(@Param('universityId') universityId: string) {
    return this.subjectService.getSubjectsByUniversity(universityId); // Fetch subjects for the university
  }

  @Put(':id')
  async updateSubject(
    @Param('id') id: string,
    @Body() updateData: Partial<{ name: string; universityId: string }>,
  ) {
    const transformedData = {
      ...updateData,
      universityId: updateData.universityId
        ? new Types.ObjectId(updateData.universityId)
        : undefined,
    };
    return this.subjectService.updateSubject(id, transformedData);
  }

  @Delete(':id')
  async deleteSubject(@Param('id') id: string) {
    return this.subjectService.deleteSubject(id);
  }

  @Get('topic')
  async findTopicBySubjectAndUniversity(
    @Body()
    body: {
      universityId: string;
      subjectName: string;
      topicName: string;
    },
  ) {
    console.log('Finding topic with:', body);
    return this.subjectService.findTopicBySubjectAndUniversity(
      body.universityId,
      body.subjectName,
      body.topicName,
    );
  }
}
