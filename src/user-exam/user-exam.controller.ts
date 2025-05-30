import { Controller, Post, Get, Body, Param, Delete } from '@nestjs/common';
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

  @Get('history/:userId')
  async getExamHistory(@Param('userId') userId: string) {
    return this.userExamService.getExamHistory(userId);
  }

  @Get('result/:userExamId')
  async getExamResult(@Param('userExamId') userExamId: string) {
    return this.userExamService.getExamResult(userExamId);
  }

  @Post('submit-results')
  async submitExamResults(@Body() resultsData: {
    userId: string;
    examId: string;
    subjectName: string;
    universityName: string;
    totalQuestions: number;
    answeredQuestions: number;
    correctAnswers: number;
    score: number;
    timeSpent: number;
    questionResults: any[];
    completedAt: string;
  }) {
    console.log('Submitting exam results:', resultsData);
    
    try {
      const userExam = await this.userExamService.submitExamResults(resultsData);
      return userExam;
    } catch (error) {
      console.error('Error submitting exam results:', error);
      throw new Error('Failed to submit exam results');
    }
  }

  @Delete('delete/:examId')
  async deleteExamHistory(@Param('examId') examId: string) {
    console.log(`Deleting exam history: ${examId}`);
    
    try {
      const deletedExam = await this.userExamService.deleteExamHistory(examId);
      if (!deletedExam) {
        throw new Error('Exam history not found');
      }
      
      console.log('Exam history deleted successfully');
      return { 
        message: 'Exam history deleted successfully', 
        deletedExam: {
          id: deletedExam._id,
          subjectName: deletedExam.subjectName,
          score: deletedExam.score
        }
      };
    } catch (error) {
      console.error('Error deleting exam history:', error);
      throw new Error('Failed to delete exam history');
    }
  }
}
