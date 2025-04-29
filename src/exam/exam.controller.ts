import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ExamService } from './exam.service';
import { DifficultyLevel } from './schemas/exam.schema';

@Controller('exam')
export class ExamController {
  constructor(private readonly examService: ExamService) {}

  @Post()
  async createExam(@Body() body: { name: string; subjectId: string; difficultyLevel: string }) {
    // Normalize difficultyLevel to match enum values
    const normalizedDifficultyLevel = body.difficultyLevel.charAt(0).toUpperCase() + body.difficultyLevel.slice(1).toLowerCase();
    return this.examService.createExam(body.name, body.subjectId, normalizedDifficultyLevel);
  }

  @Get()
  async getAllExams() {
    return this.examService.getAllExams();
  }

  @Get(':id')
  async getExamById(@Param('id') id: string) {
    return this.examService.getExamById(id);
  }

  @Get(':id/exercises')
  async getExercisesForExam(@Param('id') id: string) {
    return this.examService.getExercisesForExam(id); // Fetch exercises for the exam
  }

  @Put(':id')
  async updateExam(@Param('id') id: string, @Body() updateData: Partial<{ name: string; subjectId: string; difficultyLevel: string }>) {
    return this.examService.updateExam(id, {
      ...updateData,
      difficultyLevel: updateData.difficultyLevel as DifficultyLevel | undefined,
    });
  }

  @Delete(':id')
  async deleteExam(@Param('id') id: string) {
    return this.examService.deleteExam(id);
  }

  @Post('filter')
  async filterExams(@Body() body: { universityId: string; subjectId: string; filterType?: 'year' | 'random' }) {
    if (body.filterType === 'random') {
      return this.examService.getRandomExercisesByUniversityAndSubject(body.universityId, body.subjectId); // Fetch random exercises
    } else if (body.filterType === 'year') {
      return this.examService.getExamsByYear(body.subjectId); // Filter exams by year
    } else {
      return this.examService.getExamsBySubject(body.subjectId); // Default: fetch exams by subject
    }
  }
}
