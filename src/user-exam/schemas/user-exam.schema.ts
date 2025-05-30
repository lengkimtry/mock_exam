import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../user/schemas/user.schema';
import { Exam } from '../../exam/schemas/exam.schema';

@Schema({ timestamps: true })
export class UserExam extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: User;

  @Prop({ type: Types.ObjectId, ref: 'Exam', required: false }) // Optional for mock exams
  exam: Exam;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Exercise' }], required: true })
  exercises: Types.ObjectId[];

  @Prop({ type: Number, required: true, default: 0 }) // Default score to 0
  score: number;

  @Prop({ type: Number, required: true, default: 0 }) // Default timeSpent to 0
  timeSpent: number;

  @Prop({ type: String, unique: true }) // Add unique session identifier
  sessionId: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Number })
  totalQuestions: number;

  @Prop({ type: Number })
  correctAnswers: number;

  @Prop({ type: String })
  subjectName: string;

  @Prop({ type: String })
  universityName: string;

  @Prop({ type: Array })
  questionResults: any[];

  @Prop({ type: Date })
  completedAt: Date;
}

export const UserExamSchema = SchemaFactory.createForClass(UserExam);
