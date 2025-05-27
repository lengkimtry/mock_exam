import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Subject } from './schemas/subject.schema';
import { SubjectTopic } from 'src/subject-topic/schemas/subject-topic.schema';

@Injectable()
export class SubjectService {
  constructor(
    @InjectModel('Subject') private readonly subjectModel: Model<Subject>,
    @InjectModel('SubjectTopic')
    private readonly topicModel: Model<SubjectTopic>,
  ) {}

  async createSubject(data: {
    name: string;
    universityId: string;
    questionCount: number;
    duration: number;
    imageSRC?: string;
  }): Promise<Subject> {
    const { name, universityId, questionCount, duration, imageSRC } = data;

    console.log('Creating subject with:', data);

    try {
      const universityObjectId = new Types.ObjectId(universityId);

      const subject = new this.subjectModel({
        name,
        universityId: universityObjectId,
        questionCount,
        duration,
        imageSRC, // Store as imageSRC in database
      });

      return await subject.save();
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code?: number }).code === 11000
      ) {
        throw new Error(
          `A subject with the name "${name}" already exists for this university.`,
        );
      }
      throw error;
    }
  }

  async getAllSubjects(): Promise<Subject[]> {
    return this.subjectModel.find().populate('universityId').exec();
  }

  async getSubjectById(id: string): Promise<Subject | null> {
    return this.subjectModel.findById(id).populate('universityId').exec();
  }

  async updateSubject(
    id: string,
    updateData: Partial<Subject>,
  ): Promise<Subject | null> {
    return this.subjectModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
  }

  async deleteSubject(id: string): Promise<Subject | null> {
    return this.subjectModel.findByIdAndDelete(id).exec();
  }

  async getSubjectsByUniversity(universityId: string): Promise<Subject[]> {
    return this.subjectModel
      .find({ universityId: new Types.ObjectId(universityId) })
      .exec();
  }

  async findTopicBySubjectAndUniversity(
    universityId: string,
    subjectName: string,
    topicName: string,
  ): Promise<SubjectTopic> {
    console.log('Finding topic with:', {
      universityId,
      subjectName,
      topicName,
    });

    const subject = await this.subjectModel
      .findOne({
        name: subjectName,
        universityId: new Types.ObjectId(universityId),
      })
      .exec();

    if (!subject) {
      throw new Error(
        `Subject "${subjectName}" not found for the specified university.`,
      );
    }

    const topic = await this.topicModel
      .findOne({
        name: topicName,
        subjectId: subject._id,
      })
      .exec();

    if (!topic) {
      throw new Error(
        `Topic "${topicName}" not found in the subject "${subjectName}".`,
      );
    }

    return topic;
  }
}
