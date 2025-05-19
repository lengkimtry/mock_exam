import { IsNotEmpty, IsString, IsNumber, Min } from 'class-validator';

export class CreateUniversityDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty() // Ensure the image field is required
  @IsString()
  image: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  numberOfSubjects: number;
}
