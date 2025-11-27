import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  content: string;

  @IsBoolean()
  @IsOptional()
  isInternal?: boolean;

  @IsString()
  @IsOptional()
  parentCommentId?: string;

  @IsString()
  @IsOptional()
  authorName?: string;

  @IsString()
  @IsOptional()
  authorEmail?: string;
}
