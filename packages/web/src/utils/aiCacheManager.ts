/**
 * AI 챗 응답 영구 캐싱 시스템
 *
 * localStorage 기반 캐싱으로 페이지 새로고침 후에도 이전 응답 재사용
 * 캐시 만료 시간 설정으로 오래된 데이터 자동 정리
 *
 * @author Claude Code
 * @version 1.0.0
 */

export interface CachedAIResponse {
  response: string;
  provider: string;
  model: string;
  timestamp: number;
  expiresAt: number;
}

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds (default: 7 days)
  maxSize?: number; // Maximum cache size in bytes (default: 5MB)
}

const DEFAULT_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days
const DEFAULT_MAX_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * AI 챗 응답 캐시 관리자
 */
export class AICacheManager {
  private prefix: string;
  private ttl: number;
  private maxSize: number;

  constructor(prefix: string, options: CacheOptions = {}) {
    this.prefix = `ai_cache_${prefix}_`;
    this.ttl = options.ttl || DEFAULT_TTL;
    this.maxSize = options.maxSize || DEFAULT_MAX_SIZE;
  }

  /**
   * 캐시 키 생성
   */
  private generateKey(params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((acc, key) => {
        acc[key] = params[key];
        return acc;
      }, {} as Record<string, any>);

    const keyString = JSON.stringify(sortedParams);
    return this.prefix + this.hashString(keyString);
  }

  /**
   * 간단한 해시 함수
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * 캐시에서 응답 가져오기
   */
  get(params: Record<string, any>): CachedAIResponse | null {
    try {
      const key = this.generateKey(params);
      const cached = localStorage.getItem(key);

      if (!cached) {
        console.log(`💾 [캐시] 미스:`, key);
        return null;
      }

      const data: CachedAIResponse = JSON.parse(cached);

      // 만료 확인
      if (Date.now() > data.expiresAt) {
        console.log(`⏰ [캐시] 만료됨:`, key);
        localStorage.removeItem(key);
        return null;
      }

      console.log(`✅ [캐시] 적중:`, key, `(${Math.round((Date.now() - data.timestamp) / 1000)}초 전 저장)`);
      return data;
    } catch (error) {
      console.error('❌ [캐시] 가져오기 오류:', error);
      return null;
    }
  }

  /**
   * 캐시에 응답 저장
   */
  set(params: Record<string, any>, response: string, provider: string, model: string): void {
    try {
      const key = this.generateKey(params);
      const data: CachedAIResponse = {
        response,
        provider,
        model,
        timestamp: Date.now(),
        expiresAt: Date.now() + this.ttl,
      };

      // 캐시 크기 확인
      const dataSize = new Blob([JSON.stringify(data)]).size;
      if (dataSize > this.maxSize) {
        console.warn('⚠️ [캐시] 응답이 너무 큽니다:', dataSize, 'bytes');
        return;
      }

      // 저장 공간 확인 및 정리
      this.ensureSpace(dataSize);

      localStorage.setItem(key, JSON.stringify(data));
      console.log(`💾 [캐시] 저장:`, key, `(${Math.round(dataSize / 1024)}KB)`);
    } catch (error) {
      console.error('❌ [캐시] 저장 오류:', error);

      // 저장 공간 부족 시 오래된 캐시 정리
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        console.log('🗑️ [캐시] 저장 공간 부족, 정리 시작...');
        this.cleanup(0.5); // 50% 정리

        // 재시도
        try {
          const key = this.generateKey(params);
          const data: CachedAIResponse = {
            response,
            provider,
            model,
            timestamp: Date.now(),
            expiresAt: Date.now() + this.ttl,
          };
          localStorage.setItem(key, JSON.stringify(data));
          console.log(`✅ [캐시] 재시도 성공:`, key);
        } catch (retryError) {
          console.error('❌ [캐시] 재시도 실패:', retryError);
        }
      }
    }
  }

  /**
   * 저장 공간 확보
   */
  private ensureSpace(requiredSize: number): void {
    const currentSize = this.getCurrentCacheSize();

    if (currentSize + requiredSize > this.maxSize) {
      const targetSize = this.maxSize * 0.7; // 70%까지 줄이기
      const sizeToFree = currentSize + requiredSize - targetSize;

      console.log(`🗑️ [캐시] 공간 확보 필요:`, Math.round(sizeToFree / 1024), 'KB');
      this.cleanup(sizeToFree / currentSize);
    }
  }

  /**
   * 현재 캐시 크기 계산
   */
  private getCurrentCacheSize(): number {
    let totalSize = 0;
    const keys = this.getAllKeys();

    keys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        totalSize += new Blob([value]).size;
      }
    });

    return totalSize;
  }

  /**
   * 모든 캐시 키 가져오기
   */
  private getAllKeys(): string[] {
    const keys: string[] = [];

    try {
      // localStorage의 모든 키를 확인
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          keys.push(key);
        }
      }

      // 위 방법이 실패할 경우 (일부 환경에서), Object.keys 사용
      if (keys.length === 0 && typeof window !== 'undefined') {
        const allKeys = Object.keys(localStorage);
        return allKeys.filter(key => key.startsWith(this.prefix));
      }
    } catch (error) {
      console.error('❌ [캐시] 키 가져오기 오류:', error);
    }

    return keys;
  }

  /**
   * 캐시 정리 (오래된 것부터 삭제)
   */
  cleanup(ratio: number = 0.3): void {
    try {
      const keys = this.getAllKeys();
      const entries: Array<{ key: string; timestamp: number }> = [];

      // 타임스탬프와 함께 엔트리 수집
      keys.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) {
          try {
            const data: CachedAIResponse = JSON.parse(value);

            // 만료된 것은 바로 삭제
            if (Date.now() > data.expiresAt) {
              localStorage.removeItem(key);
            } else {
              entries.push({ key, timestamp: data.timestamp });
            }
          } catch {
            // 파싱 실패한 것은 삭제
            localStorage.removeItem(key);
          }
        }
      });

      // 타임스탬프 기준 정렬 (오래된 것부터)
      entries.sort((a, b) => a.timestamp - b.timestamp);

      // 지정된 비율만큼 삭제
      const deleteCount = Math.ceil(entries.length * ratio);
      const toDelete = entries.slice(0, deleteCount);

      toDelete.forEach(entry => {
        localStorage.removeItem(entry.key);
      });

      console.log(`🗑️ [캐시] 정리 완료:`, deleteCount, '개 항목 삭제');
    } catch (error) {
      console.error('❌ [캐시] 정리 오류:', error);
    }
  }

  /**
   * 모든 캐시 삭제
   */
  clear(): void {
    try {
      const keys = this.getAllKeys();
      keys.forEach(key => localStorage.removeItem(key));
      console.log(`🗑️ [캐시] 전체 삭제:`, keys.length, '개 항목');
    } catch (error) {
      console.error('❌ [캐시] 삭제 오류:', error);
    }
  }

  /**
   * 캐시 통계
   */
  getStats(): {
    count: number;
    totalSize: number;
    oldestTimestamp: number;
    newestTimestamp: number;
  } {
    const keys = this.getAllKeys();
    let totalSize = 0;
    let oldestTimestamp = Date.now();
    let newestTimestamp = 0;

    keys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        totalSize += new Blob([value]).size;

        try {
          const data: CachedAIResponse = JSON.parse(value);
          oldestTimestamp = Math.min(oldestTimestamp, data.timestamp);
          newestTimestamp = Math.max(newestTimestamp, data.timestamp);
        } catch {
          // 파싱 실패 무시
        }
      }
    });

    return {
      count: keys.length,
      totalSize,
      oldestTimestamp: keys.length > 0 ? oldestTimestamp : 0,
      newestTimestamp: keys.length > 0 ? newestTimestamp : 0,
    };
  }
}

// 각 AI 챗별 캐시 매니저 인스턴스
export const sajuCacheManager = new AICacheManager('saju', { ttl: 7 * 24 * 60 * 60 * 1000 });
export const qimenCacheManager = new AICacheManager('qimen', { ttl: 3 * 24 * 60 * 60 * 1000 }); // 3일
export const tarotCacheManager = new AICacheManager('tarot', { ttl: 30 * 24 * 60 * 60 * 1000 }); // 30일
export const ziweiCacheManager = new AICacheManager('ziwei', { ttl: 7 * 24 * 60 * 60 * 1000 });
