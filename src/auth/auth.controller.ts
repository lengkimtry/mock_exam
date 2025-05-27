import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
  ValidationPipe,
  UsePipes,
  Res,
  HttpStatus,
  HttpCode,
UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { GoogleOAuthGuard } from './google-oauth.guard';
import { GoogleDto } from './dto/google.dto';
import { FacebookOAuthGuard } from './facebook-oauth.guard';
import { FacebookDto } from './dto/facebook.dto';
import { AuthGuard } from './auth.guard';

@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() createUserDto: CreateUserDto) {
    try {
      console.log('Register request received:', createUserDto); // Debug log
      return await this.authService.register(createUserDto);
    } catch (error) {
      console.error('Error during registration:', error); // Debug log
      throw error;
    }
  }

  @Post('/login')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @HttpCode(HttpStatus.CREATED)
  async login(
    @Body() loginAuthDto: LoginAuthDto,
    @Res({ passthrough: true }) res: Response
  ) {
    try {
      const { access_token, refresh_token } = await this.authService.login(loginAuthDto);

      // Set secure HTTP-only cookies
      res.cookie('access_token', access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 3600000, // 1 hour
      });

      res.cookie('refresh_token', refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 86400000, // 24 hours
      });

      return { access_token, refresh_token, user: loginAuthDto.usernameOrEmail };
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'An error occurred during login',
        error: error.message,
      });
    }
  }

  @Get('/verify')
  verify(@Query('token') token: string) {
    return this.authService.verifyToken(token);
  }

  @Post('/refresh-token') // Updated endpoint to match frontend
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body() body: { token: string }, // Updated to accept token in the body
    @Res({ passthrough: true }) res: Response
  ) {
    const refreshToken = body.token; // Extract token from body
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }

    const { access_token } = await this.authService.refreshAccessToken(refreshToken);

    // Set new access token cookie
    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600000, // 1 hour
    });

    return { access_token }; // Ensure the access token is returned in the response
  }

  @Post('/logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Request() req,
    @Res({ passthrough: true }) res: Response
  ) {
    const refreshToken = req.cookies.refresh_token;
    await this.authService.logout(refreshToken);
    
    // Clear cookies
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    
    return { message: 'Logout successful' };
  }

  @Get('/me')
  @UseGuards(AuthGuard)
  async getMe(@Request() req) {
    try {
      const user = await this.authService.getMe(req.user);
      return user; // Return the user data
    } catch (error) {
      console.error('Error fetching user info:', error); // Log the error for debugging
      throw error;
    }
  }

  @Get('/google')
  @UseGuards(GoogleOAuthGuard)
  async googleAuth(@Request() req) {}

  @Get('/google/callback')
  @UseGuards(GoogleOAuthGuard)
  async googleAuthRedirect(@Request() req, @Res() res) {
    try {
      const user = req.user;
      const googleDto = new GoogleDto();
      googleDto.email = user.email;
      googleDto.firstName = user.firstName;
      googleDto.lastName = user.lastName;
      googleDto.profilePicUrl = user.picture;
      googleDto.accessToken = user.accessToken;
      googleDto.username = user.email;
      await this.authService
        .CreateOrSignInWithGoogle(googleDto)
        .then((response) => {
          res.redirect(
            `${process.env.FRONTEND_URL}/auth/social?token=${response.access_token}&refreshToken=${response.refresh_token}&user=${JSON.stringify(response.user)}`,
          );
        });
    } catch (error) {
      console.error('Google sign-in error:', error);
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: 'Google sign-in failed' });
    }
  }
  @Get('/facebook')
  @UseGuards(FacebookOAuthGuard)
  async facebookLogin(@Request() req) {}

  @Get('/facebook/callback')
  @UseGuards(FacebookOAuthGuard)
  async facebookLoginRedirect(@Request() req) {
    const user = req.user;
    const facebookDto = new FacebookDto();
    facebookDto.facebookId = user.id;
    facebookDto.email = user.email;
    facebookDto.firstName = user.firstName;
    facebookDto.lastName = user.lastName;
    facebookDto.accessToken = user.accessToken;
    const response = this.authService.CreateOrSignInWithFacebook(facebookDto);
    return response;
  }
}
