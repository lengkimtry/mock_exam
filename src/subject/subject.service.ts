import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Subject } from './schemas/subject.schema';

@Injectable()
export class SubjectService {
  [x: string]: any;
  constructor(@InjectModel('Subject') private readonly subjectModel: Model<Subject>) {}

  async createSubject(name: string, universityId: string): Promise<Subject> {
    console.log('Creating subject with:', { name, universityId });

    try {
      // Convert universityId to ObjectId
      const universityObjectId = new Types.ObjectId(universityId);

      // Create the subject
      const subject = new this.subjectModel({ name, universityId: universityObjectId });
      return await subject.save();
    } catch (error) {
      if (error.code === 11000) {
        // Handle duplicate key error
        throw new Error(`A subject with the name "${name}" already exists for this university.`);
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

  async updateSubject(id: string, updateData: Partial<Subject>): Promise<Subject | null> {
    return this.subjectModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async deleteSubject(id: string): Promise<Subject | null> {
    return this.subjectModel.findByIdAndDelete(id).exec();
  }

  async getSubjectsByUniversity(universityId: string): Promise<Subject[]> {
    return this.subjectModel.find({ universityId: new Types.ObjectId(universityId) }).exec();
  }

  async findTopicBySubjectAndUniversity(universityId: string, subjectName: string, topicName: string): Promise<any> {
    console.log('Finding topic with:', { universityId, subjectName, topicName });

    // Find the subject by name and universityId
    const subject = await this.subjectModel.findOne({
      name: subjectName,
      universityId: new Types.ObjectId(universityId),
    }).exec();

    if (!subject) {
      throw new Error(`Subject "${subjectName}" not found for the specified university.`);
    }

    // Assuming topics are stored in a separate collection or embedded in the subject
    // Replace this with the actual logic to fetch topics
    const topic = await this.topicModel.findOne({
      name: topicName,
      subjectId: subject._id,
    }).exec();

    if (!topic) {
      throw new Error(`Topic "${topicName}" not found in the subject "${subjectName}".`);
    }

    return topic;
  }
}
