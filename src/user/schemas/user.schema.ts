// filepath: /home/kimtry/Documents/mock-exam-backend/src/user/schemas/user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  password: string;

  @Prop()
  profilePicUrl: string;

  @Prop({ type: String })
  bio: string;

  @Prop({ type: String })
  avatar: string;

  @Prop({ type: String })
  phone: string;

  @Prop({ type: String })
  gender: string;

  @Prop({ type: String, default: 'student' })
  role: string;

  @Prop()
  refreshToken: string;

  @Prop()
  accessToken: string;

  @Prop()
  facebookId: string;
}

export const UserSchema = SchemaFactory.createForClass(User);