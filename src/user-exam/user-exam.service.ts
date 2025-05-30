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
    // Shuffle exercises again for additional randomization
    const shuffledExercises = [...exercises].sort(() => Math.random() - 0.5);
    
    // Create a new user exam with the shuffled exercises
    const userExam = new this.userExamModel({
      user: userId,
      exercises: shuffledExercises.map(exercise => exercise._id),
      score: 0,
      timeSpent: 0,
      createdAt: new Date(),
      // Add a unique exam session identifier
      sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    });
    
    console.log(`Created mock exam for user ${userId} with ${shuffledExercises.length} randomized exercises`);
    return userExam.save();
  }

  async submitExam(userExamId: string, score: number, timeSpent: number): Promise<UserExam | null> {
    return this.userExamModel.findByIdAndUpdate(userExamId, { score, timeSpent }, { new: true }).exec();
  }

  async submitExamResults(resultsData: any): Promise<UserExam> {
    try {
      // Ensure we have a proper university name, fallback if needed
      let universityName = resultsData.universityName;
      if (!universityName || universityName === 'Unknown University' || universityName === 'Unknown') {
        universityName = 'Institute of Technology of Cambodia'; // Default fallback
      }

      const userExam = new this.userExamModel({
        user: resultsData.userId,
        score: resultsData.score,
        timeSpent: resultsData.timeSpent,
        totalQuestions: resultsData.totalQuestions,
        correctAnswers: resultsData.correctAnswers,
        subjectName: resultsData.subjectName,
        universityName: universityName,
        questionResults: resultsData.questionResults,
        completedAt: new Date(resultsData.completedAt),
        sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      });
      
      console.log(`Saving exam results for user ${resultsData.userId} with university: ${universityName}`);
      return await userExam.save();
    } catch (error) {
      console.error('Error saving exam results:', error);
      throw new Error('Failed to save exam results');
    }
  }

  async getUserExamResults(userId: string): Promise<UserExam[]> {
    return this.userExamModel.find({ user: userId }).populate('exam').exec();
  }

  async getExamHistory(userId: string): Promise<UserExam[]> {
    return this.userExamModel
      .find({ user: userId })
      .sort({ completedAt: -1, createdAt: -1 })
      .exec();
  }

  async getExamResult(userExamId: string): Promise<UserExam | null> {
    return this.userExamModel.findById(userExamId).populate('exam').exec();
  }

  async deleteExamHistory(examId: string): Promise<UserExam | null> {
    try {
      const deletedExam = await this.userExamModel.findByIdAndDelete(examId).exec();
      
      if (deletedExam) {
        console.log(`Deleted exam history: ${deletedExam.subjectName} (Score: ${deletedExam.score}%)`);
      }
      
      return deletedExam;
    } catch (error) {
      console.error('Error deleting exam history:', error);
      throw new Error('Failed to delete exam history');
    }
  }
}
