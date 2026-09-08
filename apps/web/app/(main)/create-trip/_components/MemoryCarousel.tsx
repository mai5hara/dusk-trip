'use client';

import {
  useRef,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';
import Image from 'next/image';
import { Button } from '@mood-trip/ui';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import {
  getCarouselCardStyle,
  MAX_VISIBLE_OFFSET,
} from '../_lib/memory-carousel';

type CarouselItem = {
  id?: string;
  photoUrl: string;
};

type MemoryCarouselProps = {
  items: CarouselItem[];
  activeSlot: number;
  onActiveSlotChange: (slot: number) => void;
  activePhotoField: ReactNode;
};

function _stepSlot(slot: number, delta: number, count: number): number {
  return Math.min(count - 1, Math.max(0, slot + delta));
}

function _isControlTarget(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && Boolean(target.closest('button'));
}

const MemoryCarousel = ({
  items,
  activeSlot,
  onActiveSlotChange,
  activePhotoField,
}: MemoryCarouselProps) => {
  const pointerX = useRef<number | null>(null);
  const count = items.length;
  const canPrev = activeSlot > 0;
  const canNext = activeSlot < count - 1;

  const goBy = (delta: number): void => {
    onActiveSlotChange(_stepSlot(activeSlot, delta, count));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === 'ArrowLeft' && canPrev) {
      event.preventDefault();
      goBy(-1);
    }
    if (event.key === 'ArrowRight' && canNext) {
      event.preventDefault();
      goBy(1);
    }
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>): void => {
    if (_isControlTarget(event.target)) {
      pointerX.current = null;
      return;
    }
    pointerX.current = event.clientX;
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>): void => {
    if (pointerX.current === null) return;
    const delta = event.clientX - pointerX.current;
    pointerX.current = null;
    if (_isControlTarget(event.target)) return;
    if (delta > 48 && canPrev) goBy(-1);
    if (delta < -48 && canNext) goBy(1);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="relative w-full">
        <div
          className="invisible mx-auto aspect-4/3 w-[90%]"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 touch-pan-y outline-none"
          style={{ perspective: '1200px' }}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          aria-roledescription="carousel"
          aria-label="Memories"
        >
          {items.map((item, slot) => {
            const offset = slot - activeSlot;
            if (Math.abs(offset) > MAX_VISIBLE_OFFSET) return null;

            const isActive = slot === activeSlot;
            const style = getCarouselCardStyle(offset);

            return (
              <div
                key={item.id ?? `memory-${slot}`}
                className="absolute top-1/2 left-1/2 aspect-4/3 w-[90%] origin-center overflow-hidden rounded-2xl motion-reduce:transition-none"
                style={{
                  ...style,
                  transition:
                    'transform 420ms cubic-bezier(0.22, 1, 0.36, 1), opacity 280ms ease-out',
                }}
              >
                {isActive ? (
                  <div className="size-full overflow-hidden shadow-[var(--shadow-button-raised-hover)]">
                    {activePhotoField}
                  </div>
                ) : (
                  <button
                    type="button"
                    className="relative size-full overflow-hidden rounded-2xl bg-black/5"
                    onClick={() => onActiveSlotChange(slot)}
                    aria-label={`Show memory ${slot + 1}`}
                  >
                    {item.photoUrl ? (
                      <Image
                        src={item.photoUrl}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="90vw"
                        unoptimized
                        draggable={false}
                      />
                    ) : (
                      <span className="flex size-full items-center justify-center text-xs opacity-50">
                        No photo
                      </span>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {count > 1 ? (
        <div className="flex items-center justify-between gap-3">
          <p className="font-mono text-sm opacity-70">
            {String(activeSlot + 1).padStart(2, '0')} /{' '}
            {String(count).padStart(2, '0')}
          </p>
          <div className="flex items-center gap-1.5">
            {items.map((item, slot) => (
              <button
                key={item.id ?? `dot-${slot}`}
                type="button"
                aria-label={`Memory ${slot + 1}`}
                aria-current={slot === activeSlot ? true : undefined}
                onClick={() => onActiveSlotChange(slot)}
                className={
                  slot === activeSlot
                    ? 'h-1.5 w-6 rounded-full bg-accent transition-[width] duration-300 ease-out'
                    : 'size-1.5 rounded-full bg-black/20 transition-colors duration-200 hover:bg-black/40'
                }
              />
            ))}
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              rounded="full"
              disabled={!canPrev}
              onClick={() => goBy(-1)}
              aria-label="Previous memory"
            >
              <ChevronLeftIcon className="size-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              rounded="full"
              disabled={!canNext}
              onClick={() => goBy(1)}
              aria-label="Next memory"
            >
              <ChevronRightIcon className="size-4" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default MemoryCarousel;
