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
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
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
  constructor(private readonly userService: UserService) { }

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
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<UserDto> {
    return this.userService.update(id, updateUserDto).then(user => plainToInstance(UserDto, user));
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);

  }

  @Put('update-profile')
  async updateProfile(
    @Body() updateData: {
      firstName?: string;
      lastName?: string;
      username?: string;
      bio?: string;
      userId?: string;
    },
    @Headers('authorization') authHeader?: string,
  ) {
    console.log('Updating user profile:', updateData);
    
    try {
      // Extract user ID from token or use provided userId
      let userId = updateData.userId;
      
      if (!userId) {
        userId = 'current-user'; // Fallback for now
      }

      const updatedUser = await this.userService.updateUserProfile(userId, {
        firstName: updateData.firstName,
        lastName: updateData.lastName,
        username: updateData.username,
        bio: updateData.bio,
      });

      return {
        success: true,
        message: 'Profile updated successfully',
        user: updatedUser,
      };
    } catch (error) {
      console.error('Error updating profile:', error);
      throw new Error('Failed to update user profile');
    }
  }

  @Post('upload-avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Body('userId') userId: string,
    @Headers('authorization') authHeader?: string,
  ) {
    console.log('Uploading avatar for user:', userId);
    
    try {
      if (!file) {
        throw new Error('No file provided');
      }

      // Upload file to your storage service
      const avatarUrl = await this.userService.uploadUserAvatar(userId, file);

      return {
        success: true,
        message: 'Avatar uploaded successfully',
        avatarUrl,
      };
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw new Error('Failed to upload avatar');
    }
  }
}
