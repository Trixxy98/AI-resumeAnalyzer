import { findSessionByToken } from '~/lib/auth';
import { buildExpiredSessionCookie, getSessionTokenFromCookie } from '~/lib/session-cookie';

export async function loader({ request }: { request: Request }) {
  try {
    const token = getSessionTokenFromCookie(request.headers.get('cookie'));
    if (!token) {
      return Response.json({ user: null });
    }

    const session = await findSessionByToken(token);
    if (!session) {
      return Response.json(
        { user: null },
        { headers: { 'Set-Cookie': buildExpiredSessionCookie() } }
      );
    }

    return Response.json({
      user: {
        id: session.user_id,
        email: session.email,
        first_name: session.first_name,
        last_name: session.last_name,
        created_at: session.created_at,
      },
    });
  } catch (error) {
    console.error('Auth check failed:', error);
    return Response.json(
      { user: null },
      { status: 500, headers: { 'Set-Cookie': buildExpiredSessionCookie() } }
    );
  }
}
