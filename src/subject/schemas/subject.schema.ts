import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Subject extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'University', required: true })
  universityId: Types.ObjectId;

  @Prop({ required: true })
  questionCount: number;

  @Prop({ required: true }) // e.g., 1, 1.5, 2
  duration: number;

  @Prop()
  image?: string; // Add image field to store image URL/path

  @Prop()
  imageSRC?: string; // Add imageSRC field to store Cloudinary URL
}

export const SubjectSchema = SchemaFactory.createForClass(Subject);

// Make subject name + university unique
SubjectSchema.index({ name: 1, universityId: 1 }, { unique: true });
