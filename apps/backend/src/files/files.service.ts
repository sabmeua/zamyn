import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class FilesService {
  private uploadDir: string;

  constructor(private configService: ConfigService) {
    this.uploadDir = this.configService.get<string>('UPLOAD_DIR') || './uploads';
    this.ensureUploadDir();
  }

  private async ensureUploadDir() {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  async saveFile(file: Express.Multer.File): Promise<{ filename: string; path: string }> {
    const filename = `${Date.now()}-${file.originalname}`;
    const filepath = path.join(this.uploadDir, filename);
    await fs.writeFile(filepath, file.buffer);
    return { filename, path: filepath };
  }

  async getFile(filename: string): Promise<Buffer> {
    const filepath = path.join(this.uploadDir, filename);
    try {
      return await fs.readFile(filepath);
    } catch {
      throw new NotFoundException('File not found');
    }
  }

  async deleteFile(filename: string): Promise<void> {
    const filepath = path.join(this.uploadDir, filename);
    try {
      await fs.unlink(filepath);
    } catch {
      throw new NotFoundException('File not found');
    }
  }
}
