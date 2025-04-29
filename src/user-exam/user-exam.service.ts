import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserExam } from './schemas/user-exam.schema';
import { Exercise } from 'src/exercise/schemas/exercise.schema';

@Injectable()
export class UserExamService {
  constructor(@InjectModel('UserExam') private readonly userExamModel: Model<UserExam>) {}

  async startExam(userId: string, examId: string): Promise<UserExam> {
    const userExam = new this.userExamModel({ user: userId, exam: examId, score: 0, timeSpent: 0 });
    return userExam.save();
  }

  async startMockExam(userId: string, exercises: Exercise[]): Promise<UserExam> {
    // Create a new user exam with the selected exercises
    const userExam = new this.userExamModel({
      user: userId,
      exercises: exercises.map(exercise => exercise._id),
      score: 0, // Initialize score
      timeSpent: 0, // Initialize timeSpent
      createdAt: new Date(),
    });
    return userExam.save();
  }

  async submitExam(userExamId: string, score: number, timeSpent: number): Promise<UserExam | null> {
    return this.userExamModel.findByIdAndUpdate(userExamId, { score, timeSpent }, { new: true }).exec();
  }

  async getUserExamResults(userId: string): Promise<UserExam[]> {
    return this.userExamModel.find({ user: userId }).populate('exam').exec();
  }
}
