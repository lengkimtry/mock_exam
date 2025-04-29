import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SubjectTopicController } from './subject-topic.controller';
import { SubjectTopicService } from './subject-topic.service';
import { SubjectTopicSchema } from './schemas/subject-topic.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'SubjectTopic', schema: SubjectTopicSchema }])],
  controllers: [SubjectTopicController],
  providers: [SubjectTopicService],
})
export class SubjectTopicModule {}
