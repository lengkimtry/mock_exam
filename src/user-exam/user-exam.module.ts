import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserExamController } from './user-exam.controller';
import { UserExamService } from './user-exam.service';
import { UserExamSchema } from './schemas/user-exam.schema';
import { ExamModule } from '../exam/exam.module'; // Import ExamModule
import { ExerciseModule } from '../exercise/exercise.module'; // Import ExerciseModule

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'UserExam', schema: UserExamSchema }]),
    ExamModule, // Add ExamModule to imports
    ExerciseModule, // Add ExerciseModule to imports
  ],
  controllers: [UserExamController],
  providers: [UserExamService],
  exports: [UserExamService],
})
export class UserExamModule {}