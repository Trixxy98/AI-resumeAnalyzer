import { query } from '~/lib/database';
import { findSessionByToken } from '~/lib/auth';
import { getSessionTokenFromCookie } from '~/lib/session-cookie';

export async function loader({ request }: { request: Request }) {
  try {
    const token = getSessionTokenFromCookie(request.headers.get('cookie'));
    if (!token) {
      return Response.json({ resumes: [] }, { status: 401 });
    }

    const session = await findSessionByToken(token);
    if (!session?.user_id) {
      return Response.json({ resumes: [] }, { status: 401 });
    }

    const result = await query(
      'SELECT * FROM resumes WHERE user_id = $1 ORDER BY created_at DESC',
      [session.user_id]
    );

    const resumes = result.rows.map((row) => ({
      id: row.id,
      companyName: row.company_name,
      jobTitle: row.job_title,
      imagePath: row.image_path,
      resumePath: row.resume_path,
      feedback: row.feedback,
    }));

    return Response.json({ resumes });
  } catch (error) {
    console.error('Failed to load resumes API:', error);
    return Response.json({ resumes: [] }, { status: 500 });
  }
}
