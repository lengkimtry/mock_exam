import { IsOptional } from "class-validator";

export class FacebookDto {
  facebookId: string;
  username: string;
  firstName: string;
  lastName: string;
  accessToken: string;
  @IsOptional()
  email: string;
}