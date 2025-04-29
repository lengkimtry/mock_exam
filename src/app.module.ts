import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth/auth.service';
import { AuthModule } from './auth/auth.module';
import { UniversityModule } from './university/university.module';
import { SubjectModule } from './subject/subject.module'; // Import SubjectModule
import { ExamModule } from './exam/exam.module';
import { UserExamModule } from './user-exam/user-exam.module';
import { ExerciseModule } from './exercise/exercise.module';
import { ExerciseOptionModule } from './exercise-option/exercise-option.module';
import { SubjectTopicModule } from './subject-topic/subject-topic.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env'],
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://localhost:27017/mock-exam-db'), // Ensure MongoDB connection is established
    AuthModule, // Ensure AuthModule is imported
    UserModule, // Import UserModule to ensure UserModel is available
    UniversityModule, // Ensure this is imported
    SubjectModule, // Ensure SubjectModule is imported
    ExamModule,
    UserExamModule,
    ExerciseModule,
    ExerciseOptionModule,
    SubjectTopicModule, // Add SubjectTopicModule
  ],
  controllers: [AppController],
  providers: [AppService, AuthService],
})
export class AppModule {}