import { URLSearchParams } from 'url';
import fetch from 'node-fetch';

export interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
  token_type?: string;
}

const GOOGLE_AUTH_BASE = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

export interface GoogleOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scope: string;
}

export function buildGoogleAuthUrl(cfg: GoogleOAuthConfig, state: string): string {
  const p = new URLSearchParams({
    client_id: cfg.clientId,
    redirect_uri: cfg.redirectUri,
    response_type: 'code',
    scope: cfg.scope,
    access_type: 'offline',
    prompt: 'consent',
    state,
  });
  return `${GOOGLE_AUTH_BASE}?${p.toString()}`;
}

export async function exchangeGoogleCode(cfg: GoogleOAuthConfig, code: string): Promise<GoogleTokenResponse> {
  const body = new URLSearchParams({
    code,
    client_id: cfg.clientId,
    client_secret: cfg.clientSecret,
    redirect_uri: cfg.redirectUri,
    grant_type: 'authorization_code',
  });
  const res = await fetch(GOOGLE_TOKEN_URL, { method: 'POST', body });
  if (!res.ok) throw new Error(`Google token exchange failed ${res.status}`);
  return (await res.json()) as GoogleTokenResponse;
}

export async function refreshGoogleToken(cfg: GoogleOAuthConfig, refreshToken: string): Promise<GoogleTokenResponse> {
  const body = new URLSearchParams({
    refresh_token: refreshToken,
    client_id: cfg.clientId,
    client_secret: cfg.clientSecret,
    grant_type: 'refresh_token',
  });
  const res = await fetch(GOOGLE_TOKEN_URL, { method: 'POST', body });
  if (!res.ok) throw new Error(`Google token refresh failed ${res.status}`);
  return (await res.json()) as GoogleTokenResponse;
}
