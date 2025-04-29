import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Subject } from '../../subject/schemas/subject.schema';

@Schema({ timestamps: true })
export class SubjectTopic extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Subject', required: true })
  subject: Subject;

  @Prop({ required: true })
  name: string; // Topic name (e.g., "Limit")
}

export const SubjectTopicSchema = SchemaFactory.createForClass(SubjectTopic);
