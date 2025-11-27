import { IsString, IsEnum, IsOptional, IsObject, IsInt } from 'class-validator';

export class CreateWorkflowActionDto {
  @IsString()
  name: string;

  @IsEnum(['MANUAL', 'AUTO', 'EXTERNAL', 'SCHEDULED'])
  triggerType: string;

  @IsString()
  fromStateId: string;

  @IsString()
  toStateId: string;

  @IsObject()
  @IsOptional()
  condition?: any;

  @IsObject()
  @IsOptional()
  sideEffects?: any;

  @IsInt()
  @IsOptional()
  order?: number;
}
