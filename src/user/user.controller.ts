import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  Put,
  Headers,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/user-update.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/enums/role.enum';
import { plainToInstance } from 'class-transformer';
import { UserDto } from './dto/user.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.USER)
  @Get()
  findAll() {
    return this.userService.findAll();
  }
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<UserDto> {
    const user = await this.userService.findOne(id);
    return plainToInstance(UserDto, user);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserDto> {
    return this.userService
      .update(id, updateUserDto)
      .then((user) => plainToInstance(UserDto, user));
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }

  @Put('update-profile')
  async updateProfile(
    @Body()
    updateData: {
      email: string;
      firstName?: string;
      lastName?: string;
      username?: string;
      bio?: string;
    },
    @Headers('authorization') _authHeader?: string,
  ) {
    console.log('Received update profile request:', updateData);

    try {
      // Validate that we have email
      if (!updateData.email || typeof updateData.email !== 'string') {
        throw new BadRequestException('Valid email is required');
      }

      // Validate other fields (optional)
      if (updateData.firstName && typeof updateData.firstName !== 'string') {
        throw new BadRequestException('Invalid firstName');
      }
      if (updateData.lastName && typeof updateData.lastName !== 'string') {
        throw new BadRequestException('Invalid lastName');
      }
      if (updateData.username && typeof updateData.username !== 'string') {
        throw new BadRequestException('Invalid username');
      }
      if (updateData.bio && typeof updateData.bio !== 'string') {
        throw new BadRequestException('Invalid bio');
      }

      // Find user by email first
      const existingUser = await this.userService.findByEmail(updateData.email);
      if (!existingUser) {
        throw new BadRequestException('User not found with provided email');
      }

      console.log('Found existing user with ID:', existingUser._id || existingUser.id);

      // Prepare update data, filtering out undefined values
      const updatePayload: {
        firstName?: string;
        lastName?: string;
        username?: string;
        bio?: string;
      } = {};
      if (updateData.firstName !== undefined) updatePayload.firstName = updateData.firstName;
      if (updateData.lastName !== undefined) updatePayload.lastName = updateData.lastName;
      if (updateData.username !== undefined) updatePayload.username = updateData.username;
      if (updateData.bio !== undefined) updatePayload.bio = updateData.bio;

      // Only update if there are actual changes
      if (Object.keys(updatePayload).length === 0) {
        return {
          success: true,
          message: 'No changes to update',
          user: plainToInstance(UserDto, existingUser),
        };
      }

      // Update user profile using existing method with user ID - this preserves the user ID and history
      const updatedUser = await this.userService.updateUserProfile(
        existingUser._id || existingUser.id,
        updatePayload,
      );

      console.log('Profile updated successfully for user ID:', existingUser._id || existingUser.id);

      // Return complete user data including all original fields
      const completeUserData = {
        ...existingUser,
        ...updatedUser,
        _id: existingUser._id,
        id: existingUser.id,
        email: existingUser.email,
      };

      return {
        success: true,
        message: 'Profile updated successfully',
        user: plainToInstance(UserDto, completeUserData),
      };
    } catch (error) {
      console.error('Error updating profile:', error.message || error);
      
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      throw new InternalServerErrorException(
        `Failed to update user profile: ${error.message || 'Unknown error'}`,
      );
    }
  }

  @Post('upload-avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Body('email') email: string,
    @Headers('authorization') _authHeader?: string,
  ) {
    console.log('Uploading avatar for user:', email);

    try {
      if (!file) {
        throw new BadRequestException('No file provided');
      }

      if (!email || typeof email !== 'string') {
        throw new BadRequestException('Valid email is required');
      }

      // Find user by email first
      const existingUser = await this.userService.findByEmail(email);
      if (!existingUser) {
        throw new BadRequestException('User not found with provided email');
      }

      console.log('Uploading avatar for user ID:', existingUser._id || existingUser.id);

      // Upload file using existing method with user ID - this preserves the user ID
      const avatarUrl = await this.userService.uploadUserAvatar(existingUser._id || existingUser.id, file);

      // Return complete user data with updated avatar
      const completeUserData = {
        ...existingUser,
        avatar: avatarUrl,
        _id: existingUser._id,
        id: existingUser.id,
      };

      return {
        success: true,
        message: 'Avatar uploaded successfully',
        avatarUrl,
        user: plainToInstance(UserDto, completeUserData),
      };
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw new InternalServerErrorException('Failed to upload avatar');
    }
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  async getUserProfile(@Headers('authorization') authHeader: string) {
    try {
      // Extract user info from token or use existing auth mechanism
      const token = authHeader?.replace('Bearer ', '');
      if (!token) {
        throw new BadRequestException('No authorization token provided');
      }

      // You'll need to implement token verification to get user ID
      // This is just a placeholder - replace with your actual token verification logic
      const userEmail = this.extractEmailFromToken(token); // Implement this method
      
      if (!userEmail) {
        throw new BadRequestException('Invalid token');
      }

      const user = await this.userService.findByEmail(userEmail);
      if (!user) {
        throw new BadRequestException('User not found');
      }

      // Get complete user data including exam history
      const completeUserData = await this.userService.findOne(user._id || user.id);
      
      return plainToInstance(UserDto, completeUserData);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw new InternalServerErrorException('Failed to fetch user profile');
    }
  }

  // Helper method to extract email from token - implement based on your JWT structure
  private extractEmailFromToken(token: string): string | null {
    try {
      // This is a placeholder - implement based on your JWT verification logic
      // You might need to inject JwtService or use your existing auth mechanism
      return null; // Replace with actual implementation
    } catch (error) {
      return null;
    }
  }
}
