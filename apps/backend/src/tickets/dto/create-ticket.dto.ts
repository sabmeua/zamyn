import { IsString, IsOptional, IsEnum, IsObject, IsArray, IsDateString } from 'class-validator';

export class CreateTicketDto {
  @IsString()
  workflowId: string;

  @IsString()
  currentStateId: string;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
  @IsOptional()
  priority?: string;

  @IsString()
  @IsOptional()
  assigneeId?: string;

  @IsString()
  @IsOptional()
  requesterEmail?: string;

  @IsString()
  @IsOptional()
  requesterName?: string;

  @IsObject()
  @IsOptional()
  customData?: any;

  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsDateString()
  @IsOptional()
  dueDate?: string;
}
