// filepath: /home/kimtry/Documents/mock-exam-backend/src/user/schemas/user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Role } from 'src/enums/role.enum';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  // @Prop({ required: true, unique: true })
  // email: string;

  @Prop({ required: true, unique: true })
  username: string;

  // @Prop({ required: true })
  // password: string;
  @Prop()
  email: string;

  @Prop()
  password: string;

  @Prop()
  bio: string;
  @Prop({ name: 'date_of_birth', type: 'date', nullable: true })
  dateOfBirth: Date;

  @Prop({ name: 'is_active', default: true })
  isActive: boolean;

  @Prop({ enum: Role, required: true, default: Role.USER }) // Define the enum explicitly
  role: Role;

  @Prop({ name: 'refresh_token', nullable: true }) // Store refresh token
  refreshToken?: string;
  
  @Prop({ name: 'access_token', nullable: true })
  accessToken?: string;
  labels: any;
}

export const UserSchema = SchemaFactory.createForClass(User);