import { Exclude, Expose, Transform } from 'class-transformer';

@Exclude()
export class UserDto {
    @Expose() id: string;
    @Expose() firstName: string;
    @Expose() lastName: string;
    @Expose() username: string;
    @Expose() email: string;
    @Expose() profilePicUrl: string;
    @Expose() bio: string;
    @Expose() dateOfBirth: Date;
    @Expose() createdAt: Date;
    @Expose() updatedAt: Date;

    password: string;
    refreshToken: string;
    accessToken: string;
    facebookId: string;
}
