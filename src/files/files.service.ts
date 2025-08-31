import { Injectable, NotFoundException } from '@nestjs/common';

export interface FileItem {
  id: string;
  name: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class FilesService {
  private files: FileItem[] = [];

  list(): FileItem[] {
    return this.files;
  }

  get(id: string): FileItem {
    const file = this.files.find((f) => f.id === id);
    if (!file) {
      throw new NotFoundException(`File ${id} not found`);
    }
    return file;
  }

  create(name: string, content: string): FileItem {
    const now = new Date();
    const file: FileItem = {
      id: (Math.random().toString(36).slice(2) + Date.now().toString(36)).slice(
        0,
        16,
      ),
      name,
      content,
      createdAt: now,
      updatedAt: now,
    };
    this.files.push(file);
    return file;
  }
}
