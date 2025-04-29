import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExerciseController } from './exercise.controller';
import { ExerciseService } from './exercise.service';
import { ExerciseSchema } from './schemas/exercise.schema';
import { ExerciseOptionModule } from '../exercise-option/exercise-option.module'; // Import ExerciseOptionModule

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Exercise', schema: ExerciseSchema }]),
    ExerciseOptionModule, // Add ExerciseOptionModule to imports
  ],
  controllers: [ExerciseController],
  providers: [ExerciseService],
  exports: [ExerciseService, MongooseModule], // Export ExerciseService and MongooseModule
})
export class ExerciseModule {}
