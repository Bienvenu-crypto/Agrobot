import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('mp_session')?.value;
    if (!sessionId) return NextResponse.json({ user: null });

    const session = db
      .prepare('SELECT user_id, expires_at FROM marketplace_sessions WHERE id = ?')
      .get(sessionId) as any;

    if (!session) return NextResponse.json({ user: null });

    if (new Date(session.expires_at) < new Date()) {
      db.prepare('DELETE FROM marketplace_sessions WHERE id = ?').run(sessionId);
      return NextResponse.json({ user: null });
    }

    const user = db
      .prepare('SELECT id, name, email, phone, district, role FROM marketplace_users WHERE id = ?')
      .get(session.user_id) as any;

    return NextResponse.json({ user: user || null });
  } catch (error) {
    return NextResponse.json({ user: null });
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('mp_session')?.value;
    if (sessionId) {
      db.prepare('DELETE FROM marketplace_sessions WHERE id = ?').run(sessionId);
    }
    const response = NextResponse.json({ ok: true });
    response.cookies.delete('mp_session');
    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}
