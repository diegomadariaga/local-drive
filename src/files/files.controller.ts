import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { FilesService } from './files.service';
import type { FileItem } from './files.service';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get()
  list(): FileItem[] {
    return this.filesService.list();
  }

  @Get(':id')
  get(@Param('id') id: string): FileItem {
    return this.filesService.get(id);
  }

  @Post()
  create(
    @Body('name') name: string,
    @Body('content') content: string,
  ): FileItem {
    return this.filesService.create(name, content);
  }
}
