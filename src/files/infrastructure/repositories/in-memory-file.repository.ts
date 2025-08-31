import { FileEntity } from '../../domain/file.entity';
import { FileRepository } from '../../domain/file.repository';

export class InMemoryFileRepository implements FileRepository {
  private items: FileEntity[] = [];

  findAll(): Promise<FileEntity[]> {
    return Promise.resolve(this.items);
  }

  findById(id: string): Promise<FileEntity | null> {
    return Promise.resolve(this.items.find((f) => f.id === id) || null);
  }

  save(file: FileEntity): Promise<FileEntity> {
    const existing = this.items.findIndex((f) => f.id === file.id);
    if (existing >= 0) {
      this.items[existing] = file;
    } else {
      this.items.push(file);
    }
    return Promise.resolve(file);
  }
}
