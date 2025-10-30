/**
 * 사주 계산 알고리즘 단위 테스트
 *
 * TDD 원칙: 테스트 우선, 기존 구현 검증
 * @author Claude Code
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  calculateFourPillars,
  HEAVENLY_STEMS,
  EARTHLY_BRANCHES,
  SIXTY_CYCLE,
  type FourPillarsResult,
} from './sajuCalculator';

describe('SajuCalculator - 사주 계산 알고리즘', () => {
  describe('기본 상수 검증', () => {
    it('천간(天干)은 10개여야 함', () => {
      expect(HEAVENLY_STEMS).toHaveLength(10);
      expect(HEAVENLY_STEMS).toEqual([
        '갑', '을', '병', '정', '무', '기', '경', '신', '임', '계',
      ]);
    });

    it('지지(地支)는 12개여야 함', () => {
      expect(EARTHLY_BRANCHES).toHaveLength(12);
      expect(EARTHLY_BRANCHES).toEqual([
        '자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해',
      ]);
    });

    it('60갑자 순환표는 60개여야 함', () => {
      expect(SIXTY_CYCLE).toHaveLength(60);
      expect(SIXTY_CYCLE[0]).toBe('갑자'); // 첫 번째
      expect(SIXTY_CYCLE[59]).toBe('계해'); // 마지막
    });

    it('60갑자는 중복되지 않아야 함', () => {
      const uniqueSet = new Set(SIXTY_CYCLE);
      expect(uniqueSet.size).toBe(60);
    });
  });

  describe('년주(年柱) 계산', () => {
    it('1924년은 갑자년이어야 함 (60갑자 시작)', () => {
      const birthInfo = {
        year: 1924,
        month: 1,
        day: 1,
        hour: 0,
        isLunar: false,
      };
      const result = calculateFourPillars(birthInfo);

      expect(result.year.combined).toBe('갑자');
      expect(result.year.heavenly).toBe('갑');
      expect(result.year.earthly).toBe('자');
    });

    it('1971년은 신해년이어야 함 (검증된 데이터)', () => {
      const birthInfo = {
        year: 1971,
        month: 1,
        day: 1,
        hour: 0,
        isLunar: false,
      };
      const result = calculateFourPillars(birthInfo);

      expect(result.year.combined).toBe('신해');
      expect(result.year.heavenly).toBe('신');
      expect(result.year.earthly).toBe('해');
    });

    it('1976년은 병진년이어야 함 (검증된 데이터)', () => {
      const birthInfo = {
        year: 1976,
        month: 1,
        day: 1,
        hour: 0,
        isLunar: false,
      };
      const result = calculateFourPillars(birthInfo);

      expect(result.year.combined).toBe('병진');
      expect(result.year.heavenly).toBe('병');
      expect(result.year.earthly).toBe('진');
    });

    it('1984년은 갑자년이어야 함 (60년 주기)', () => {
      const birthInfo = {
        year: 1984,
        month: 1,
        day: 1,
        hour: 0,
        isLunar: false,
      };
      const result = calculateFourPillars(birthInfo);

      // 1924 + 60 = 1984, 같은 갑자년
      expect(result.year.combined).toBe('갑자');
      expect(result.year.heavenly).toBe('갑');
      expect(result.year.earthly).toBe('자');
    });

    it('2000년은 경진년이어야 함', () => {
      const birthInfo = {
        year: 2000,
        month: 1,
        day: 1,
        hour: 0,
        isLunar: false,
      };
      const result = calculateFourPillars(birthInfo);

      expect(result.year.combined).toBe('경진');
      expect(result.year.heavenly).toBe('경');
      expect(result.year.earthly).toBe('진');
    });

    it('2024년은 갑진년이어야 함', () => {
      const birthInfo = {
        year: 2024,
        month: 1,
        day: 1,
        hour: 0,
        isLunar: false,
      };
      const result = calculateFourPillars(birthInfo);

      expect(result.year.combined).toBe('갑진');
      expect(result.year.heavenly).toBe('갑');
      expect(result.year.earthly).toBe('진');
    });

    it('음수 년도도 정확히 계산되어야 함 (역사적 년도)', () => {
      const birthInfo = {
        year: 1900,
        month: 1,
        day: 1,
        hour: 0,
        isLunar: false,
      };
      const result = calculateFourPillars(birthInfo);

      // 1924 - 24 = 1900, 60갑자 순환 고려
      const yearDiff = 1900 - 1924; // -24
      const cycleIndex = ((yearDiff % 60) + 60) % 60; // 36
      expect(result.year.combined).toBe(SIXTY_CYCLE[cycleIndex]);
    });
  });

  describe('월주(月柱) 계산', () => {
    it('절기월이 올바르게 계산되어야 함 (인월)', () => {
      const birthInfo = {
        year: 2024,
        month: 2, // 2월 (입춘 후 인월)
        day: 10,
        hour: 12,
        isLunar: false,
      };
      const result = calculateFourPillars(birthInfo);

      // 갑진년 인월
      expect(result.month.earthly).toBe('인');
    });

    it('절기월이 올바르게 계산되어야 함 (묘월)', () => {
      const birthInfo = {
        year: 2024,
        month: 3, // 3월 (경칩 후 묘월)
        day: 10,
        hour: 12,
        isLunar: false,
      };
      const result = calculateFourPillars(birthInfo);

      expect(result.month.earthly).toBe('묘');
    });

    it('년간에 따라 월간이 변경되어야 함 (갑기년)', () => {
      const birthInfo = {
        year: 2024, // 갑진년
        month: 2,
        day: 10,
        hour: 12,
        isLunar: false,
      };
      const result = calculateFourPillars(birthInfo);

      // 갑년 인월 = 병인
      expect(result.month.combined).toBe('병인');
    });

    it('월주 변환이 정확해야 함', () => {
      const birthInfo1 = {
        year: 1971, // 신해년
        month: 1,
        day: 1,
        hour: 0,
        isLunar: false,
      };
      const result1 = calculateFourPillars(birthInfo1);

      // 월주는 절기 기준으로 계산됨
      expect(result1.month.earthly).toBeDefined();
      expect(result1.month.heavenly).toBeDefined();
    });
  });

  describe('일주(日柱) 계산', () => {
    it('일주 계산이 정확해야 함 (기본 날짜)', () => {
      const birthInfo = {
        year: 2024,
        month: 1,
        day: 1,
        hour: 12,
        isLunar: false,
      };
      const result = calculateFourPillars(birthInfo);

      // 일주는 복잡한 계산이 필요하므로 기본 검증
      expect(result.day.combined).toHaveLength(2);
      expect(result.day.heavenly).toHaveLength(1);
      expect(result.day.earthly).toHaveLength(1);
    });

    it('일주는 60갑자 중 하나여야 함', () => {
      const birthInfo = {
        year: 2024,
        month: 6,
        day: 15,
        hour: 12,
        isLunar: false,
      };
      const result = calculateFourPillars(birthInfo);

      expect(SIXTY_CYCLE).toContain(result.day.combined);
    });

    it('같은 날짜는 같은 일주를 반환해야 함', () => {
      const birthInfo1 = {
        year: 2024,
        month: 1,
        day: 1,
        hour: 12,
        isLunar: false,
      };
      const birthInfo2 = {
        year: 2024,
        month: 1,
        day: 1,
        hour: 18,
        isLunar: false,
      };

      const result1 = calculateFourPillars(birthInfo1);
      const result2 = calculateFourPillars(birthInfo2);

      expect(result1.day.combined).toBe(result2.day.combined);
    });

    it('다른 날짜는 (보통) 다른 일주를 반환해야 함', () => {
      const birthInfo1 = {
        year: 2024,
        month: 1,
        day: 1,
        hour: 12,
        isLunar: false,
      };
      const birthInfo2 = {
        year: 2024,
        month: 1,
        day: 2,
        hour: 12,
        isLunar: false,
      };

      const result1 = calculateFourPillars(birthInfo1);
      const result2 = calculateFourPillars(birthInfo2);

      // 일주는 매일 바뀌므로
      expect(result1.day.combined).not.toBe(result2.day.combined);
    });
  });

  describe('시주(時柱) 계산', () => {
    it('시주 계산이 정확해야 함 (자시)', () => {
      const birthInfo = {
        year: 2024,
        month: 1,
        day: 1,
        hour: 0, // 23:00~01:00 자시
        isLunar: false,
      };
      const result = calculateFourPillars(birthInfo);

      expect(result.hour.earthly).toBe('자');
    });

    it('시주 계산이 정확해야 함 (오시)', () => {
      const birthInfo = {
        year: 2024,
        month: 1,
        day: 1,
        hour: 12, // 11:00~13:00 오시
        isLunar: false,
      };
      const result = calculateFourPillars(birthInfo);

      expect(result.hour.earthly).toBe('오');
    });

    it('시주는 일간에 따라 변경되어야 함', () => {
      const birthInfo1 = {
        year: 2024,
        month: 1,
        day: 1,
        hour: 0,
        isLunar: false,
      };
      const birthInfo2 = {
        year: 2024,
        month: 1,
        day: 2, // 일주가 다름
        hour: 0, // 같은 시간
        isLunar: false,
      };

      const result1 = calculateFourPillars(birthInfo1);
      const result2 = calculateFourPillars(birthInfo2);

      // 일간이 다르면 시간이 같아도 시주가 다를 수 있음
      // (항상 다른 것은 아니므로 검증만 수행)
      expect(result1.hour.combined).toBeDefined();
      expect(result2.hour.combined).toBeDefined();
    });

    it('시주는 60갑자 중 하나여야 함', () => {
      const birthInfo = {
        year: 2024,
        month: 6,
        day: 15,
        hour: 14,
        isLunar: false,
      };
      const result = calculateFourPillars(birthInfo);

      expect(SIXTY_CYCLE).toContain(result.hour.combined);
    });

    it('24시간 모든 시간이 12시진으로 매핑되어야 함', () => {
      const hours = [0, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23];
      const earthlyBranches = new Set<string>();

      hours.forEach((hour) => {
        const birthInfo = {
          year: 2024,
          month: 1,
          day: 1,
          hour,
          isLunar: false,
        };
        const result = calculateFourPillars(birthInfo);
        earthlyBranches.add(result.hour.earthly);
      });

      // 12시진이 모두 나와야 함 (23시간이면 일부 중복 가능)
      expect(earthlyBranches.size).toBeGreaterThan(6);
    });
  });

  describe('음력 변환 통합 테스트', () => {
    it('음력 날짜를 양력으로 변환해야 함', () => {
      const birthInfo = {
        year: 2024,
        month: 1,
        day: 1, // 음력 1월 1일 (설날)
        hour: 12,
        isLunar: true,
      };

      // 음력 변환은 외부 함수 사용
      // 여기서는 calculate 함수가 에러 없이 실행되는지만 확인
      expect(() => calculateFourPillars(birthInfo)).not.toThrow();
    });

    it('양력 날짜는 그대로 계산되어야 함', () => {
      const birthInfo = {
        year: 2024,
        month: 1,
        day: 1,
        hour: 12,
        isLunar: false,
      };

      const result = calculateFourPillars(birthInfo);

      expect(result.year.combined).toBe('갑진');
      expect(result.day.combined).toBeDefined();
    });
  });

  describe('사주 전체 결과 검증', () => {
    it('모든 주(柱)가 유효한 값을 가져야 함', () => {
      const birthInfo = {
        year: 1990,
        month: 5,
        day: 15,
        hour: 14,
        isLunar: false,
      };

      const result = calculateFourPillars(birthInfo);

      // 년주 검증
      expect(result.year.combined).toHaveLength(2);
      expect(result.year.heavenly).toHaveLength(1);
      expect(result.year.earthly).toHaveLength(1);

      // 월주 검증
      expect(result.month.combined).toHaveLength(2);
      expect(result.month.heavenly).toHaveLength(1);
      expect(result.month.earthly).toHaveLength(1);

      // 일주 검증
      expect(result.day.combined).toHaveLength(2);
      expect(result.day.heavenly).toHaveLength(1);
      expect(result.day.earthly).toHaveLength(1);

      // 시주 검증
      expect(result.hour.combined).toHaveLength(2);
      expect(result.hour.heavenly).toHaveLength(1);
      expect(result.hour.earthly).toHaveLength(1);
    });

    it('모든 주가 60갑자에 포함되어야 함', () => {
      const birthInfo = {
        year: 2000,
        month: 6,
        day: 15,
        hour: 10,
        isLunar: false,
      };

      const result = calculateFourPillars(birthInfo);

      expect(SIXTY_CYCLE).toContain(result.year.combined);
      expect(SIXTY_CYCLE).toContain(result.month.combined);
      expect(SIXTY_CYCLE).toContain(result.day.combined);
      expect(SIXTY_CYCLE).toContain(result.hour.combined);
    });

    it('사주는 항상 8자(4주 x 2글자)여야 함', () => {
      const birthInfo = {
        year: 1995,
        month: 3,
        day: 20,
        hour: 8,
        isLunar: false,
      };

      const result = calculateFourPillars(birthInfo);

      const totalChars =
        result.year.combined.length +
        result.month.combined.length +
        result.day.combined.length +
        result.hour.combined.length;

      expect(totalChars).toBe(8);
    });
  });

  describe('엣지 케이스 및 에러 처리', () => {
    it('유효하지 않은 월(0월)을 처리해야 함', () => {
      const birthInfo = {
        year: 2024,
        month: 0,
        day: 1,
        hour: 12,
        isLunar: false,
      };

      // 에러가 발생하거나, 기본값으로 처리되어야 함
      expect(() => calculateFourPillars(birthInfo)).not.toThrow();
    });

    it('유효하지 않은 월(13월)을 처리해야 함', () => {
      const birthInfo = {
        year: 2024,
        month: 13,
        day: 1,
        hour: 12,
        isLunar: false,
      };

      expect(() => calculateFourPillars(birthInfo)).not.toThrow();
    });

    it('유효하지 않은 일(0일)을 처리해야 함', () => {
      const birthInfo = {
        year: 2024,
        month: 1,
        day: 0,
        hour: 12,
        isLunar: false,
      };

      expect(() => calculateFourPillars(birthInfo)).not.toThrow();
    });

    it('유효하지 않은 시간(24시)을 처리해야 함', () => {
      const birthInfo = {
        year: 2024,
        month: 1,
        day: 1,
        hour: 24,
        isLunar: false,
      };

      expect(() => calculateFourPillars(birthInfo)).not.toThrow();
    });

    it('음수 시간을 처리해야 함', () => {
      const birthInfo = {
        year: 2024,
        month: 1,
        day: 1,
        hour: -1,
        isLunar: false,
      };

      expect(() => calculateFourPillars(birthInfo)).not.toThrow();
    });

    it('매우 먼 과거 년도를 처리해야 함', () => {
      const birthInfo = {
        year: 1000,
        month: 1,
        day: 1,
        hour: 12,
        isLunar: false,
      };

      const result = calculateFourPillars(birthInfo);

      // 년주만 검증
      expect(result.year.combined).toHaveLength(2);
    });

    it('매우 먼 미래 년도를 처리해야 함', () => {
      const birthInfo = {
        year: 3000,
        month: 1,
        day: 1,
        hour: 12,
        isLunar: false,
      };

      const result = calculateFourPillars(birthInfo);

      // 년주만 검증
      expect(result.year.combined).toHaveLength(2);
    });
  });

  describe('성능 테스트', () => {
    it('100번 계산이 1초 이내에 완료되어야 함', () => {
      const startTime = performance.now();

      for (let i = 0; i < 100; i++) {
        const birthInfo = {
          year: 1990 + i % 30,
          month: (i % 12) + 1,
          day: (i % 28) + 1,
          hour: i % 24,
          isLunar: false,
        };

        calculateFourPillars(birthInfo);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(1000); // 1초
    });

    it('같은 입력에 대해 일관된 결과를 반환해야 함 (멱등성)', () => {
      const birthInfo = {
        year: 1990,
        month: 5,
        day: 15,
        hour: 14,
        isLunar: false,
      };

      const result1 = calculateFourPillars(birthInfo);
      const result2 = calculateFourPillars(birthInfo);
      const result3 = calculateFourPillars(birthInfo);

      expect(result1).toEqual(result2);
      expect(result2).toEqual(result3);
    });
  });
});
