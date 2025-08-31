import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateFileUseCase } from '../../application/use-cases/create-file.use-case';
import { GetFileUseCase } from '../../application/use-cases/get-file.use-case';
import { ListFilesUseCase } from '../../application/use-cases/list-files.use-case';
import type { FileEntity } from '../../domain/file.entity';
import { CreateFileDto } from '../../application/dto/create-file.dto';

@Controller('files')
export class FilesHttpController {
  constructor(
    private readonly createFile: CreateFileUseCase,
    private readonly getFile: GetFileUseCase,
    private readonly listFiles: ListFilesUseCase,
  ) {}

  @Get()
  async list(): Promise<FileEntity[]> {
    return this.listFiles.execute();
  }

  @Get(':id')
  async get(@Param('id') id: string): Promise<FileEntity> {
    return this.getFile.execute(id);
  }

  @Post()
  async create(@Body() dto: CreateFileDto): Promise<FileEntity> {
    return this.createFile.execute(dto);
  }
}
