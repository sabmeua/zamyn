import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { UpdateWorkflowDto } from './dto/update-workflow.dto';

@Injectable()
export class WorkflowsService {
  constructor(private prisma: PrismaService) {}

  async create(createWorkflowDto: CreateWorkflowDto, userId: string) {
    return this.prisma.workflow.create({
      data: {
        ...createWorkflowDto,
        createdById: userId,
        customProperties: createWorkflowDto.customProperties || {},
      },
      include: {
        states: true,
        actions: true,
      },
    });
  }

  async findAll() {
    return this.prisma.workflow.findMany({
      include: {
        states: true,
        actions: true,
        _count: {
          select: { tickets: true },
        },
      },
    });
  }

  async findOne(id: string) {
    const workflow = await this.prisma.workflow.findUnique({
      where: { id },
      include: {
        states: true,
        actions: {
          include: {
            fromState: true,
            toState: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
      },
    });

    if (!workflow) {
      throw new NotFoundException(`Workflow with ID ${id} not found`);
    }

    return workflow;
  }

  async update(id: string, updateWorkflowDto: UpdateWorkflowDto) {
    await this.findOne(id); // 存在確認

    return this.prisma.workflow.update({
      where: { id },
      data: updateWorkflowDto,
      include: {
        states: true,
        actions: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id); // 存在確認

    return this.prisma.workflow.delete({
      where: { id },
    });
  }
}
