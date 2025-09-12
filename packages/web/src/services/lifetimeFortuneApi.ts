/**
 * 100년 인생운세 API 서비스
 */

const API_BASE_URL = 'http://localhost:4015';

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
    
    const response = await fetch(`${API_BASE_URL}/api/saju/lifetime-fortune`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || '100년 인생운세 계산 실패');
    }

    console.log('✅ 100년 인생운세 데이터 수신 완료');
    return data;

  } catch (error) {
    console.error('❌ 100년 인생운세 API 오류:', error);
    throw error;
  }
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