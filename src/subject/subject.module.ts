import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SubjectController } from './subject.controller';
import { SubjectService } from './subject.service';
import { SubjectSchema } from './schemas/subject.schema'; // Fixed path

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Subject', schema: SubjectSchema }])],
  controllers: [SubjectController],
  providers: [SubjectService],
})
export class SubjectModule {}