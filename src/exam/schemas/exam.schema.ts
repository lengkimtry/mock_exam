import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Subject } from '../../subject/schemas/subject.schema'; // Fixed path

export type DifficultyLevel = 'Hard' | 'Medium' | 'Easy'; // Define enum values

@Schema({ timestamps: true })
export class Exam extends Document {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'Subject', required: true })
  subject: Types.ObjectId;

  @Prop({ type: String, enum: ['Hard', 'Medium', 'Easy'], required: true }) // Define enum for difficultyLevel
  difficultyLevel: DifficultyLevel;
}

export const ExamSchema = SchemaFactory.createForClass(Exam);
