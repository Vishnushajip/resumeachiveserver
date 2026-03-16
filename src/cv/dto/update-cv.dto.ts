import {
  IsString,
  IsOptional,
  IsObject,
  IsBoolean,
  MinLength,
  MaxLength,
} from 'class-validator';

export class UpdateCvDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  title?: string;

  @IsOptional()
  @IsObject()
  cvData?: Record<string, any>;

  @IsOptional()
  @IsString()
  templateId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
