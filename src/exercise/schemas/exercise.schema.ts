import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Exam } from '../../exam/schemas/exam.schema';

@Schema({ timestamps: true })
export class Exercise extends Document {
  @Prop({ type: Types.ObjectId, ref: 'University', required: true }) // Ensure university is required
  university: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Subject', required: true }) // Ensure subject is required
  subject: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Exam', required: false }) // Make exam optional
  exam?: Types.ObjectId;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  formula: string;

  @Prop({ type: String, enum: ['Hard', 'Medium', 'Easy'], required: true })
  difficultyLevel: string;
}

export const ExerciseSchema = SchemaFactory.createForClass(Exercise);
