import { FileEntity } from './file.entity';

export interface FileRepository {
  findAll(): Promise<FileEntity[]>;
  findById(id: string): Promise<FileEntity | null>;
  save(file: FileEntity): Promise<FileEntity>;
}

export const FILE_REPOSITORY = Symbol('FILE_REPOSITORY');
