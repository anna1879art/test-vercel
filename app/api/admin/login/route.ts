import { NextResponse } from 'next/server';
import { ADMIN_COOKIE, credentialsAreValid, expectedSessionToken } from '../../../../lib/admin-auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = typeof body?.username === 'string' ? body.username : '';
    const password = typeof body?.password === 'string' ? body.password : '';

    if (!credentialsAreValid(username, password)) {
      return NextResponse.json({ ok: false, error: 'Неверный логин или пароль' }, { status: 401 });
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(ADMIN_COOKIE, expectedSessionToken(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 8,
    });
    return response;
  } catch (error) {
    console.error('Admin login failed:', error);
    return NextResponse.json(
      { ok: false, error: 'ADMIN_USERNAME / ADMIN_PASSWORD не настроены на сервере' },
      { status: 500 },
    );
  }
}
