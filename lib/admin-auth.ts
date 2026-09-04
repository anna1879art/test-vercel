import { createHmac, timingSafeEqual } from 'node:crypto';

export const ADMIN_COOKIE = 'candle-card-admin-session';

function env(name: 'ADMIN_USERNAME' | 'ADMIN_PASSWORD') {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not configured`);
  }
  return value;
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function credentialsAreValid(username: string, password: string) {
  return safeEqual(username, env('ADMIN_USERNAME')) && safeEqual(password, env('ADMIN_PASSWORD'));
}

export function expectedSessionToken() {
  const username = env('ADMIN_USERNAME');
  const password = env('ADMIN_PASSWORD');
  return createHmac('sha256', password)
    .update(`candle-card-admin:${username}`)
    .digest('hex');
}

export function sessionTokenIsValid(token: string | undefined) {
  if (!token) return false;
  return safeEqual(token, expectedSessionToken());
}
