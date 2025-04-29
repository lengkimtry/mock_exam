import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { ExerciseService } from './exercise.service';

@Controller('exercise')
export class ExerciseController {
  constructor(private readonly exerciseService: ExerciseService) {}

  @Post()
  async createExercise(@Body() body: { 
    universityId: string; 
    subjectId: string; 
    examId?: string; 
    description: string; 
    formula: string; 
    difficultyLevel: string; 
    options: { description: string; isCorrect: boolean }[]; 
  }) {
    // Pass universityId and subjectId to the service
    const exercise = await this.exerciseService.createExercise(
      body.universityId,
      body.subjectId,
      body.examId,
      body.description,
      body.formula,
      body.difficultyLevel
    );

    // Add options to the exercise
    for (const option of body.options) {
      await this.exerciseService.addOptionToExercise(exercise.id, option.description, option.isCorrect);
    }

    return exercise;
  }

  @Get(':examId')
  async getExercisesByExam(@Param('examId') examId: string) {
    return this.exerciseService.getExercisesByExam(examId);
  }
}
