import {
  randomBytes,
  createCipheriv,
  createDecipheriv,
  createHash,
} from 'crypto';

const KEY_ENV = 'LOCAL_DRIVE_KEY';

function getKey(): Buffer {
  const secret = process.env[KEY_ENV];
  if (!secret) throw new Error(`Missing env ${KEY_ENV}`);
  // Derive 32 bytes via SHA-256
  return createHash('sha256').update(secret).digest();
}

export function encryptPlain(text: string): string {
  const key = getKey();
  const iv = randomBytes(12); // GCM nonce
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(text, 'utf8'),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, ciphertext]).toString('base64');
}

export function decryptToPlain(payload: string): string {
  const raw = Buffer.from(payload, 'base64');
  const iv = raw.subarray(0, 12);
  const tag = raw.subarray(12, 28);
  const data = raw.subarray(28);
  const key = getKey();
  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const plain = Buffer.concat([decipher.update(data), decipher.final()]);
  return plain.toString('utf8');
}
