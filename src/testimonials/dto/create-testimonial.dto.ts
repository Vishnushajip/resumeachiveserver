import {
  IsString,
  IsOptional,
  IsNumber,
  IsEmail,
  MinLength,
  MaxLength,
  Min,
  Max,
} from 'class-validator';

export class CreateTestimonialDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  designation: string;

  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  feedback: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
