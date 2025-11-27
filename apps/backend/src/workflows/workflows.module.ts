import { Module } from '@nestjs/common';
import { WorkflowsService } from './workflows.service';
import { WorkflowsController } from './workflows.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { WorkflowStatesService } from './workflow-states.service';
import { WorkflowStatesController } from './workflow-states.controller';
import { WorkflowActionsService } from './workflow-actions.service';
import { WorkflowActionsController } from './workflow-actions.controller';

@Module({
  imports: [PrismaModule],
  providers: [WorkflowsService, WorkflowStatesService, WorkflowActionsService],
  controllers: [WorkflowsController, WorkflowStatesController, WorkflowActionsController],
  exports: [WorkflowsService],
})
export class WorkflowsModule {}
