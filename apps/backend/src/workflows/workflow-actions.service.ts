import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkflowActionDto } from './dto/create-workflow-action.dto';
import { UpdateWorkflowActionDto } from './dto/update-workflow-action.dto';

@Injectable()
export class WorkflowActionsService {
  constructor(private prisma: PrismaService) {}

  async create(workflowId: string, createActionDto: CreateWorkflowActionDto) {
    const workflow = await this.prisma.workflow.findUnique({
      where: { id: workflowId },
    });

    if (!workflow) {
      throw new NotFoundException(`Workflow with ID ${workflowId} not found`);
    }

    const [fromState, toState] = await Promise.all([
      this.prisma.workflowState.findUnique({
        where: { id: createActionDto.fromStateId },
      }),
      this.prisma.workflowState.findUnique({
        where: { id: createActionDto.toStateId },
      }),
    ]);

    if (!fromState || !toState) {
      throw new NotFoundException('One or both states not found');
    }

    if (fromState.workflowId !== workflowId || toState.workflowId !== workflowId) {
      throw new NotFoundException('States do not belong to this workflow');
    }

    return this.prisma.workflowAction.create({
      data: {
        ...createActionDto,
        workflowId,
        triggerType: createActionDto.triggerType as any,
        sideEffects: createActionDto.sideEffects || {},
      },
      include: {
        fromState: true,
        toState: true,
      },
    });
  }

  async findAll(workflowId: string) {
    return this.prisma.workflowAction.findMany({
      where: { workflowId },
      include: {
        fromState: { select: { id: true, name: true, displayName: true, color: true } },
        toState: { select: { id: true, name: true, displayName: true, color: true } },
      },
      orderBy: { order: 'asc' },
    });
  }

  async findOne(id: string) {
    const action = await this.prisma.workflowAction.findUnique({
      where: { id },
      include: {
        workflow: { select: { id: true, name: true } },
        fromState: true,
        toState: true,
      },
    });

    if (!action) {
      throw new NotFoundException(`WorkflowAction with ID ${id} not found`);
    }

    return action;
  }

  async update(id: string, updateActionDto: UpdateWorkflowActionDto) {
    await this.findOne(id);

    return this.prisma.workflowAction.update({
      where: { id },
      data: {
        ...updateActionDto,
        triggerType: updateActionDto.triggerType as any,
      },
      include: {
        fromState: true,
        toState: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.workflowAction.delete({
      where: { id },
    });
  }
}
