import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { ExerciseOptionService } from './exercise-option.service';

@Controller('exercise-option')
export class ExerciseOptionController {
  constructor(private readonly exerciseOptionService: ExerciseOptionService) {}

  @Post()
  async createOption(
    @Body()
    body: {
      exerciseId: string;
      description: string;
      isCorrect: boolean;
    },
  ) {
    return this.exerciseOptionService.createOption(
      body.exerciseId,
      body.description,
      body.isCorrect,
    );
  }

  @Get(':exerciseId')
  async getOptionsByExercise(@Param('exerciseId') exerciseId: string) {
    return this.exerciseOptionService.getOptionsByExercise(exerciseId);
  }
}
