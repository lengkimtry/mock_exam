import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Topic extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'Subject', required: true }) // Reference to the subject
  subjectId: Types.ObjectId;
}

export const TopicSchema = SchemaFactory.createForClass(Topic);
