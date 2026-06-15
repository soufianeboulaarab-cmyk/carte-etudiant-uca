import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ScanResult, RejectionReason } from '@prisma/client';

export class RegisterDeviceDto {
  @ApiProperty({ example: 'iPhone 13 Pro' })
  @IsString()
  @IsNotEmpty()
  deviceName: string;

  @ApiProperty({ example: 'fp_abc123xyz' })
  @IsString()
  @IsNotEmpty()
  fingerprint: string;
}

export class ConfirmDeviceDto {
  @ApiProperty({ example: 'fp_abc123xyz' })
  @IsString()
  @IsNotEmpty()
  fingerprint: string;

  @ApiProperty({ example: '482910' })
  @IsString()
  @IsNotEmpty()
  otp: string;
}

export class VerifyCardDto {
  @ApiProperty({ description: 'JWT RS256 issu du QR code' })
  @IsString()
  @IsNotEmpty()
  token: string;
}

export class ScanLogDto {
  @ApiProperty({ example: 'user_cld123' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiPropertyOptional({ example: 'Bibliothèque centrale' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ enum: ScanResult, default: ScanResult.APPROVED })
  @IsOptional()
  @IsEnum(ScanResult)
  result?: ScanResult;

  @ApiPropertyOptional({ enum: RejectionReason })
  @IsOptional()
  @IsEnum(RejectionReason)
  rejectionReason?: RejectionReason;
}

export class ScansQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  filiere?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  etablissement?: string;
}

export class MyScansQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}