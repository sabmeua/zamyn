import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('tickets/:ticketId/comments')
@UseGuards(JwtAuthGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  create(
    @Param('ticketId') ticketId: string,
    @Body() createCommentDto: CreateCommentDto,
    @Request() req,
  ) {
    return this.commentsService.create(ticketId, createCommentDto, req.user.userId);
  }

  @Get()
  findAll(@Param('ticketId') ticketId: string) {
    return this.commentsService.findAll(ticketId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commentsService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.commentsService.remove(id);
  }
}
