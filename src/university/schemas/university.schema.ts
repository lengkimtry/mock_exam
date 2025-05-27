import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class University extends Document {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  title: string; // Changed from 'description' to 'title'


  @Prop({ required: true })
  imageSrc: string;

// New property to store the university image as a URL or base64 string

  @Prop({ required: true, default: 0 })
  numberOfSubjects: number; // New property to store the number of subjects
}

export const UniversitySchema = SchemaFactory.createForClass(University);
