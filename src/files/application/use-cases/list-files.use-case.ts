import { Inject, Injectable } from '@nestjs/common';
import { FILE_REPOSITORY } from '../../domain/file.repository';
import type { FileRepository } from '../../domain/file.repository';
import { FileEntity } from '../../domain/file.entity';

@Injectable()
export class ListFilesUseCase {
  constructor(@Inject(FILE_REPOSITORY) private readonly repo: FileRepository) {}

  execute(): Promise<FileEntity[]> {
    return this.repo.findAll();
  }
}
