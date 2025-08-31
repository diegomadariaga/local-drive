import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
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

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => FileMetadataEntity, (f) => f.account)
  files!: FileMetadataEntity[];
}
