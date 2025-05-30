import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class University extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  title: string;

  @Prop()
  image: string;

  @Prop({ default: 0 })
  numberOfSubjects: number;

  @Prop({ required: false })
  imageSrc?: string;
}

export const UniversitySchema = SchemaFactory.createForClass(University);
