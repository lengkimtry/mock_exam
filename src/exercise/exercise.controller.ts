import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { ExerciseService } from './exercise.service';

@Controller('exercise')
export class ExerciseController {
  constructor(private readonly exerciseService: ExerciseService) {}

  // GET all exercises
  @Get()
  async getAllExercises() {
    console.log('=== Fetching All Exercises ===');
    try {
      const exercises = await this.exerciseService.getAllExercises();
      console.log(`Found ${exercises.length} exercises`);
      return exercises;
    } catch (error) {
      console.error('Error fetching all exercises:', error);
      throw error;
    }
  }

  // GET exercise by ID
  @Get(':id')
  async getExerciseById(@Param('id') id: string) {
    console.log(`=== Fetching Exercise by ID: ${id} ===`);
    try {
      const exercise = await this.exerciseService.getExerciseById(id);
      if (!exercise) {
        throw new BadRequestException('Exercise not found');
      }
      return exercise;
    } catch (error) {
      console.error('Error fetching exercise by ID:', error);
      throw error;
    }
  }

  // POST create new exercise
  @Post()
  async createExercise(@Body() createExerciseDto: any) {
    console.log('=== Creating Exercise ===');
    console.log('Request body:', JSON.stringify(createExerciseDto, null, 2));

    // Handle both field name formats
    const universityId =
      createExerciseDto.university || createExerciseDto.universityId;
    const subjectId = createExerciseDto.subject || createExerciseDto.subjectId;

    // Validate required fields
    if (!universityId || !subjectId) {
      throw new BadRequestException(
        'university/universityId and subject/subjectId are required',
      );
    }

    if (!createExerciseDto.description) {
      throw new BadRequestException('description is required');
    }

    if (
      !createExerciseDto.options ||
      !Array.isArray(createExerciseDto.options)
    ) {
      throw new BadRequestException('options array is required');
    }

    if (createExerciseDto.options.length === 0) {
      throw new BadRequestException('At least one option is required');
    }

    try {
      const exercise =
        await this.exerciseService.createExercise(createExerciseDto);
      console.log('=== Exercise Created Successfully ===');
      console.log(
        `Created exercise with ${exercise.options?.length || 0} options`,
      );
      return exercise;
    } catch (error) {
      console.error('Error in exercise controller:', error);
      throw new BadRequestException(error.message);
    }
  }

  // PUT update exercise
  @Put(':id')
  async updateExercise(@Param('id') id: string, @Body() updateData: any) {
    console.log(`=== Updating Exercise: ${id} ===`);
    try {
      const exercise = await this.exerciseService.updateExercise(id, updateData);
      if (!exercise) {
        throw new BadRequestException('Exercise not found');
      }
      console.log('Exercise updated successfully');
      return exercise;
    } catch (error) {
      console.error('Error updating exercise:', error);
      throw new BadRequestException(error.message);
    }
  }

  // DELETE exercise
  @Delete(':id')
  async deleteExercise(@Param('id') id: string) {
    console.log(`=== Deleting Exercise: ${id} ===`);
    try {
      const exercise = await this.exerciseService.deleteExercise(id);
      if (!exercise) {
        throw new BadRequestException('Exercise not found');
      }
      console.log('Exercise deleted successfully');
      return { message: 'Exercise deleted successfully', exercise };
    } catch (error) {
      console.error('Error deleting exercise:', error);
      throw new BadRequestException(error.message);
    }
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
    const exerciseLimit = limit ? parseInt(limit) : 10;

    console.log(`=== Fetching Random Exercises ===`);
    console.log(
      `University: ${universityId}, Subject: ${subjectId}, Limit: ${exerciseLimit}`,
    );
    console.log(`Request timestamp: ${new Date().toISOString()}`);

    try {
      // Use the randomized method for better variety
      const exercises = await this.exerciseService.getRandomizedExercises(
        universityId,
        subjectId,
        exerciseLimit,
      );

      console.log(`=== API Response ===`);
      console.log(`Returning ${exercises.length} randomized exercises`);

      return exercises;
    } catch (error) {
      console.error('Error in controller:', error);
      throw error;
    }
  }

  @Get(':exerciseId/options')
  async getExerciseWithOptions(@Param('exerciseId') exerciseId: string) {
    return this.exerciseService.getExerciseWithOptions(exerciseId);
  }

  @Get('subject/:subjectId')
  async getExercisesBySubject(
    @Param('subjectId') subjectId: string,
    @Query('limit') limit?: string,
  ) {
    const exerciseLimit = limit ? parseInt(limit) : 10;

    console.log(`=== Fetching Exercises by Subject: ${subjectId} ===`);
    console.log(`Limit: ${exerciseLimit}, Timestamp: ${new Date().toISOString()}`);

    try {
      const exercises = await this.exerciseService.getExercisesBySubject(
        subjectId,
        exerciseLimit,
      );
      console.log(`=== Returning ${exercises.length} exercises ===`);
      return exercises;
    } catch (error) {
      console.error('Error fetching exercises by subject:', error);
      throw error;
    }
  }
}
