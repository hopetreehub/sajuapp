import { useEffect, useRef, useCallback } from 'react';

/**
 * 제스처 타입
 */
export type GestureType = 'swipe-left' | 'swipe-right' | 'swipe-up' | 'swipe-down' | 'pinch' | 'long-press' | 'double-tap' | 'tap';

/**
 * 제스처 이벤트 데이터
 */
export interface GestureEvent {
  type: GestureType;
  target: Element;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  deltaX: number;
  deltaY: number;
  distance: number;
  duration: number;
  scale?: number; // 핀치 제스처 시
}

/**
 * 제스처 핸들러 맵
 */
export interface GestureHandlers {
  onSwipeLeft?: (event: GestureEvent) => void;
  onSwipeRight?: (event: GestureEvent) => void;
  onSwipeUp?: (event: GestureEvent) => void;
  onSwipeDown?: (event: GestureEvent) => void;
  onPinch?: (event: GestureEvent) => void;
  onLongPress?: (event: GestureEvent) => void;
  onDoubleTap?: (event: GestureEvent) => void;
  onTap?: (event: GestureEvent) => void;
}

/**
 * 제스처 옵션
 */
export interface GestureOptions {
  swipeThreshold?: number; // 스와이프로 인식되는 최소 거리 (픽셀)
  longPressDelay?: number; // 길게 누르기 인식 시간 (밀리초)
  doubleTapDelay?: number; // 더블 탭 인식 시간 (밀리초)
  pinchThreshold?: number; // 핀치로 인식되는 최소 스케일 변화
  enabled?: boolean; // 제스처 활성화 여부
}

const DEFAULT_OPTIONS: GestureOptions = {
  swipeThreshold: 50,
  longPressDelay: 500,
  doubleTapDelay: 300,
  pinchThreshold: 0.1,
  enabled: true,
};

/**
 * 제스처 Hook
 *
 * 모바일 터치 제스처를 감지하고 핸들러를 실행합니다.
 *
 * @param handlers 제스처 핸들러 맵
 * @param options 제스처 옵션
 * @returns ref를 제스처를 감지할 엘리먼트에 연결
 *
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const gestureRef = useGestures({
 *     onSwipeLeft: () => console.log('Swiped left!'),
 *     onSwipeRight: () => console.log('Swiped right!'),
 *     onLongPress: () => console.log('Long pressed!'),
 *   });
 *
 *   return <div ref={gestureRef}>Swipe me!</div>;
 * };
 * ```
 */
export function useGestures<T extends HTMLElement = HTMLDivElement>(
  handlers: GestureHandlers,
  options: GestureOptions = {},
): React.RefObject<T> {
  const elementRef = useRef<T>(null);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const lastTapRef = useRef<number>(0);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pinchStartDistanceRef = useRef<number | null>(null);

  const opts = { ...DEFAULT_OPTIONS, ...options };

  // 두 터치 포인트 간 거리 계산
  const getDistance = (touch1: Touch, touch2: Touch): number => {
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // 스와이프 방향 결정
  const getSwipeDirection = useCallback(
    (deltaX: number, deltaY: number): GestureType | null => {
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      // 수평 스와이프
      if (absDeltaX > absDeltaY && absDeltaX > (opts.swipeThreshold || 50)) {
        return deltaX > 0 ? 'swipe-right' : 'swipe-left';
      }

      // 수직 스와이프
      if (absDeltaY > absDeltaX && absDeltaY > (opts.swipeThreshold || 50)) {
        return deltaY > 0 ? 'swipe-down' : 'swipe-up';
      }

      return null;
    },
    [opts.swipeThreshold],
  );

  // 제스처 이벤트 생성
  const createGestureEvent = useCallback(
    (
      type: GestureType,
      target: Element,
      startX: number,
      startY: number,
      endX: number,
      endY: number,
      duration: number,
      scale?: number,
    ): GestureEvent => {
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      return {
        type,
        target,
        startX,
        startY,
        endX,
        endY,
        deltaX,
        deltaY,
        distance,
        duration,
        scale,
      };
    },
    [],
  );

  // Touch Start 핸들러
  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (!opts.enabled) return;

      const touch = e.touches[0];
      const now = Date.now();

      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: now,
      };

      // 핀치 제스처 시작 (두 손가락)
      if (e.touches.length === 2) {
        pinchStartDistanceRef.current = getDistance(e.touches[0], e.touches[1]);
        clearLongPressTimer();
        return;
      }

      // 더블 탭 감지
      const timeSinceLastTap = now - lastTapRef.current;
      if (timeSinceLastTap < (opts.doubleTapDelay || 300)) {
        // 더블 탭 발생
        if (handlers.onDoubleTap) {
          const gestureEvent = createGestureEvent(
            'double-tap',
            e.target as Element,
            touch.clientX,
            touch.clientY,
            touch.clientX,
            touch.clientY,
            0,
          );
          handlers.onDoubleTap(gestureEvent);
        }
        lastTapRef.current = 0; // 리셋
        clearLongPressTimer();
      } else {
        lastTapRef.current = now;

        // 길게 누르기 타이머 시작
        if (handlers.onLongPress) {
          longPressTimerRef.current = setTimeout(() => {
            if (touchStartRef.current) {
              const gestureEvent = createGestureEvent(
                'long-press',
                e.target as Element,
                touchStartRef.current.x,
                touchStartRef.current.y,
                touchStartRef.current.x,
                touchStartRef.current.y,
                opts.longPressDelay || 500,
              );
              handlers.onLongPress!(gestureEvent);
              touchStartRef.current = null; // 이동 방지
            }
          }, opts.longPressDelay || 500);
        }
      }
    },
    [handlers, opts, createGestureEvent],
  );

  // Touch Move 핸들러
  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!opts.enabled) return;

      // 핀치 제스처 처리
      if (e.touches.length === 2 && pinchStartDistanceRef.current !== null) {
        const currentDistance = getDistance(e.touches[0], e.touches[1]);
        const scale = currentDistance / pinchStartDistanceRef.current;

        if (
          Math.abs(scale - 1) > (opts.pinchThreshold || 0.1) &&
          handlers.onPinch
        ) {
          const touch = e.touches[0];
          const gestureEvent = createGestureEvent(
            'pinch',
            e.target as Element,
            touch.clientX,
            touch.clientY,
            touch.clientX,
            touch.clientY,
            0,
            scale,
          );
          handlers.onPinch(gestureEvent);
        }
        return;
      }

      // 이동 중이면 길게 누르기 취소
      clearLongPressTimer();
    },
    [handlers, opts, createGestureEvent],
  );

  // Touch End 핸들러
  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (!opts.enabled) return;

      clearLongPressTimer();

      if (!touchStartRef.current) return;

      const touch = e.changedTouches[0];
      const endX = touch.clientX;
      const endY = touch.clientY;
      const duration = Date.now() - touchStartRef.current.time;

      const deltaX = endX - touchStartRef.current.x;
      const deltaY = endY - touchStartRef.current.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // 스와이프 감지
      const swipeDirection = getSwipeDirection(deltaX, deltaY);
      if (swipeDirection) {
        const gestureEvent = createGestureEvent(
          swipeDirection,
          e.target as Element,
          touchStartRef.current.x,
          touchStartRef.current.y,
          endX,
          endY,
          duration,
        );

        switch (swipeDirection) {
          case 'swipe-left':
            handlers.onSwipeLeft?.(gestureEvent);
            break;
          case 'swipe-right':
            handlers.onSwipeRight?.(gestureEvent);
            break;
          case 'swipe-up':
            handlers.onSwipeUp?.(gestureEvent);
            break;
          case 'swipe-down':
            handlers.onSwipeDown?.(gestureEvent);
            break;
        }
      }
      // 탭 감지 (이동 거리가 짧고 빠르게 떼면)
      else if (distance < 10 && duration < 200 && handlers.onTap) {
        const gestureEvent = createGestureEvent(
          'tap',
          e.target as Element,
          touchStartRef.current.x,
          touchStartRef.current.y,
          endX,
          endY,
          duration,
        );
        handlers.onTap(gestureEvent);
      }

      // 핀치 종료
      pinchStartDistanceRef.current = null;
      touchStartRef.current = null;
    },
    [handlers, opts, createGestureEvent, getSwipeDirection],
  );

  // 길게 누르기 타이머 제거
  const clearLongPressTimer = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  // 이벤트 리스너 등록
  useEffect(() => {
    const element = elementRef.current;
    if (!element || !opts.enabled) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });
    element.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchEnd);
      clearLongPressTimer();
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, clearLongPressTimer, opts.enabled]);

  return elementRef;
}

/**
 * 마우스 휠로 확대/축소 감지 Hook (데스크톱용)
 *
 * @param onZoom 줌 핸들러 (scale: 1보다 크면 확대, 작으면 축소)
 * @param options 옵션
 */
export function useWheelZoom<T extends HTMLElement = HTMLDivElement>(
  onZoom: (scale: number) => void,
  options: { enabled?: boolean; sensitivity?: number } = {},
): React.RefObject<T> {
  const elementRef = useRef<T>(null);
  const { enabled = true, sensitivity = 0.01 } = options;

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !enabled) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const scale = 1 + e.deltaY * -sensitivity;
      onZoom(scale);
    };

    element.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      element.removeEventListener('wheel', handleWheel);
    };
  }, [onZoom, enabled, sensitivity]);

  return elementRef;
}
