import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SubjectController } from './subject.controller';
import { SubjectService } from './subject.service';
import { SubjectSchema } from './schemas/subject.schema'; // Fixed path
import { UniversityModule } from 'src/university/university.module';
import { SubjectTopicModule } from 'src/subject-topic/subject-topic.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Subject', schema: SubjectSchema }]),
    UniversityModule,
    SubjectTopicModule, // Add SubjectTopicModule to imports
  ],
  controllers: [SubjectController],
  providers: [SubjectService],
  exports: [SubjectService], // Export SubjectService if it's used in other modules
})
export class SubjectModule {}
