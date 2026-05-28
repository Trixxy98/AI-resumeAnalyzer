import { deleteSession } from '~/lib/auth';
import { buildExpiredSessionCookie, getSessionTokenFromCookie } from '~/lib/session-cookie';

export async function action({ request }: { request: Request }) {
  try {
    const token = getSessionTokenFromCookie(request.headers.get('cookie'));
    if (token) {
      await deleteSession(token);
    }

    return Response.json(
      { success: true },
      {
        headers: {
          'Set-Cookie': buildExpiredSessionCookie(),
        },
      }
    );
  } catch (error) {
    console.error('Logout failed:', error);
    return Response.json(
      { success: false },
      {
        status: 500,
        headers: {
          'Set-Cookie': buildExpiredSessionCookie(),
        },
      }
    );
  }
}
