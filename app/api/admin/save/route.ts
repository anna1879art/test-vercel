import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { validateSiteContent } from '../../../content';
import { ADMIN_COOKIE, sessionTokenIsValid } from '../../../../lib/admin-auth';
import { saveSiteToGithub, type PendingImage } from '../../../../lib/github-site';

const IMAGE_TYPES: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' };
const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
const MAX_TOTAL_BYTES = 4 * 1024 * 1024;

function invalid(message: string): never {
  const error = new Error(message); error.name = 'ValidationError'; throw error;
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    if (!sessionTokenIsValid(cookieStore.get(ADMIN_COOKIE)?.value)) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    const form = await request.formData();
    const version = form.get('version');
    const serialized = form.get('data');
    if (typeof version !== 'string' || !version) invalid('Missing content version. Refresh the editor.');
    if (typeof serialized !== 'string') invalid('Missing site data.');
    const data = validateSiteContent(JSON.parse(serialized));
    const images: PendingImage[] = [];
    let totalBytes = 0;
    for (const section of data.sections) {
      const value = form.get(`image:${section.id}`);
      if (value === null) continue;
      if (!(value instanceof File) || !value.size) invalid(`Replacement image for ${section.title} is invalid.`);
      const extension = IMAGE_TYPES[value.type];
      if (!extension) invalid(`Image for ${section.title} must be JPEG, PNG, WebP, or GIF.`);
      if (value.size > MAX_IMAGE_BYTES) invalid(`Image for ${section.title} exceeds 3 MB.`);
      totalBytes += value.size;
      if (totalBytes > MAX_TOTAL_BYTES) invalid('Selected images exceed the 4 MB total limit.');
      const filePath = `public/images/admin/${section.id}.${extension}`;
      section.image = filePath.slice('public'.length);
      images.push({ sectionId: section.id, path: filePath, bytes: Buffer.from(await value.arrayBuffer()) });
    }
    const result = await saveSiteToGithub(data, version, images);
    return NextResponse.json({ ok: true, data, ...result });
  } catch (error) {
    if (error instanceof Error && error.name === 'ConflictError') return NextResponse.json({ ok: false, error: error.message }, { status: 409 });
    if (error instanceof SyntaxError || (error instanceof Error && (error.name === 'ValidationError' || /required|invalid|contain|duplicated/i.test(error.message)))) return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Invalid site data' }, { status: 400 });
    console.error('GitHub save failed:', error instanceof Error ? error.message : error);
    return NextResponse.json({ ok: false, error: 'Save failed. Check the GitHub configuration and try again.' }, { status: 500 });
  }
}
