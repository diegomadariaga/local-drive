import { AppDataSource } from '../persistence/data-source';
import { AccountEntity } from '../persistence/account.entity';
import { encryptPlain, decryptToPlain } from '../security/crypto.util';

export interface OAuthTokenSet {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number; // seconds
  tokenType?: string;
  scope?: string;
  obtainedAt?: number; // epoch ms (now)
}

export async function storeTokens(account: AccountEntity, set: OAuthTokenSet) {
  if (set.accessToken) account.accessTokenEnc = encryptPlain(set.accessToken);
  if (set.refreshToken) account.refreshTokenEnc = encryptPlain(set.refreshToken);
  if (set.expiresIn) account.expiresAt = Date.now() + set.expiresIn * 1000;
  if (set.tokenType) account.tokenType = set.tokenType;
  if (set.scope) account.scope = set.scope;
  await AppDataSource.getRepository(AccountEntity).save(account);
}

export function hasValidAccess(account: AccountEntity): boolean {
  if (!account.accessTokenEnc) return false;
  if (!account.expiresAt) return true; // no expiry stored
  return Date.now() < account.expiresAt - 5000; // 5s skew
}

export function getAccessToken(account: AccountEntity): string | null {
  if (!account.accessTokenEnc) return null;
  try {
    return decryptToPlain(account.accessTokenEnc);
  } catch {
    return null;
  }
}

export function getRefreshToken(account: AccountEntity): string | null {
  if (!account.refreshTokenEnc) return null;
  try {
    return decryptToPlain(account.refreshTokenEnc);
  } catch {
    return null;
  }
}
