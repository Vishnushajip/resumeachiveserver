import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  MinLength,
  MaxLength,
  Min,
  Max,
} from 'class-validator';

export class UpdateTestimonialDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  designation?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  feedback?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsBoolean()
  isApproved?: boolean;

  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
