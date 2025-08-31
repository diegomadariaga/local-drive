import { FileSyncStatus } from './file-sync-status.enum';

export interface FileMetadata {
  id: string; // internal id (uuid-ish)
  providerFileId: string | null; // id en la nube
  name: string;
  path: string; // relative path inside account directory (for local copy)
  mimeType: string | null;
  size: number | null;
  status: FileSyncStatus;
  hashLocal: string | null;
  hashRemote: string | null;
  updatedAtRemote: string | null; // ISO
  updatedAtLocal: string | null; // ISO
  createdAt: string; // ISO
  accountId: number; // FK to accounts
}
