import { CloudProvider } from './provider.enum';

export interface Account {
  id: number;
  alias: string; // user-friendly name
  provider: CloudProvider;
  externalId: string; // id in provider (e.g., user or drive id)
  createdAt: string; // ISO
  updatedAt: string; // ISO
  // credentials stored encrypted or token path
  credentialsPath: string; // path to credentials json (per-account dir)
}
