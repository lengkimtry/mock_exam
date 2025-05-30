// university.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { University } from './schemas/university.schema';
import { CreateUniversityDto } from './dto/create-university.dto';

@Injectable()
export class UniversityService {
  constructor(
    @InjectModel(University.name)
    private universityModel: Model<University>,
  ) {}

  async createUniversity(
    createUniversityDto: CreateUniversityDto,
  ): Promise<University> {
    try {
      const created = new this.universityModel({
        ...createUniversityDto,
        title: createUniversityDto.title || createUniversityDto.name,
        numberOfSubjects: createUniversityDto.numberOfSubjects || 0,
      });
      return await created.save();
    } catch (error) {
      console.error('Error creating university:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to create university: ${error.message}`);
      }
      throw new Error('Failed to create university due to an unknown error');
    }
  }

  async getAllUniversities(): Promise<University[]> {
    return this.universityModel.find().exec();
  }

  async getUniversityById(id: string): Promise<University> {
    const university = await this.universityModel.findById(id).exec();
    if (!university) {
      throw new Error(`University with id ${id} not found`);
    }
    return university;
  }

  async updateUniversity(
    id: string,
    updateData: Partial<University>,
  ): Promise<University> {
    const updatedUniversity = await this.universityModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
    if (!updatedUniversity) {
      throw new Error(`University with id ${id} not found`);
    }
    return updatedUniversity;
  }

  async deleteUniversity(id: string): Promise<University> {
    const deletedUniversity = await this.universityModel
      .findByIdAndDelete(id)
      .exec();
    if (!deletedUniversity) {
      throw new Error(`University with id ${id} not found`);
    }
    return deletedUniversity;
  }
}
