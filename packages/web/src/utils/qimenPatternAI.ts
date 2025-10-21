import type { QimenChart as _QimenChart, Palace as _Palace, Direction } from '@/types/qimen';
import type { QimenContext } from '@/data/qimenContextWeights';
import type { QimenBookmark } from '@/stores/qimenBookmarkStore';
import type { QimenStats } from '@/hooks/useQimenStats';

/**
 * AI 분석 결과 인터페이스
 */
export interface QimenPattern {
  id: string;
  type: 'insight' | 'recommendation' | 'prediction' | 'warning';
  title: string;
  description: string;
  confidence: number; // 0-100
  importance: 'high' | 'medium' | 'low';
  actionable: boolean;
  relatedData?: {
    context?: QimenContext;
    timeRange?: string;
    direction?: Direction;
    score?: number;
  };
}

/**
 * 예측 결과 인터페이스
 */
export interface QimenPrediction {
  date: Date;
  timeRange: string; // "09:00-11:00"
  predictedScore: number;
  confidence: number; // 0-100
  reasons: string[];
  suggestedContext: QimenContext;
  suggestedDirection: Direction;
}

/**
 * 종합 분석 결과
 */
export interface QimenAnalysis {
  patterns: QimenPattern[];
  predictions: QimenPrediction[];
  summary: {
    overallTrend: 'improving' | 'stable' | 'declining';
    trendConfidence: number;
    dataQuality: 'excellent' | 'good' | 'fair' | 'poor';
    dataPoints: number;
    analysisDate: Date;
  };
  recommendations: {
    bestTimes: string[]; // ["월요일 09:00-11:00", "수요일 14:00-16:00"]
    avoidTimes: string[];
    preferredContexts: QimenContext[];
    favoriteDirections: Direction[];
  };
}

/**
 * 데이터 품질 평가
 */
function assessDataQuality(bookmarks: QimenBookmark[]): {
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  message: string;
} {
  const count = bookmarks.length;
  const uniqueDates = new Set(
    bookmarks.map((b) => new Date(b.dateTime).toDateString()),
  ).size;

  if (count >= 90 && uniqueDates >= 30) {
    return {
      quality: 'excellent',
      message: '충분한 데이터로 높은 신뢰도의 분석이 가능합니다.',
    };
  } else if (count >= 60 && uniqueDates >= 20) {
    return {
      quality: 'good',
      message: '양호한 데이터로 의미있는 패턴을 도출할 수 있습니다.',
    };
  } else if (count >= 30 && uniqueDates >= 10) {
    return {
      quality: 'fair',
      message: '기본적인 패턴 분석이 가능하나 더 많은 데이터가 필요합니다.',
    };
  } else {
    return {
      quality: 'poor',
      message: '신뢰도 높은 분석을 위해 30일 이상의 데이터를 수집해주세요.',
    };
  }
}

/**
 * 전반적 트렌드 분석
 */
function analyzeTrend(
  bookmarks: QimenBookmark[],
): 'improving' | 'stable' | 'declining' {
  if (bookmarks.length < 10) return 'stable';

  // 최근 데이터와 과거 데이터 비교
  const sortedBookmarks = [...bookmarks].sort(
    (a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime(),
  );

  const recentCount = Math.floor(bookmarks.length / 3);
  const recentBookmarks = sortedBookmarks.slice(-recentCount);
  const oldBookmarks = sortedBookmarks.slice(0, recentCount);

  const recentAvg =
    recentBookmarks.reduce((sum, b) => sum + b.chart.overallFortune.score, 0) /
    recentBookmarks.length;
  const oldAvg =
    oldBookmarks.reduce((sum, b) => sum + b.chart.overallFortune.score, 0) / oldBookmarks.length;

  const diff = recentAvg - oldAvg;

  if (diff > 5) return 'improving';
  if (diff < -5) return 'declining';
  return 'stable';
}

/**
 * 시간대별 패턴 발견
 */
function findTimePatterns(bookmarks: QimenBookmark[], stats: QimenStats): QimenPattern[] {
  const patterns: QimenPattern[] = [];

  // 최고 시간대 패턴
  const bestHour = stats.hourlyDistribution.reduce((best, current) =>
    current.avgScore > best.avgScore ? current : best,
  );

  if (bestHour.count >= 3) {
    patterns.push({
      id: 'time-best',
      type: 'insight',
      title: '최적 시간대 발견',
      description: `${String(bestHour.hour).padStart(2, '0')}:00-${String(
        (bestHour.hour + 1) % 24,
      ).padStart(
        2,
        '0',
      )}:00 시간대에서 평균 ${bestHour.avgScore}점으로 가장 높은 운세를 보입니다. 이 시간대에 중요한 일정을 계획하세요.`,
      confidence: Math.min(95, 60 + bestHour.count * 5),
      importance: 'high',
      actionable: true,
      relatedData: {
        timeRange: stats.bestTimeOfDay,
        score: bestHour.avgScore,
      },
    });
  }

  // 저조한 시간대 경고
  const worstHour = stats.hourlyDistribution.reduce((worst, current) =>
    current.avgScore < worst.avgScore ? current : worst,
  );

  if (worstHour.count >= 3 && worstHour.avgScore < 40) {
    patterns.push({
      id: 'time-worst',
      type: 'warning',
      title: '주의 필요 시간대',
      description: `${String(worstHour.hour).padStart(2, '0')}:00-${String(
        (worstHour.hour + 1) % 24,
      ).padStart(
        2,
        '0',
      )}:00 시간대는 평균 ${worstHour.avgScore}점으로 저조합니다. 이 시간대는 중요한 결정을 피하는 것이 좋습니다.`,
      confidence: Math.min(90, 55 + worstHour.count * 5),
      importance: 'medium',
      actionable: true,
      relatedData: {
        timeRange: `${String(worstHour.hour).padStart(2, '0')}:00-${String(
          (worstHour.hour + 1) % 24,
        ).padStart(2, '0')}:00`,
        score: worstHour.avgScore,
      },
    });
  }

  return patterns;
}

/**
 * 컨텍스트별 패턴 발견
 */
function findContextPatterns(stats: QimenStats): QimenPattern[] {
  const patterns: QimenPattern[] = [];

  // 성공률이 높은 컨텍스트
  const bestContext = stats.contextStats.reduce((best, current) =>
    current.successRate > best.successRate ? current : best,
  );

  if (bestContext.count >= 5 && bestContext.successRate >= 70) {
    const contextNames: Record<QimenContext, string> = {
      business: '사업/투자',
      meeting: '회의/협상',
      travel: '여행/이동',
      study: '학습/시험',
      health: '건강/치료',
      relationship: '인간관계',
      decision: '중요결정',
      lawsuit: '소송/법률',
    };

    patterns.push({
      id: 'context-best',
      type: 'insight',
      title: '강점 영역 발견',
      description: `${contextNames[bestContext.context]} 분야에서 ${bestContext.successRate}%의 높은 성공률을 보입니다. 이 분야에 더 집중하시는 것을 권장합니다.`,
      confidence: Math.min(90, 50 + bestContext.count * 3),
      importance: 'high',
      actionable: true,
      relatedData: {
        context: bestContext.context,
        score: bestContext.avgScore,
      },
    });
  }

  // 성공률이 낮은 컨텍스트
  const worstContext = stats.contextStats.reduce((worst, current) =>
    current.successRate < worst.successRate ? current : worst,
  );

  if (worstContext.count >= 5 && worstContext.successRate <= 40) {
    const contextNames: Record<QimenContext, string> = {
      business: '사업/투자',
      meeting: '회의/협상',
      travel: '여행/이동',
      study: '학습/시험',
      health: '건강/치료',
      relationship: '인간관계',
      decision: '중요결정',
      lawsuit: '소송/법률',
    };

    patterns.push({
      id: 'context-worst',
      type: 'recommendation',
      title: '개선 필요 영역',
      description: `${contextNames[worstContext.context]} 분야는 ${worstContext.successRate}%의 낮은 성공률을 보입니다. 이 분야의 활동은 더 신중하게 접근하거나 다른 시간대를 선택하세요.`,
      confidence: Math.min(85, 45 + worstContext.count * 3),
      importance: 'medium',
      actionable: true,
      relatedData: {
        context: worstContext.context,
        score: worstContext.avgScore,
      },
    });
  }

  return patterns;
}

/**
 * 방향 패턴 발견
 */
function findDirectionPatterns(stats: QimenStats): QimenPattern[] {
  const patterns: QimenPattern[] = [];

  if (stats.directionStats.length === 0) return patterns;

  const bestDirection = stats.directionStats.reduce((best, current) =>
    current.avgScore > best.avgScore ? current : best,
  );

  if (bestDirection.count >= 5) {
    const directionNames: Record<Direction, string> = {
      N: '북쪽',
      NE: '북동쪽',
      E: '동쪽',
      SE: '남동쪽',
      S: '남쪽',
      SW: '남서쪽',
      W: '서쪽',
      NW: '북서쪽',
      C: '중앙',
    };

    patterns.push({
      id: 'direction-best',
      type: 'insight',
      title: '길한 방향 발견',
      description: `${directionNames[bestDirection.direction]} 방향이 평균 ${bestDirection.avgScore}점으로 가장 길한 방향입니다. 중요한 활동 시 이 방향을 선택하세요.`,
      confidence: Math.min(85, 50 + bestDirection.count * 2),
      importance: 'medium',
      actionable: true,
      relatedData: {
        direction: bestDirection.direction,
        score: bestDirection.avgScore,
      },
    });
  }

  return patterns;
}

/**
 * 월간 트렌드 패턴 발견
 */
function findMonthlyPatterns(stats: QimenStats): QimenPattern[] {
  const patterns: QimenPattern[] = [];

  if (stats.monthlyPatterns.length < 3) return patterns;

  // 최근 3개월 평균과 전체 평균 비교
  const recentMonths = stats.monthlyPatterns.slice(-3);
  const recentAvg =
    recentMonths.reduce((sum, m) => sum + m.avgScore, 0) / recentMonths.length;

  const overallAvg =
    stats.monthlyPatterns.reduce((sum, m) => sum + m.avgScore, 0) /
    stats.monthlyPatterns.length;

  const diff = recentAvg - overallAvg;

  if (diff > 10) {
    patterns.push({
      id: 'monthly-improving',
      type: 'insight',
      title: '운세 상승 추세',
      description: `최근 3개월 평균(${Math.round(
        recentAvg,
      )}점)이 전체 평균(${Math.round(
        overallAvg,
      )}점)보다 높습니다. 긍정적인 흐름이 지속되고 있습니다.`,
      confidence: 80,
      importance: 'high',
      actionable: false,
    });
  } else if (diff < -10) {
    patterns.push({
      id: 'monthly-declining',
      type: 'warning',
      title: '운세 하락 주의',
      description: `최근 3개월 평균(${Math.round(
        recentAvg,
      )}점)이 전체 평균(${Math.round(
        overallAvg,
      )}점)보다 낮습니다. 더 신중한 접근이 필요합니다.`,
      confidence: 75,
      importance: 'medium',
      actionable: false,
    });
  }

  return patterns;
}

/**
 * 미래 운세 예측
 */
function generatePredictions(
  bookmarks: QimenBookmark[],
  stats: QimenStats,
): QimenPrediction[] {
  const predictions: QimenPrediction[] = [];

  // 데이터가 충분하지 않으면 예측하지 않음
  if (bookmarks.length < 30) return predictions;

  // 다음 7일간의 최적 시간대 예측
  const today = new Date();
  const bestHour = stats.hourlyDistribution.reduce((best, current) =>
    current.avgScore > best.avgScore ? current : best,
  );
  const bestContext = stats.contextStats.reduce((best, current) =>
    current.avgScore > best.avgScore ? current : best,
  );

  for (let i = 1; i <= 7; i++) {
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + i);

    // 요일별 패턴 분석
    const dayOfWeek = futureDate.getDay();
    const sameDayBookmarks = bookmarks.filter(
      (b) => new Date(b.dateTime).getDay() === dayOfWeek,
    );

    let predictedScore = stats.averageScore;
    let confidence = 50;
    const reasons: string[] = [];

    // 같은 요일 데이터가 있으면 활용
    if (sameDayBookmarks.length >= 3) {
      const dayAvg =
        sameDayBookmarks.reduce((sum, b) => sum + b.chart.overallFortune.score, 0) /
        sameDayBookmarks.length;
      predictedScore = Math.round((predictedScore + dayAvg) / 2);
      confidence += 15;
      reasons.push(`같은 요일 평균 ${Math.round(dayAvg)}점 기반`);
    }

    // 최고 시간대 점수 반영
    if (bestHour.count >= 5) {
      predictedScore = Math.round((predictedScore + bestHour.avgScore) / 2);
      confidence += 10;
      reasons.push('최적 시간대 활용');
    }

    // 트렌드 반영
    const trend = analyzeTrend(bookmarks);
    if (trend === 'improving') {
      predictedScore = Math.min(100, predictedScore + 5);
      confidence += 5;
      reasons.push('상승 추세 반영');
    } else if (trend === 'declining') {
      predictedScore = Math.max(0, predictedScore - 5);
      confidence += 5;
      reasons.push('하락 추세 반영');
    }

    predictions.push({
      date: futureDate,
      timeRange: `${String(bestHour.hour).padStart(2, '0')}:00-${String(
        (bestHour.hour + 1) % 24,
      ).padStart(2, '0')}:00`,
      predictedScore,
      confidence: Math.min(85, confidence),
      reasons,
      suggestedContext: bestContext.context,
      suggestedDirection: stats.favoriteDirection,
    });
  }

  return predictions;
}

/**
 * 종합 AI 분석 실행
 *
 * 사용자의 귀문둔갑 북마크 데이터를 분석하여 패턴, 인사이트, 추천사항, 예측을 생성합니다.
 *
 * @param bookmarks 북마크 데이터
 * @param stats 통계 데이터
 * @returns 종합 분석 결과
 */
export function analyzeUserPatterns(
  bookmarks: QimenBookmark[],
  stats: QimenStats,
): QimenAnalysis {
  const dataQualityResult = assessDataQuality(bookmarks);
  const trend = analyzeTrend(bookmarks);

  // 모든 패턴 수집
  const patterns: QimenPattern[] = [
    ...findTimePatterns(bookmarks, stats),
    ...findContextPatterns(stats),
    ...findDirectionPatterns(stats),
    ...findMonthlyPatterns(stats),
  ];

  // 데이터 부족 경고
  if (bookmarks.length < 30) {
    patterns.unshift({
      id: 'data-insufficient',
      type: 'warning',
      title: '데이터 부족',
      description: dataQualityResult.message,
      confidence: 100,
      importance: 'high',
      actionable: true,
    });
  }

  // 예측 생성
  const predictions = generatePredictions(bookmarks, stats);

  // 추천사항 생성
  const bestTimes: string[] = [];
  const avoidTimes: string[] = [];

  stats.hourlyDistribution.forEach((h) => {
    const timeStr = `${String(h.hour).padStart(2, '0')}:00-${String(
      (h.hour + 1) % 24,
    ).padStart(2, '0')}:00`;
    if (h.avgScore >= 70 && h.count >= 3) {
      bestTimes.push(timeStr);
    } else if (h.avgScore <= 40 && h.count >= 3) {
      avoidTimes.push(timeStr);
    }
  });

  const preferredContexts = stats.contextStats
    .filter((c) => c.successRate >= 60)
    .map((c) => c.context);

  const favoriteDirections = stats.directionStats
    .filter((d) => d.avgScore >= stats.averageScore)
    .map((d) => d.direction);

  return {
    patterns,
    predictions,
    summary: {
      overallTrend: trend,
      trendConfidence: bookmarks.length >= 30 ? 75 : 50,
      dataQuality: dataQualityResult.quality,
      dataPoints: bookmarks.length,
      analysisDate: new Date(),
    },
    recommendations: {
      bestTimes,
      avoidTimes,
      preferredContexts,
      favoriteDirections,
    },
  };
}

/**
 * 패턴 중요도별 정렬
 */
export function sortPatternsByImportance(patterns: QimenPattern[]): QimenPattern[] {
  const importanceOrder = { high: 3, medium: 2, low: 1 };
  return [...patterns].sort((a, b) => {
    const importanceDiff = importanceOrder[b.importance] - importanceOrder[a.importance];
    if (importanceDiff !== 0) return importanceDiff;
    return b.confidence - a.confidence;
  });
}

/**
 * 실행 가능한 패턴만 필터링
 */
export function filterActionablePatterns(patterns: QimenPattern[]): QimenPattern[] {
  return patterns.filter((p) => p.actionable);
}

/**
 * 패턴 타입별 필터링
 */
export function filterPatternsByType(
  patterns: QimenPattern[],
  type: QimenPattern['type'],
): QimenPattern[] {
  return patterns.filter((p) => p.type === type);
}
