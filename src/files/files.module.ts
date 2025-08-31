import { Module } from '@nestjs/common';
import { FILE_REPOSITORY } from './domain/file.repository';
import { InMemoryFileRepository } from './infrastructure/repositories/in-memory-file.repository';
import { CreateFileUseCase } from './application/use-cases/create-file.use-case';
import { GetFileUseCase } from './application/use-cases/get-file.use-case';
import { ListFilesUseCase } from './application/use-cases/list-files.use-case';
import { FilesHttpController } from './presentation/http/files.controller';

@Module({
  controllers: [FilesHttpController],
  providers: [
    { provide: FILE_REPOSITORY, useClass: InMemoryFileRepository },
    CreateFileUseCase,
    GetFileUseCase,
    ListFilesUseCase,
  ],
  exports: [CreateFileUseCase, GetFileUseCase, ListFilesUseCase],
})
export class FilesModule {}
