import Database from 'better-sqlite3';
import { accountsDbPath } from '../../config/paths';
import { Account } from '../../domain/account.entity';
import { CloudProvider } from '../../domain/provider.enum';

let db: Database.Database | null = null;

function getDb() {
  if (!db) {
    db = new Database(accountsDbPath());
    db.pragma('journal_mode = WAL');
    db.exec(`CREATE TABLE IF NOT EXISTS accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      alias TEXT NOT NULL UNIQUE,
      provider TEXT NOT NULL,
      external_id TEXT NOT NULL,
      credentials_path TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );`);
  }
  return db;
}

export class AccountsRepository {
  private db = getDb();

  insert(data: {
    alias: string;
    provider: CloudProvider;
    externalId: string;
    credentialsPath: string;
  }): Account {
    const now = new Date().toISOString();
    const stmt = this.db
      .prepare(`INSERT INTO accounts (alias, provider, external_id, credentials_path, created_at, updated_at)
      VALUES (@alias, @provider, @externalId, @credentialsPath, @createdAt, @updatedAt)`);
    const info = stmt.run({
      alias: data.alias,
      provider: data.provider,
      externalId: data.externalId,
      credentialsPath: data.credentialsPath,
      createdAt: now,
      updatedAt: now,
    });
    return this.findById(Number(info.lastInsertRowid))!;
  }

  findByAlias(alias: string): Account | null {
    const row = this.db
      .prepare(`SELECT * FROM accounts WHERE alias = ?`)
      .get(alias);
    return row ? this.map(row) : null;
  }

  findById(id: number): Account | null {
    const row = this.db.prepare(`SELECT * FROM accounts WHERE id = ?`).get(id);
    return row ? this.map(row) : null;
  }

  list(): Account[] {
    return this.db
      .prepare(`SELECT * FROM accounts ORDER BY id ASC`)
      .all()
      .map((r) => this.map(r));
  }

  private map(row: any): Account {
    return {
      id: row.id,
      alias: row.alias,
      provider: row.provider as CloudProvider,
      externalId: row.external_id,
      credentialsPath: row.credentials_path,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
