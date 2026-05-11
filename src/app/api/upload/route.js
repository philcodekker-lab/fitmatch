import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { requireRole } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

// POST /api/upload — accepts multipart form with field "file", uploads to
// Vercel Blob, returns { url }. PT-authenticated only.
export async function POST(request) {
  const user = await requireRole('PT');
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let formData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Expected multipart/form-data' }, { status: 400 });
  }

  const file = formData.get('file');
  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: 'Only JPEG, PNG, WebP or GIF images are allowed.' },
      { status: 400 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'Image must be under 5MB.' }, { status: 400 });
  }

  // Sanitize filename so blobs keep something human-readable.
  const rawName = file.name || 'upload';
  const safeName = rawName.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-60);

  try {
    const blob = await put(`trainers/${user.id}/${safeName}`, file, {
      access: 'public',
      addRandomSuffix: true,
    });
    return NextResponse.json({ url: blob.url });
  } catch (err) {
    console.error('Blob upload failed:', err);
    return NextResponse.json(
      { error: 'Upload failed. Check that BLOB_READ_WRITE_TOKEN is set.' },
      { status: 500 },
    );
  }
}
