import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FilesService } from '../files/files.service';

@Injectable()
export class AttachmentsService {
  constructor(
    private prisma: PrismaService,
    private filesService: FilesService,
  ) {}

  async create(
    ticketId: string,
    file: Express.Multer.File,
    userId: string,
    commentId?: string,
  ) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${ticketId} not found`);
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('File size exceeds 10MB limit');
    }

    const savedFile = await this.filesService.saveFile(file);

    return this.prisma.$transaction(async (tx) => {
      const attachment = await tx.ticketAttachment.create({
        data: {
          ticketId,
          commentId,
          filename: file.originalname,
          filePath: savedFile.filename,
          fileSize: file.size,
          mimeType: file.mimetype,
          uploadedById: userId,
        },
        include: {
          uploadedBy: {
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
          actionType: 'ATTACHMENT_ADDED',
          description: `File attached: ${file.originalname}`,
        },
      });

      return attachment;
    });
  }

  async findAll(ticketId: string) {
    return this.prisma.ticketAttachment.findMany({
      where: { ticketId },
      include: {
        uploadedBy: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async remove(id: string) {
    const attachment = await this.prisma.ticketAttachment.findUnique({
      where: { id },
    });

    if (!attachment) {
      throw new NotFoundException(`Attachment with ID ${id} not found`);
    }

    await this.filesService.deleteFile(attachment.filePath);

    return this.prisma.ticketAttachment.delete({
      where: { id },
    });
  }
}
