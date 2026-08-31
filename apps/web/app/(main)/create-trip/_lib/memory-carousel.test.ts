import { describe, it, expect } from 'vitest';
import { getCarouselCardStyle } from './memory-carousel';

describe('getCarouselCardStyle', () => {
  it('keeps the active card facing forward', () => {
    const style = getCarouselCardStyle(0);

    expect(style.opacity).toBe(1);
    expect(style.zIndex).toBe(10);
    expect(style.transform).toContain('rotateY(0deg)');
    expect(style.pointerEvents).toBe('auto');
  });

  it('rotates neighbor cards away from the viewer', () => {
    const right = getCarouselCardStyle(1);
    const left = getCarouselCardStyle(-1);

    expect(right.transform).toContain('rotateY(-20deg)');
    expect(left.transform).toContain('rotateY(20deg)');
    expect(right.transform).toContain('translateX(24%)');
    expect(left.transform).toContain('translateX(-24%)');
    expect(right.opacity).toBeLessThan(1);
  });

  it('keeps a second neighbor visible on each side', () => {
    const style = getCarouselCardStyle(2);

    expect(style.opacity).toBeGreaterThan(0);
    expect(style.transform).toContain('translateX(48%)');
    expect(style.pointerEvents).toBe('auto');
  });

  it('hides cards beyond two steps', () => {
    const style = getCarouselCardStyle(3);

    expect(style.opacity).toBe(0);
    expect(style.pointerEvents).toBe('none');
  });

  it('skips rotation when motion is reduced', () => {
    const style = getCarouselCardStyle(1, true);

    expect(style.transform).toContain('rotateY(0deg)');
  });
});
