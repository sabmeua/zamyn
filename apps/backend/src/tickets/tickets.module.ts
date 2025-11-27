import { Module } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { FilesModule } from '../files/files.module';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { AttachmentsService } from './attachments.service';
import { AttachmentsController } from './attachments.controller';

@Module({
  imports: [PrismaModule, FilesModule],
  providers: [TicketsService, CommentsService, AttachmentsService],
  controllers: [TicketsController, CommentsController, AttachmentsController],
  exports: [TicketsService],
})
export class TicketsModule {}
