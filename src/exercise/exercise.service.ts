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

  async createExercise(createExerciseDto: any): Promise<Exercise> {
    try {
      console.log('Creating exercise with data:', JSON.stringify(createExerciseDto, null, 2));

      // Validate that options are provided
      if (!createExerciseDto.options || !Array.isArray(createExerciseDto.options) || createExerciseDto.options.length === 0) {
        throw new Error('Exercise must have at least one option');
      }

      // Validate that at least one option is correct
      const hasCorrectAnswer = createExerciseDto.options.some(option => option.isCorrect === true);
      if (!hasCorrectAnswer) {
        throw new Error('Exercise must have at least one correct answer');
      }

      // Handle both field name formats: university/subject OR universityId/subjectId
      const universityId = createExerciseDto.university || createExerciseDto.universityId;
      const subjectId = createExerciseDto.subject || createExerciseDto.subjectId;

      if (!universityId || !subjectId) {
        throw new Error('University and subject are required');
      }

      // Convert to ObjectIds
      const exerciseData = {
        description: createExerciseDto.description,
        formula: createExerciseDto.formula,
        difficultyLevel: createExerciseDto.difficultyLevel,
        university: new Types.ObjectId(universityId),
        subject: new Types.ObjectId(subjectId),
        options: createExerciseDto.options,
      };

      console.log('Exercise data to save:', JSON.stringify(exerciseData, null, 2));

      const exercise = new this.exerciseModel(exerciseData);
      const savedExercise = await exercise.save();
      
      console.log('Exercise saved successfully with options:', savedExercise.options?.length || 0);
      return savedExercise;
    } catch (error) {
      console.error('Error creating exercise:', error);
      throw new Error(`Failed to create exercise: ${error.message}`);
    }
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
    try {
      console.log(`Searching for exercises with universityId: ${universityId}, subjectId: ${subjectId}`);
      
      // Convert string IDs to ObjectIds for proper matching
      const universityObjectId = new Types.ObjectId(universityId);
      const subjectObjectId = new Types.ObjectId(subjectId);

      // Use MongoDB aggregation for proper randomization
      const exercises = await this.exerciseModel.aggregate([
        { 
          $match: { 
            university: universityObjectId, 
            subject: subjectObjectId 
          } 
        },
        { $sample: { size: limit } }, // MongoDB's built-in random sampling
      ]);

      console.log(`Found ${exercises.length} random exercises`);
      
      // Log each exercise's options to debug
      exercises.forEach((exercise, index) => {
        console.log(`Exercise ${index + 1}: ${exercise._id}`);
        console.log(`  Description: ${exercise.description}`);
        console.log(`  Options count: ${exercise.options?.length || 0}`);
      });

      return exercises;
    } catch (error) {
      console.error('Error fetching random exercises:', error);
      throw new Error('Failed to fetch exercises');
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

  async getExercisesBySubject(subjectId: string, limit: number = 10): Promise<Exercise[]> {
    try {
      const subjectObjectId = new Types.ObjectId(subjectId);
      
      // Use aggregation for random sampling by subject only
      const exercises = await this.exerciseModel.aggregate([
        { $match: { subject: subjectObjectId } },
        { $sample: { size: limit } },
      ]);
      
      console.log(`Found ${exercises.length} random exercises for subject ${subjectId}`);
      return exercises;
    } catch (error) {
      console.error('Error fetching exercises by subject:', error);
      throw new Error('Failed to fetch exercises by subject');
    }
  }

  // Add a new method for shuffling exercise options
  async getRandomizedExercises(
    universityId: string,
    subjectId: string,
    limit: number = 10,
  ): Promise<Exercise[]> {
    try {
      // Get random exercises
      const exercises = await this.getRandomExercisesByUniversityAndSubject(
        universityId,
        subjectId,
        limit,
      );

      // Shuffle the options within each exercise for additional randomization
      const randomizedExercises = exercises.map(exercise => {
        if (exercise.options && exercise.options.length > 0) {
          // Shuffle the options array
          const shuffledOptions = [...exercise.options].sort(() => Math.random() - 0.5);
          return {
            ...exercise,
            options: shuffledOptions,
          };
        }
        return exercise;
      });

      console.log('Exercises with shuffled options prepared');
      return randomizedExercises as Exercise[];
    } catch (error) {
      console.error('Error randomizing exercises:', error);
      throw new Error('Failed to randomize exercises');
    }
  }

  async getAllExercises(): Promise<Exercise[]> {
    try {
      const exercises = await this.exerciseModel
        .find()
        .populate('university', 'name')
        .populate('subject', 'name')
        .sort({ createdAt: -1 }) // Sort by newest first
        .exec();
      
      console.log(`Found ${exercises.length} exercises in database`);
      return exercises;
    } catch (error) {
      console.error('Error fetching all exercises:', error);
      throw new Error('Failed to fetch exercises');
    }
  }

  async getExerciseById(id: string): Promise<Exercise | null> {
    try {
      const exercise = await this.exerciseModel
        .findById(id)
        .populate('university', 'name')
        .populate('subject', 'name')
        .exec();
      
      if (exercise) {
        console.log(`Found exercise: ${exercise.description}`);
      } else {
        console.log(`Exercise with ID ${id} not found`);
      }
      
      return exercise;
    } catch (error) {
      console.error('Error fetching exercise by ID:', error);
      throw new Error('Failed to fetch exercise');
    }
  }

  async updateExercise(id: string, updateData: any): Promise<Exercise | null> {
    try {
      // Handle field name conversion if needed
      if (updateData.universityId && !updateData.university) {
        updateData.university = updateData.universityId;
        delete updateData.universityId;
      }
      if (updateData.subjectId && !updateData.subject) {
        updateData.subject = updateData.subjectId;
        delete updateData.subjectId;
      }

      const exercise = await this.exerciseModel
        .findByIdAndUpdate(id, updateData, { new: true })
        .populate('university', 'name')
        .populate('subject', 'name')
        .exec();
      
      if (exercise) {
        console.log(`Updated exercise: ${exercise.description}`);
      }
      
      return exercise;
    } catch (error) {
      console.error('Error updating exercise:', error);
      throw new Error('Failed to update exercise');
    }
  }

  async deleteExercise(id: string): Promise<Exercise | null> {
    try {
      const exercise = await this.exerciseModel
        .findByIdAndDelete(id)
        .exec();
      
      if (exercise) {
        console.log(`Deleted exercise: ${exercise.description}`);
      }
      
      return exercise;
    } catch (error) {
      console.error('Error deleting exercise:', error);
      throw new Error('Failed to delete exercise');
    }
  }
}
