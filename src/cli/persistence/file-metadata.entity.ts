import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { FileSyncStatus } from '../domain/file-sync-status.enum';
import { AccountEntity } from './account.entity';

@Entity('files')
@Index(['accountId', 'path'], { unique: true })
export class FileMetadataEntity {
  @PrimaryColumn()
  id!: string;

  @Column({ name: 'provider_file_id', nullable: true })
  providerFileId!: string | null;

  @Column()
  name!: string;

  @Column()
  path!: string; // relative path

  @Column({ name: 'mime_type', nullable: true })
  mimeType!: string | null;

  @Column({ type: 'integer', nullable: true })
  size!: number | null;

  @Column({ type: 'text' })
  status!: FileSyncStatus;

  @Column({ name: 'hash_local', nullable: true })
  hashLocal!: string | null;

  @Column({ name: 'hash_remote', nullable: true })
  hashRemote!: string | null;

  @Column({ name: 'updated_at_remote', nullable: true })
  updatedAtRemote!: Date | null;

  @Column({ name: 'updated_at_local', nullable: true })
  updatedAtLocal!: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @Column({ name: 'account_id' })
  accountId!: number;

  @ManyToOne(() => AccountEntity, (a) => a.files, { onDelete: 'CASCADE' })
  account!: AccountEntity;
}
