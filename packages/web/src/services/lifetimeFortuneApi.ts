/**
 * 100년 인생운세 API 서비스
 */

import { UniversalSajuEngine } from '@/utils/universalSajuEngine';
import { SajuComponents, PersonalInfo } from '@/types/universalLifeChart';
import { SajuCalculator } from '@/utils/sajuCalculator';
import { SajuBirthInfo } from '@/types/saju';

// 임시로 프론트엔드 프록시를 사용하지 않고 직접 호출
// 실제 서비스가 구현되면 프록시를 통해 호출하도록 변경 필요
const API_BASE_URL = '';

export interface YearlyFortune {
  year: number
  age: number
  totalScore: number
  fortune: number      // 행운 (재물, 명예, 성공운)
  willpower: number    // 의지 (노력, 추진력, 실행력)
  environment: number  // 환경 (대인관계, 외부 지원)
  change: number       // 변화 (변동성, 기회, 위기)
  대운: {
    천간: string
    지지: string
    오행: string
    score: number
  }
  세운: {
    천간: string
    지지: string
    오행: string
    score: number
  }
}

export interface LifetimeFortuneResponse {
  success: boolean
  data: {
    lifetimeFortune: YearlyFortune[]
    analysis: {
      keyYears: YearlyFortune[]
      bestYear: {
        year: number
        age: number
        score: number
      }
      worstYear: {
        year: number
        age: number
        score: number
      }
      averageScore: number
    }
  }
  timestamp: string
}

export interface LifetimeFortuneRequest {
  year: number
  month: number
  day: number
  hour: number
  isLunar?: boolean
  gender?: 'male' | 'female'
}

/**
 * 100년 인생운세 데이터 조회
 */
export async function fetchLifetimeFortune(request: LifetimeFortuneRequest): Promise<LifetimeFortuneResponse> {
  try {
    console.log('🎯 100년 인생운세 API 호출:', request);

    // 임시로 모의 데이터를 반환 (실제 API가 구현되면 교체)
    // 실제 API 엔드포인트가 없으므로 클라이언트 사이드에서 계산
    const mockData = generateMockLifetimeFortune(request);

    console.log('✅ 100년 인생운세 데이터 생성 완료 (임시)');
    return mockData;

  } catch (error) {
    console.error('❌ 100년 인생운세 API 오류:', error);
    throw error;
  }
}

// 새로운 엔진을 사용한 실제 패턴 기반 데이터 생성
function generateMockLifetimeFortune(request: LifetimeFortuneRequest): LifetimeFortuneResponse {
  console.log('🔮 실제 사주 계산 시작:', request);

  // 실제 생년월일시로부터 사주 계산
  const sajuResult = SajuCalculator.calculateFourPillars({
    year: request.year,
    month: request.month,
    day: request.day,
    hour: request.hour,
    minute: 0,
    isLunar: request.isLunar || false,
    isLeapMonth: false
  });

  console.log('📊 계산된 사주:', sajuResult);

  // UniversalSajuEngine에서 요구하는 형식으로 변환
  const sajuData: SajuComponents = {
    year: { gan: sajuResult.year.heavenly, ji: sajuResult.year.earthly },
    month: { gan: sajuResult.month.heavenly, ji: sajuResult.month.earthly },
    day: { gan: sajuResult.day.heavenly, ji: sajuResult.day.earthly },
    time: { gan: sajuResult.hour.heavenly, ji: sajuResult.hour.earthly },
  };

  // 개인 정보 구성
  const birthDate = `${request.year}-${String(request.month).padStart(2, '0')}-${String(request.day).padStart(2, '0')}`;
  const birthTime = `${String(request.hour).padStart(2, '0')}:00`;
  const sajuText = `${sajuResult.year.combined} ${sajuResult.month.combined} ${sajuResult.day.combined} ${sajuResult.hour.combined}`;

  const personalInfo: PersonalInfo = {
    name: '사용자',
    birthDate,
    birthTime,
    sajuText,
    gender: request.gender || 'male',
    lunarSolar: request.isLunar ? 'lunar' : 'solar',
  };

  console.log('👤 개인정보:', personalInfo);

  // 새로운 엔진으로 차트 생성
  const chartData = UniversalSajuEngine.generateUniversalLifeChart(sajuData, personalInfo);

  // UniversalLifeChartData를 LifetimeFortuneResponse로 변환
  const lifetimeFortune: YearlyFortune[] = [];

  for (let age = 0; age <= 95; age++) {
    const year = request.year + age;

    // 5차원 데이터에서 값 추출
    const 근본값 = chartData.chartData.geunbon[age]?.value || 50;
    const 운값 = chartData.chartData.woon[age]?.value || 50;
    const 행값 = chartData.chartData.haeng[age]?.value || 50;
    const 형값 = chartData.chartData.hyeong[age]?.value || 50;
    const 변값 = chartData.chartData.byeon[age]?.value || 50;

    // 총점은 5차원 평균
    const totalScore = Math.round((근본값 + 운값 + 행값 + 형값 + 변값) / 5);

    lifetimeFortune.push({
      year,
      age,
      totalScore,
      fortune: 운값,        // 운 차원
      willpower: 행값,      // 행 차원
      environment: 형값,    // 형 차원
      change: 변값,         // 변 차원
      대운: {
        천간: ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'][Math.floor(age / 10) % 10],
        지지: ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'][Math.floor(age / 10) % 12],
        오행: ['목', '화', '토', '금', '수'][Math.floor(age / 10) % 5],
        score: Math.round((운값 + 형값) / 2),
      },
      세운: {
        천간: ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'][year % 10],
        지지: ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'][year % 12],
        오행: ['목', '화', '토', '금', '수'][year % 5],
        score: Math.round(변값),
      },
    });
  }

  // 최고/최저 연도 계산
  const bestYear = lifetimeFortune.reduce((prev, curr) => prev.totalScore > curr.totalScore ? prev : curr);
  const worstYear = lifetimeFortune.reduce((prev, curr) => prev.totalScore < curr.totalScore ? prev : curr);
  const avgScore = lifetimeFortune.reduce((sum, item) => sum + item.totalScore, 0) / lifetimeFortune.length;

  return {
    success: true,
    data: {
      lifetimeFortune,
      analysis: {
        keyYears: lifetimeFortune.filter(item => Math.abs(item.totalScore - avgScore) > 20).slice(0, 5),
        bestYear: {
          year: bestYear.year,
          age: bestYear.age,
          score: bestYear.totalScore,
        },
        worstYear: {
          year: worstYear.year,
          age: worstYear.age,
          score: worstYear.totalScore,
        },
        averageScore: Math.round(avgScore),
      },
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * 사주 정보로부터 현재 나이 계산
 */
export function calculateCurrentAge(birthYear: number): number {
  const currentYear = new Date().getFullYear();
  return currentYear - birthYear + 1; // 한국식 나이
}

/**
 * 특정 나이대의 운세 요약
 */
export function getFortuneByAgeRange(
  lifetimeFortune: YearlyFortune[],
  startAge: number,
  endAge: number,
): {
  averageScore: number
  peakYear: YearlyFortune
  lowYear: YearlyFortune
} {
  const rangeData = lifetimeFortune.filter(
    year => year.age >= startAge && year.age <= endAge,
  );

  if (rangeData.length === 0) {
    throw new Error('해당 나이대 데이터가 없습니다');
  }

  const averageScore = rangeData.reduce((sum, year) => sum + year.totalScore, 0) / rangeData.length;
  const peakYear = rangeData.reduce((prev, curr) => prev.totalScore > curr.totalScore ? prev : curr);
  const lowYear = rangeData.reduce((prev, curr) => prev.totalScore < curr.totalScore ? prev : curr);

  return {
    averageScore: Math.round(averageScore * 10) / 10,
    peakYear,
    lowYear,
  };
}

/**
 * 운세 점수에 따른 등급 반환
 */
export function getFortuneGrade(score: number): {
  grade: string
  color: string
  description: string
} {
  if (score >= 85) {
    return {
      grade: '상상',
      color: 'text-green-600',
      description: '매우 좋은 운세',
    };
  } else if (score >= 70) {
    return {
      grade: '상',
      color: 'text-blue-600',
      description: '좋은 운세',
    };
  } else if (score >= 55) {
    return {
      grade: '중상',
      color: 'text-indigo-600',
      description: '보통 이상의 운세',
    };
  } else if (score >= 40) {
    return {
      grade: '중',
      color: 'text-yellow-600',
      description: '보통 운세',
    };
  } else if (score >= 25) {
    return {
      grade: '하',
      color: 'text-orange-600',
      description: '주의가 필요한 운세',
    };
  } else {
    return {
      grade: '하하',
      color: 'text-red-600',
      description: '어려운 운세',
    };
  }
}

/**
 * 대운 전환기 감지 (나이가 10의 배수인 해)
 */
export function getMajorTransitionYears(lifetimeFortune: YearlyFortune[]): YearlyFortune[] {
  return lifetimeFortune.filter(year => 
    year.age % 10 === 0 && year.age > 0 && year.age <= 90,
  );
}

/**
 * 4가지 기운의 균형도 분석
 */
export function analyzeFortuneBalance(yearData: YearlyFortune): {
  balance: number // 0-100, 높을수록 균형잡힘
  strongestAspect: string
  weakestAspect: string
  recommendation: string
} {
  const aspects = {
    '행운': yearData.fortune,
    '의지': yearData.willpower,
    '환경': yearData.environment,
    '변화': yearData.change,
  };

  const values = Object.values(aspects);
  const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / values.length;
  const balance = Math.max(0, 100 - Math.sqrt(variance));

  const strongestAspect = Object.entries(aspects).reduce((prev, curr) => 
    curr[1] > prev[1] ? curr : prev,
  )[0];

  const weakestAspect = Object.entries(aspects).reduce((prev, curr) => 
    curr[1] < prev[1] ? curr : prev,
  )[0];

  let recommendation = '';
  if (balance < 50) {
    recommendation = `${weakestAspect} 분야의 보완이 필요합니다. ${strongestAspect} 분야의 강점을 활용하세요.`;
  } else if (balance < 75) {
    recommendation = `전반적으로 균형이 잡혀있으나 ${weakestAspect} 분야에 조금 더 신경쓰시면 좋겠습니다.`;
  } else {
    recommendation = '매우 균형잡힌 운세입니다. 현재의 방향을 유지하시기 바랍니다.';
  }

  return {
    balance: Math.round(balance),
    strongestAspect,
    weakestAspect,
    recommendation,
  };
}