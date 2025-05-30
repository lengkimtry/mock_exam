import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from 'src/user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { User } from 'src/user/entities/user.entity';
import { UserSchema } from 'src/user/schemas/user.schema';
import { JwtStrategy } from './jwt.strategy';

const strategies = [JwtStrategy];

// Conditionally add Google and Facebook strategies
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  const { GoogleStrategy } = require('./google.strategy');
  strategies.push(GoogleStrategy);
}

if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  const { FacebookStrategy } = require('./facebook.strategy');
  strategies.push(FacebookStrategy);
}

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env'],
      isGlobal: true,
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    UserModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('SECRET_KEY') || 'default-secret-key',
        signOptions: {
          expiresIn: configService.get<string>('ACCESS_EXPIRE') || '3600s',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, ...strategies],
  exports: [AuthService],
})
export class AuthModule {}
