import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { getS3UploadConfig, uploadBufferToS3 } from '@/lib/s3';
import { requireAuthenticatedUser } from '@/lib/auth/require-authenticated-user';
import { detectImageType } from '@/lib/detect-image-type';

export const runtime = 'nodejs';

const MAX_SIZE_BYTES = 5 * 1024 * 1024;

/** Dev-only fallback. Do not use on serverless — filesystem is ephemeral. */
async function saveLocally(request: Request, filename: string, bytes: Buffer) {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  await mkdir(uploadsDir, { recursive: true });
  await writeFile(path.join(uploadsDir, filename), bytes);

  return new URL(`/uploads/${filename}`, request.url).toString();
}

export async function POST(request: Request) {
  try {
    const auth = await requireAuthenticatedUser(request);
    if (!auth.ok) {
      return NextResponse.json(
        { message: auth.message },
        { status: auth.status },
      );
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json(
        { message: 'file is required' },
        { status: 400 },
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { message: 'File must be 5MB or smaller' },
        { status: 400 },
      );
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const detected = detectImageType(bytes);

    if (!detected) {
      return NextResponse.json(
        { message: 'Only JPEG, PNG, WebP, and GIF are allowed' },
        { status: 400 },
      );
    }

    const filename = `${randomUUID()}${detected.extension}`;
    const s3Config = getS3UploadConfig();

    if (s3Config) {
      const key = `uploads/${filename}`;
      const url = await uploadBufferToS3({
        config: s3Config,
        key,
        body: bytes,
        contentType: detected.mime,
      });

      return NextResponse.json({ url, storage: 's3' });
    }

    // public/uploads is ephemeral/read-only on serverless (e.g. Vercel).
    if (process.env.NODE_ENV === 'production') {
      console.error(
        'Uploads require S3 in production. Set AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and S3_BUCKET_NAME.',
      );
      return NextResponse.json(
        { message: 'Image upload is temporarily unavailable' },
        { status: 503 },
      );
    }

    const url = await saveLocally(request, filename, bytes);
    return NextResponse.json({ url, storage: 'local' });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Failed to upload file' },
      { status: 500 },
    );
  }
}
