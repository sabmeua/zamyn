import { PartialType } from '@nestjs/mapped-types';
import { CreateWorkflowStateDto } from './create-workflow-state.dto';

export class UpdateWorkflowStateDto extends PartialType(CreateWorkflowStateDto) {}
