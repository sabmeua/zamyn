import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { WorkflowActionsService } from './workflow-actions.service';
import { CreateWorkflowActionDto } from './dto/create-workflow-action.dto';
import { UpdateWorkflowActionDto } from './dto/update-workflow-action.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('workflows/:workflowId/actions')
@UseGuards(JwtAuthGuard)
export class WorkflowActionsController {
  constructor(private readonly workflowActionsService: WorkflowActionsService) {}

  @Post()
  create(
    @Param('workflowId') workflowId: string,
    @Body() createActionDto: CreateWorkflowActionDto,
  ) {
    return this.workflowActionsService.create(workflowId, createActionDto);
  }

  @Get()
  findAll(@Param('workflowId') workflowId: string) {
    return this.workflowActionsService.findAll(workflowId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.workflowActionsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateActionDto: UpdateWorkflowActionDto) {
    return this.workflowActionsService.update(id, updateActionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.workflowActionsService.remove(id);
  }
}
