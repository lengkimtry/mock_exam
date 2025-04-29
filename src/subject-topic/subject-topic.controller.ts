import { Controller, Post, Get, Delete, Body, Param } from '@nestjs/common';
import { SubjectTopicService } from './subject-topic.service';

@Controller('subject-topic')
export class SubjectTopicController {
  constructor(private readonly subjectTopicService: SubjectTopicService) {}

  @Post()
  async createSubjectTopic(@Body() body: { subjectId: string; name: string }) {
    return this.subjectTopicService.createSubjectTopic(body.subjectId, body.name);
  }

  @Get(':subjectId')
  async getTopicsBySubject(@Param('subjectId') subjectId: string) {
    return this.subjectTopicService.getTopicsBySubject(subjectId);
  }

  @Delete(':id')
  async deleteSubjectTopic(@Param('id') id: string) {
    return this.subjectTopicService.deleteSubjectTopic(id);
  }
}
