/**
 * 표준 사주 데이터 인터페이스
 * Backend(accurateSajuCalculator)와 Frontend(sajuCalculator) 간 통일된 형식
 */

export interface StandardSajuPillar {
  gan: string;        // 천간 (갑, 을, 병, 정, ...)
  ji: string;         // 지지 (자, 축, 인, 묘, ...)
  combined: string;   // 간지 조합 (갑자, 을축, ...)
}

export interface StandardSajuData {
  year: StandardSajuPillar;   // 년주
  month: StandardSajuPillar;  // 월주
  day: StandardSajuPillar;    // 일주
  time: StandardSajuPillar;   // 시주
}

/**
 * Backend 사주 데이터 형식 (accurateSajuCalculator.ts)
 */
export interface BackendSajuData {
  year: { gan: string; ji: string };
  month: { gan: string; ji: string };
  day: { gan: string; ji: string };
  time: { gan: string; ji: string };
}

/**
 * Frontend 사주 데이터 형식 (sajuCalculator.ts)
 */
export interface FrontendSajuData {
  year: { heavenly: string; earthly: string; combined: string };
  month: { heavenly: string; earthly: string; combined: string };
  day: { heavenly: string; earthly: string; combined: string };
  hour: { heavenly: string; earthly: string; combined: string };
}

/**
 * 사주 데이터 변환 결과
 */
export interface SajuConversionResult {
  standardSaju: StandardSajuData;
  isValid: boolean;
  source: 'backend' | 'frontend' | 'calculated';
  warnings: string[];
}

/**
 * 사주 검증 결과
 */
export interface SajuValidationResult {
  isMatch: boolean;
  differences: {
    year?: boolean;
    month?: boolean;
    day?: boolean;
    time?: boolean;
  };
  confidence: number; // 0-100 일치 신뢰도
  recommendation: 'use_backend' | 'use_frontend' | 'recalculate';
}