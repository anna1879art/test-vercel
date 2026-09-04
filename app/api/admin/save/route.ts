import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { validateSiteContent } from '../../../content';
import { ADMIN_COOKIE, sessionTokenIsValid } from '../../../../lib/admin-auth';
import { saveSiteToGithub } from '../../../../lib/github-site';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    if (!sessionTokenIsValid(cookieStore.get(ADMIN_COOKIE)?.value)) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    const body = await request.json();
    if (typeof body?.version !== 'string' || !body.version) return NextResponse.json({ ok: false, error: 'Missing content version. Refresh the editor.' }, { status: 400 });
    const data = validateSiteContent(body.data);
    const result = await saveSiteToGithub(data, body.version);
    return NextResponse.json({ ok: true, data, ...result });
  } catch (error) {
    if (error instanceof Error && error.name === 'ConflictError') return NextResponse.json({ ok: false, error: error.message }, { status: 409 });
    if (error instanceof SyntaxError || (error instanceof Error && /required|invalid|contain|duplicated/i.test(error.message))) return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Invalid site data' }, { status: 400 });
    console.error('GitHub save failed:', error instanceof Error ? error.message : error);
    return NextResponse.json({ ok: false, error: 'Save failed. Check the GitHub configuration and try again.' }, { status: 500 });
  }
}
