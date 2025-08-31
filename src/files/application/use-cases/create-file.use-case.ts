import { Inject, Injectable } from '@nestjs/common';
import { FILE_REPOSITORY } from '../../domain/file.repository';
import type { FileRepository } from '../../domain/file.repository';
import { FileEntity } from '../../domain/file.entity';
import { CreateFileDto } from '../dto/create-file.dto';

@Injectable()
export class CreateFileUseCase {
  constructor(@Inject(FILE_REPOSITORY) private readonly repo: FileRepository) {}

  async execute(dto: CreateFileDto): Promise<FileEntity> {
    const now = new Date();
    const file = new FileEntity(
      (Math.random().toString(36).slice(2) + Date.now().toString(36)).slice(0, 16),
      dto.name,
      dto.content,
      now,
      now,
    );
    return this.repo.save(file);
  }
}
