import {
  IsString,
  IsOptional,
  IsObject,
  IsBoolean,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateCvDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  title: string;

  @IsObject()
  cvData: Record<string, any>;

  @IsOptional()
  @IsString()
  templateId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
