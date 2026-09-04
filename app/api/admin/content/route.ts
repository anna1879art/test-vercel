import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { ADMIN_COOKIE, sessionTokenIsValid } from '../../../../lib/admin-auth';
import { readSiteFromGithub } from '../../../../lib/github-site';

export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    const cookieStore = await cookies();
    if (!sessionTokenIsValid(cookieStore.get(ADMIN_COOKIE)?.value)) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ ok: true, ...(await readSiteFromGithub()) });
  } catch (error) {
    console.error('Unable to load site content:', error instanceof Error ? error.message : error);
    return NextResponse.json({ ok: false, error: 'Could not load site content from GitHub. Check the server configuration.' }, { status: 500 });
  }
}
