export enum FileSyncStatus {
  CLOUD_ONLY = 'cloud_only',
  LOCAL_ONLY = 'local_only',
  SYNCED = 'synced',
  MODIFIED_LOCAL = 'modified_local',
  MODIFIED_REMOTE = 'modified_remote',
  CONFLICT = 'conflict',
}
