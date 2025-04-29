import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsEmail, IsStrongPassword, MaxLength, MinLength } from 'class-validator';
import { IsString } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
    @IsString()
    @MaxLength(25)
    @MinLength(2)
    firstName: string;

    @IsString()
    @MaxLength(25)
    @MinLength(2)
    lastName: string;

    @IsEmail()
    @MaxLength(50)
    email: string;

    @IsString()
    @MaxLength(50)
    @MinLength(2)
    username: string;

    @IsString()
    @MaxLength(100)
    @IsStrongPassword()
    password: string;

    @IsString()
    @MaxLength(255)
    bio: string;


}