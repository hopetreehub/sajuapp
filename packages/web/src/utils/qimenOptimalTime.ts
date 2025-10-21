import { addMinutes } from 'date-fns';
import { calculateQimenChart } from './qimenCalculator';
import type { Fortune, QimenChart } from '../types/qimen';

/**
 * 시간대별 귀문둔갑 점수 결과
 */
export interface TimeSlotScore {
  time: Date;
  score: number;
  fortune: Fortune;
  chart: QimenChart;
}

/**
 * 시간대별 귀문둔갑 점수 계산
 * @param startDate 시작 날짜/시간
 * @param endDate 종료 날짜/시간
 * @param intervalMinutes 계산 간격(분), 기본값 60분
 * @returns 시간대별 점수 배열
 */
export function calculateTimeRangeScores(
  startDate: Date,
  endDate: Date,
  intervalMinutes: number = 60,
): TimeSlotScore[] {
  const results: TimeSlotScore[] = [];
  let currentTime = new Date(startDate);

  while (currentTime <= endDate) {
    const chart = calculateQimenChart({ dateTime: currentTime });
    results.push({
      time: new Date(currentTime),
      score: chart.overallFortune.score,
      fortune: chart.overallFortune.level,
      chart,
    });
    currentTime = addMinutes(currentTime, intervalMinutes);
  }

  return results;
}

/**
 * 최적 시간 추천
 * @param startDate 시작 날짜/시간
 * @param endDate 종료 날짜/시간
 * @returns 가장 점수가 높은 시간대 정보
 */
export function suggestOptimalTime(
  startDate: Date,
  endDate: Date,
): TimeSlotScore {
  const scores = calculateTimeRangeScores(startDate, endDate, 60);

  // 가장 높은 점수를 가진 시간대 찾기
  return scores.reduce((best, current) => {
    return current.score > best.score ? current : best;
  }, scores[0]);
}

/**
 * Fortune 레벨에 따른 아이콘 반환
 * @param fortune Fortune 레벨
 * @returns 이모지 아이콘
 */
export function getFortuneIcon(fortune: Fortune): string {
  const icons: Record<Fortune, string> = {
    excellent: '🌟',
    good: '✨',
    neutral: '⚖️',
    bad: '⚠️',
    terrible: '❌',
  };
  return icons[fortune];
}

/**
 * Fortune 레벨에 따른 색상 반환
 * @param fortune Fortune 레벨
 * @returns Tailwind CSS 색상 클래스
 */
export function getFortuneColor(fortune: Fortune): string {
  const colors: Record<Fortune, string> = {
    excellent: 'text-green-500',
    good: 'text-blue-500',
    neutral: 'text-gray-500',
    bad: 'text-orange-500',
    terrible: 'text-red-500',
  };
  return colors[fortune];
}

/**
 * Fortune 레벨에 따른 배경색 반환
 * @param fortune Fortune 레벨
 * @returns Tailwind CSS 배경색 클래스
 */
export function getFortuneBgColor(fortune: Fortune): string {
  const colors: Record<Fortune, string> = {
    excellent: 'bg-green-100 dark:bg-green-900',
    good: 'bg-blue-100 dark:bg-blue-900',
    neutral: 'bg-gray-100 dark:bg-gray-900',
    bad: 'bg-orange-100 dark:bg-orange-900',
    terrible: 'bg-red-100 dark:bg-red-900',
  };
  return colors[fortune];
}

/**
 * 일정의 시작/종료 시간에 대한 귀문둔갑 점수 계산
 * @param startTime 일정 시작 시간
 * @param endTime 일정 종료 시간
 * @returns 시작/종료 시간의 평균 점수와 Fortune 레벨
 */
export function evaluateEventTiming(
  startTime: Date,
  endTime?: Date,
): { score: number; fortune: Fortune; summary: string } {
  const startChart = calculateQimenChart({ dateTime: startTime });

  if (!endTime) {
    return {
      score: startChart.overallFortune.score,
      fortune: startChart.overallFortune.level,
      summary: startChart.overallFortune.summary,
    };
  }

  const endChart = calculateQimenChart({ dateTime: endTime });
  const avgScore = Math.round(
    (startChart.overallFortune.score + endChart.overallFortune.score) / 2,
  );

  // 평균 점수로 Fortune 레벨 결정
  let fortune: Fortune;
  if (avgScore >= 80) fortune = 'excellent';
  else if (avgScore >= 60) fortune = 'good';
  else if (avgScore >= 40) fortune = 'neutral';
  else if (avgScore >= 20) fortune = 'bad';
  else fortune = 'terrible';

  // 요약 메시지
  const summary = `시작: ${startChart.overallFortune.summary} | 종료: ${endChart.overallFortune.summary}`;

  return { score: avgScore, fortune, summary };
}
