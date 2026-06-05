import { createSession, createUser } from '~/lib/auth';
import { buildSessionCookie } from '~/lib/session-cookie';

const isStrongPassword = (password: string) =>
  password.length >= 8 &&
  /[a-z]/.test(password) &&
  /[A-Z]/.test(password) &&
  /\d/.test(password) &&
  /[^A-Za-z0-9]/.test(password);

export async function action({ request }: { request: Request }) {
  try {
    const body = await request.json();
    const email = String(body?.email || '').trim().toLowerCase();
    const password = String(body?.password || '');
    const firstName = body?.firstName ? String(body.firstName).trim() : undefined;
    const lastName = body?.lastName ? String(body.lastName).trim() : undefined;

    if (!email || !password) {
      return Response.json({ error: 'Email and password are required' }, { status: 400 });
    }

    if (!isStrongPassword(password)) {
      return Response.json(
        {
          error:
            'Password must be at least 8 characters and include uppercase, lowercase, number, and special character',
        },
        { status: 400 }
      );
    }

    const user = await createUser(email, password, firstName, lastName);
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
    console.error('Signup failed:', error);
    return Response.json({ error: 'Failed to create account' }, { status: 500 });
  }
}
