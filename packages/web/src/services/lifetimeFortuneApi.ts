/**
 * 100년 인생운세 API 서비스
 */

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

// 임시 모의 데이터 생성 함수
function generateMockLifetimeFortune(request: LifetimeFortuneRequest): LifetimeFortuneResponse {
  const currentYear = new Date().getFullYear();
  const birthYear = request.year;
  const lifetimeFortune: YearlyFortune[] = [];

  // 0세부터 100세까지의 운세 데이터 생성
  for (let age = 0; age <= 100; age++) {
    const year = birthYear + age;

    // 간단한 사인파 패턴으로 운세 변화 시뮬레이션
    const baseScore = 50 + 30 * Math.sin((age / 12) * Math.PI);

    lifetimeFortune.push({
      year,
      age,
      totalScore: Math.round(baseScore),
      fortune: Math.round(baseScore + Math.random() * 20 - 10),
      willpower: Math.round(baseScore + Math.random() * 20 - 10),
      environment: Math.round(baseScore + Math.random() * 20 - 10),
      change: Math.round(baseScore + Math.random() * 20 - 10),
      대운: {
        천간: ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'][Math.floor(age / 10) % 10],
        지지: ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'][Math.floor(age / 10) % 12],
        오행: ['목', '화', '토', '금', '수'][Math.floor(age / 10) % 5],
        score: Math.round(baseScore),
      },
      세운: {
        천간: ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'][year % 10],
        지지: ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'][year % 12],
        오행: ['목', '화', '토', '금', '수'][year % 5],
        score: Math.round(50 + Math.random() * 50),
      },
      description: `${age}세 운세`,
    });
  }

  return {
    success: true,
    data: {
      lifetimeFortune,
      summary: {
        bestYears: [25, 35, 45, 55, 65],
        worstYears: [20, 30, 40, 50, 60],
        currentYearRank: 50,
      },
    },
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