

import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, Profile } from "passport-facebook";
import { VerifyCallback } from "passport-google-oauth20";

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, "facebook") {
  constructor() {
    super({
      clientID: process.env.FACEBOOK_APP_ID || '',
      clientSecret: process.env.FACEBOOK_APP_SECRET || '',
      callbackURL: process.env.FACEBOOK_REDIRECT_URL || '',
      scope: "email",
      profileFields: ["emails", "name"],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback
  ): Promise<any> {
    try {
      const { id, name, emails } = profile;
      const user = {
        id: id,
        email: emails ? emails[0].value : null,
        username: emails ? emails[0].value : null,
        firstName: name ? name.givenName : null,
        lastName: name ? name.familyName : null,
        accessToken,
        refreshToken,
      };

      if (!user.email) {
        throw new Error('Email not found in Facebook profile');
      }

      done(null, user);
    } catch (error) {
      done(error, false);
    }
  }
}
