export type CarouselCardStyle = {
  transform: string;
  zIndex: number;
  opacity: number;
  pointerEvents: 'auto' | 'none';
};

export const MAX_VISIBLE_OFFSET = 2;

const SHIFT_PCT = 24;
const ROTATE_DEG = 20;

export function getCarouselCardStyle(
  offset: number,
  reducedMotion = false,
): CarouselCardStyle {
  const distance = Math.abs(offset);
  const hidden = distance > MAX_VISIBLE_OFFSET;
  const visualOffset =
    offset === 0
      ? 0
      : Math.sign(offset) * Math.min(distance, MAX_VISIBLE_OFFSET);
  const shift = visualOffset * SHIFT_PCT;
  const rotateY = reducedMotion ? 0 : visualOffset * -ROTATE_DEG;
  const scale = 1 - Math.min(distance, MAX_VISIBLE_OFFSET) * 0.14;
  const depth =
    distance === 0 ? 0 : -Math.min(distance, MAX_VISIBLE_OFFSET) * 72;

  return {
    transform: `translate(-50%, -50%) translateX(${shift}%) rotateY(${rotateY}deg) translateZ(${depth}px) scale(${scale})`,
    zIndex: 10 - distance,
    opacity: hidden ? 0 : distance === 0 ? 1 : 0.78 - (distance - 1) * 0.18,
    pointerEvents: hidden ? 'none' : 'auto',
  };
}
