import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async create(ticketId: string, createCommentDto: CreateCommentDto, userId?: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${ticketId} not found`);
    }

    return this.prisma.$transaction(async (tx) => {
      const comment = await tx.ticketComment.create({
        data: {
          ...createCommentDto,
          ticketId,
          userId,
        },
        include: {
          user: {
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
          ticketId,
          userId,
          actionType: 'COMMENTED',
          description: 'Comment added',
        },
      });

      return comment;
    });
  }

  async findAll(ticketId: string) {
    return this.prisma.ticketComment.findMany({
      where: { ticketId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
              },
            },
          },
        },
        attachments: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string) {
    const comment = await this.prisma.ticketComment.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
        replies: true,
        attachments: true,
      },
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    return comment;
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.ticketComment.delete({
      where: { id },
    });
  }
}
