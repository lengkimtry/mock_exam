import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from 'src/user/user.module';
import { ConfigModule } from '@nestjs/config';
import { GoogleStrategy } from './google.strategy';
import { FacebookStrategy } from './facebook.strategy';
import { MongooseModule } from '@nestjs/mongoose';
import { User} from 'src/user/entities/user.entity';
import { UserSchema } from 'src/user/schemas/user.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env'],
      isGlobal: true,
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), // Use MongooseModule
    UserModule,
    JwtModule.register({
      global: true,
      secret: process.env.SECRET_KEY || 'default-secret-key', // Add a fallback value
      signOptions: { expiresIn: process.env.ACCESS_EXPIRE || '3600s' }, // Add a fallback for expiration
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    GoogleStrategy,
    FacebookStrategy,
  ],
  exports: [AuthService],
})
export class AuthModule { }
