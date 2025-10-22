import { useMemo } from 'react';
import { useQimenBookmarkStore } from '@/stores/qimenBookmarkStore';
import type { QimenContext } from '@/data/qimenContextWeights';
import type { Direction, Palace } from '@/types/qimen';

/**
 * 귀문둔갑 통계 데이터 인터페이스
 */
export interface QimenStats {
  // 기본 통계
  totalChecks: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;

  // 패턴 분석
  mostFrequentContext: QimenContext;
  bestTimeOfDay: string; // "09:00-11:00"
  favoriteDirection: Direction;
  bestPalace: Palace;

  // 트렌드 분석
  weeklyTrend: Array<{ week: string; avgScore: number; count: number }>;
  monthlyPatterns: Array<{
    month: string;
    excellentDays: number;
    goodDays: number;
    neutralDays: number;
    badDays: number;
    terribleDays: number;
    avgScore: number;
  }>;

  // 시간대별 분석
  hourlyDistribution: Array<{ hour: number; avgScore: number; count: number }>;

  // 방향별 분석
  directionStats: Array<{
    direction: Direction;
    avgScore: number;
    count: number;
    bestPalace: Palace;
  }>;

  // 컨텍스트별 분석
  contextStats: Array<{
    context: QimenContext;
    avgScore: number;
    count: number;
    successRate: number; // 60점 이상 비율
  }>;
}

/**
 * 주차 문자열 생성 (예: "2025-W03")
 */
function getWeekString(date: Date): string {
  const year = date.getFullYear();
  const firstDayOfYear = new Date(year, 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  return `${year}-W${String(weekNumber).padStart(2, '0')}`;
}

/**
 * 월 문자열 생성 (예: "2025-01")
 */
function getMonthString(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  return `${year}-${String(month).padStart(2, '0')}`;
}

/**
 * 시간대 추출 (0-23)
 */
function getHour(date: Date): number {
  return date.getHours();
}

/**
 * 운세 레벨 카운트 증가
 */
function incrementLevelCount(
  counts: { excellent: number; good: number; neutral: number; bad: number; terrible: number },
  level: string,
): void {
  if (level === 'excellent') counts.excellent++;
  else if (level === 'good') counts.good++;
  else if (level === 'neutral') counts.neutral++;
  else if (level === 'bad') counts.bad++;
  else if (level === 'terrible') counts.terrible++;
}

/**
 * 귀문둔갑 통계 Hook
 *
 * 사용자의 북마크 데이터를 분석하여 다양한 통계와 패턴을 추출합니다.
 *
 * @returns {QimenStats} 통계 데이터
 */
export function useQimenStats(): QimenStats {
  const { getAllBookmarks } = useQimenBookmarkStore();

  return useMemo(() => {
    const bookmarks = getAllBookmarks();

    // 데이터가 없는 경우 기본값 반환
    if (bookmarks.length === 0) {
      return {
        totalChecks: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        mostFrequentContext: 'business' as QimenContext,
        bestTimeOfDay: '00:00-00:00',
        favoriteDirection: 'N' as Direction,
        bestPalace: 5 as Palace, // 5궁 = 중앙
        weeklyTrend: [],
        monthlyPatterns: [],
        hourlyDistribution: [],
        directionStats: [],
        contextStats: [],
      };
    }

    // 1. 기본 통계 계산
    const scores = bookmarks.map((b) => b.chart.overallFortune.score);
    const totalChecks = bookmarks.length;
    const averageScore = Math.round(
      scores.reduce((sum, score) => sum + score, 0) / scores.length,
    );
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);

    // 2. 컨텍스트 빈도 분석
    const contextCounts: Record<string, number> = {};
    bookmarks.forEach((b) => {
      contextCounts[b.context] = (contextCounts[b.context] || 0) + 1;
    });
    const mostFrequentContext = Object.entries(contextCounts).reduce((a, b) =>
      b[1] > a[1] ? b : a,
    )[0] as QimenContext;

    // 3. 시간대별 점수 분석
    const hourlyData: Record<number, { sum: number; count: number }> = {};
    bookmarks.forEach((b) => {
      const hour = getHour(new Date(b.dateTime));
      if (!hourlyData[hour]) {
        hourlyData[hour] = { sum: 0, count: 0 };
      }
      hourlyData[hour].sum += b.chart.overallFortune.score;
      hourlyData[hour].count += 1;
    });

    const hourlyDistribution = Object.entries(hourlyData)
      .map(([hour, data]) => ({
        hour: parseInt(hour),
        avgScore: Math.round(data.sum / data.count),
        count: data.count,
      }))
      .sort((a, b) => a.hour - b.hour);

    // 최고 점수 시간대 찾기
    const bestHourData = hourlyDistribution.reduce((best, current) =>
      current.avgScore > best.avgScore ? current : best,
    );
    const bestTimeOfDay = `${String(bestHourData.hour).padStart(2, '0')}:00-${String(
      (bestHourData.hour + 1) % 24,
    ).padStart(2, '0')}:00`;

    // 4. 방향 분석 (가장 좋은 궁의 방향)
    const directionData: Record<
      Direction,
      { sum: number; count: number; palaces: Record<Palace, number> }
    > = {} as any;

    bookmarks.forEach((b) => {
      const bestPalaces = b.chart.overallFortune.bestPalaces || [];
      bestPalaces.forEach((palace) => {
        const direction = b.chart.palaces[palace].direction as Direction;
        if (!directionData[direction]) {
          directionData[direction] = { sum: 0, count: 0, palaces: {} as Record<Palace, number> };
        }
        directionData[direction].sum += b.chart.palaces[palace].score || 0;
        directionData[direction].count += 1;
        directionData[direction].palaces[palace] =
          (directionData[direction].palaces[palace] || 0) + 1;
      });
    });

    const directionStats = Object.entries(directionData).map(([direction, data]) => {
      const avgScore = Math.round(data.sum / data.count);
      const bestPalace = Number(Object.entries(data.palaces).reduce((a, b) =>
        b[1] > a[1] ? b : a,
      )[0]) as Palace;
      return {
        direction: direction as Direction,
        avgScore,
        count: data.count,
        bestPalace,
      };
    });

    const favoriteDirection =
      directionStats.length > 0
        ? directionStats.reduce((best, current) =>
            current.avgScore > best.avgScore ? current : best,
          ).direction
        : ('N' as Direction);

    const bestPalace =
      directionStats.length > 0
        ? directionStats.reduce((best, current) =>
            current.avgScore > best.avgScore ? current : best,
          ).bestPalace
        : (5 as Palace); // 5궁 = 중앙

    // 5. 주간 트렌드 분석
    const weeklyData: Record<string, { sum: number; count: number }> = {};
    bookmarks.forEach((b) => {
      const week = getWeekString(new Date(b.dateTime));
      if (!weeklyData[week]) {
        weeklyData[week] = { sum: 0, count: 0 };
      }
      weeklyData[week].sum += b.chart.overallFortune.score;
      weeklyData[week].count += 1;
    });

    const weeklyTrend = Object.entries(weeklyData)
      .map(([week, data]) => ({
        week,
        avgScore: Math.round(data.sum / data.count),
        count: data.count,
      }))
      .sort((a, b) => a.week.localeCompare(b.week))
      .slice(-12); // 최근 12주

    // 6. 월간 패턴 분석
    const monthlyData: Record<
      string,
      {
        scores: number[];
        levels: { excellent: number; good: number; neutral: number; bad: number; terrible: number };
      }
    > = {};

    bookmarks.forEach((b) => {
      const month = getMonthString(new Date(b.dateTime));
      if (!monthlyData[month]) {
        monthlyData[month] = {
          scores: [],
          levels: { excellent: 0, good: 0, neutral: 0, bad: 0, terrible: 0 },
        };
      }
      monthlyData[month].scores.push(b.chart.overallFortune.score);
      incrementLevelCount(monthlyData[month].levels, b.chart.overallFortune.level);
    });

    const monthlyPatterns = Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        excellentDays: data.levels.excellent,
        goodDays: data.levels.good,
        neutralDays: data.levels.neutral,
        badDays: data.levels.bad,
        terribleDays: data.levels.terrible,
        avgScore: Math.round(data.scores.reduce((sum, s) => sum + s, 0) / data.scores.length),
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12); // 최근 12개월

    // 7. 컨텍스트별 통계
    const contextData: Record<string, { sum: number; count: number; successCount: number }> = {};
    bookmarks.forEach((b) => {
      const ctx = b.context;
      if (!contextData[ctx]) {
        contextData[ctx] = { sum: 0, count: 0, successCount: 0 };
      }
      contextData[ctx].sum += b.chart.overallFortune.score;
      contextData[ctx].count += 1;
      if (b.chart.overallFortune.score >= 60) {
        contextData[ctx].successCount += 1;
      }
    });

    const contextStats = Object.entries(contextData).map(([context, data]) => ({
      context: context as QimenContext,
      avgScore: Math.round(data.sum / data.count),
      count: data.count,
      successRate: Math.round((data.successCount / data.count) * 100),
    }));

    return {
      totalChecks,
      averageScore,
      highestScore,
      lowestScore,
      mostFrequentContext,
      bestTimeOfDay,
      favoriteDirection,
      bestPalace,
      weeklyTrend,
      monthlyPatterns,
      hourlyDistribution,
      directionStats,
      contextStats,
    };
  }, [getAllBookmarks]);
}
