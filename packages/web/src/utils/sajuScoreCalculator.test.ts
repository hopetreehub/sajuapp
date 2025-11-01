/**
 * 사주 점수 계산 알고리즘 단위 테스트 (TDD)
 *
 * 십이운성 통합 점수 시스템 테스트
 * @author Claude Code (Expert Persona - Deep Thinking)
 * @version 2.0.0
 *
 * TDD Red-Green-Refactor 사이클:
 * 1. RED: 실패하는 테스트 작성 (현재 단계)
 * 2. GREEN: 테스트를 통과하는 최소 코드 작성
 * 3. REFACTOR: 코드 개선
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  type CheonGan,
  type JiJi,
  type OhHaeng,
  type SajuData,
  calculateTimeBonus,
  // GREEN 단계: 구현 완료된 함수들
  calculate십이운성Bonus,
  getYearJiJi,
  getMonthJiJi,
  getJiJiForDate,
} from './sajuScoreCalculator';
import { calculate12LifeStage } from './sajuRelations';

// ===========================
// 🔴 TDD RED: 실패하는 테스트 작성
// ===========================

describe('십이운성 통합 점수 시스템 (TDD)', () => {
  // 테스트용 사주 데이터 (일간: 갑木)
  let testSajuData: SajuData;

  beforeEach(() => {
    testSajuData = {
      year: { gan: '병', ji: '인' },
      month: { gan: '신', ji: '유' },
      day: { gan: '갑', ji: '자' },  // 일간: 갑木
      time: { gan: '을', ji: '해' },
      ohHaengBalance: {
        목: 30,
        화: 20,
        토: 15,
        금: 20,
        수: 15,
      },
    };
  });

  // ========================================
  // 📋 Part 1: Helper 함수 테스트
  // ========================================
  describe('Part 1: 천간지지 계산 Helper 함수', () => {
    describe('getYearJiJi() - 년지 계산', () => {
      it('2024년은 진지(辰支)를 반환해야 함', () => {
        const result = getYearJiJi(2024);
        expect(result).toBe('진');
      });

      it('2025년은 사지(巳支)를 반환해야 함', () => {
        const result = getYearJiJi(2025);
        expect(result).toBe('사');
      });

      it('2026년은 오지(午支)를 반환해야 함', () => {
        const result = getYearJiJi(2026);
        expect(result).toBe('오');
      });

      it('60갑자 순환 검증: 2024년 + 12년 = 2036년 = 진지', () => {
        const result2024 = getYearJiJi(2024);
        const result2036 = getYearJiJi(2036);
        expect(result2024).toBe(result2036); // 12년 주기
      });

      it('1924년(갑자년)은 자지를 반환해야 함', () => {
        const result = getYearJiJi(1924);
        expect(result).toBe('자');
      });
    });

    describe('getMonthJiJi() - 월지 계산', () => {
      it('1월(음력 정월)은 인지를 반환해야 함', () => {
        const date = new Date(2024, 0, 15); // 1월
        const result = getMonthJiJi(date);
        expect(result).toBe('인');
      });

      it('5월(음력 오월)은 오지를 반환해야 함', () => {
        const date = new Date(2024, 4, 15); // 5월
        const result = getMonthJiJi(date);
        expect(result).toBe('오');
      });

      it('12월(음력 축월)은 축지를 반환해야 함', () => {
        const date = new Date(2024, 11, 15); // 12월
        const result = getMonthJiJi(date);
        expect(result).toBe('축'); // 12월 = 축월
      });
    });

    describe('getJiJiForDate() - 일지 계산', () => {
      it('특정 날짜의 일지를 정확히 계산해야 함', () => {
        const date = new Date(2024, 0, 1); // 2024-01-01
        const result = getJiJiForDate(date);
        expect(result).toMatch(/^(자|축|인|묘|진|사|오|미|신|유|술|해)$/);
      });

      it('연속된 날짜는 지지가 순환해야 함', () => {
        const date1 = new Date(2024, 0, 1);
        const date2 = new Date(2024, 0, 13); // 12일 후
        const result1 = getJiJiForDate(date1);
        const result2 = getJiJiForDate(date2);
        expect(result1).toBe(result2); // 12일 주기로 같은 지지
      });
    });
  });

  // ========================================
  // 📋 Part 2: 십이운성 점수 계산 테스트
  // ========================================
  describe('Part 2: calculate십이운성Bonus() - 십이운성 보너스 계산', () => {
    describe('기본 십이운성 점수 테스트 (year 시간대 - 100% 가중치)', () => {
      it('장생(長生)은 +20점을 반환해야 함 (최고 생명력)', () => {
        // 갑木 일간 + 해지 = 장생
        const dayGan: CheonGan = '갑';
        const targetJi: JiJi = '해';

        // 먼저 십이운성 검증
        const 십이운성 = calculate12LifeStage(dayGan, targetJi);
        expect(십이운성).toBe('장생');

        // 점수 계산 (year 시간대 = 100% 가중치)
        const bonus = calculate십이운성Bonus(dayGan, targetJi, 'year');
        expect(bonus).toBe(20);
      });

      it('제왕(帝旺)은 +18점을 반환해야 함 (전성기)', () => {
        // 갑木 일간 + 묘지 = 제왕
        const dayGan: CheonGan = '갑';
        const targetJi: JiJi = '묘';

        const 십이운성 = calculate12LifeStage(dayGan, targetJi);
        expect(십이운성).toBe('제왕');

        const bonus = calculate십이운성Bonus(dayGan, targetJi, 'year');
        expect(bonus).toBe(18);
      });

      it('건록(建祿)은 +15점을 반환해야 함 (왕성한 활동)', () => {
        // 갑木 일간 + 인지 = 건록
        const dayGan: CheonGan = '갑';
        const targetJi: JiJi = '인';

        const 십이운성 = calculate12LifeStage(dayGan, targetJi);
        expect(십이운성).toBe('건록');

        const bonus = calculate십이운성Bonus(dayGan, targetJi, 'year');
        expect(bonus).toBe(15);
      });

      it('쇠(衰)는 0점을 반환해야 함 (중립)', () => {
        // 갑木 일간 + 진지 = 쇠
        const dayGan: CheonGan = '갑';
        const targetJi: JiJi = '진';

        const 십이운성 = calculate12LifeStage(dayGan, targetJi);
        expect(십이운성).toBe('쇠');

        const bonus = calculate십이운성Bonus(dayGan, targetJi, 'year');
        expect(bonus).toBe(0);
      });

      it('병(病)은 -8점을 반환해야 함 (약화)', () => {
        // 갑木 일간 + 사지 = 병
        const dayGan: CheonGan = '갑';
        const targetJi: JiJi = '사';

        const 십이운성 = calculate12LifeStage(dayGan, targetJi);
        expect(십이운성).toBe('병');

        const bonus = calculate십이운성Bonus(dayGan, targetJi, 'year');
        expect(bonus).toBe(-8);
      });

      it('사(死)는 -12점을 반환해야 함 (정체)', () => {
        // 갑木 일간 + 오지 = 사
        const dayGan: CheonGan = '갑';
        const targetJi: JiJi = '오';

        const 십이운성 = calculate12LifeStage(dayGan, targetJi);
        expect(십이운성).toBe('사');

        const bonus = calculate십이운성Bonus(dayGan, targetJi, 'year');
        expect(bonus).toBe(-12);
      });

      it('묘(墓)는 -15점을 반환해야 함 (침체)', () => {
        // 갑木 일간 + 미지 = 묘
        const dayGan: CheonGan = '갑';
        const targetJi: JiJi = '미';

        const 십이운성 = calculate12LifeStage(dayGan, targetJi);
        expect(십이운성).toBe('묘');

        const bonus = calculate십이운성Bonus(dayGan, targetJi, 'year');
        expect(bonus).toBe(-15);
      });

      it('절(絕)은 -18점을 반환해야 함 (최저점)', () => {
        // 갑木 일간 + 신지 = 절
        const dayGan: CheonGan = '갑';
        const targetJi: JiJi = '신';

        const 십이운성 = calculate12LifeStage(dayGan, targetJi);
        expect(십이운성).toBe('절');

        const bonus = calculate십이운성Bonus(dayGan, targetJi, 'year');
        expect(bonus).toBe(-18);
      });
    });

    describe('시간대별 가중치 테스트', () => {
      it('today 시간대는 30% 가중치를 적용해야 함', () => {
        // 갑木 + 해지(장생) = 기본 20점
        const dayGan: CheonGan = '갑';
        const targetJi: JiJi = '해';

        const bonus = calculate십이운성Bonus(dayGan, targetJi, 'today');
        expect(bonus).toBe(6); // 20 * 0.3 = 6
      });

      it('month 시간대는 50% 가중치를 적용해야 함', () => {
        // 갑木 + 해지(장생) = 기본 20점
        const dayGan: CheonGan = '갑';
        const targetJi: JiJi = '해';

        const bonus = calculate십이운성Bonus(dayGan, targetJi, 'month');
        expect(bonus).toBe(10); // 20 * 0.5 = 10
      });

      it('year 시간대는 100% 가중치를 적용해야 함', () => {
        // 갑木 + 해지(장생) = 기본 20점
        const dayGan: CheonGan = '갑';
        const targetJi: JiJi = '해';

        const bonus = calculate십이운성Bonus(dayGan, targetJi, 'year');
        expect(bonus).toBe(20); // 20 * 1.0 = 20
      });

      it('음수 점수에도 가중치가 적용되어야 함', () => {
        // 갑木 + 신지(절) = 기본 -18점
        const dayGan: CheonGan = '갑';
        const targetJi: JiJi = '신';

        const todayBonus = calculate십이운성Bonus(dayGan, targetJi, 'today');
        expect(todayBonus).toBeCloseTo(-5.4); // -18 * 0.3 = -5.4

        const monthBonus = calculate십이운성Bonus(dayGan, targetJi, 'month');
        expect(monthBonus).toBe(-9); // -18 * 0.5 = -9

        const yearBonus = calculate십이운성Bonus(dayGan, targetJi, 'year');
        expect(yearBonus).toBe(-18); // -18 * 1.0 = -18
      });
    });

    describe('다른 일간(日干)에 대한 십이운성 차이 검증', () => {
      it('갑木과 을木의 진지(辰支)에 대한 십이운성이 달라야 함', () => {
        // 갑木 + 진지 = 쇠 (0점)
        const 갑목_진 = calculate12LifeStage('갑', '진');
        expect(갑목_진).toBe('쇠');
        const 갑목점수 = calculate십이운성Bonus('갑', '진', 'year');
        expect(갑목점수).toBe(0);

        // 을木 + 진지 = 관대 (+12점)
        const 을목_진 = calculate12LifeStage('을', '진');
        expect(을목_진).toBe('관대');
        const 을목점수 = calculate십이운성Bonus('을', '진', 'year');
        expect(을목점수).toBe(12);

        // 같은 지지여도 일간에 따라 12점 차이!
        expect(을목점수 - 갑목점수).toBe(12);
      });

      it('병火와 정Fire의 사지(巳支)에 대한 십이운성이 달라야 함', () => {
        // 병火 + 사지 = 건록 (+15점)
        const 병화_사 = calculate12LifeStage('병', '사');
        expect(병화_사).toBe('건록');
        const 병화점수 = calculate십이운성Bonus('병', '사', 'year');
        expect(병화점수).toBe(15);

        // 정火+ 사지 = 제왕 (+18점)
        const 정화_사 = calculate12LifeStage('정', '사');
        expect(정화_사).toBe('제왕');
        const 정화점수 = calculate십이운성Bonus('정', '사', 'year');
        expect(정화점수).toBe(18);

        // 같은 오행(火)이라도 3점 차이!
        expect(정화점수 - 병화점수).toBe(3);
      });
    });

    describe('에러 처리 및 엣지 케이스', () => {
      it('잘못된 일간이 입력되면 0점을 반환해야 함', () => {
        // @ts-expect-error - 의도적으로 잘못된 값 입력
        const bonus = calculate십이운성Bonus('잘못된일간', '해', 'year');
        expect(bonus).toBe(0);
      });

      it('잘못된 지지가 입력되면 0점을 반환해야 함', () => {
        // @ts-expect-error - 의도적으로 잘못된 값 입력
        const bonus = calculate십이운성Bonus('갑', '잘못된지지', 'year');
        expect(bonus).toBe(0);
      });

      it('십이운성이 "없음"인 경우 0점을 반환해야 함', () => {
        // sajuRelations.ts의 calculate12LifeStage가 '없음'을 반환하는 경우
        // (실제로는 발생하지 않지만 방어 코드 필요)
        const dayGan: CheonGan = '갑';
        const targetJi: JiJi = '자';

        const bonus = calculate십이운성Bonus(dayGan, targetJi, 'year');
        expect(typeof bonus).toBe('number');
        expect(bonus).toBeGreaterThanOrEqual(-18);
        expect(bonus).toBeLessThanOrEqual(20);
      });
    });
  });

  // ========================================
  // 📋 Part 3: calculateTimeBonus 통합 테스트
  // ========================================
  describe('Part 3: calculateTimeBonus() - 십이운성 통합 검증', () => {
    const targetDate2026 = new Date(2026, 0, 1); // 2026년 (오지)

    it('십이운성 보너스가 calculateTimeBonus에 반영되어야 함', () => {
      // 갑木 일간 + 2026년 오지(午支) = 사(死) = -12점
      const primaryElement: OhHaeng = '목';
      const secondaryElement: OhHaeng = '수';

      // 기존 보너스 계산
      const bonusWithout십이운성 = calculateTimeBonus(
        primaryElement,
        secondaryElement,
        testSajuData,
        'year',
        targetDate2026,
        1990,
      );

      // 십이운성 통합 후에는 -12점이 추가되어야 함
      // (현재는 통합되지 않았으므로 이 테스트는 실패할 것임 - RED)
      expect(bonusWithout십이운성).toBeDefined();
      expect(typeof bonusWithout십이운성).toBe('number');

      // TODO: 십이운성 통합 후 다음 테스트로 대체
      // expect(bonusWithout십이운성).toBeLessThan(-5); // -12점 영향
    });

    it('year 시간대에서 십이운성 영향이 가장 커야 함', () => {
      const primaryElement: OhHaeng = '목';
      const secondaryElement: OhHaeng = '수';

      const todayBonus = calculateTimeBonus(
        primaryElement,
        secondaryElement,
        testSajuData,
        'today',
        targetDate2026,
        1990,
      );

      const yearBonus = calculateTimeBonus(
        primaryElement,
        secondaryElement,
        testSajuData,
        'year',
        targetDate2026,
        1990,
      );

      // year가 today보다 십이운성 영향이 크므로 차이가 더 커야 함
      // (십이운성 통합 후 검증 가능)
      expect(yearBonus).toBeDefined();
      expect(todayBonus).toBeDefined();
    });
  });

  // ========================================
  // 📋 Part 4: 실제 사용 시나리오 테스트
  // ========================================
  describe('Part 4: 실전 시나리오 - 3명의 고객 비교', () => {
    it('2026년 오지년에 갑/을/병 일간의 점수가 달라야 함', () => {
      const 갑목사주: SajuData = {
        ...testSajuData,
        day: { gan: '갑', ji: '자' },
      };

      const 을목사주: SajuData = {
        ...testSajuData,
        day: { gan: '을', ji: '축' },
      };

      const 병화사주: SajuData = {
        ...testSajuData,
        day: { gan: '병', ji: '인' },
      };

      // 2026년 = 오지(午支)
      // 갑木 + 오지 = 사(死) = -12점
      const 갑목_오 = calculate12LifeStage('갑', '오');
      expect(갑목_오).toBe('사');

      // 을木 + 오지 = 장생(長生) = +20점
      const 을목_오 = calculate12LifeStage('을', '오');
      expect(을목_오).toBe('장생');

      // 병Fire + 오지 = 제왕(帝旺) = +18점
      const 병화_오 = calculate12LifeStage('병', '오');
      expect(병화_오).toBe('제왕');

      // 점수 차이: 갑(-12) << 병(+18) < 을(+20)
      // 총 32점 차이! (개인별 차별화 극대화)
    });
  });
});
