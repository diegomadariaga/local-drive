import { URLSearchParams } from 'url';
import fetch from 'node-fetch';

export interface MicrosoftTokenResponse {
  token_type: string;
  scope?: string;
  expires_in: number;
  ext_expires_in?: number;
  access_token: string;
  refresh_token?: string;
}

const MS_AUTH_BASE = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize';
const MS_TOKEN_URL = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';

export interface MicrosoftOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scope: string; // space separated
}

export function buildMicrosoftAuthUrl(cfg: MicrosoftOAuthConfig, state: string): string {
  const p = new URLSearchParams({
    client_id: cfg.clientId,
    response_type: 'code',
    redirect_uri: cfg.redirectUri,
    scope: cfg.scope,
    response_mode: 'query',
    state,
  });
  return `${MS_AUTH_BASE}?${p.toString()}`;
}

export async function exchangeMicrosoftCode(cfg: MicrosoftOAuthConfig, code: string): Promise<MicrosoftTokenResponse> {
  const body = new URLSearchParams({
    client_id: cfg.clientId,
    client_secret: cfg.clientSecret,
    code,
    redirect_uri: cfg.redirectUri,
    grant_type: 'authorization_code',
  });
  const res = await fetch(MS_TOKEN_URL, { method: 'POST', body });
  if (!res.ok) throw new Error(`Microsoft token exchange failed ${res.status}`);
  return (await res.json()) as MicrosoftTokenResponse;
}

export async function refreshMicrosoftToken(cfg: MicrosoftOAuthConfig, refreshToken: string): Promise<MicrosoftTokenResponse> {
  const body = new URLSearchParams({
    client_id: cfg.clientId,
    client_secret: cfg.clientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
    redirect_uri: cfg.redirectUri,
  });
  const res = await fetch(MS_TOKEN_URL, { method: 'POST', body });
  if (!res.ok) throw new Error(`Microsoft token refresh failed ${res.status}`);
  return (await res.json()) as MicrosoftTokenResponse;
}
