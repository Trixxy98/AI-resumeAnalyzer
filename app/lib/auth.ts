import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { query } from './database';

const SALT_ROUNDS = 12;
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days

/** Hashes a plain-text password using bcrypt. */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/** Compares a plain-text password against a stored bcrypt hash. */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/** Creates a new user record. Password is hashed before storing. */
export async function createUser(email: string, password: string, firstName?: string, lastName?: string) {
  const passwordHash = await hashPassword(password);
  const result = await query(
    'INSERT INTO users (email, password_hash, first_name, last_name) VALUES ($1, $2, $3, $4) RETURNING id, email, first_name, last_name, created_at',
    [email, passwordHash, firstName, lastName]
  );
  return result.rows[0];
}

/** Looks up a user by email. Returns undefined if not found. */
export async function findUserByEmail(email: string) {
  const result = await query(
    'SELECT id, email, password_hash, first_name, last_name, created_at FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0];
}

/** Creates a new session token for a user. Expires after 30 days. */
export async function createSession(userId: string) {
  const token = uuidv4();
  const expiresAt = new Date(Date.now() + SESSION_DURATION);

  const result = await query(
    'INSERT INTO user_sessions (user_id, token, expires_at) VALUES ($1, $2, $3) RETURNING token, expires_at',
    [userId, token, expiresAt]
  );

  return result.rows[0];
}

/**
 * Finds an active session by token.
 * Joins with users table to return full user context.
 * Returns undefined if the session is expired or not found.
 */
export async function findSessionByToken(token: string) {
  const result = await query(
    `SELECT us.token, us.expires_at, us.user_id, u.email, u.first_name, u.last_name 
     FROM user_sessions us 
     JOIN users u ON us.user_id = u.id 
     WHERE us.token = $1 AND us.expires_at > NOW()`,
    [token]
  );
  return result.rows[0];
}

/** Deletes a specific session (used on logout). */
export async function deleteSession(token: string) {
  await query('DELETE FROM user_sessions WHERE token = $1', [token]);
}

/** Cleans up all expired sessions from the database. */
export async function deleteExpiredSessions() {
  await query('DELETE FROM user_sessions WHERE expires_at <= NOW()');
}