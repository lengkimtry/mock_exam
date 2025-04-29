import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { SubjectService } from './subject.service';
import { Types } from 'mongoose';

@Controller('/subject')// Ensure the route prefix is correct
export class SubjectController {
  constructor(private readonly subjectService: SubjectService) {}

  @Post()
  async createSubject(@Body() body: { name: string; universityId: string }) {
    console.log('Received POST request:', body); // Debug log
    try {
      return this.subjectService.createSubject(body.name, body.universityId);
    } catch (error) {
      console.error('Error creating subject:', error.message);
      throw error;
    }
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
  async updateSubject(@Param('id') id: string, @Body() updateData: Partial<{ name: string; universityId: string }>) {
    const transformedData = {
      ...updateData,
      universityId: updateData.universityId ? new Types.ObjectId(updateData.universityId) : undefined,
    };
    return this.subjectService.updateSubject(id, transformedData);
  }

  @Delete(':id')
  async deleteSubject(@Param('id') id: string) {
    return this.subjectService.deleteSubject(id);
  }

  @Get('topic')
  async findTopicBySubjectAndUniversity(
    @Body() body: { universityId: string; subjectName: string; topicName: string }
  ) {
    console.log('Finding topic with:', body);
    return this.subjectService.findTopicBySubjectAndUniversity(
      body.universityId,
      body.subjectName,
      body.topicName
    );
  }
}
