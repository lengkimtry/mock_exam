import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { UserExamService } from './user-exam.service';
import { ExerciseService } from '../exercise/exercise.service'; // Import ExerciseService

@Controller('user-exam')
export class UserExamController {
  constructor(
    private readonly userExamService: UserExamService,
    private readonly exerciseService: ExerciseService // Use ExerciseService instead of ExamService
  ) {}

  @Post('start')
  async startExam(@Body() body: { userId: string; examId: string }) {
    return this.userExamService.startExam(body.userId, body.examId);
  }

  @Post('submit/:id')
  async submitExam(@Param('id') id: string, @Body() body: { score: number; timeSpent: number }) {
    return this.userExamService.submitExam(id, body.score, body.timeSpent);
  }

  @Get('results/:userId')
  async getUserExamResults(@Param('userId') userId: string) {
    return this.userExamService.getUserExamResults(userId);
  }

  @Post('generate')
  async generateMockExam(@Body() body: { userId: string; universityId: string; subjectId: string }) {
    console.log('Generating mock exam for:', body);

    // Fetch random exercises for the university and subject
    const exercises = await this.exerciseService.getRandomExercisesByUniversityAndSubject(body.universityId, body.subjectId);

    if (exercises.length === 0) {
      console.error('No exercises found for the selected university and subject.');
      throw new Error('No exercises found for the selected university and subject.');
    }

    console.log('Exercises found:', exercises);

    // Start the mock exam with the fetched exercises
    return this.userExamService.startMockExam(body.userId, exercises);
  }
}
