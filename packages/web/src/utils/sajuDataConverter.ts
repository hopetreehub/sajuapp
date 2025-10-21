/**
 * 사주 데이터 변환 유틸리티
 * Backend(accurateSajuCalculator)와 Frontend(sajuCalculator) 간 데이터 변환
 */

import {
  StandardSajuData,
  StandardSajuPillar,
  BackendSajuData,
  FrontendSajuData,
  SajuConversionResult,
  SajuValidationResult,
} from '@/types/standardSaju';

/**
 * Backend 사주 데이터를 표준 형식으로 변환
 */
export function convertBackendToStandard(backendSaju: BackendSajuData): SajuConversionResult {
  const warnings: string[] = [];

  try {
    const standardSaju: StandardSajuData = {
      year: {
        gan: backendSaju.year.gan,
        ji: backendSaju.year.ji,
        combined: backendSaju.year.gan + backendSaju.year.ji,
      },
      month: {
        gan: backendSaju.month.gan,
        ji: backendSaju.month.ji,
        combined: backendSaju.month.gan + backendSaju.month.ji,
      },
      day: {
        gan: backendSaju.day.gan,
        ji: backendSaju.day.ji,
        combined: backendSaju.day.gan + backendSaju.day.ji,
      },
      time: {
        gan: backendSaju.time.gan,
        ji: backendSaju.time.ji,
        combined: backendSaju.time.gan + backendSaju.time.ji,
      },
    };

    // 데이터 유효성 검사
    if (!isValidSajuPillar(standardSaju.year)) warnings.push('년주 데이터 불완전');
    if (!isValidSajuPillar(standardSaju.month)) warnings.push('월주 데이터 불완전');
    if (!isValidSajuPillar(standardSaju.day)) warnings.push('일주 데이터 불완전');
    if (!isValidSajuPillar(standardSaju.time)) warnings.push('시주 데이터 불완전');

    return {
      standardSaju,
      isValid: warnings.length === 0,
      source: 'backend',
      warnings,
    };
  } catch (error) {
    console.error('Backend 사주 변환 실패:', error);
    throw new Error(`Backend 사주 데이터 변환 실패: ${error}`);
  }
}

/**
 * Frontend 사주 데이터를 표준 형식으로 변환
 */
export function convertFrontendToStandard(frontendSaju: FrontendSajuData): SajuConversionResult {
  const warnings: string[] = [];

  try {
    const standardSaju: StandardSajuData = {
      year: {
        gan: frontendSaju.year.heavenly,
        ji: frontendSaju.year.earthly,
        combined: frontendSaju.year.combined,
      },
      month: {
        gan: frontendSaju.month.heavenly,
        ji: frontendSaju.month.earthly,
        combined: frontendSaju.month.combined,
      },
      day: {
        gan: frontendSaju.day.heavenly,
        ji: frontendSaju.day.earthly,
        combined: frontendSaju.day.combined,
      },
      time: {
        gan: frontendSaju.hour.heavenly,
        ji: frontendSaju.hour.earthly,
        combined: frontendSaju.hour.combined,
      },
    };

    // 조합 일치성 검사
    if (standardSaju.year.combined !== standardSaju.year.gan + standardSaju.year.ji) {
      warnings.push('년주 조합 불일치');
    }
    if (standardSaju.month.combined !== standardSaju.month.gan + standardSaju.month.ji) {
      warnings.push('월주 조합 불일치');
    }
    if (standardSaju.day.combined !== standardSaju.day.gan + standardSaju.day.ji) {
      warnings.push('일주 조합 불일치');
    }
    if (standardSaju.time.combined !== standardSaju.time.gan + standardSaju.time.ji) {
      warnings.push('시주 조합 불일치');
    }

    return {
      standardSaju,
      isValid: warnings.length === 0,
      source: 'frontend',
      warnings,
    };
  } catch (error) {
    console.error('Frontend 사주 변환 실패:', error);
    throw new Error(`Frontend 사주 데이터 변환 실패: ${error}`);
  }
}

/**
 * 두 표준 사주 데이터의 일치성 검증
 */
export function validateSajuConsistency(
  saju1: StandardSajuData,
  saju2: StandardSajuData,
): SajuValidationResult {
  const differences = {
    year: saju1.year.combined !== saju2.year.combined,
    month: saju1.month.combined !== saju2.month.combined,
    day: saju1.day.combined !== saju2.day.combined,
    time: saju1.time.combined !== saju2.time.combined,
  };

  const totalPillars = 4;
  const matchingPillars = Object.values(differences).filter(diff => !diff).length;
  const confidence = Math.round((matchingPillars / totalPillars) * 100);

  let recommendation: 'use_backend' | 'use_frontend' | 'recalculate';
  if (confidence >= 75) {
    recommendation = 'use_backend'; // 대부분 일치하면 백엔드 데이터 우선
  } else if (confidence >= 50) {
    recommendation = 'use_frontend'; // 절반 일치하면 프론트엔드 재계산 우선
  } else {
    recommendation = 'recalculate'; // 대부분 불일치하면 완전 재계산
  }

  return {
    isMatch: confidence === 100,
    differences,
    confidence,
    recommendation,
  };
}

/**
 * 사주 데이터 자동 해결
 * 우선순위: Backend > Frontend > Recalculate
 */
export function resolveSajuData(
  backendSaju: any,
  frontendSaju: any,
): {
  finalSaju: StandardSajuData;
  resolution: string;
  confidence: number;
} {

  let backendStandard: StandardSajuData | null = null;
  let frontendStandard: StandardSajuData | null = null;

  // Backend 데이터 변환 시도
  if (backendSaju) {
    try {
      const backendResult = convertBackendToStandard(backendSaju);
      if (backendResult.isValid) {
        backendStandard = backendResult.standardSaju;

      } else {

      }
    } catch (error) {
      console.error('❌ Backend 사주 변환 실패:', error);
    }
  }

  // Frontend 데이터 변환 시도
  if (frontendSaju) {
    try {
      const frontendResult = convertFrontendToStandard(frontendSaju);
      if (frontendResult.isValid) {
        frontendStandard = frontendResult.standardSaju;

      } else {

      }
    } catch (error) {
      console.error('❌ Frontend 사주 변환 실패:', error);
    }
  }

  // 두 데이터 모두 있는 경우 일치성 검증
  if (backendStandard && frontendStandard) {
    const validation = validateSajuConsistency(backendStandard, frontendStandard);


    if (validation.isMatch) {

      return {
        finalSaju: backendStandard,
        resolution: '사주 완전 일치 - Backend 데이터 사용',
        confidence: 100,
      };
    } else {
      switch (validation.recommendation) {
        case 'use_backend':

          return {
            finalSaju: backendStandard,
            resolution: `Backend 우선 사용 (일치도: ${validation.confidence}%)`,
            confidence: validation.confidence,
          };
        case 'use_frontend':

          return {
            finalSaju: frontendStandard,
            resolution: `Frontend 재계산 사용 (일치도: ${validation.confidence}%)`,
            confidence: validation.confidence,
          };
        default:

          return {
            finalSaju: backendStandard,
            resolution: `심각한 불일치로 Backend 강제 사용 (일치도: ${validation.confidence}%)`,
            confidence: validation.confidence,
          };
      }
    }
  }

  // Backend만 있는 경우
  if (backendStandard) {

    return {
      finalSaju: backendStandard,
      resolution: 'Backend 데이터만 사용',
      confidence: 80,
    };
  }

  // Frontend만 있는 경우
  if (frontendStandard) {

    return {
      finalSaju: frontendStandard,
      resolution: 'Frontend 재계산 데이터만 사용',
      confidence: 60,
    };
  }

  // 둘 다 없는 경우 에러
  throw new Error('사주 데이터가 없거나 모두 유효하지 않음');
}

/**
 * 사주 기둥 유효성 검사
 */
function isValidSajuPillar(pillar: StandardSajuPillar): boolean {
  const validGan = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
  const validJi = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];

  return (
    validGan.includes(pillar.gan) &&
    validJi.includes(pillar.ji) &&
    pillar.combined === pillar.gan + pillar.ji
  );
}

/**
 * 표준 사주 데이터를 UniversalSajuEngine 형식으로 변환
 */
export function convertToUniversalSajuFormat(standardSaju: StandardSajuData) {
  return {
    year: { gan: standardSaju.year.gan, ji: standardSaju.year.ji },
    month: { gan: standardSaju.month.gan, ji: standardSaju.month.ji },
    day: { gan: standardSaju.day.gan, ji: standardSaju.day.ji },
    time: { gan: standardSaju.time.gan, ji: standardSaju.time.ji },
  };
}

/**
 * 디버깅용 사주 데이터 출력
 */
export function debugSajuData(_saju: StandardSajuData, _label: string) {

}