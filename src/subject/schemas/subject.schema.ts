import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Subject extends Document {
  @Prop({ required: true }) // Remove the unique constraint from the name field
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'University', required: true }) // Ensure universityId is required
  universityId: Types.ObjectId;
}

export const SubjectSchema = SchemaFactory.createForClass(Subject);

// Add a compound unique index for name and universityId
SubjectSchema.index({ name: 1, universityId: 1 }, { unique: true });