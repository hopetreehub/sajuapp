/**
 * Service Worker - 오프라인 지원 및 캐싱
 *
 * 귀문둔갑 앱의 오프라인 기능 제공
 * @version 1.0.0
 */

const CACHE_NAME = 'qimen-cache-v1';
const DATA_CACHE_NAME = 'qimen-data-cache-v1';

// 캐시할 정적 자원 목록
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/manifest.json',
];

// 설치 이벤트: 정적 자원 캐싱
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching static assets');
      return cache.addAll(STATIC_CACHE_URLS);
    })
  );

  // 새로운 Service Worker 즉시 활성화
  self.skipWaiting();
});

// 활성화 이벤트: 오래된 캐시 제거
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== DATA_CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  // 모든 클라이언트를 즉시 제어
  return self.clients.claim();
});

// Fetch 이벤트: 네트워크 요청 가로채기
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API 요청 처리 (Network First)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      caches.open(DATA_CACHE_NAME).then((cache) => {
        return fetch(request)
          .then((response) => {
            // 성공 시 캐시에 저장
            if (response.status === 200) {
              cache.put(request, response.clone());
            }
            return response;
          })
          .catch(() => {
            // 네트워크 실패 시 캐시에서 응답
            return cache.match(request).then((cachedResponse) => {
              if (cachedResponse) {
                console.log('[Service Worker] Serving from cache:', request.url);
                return cachedResponse;
              }
              // 캐시에도 없으면 오프라인 응답
              return new Response(
                JSON.stringify({
                  offline: true,
                  error: 'You are offline. Please check your connection.',
                }),
                {
                  headers: { 'Content-Type': 'application/json' },
                  status: 503,
                }
              );
            });
          });
      })
    );
    return;
  }

  // 정적 자원 처리 (Cache First)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        console.log('[Service Worker] Serving from cache:', request.url);
        return cachedResponse;
      }

      // 캐시에 없으면 네트워크 요청
      return fetch(request).then((response) => {
        // 유효한 응답이면 캐시에 저장
        if (
          !response ||
          response.status !== 200 ||
          response.type === 'error'
        ) {
          return response;
        }

        // HTML, CSS, JS, 이미지 등 캐싱
        const responseClone = response.clone();
        const shouldCache =
          request.method === 'GET' &&
          (request.destination === 'script' ||
            request.destination === 'style' ||
            request.destination === 'image' ||
            request.destination === 'font' ||
            url.pathname.endsWith('.html'));

        if (shouldCache) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }

        return response;
      });
    })
  );
});

// 메시지 이벤트: 클라이언트와 통신
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  // 캐시 삭제 요청
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            return caches.delete(cacheName);
          })
        );
      }).then(() => {
        event.ports[0].postMessage({ success: true });
      })
    );
  }

  // 특정 URL 캐싱 요청
  if (event.data && event.data.type === 'CACHE_URLS') {
    const urls = event.data.urls;
    event.waitUntil(
      caches.open(DATA_CACHE_NAME).then((cache) => {
        return cache.addAll(urls);
      }).then(() => {
        event.ports[0].postMessage({ success: true });
      })
    );
  }

  // 캐시 상태 조회
  if (event.data && event.data.type === 'GET_CACHE_STATUS') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            return caches.open(cacheName).then((cache) => {
              return cache.keys().then((keys) => {
                return { name: cacheName, count: keys.length };
              });
            });
          })
        );
      }).then((cacheStatus) => {
        event.ports[0].postMessage({ success: true, caches: cacheStatus });
      })
    );
  }
});

// 백그라운드 동기화 (미래 확장용)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-qimen-data') {
    event.waitUntil(syncQimenData());
  }
});

// 귀문둔갑 데이터 동기화 함수
async function syncQimenData() {
  try {
    // TODO: 오프라인 중 저장된 데이터를 서버와 동기화
    console.log('[Service Worker] Syncing Qimen data...');
    return Promise.resolve();
  } catch (error) {
    console.error('[Service Worker] Sync failed:', error);
    return Promise.reject(error);
  }
}

// 푸시 알림 (미래 확장용)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New notification',
    icon: '/icon-192.png',
    badge: '/icon-72.png',
    vibrate: [200, 100, 200],
    tag: 'qimen-notification',
    requireInteraction: false,
    actions: [
      { action: 'open', title: '열기' },
      { action: 'close', title: '닫기' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification('운명나침반', options)
  );
});

// 알림 클릭 이벤트
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

console.log('[Service Worker] Loaded successfully');
