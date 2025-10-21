/**
 * Universal Saju Engine v7.0 - 실제 사주 이론 기반 개인별 고유 패턴
 * 사주 8자 기반 정확한 점수 계산으로 개인별 고유 차트 생성
 */

import {
  UniversalLifeChartData,
  SajuComponents,
  PersonalInfo,
  ChartDimensions,
  LifePeriodInfo,
  ChartMetadata,
  LifePhase,
  TrendType,
} from '@/types/universalLifeChart';
import { calculateLifeChartScore } from './sajuScoreCalculator';

// 디버깅용 로그 플래그
const _DEBUG_MODE = true; // 임시로 true로 설정하여 디버깅

// 오행 상생상극 관계
const _WUXING_RELATIONS = {
  상생: {
    목: '화', 화: '토', 토: '금', 금: '수', 수: '목',
  },
  상극: {
    목: '토', 토: '수', 수: '화', 화: '금', 금: '목',
  },
};

// 천간 오행
const CHEONGAN_WUXING: Record<string, string> = {
  갑: '목', 을: '목', 병: '화', 정: '화', 무: '토',
  기: '토', 경: '금', 신: '금', 임: '수', 계: '수',
};

// 지지 오행
const JIJI_WUXING: Record<string, string> = {
  자: '수', 축: '토', 인: '목', 묘: '목', 진: '토', 사: '화',
  오: '화', 미: '토', 신: '금', 유: '금', 술: '토', 해: '수',
};

export class UniversalSajuEngine {

  /**
   * 메인 차트 생성 함수
   */
  public static generateUniversalLifeChart(
    sajuData: SajuComponents,
    personalInfo: PersonalInfo,
  ): UniversalLifeChartData {
    const birthYear = new Date(personalInfo.birthDate).getFullYear();
    const currentYear = new Date().getFullYear();
    const currentAge = currentYear - birthYear + 1;

    // DEBUG_MODE 로깅은 필요시 활성화
    // if (DEBUG_MODE) {
    //   console.log('personalInfo:', personalInfo);
    // }

    // 실제 사주 기반 점수 계산 사용
    const scoreResult = calculateLifeChartScore(sajuData, birthYear);

    // DEBUG_MODE 로깅은 필요시 활성화
    // if (DEBUG_MODE) {
    //   console.log('scoreResult:', scoreResult);
    // }

    // 5차원 차트 데이터 생성 (실제 점수 기반)
    const chartData = this.generateChartFromScores(scoreResult.yearlyScores, birthYear, sajuData);

    // 인생 주기 분석
    const lifePeriods = this.analyzeLifePeriods(chartData, birthYear);

    const metadata: ChartMetadata = {
      calculationDate: new Date().toISOString(),
      version: '7.0.0',
      accuracy: Math.round(100 - scoreResult.pattern.volatility * 20),
    };

    return {
      personalInfo,
      timeline: {
        startYear: birthYear,
        endYear: birthYear + 95,
        currentYear,
        currentAge,
        lifeProgress: Math.round((currentAge / 95) * 100),
      },
      chartData,
      lifePeriods,
      metadata,
    };
  }

  /**
   * 점수 배열로부터 5차원 차트 생성
   */
  private static generateChartFromScores(
    yearlyScores: number[],
    birthYear: number,
    sajuData: SajuComponents,
  ): ChartDimensions {
    const dimensions: ChartDimensions = {
      geunbon: [],  // 근본 - 회색 종합운
      woon: [],     // 운
      haeng: [],    // 행
      hyeong: [],   // 형
      byeon: [],     // 변
    };

    // 개인별 차원 변화 계수 계산
    const dimensionFactors = this.calculateDimensionFactors(sajuData);

    // 96년간 데이터 생성
    for (let age = 0; age <= 95; age++) {
      const year = birthYear + age;
      const baseValue = yearlyScores[age] || 50;

      // 근본(종합운) - 실제 계산된 점수
      dimensions.geunbon.push({
        age,
        value: baseValue,
        year,
        intensity: Math.abs(baseValue - 50) / 50,
      });

      // 운 - 변동성 추가
      const woonValue = Math.max(0, Math.min(100,
        baseValue + Math.sin(age * dimensionFactors.woon) * 8));
      dimensions.woon.push({
        age,
        value: woonValue,
        year,
        intensity: Math.abs(woonValue - 50) / 50,
      });

      // 행 - 실행력 변화
      const haengValue = Math.max(0, Math.min(100,
        baseValue + Math.sin(age * dimensionFactors.haeng) * 10));
      dimensions.haeng.push({
        age,
        value: haengValue,
        year,
        intensity: Math.abs(haengValue - 50) / 50,
      });

      // 형 - 권위/지위 변화
      const hyeongValue = Math.max(0, Math.min(100,
        baseValue + Math.cos(age * dimensionFactors.hyeong) * 7));
      dimensions.hyeong.push({
        age,
        value: hyeongValue,
        year,
        intensity: Math.abs(hyeongValue - 50) / 50,
      });

      // 변 - 변화/전환
      const byeonValue = Math.max(0, Math.min(100,
        baseValue + Math.sin(age * dimensionFactors.byeon) * 12));
      dimensions.byeon.push({
        age,
        value: byeonValue,
        year,
        intensity: Math.abs(byeonValue - 50) / 50,
      });
    }

    return dimensions;
  }

  /**
   * 오행 균형도 계산
   */
  private static calculateWuxingBalance(sajuData: SajuComponents): number {
    const wuxingCount: Record<string, number> = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };

    // 천간 오행 카운트
    wuxingCount[CHEONGAN_WUXING[sajuData.year.gan]]++;
    wuxingCount[CHEONGAN_WUXING[sajuData.month.gan]]++;
    wuxingCount[CHEONGAN_WUXING[sajuData.day.gan]]++;
    wuxingCount[CHEONGAN_WUXING[sajuData.time.gan]]++;

    // 지지 오행 카운트
    wuxingCount[JIJI_WUXING[sajuData.year.ji]]++;
    wuxingCount[JIJI_WUXING[sajuData.month.ji]]++;
    wuxingCount[JIJI_WUXING[sajuData.day.ji]]++;
    wuxingCount[JIJI_WUXING[sajuData.time.ji]]++;

    const wuxingValues = Object.values(wuxingCount);
    const maxCount = Math.max(...wuxingValues);
    const minCount = Math.min(...wuxingValues);

    return 100 - (maxCount - minCount) * 15;
  }

  /**
   * 차원별 변화 계수 계산
   */
  private static calculateDimensionFactors(sajuData: SajuComponents): any {
    // 사주 기반 고유 계수 생성
    const uniqueHash = this.getSajuHash(sajuData);

    return {
      woon: 0.15 + (uniqueHash % 10) * 0.01,
      haeng: 0.2 + (uniqueHash % 7) * 0.01,
      hyeong: 0.08 + (uniqueHash % 5) * 0.01,
      byeon: 0.3 + (uniqueHash % 8) * 0.01,
    };
  }

  /**
   * 사주 해시값 계산
   */
  private static getSajuHash(sajuData: SajuComponents): number {
    const ganMap: Record<string, number> = {
      갑: 1, 을: 2, 병: 3, 정: 4, 무: 5,
      기: 6, 경: 7, 신: 8, 임: 9, 계: 10,
    };
    const jiMap: Record<string, number> = {
      자: 1, 축: 2, 인: 3, 묘: 4, 진: 5, 사: 6,
      오: 7, 미: 8, 신: 9, 유: 10, 술: 11, 해: 12,
    };

    return (
      ganMap[sajuData.year.gan] * 1000 +
      jiMap[sajuData.year.ji] * 100 +
      ganMap[sajuData.month.gan] * 50 +
      jiMap[sajuData.month.ji] * 25 +
      ganMap[sajuData.day.gan] * 10 +
      jiMap[sajuData.day.ji] * 5 +
      ganMap[sajuData.time.gan] * 2 +
      jiMap[sajuData.time.ji]
    );
  }

  /**
   * DEPRECATED: 하드코딩된 차트 생성 (더 이상 사용 안 함)
   */
  private static generatePreciseChart_DEPRECATED(
    _patternType: any,
    _birthYear: number,
    _sajuData: SajuComponents,
  ): ChartDimensions {
    // DEPRECATED - 더 이상 사용하지 않음
    const deprecatedDimensions: ChartDimensions = {
      geunbon: [], woon: [], haeng: [], hyeong: [], byeon: [],
    };

    // 96년간 더미 데이터
    for (let age = 0; age <= 95; age++) {
      const baseValue = 50;

      // 근본(종합운) - 회색 그래프
      const geunbonValue = Math.max(0, Math.min(100, baseValue));
      deprecatedDimensions.geunbon.push({
        age,
        value: geunbonValue,
        year: 2000 + age, // 더미 년도
        intensity: Math.abs(geunbonValue - 50) / 50,
      });

      // 운 - 근본과 유사하되 약간의 변화
      const woonValue = Math.max(0, Math.min(100, baseValue + Math.sin(age * 0.15) * 8));
      deprecatedDimensions.woon.push({
        age,
        value: woonValue,
        year: 2000 + age,
        intensity: Math.abs(woonValue - 50) / 50,
      });

      // 행 - 좀 더 역동적
      const haengValue = Math.max(0, Math.min(100, baseValue + Math.sin(age * 0.2) * 10));
      deprecatedDimensions.haeng.push({
        age,
        value: haengValue,
        year: 2000 + age,
        intensity: Math.abs(haengValue - 50) / 50,
      });

      // 형 - 안정적
      const hyeongValue = Math.max(0, Math.min(100, baseValue + Math.sin(age * 0.08) * 5));
      deprecatedDimensions.hyeong.push({
        age,
        value: hyeongValue,
        year: 2000 + age,
        intensity: Math.abs(hyeongValue - 50) / 50,
      });

      // 변 - 변동성
      const byeonValue = Math.max(0, Math.min(100, baseValue + Math.cos(age * 0.3) * 12));
      deprecatedDimensions.byeon.push({
        age,
        value: byeonValue,
        year: 2000 + age,
        intensity: Math.abs(byeonValue - 50) / 50,
      });
    }

    return deprecatedDimensions;
  }


  /**
   * 인생 주기 분석
   */
  private static analyzeLifePeriods(
    chartData: ChartDimensions,
    _birthYear: number,
  ): LifePeriodInfo[] {
    const periods: LifePeriodInfo[] = [];
    const phases: Array<{ phase: LifePhase; start: number; end: number; desc: string }> = [
      { phase: 'childhood', start: 0, end: 12, desc: '성장과 기초 형성기' },
      { phase: 'youth', start: 13, end: 22, desc: '학습과 탐색기' },
      { phase: 'early_adult', start: 23, end: 35, desc: '도전과 성취기' },
      { phase: 'middle_adult', start: 36, end: 50, desc: '안정과 발전기' },
      { phase: 'late_adult', start: 51, end: 65, desc: '성숙과 지혜기' },
      { phase: 'senior', start: 66, end: 80, desc: '여유와 전수기' },
      { phase: 'elder', start: 81, end: 95, desc: '완성과 회고기' },
    ];

    phases.forEach(({ phase, start, end, desc }) => {
      const periodData = chartData.geunbon.slice(start, Math.min(end + 1, chartData.geunbon.length));
      if (periodData.length === 0) return;

      const avgScore = periodData.reduce((sum, p) => sum + p.value, 0) / periodData.length;
      const keyYears = periodData
        .filter(p => Math.abs(p.value - 50) > 20)
        .map(p => p.age)
        .slice(0, 3);

      let trend: TrendType = 'stable';
      const firstHalf = periodData.slice(0, Math.floor(periodData.length / 2));
      const secondHalf = periodData.slice(Math.floor(periodData.length / 2));
      const firstAvg = firstHalf.reduce((sum, p) => sum + p.value, 0) / firstHalf.length || 0;
      const secondAvg = secondHalf.reduce((sum, p) => sum + p.value, 0) / secondHalf.length || 0;

      if (secondAvg - firstAvg > 5) trend = 'ascending';
      else if (firstAvg - secondAvg > 5) trend = 'descending';
      else if (Math.abs(avgScore - 50) > 15) trend = 'turbulent';

      periods.push({
        startAge: start,
        endAge: end,
        phase,
        description: desc,
        majorEvents: this.getMajorEvents(phase),
        overallTrend: trend,
        keyYears,
      });
    });

    return periods;
  }

  /**
   * 주요 사건 생성
   */
  private static getMajorEvents(phase: LifePhase): string[] {
    const events: Record<LifePhase, string[]> = {
      childhood: ['성장기 특성 형성', '기초 교육 시작', '가족관계 형성'],
      youth: ['학업 집중기', '진로 탐색', '자아 정체성 확립'],
      early_adult: ['사회 진출', '경력 시작', '인간관계 확대'],
      middle_adult: ['경력 안정기', '가정 형성', '사회적 성취'],
      late_adult: ['전문성 정점', '후진 양성', '인생 성찰'],
      senior: ['은퇴 준비', '건강 관리', '지혜 전수'],
      elder: ['여생 정리', '유산 전달', '회고와 성찰'],
    };
    return events[phase] || [];
  }
}