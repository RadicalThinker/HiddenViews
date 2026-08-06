import crypto from 'crypto';

const ALG = 'HS256';
const ISSUER = 'hiddenviews-mobile';

function b64url(input: string | Buffer): string {
  return Buffer.from(input as any)
    .toString('base64')
    .replace(/=+$/, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function sign(part: string): string {
  return crypto
    .createHmac('sha256', String(process.env.NEXTAUTH_SECRET || ''))
    .update(part)
    .digest('base64')
    .replace(/=+$/, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

export interface MobileTokenPayload {
  sub: string; // user._id
  username: string;
  email: string;
  isVerified: boolean;
  isAcceptingMessages: boolean;
  iat: number;
  exp: number;
  iss: string;
}

export function signMobileToken(payload: Omit<MobileTokenPayload, 'iss' | 'iat' | 'exp'>): string {
  if (!process.env.NEXTAUTH_SECRET) {
    throw new Error('NEXTAUTH_SECRET is not configured');
  }
  const now = Math.floor(Date.now() / 1000);
  const full: MobileTokenPayload = {
    ...payload,
    iss: ISSUER,
    iat: now,
    exp: now + 30 * 24 * 60 * 60, // 30 days
  };
  const header = b64url(JSON.stringify({ alg: ALG, typ: 'JWT' }));
  const body = b64url(JSON.stringify(full));
  const part = `${header}.${body}`;
  return `${part}.${sign(part)}`;
}

export function verifyMobileToken(token: string): MobileTokenPayload | null {
  if (!process.env.NEXTAUTH_SECRET) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, body, signature] = parts;
  const expected = sign(`${header}.${body}`);
  // Timing-safe compare
  if (signature.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  try {
    const payload = JSON.parse(
      Buffer.from(body, 'base64').toString('utf8')
    ) as MobileTokenPayload;
    if (payload.iss !== ISSUER) return null;
    if (typeof payload.exp !== 'number' || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export async function getUserFromBearer(request: Request) {
  const auth = request.headers.get('authorization') || '';
  if (!auth.toLowerCase().startsWith('bearer ')) return null;
  const token = auth.slice(7).trim();
  return verifyMobileToken(token);
}
