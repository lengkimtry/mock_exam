import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSubjectDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  universityId: string;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number) // Transform to number
  questionCount: number;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number) // Transform to number
  duration: number;

  @IsOptional()
  @IsString()
  imageSRC?: string;

  @IsOptional()
  @IsString()
  imageSrc?: string; // Handle both variations
}
