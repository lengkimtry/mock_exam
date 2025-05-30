import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginAuthDto } from './dto/login-auth.dto';
import { UserService } from 'src/user/user.service';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { User } from 'src/user/schemas/user.schema';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { GoogleDto } from './dto/google.dto';
import { FacebookDto } from './dto/facebook.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { plainToInstance } from 'class-transformer';
import { UserDto } from 'src/user/dto/user.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async CreateOrSignInWithFacebook(
    facebookDto: FacebookDto,
  ): Promise<LoginResponseDto> {
    let user = await this.userModel.findOne({
      facebookId: facebookDto.facebookId,
    });

    if (!user) {
      user = new this.userModel(facebookDto);
    } else {
      user.firstName = facebookDto.firstName;
      user.lastName = facebookDto.lastName;
      user.accessToken = facebookDto.accessToken;
    }

    const userDto = plainToInstance(UserDto, user.toObject());
    const payload = { user: userDto };
    const token = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
    });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: process.env.REFRESH_EXPIRE,
      secret: process.env.REFRESH_SECRET,
    });
    user.refreshToken = refreshToken;
    await user.save();

    return new LoginResponseDto(
      'Logged in Successfully',
      token,
      refreshToken,
      HttpStatus.OK,
      plainToInstance(UserDto, user.toObject()),
    );
  }

  async CreateOrSignInWithGoogle(
    googleDto: GoogleDto,
  ): Promise<LoginResponseDto> {
    let user = await this.userModel.findOne({
      $or: [{ username: googleDto.email }, { email: googleDto.email }],
    });

    if (!user) {
      user = new this.userModel(googleDto);
    } else {
      user.firstName = googleDto.firstName;
      user.lastName = googleDto.lastName;
      user.profilePicUrl = googleDto.profilePicUrl;
    }

    const userDto = plainToInstance(UserDto, user.toObject());
    const payload = { user: userDto };
    const token = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
    });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: process.env.REFRESH_EXPIRE,
      secret: process.env.REFRESH_SECRET,
    });
    user.refreshToken = refreshToken;
    await user.save();

    return new LoginResponseDto(
      'Logged in Successfully',
      token,
      refreshToken,
      HttpStatus.OK,
      plainToInstance(UserDto, user.toObject()),
    );
  }

  async login(loginAuthDto: LoginAuthDto): Promise<LoginResponseDto> {
    const user = await this.userModel.findOne({
      $or: [
        { username: loginAuthDto.usernameOrEmail },
        { email: loginAuthDto.usernameOrEmail },
      ],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isMatch = user.password
      ? await bcrypt.compare(loginAuthDto.password, user.password)
      : false;

    if (!isMatch) {
      throw new BadRequestException('Invalid Email/Username or Password');
    }

    const userDto = plainToInstance(UserDto, user.toObject());
    const payload = { user: userDto };
    const token = this.jwtService.sign(payload, {
      expiresIn: process.env.ACCESS_EXPIRE,
      secret: process.env.SECRET_KEY,
    });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: process.env.REFRESH_EXPIRE,
      secret: process.env.REFRESH_SECRET,
    });

    user.refreshToken = refreshToken;
    await user.save();

    return new LoginResponseDto(
      'Logged in Successfully',
      token,
      refreshToken,
      HttpStatus.OK,
      plainToInstance(UserDto, user.toObject()),
    );
  }

  async register(createUserDto: CreateUserDto) {
    const existingUser = await this.userService.findByEmail(
      createUserDto.email,
    );
    if (existingUser) {
      throw new BadRequestException('User with this email already exists.');
    }

    createUserDto.password = await bcrypt.hash(createUserDto.password, 10);

    const user = await this.userService.create(createUserDto);

    const userDto = plainToInstance(UserDto, user.toObject());
    const payload = { user: userDto };
    const token = this.jwtService.sign(payload, {
      expiresIn: process.env.ACCESS_EXPIRE,
      secret: process.env.SECRET_KEY,
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: process.env.REFRESH_EXPIRE,
      secret: process.env.REFRESH_SECRET,
    });

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
    return plainToInstance(UserDto, getUser.toObject());
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
        secret: process.env.REFRESH_SECRET,
      });

      const user = await this.userModel.findById(payload.user.id);
      if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Invalid token');
      }

      const newAccessToken = this.jwtService.sign(
        { id: user._id, email: user.email, role: user.role },
        {
          expiresIn: process.env.ACCESS_EXPIRE,
          secret: process.env.SECRET_KEY,
        },
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
      secret: process.env.REFRESH_SECRET,
    });

    const user = await this.userModel.findById(payload.user.id);

    if (user) {
      user.refreshToken = '';
      await user.save();
    }

    return { message: 'Logged out successfully', statusCode: HttpStatus.OK };
  }
}
