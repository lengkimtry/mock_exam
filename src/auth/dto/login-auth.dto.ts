import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class LoginAuthDto {
  @IsNotEmpty()
  @MinLength(4)
  @IsString()
  usernameOrEmail: string;

  @IsNotEmpty()
  @MinLength(8)
  password: string;
}
