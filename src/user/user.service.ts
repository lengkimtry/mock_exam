import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/user-update.dto';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = new this.userModel(createUserDto);
    return user.save();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async remove(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const user = await this.userModel.findOne({ email }).exec();
    return user || undefined;
  }

  async updateUserProfile(
    userId: string,
    updateData: {
      firstName?: string;
      lastName?: string;
      username?: string;
      bio?: string;
      phone?: string;
      gender?: string;
    },
  ): Promise<User> {
    try {
      console.log(`Updating profile for user ${userId}:`, updateData);
      
      // Validate username uniqueness if provided
      if (updateData.username) {
        const existingUser = await this.userModel
          .findOne({ 
            username: updateData.username,
            _id: { $ne: userId } // Exclude current user
          })
          .exec();
        
        if (existingUser) {
          throw new Error('Username already exists');
        }
      }

      const updatedUser = await this.userModel
        .findByIdAndUpdate(
          userId,
          { 
            $set: {
              ...updateData,
              updatedAt: new Date(),
            }
          },
          { new: true }
        )
        .exec();

      if (!updatedUser) {
        throw new Error('User not found');
      }

      console.log('User profile updated successfully:', updatedUser._id);
      return updatedUser;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  async uploadUserAvatar(
    userId: string,
    file: Express.Multer.File,
  ): Promise<string> {
    try {
      console.log(`Uploading avatar for user ${userId}`);
      
      // Here you would implement your file upload logic
      // For now, let's create a simple file storage solution
      
      // Example using a simple file storage (you might want to use Cloudinary, AWS S3, etc.)
      const fileName = `avatar_${userId}_${Date.now()}.${file.originalname.split('.').pop()}`;
      const avatarUrl = `/uploads/avatars/${fileName}`;
      
      // Save file to local storage or cloud storage
      // This is a simplified example - implement proper file upload
      
      // Update user's avatar URL in database
      const updatedUser = await this.userModel
        .findByIdAndUpdate(
          userId,
          { 
            $set: {
              avatar: avatarUrl,
              updatedAt: new Date(),
            }
          },
          { new: true }
        )
        .exec();

      if (!updatedUser) {
        throw new Error('User not found');
      }

      console.log('Avatar uploaded successfully for user:', userId);
      return avatarUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw error;
    }
  }
}
