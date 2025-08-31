import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CloudProvider } from '../domain/provider.enum';
import { FileMetadataEntity } from './file-metadata.entity';

@Entity('accounts')
export class AccountEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  alias!: string;

  @Column({ type: 'text' })
  provider!: CloudProvider;

  @Column({ name: 'external_id' })
  externalId!: string;

  @Column({ name: 'credentials_path' })
  credentialsPath!: string;

  @Column({ name: 'access_token_enc', type: 'text', nullable: true })
  accessTokenEnc!: string | null;

  @Column({ name: 'refresh_token_enc', type: 'text', nullable: true })
  refreshTokenEnc!: string | null;

  @Column({ name: 'token_type', type: 'text', nullable: true })
  tokenType!: string | null;

  @Column({ name: 'scope', type: 'text', nullable: true })
  scope!: string | null;

  @Column({ name: 'expires_at', type: 'integer', nullable: true }) // epoch ms
  expiresAt!: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => FileMetadataEntity, (f) => f.account)
  files!: FileMetadataEntity[];
}
