'use client';

import { useCallback, useEffect, useEffectEvent, useRef } from 'react';

// Where in the scroll viewport a card is considered "active" — a line ~38%
// from the top of the list.
const ACTIVE_LINE_RATIO = 0.38;
const EDGE_EPSILON_PX = 4;

export function useScrollSpy(
  containerSelector: string,
  itemIds: string[],
  onActiveChange: (id: string) => void,
  enabled: boolean,
) {
  const ignoreUntilRef = useRef(0);
  const onActiveChangeEvent = useEffectEvent(onActiveChange);

  useEffect(() => {
    const root = document.querySelector(containerSelector);
    if (!enabled || !(root instanceof HTMLElement) || itemIds.length === 0) {
      return;
    }

    let frame = 0;

    const computeActive = () => {
      frame = 0;
      if (Date.now() < ignoreUntilRef.current) {
        return;
      }

      const { scrollTop, clientHeight, scrollHeight } = root;

      // The first and last cards never cross a centre line, so resolve the
      // scroll extremes explicitly: top of the list -> first stop, bottom of
      // the list -> last stop.
      if (scrollTop <= EDGE_EPSILON_PX) {
        emit(itemIds[0]);
        return;
      }
      if (scrollTop + clientHeight >= scrollHeight - EDGE_EPSILON_PX) {
        emit(itemIds[itemIds.length - 1]);
        return;
      }

      // Otherwise pick the last card whose top edge has crossed the active line.
      const line =
        root.getBoundingClientRect().top + clientHeight * ACTIVE_LINE_RATIO;
      let activeId = itemIds[0];
      for (const id of itemIds) {
        const element = root.querySelector(`[data-stop-id="${id}"]`);
        if (!element) {
          continue;
        }
        if (element.getBoundingClientRect().top - 1 <= line) {
          activeId = id;
        } else {
          break;
        }
      }
      emit(activeId);
    };

    const emit = (id: string | undefined) => {
      if (id) {
        onActiveChangeEvent(id);
      }
    };

    const onScroll = () => {
      if (frame) {
        return;
      }
      frame = requestAnimationFrame(computeActive);
    };

    root.addEventListener('scroll', onScroll, { passive: true });
    // Resolve the initial active card once layout is ready.
    computeActive();

    return () => {
      root.removeEventListener('scroll', onScroll);
      if (frame) {
        cancelAnimationFrame(frame);
      }
    };
  }, [containerSelector, enabled, itemIds]);

  const pauseScrollSpy = useCallback((durationMs = 1200) => {
    ignoreUntilRef.current = Date.now() + durationMs;
  }, []);

  return { pauseScrollSpy };
}
