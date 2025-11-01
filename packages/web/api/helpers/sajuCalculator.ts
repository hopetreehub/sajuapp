/**
 * API용 사주 계산 헬퍼 함수
 *
 * @description
 * 프로덕션 환경(Vercel API)에서 사주 데이터를 자동 계산하기 위한 헬퍼 함수
 * calculateSajuData()를 사용하여 완전한 사주 데이터를 생성하고,
 * 데이터베이스에 저장 가능한 형식으로 변환합니다.
 *
 * @author Claude Code
 * @version 1.0.0
 */

// calculateSajuData는 프론트엔드 유틸리티이므로 직접 복사하거나 공통 패키지로 이동해야 합니다.
// 현재는 간단한 구현을 제공합니다.

interface BirthInfo {
  birth_date: string; // YYYY-MM-DD
  birth_time: string; // HH:MM:SS or HH:MM
  lunar_solar: 'lunar' | 'solar';
  gender: 'male' | 'female';
}

interface SajuData {
  year: { gan: string; ji: string };
  month: { gan: string; ji: string };
  day: { gan: string; ji: string };
  time: { gan: string; ji: string };
  ohHaengBalance: {
    목: number;
    화: number;
    토: number;
    금: number;
    수: number;
  };
  sipSungBalance: {
    비겁: number;
    식상: number;
    재성: number;
    관성: number;
    인성: number;
  };
  fullSaju: string;
  _isMinimal: boolean;
}

/**
 * 생년월일/시간 정보로부터 완전한 사주 데이터 생성
 */
export async function calculateCompleteSajuData(birthInfo: BirthInfo): Promise<SajuData | null> {
  try {
    console.log('🔮 [API] 완전한 사주 데이터 자동 생성 시작');

    // calculateSajuData는 클라이언트 사이드 함수이므로,
    // API에서는 다른 방법을 사용해야 합니다.

    // 옵션 1: 프론트엔드 calculateSajuData를 공통 패키지로 이동
    // 옵션 2: API에서 동일한 계산 로직 재구현
    // 옵션 3: 클라이언트에서 미리 계산하여 전달 (현재 구현)

    // 현재는 옵션 3을 사용 - 클라이언트가 이미 계산된 saju_data를 전달합니다
    // 따라서 이 함수는 검증 목적으로만 사용됩니다

    console.warn('⚠️ [API] API 서버에서의 사주 계산은 현재 지원되지 않습니다.');
    console.warn('⚠️ [API] 클라이언트에서 계산된 saju_data를 전달해주세요.');

    return null;
  } catch (error) {
    console.error('❌ [API] 사주 데이터 생성 실패:', error);
    return null;
  }
}

/**
 * 사주 데이터 검증
 */
export function validateSajuData(sajuData: any): boolean {
  if (!sajuData) return false;

  // 필수 필드 검증
  const requiredFields = ['year', 'month', 'day', 'time', 'ohHaengBalance', 'sipSungBalance', 'fullSaju'];
  for (const field of requiredFields) {
    if (!sajuData[field]) {
      console.error(`❌ [검증] 필수 필드 누락: ${field}`);
      return false;
    }
  }

  // _isMinimal 플래그 검증
  if (sajuData._isMinimal !== false) {
    console.warn('⚠️ [검증] _isMinimal 플래그가 false가 아닙니다');
    return false;
  }

  return true;
}
