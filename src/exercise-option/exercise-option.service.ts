import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ExerciseOption } from './schemas/exercise-option.schema';

@Injectable()
export class ExerciseOptionService {
  constructor(@InjectModel('ExerciseOption') private readonly exerciseOptionModel: Model<ExerciseOption>) {}

  async createOption(exerciseId: string, description: string, isCorrect: boolean): Promise<ExerciseOption> {
    const option = new this.exerciseOptionModel({ exercise: exerciseId, description, isCorrect });
    return option.save();
  }

  async getOptionsByExercise(exerciseId: string): Promise<ExerciseOption[]> {
    return this.exerciseOptionModel.find({ exercise: exerciseId }).exec();
  }
}
