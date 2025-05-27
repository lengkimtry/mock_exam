import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose'; // Import Types for ObjectId
import { Exam } from './schemas/exam.schema';
import { Exercise } from '../exercise/schemas/exercise.schema';

@Injectable()
export class ExamService {
  [x: string]: any;
  constructor(
    @InjectModel('Exam') private readonly examModel: Model<Exam>, // Inject ExamModel
    @InjectModel('Exercise') private readonly exerciseModel: Model<Exercise>, // Inject ExerciseModel
  ) {}

  async createExam(
    name: string,
    subjectId: string,
    difficultyLevel: string,
  ): Promise<Exam> {
    // Check if an exam with the same name already exists
    const existingExam = await this.examModel.findOne({ name }).exec();
    if (existingExam) {
      throw new Error(`An exam with the name "${name}" already exists.`);
    }

    // Validate and convert subjectId to ObjectId
    if (!Types.ObjectId.isValid(subjectId)) {
      throw new Error(`Invalid subjectId: ${subjectId}`);
    }
    const subjectObjectId = new Types.ObjectId(subjectId);

    // Create the exam
    const exam = new this.examModel({
      name,
      subject: subjectObjectId,
      difficultyLevel,
    });
    return exam.save();
  }

  async getAllExams(): Promise<Exam[]> {
    return this.examModel.find().populate('subject').exec();
  }

  async getExamById(id: string): Promise<Exam | null> {
    return this.examModel.findById(id).populate('subject').exec();
  }

  async getExercisesForExam(examId: string): Promise<Exercise[]> {
    return this.exerciseModel.find({ exam: examId }).exec(); // Fetch exercises for the given exam
  }

  async updateExam(
    id: string,
    updateData: Partial<Exam>,
  ): Promise<Exam | null> {
    return this.examModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
  }

  async deleteExam(id: string): Promise<Exam | null> {
    return this.examModel.findByIdAndDelete(id).exec();
  }

  async getExamsByYear(subjectId: string): Promise<Exam[]> {
    // Example: Fetch exams for the subject and sort by year (assuming a "year" field exists)
    return this.examModel
      .find({ subject: subjectId })
      .sort({ year: -1 })
      .exec();
  }

  async getExamsBySubject(subjectId: string): Promise<Exam[]> {
    return this.examModel.find({ subject: subjectId }).exec(); // Fetch exams by subject
  }

  async getRandomExercises(subjectId: string): Promise<Exercise[]> {
    // Example: Randomly fetch exercises for the subject
    return this.exerciseModel.aggregate([
      { $match: { subject: subjectId } },
      { $sample: { size: 10 } }, // Randomly select 10 exercises
    ]);
  }

  async getRandomExercisesByUniversityAndSubject(
    universityId: string,
    subjectId: string,
  ): Promise<Exercise[]> {
    // Fetch random exercises for the given university and subject
    return this.exerciseModel.aggregate([
      { $match: { university: universityId, subject: subjectId } }, // Match university and subject
      { $sample: { size: 10 } }, // Randomly select 10 exercises
    ]);
  }
}
