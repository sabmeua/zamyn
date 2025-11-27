import { PartialType } from '@nestjs/mapped-types';
import { CreateWorkflowActionDto } from './create-workflow-action.dto';

export class UpdateWorkflowActionDto extends PartialType(CreateWorkflowActionDto) {}
