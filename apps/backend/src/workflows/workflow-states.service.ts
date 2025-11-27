import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkflowStateDto } from './dto/create-workflow-state.dto';
import { UpdateWorkflowStateDto } from './dto/update-workflow-state.dto';

@Injectable()
export class WorkflowStatesService {
  constructor(private prisma: PrismaService) {}

  async create(workflowId: string, createStateDto: CreateWorkflowStateDto) {
    const workflow = await this.prisma.workflow.findUnique({
      where: { id: workflowId },
    });

    if (!workflow) {
      throw new NotFoundException(`Workflow with ID ${workflowId} not found`);
    }

    if (createStateDto.isInitial) {
      const existingInitial = await this.prisma.workflowState.findFirst({
        where: { workflowId, isInitial: true },
      });

      if (existingInitial) {
        throw new BadRequestException('Workflow already has an initial state');
      }
    }

    return this.prisma.workflowState.create({
      data: {
        ...createStateDto,
        workflowId,
        requiredProperties: createStateDto.requiredProperties || {},
        assignConfig: createStateDto.assignConfig || {},
      },
    });
  }

  async findAll(workflowId: string) {
    return this.prisma.workflowState.findMany({
      where: { workflowId },
      include: {
        actionsFrom: {
          include: {
            toState: { select: { id: true, name: true, displayName: true } },
          },
        },
        actionsTo: {
          include: {
            fromState: { select: { id: true, name: true, displayName: true } },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string) {
    const state = await this.prisma.workflowState.findUnique({
      where: { id },
      include: {
        workflow: { select: { id: true, name: true } },
        actionsFrom: true,
        actionsTo: true,
      },
    });

    if (!state) {
      throw new NotFoundException(`WorkflowState with ID ${id} not found`);
    }

    return state;
  }

  async update(id: string, updateStateDto: UpdateWorkflowStateDto) {
    const state = await this.findOne(id);

    if (updateStateDto.isInitial !== undefined && updateStateDto.isInitial && !state.isInitial) {
      const existingInitial = await this.prisma.workflowState.findFirst({
        where: {
          workflowId: state.workflowId,
          isInitial: true,
          id: { not: id },
        },
      });

      if (existingInitial) {
        throw new BadRequestException('Workflow already has an initial state');
      }
    }

    return this.prisma.workflowState.update({
      where: { id },
      data: updateStateDto,
    });
  }

  async remove(id: string) {
    const state = await this.findOne(id);

    if (state.isInitial) {
      throw new BadRequestException('Cannot delete the initial state');
    }

    const ticketCount = await this.prisma.ticket.count({
      where: { currentStateId: id },
    });

    if (ticketCount > 0) {
      throw new BadRequestException(
        `Cannot delete state: ${ticketCount} ticket(s) are currently in this state`,
      );
    }

    return this.prisma.workflowState.delete({
      where: { id },
    });
  }
}
