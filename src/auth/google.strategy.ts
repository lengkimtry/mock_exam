import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private configService: ConfigService) {
    const clientID = configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = configService.get<string>('GOOGLE_CLIENT_SECRET');
    const callbackURL = configService.get<string>('GOOGLE_CALLBACK_URL');

    console.log('🔑 Google OAuth Configuration Check:');
    console.log('CLIENT_ID:', clientID ? `${clientID.substring(0, 10)}...` : 'NOT SET');
    console.log('CLIENT_SECRET:', clientSecret ? `${clientSecret.substring(0, 10)}...` : 'NOT SET');
    console.log('CALLBACK_URL:', callbackURL || 'NOT SET');

    if (!clientID || !clientSecret) {
      throw new Error('Google OAuth credentials not configured in environment variables');
    }

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    try {
      const { name, emails, photos } = profile;
      if (!emails || !emails.length) {
        return done(new Error('No email found'), null);
      }

      const user = {
        email: emails[0].value,
        firstName: name?.givenName || '',
        lastName: name?.familyName || '',
        username: emails[0].value,
        picture: photos?.[0]?.value || '',
        accessToken,
        refreshToken,
      };

      done(null, user);
    } catch (error) {
      done(error, null);
    }
  }
}
