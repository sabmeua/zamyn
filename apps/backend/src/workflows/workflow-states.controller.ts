import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { WorkflowStatesService } from './workflow-states.service';
import { CreateWorkflowStateDto } from './dto/create-workflow-state.dto';
import { UpdateWorkflowStateDto } from './dto/update-workflow-state.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('workflows/:workflowId/states')
@UseGuards(JwtAuthGuard)
export class WorkflowStatesController {
  constructor(private readonly workflowStatesService: WorkflowStatesService) {}

  @Post()
  create(
    @Param('workflowId') workflowId: string,
    @Body() createStateDto: CreateWorkflowStateDto,
  ) {
    return this.workflowStatesService.create(workflowId, createStateDto);
  }

  @Get()
  findAll(@Param('workflowId') workflowId: string) {
    return this.workflowStatesService.findAll(workflowId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.workflowStatesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStateDto: UpdateWorkflowStateDto) {
    return this.workflowStatesService.update(id, updateStateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.workflowStatesService.remove(id);
  }
}
