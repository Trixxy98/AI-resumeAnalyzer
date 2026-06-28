import { createSession, findUserByEmail, verifyPassword } from '~/lib/auth';
import { buildSessionCookie } from '~/lib/session-cookie';
import { checkRateLimit } from '~/lib/rate-limit';

const LOGIN_RATE_LIMIT = { max: 10, windowMs: 15 * 60 * 1000 }; // 10 attempts per 15 min

export async function action({ request }: { request: Request }) {
  try {
    const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('cf-connecting-ip') ?? 'unknown';
    const rateLimit = checkRateLimit(`login:${ip}`, LOGIN_RATE_LIMIT);
    if (!rateLimit.allowed) {
      return Response.json(
        { error: 'Too many login attempts. Please try again later.' },
        {
          status: 429,
          headers: { 'Retry-After': String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)) },
        }
      );
    }

    const body = await request.json();
    const email = String(body?.email || '').trim().toLowerCase();
    const password = String(body?.password || '');

    if (!email || !password) {
      return Response.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return Response.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const validPassword = await verifyPassword(password, user.password_hash);
    if (!validPassword) {
      return Response.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const session = await createSession(user.id);

    return Response.json(
      {
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          created_at: user.created_at,
        },
        session,
      },
      {
        headers: {
          'Set-Cookie': buildSessionCookie(session.token, session.expires_at),
        },
      }
    );
  } catch (error) {
    console.error('Login failed:', error);
    return Response.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
