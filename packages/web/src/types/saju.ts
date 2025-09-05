// 사주 데이터 타입 정의
export interface SajuBirthInfo {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  isLunar: boolean;
  name?: string;
  gender?: 'male' | 'female';
}

export interface FourPillars {
  year: { heavenly: string; earthly: string };
  month: { heavenly: string; earthly: string };
  day: { heavenly: string; earthly: string };
  hour: { heavenly: string; earthly: string };
}

export interface SixAreaScores {
  foundation: number;    // 근본
  thinking: number;      // 사고
  relationship: number;  // 인연
  action: number;        // 행동
  luck: number;          // 행운
  environment: number;   // 환경
}

export interface FiveElements {
  wood: number;   // 목
  fire: number;   // 화
  earth: number;  // 토
  metal: number;  // 금
  water: number;  // 수
}

export interface TenGods {
  bijeon: number;      // 비견
  geopjae: number;     // 겁재
  siksin: number;      // 식신
  sanggwan: number;    // 상관
  jeongjae: number;    // 정재
  pyeonjae: number;    // 편재
  jeonggwan: number;   // 정관
  pyeongwan: number;   // 편관
  jeongin: number;     // 정인
  pyeongin: number;    // 편인
}

export interface SeventeenFortuneScores {
  health: number;        // 건강운
  marriage: number;      // 결혼운
  power: number;         // 권력운
  fame: number;          // 명예운
  accident: number;      // 사고운
  business: number;      // 사업운
  movement: number;      // 이동운
  separation: number;    // 이별운
  relationship: number;  // 인연운
  children: number;      // 자식운
  talent: number;        // 재능운
  wealth: number;        // 재물운
  ancestor: number;      // 조상운
  career: number;        // 직업운
  family: number;        // 집안운
  study: number;         // 학업운
  fortune: number;       // 행운운
}

export interface PersonalityTraits {
  emotion: number;      // 감성 (0-100)
  logic: number;        // 논리성 (0-100)
  artistic: number;     // 예술성 (0-100)
  rational: number;     // 이성 (0-100)
  character: number;    // 인성 (0-100)
  intelligence: number; // 지성 (0-100)
  learning: number;     // 학습성 (0-100)
}

export interface SajuAnalysisResult {
  birthInfo: SajuBirthInfo;
  fourPillars: FourPillars;
  sixAreas: SixAreaScores;
  fiveElements: FiveElements;
  tenGods: TenGods;
  totalScore: number;
  averageScore: number;
}

// SajuData 타입 추가 (기존 코드와의 호환성을 위해)
export interface SajuData extends SajuAnalysisResult {
  dayMaster: string; // 일간 (일주의 천간)
  personalityTraits?: PersonalityTraits;
  seventeenFortunes?: SeventeenFortuneScores;
}

// 오늘의 운세를 위한 타입 정의
export interface DailyFortune {
  date: string; // YYYY-MM-DD 형식
  totalLuck: number; // 총운 (0-100)
  loveLuck: number; // 연애운 (0-100)
  wealthLuck: number; // 재물운 (0-100)
  healthLuck: number; // 건강운 (0-100)
  careerLuck: number; // 직업운 (0-100)
  message: string; // 오늘의 메시지
  luckyColor?: string; // 행운의 색상
  luckyNumber?: number; // 행운의 숫자
  advice?: string; // 조언
}

export interface FortuneLevel {
  level: 'excellent' | 'good' | 'normal' | 'caution' | 'bad';
  label: string;
  color: string;
  icon: string;
}