import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExerciseOptionController } from './exercise-option.controller';
import { ExerciseOptionService } from './exercise-option.service';
import { ExerciseOptionSchema } from './schemas/exercise-option.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'ExerciseOption', schema: ExerciseOptionSchema }]),
  ],
  controllers: [ExerciseOptionController],
  providers: [ExerciseOptionService],
  exports: [ExerciseOptionService], // Export ExerciseOptionService
})
export class ExerciseOptionModule {}
