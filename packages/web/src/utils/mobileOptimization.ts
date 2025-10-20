/**
 * 모바일 최적화 유틸리티
 *
 * 디바이스 감지, 반응형 레이아웃, 성능 최적화 등을 제공합니다.
 */

/**
 * 디바이스 타입
 */
export type DeviceType = 'mobile' | 'tablet' | 'desktop';

/**
 * 화면 방향
 */
export type ScreenOrientation = 'portrait' | 'landscape';

/**
 * 디바이스 정보
 */
export interface DeviceInfo {
  type: DeviceType;
  orientation: ScreenOrientation;
  isTouch: boolean;
  screenWidth: number;
  screenHeight: number;
  pixelRatio: number;
  isRetina: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isSafari: boolean;
  isChrome: boolean;
}

/**
 * 현재 디바이스 정보 가져오기
 */
export function getDeviceInfo(): DeviceInfo {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const pixelRatio = window.devicePixelRatio || 1;
  const userAgent = navigator.userAgent.toLowerCase();

  // 디바이스 타입 판별
  let type: DeviceType = 'desktop';
  if (width < 768) {
    type = 'mobile';
  } else if (width < 1024) {
    type = 'tablet';
  }

  // 화면 방향
  const orientation: ScreenOrientation = width > height ? 'landscape' : 'portrait';

  // 터치 지원 여부
  const isTouch =
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-ignore - msMaxTouchPoints는 IE에만 있음
    navigator.msMaxTouchPoints > 0;

  // OS 판별
  const isIOS = /iphone|ipad|ipod/.test(userAgent);
  const isAndroid = /android/.test(userAgent);

  // 브라우저 판별
  const isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent);
  const isChrome = /chrome/.test(userAgent);

  return {
    type,
    orientation,
    isTouch,
    screenWidth: width,
    screenHeight: height,
    pixelRatio,
    isRetina: pixelRatio >= 2,
    isIOS,
    isAndroid,
    isSafari,
    isChrome,
  };
}

/**
 * 모바일 여부 확인
 */
export function isMobile(): boolean {
  return getDeviceInfo().type === 'mobile';
}

/**
 * 태블릿 여부 확인
 */
export function isTablet(): boolean {
  return getDeviceInfo().type === 'tablet';
}

/**
 * 터치 디바이스 여부 확인
 */
export function isTouchDevice(): boolean {
  return getDeviceInfo().isTouch;
}

/**
 * 레티나 디스플레이 여부 확인
 */
export function isRetinaDisplay(): boolean {
  return getDeviceInfo().isRetina;
}

/**
 * 뷰포트 메타 태그 설정
 *
 * 모바일 최적화를 위한 뷰포트 설정
 */
export function setupViewportMeta(options: {
  userScalable?: boolean;
  initialScale?: number;
  minimumScale?: number;
  maximumScale?: number;
} = {}): void {
  const {
    userScalable = false,
    initialScale = 1.0,
    minimumScale = 1.0,
    maximumScale = 1.0,
  } = options;

  let viewport = document.querySelector('meta[name="viewport"]');
  if (!viewport) {
    viewport = document.createElement('meta');
    viewport.setAttribute('name', 'viewport');
    document.head.appendChild(viewport);
  }

  const content = [
    'width=device-width',
    `initial-scale=${initialScale}`,
    `minimum-scale=${minimumScale}`,
    `maximum-scale=${maximumScale}`,
    `user-scalable=${userScalable ? 'yes' : 'no'}`,
  ].join(', ');

  viewport.setAttribute('content', content);
}

/**
 * 스크롤 방지 (모달 오픈 시 사용)
 */
export function disableScroll(): void {
  document.body.style.overflow = 'hidden';
  document.body.style.position = 'fixed';
  document.body.style.width = '100%';
}

/**
 * 스크롤 허용 (모달 닫기 시 사용)
 */
export function enableScroll(): void {
  document.body.style.overflow = '';
  document.body.style.position = '';
  document.body.style.width = '';
}

/**
 * 안전 영역 (Safe Area) 계산
 *
 * iPhone X 이상의 노치 영역을 고려한 안전 영역 계산
 */
export function getSafeAreaInsets(): {
  top: number;
  right: number;
  bottom: number;
  left: number;
} {
  const style = getComputedStyle(document.documentElement);

  return {
    top: parseInt(style.getPropertyValue('--sat') || '0'),
    right: parseInt(style.getPropertyValue('--sar') || '0'),
    bottom: parseInt(style.getPropertyValue('--sab') || '0'),
    left: parseInt(style.getPropertyValue('--sal') || '0'),
  };
}

/**
 * 터치 이벤트를 마우스 이벤트로 변환
 */
export function touchToMouse(touchEvent: TouchEvent): MouseEvent {
  const touch = touchEvent.changedTouches[0];

  return new MouseEvent(touchEvent.type.replace('touch', 'mouse'), {
    bubbles: true,
    cancelable: true,
    view: window,
    clientX: touch.clientX,
    clientY: touch.clientY,
    screenX: touch.screenX,
    screenY: touch.screenY,
  });
}

/**
 * 디바운스 함수
 *
 * 빠른 연속 호출을 방지하여 성능 최적화
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function (this: any, ...args: Parameters<T>) {
    const context = this;

    if (timeout) clearTimeout(timeout);

    timeout = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
}

/**
 * 스로틀 함수
 *
 * 일정 시간 간격으로만 함수 실행을 허용하여 성능 최적화
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  let lastResult: ReturnType<T>;

  return function (this: any, ...args: Parameters<T>) {
    const context = this;

    if (!inThrottle) {
      inThrottle = true;

      setTimeout(() => (inThrottle = false), limit);

      lastResult = func.apply(context, args);
    }

    return lastResult;
  };
}

/**
 * 이미지 지연 로딩 설정
 *
 * Intersection Observer를 사용한 lazy loading
 */
export function setupLazyLoading(
  images?: NodeListOf<HTMLImageElement> | HTMLImageElement[]
): void {
  const imageElements =
    images || document.querySelectorAll<HTMLImageElement>('img[data-src]');

  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.getAttribute('data-src');

          if (src) {
            img.src = src;
            img.removeAttribute('data-src');
            observer.unobserve(img);
          }
        }
      });
    });

    imageElements.forEach((img) => imageObserver.observe(img));
  } else {
    // Fallback for browsers without IntersectionObserver
    imageElements.forEach((img) => {
      const src = img.getAttribute('data-src');
      if (src) {
        img.src = src;
        img.removeAttribute('data-src');
      }
    });
  }
}

/**
 * 성능 측정
 */
export class PerformanceMonitor {
  private marks: Map<string, number> = new Map();

  /**
   * 측정 시작
   */
  start(name: string): void {
    this.marks.set(name, performance.now());
  }

  /**
   * 측정 종료 및 결과 반환
   */
  end(name: string): number | null {
    const startTime = this.marks.get(name);
    if (!startTime) return null;

    const duration = performance.now() - startTime;
    this.marks.delete(name);

    return duration;
  }

  /**
   * 측정 종료 및 콘솔 출력
   */
  log(name: string, prefix: string = '⏱️'): void {
    const duration = this.end(name);
    if (duration !== null) {
      console.log(`${prefix} [${name}] ${duration.toFixed(2)}ms`);
    }
  }
}

/**
 * 메모리 사용량 정보
 */
export function getMemoryInfo(): {
  used: number;
  total: number;
  percentage: number;
} | null {
  // @ts-ignore - memory는 Chrome에만 있음
  if (performance.memory) {
    // @ts-ignore
    const { usedJSHeapSize, totalJSHeapSize } = performance.memory;
    return {
      used: usedJSHeapSize,
      total: totalJSHeapSize,
      percentage: (usedJSHeapSize / totalJSHeapSize) * 100,
    };
  }
  return null;
}

/**
 * 네트워크 상태 확인
 */
export function getNetworkInfo(): {
  online: boolean;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
} {
  const online = navigator.onLine;

  // @ts-ignore - connection은 일부 브라우저에만 있음
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

  if (connection) {
    return {
      online,
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData,
    };
  }

  return { online };
}

/**
 * 배터리 정보 (지원하는 브라우저에서만)
 */
export async function getBatteryInfo(): Promise<{
  charging: boolean;
  level: number;
  chargingTime: number;
  dischargingTime: number;
} | null> {
  // @ts-ignore - getBattery는 일부 브라우저에만 있음
  if ('getBattery' in navigator) {
    // @ts-ignore
    const battery = await navigator.getBattery();
    return {
      charging: battery.charging,
      level: battery.level,
      chargingTime: battery.chargingTime,
      dischargingTime: battery.dischargingTime,
    };
  }
  return null;
}

/**
 * 햅틱 피드백 (진동)
 */
export function hapticFeedback(pattern: number | number[] = 50): void {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
}

/**
 * 클립보드에 텍스트 복사
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();

      const successful = document.execCommand('copy');
      document.body.removeChild(textarea);

      return successful;
    }
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
}

/**
 * 풀스크린 모드 토글
 */
export async function toggleFullscreen(element: HTMLElement = document.documentElement): Promise<void> {
  if (!document.fullscreenElement) {
    try {
      await element.requestFullscreen();
    } catch (err) {
      console.error('Error attempting to enable fullscreen:', err);
    }
  } else {
    await document.exitFullscreen();
  }
}

/**
 * 화면 깨우기 잠금 (Screen Wake Lock)
 *
 * 화면이 자동으로 꺼지는 것을 방지
 */
export async function requestWakeLock(): Promise<WakeLockSentinel | null> {
  try {
    if ('wakeLock' in navigator) {
      // @ts-ignore - wakeLock는 실험적 기능
      const wakeLock = await navigator.wakeLock.request('screen');
      console.log('Wake Lock activated');
      return wakeLock;
    }
  } catch (err) {
    console.error('Wake Lock error:', err);
  }
  return null;
}

/**
 * 반응형 폰트 크기 계산
 *
 * 뷰포트 너비에 따라 폰트 크기를 동적으로 조정
 */
export function getResponsiveFontSize(
  baseFontSize: number,
  minFontSize: number = 12,
  maxFontSize: number = 24
): number {
  const viewportWidth = window.innerWidth;
  const scale = viewportWidth / 375; // iPhone SE 기준

  const fontSize = baseFontSize * scale;

  return Math.max(minFontSize, Math.min(maxFontSize, fontSize));
}

/**
 * CSS 클래스로 디바이스 타입 표시
 *
 * body 태그에 디바이스 타입에 따른 클래스 추가
 */
export function applyDeviceClasses(): void {
  const deviceInfo = getDeviceInfo();
  const body = document.body;

  // 이전 클래스 제거
  body.classList.remove('mobile', 'tablet', 'desktop', 'portrait', 'landscape', 'touch', 'no-touch');

  // 새 클래스 추가
  body.classList.add(deviceInfo.type);
  body.classList.add(deviceInfo.orientation);
  body.classList.add(deviceInfo.isTouch ? 'touch' : 'no-touch');

  if (deviceInfo.isIOS) body.classList.add('ios');
  if (deviceInfo.isAndroid) body.classList.add('android');
}

/**
 * 리사이즈 이벤트 최적화 리스너
 */
export function onResize(callback: () => void, delay: number = 200): () => void {
  const debouncedCallback = debounce(callback, delay);

  window.addEventListener('resize', debouncedCallback);

  // 클린업 함수 반환
  return () => {
    window.removeEventListener('resize', debouncedCallback);
  };
}

/**
 * 방향 전환 이벤트 리스너
 */
export function onOrientationChange(callback: (orientation: ScreenOrientation) => void): () => void {
  const handleOrientationChange = () => {
    const orientation: ScreenOrientation =
      window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
    callback(orientation);
  };

  window.addEventListener('orientationchange', handleOrientationChange);
  window.addEventListener('resize', handleOrientationChange);

  // 클린업 함수 반환
  return () => {
    window.removeEventListener('orientationchange', handleOrientationChange);
    window.removeEventListener('resize', handleOrientationChange);
  };
}
