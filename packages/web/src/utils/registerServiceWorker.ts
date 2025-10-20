/**
 * Service Worker 등록 유틸리티
 *
 * 오프라인 지원 및 PWA 기능을 위한 Service Worker 등록
 * @version 1.0.0
 */

/**
 * Service Worker 등록
 *
 * @returns Promise<ServiceWorkerRegistration | undefined>
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | undefined> {
  // Service Worker 미지원 브라우저
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Worker is not supported in this browser');
    return undefined;
  }

  try {
    // Service Worker 등록
    const registration = await navigator.serviceWorker.register('/service-worker.js', {
      scope: '/',
    });

    console.log('✅ Service Worker registered successfully:', registration.scope);

    // 업데이트 체크
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      console.log('🔄 New Service Worker found. Installing...');

      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // 새 버전이 설치됨
            console.log('📦 New version available. Please refresh to update.');

            // 사용자에게 알림 (선택사항)
            if (confirm('새 버전이 있습니다. 업데이트하시겠습니까?')) {
              newWorker.postMessage({ type: 'SKIP_WAITING' });
              window.location.reload();
            }
          }
        });
      }
    });

    // 컨트롤러 변경 감지
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('🔄 Service Worker controller changed');
      window.location.reload();
    });

    return registration;
  } catch (error) {
    console.error('❌ Service Worker registration failed:', error);
    return undefined;
  }
}

/**
 * Service Worker 해제
 *
 * @returns Promise<boolean>
 */
export async function unregisterServiceWorker(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.unregister();
      console.log('✅ Service Worker unregistered successfully');
      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ Service Worker unregister failed:', error);
    return false;
  }
}

/**
 * 캐시 삭제
 *
 * @returns Promise<boolean>
 */
export async function clearServiceWorkerCache(): Promise<boolean> {
  if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) {
    return false;
  }

  try {
    const messageChannel = new MessageChannel();

    return new Promise((resolve) => {
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data.success);
      };

      navigator.serviceWorker.controller.postMessage(
        { type: 'CLEAR_CACHE' },
        [messageChannel.port2]
      );
    });
  } catch (error) {
    console.error('❌ Failed to clear cache:', error);
    return false;
  }
}

/**
 * 특정 URL들을 캐싱
 *
 * @param urls 캐싱할 URL 배열
 * @returns Promise<boolean>
 */
export async function cacheUrls(urls: string[]): Promise<boolean> {
  if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) {
    return false;
  }

  try {
    const messageChannel = new MessageChannel();

    return new Promise((resolve) => {
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data.success);
      };

      navigator.serviceWorker.controller.postMessage(
        { type: 'CACHE_URLS', urls },
        [messageChannel.port2]
      );
    });
  } catch (error) {
    console.error('❌ Failed to cache URLs:', error);
    return false;
  }
}

/**
 * 캐시 상태 조회
 *
 * @returns Promise<Array<{name: string, count: number}>>
 */
export async function getCacheStatus(): Promise<Array<{ name: string; count: number }>> {
  if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) {
    return [];
  }

  try {
    const messageChannel = new MessageChannel();

    return new Promise((resolve) => {
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data.caches || []);
      };

      navigator.serviceWorker.controller.postMessage(
        { type: 'GET_CACHE_STATUS' },
        [messageChannel.port2]
      );
    });
  } catch (error) {
    console.error('❌ Failed to get cache status:', error);
    return [];
  }
}

/**
 * 온라인/오프라인 상태 감지
 *
 * @param onOnline 온라인 콜백
 * @param onOffline 오프라인 콜백
 * @returns cleanup 함수
 */
export function setupNetworkListeners(
  onOnline: () => void,
  onOffline: () => void
): () => void {
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);

  // 클린업 함수 반환
  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
}

/**
 * 현재 온라인 상태 확인
 *
 * @returns boolean
 */
export function isOnline(): boolean {
  return navigator.onLine;
}

/**
 * Service Worker 상태 확인
 *
 * @returns Promise<'active' | 'installing' | 'waiting' | 'none'>
 */
export async function getServiceWorkerStatus(): Promise<
  'active' | 'installing' | 'waiting' | 'none'
> {
  if (!('serviceWorker' in navigator)) {
    return 'none';
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();

    if (!registration) {
      return 'none';
    }

    if (registration.active) {
      return 'active';
    }

    if (registration.installing) {
      return 'installing';
    }

    if (registration.waiting) {
      return 'waiting';
    }

    return 'none';
  } catch (error) {
    console.error('Failed to get Service Worker status:', error);
    return 'none';
  }
}
