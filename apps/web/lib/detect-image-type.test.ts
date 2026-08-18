import { describe, it, expect } from 'vitest';
import { detectImageType } from './detect-image-type';

describe('detectImageType', () => {
  it('detects JPEG', () => {
    const bytes = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
    expect(detectImageType(bytes)).toEqual({
      mime: 'image/jpeg',
      extension: '.jpg',
    });
  });

  it('detects PNG', () => {
    const bytes = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x00,
    ]);
    expect(detectImageType(bytes)).toEqual({
      mime: 'image/png',
      extension: '.png',
    });
  });

  it('detects GIF89a', () => {
    const bytes = Buffer.from([
      0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    ]);
    expect(detectImageType(bytes)).toEqual({
      mime: 'image/gif',
      extension: '.gif',
    });
  });

  it('detects WebP', () => {
    const bytes = Buffer.from([
      0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
    ]);
    expect(detectImageType(bytes)).toEqual({
      mime: 'image/webp',
      extension: '.webp',
    });
  });

  it('rejects spoofed non-image bytes', () => {
    const bytes = Buffer.from('not an image file!!!!!');
    expect(detectImageType(bytes)).toBeNull();
  });

  it('rejects buffers that are too short', () => {
    expect(detectImageType(Buffer.from([0xff, 0xd8]))).toBeNull();
    expect(detectImageType(Buffer.alloc(0))).toBeNull();
  });
});
