import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Exercise } from './schemas/exercise.schema';
import { ExerciseOptionService } from '../exercise-option/exercise-option.service'; // Import ExerciseOptionService

@Injectable()
export class ExerciseService {
  [x: string]: any;
  constructor(
    @InjectModel('Exercise') private readonly exerciseModel: Model<Exercise>,
    private readonly exerciseOptionService: ExerciseOptionService, // Inject ExerciseOptionService
  ) {}

  async createExercise(
    universityId: string,
    subjectId: string,
    examId: string | undefined,
    description: string,
    formula: string,
    difficultyLevel: string,
  ): Promise<Exercise> {
    console.log('Creating exercise with:', {
      universityId,
      subjectId,
      examId,
      description,
      formula,
      difficultyLevel,
    });

    const universityObjectId = new Types.ObjectId(universityId);
    const subjectObjectId = new Types.ObjectId(subjectId);

    const exercise = new this.exerciseModel({
      university: universityObjectId,
      subject: subjectObjectId,
      exam: examId ? new Types.ObjectId(examId) : undefined,
      description,
      formula,
      difficultyLevel,
    });

    return exercise.save();
  }

  async getExercisesByExam(examId: string) {
    return this.exerciseModel.find({ examId }).exec(); // Ensure it filters by examId
  }

  async addOptionToExercise(
    exerciseId: string,
    description: string,
    isCorrect: boolean,
  ) {
    // Use ExerciseOptionService to create an option for the exercise
    return this.exerciseOptionService.createOption(
      exerciseId,
      description,
      isCorrect,
    );
  }

  async getRandomExercisesByUniversityAndSubject(
    universityId: string,
    subjectId: string,
    limit: number = 10,
  ): Promise<Exercise[]> {
    console.log(
      '=== BACKEND getRandomExercisesByUniversityAndSubject DEBUG START ===',
    );
    console.log('Fetching random exercises for:', {
      universityId,
      subjectId,
      limit,
    });

    try {
      // Validate ObjectIds
      if (!Types.ObjectId.isValid(universityId)) {
        throw new Error(`Invalid universityId: ${universityId}`);
      }
      if (!Types.ObjectId.isValid(subjectId)) {
        throw new Error(`Invalid subjectId: ${subjectId}`);
      }

      const universityObjectId = new Types.ObjectId(universityId);
      const subjectObjectId = new Types.ObjectId(subjectId);

      // First check if we have any exercises for this specific subject
      const totalExercisesForSubject = await this.exerciseModel.countDocuments({
        university: universityObjectId,
        subject: subjectObjectId,
      });

      console.log(`Total exercises found for subject ${subjectId}: ${totalExercisesForSubject}`);

      if (totalExercisesForSubject === 0) {
        console.error('No exercises found for this specific subject');
        
        // Debug: Check what subjects have exercises for this university
        const exercisesGroupedBySubject = await this.exerciseModel.aggregate([
          { $match: { university: universityObjectId } },
          { $group: { _id: '$subject', count: { $sum: 1 } } },
        ]);
        console.log('Exercises grouped by subject for this university:', exercisesGroupedBySubject);
        
        throw new Error(`No exercises found for subject ${subjectId} in university ${universityId}`);
      }

      // Check exercise options for this subject
      const optionsCollection = this.exerciseModel.db.collection('exerciseoptions');
      
      // Find exercises for this subject that have options
      const exercisesWithOptionsCount = await this.exerciseModel.aggregate([
        {
          $match: {
            university: universityObjectId,
            subject: subjectObjectId,
          },
        },
        {
          $lookup: {
            from: 'exerciseoptions',
            localField: '_id',
            foreignField: 'exercise',
            as: 'options',
          },
        },
        {
          $match: {
            'options.0': { $exists: true },
          },
        },
        { $count: 'total' },
      ]);

      const exercisesWithOptions = exercisesWithOptionsCount[0]?.total || 0;
      console.log(`Exercises with options for subject ${subjectId}: ${exercisesWithOptions}`);

      if (exercisesWithOptions === 0) {
        console.warn('No exercises with options found for this subject');
        
        // Debug: Show sample exercises for this subject
        const sampleExercises = await this.exerciseModel.find({
          university: universityObjectId,
          subject: subjectObjectId,
        }).limit(3);
        console.log('Sample exercises for this subject:', JSON.stringify(sampleExercises, null, 2));
        
        // Check if these exercises have options
        for (const exercise of sampleExercises) {
          const options = await optionsCollection.find({ exercise: exercise._id }).toArray();
          console.log(`Options for exercise ${exercise._id}:`, options);
        }
      }

      // Main aggregation query - ensure we only get exercises for the specific subject
      const exercises = await this.exerciseModel.aggregate([
        {
          $match: {
            university: universityObjectId,
            subject: subjectObjectId, // This ensures we only get exercises for this specific subject
          },
        },
        {
          $lookup: {
            from: 'exerciseoptions',
            localField: '_id',
            foreignField: 'exercise',
            as: 'options',
          },
        },
        {
          $match: {
            'options.0': { $exists: true }, // Only exercises with options
          },
        },
        { $sample: { size: limit } }, // Random selection
      ]);

      console.log('=== FINAL AGGREGATION RESULT ===');
      console.log('Found exercises with options:', exercises.length);
      
      // Verify each exercise belongs to the correct subject
      exercises.forEach((exercise, index) => {
        console.log(`Exercise ${index + 1}:`);
        console.log(`  - ID: ${exercise._id}`);
        console.log(`  - Subject: ${exercise.subject} (should match ${subjectObjectId})`);
        console.log(`  - University: ${exercise.university} (should match ${universityObjectId})`);
        console.log(`  - Options count: ${exercise.options?.length || 0}`);
        console.log(`  - Subject matches: ${exercise.subject.toString() === subjectObjectId.toString()}`);
      });

      if (exercises.length === 0) {
        console.warn('No exercises with options found after aggregation, creating subject-specific mock data');
        
        // Return subject-specific mock data as fallback
        const mockExercises = Array.from({ length: Math.min(limit, 5) }, (_, index) => ({
          _id: `mock_${subjectId}_${index + 1}`,
          description: `Mock Question ${index + 1} for Subject ${subjectId}: Sample math problem for this specific subject`,
          university: universityObjectId,
          subject: subjectObjectId,
          formula: `x + y = ${index + 1}`,
          difficultyLevel: 'easy',
          options: [
            { _id: `opt_a_${subjectId}_${index}`, description: `Option A for subject ${subjectId} question ${index + 1}`, isCorrect: false },
            { _id: `opt_b_${subjectId}_${index}`, description: `Option B for subject ${subjectId} question ${index + 1}`, isCorrect: true },
            { _id: `opt_c_${subjectId}_${index}`, description: `Option C for subject ${subjectId} question ${index + 1}`, isCorrect: false },
            { _id: `opt_d_${subjectId}_${index}`, description: `Option D for subject ${subjectId} question ${index + 1}`, isCorrect: false },
          ],
        }));
        
        console.log('=== RETURNING SUBJECT-SPECIFIC MOCK DATA ===');
        console.log('Mock exercises with subject ID:', JSON.stringify(mockExercises, null, 2));
        return mockExercises as unknown as Exercise[];
      }

      console.log('=== BACKEND DEBUG END ===');
      return exercises;
    } catch (error) {
      console.error('=== BACKEND ERROR ===');
      console.error('Error fetching exercises:', error);
      console.error('Error stack:', error.stack);
      throw new Error(`Failed to fetch exercises for subject ${subjectId}: ${error.message}`);
    }
  }

  async getExerciseWithOptions(exerciseId: string): Promise<Exercise> {
    try {
      const exercise = await this.exerciseModel.aggregate([
        { $match: { _id: new Types.ObjectId(exerciseId) } },
        {
          $lookup: {
            from: 'exerciseoptions',
            localField: '_id',
            foreignField: 'exercise',
            as: 'options',
          },
        },
      ]);

      return exercise[0];
    } catch (error) {
      console.error('Error fetching exercise with options:', error);
      throw new Error('Failed to fetch exercise with options.');
    }
  }

  async getExercisesBySubject(subjectId: string): Promise<Exercise[]> {
    try {
      return await this.exerciseModel.aggregate([
        { $match: { subject: new Types.ObjectId(subjectId) } },
        {
          $lookup: {
            from: 'exerciseoptions',
            localField: '_id',
            foreignField: 'exercise',
            as: 'options',
          },
        },
      ]);
    } catch (error) {
      console.error('Error fetching exercises by subject:', error);
      throw new Error('Failed to fetch exercises by subject.');
    }
  }
}
