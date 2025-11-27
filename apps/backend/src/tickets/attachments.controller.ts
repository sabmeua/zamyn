import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AttachmentsService } from './attachments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('tickets/:ticketId/attachments')
@UseGuards(JwtAuthGuard)
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Param('ticketId') ticketId: string,
    @UploadedFile() file: Express.Multer.File,
    @Query('commentId') commentId: string | undefined,
    @Request() req,
  ) {
    return this.attachmentsService.create(ticketId, file, req.user.userId, commentId);
  }

  @Get()
  findAll(@Param('ticketId') ticketId: string) {
    return this.attachmentsService.findAll(ticketId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.attachmentsService.remove(id);
  }
}
