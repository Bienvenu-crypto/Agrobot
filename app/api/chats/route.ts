import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { id, role, content, image, user_email } = await req.json();

    const stmt = db.prepare(`
      INSERT INTO chats (id, user_email, role, content, image_url)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(id, user_email || 'anonymous', role, content, image || null);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to save chat' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const stmt = db.prepare(`
      SELECT id, role, content, image_url as image 
      FROM chats 
      WHERE user_email = ? 
      ORDER BY timestamp ASC
    `);

    const chats = stmt.all(email);

    return NextResponse.json({ chats });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to fetch chats' }, { status: 500 });
  }
}
