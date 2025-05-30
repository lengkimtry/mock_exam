import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-facebook';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(private configService: ConfigService) {
    const clientID = configService.get<string>('FACEBOOK_APP_ID');
    const clientSecret = configService.get<string>('FACEBOOK_APP_SECRET');
    const callbackURL = configService.get<string>('FACEBOOK_CALLBACK_URL');

    console.log('🔑 Facebook OAuth Configuration Check:');
    console.log('APP_ID:', clientID ? `${clientID.substring(0, 10)}...` : 'NOT SET');
    console.log('APP_SECRET:', clientSecret ? `${clientSecret.substring(0, 10)}...` : 'NOT SET');
    console.log('CALLBACK_URL:', callbackURL || 'NOT SET');

    if (!clientID || !clientSecret) {
      throw new Error('Facebook OAuth credentials not configured in environment variables');
    }

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['email'],
      profileFields: ['emails', 'name', 'picture'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: Function,
  ): Promise<any> {
    try {
      const { name, emails, photos } = profile;
      if (!emails || !emails.length) {
        return done(new Error('No email found in Facebook profile'), null);
      }

      const user = {
        email: emails[0].value,
        firstName: name?.givenName || '',
        lastName: name?.familyName || '',
        username: emails[0].value,
        picture: photos?.[0]?.value || '',
        facebookId: profile.id,
        accessToken,
        refreshToken,
      };

      done(null, user);
    } catch (error) {
      done(error, null);
    }
  }
}
