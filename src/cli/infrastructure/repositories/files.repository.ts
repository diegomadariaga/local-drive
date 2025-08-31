import Database from 'better-sqlite3';
import { accountFilesDbPath } from '../../config/paths';
import { FileMetadata } from '../../domain/file-metadata.entity';
import { FileSyncStatus } from '../../domain/file-sync-status.enum';

const dbCache = new Map<number, Database.Database>();

function getDb(accountId: number) {
  let db = dbCache.get(accountId);
  if (!db) {
    db = new Database(accountFilesDbPath(accountId));
    db.pragma('journal_mode = WAL');
    db.exec(`CREATE TABLE IF NOT EXISTS files (
      id TEXT PRIMARY KEY,
      provider_file_id TEXT,
      name TEXT NOT NULL,
      path TEXT NOT NULL,
      mime_type TEXT,
      size INTEGER,
      status TEXT NOT NULL,
      hash_local TEXT,
      hash_remote TEXT,
      updated_at_remote TEXT,
      updated_at_local TEXT,
      created_at TEXT NOT NULL,
      account_id INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_files_account ON files(account_id);`);
    dbCache.set(accountId, db);
  }
  return db;
}

export class FilesRepository {
  private db(accountId: number) {
    return getDb(accountId);
  }

  upsert(accountId: number, meta: FileMetadata) {
    const stmt = this.db(accountId)
      .prepare(`REPLACE INTO files (id, provider_file_id, name, path, mime_type, size, status, hash_local, hash_remote, updated_at_remote, updated_at_local, created_at, account_id)
      VALUES (@id, @providerFileId, @name, @path, @mimeType, @size, @status, @hashLocal, @hashRemote, @updatedAtRemote, @updatedAtLocal, @createdAt, @accountId)`);
    stmt.run({
      id: meta.id,
      providerFileId: meta.providerFileId,
      name: meta.name,
      path: meta.path,
      mimeType: meta.mimeType,
      size: meta.size,
      status: meta.status,
      hashLocal: meta.hashLocal,
      hashRemote: meta.hashRemote,
      updatedAtRemote: meta.updatedAtRemote,
      updatedAtLocal: meta.updatedAtLocal,
      createdAt: meta.createdAt,
      accountId: meta.accountId,
    });
  }

  list(accountId: number): FileMetadata[] {
    return this.db(accountId)
      .prepare(`SELECT * FROM files WHERE account_id = ? ORDER BY path ASC`)
      .all(accountId)
      .map((r: any) => this.map(r));
  }

  listByStatus(accountId: number, status: FileSyncStatus): FileMetadata[] {
    return this.db(accountId)
      .prepare(
        `SELECT * FROM files WHERE account_id = ? AND status = ? ORDER BY path ASC`,
      )
      .all(accountId, status)
      .map((r: any) => this.map(r));
  }

  private map(r: any): FileMetadata {
    return {
      id: r.id,
      providerFileId: r.provider_file_id,
      name: r.name,
      path: r.path,
      mimeType: r.mime_type,
      size: r.size,
      status: r.status as FileSyncStatus,
      hashLocal: r.hash_local,
      hashRemote: r.hash_remote,
      updatedAtRemote: r.updated_at_remote,
      updatedAtLocal: r.updated_at_local,
      createdAt: r.created_at,
      accountId: r.account_id,
    };
  }
}
