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
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    // Load environment variables globally
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    
    // MongoDB connection
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI') || 'mongodb://localhost:27017/mock-exam-db',
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }),
      inject: [ConfigService],
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'fallback-secret',
      signOptions: { expiresIn: process.env.ACCESS_EXPIRE || '15m' },
    }),
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