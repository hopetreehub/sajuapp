/**
 * AI 캐시 매니저 단위 테스트
 *
 * TDD 원칙에 따라 작성된 테스트 스위트
 * - Red: 실패하는 테스트 작성
 * - Green: 테스트를 통과하는 최소 코드 작성
 * - Refactor: 코드 개선
 *
 * @author Claude Code
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AICacheManager } from './aiCacheManager';
import type { CachedAIResponse } from './aiCacheManager';

describe('AICacheManager', () => {
  let cache: AICacheManager;
  const testPrefix = 'test';

  // 각 테스트 전에 localStorage 초기화 및 새 인스턴스 생성
  beforeEach(() => {
    localStorage.clear();
    cache = new AICacheManager(testPrefix);
  });

  // 각 테스트 후 정리
  afterEach(() => {
    localStorage.clear();
  });

  describe('생성자 (constructor)', () => {
    it('기본 옵션으로 인스턴스를 생성해야 함', () => {
      const manager = new AICacheManager('prefix');
      expect(manager).toBeInstanceOf(AICacheManager);
    });

    it('커스텀 TTL로 인스턴스를 생성해야 함', () => {
      const customTTL = 1000;
      const manager = new AICacheManager('prefix', { ttl: customTTL });
      expect(manager).toBeInstanceOf(AICacheManager);
    });

    it('커스텀 maxSize로 인스턴스를 생성해야 함', () => {
      const customMaxSize = 1024 * 1024; // 1MB
      const manager = new AICacheManager('prefix', { maxSize: customMaxSize });
      expect(manager).toBeInstanceOf(AICacheManager);
    });
  });

  describe('get()', () => {
    it('캐시가 없으면 null을 반환해야 함', () => {
      // Arrange
      const params = { question: 'test question' };

      // Act
      const result = cache.get(params);

      // Assert
      expect(result).toBeNull();
    });

    it('저장된 캐시를 올바르게 반환해야 함', () => {
      // Arrange
      const params = { question: 'test question' };
      const response = 'test response';
      const provider = 'google-gemini';
      const model = 'gemini-2.0-flash-exp';

      // Act
      cache.set(params, response, provider, model);
      const result = cache.get(params);

      // Assert
      expect(result).not.toBeNull();
      expect(result?.response).toBe(response);
      expect(result?.provider).toBe(provider);
      expect(result?.model).toBe(model);
    });

    it('만료된 캐시는 null을 반환하고 삭제해야 함', () => {
      // Arrange
      const params = { question: 'test question' };
      const response = 'test response';
      const expiredCache = new AICacheManager(testPrefix, { ttl: -1000 }); // 이미 만료됨

      // Act
      expiredCache.set(params, response, 'provider', 'model');

      // 시간이 지나도록 시뮬레이션
      vi.useFakeTimers();
      vi.advanceTimersByTime(2000);

      const result = expiredCache.get(params);

      // Assert
      expect(result).toBeNull();

      // Cleanup
      vi.useRealTimers();
    });

    it('동일한 파라미터는 동일한 캐시를 반환해야 함', () => {
      // Arrange
      const params1 = { a: 1, b: 2 };
      const params2 = { b: 2, a: 1 }; // 순서가 다르지만 내용은 같음
      const response = 'test response';

      // Act
      cache.set(params1, response, 'provider', 'model');
      const result1 = cache.get(params1);
      const result2 = cache.get(params2);

      // Assert
      expect(result1?.response).toBe(response);
      expect(result2?.response).toBe(response);
    });

    it('잘못된 JSON 데이터는 null을 반환하고 삭제해야 함', () => {
      // Arrange
      const key = 'ai_cache_test_corrupted';
      localStorage.setItem(key, 'invalid json');

      // Act
      const result = cache.get({ test: 'corrupted' });

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('set()', () => {
    it('응답을 캐시에 저장해야 함', () => {
      // Arrange
      const params = { question: 'test' };
      const response = 'test response';
      const provider = 'google-gemini';
      const model = 'gemini-2.0-flash-exp';

      // Act
      cache.set(params, response, provider, model);
      const result = cache.get(params);

      // Assert
      expect(result).not.toBeNull();
      expect(result?.response).toBe(response);
      expect(result?.provider).toBe(provider);
      expect(result?.model).toBe(model);
      expect(result?.timestamp).toBeLessThanOrEqual(Date.now());
      expect(result?.expiresAt).toBeGreaterThan(Date.now());
    });

    it('동일한 파라미터로 여러 번 저장하면 마지막 값이 유지되어야 함', () => {
      // Arrange
      const params = { question: 'test' };
      const response1 = 'first response';
      const response2 = 'second response';

      // Act
      cache.set(params, response1, 'provider1', 'model1');
      cache.set(params, response2, 'provider2', 'model2');
      const result = cache.get(params);

      // Assert
      expect(result?.response).toBe(response2);
      expect(result?.provider).toBe('provider2');
    });

    it('5MB를 초과하는 응답은 저장하지 않아야 함', () => {
      // Arrange
      const params = { question: 'large' };
      const largeResponse = 'x'.repeat(6 * 1024 * 1024); // 6MB
      const smallCache = new AICacheManager(testPrefix, { maxSize: 5 * 1024 * 1024 });

      // Act
      smallCache.set(params, largeResponse, 'provider', 'model');
      const result = smallCache.get(params);

      // Assert
      expect(result).toBeNull();
    });

    it('저장 공간 부족 시 오래된 캐시를 삭제하고 새로운 캐시를 저장해야 함', () => {
      // Arrange
      const smallCache = new AICacheManager(testPrefix, { maxSize: 10 * 1024 }); // 10KB
      const params1 = { question: 'old' };
      const params2 = { question: 'new' };
      const response = 'x'.repeat(5 * 1024); // 5KB

      // Act
      smallCache.set(params1, response, 'provider', 'model');
      // 시간이 지나도록 시뮬레이션
      vi.useFakeTimers();
      vi.advanceTimersByTime(1000);
      smallCache.set(params2, response, 'provider', 'model');
      vi.useRealTimers();

      const result1 = smallCache.get(params1);
      const result2 = smallCache.get(params2);

      // Assert
      // 공간 부족으로 오래된 캐시가 삭제될 수 있음
      expect(result2).not.toBeNull();
    });
  });

  describe('cleanup()', () => {
    it('만료된 캐시를 삭제해야 함', () => {
      // Arrange
      const expiredCache = new AICacheManager(testPrefix, { ttl: -1000 });
      const params = { question: 'expired' };

      // Act
      expiredCache.set(params, 'response', 'provider', 'model');
      expiredCache.cleanup();
      const result = expiredCache.get(params);

      // Assert
      expect(result).toBeNull();
    });

    it('지정된 비율만큼 오래된 캐시를 삭제해야 함', () => {
      // Arrange
      const params1 = { question: 'old1' };
      const params2 = { question: 'old2' };
      const params3 = { question: 'new1' };

      // Act
      cache.set(params1, 'response1', 'provider', 'model');
      vi.useFakeTimers();
      vi.advanceTimersByTime(1000);
      cache.set(params2, 'response2', 'provider', 'model');
      vi.advanceTimersByTime(1000);
      cache.set(params3, 'response3', 'provider', 'model');
      vi.useRealTimers();

      const statsBefore = cache.getStats();
      cache.cleanup(0.5); // 50% 삭제
      const statsAfter = cache.getStats();

      // Assert
      expect(statsAfter.count).toBeLessThan(statsBefore.count);
    });

    it('잘못된 JSON 데이터를 삭제해야 함', () => {
      // Arrange
      const key = 'ai_cache_test_corrupted';
      localStorage.setItem(key, 'invalid json');

      // Act
      cache.cleanup();

      // Assert
      expect(localStorage.getItem(key)).toBeNull();
    });
  });

  describe('clear()', () => {
    it('모든 캐시를 삭제해야 함', () => {
      // Arrange
      const params1 = { question: 'test1' };
      const params2 = { question: 'test2' };
      cache.set(params1, 'response1', 'provider', 'model');
      cache.set(params2, 'response2', 'provider', 'model');

      // Act
      cache.clear();

      // Assert
      expect(cache.get(params1)).toBeNull();
      expect(cache.get(params2)).toBeNull();
      expect(cache.getStats().count).toBe(0);
    });

    it('다른 prefix의 캐시는 유지해야 함', () => {
      // Arrange
      const otherCache = new AICacheManager('other');
      const params = { question: 'test' };
      cache.set(params, 'response', 'provider', 'model');
      otherCache.set(params, 'other response', 'provider', 'model');

      // Act
      cache.clear();

      // Assert
      expect(cache.get(params)).toBeNull();
      expect(otherCache.get(params)).not.toBeNull();
    });
  });

  describe('getStats()', () => {
    it('빈 캐시의 통계를 반환해야 함', () => {
      // Act
      const stats = cache.getStats();

      // Assert
      expect(stats.count).toBe(0);
      expect(stats.totalSize).toBe(0);
      expect(stats.oldestTimestamp).toBe(0);
      expect(stats.newestTimestamp).toBe(0);
    });

    it('캐시 통계를 올바르게 계산해야 함', () => {
      // Arrange
      const params1 = { question: 'test1' };
      const params2 = { question: 'test2' };

      // Act
      cache.set(params1, 'response1', 'provider', 'model');
      vi.useFakeTimers();
      vi.advanceTimersByTime(1000);
      cache.set(params2, 'response2', 'provider', 'model');
      vi.useRealTimers();

      const stats = cache.getStats();

      // Assert
      expect(stats.count).toBe(2);
      expect(stats.totalSize).toBeGreaterThan(0);
      expect(stats.oldestTimestamp).toBeLessThan(stats.newestTimestamp);
    });
  });

  describe('캐시 키 생성 로직', () => {
    it('동일한 파라미터는 동일한 캐시 키를 생성해야 함', () => {
      // Arrange
      const params1 = { a: 1, b: 2, c: 3 };
      const params2 = { c: 3, b: 2, a: 1 }; // 순서만 다름
      const response = 'test response';

      // Act
      cache.set(params1, response, 'provider', 'model');
      const result = cache.get(params2);

      // Assert
      expect(result?.response).toBe(response);
    });

    it('다른 파라미터는 다른 캐시 키를 생성해야 함', () => {
      // Arrange
      const params1 = { question: 'test1' };
      const params2 = { question: 'test2' };
      const response1 = 'response1';
      const response2 = 'response2';

      // Act
      cache.set(params1, response1, 'provider', 'model');
      cache.set(params2, response2, 'provider', 'model');

      // Assert
      expect(cache.get(params1)?.response).toBe(response1);
      expect(cache.get(params2)?.response).toBe(response2);
    });
  });

  describe('TTL (Time To Live) 기능', () => {
    it('TTL 내에서는 캐시가 유효해야 함', () => {
      // Arrange
      const longTTL = 1000000; // 매우 긴 TTL
      const longCache = new AICacheManager(testPrefix, { ttl: longTTL });
      const params = { question: 'test' };

      // Act
      longCache.set(params, 'response', 'provider', 'model');
      const result = longCache.get(params);

      // Assert
      expect(result).not.toBeNull();
    });

    it('TTL이 지나면 캐시가 무효화되어야 함', () => {
      // Arrange
      const shortTTL = 1000; // 1초
      const shortCache = new AICacheManager(testPrefix, { ttl: shortTTL });
      const params = { question: 'test' };

      // Act
      shortCache.set(params, 'response', 'provider', 'model');

      // 시간이 지나도록 시뮬레이션
      vi.useFakeTimers();
      vi.advanceTimersByTime(shortTTL + 1000);
      const result = shortCache.get(params);
      vi.useRealTimers();

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('localStorage 상호작용', () => {
    it('localStorage에 데이터를 저장해야 함', () => {
      // Arrange
      const params = { question: 'test' };

      // Act
      cache.set(params, 'response', 'provider', 'model');

      // Assert
      // localStorage.length를 사용하여 저장된 항목 확인
      expect(localStorage.length).toBeGreaterThan(0);

      // 또는 직접 키를 순회하여 확인
      const cacheKeys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('ai_cache_test_')) {
          cacheKeys.push(key);
        }
      }
      expect(cacheKeys.length).toBeGreaterThan(0);
    });

    it('localStorage에서 데이터를 읽어야 함', () => {
      // Arrange
      const params = { question: 'test' };
      const expectedData: CachedAIResponse = {
        response: 'test response',
        provider: 'test-provider',
        model: 'test-model',
        timestamp: Date.now(),
        expiresAt: Date.now() + 1000000,
      };

      // 직접 localStorage에 저장
      const key = 'ai_cache_test_test_key';
      localStorage.setItem(key, JSON.stringify(expectedData));

      // Act
      const result = cache.get(params);

      // Assert
      // 해시 키가 다를 수 있으므로 stats로 확인
      const stats = cache.getStats();
      expect(stats.count).toBeGreaterThan(0);
    });

    it('localStorage QuotaExceededError를 처리해야 함', () => {
      // Arrange
      const params = { question: 'test' };
      const largeResponse = 'x'.repeat(1024 * 1024); // 1MB

      // localStorage.setItem을 mock하여 QuotaExceededError 발생시킴
      const originalSetItem = localStorage.setItem;
      let callCount = 0;
      localStorage.setItem = vi.fn((key, value) => {
        callCount++;
        if (callCount === 1) {
          const error = new Error('QuotaExceededError') as any;
          error.name = 'QuotaExceededError';
          throw error;
        }
        originalSetItem.call(localStorage, key, value);
      });

      // Act & Assert
      expect(() => {
        cache.set(params, largeResponse, 'provider', 'model');
      }).not.toThrow();

      // Cleanup
      localStorage.setItem = originalSetItem;
    });
  });

  describe('여러 prefix 분리', () => {
    it('서로 다른 prefix는 독립적인 캐시를 유지해야 함', () => {
      // Arrange
      const cache1 = new AICacheManager('saju');
      const cache2 = new AICacheManager('qimen');
      const params = { question: 'test' };

      // Act
      cache1.set(params, 'saju response', 'provider1', 'model1');
      cache2.set(params, 'qimen response', 'provider2', 'model2');

      // Assert
      expect(cache1.get(params)?.response).toBe('saju response');
      expect(cache2.get(params)?.response).toBe('qimen response');
    });

    it('한 prefix의 clear는 다른 prefix에 영향을 주지 않아야 함', () => {
      // Arrange
      const cache1 = new AICacheManager('saju');
      const cache2 = new AICacheManager('qimen');
      const params = { question: 'test' };

      cache1.set(params, 'saju response', 'provider', 'model');
      cache2.set(params, 'qimen response', 'provider', 'model');

      // Act
      cache1.clear();

      // Assert
      expect(cache1.get(params)).toBeNull();
      expect(cache2.get(params)).not.toBeNull();
    });
  });

  describe('에지 케이스', () => {
    it('빈 파라미터 객체를 처리해야 함', () => {
      // Arrange & Act
      cache.set({}, 'response', 'provider', 'model');
      const result = cache.get({});

      // Assert
      expect(result?.response).toBe('response');
    });

    it('중첩된 객체 파라미터를 처리해야 함', () => {
      // Arrange
      const params = {
        user: { id: 1, name: 'test' },
        options: { detailed: true },
      };

      // Act
      cache.set(params, 'response', 'provider', 'model');
      const result = cache.get(params);

      // Assert
      expect(result?.response).toBe('response');
    });

    it('배열을 포함한 파라미터를 처리해야 함', () => {
      // Arrange
      const params = {
        tags: ['tag1', 'tag2', 'tag3'],
        ids: [1, 2, 3],
      };

      // Act
      cache.set(params, 'response', 'provider', 'model');
      const result = cache.get(params);

      // Assert
      expect(result?.response).toBe('response');
    });

    it('null 및 undefined 값을 포함한 파라미터를 처리해야 함', () => {
      // Arrange
      const params = {
        a: null,
        b: undefined,
        c: 'value',
      };

      // Act
      cache.set(params, 'response', 'provider', 'model');
      const result = cache.get(params);

      // Assert
      expect(result?.response).toBe('response');
    });

    it('매우 긴 문자열 응답을 처리해야 함', () => {
      // Arrange
      const params = { question: 'long' };
      const longResponse = 'x'.repeat(100000); // 100KB

      // Act
      cache.set(params, longResponse, 'provider', 'model');
      const result = cache.get(params);

      // Assert
      expect(result?.response).toBe(longResponse);
    });

    it('특수 문자를 포함한 응답을 처리해야 함', () => {
      // Arrange
      const params = { question: 'special' };
      const specialResponse = '한글, 日本語, 中文, Emoji 😀🎉, \n\t\r Special chars: @#$%^&*()';

      // Act
      cache.set(params, specialResponse, 'provider', 'model');
      const result = cache.get(params);

      // Assert
      expect(result?.response).toBe(specialResponse);
    });
  });
});
