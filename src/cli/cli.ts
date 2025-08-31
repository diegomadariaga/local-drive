#!/usr/bin/env ts-node
import { randomUUID } from 'crypto';
import { parseProvider } from './domain/provider.enum';
import { FileSyncStatus } from './domain/file-sync-status.enum';
import { initDataSource, AppDataSource } from './persistence/data-source';
import { AccountEntity } from './persistence/account.entity';
import { FileMetadataEntity } from './persistence/file-metadata.entity';
import {
  buildGoogleAuthUrl,
  exchangeGoogleCode,
  refreshGoogleToken,
} from './oauth/google-oauth.client';
import {
  buildMicrosoftAuthUrl,
  exchangeMicrosoftCode,
  refreshMicrosoftToken,
} from './oauth/microsoft-oauth.client';
import {
  storeTokens,
  getRefreshToken,
  hasValidAccess,
  getAccessToken,
} from './oauth/token.manager';

function help() {
  console.log(`Commands:
  add-account <alias> <provider> <externalId>
  list-accounts
  list-files <alias>
  sync-pull <alias>
  sync-push <alias>
  oauth-url <alias>
  oauth-complete <alias> <code>
  refresh-token <alias>
  `);
}

async function main() {
  await initDataSource();
  const accountRepo = AppDataSource.getRepository(AccountEntity);
  const fileRepo = AppDataSource.getRepository(FileMetadataEntity);
  const [cmd, ...rest] = process.argv.slice(2);
  try {
    switch (cmd) {
      case 'add-account': {
        const [alias, providerStr, externalId] = rest;
        if (!alias || !providerStr || !externalId)
          throw new Error('Usage: add-account <alias> <provider> <externalId>');
        const existing = await accountRepo.findOne({ where: { alias } });
        if (existing) throw new Error('Alias already exists');
        const provider = parseProvider(providerStr);
        const account = accountRepo.create({
          alias,
          provider,
          externalId,
          credentialsPath: 'credentials.json',
        });
        await accountRepo.save(account);
        console.log('Created account', {
          id: account.id,
          alias: account.alias,
          provider: account.provider,
        });
        break;
      }
      case 'list-accounts': {
        const accounts = await accountRepo.find();
        console.table(
          accounts.map((a) => ({
            id: a.id,
            alias: a.alias,
            provider: a.provider,
            createdAt: a.createdAt,
          })),
        );
        break;
      }
      case 'list-files': {
        const [alias] = rest;
        if (!alias) throw new Error('Usage: list-files <alias>');
        const account = await accountRepo.findOne({ where: { alias } });
        if (!account) throw new Error('Account not found');
        const files = await fileRepo.find({ where: { accountId: account.id } });
        console.table(
          files.map((f) => ({
            id: f.id,
            name: f.name,
            status: f.status,
            path: f.path,
          })),
        );
        break;
      }
      case 'sync-pull': {
        const [alias] = rest;
        if (!alias) throw new Error('Usage: sync-pull <alias>');
        const account = await accountRepo.findOne({ where: { alias } });
        if (!account) throw new Error('Account not found');
        const fakeRemoteFiles = [
          { providerFileId: 'r1', name: 'remote-file-1.txt' },
          { providerFileId: 'r2', name: 'remote-file-2.txt' },
        ];
        for (const f of fakeRemoteFiles) {
          const entity = fileRepo.create({
            id: randomUUID(),
            providerFileId: f.providerFileId,
            name: f.name,
            path: f.name,
            mimeType: 'text/plain',
            size: null,
            status: FileSyncStatus.CLOUD_ONLY,
            hashLocal: null,
            hashRemote: null,
            updatedAtRemote: new Date(),
            updatedAtLocal: null,
            accountId: account.id,
          });
          await fileRepo.save(entity);
        }
        console.log('Pulled', fakeRemoteFiles.length, 'remote files (stub)');
        break;
      }
      case 'sync-push': {
        const [alias] = rest;
        if (!alias) throw new Error('Usage: sync-push <alias>');
        const account = await accountRepo.findOne({ where: { alias } });
        if (!account) throw new Error('Account not found');
        const localOnly = await fileRepo.find({
          where: { accountId: account.id, status: FileSyncStatus.LOCAL_ONLY },
        });
        for (const meta of localOnly) {
          meta.status = FileSyncStatus.SYNCED;
          meta.providerFileId =
            meta.providerFileId || 'uploaded-' + meta.id.slice(0, 8);
          meta.updatedAtRemote = new Date();
          await fileRepo.save(meta);
        }
        console.log('Uploaded', localOnly.length, 'files (stub)');
        break;
      }
      case 'oauth-url': {
        const [alias] = rest;
        if (!alias) throw new Error('Usage: oauth-url <alias>');
        const account = await accountRepo.findOne({ where: { alias } });
        if (!account) throw new Error('Account not found');
        const state = account.id + ':' + Date.now();
        if (account.provider === 'google') {
          const url = buildGoogleAuthUrl(
            {
              clientId: mustEnv('GOOGLE_CLIENT_ID'),
              clientSecret: mustEnv('GOOGLE_CLIENT_SECRET'),
              redirectUri: mustEnv('GOOGLE_REDIRECT_URI'),
              scope:
                process.env.GOOGLE_SCOPE ||
                'https://www.googleapis.com/auth/drive.readonly',
            },
            state,
          );
          console.log(url);
        } else if (account.provider === 'onedrive') {
          const url = buildMicrosoftAuthUrl(
            {
              clientId: mustEnv('MICROSOFT_CLIENT_ID'),
              clientSecret: mustEnv('MICROSOFT_CLIENT_SECRET'),
              redirectUri: mustEnv('MICROSOFT_REDIRECT_URI'),
              scope: process.env.MICROSOFT_SCOPE || 'offline_access Files.Read',
            },
            state,
          );
          console.log(url);
        } else {
          throw new Error('Unsupported provider for oauth-url');
        }
        break;
      }
      case 'oauth-complete': {
        const [alias, code] = rest;
        if (!alias || !code)
          throw new Error('Usage: oauth-complete <alias> <code>');
        const account = await accountRepo.findOne({ where: { alias } });
        if (!account) throw new Error('Account not found');
        if (account.provider === 'google') {
          const resp = await exchangeGoogleCode(
            {
              clientId: mustEnv('GOOGLE_CLIENT_ID'),
              clientSecret: mustEnv('GOOGLE_CLIENT_SECRET'),
              redirectUri: mustEnv('GOOGLE_REDIRECT_URI'),
              scope:
                process.env.GOOGLE_SCOPE ||
                'https://www.googleapis.com/auth/drive.readonly',
            },
            code,
          );
          await storeTokens(account, {
            accessToken: resp.access_token,
            refreshToken: resp.refresh_token,
            expiresIn: resp.expires_in,
            tokenType: resp.token_type,
            scope: resp.scope,
          });
        } else if (account.provider === 'onedrive') {
          const resp = await exchangeMicrosoftCode(
            {
              clientId: mustEnv('MICROSOFT_CLIENT_ID'),
              clientSecret: mustEnv('MICROSOFT_CLIENT_SECRET'),
              redirectUri: mustEnv('MICROSOFT_REDIRECT_URI'),
              scope: process.env.MICROSOFT_SCOPE || 'offline_access Files.Read',
            },
            code,
          );
          await storeTokens(account, {
            accessToken: resp.access_token,
            refreshToken: resp.refresh_token,
            expiresIn: resp.expires_in,
            tokenType: resp.token_type,
            scope: resp.scope,
          });
        } else {
          throw new Error('Unsupported provider for oauth-complete');
        }
        console.log('Tokens stored');
        break;
      }
      case 'refresh-token': {
        const [alias] = rest;
        if (!alias) throw new Error('Usage: refresh-token <alias>');
        const account = await accountRepo.findOne({ where: { alias } });
        if (!account) throw new Error('Account not found');
        const refreshToken = getRefreshToken(account);
        if (!refreshToken) throw new Error('No refresh token stored');
        if (account.provider === 'google') {
          const resp = await refreshGoogleToken(
            {
              clientId: mustEnv('GOOGLE_CLIENT_ID'),
              clientSecret: mustEnv('GOOGLE_CLIENT_SECRET'),
              redirectUri: mustEnv('GOOGLE_REDIRECT_URI'),
              scope:
                process.env.GOOGLE_SCOPE ||
                'https://www.googleapis.com/auth/drive.readonly',
            },
            refreshToken,
          );
          await storeTokens(account, {
            accessToken: resp.access_token,
            // Google may not always return refresh_token on refresh
            refreshToken: resp.refresh_token || refreshToken,
            expiresIn: resp.expires_in,
            tokenType: resp.token_type,
            scope: resp.scope,
          });
        } else if (account.provider === 'onedrive') {
          const resp = await refreshMicrosoftToken(
            {
              clientId: mustEnv('MICROSOFT_CLIENT_ID'),
              clientSecret: mustEnv('MICROSOFT_CLIENT_SECRET'),
              redirectUri: mustEnv('MICROSOFT_REDIRECT_URI'),
              scope: process.env.MICROSOFT_SCOPE || 'offline_access Files.Read',
            },
            refreshToken,
          );
          await storeTokens(account, {
            accessToken: resp.access_token,
            refreshToken: resp.refresh_token || refreshToken,
            expiresIn: resp.expires_in,
            tokenType: resp.token_type,
            scope: resp.scope,
          });
        } else {
          throw new Error('Unsupported provider for refresh-token');
        }
        console.log('Token refreshed');
        break;
      }
      default:
        help();
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('Error:', msg);
    process.exitCode = 1;
  } finally {
    if (AppDataSource.isInitialized) await AppDataSource.destroy();
  }
}

function mustEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

void main();
