import { mkdirSync, existsSync } from 'fs';
import { join } from 'path';

export const DATA_ROOT = process.env.LOCAL_DRIVE_DATA || join(process.cwd(), 'data');

export function ensureDir(path: string) {
  if (!existsSync(path)) mkdirSync(path, { recursive: true });
}

export function accountsDbPath() {
  ensureDir(DATA_ROOT);
  return join(DATA_ROOT, 'accounts.db');
}

export function accountRootDir(accountId: number) {
  const dir = join(DATA_ROOT, 'accounts', String(accountId));
  ensureDir(dir);
  return dir;
}

export function accountFilesDir(accountId: number) {
  const dir = join(accountRootDir(accountId), 'files');
  ensureDir(dir);
  return dir;
}

export function accountCredentialsPath(accountId: number) {
  return join(accountRootDir(accountId), 'credentials.json');
}

export function accountFilesDbPath(accountId: number) {
  return join(accountRootDir(accountId), 'files.db');
}
