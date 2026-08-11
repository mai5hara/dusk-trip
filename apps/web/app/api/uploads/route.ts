import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { getS3UploadConfig, uploadBufferToS3 } from '@/lib/s3';

export const runtime = 'nodejs';

const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const EXT_BY_TYPE: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

async function saveLocally(request: Request, filename: string, bytes: Buffer) {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  await mkdir(uploadsDir, { recursive: true });
  await writeFile(path.join(uploadsDir, filename), bytes);

  return new URL(`/uploads/${filename}`, request.url).toString();
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json(
        { message: 'file is required' },
        { status: 400 },
      );
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { message: 'Only JPEG, PNG, WebP, and GIF are allowed' },
        { status: 400 },
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { message: 'File must be 5MB or smaller' },
        { status: 400 },
      );
    }

    const ext = EXT_BY_TYPE[file.type] ?? '.bin';
    const filename = `${randomUUID()}${ext}`;
    const bytes = Buffer.from(await file.arrayBuffer());
    const s3Config = getS3UploadConfig();

    if (s3Config) {
      const key = `uploads/${filename}`;
      const url = await uploadBufferToS3({
        config: s3Config,
        key,
        body: bytes,
        contentType: file.type,
      });

      return NextResponse.json({ url, storage: 's3' });
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
