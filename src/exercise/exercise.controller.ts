import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { ExerciseService } from './exercise.service';

@Controller('exercise')
export class ExerciseController {
  constructor(private readonly exerciseService: ExerciseService) {}

  @Post()
  async createExercise(
    @Body()
    body: {
      universityId: string;
      subjectId: string;
      examId?: string;
      description: string;
      formula: string;
      difficultyLevel: string;
      options: { description: string; isCorrect: boolean }[];
    },
  ) {
    // Pass universityId and subjectId to the service
    const exercise = await this.exerciseService.createExercise(
      body.universityId,
      body.subjectId,
      body.examId,
      body.description,
      body.formula,
      body.difficultyLevel,
    );

    // Add options to the exercise
    for (const option of body.options) {
      await this.exerciseService.addOptionToExercise(
        exercise.id,
        option.description,
        option.isCorrect,
      );
    }

    return exercise;
  }

  @Get(':examId')
  async getExercisesByExam(@Param('examId') examId: string) {
    return this.exerciseService.getExercisesByExam(examId);
  }

  @Get('university/:universityId/subject/:subjectId/random')
  async getRandomExercisesByUniversityAndSubject(
    @Param('universityId') universityId: string,
    @Param('subjectId') subjectId: string,
    @Query('limit') limit?: string,
  ) {
    console.log('=== CONTROLLER: getRandomExercisesByUniversityAndSubject ===');
    console.log('Request params:', { universityId, subjectId, limit });

    // Validate parameters
    if (!universityId || !subjectId) {
      throw new Error('Both universityId and subjectId are required');
    }

    const exerciseLimit = limit ? parseInt(limit) : 10;

    if (isNaN(exerciseLimit) || exerciseLimit < 1 || exerciseLimit > 50) {
      throw new Error('Limit must be a number between 1 and 50');
    }

    console.log('Validated params:', { universityId, subjectId, exerciseLimit });

    try {
      const result = await this.exerciseService.getRandomExercisesByUniversityAndSubject(
        universityId,
        subjectId,
        exerciseLimit,
      );

      console.log(`=== CONTROLLER: Returning ${result.length} exercises ===`);
      return result;
    } catch (error) {
      console.error('=== CONTROLLER ERROR ===', error);
      throw error;
    }
  }

  @Get(':exerciseId/options')
  async getExerciseWithOptions(@Param('exerciseId') exerciseId: string) {
    return this.exerciseService.getExerciseWithOptions(exerciseId);
  }

  @Get('subject/:subjectId')
  async getExercisesBySubject(@Param('subjectId') subjectId: string) {
    return this.exerciseService.getExercisesBySubject(subjectId);
  }
}
