import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// Define the option schema as a subdocument
@Schema({ _id: false })
export class ExerciseOption {
  @Prop({ required: true })
  description: string;

  @Prop({ required: true, default: false })
  isCorrect: boolean;
}

const ExerciseOptionSchema = SchemaFactory.createForClass(ExerciseOption);

@Schema({ timestamps: true })
export class Exercise extends Document {
  @Prop({ type: Types.ObjectId, ref: 'University', required: true })
  university: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Subject', required: true })
  subject: Types.ObjectId;

  @Prop({ required: true })
  description: string;

  @Prop()
  formula: string;

  @Prop({ enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' })
  difficultyLevel: string;

  @Prop({ type: [ExerciseOptionSchema], default: [] })
  options: ExerciseOption[];
}

export const ExerciseSchema = SchemaFactory.createForClass(Exercise);
