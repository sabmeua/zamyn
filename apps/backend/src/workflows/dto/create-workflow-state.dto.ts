import { IsString, IsBoolean, IsOptional, IsObject, IsHexColor } from 'class-validator';

export class CreateWorkflowStateDto {
  @IsString()
  name: string;

  @IsString()
  displayName: string;

  @IsHexColor()
  color: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsObject()
  position: { x: number; y: number };

  @IsObject()
  @IsOptional()
  requiredProperties?: any;

  @IsObject()
  @IsOptional()
  assignConfig?: any;

  @IsBoolean()
  @IsOptional()
  isInitial?: boolean;

  @IsBoolean()
  @IsOptional()
  isFinal?: boolean;
}
