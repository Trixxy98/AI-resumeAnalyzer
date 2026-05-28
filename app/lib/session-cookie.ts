export function getSessionTokenFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;

  const sessionCookie = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith('session='));

  if (!sessionCookie) return null;
  const token = sessionCookie.split('=').slice(1).join('=');
  return token || null;
}

export function buildSessionCookie(token: string, expiresAt: Date | string): string {
  const expires = (expiresAt instanceof Date ? expiresAt : new Date(expiresAt)).toUTCString();
  return `session=${token}; Expires=${expires}; Path=/; SameSite=Lax`;
}

export function buildExpiredSessionCookie(): string {
  return 'session=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/; SameSite=Lax';
}
