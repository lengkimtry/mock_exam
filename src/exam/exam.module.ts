import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExamController } from './exam.controller';
import { ExamService } from './exam.service';
import { ExamSchema } from './schemas/exam.schema';
import { ExerciseModule } from '../exercise/exercise.module'; // Import ExerciseModule

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Exam', schema: ExamSchema }]), // Register ExamModel
    ExerciseModule, // Import ExerciseModule to make ExerciseModel available
  ],
  controllers: [ExamController],
  providers: [ExamService],
  exports: [ExamService],
})
export class ExamModule {}