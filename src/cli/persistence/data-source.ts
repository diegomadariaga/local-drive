import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { AccountEntity } from './account.entity';
import { FileMetadataEntity } from './file-metadata.entity';
import { ensureDir, DATA_ROOT } from '../config/paths';
import { join } from 'path';

export const dbFile = join(DATA_ROOT, 'app.db');
ensureDir(DATA_ROOT);

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: dbFile,
  entities: [AccountEntity, FileMetadataEntity],
  synchronize: true,
  logging: false,
});

export async function initDataSource() {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  return AppDataSource;
}
