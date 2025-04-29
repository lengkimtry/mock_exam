import { BadRequestException, ConflictException, createParamDecorator, ExecutionContext, HttpStatus, Injectable, NotFoundException, Req, Res, UnauthorizedException } from '@nestjs/common';
import { LoginAuthDto } from './dto/login-auth.dto';
import { UserService } from 'src/user/user.service';
import * as bcrypt from "bcrypt";
import { User } from 'src/user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { GoogleDto } from './dto/google.dto';
import { FacebookDto } from './dto/facebook.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { plainToInstance } from 'class-transformer';
import { UserDto } from 'src/user/dto/user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async CreateOrSignInWithFacebook(facebookDto: FacebookDto): Promise<LoginResponseDto> {
    let user = await this.userModel.findOne({ facebookId: facebookDto.facebookId });
    if (!user) {
      user = await this.userModel.create(facebookDto);
    } else {
      await this.userModel.updateOne(
        { facebookId: facebookDto.facebookId },
        {
          firstName: facebookDto.firstName,
          lastName: facebookDto.lastName,
          accessToken: facebookDto.accessToken,
        }
      );
      user = await this.userModel.findOne({ facebookId: facebookDto.facebookId });
    }

    const userDto = plainToInstance(UserDto, user);
    const payload = { user: userDto }
    const token = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
    });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: process.env.REFRESH_EXPIRE,
      secret: process.env.REFRESH_SECRET,
    });
    await this.userModel.updateOne(
      { facebookId: facebookDto.facebookId },
      { refreshToken: refreshToken }
    );
    return new LoginResponseDto('Logged in Successfully', token, refreshToken, HttpStatus.OK, plainToInstance(UserDto, user));
  }

  async CreateOrSignInWithGoogle(googleDto: GoogleDto): Promise<LoginResponseDto> {
    let user = await this.userModel.findOne({
      where: [{ username: googleDto.email }, { email: googleDto.email }],
    });
    if (!user) {
      // Create a new user if not found
      user = await this.userModel.create(googleDto);
    } else {
      user.firstName = googleDto.firstName;
      user.lastName = googleDto.lastName;
      user.profilePicUrl = googleDto.profilePicUrl;
      // user.accessToken = googleDto.accessToken;
    }
    const userDto = plainToInstance(UserDto, user);
    const payload = { user: userDto }
    const token = this.jwtService.sign(payload, {
      expiresIn: process.env.ACCESS_EXPIRE || '3600s', // Add fallback for access token expiration
      secret: process.env.SECRET_KEY || 'default-secret-key', // Add fallback for secret key
    });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: process.env.REFRESH_EXPIRE || '7d', // Add fallback for refresh token expiration
      secret: process.env.REFRESH_SECRET || 'default-refresh-secret', // Add fallback for refresh secret
    });
    await this.userModel.updateOne(
      { _id: user._id },
      { refreshToken: refreshToken }
    );
    return new LoginResponseDto('Logged in Successfully', token, refreshToken, HttpStatus.OK, plainToInstance(UserDto, user));
  }

  async login(loginAuthDto: LoginAuthDto): Promise<LoginResponseDto> {
    const user = await this.userModel.findOne({
      $or: [ // Use $or for querying multiple conditions in Mongoose
        { username: loginAuthDto.usernameOrEmail },
        { email: loginAuthDto.usernameOrEmail }
      ]
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isMatch = user.password ? await bcrypt.compare(loginAuthDto.password, user.password) : false;
    if (!isMatch) {
      throw new BadRequestException('Invalid Email/Username or Password');
    }

    const userDto = plainToInstance(UserDto, user);
    const payload = { user: userDto };
    const token = this.jwtService.sign(payload, { expiresIn: process.env.ACCESS_EXPIRE || '3600s', secret: process.env.SECRET_KEY || 'default-secret-key' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: process.env.REFRESH_EXPIRE || '7d', secret: process.env.REFRESH_SECRET || 'default-refresh-secret' });

    user.refreshToken = refreshToken;
    await user.save();

    return new LoginResponseDto('Logged in Successfully', token, refreshToken, HttpStatus.OK, plainToInstance(UserDto, user));
  }

  async register(createUserDto: CreateUserDto) {
    const existingUser = await this.userService.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new BadRequestException('User with this email already exists.');
    }

    createUserDto.password = await bcrypt.hash(createUserDto.password, 10);

    const user = await this.userService.create(createUserDto);

    const userDto = plainToInstance(UserDto, user);
    const payload = { user: userDto }
    const token = this.jwtService.sign(payload, { expiresIn: process.env.ACCESS_EXPIRE || '3600s', secret: process.env.SECRET_KEY || 'default-secret-key', });

    const refreshToken = this.jwtService.sign(payload, { expiresIn: process.env.REFRESH_EXPIRE || '7d', secret: process.env.REFRESH_SECRET || 'default-refresh-secret', });

    user.refreshToken = refreshToken;
    await user.save();

    return {
      message: 'Registered Successfully',
      access_token: token,
      refreshToken: refreshToken,
      statusCode: HttpStatus.CREATED,
    };
  }
  async getMe(user: User) {
    const getUser = await this.userService.findOne(user.id);
    if (!getUser) {
      throw new NotFoundException('User not found');
    }
    return plainToInstance(UserDto, getUser);
  }

  async verifyToken(token: string) {
    const payload = this.jwtService.verify(token);
    if (!payload) {
      throw new UnauthorizedException('Invalid token');
    }
    return payload;
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      const payload = await this.jwtService.verify(refreshToken, {
        secret: process.env.REFRESH_SECRET || 'default-refresh-secret',
      });

      const user = await this.userModel.findOne({ id: payload.id }); // Fixed query syntax
      if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Invalid token');
      }

      const newAccessToken = this.jwtService.sign(
        { id: user.id, email: user.email, role: user.role },
        { expiresIn: process.env.ACCESS_EXPIRE || '3600s', secret: process.env.SECRET_KEY || 'default-secret-key' },
      );

      return { access_token: newAccessToken };
    } catch (error) {
      throw new UnauthorizedException('Refresh token expired or invalid');
    }
  }

  async logout(token: string) {
    if (!token) {
      throw new BadRequestException('JWT must be provided');
    }
    const payload = await this.jwtService.verify(token, {
      secret: process.env.REFRESH_SECRET || 'default-refresh-secret',
    });

    const user = await this.userModel.findOne({ id: payload.id }); // Fixed query syntax

    if (user) {
      user.refreshToken = ""; // Ensure user is a Mongoose model instance
      await user.save(); // Save changes to the database
    }

    return { message: 'Logged out successfully', statusCode: HttpStatus.OK };
  }

}
