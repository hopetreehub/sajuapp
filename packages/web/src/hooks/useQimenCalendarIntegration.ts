import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  calculateTimeRangeScores,
  suggestOptimalTime,
  evaluateEventTiming,
  getFortuneIcon,
  getFortuneColor,
  getFortuneBgColor,
  type TimeSlotScore
} from '@/utils/qimenOptimalTime';
import type { Fortune } from '@/types/qimen';

/**
 * 캘린더 통합을 위한 Qimen 훅 상태
 */
interface QimenCalendarState {
  timeSlotScores: TimeSlotScore[];
  optimalTime: TimeSlotScore | null;
  isCalculating: boolean;
  error: string | null;
}

/**
 * 훅 옵션
 */
interface UseQimenCalendarIntegrationOptions {
  /** 시작 날짜/시간 (선택사항, 기본값: 오늘 00:00) */
  startDate?: Date;
  /** 종료 날짜/시간 (선택사항, 기본값: 오늘 23:59) */
  endDate?: Date;
  /** 계산 간격(분), 기본값 60분 */
  intervalMinutes?: number;
  /** 자동 계산 활성화 여부 (기본값: true) */
  autoCalculate?: boolean;
}

/**
 * 캘린더 귀문둔갑 통합 React Hook
 *
 * 사용 예시:
 * ```tsx
 * const {
 *   timeSlotScores,
 *   optimalTime,
 *   evaluateEvent,
 *   getFortuneDisplay
 * } = useQimenCalendarIntegration({
 *   startDate: new Date(),
 *   endDate: addDays(new Date(), 7)
 * });
 * ```
 *
 * @param options 훅 옵션
 * @returns Qimen 계산 결과 및 헬퍼 함수들
 */
export const useQimenCalendarIntegration = (
  options: UseQimenCalendarIntegrationOptions = {}
) => {
  const {
    startDate,
    endDate,
    intervalMinutes = 60,
    autoCalculate = true,
  } = options;

  // 상태 관리
  const [state, setState] = useState<QimenCalendarState>({
    timeSlotScores: [],
    optimalTime: null,
    isCalculating: false,
    error: null,
  });

  // 기본 날짜 범위 계산 (오늘 하루)
  const defaultStartDate = useMemo(() => {
    if (startDate) return startDate;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }, [startDate]);

  const defaultEndDate = useMemo(() => {
    if (endDate) return endDate;
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return today;
  }, [endDate]);

  /**
   * 시간대별 점수 계산
   */
  const calculateScores = useCallback(async () => {
    if (!autoCalculate) return;

    setState(prev => ({ ...prev, isCalculating: true, error: null }));

    try {
      // 비동기 작업으로 처리하여 UI 블로킹 방지
      await new Promise(resolve => setTimeout(resolve, 0));

      const scores = calculateTimeRangeScores(
        defaultStartDate,
        defaultEndDate,
        intervalMinutes
      );

      const optimal = scores.length > 0
        ? suggestOptimalTime(defaultStartDate, defaultEndDate)
        : null;

      setState({
        timeSlotScores: scores,
        optimalTime: optimal,
        isCalculating: false,
        error: null,
      });
    } catch (error) {
      console.error('Qimen calculation error:', error);
      setState(prev => ({
        ...prev,
        isCalculating: false,
        error: error instanceof Error ? error.message : 'Calculation failed',
      }));
    }
  }, [defaultStartDate, defaultEndDate, intervalMinutes, autoCalculate]);

  /**
   * 수동 재계산 트리거
   */
  const recalculate = useCallback(() => {
    calculateScores();
  }, [calculateScores]);

  /**
   * 특정 일정의 시작/종료 시간 평가
   * @param startTime 일정 시작 시간
   * @param endTime 일정 종료 시간 (선택사항)
   * @returns 점수, Fortune 레벨, 요약
   */
  const evaluateEvent = useCallback(
    (startTime: Date, endTime?: Date) => {
      return evaluateEventTiming(startTime, endTime);
    },
    []
  );

  /**
   * 특정 시간의 Qimen 점수 조회
   * @param time 조회할 시간
   * @returns TimeSlotScore 또는 undefined
   */
  const getScoreForTime = useCallback(
    (time: Date): TimeSlotScore | undefined => {
      // 정확히 일치하는 시간 찾기
      const exactMatch = state.timeSlotScores.find(
        slot => slot.time.getTime() === time.getTime()
      );
      if (exactMatch) return exactMatch;

      // 가장 가까운 시간 슬롯 찾기
      const closest = state.timeSlotScores.reduce((prev, curr) => {
        const prevDiff = Math.abs(prev.time.getTime() - time.getTime());
        const currDiff = Math.abs(curr.time.getTime() - time.getTime());
        return currDiff < prevDiff ? curr : prev;
      }, state.timeSlotScores[0]);

      return closest;
    },
    [state.timeSlotScores]
  );

  /**
   * Fortune 레벨에 따른 UI 표시 정보 반환
   * @param fortune Fortune 레벨
   * @returns 아이콘, 색상, 배경색
   */
  const getFortuneDisplay = useCallback((fortune: Fortune) => {
    return {
      icon: getFortuneIcon(fortune),
      color: getFortuneColor(fortune),
      bgColor: getFortuneBgColor(fortune),
    };
  }, []);

  /**
   * 특정 시간이 최적 시간인지 확인
   * @param time 확인할 시간
   * @returns 최적 시간 여부
   */
  const isOptimalTime = useCallback(
    (time: Date): boolean => {
      if (!state.optimalTime) return false;
      return state.optimalTime.time.getTime() === time.getTime();
    },
    [state.optimalTime]
  );

  /**
   * 특정 날짜의 최고 점수 시간 찾기
   * @param date 날짜
   * @returns 해당 날짜의 최고 점수 TimeSlotScore 또는 undefined
   */
  const getBestTimeForDay = useCallback(
    (date: Date): TimeSlotScore | undefined => {
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const daySlots = state.timeSlotScores.filter(
        slot => slot.time >= dayStart && slot.time <= dayEnd
      );

      if (daySlots.length === 0) return undefined;

      return daySlots.reduce((best, current) =>
        current.score > best.score ? current : best
      );
    },
    [state.timeSlotScores]
  );

  /**
   * Fortune 레벨별 시간대 필터링
   * @param fortune Fortune 레벨
   * @returns 해당 레벨의 시간대 배열
   */
  const filterTimeSlotsByFortune = useCallback(
    (fortune: Fortune): TimeSlotScore[] => {
      return state.timeSlotScores.filter(slot => slot.fortune === fortune);
    },
    [state.timeSlotScores]
  );

  /**
   * 날짜 범위 변경 시 자동 재계산
   */
  useEffect(() => {
    if (autoCalculate) {
      calculateScores();
    }
  }, [calculateScores, autoCalculate]);

  // 반환 값
  return {
    // 상태
    timeSlotScores: state.timeSlotScores,
    optimalTime: state.optimalTime,
    isCalculating: state.isCalculating,
    error: state.error,

    // 계산 함수
    recalculate,
    evaluateEvent,

    // 조회 함수
    getScoreForTime,
    getBestTimeForDay,
    filterTimeSlotsByFortune,
    isOptimalTime,

    // UI 헬퍼
    getFortuneDisplay,
  };
};
