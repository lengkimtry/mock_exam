import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Exercise } from '../../exercise/schemas/exercise.schema';

@Schema({ timestamps: true })
export class ExerciseOption extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Exercise', required: true })
  exercise: Exercise;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  isCorrect: boolean;
}

export const ExerciseOptionSchema = SchemaFactory.createForClass(ExerciseOption);
