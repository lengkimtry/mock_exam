import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Exercise } from './schemas/exercise.schema';
import { ExerciseOptionService } from '../exercise-option/exercise-option.service'; // Import ExerciseOptionService

@Injectable()
export class ExerciseService {
  [x: string]: any;
  constructor(
    @InjectModel('Exercise') private readonly exerciseModel: Model<Exercise>,
    private readonly exerciseOptionService: ExerciseOptionService // Inject ExerciseOptionService
  ) {}

  async createExercise(
    universityId: string,
    subjectId: string,
    examId: string | undefined,
    description: string,
    formula: string,
    difficultyLevel: string
  ): Promise<Exercise> {
    console.log('Creating exercise with:', { universityId, subjectId, examId, description, formula, difficultyLevel });

    const universityObjectId = new Types.ObjectId(universityId);
    const subjectObjectId = new Types.ObjectId(subjectId);

    const exercise = new this.exerciseModel({
      university: universityObjectId,
      subject: subjectObjectId,
      exam: examId ? new Types.ObjectId(examId) : undefined,
      description,
      formula,
      difficultyLevel,
    });

    return exercise.save();
  }

  async getExercisesByExam(examId: string): Promise<Exercise[]> {
    return this.exerciseModel.find({ exam: examId }).exec();
  }

  async addOptionToExercise(exerciseId: string, description: string, isCorrect: boolean) {
    // Use ExerciseOptionService to create an option for the exercise
    return this.exerciseOptionService.createOption(exerciseId, description, isCorrect);
  }

  async getRandomExercisesByUniversityAndSubject(universityId: string, subjectId: string): Promise<Exercise[]> {
    console.log('Fetching random exercises for:', { universityId, subjectId });

    try {
      const exercises = await this.exerciseModel.aggregate([
        { $match: { university: new Types.ObjectId(universityId), subject: new Types.ObjectId(subjectId) } }, // Match university and subject
        { $sample: { size: 10 } }, // Randomly select 10 exercises
      ]);

      console.log('Found exercises:', exercises);
      return exercises;
    } catch (error) {
      console.error('Error fetching exercises:', error);
      throw new Error('Failed to fetch exercises.');
    }
  }
}
