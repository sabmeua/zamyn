import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}

  async create(createTicketDto: CreateTicketDto, creatorId: string) {
    const ticketNumber = await this.generateTicketNumber();

    return this.prisma.$transaction(async (tx) => {
      const ticket = await tx.ticket.create({
        data: {
          ...createTicketDto,
          ticketNumber,
          creatorId,
          customData: createTicketDto.customData || {},
          tags: createTicketDto.tags || [],
          priority: createTicketDto.priority as any,
        },
        include: {
          workflow: true,
          currentState: true,
          creator: {
            select: {
              id: true,
              username: true,
              displayName: true,
            },
          },
          assignee: {
            select: {
              id: true,
              username: true,
              displayName: true,
            },
          },
        },
      });

      await tx.ticketHistory.create({
        data: {
          ticketId: ticket.id,
          userId: creatorId,
          actionType: 'CREATED',
          description: 'Ticket created',
        },
      });

      return ticket;
    });
  }

  async findAll(filters?: {
    workflowId?: string;
    currentStateId?: string;
    assigneeId?: string;
    creatorId?: string;
  }) {
    return this.prisma.ticket.findMany({
      where: filters,
      include: {
        workflow: { select: { id: true, name: true } },
        currentState: { select: { id: true, name: true, displayName: true, color: true } },
        creator: { select: { id: true, username: true, displayName: true } },
        assignee: { select: { id: true, username: true, displayName: true } },
        _count: {
          select: {
            comments: true,
            attachments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        workflow: true,
        currentState: true,
        creator: { select: { id: true, username: true, displayName: true, email: true } },
        assignee: { select: { id: true, username: true, displayName: true, email: true } },
        comments: {
          include: {
            user: { select: { id: true, username: true, displayName: true } },
            attachments: true,
          },
          orderBy: { createdAt: 'asc' },
        },
        attachments: {
          include: {
            uploadedBy: { select: { id: true, username: true, displayName: true } },
          },
        },
        histories: {
          include: {
            user: { select: { id: true, username: true, displayName: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }

    return ticket;
  }

  async update(id: string, updateTicketDto: UpdateTicketDto, userId: string) {
    const ticket = await this.findOne(id);

    await this.createHistory(id, userId, 'UPDATED', updateTicketDto);

    return this.prisma.ticket.update({
      where: { id },
      data: {
        ...updateTicketDto,
        priority: updateTicketDto.priority as any,
      },
      include: {
        workflow: true,
        currentState: true,
        creator: { select: { id: true, username: true, displayName: true } },
        assignee: { select: { id: true, username: true, displayName: true } },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.ticket.delete({
      where: { id },
    });
  }

  private async generateTicketNumber(): Promise<string> {
    const count = await this.prisma.ticket.count();
    return `TICKET-${String(count + 1).padStart(6, '0')}`;
  }

  async search(searchDto: any) {
    const where: any = {};

    if (searchDto.query) {
      where.OR = [
        { title: { contains: searchDto.query, mode: 'insensitive' } },
        { description: { contains: searchDto.query, mode: 'insensitive' } },
      ];
    }

    if (searchDto.workflowId) {
      where.workflowId = searchDto.workflowId;
    }

    if (searchDto.currentStateId) {
      where.currentStateId = searchDto.currentStateId;
    }

    if (searchDto.assigneeId) {
      where.assigneeId = searchDto.assigneeId;
    }

    if (searchDto.creatorId) {
      where.creatorId = searchDto.creatorId;
    }

    if (searchDto.priority) {
      where.priority = searchDto.priority;
    }

    if (searchDto.tags && searchDto.tags.length > 0) {
      where.tags = {
        array_contains: searchDto.tags,
      };
    }

    if (searchDto.dateFrom || searchDto.dateTo) {
      where.createdAt = {};
      if (searchDto.dateFrom) where.createdAt.gte = new Date(searchDto.dateFrom);
      if (searchDto.dateTo) where.createdAt.lte = new Date(searchDto.dateTo);
    }

    return this.prisma.ticket.findMany({
      where,
      include: {
        workflow: { select: { id: true, name: true } },
        currentState: { select: { id: true, name: true, displayName: true, color: true } },
        creator: { select: { id: true, username: true, displayName: true } },
        assignee: { select: { id: true, username: true, displayName: true } },
        _count: {
          select: {
            comments: true,
            attachments: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  private async createHistory(
    ticketId: string,
    userId: string,
    actionType: string,
    changes: any,
  ) {
    return this.prisma.ticketHistory.create({
      data: {
        ticketId,
        userId,
        actionType: actionType as any,
        description: `Ticket ${actionType.toLowerCase()}`,
        newValue: changes,
      },
    });
  }
}
