import { randomBytes } from 'node:crypto';

const SESSION_DURATION_MS = 8 * 60 * 60 * 1000;
const sessions = new Map();

export function createSession(user) {
  const token = randomBytes(32).toString('hex');
  sessions.set(token, { user, expiresAt: Date.now() + SESSION_DURATION_MS });
  return token;
}

export function findSession(token) {
  const session = sessions.get(token);
  if (!session) return null;
  if (session.expiresAt <= Date.now()) {
    sessions.delete(token);
    return null;
  }
  return session;
}

export function deleteSession(token) {
  sessions.delete(token);
}
