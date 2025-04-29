import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SubjectTopic } from './schemas/subject-topic.schema';

@Injectable()
export class SubjectTopicService {
  constructor(@InjectModel('SubjectTopic') private readonly subjectTopicModel: Model<SubjectTopic>) {}

  async createSubjectTopic(subjectId: string, name: string): Promise<SubjectTopic> {
    const subjectTopic = new this.subjectTopicModel({ subject: subjectId, name });
    return subjectTopic.save();
  }

  async getTopicsBySubject(subjectId: string): Promise<SubjectTopic[]> {
    return this.subjectTopicModel.find({ subject: subjectId }).exec();
  }

  async deleteSubjectTopic(id: string): Promise<SubjectTopic | null> {
    return this.subjectTopicModel.findByIdAndDelete(id).exec();
  }
}
