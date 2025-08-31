import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { FILE_REPOSITORY } from '../../domain/file.repository';
import type { FileRepository } from '../../domain/file.repository';
import { FileEntity } from '../../domain/file.entity';

@Injectable()
export class GetFileUseCase {
  constructor(@Inject(FILE_REPOSITORY) private readonly repo: FileRepository) {}

  async execute(id: string): Promise<FileEntity> {
    const file = await this.repo.findById(id);
    if (!file) throw new NotFoundException(`File ${id} not found`);
    return file;
  }
}
