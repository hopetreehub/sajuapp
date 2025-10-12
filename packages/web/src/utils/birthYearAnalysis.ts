/**
 * 생년 기반 오행 분석 유틸리티
 *
 * 귀문둔갑 맞춤 해석을 위한 생년 천간/오행 계산
 * @author Claude Code
 * @version 1.0.0
 */

// 천간 (Heavenly Stems)
const HEAVENLY_STEMS = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];

// 천간별 오행 매핑
const STEM_TO_ELEMENT: Record<string, string> = {
  '갑': '목', '을': '목',  // 甲乙 - Wood
  '병': '화', '정': '화',  // 丙丁 - Fire
  '무': '토', '기': '토',  // 戊己 - Earth
  '경': '금', '신': '금',  // 庚辛 - Metal
  '임': '수', '계': '수',  // 壬癸 - Water
};

// 오행별 특성
export interface ElementCharacteristics {
  element: string;           // 오행 이름 (목/화/토/금/수)
  englishName: string;       // 영문 이름
  favorableDirection: string; // 길한 방위
  favorableSeason: string;   // 길한 계절
  color: string;             // 대표 색상
  personality: string;       // 성격 특성
  advice: string;            // 조언
  icon: string;              // 이모지
}

const ELEMENT_CHARACTERISTICS: Record<string, ElementCharacteristics> = {
  '목': {
    element: '목',
    englishName: 'Wood',
    favorableDirection: '동쪽',
    favorableSeason: '봄',
    color: '청록색',
    personality: '성장과 확장을 추구하는 성향',
    advice: '새로운 시작과 성장에 유리합니다. 동쪽 방향에서 활동하면 좋습니다.',
    icon: '🌱',
  },
  '화': {
    element: '화',
    englishName: 'Fire',
    favorableDirection: '남쪽',
    favorableSeason: '여름',
    color: '붉은색',
    personality: '열정적이고 활동적인 성향',
    advice: '열정을 쏟는 일에 유리합니다. 남쪽 방향에서 활동하면 좋습니다.',
    icon: '🔥',
  },
  '토': {
    element: '토',
    englishName: 'Earth',
    favorableDirection: '중앙',
    favorableSeason: '환절기',
    color: '황색',
    personality: '안정과 신뢰를 중시하는 성향',
    advice: '안정적인 관계와 기반을 다지는데 유리합니다. 중앙에서 균형을 잡으세요.',
    icon: '⛰️',
  },
  '금': {
    element: '금',
    englishName: 'Metal',
    favorableDirection: '서쪽',
    favorableSeason: '가을',
    color: '흰색',
    personality: '결단력과 정의감이 강한 성향',
    advice: '결단이 필요한 일에 유리합니다. 서쪽 방향에서 활동하면 좋습니다.',
    icon: '⚔️',
  },
  '수': {
    element: '수',
    englishName: 'Water',
    favorableDirection: '북쪽',
    favorableSeason: '겨울',
    color: '검은색',
    personality: '지혜롭고 유연한 성향',
    advice: '지혜와 전략이 필요한 일에 유리합니다. 북쪽 방향에서 활동하면 좋습니다.',
    icon: '💧',
  },
};

/**
 * 생년을 기준으로 천간 계산
 * @param year 생년 (예: 1990)
 * @returns 천간 (예: '경')
 */
export function getHeavenlyStem(year: number): string {
  // 천간은 10년 주기로 반복
  // 기준: 1984년 = 갑자년 (갑)
  const baseYear = 1984;
  const offset = (year - baseYear) % 10;
  const stemIndex = (offset + 10) % 10; // 음수 처리
  return HEAVENLY_STEMS[stemIndex];
}

/**
 * 천간을 기준으로 오행 계산
 * @param stem 천간 (예: '경')
 * @returns 오행 (예: '금')
 */
export function getElement(stem: string): string {
  return STEM_TO_ELEMENT[stem] || '목';
}

/**
 * 생년을 기준으로 오행 계산
 * @param year 생년 (예: 1990)
 * @returns 오행 (예: '금')
 */
export function getElementFromYear(year: number): string {
  const stem = getHeavenlyStem(year);
  return getElement(stem);
}

/**
 * 오행 특성 조회
 * @param element 오행 (예: '금')
 * @returns 오행 특성 객체
 */
export function getElementCharacteristics(element: string): ElementCharacteristics {
  return ELEMENT_CHARACTERISTICS[element] || ELEMENT_CHARACTERISTICS['목'];
}

/**
 * 생년 기반 개인화 분석
 * @param year 생년
 * @returns 천간, 오행, 특성을 포함한 분석 결과
 */
export interface BirthYearAnalysis {
  year: number;
  stem: string;
  element: string;
  characteristics: ElementCharacteristics;
}

export function analyzeBirthYear(year: number): BirthYearAnalysis {
  const stem = getHeavenlyStem(year);
  const element = getElement(stem);
  const characteristics = getElementCharacteristics(element);

  return {
    year,
    stem,
    element,
    characteristics,
  };
}

/**
 * 생년월일 문자열로부터 분석
 * @param birthDate YYYY-MM-DD 형식 문자열
 * @returns 생년 분석 결과 또는 null
 */
export function analyzeBirthDate(birthDate?: string): BirthYearAnalysis | null {
  if (!birthDate) return null;

  try {
    const year = parseInt(birthDate.split('-')[0]);
    if (isNaN(year) || year < 1900 || year > 2100) {
      return null;
    }
    return analyzeBirthYear(year);
  } catch (error) {
    console.error('생년월일 파싱 실패:', error);
    return null;
  }
}
