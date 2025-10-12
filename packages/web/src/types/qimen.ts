/**
 * 귀문둔갑(奇門遁甲) 타입 정의
 *
 * 중국 고대 점술 시스템의 핵심 데이터 구조
 * @author Claude Code
 * @version 1.0.0
 */

// ============================================
// 기본 타입 정의
// ============================================

/** 구궁(九宮) - 1~9의 궁 번호 */
export type Palace = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

/** 팔문(八門) - 8개의 문 */
export type Gate =
  | '휴문'  // 休門 - 휴식, 평온
  | '생문'  // 生門 - 생성, 발전
  | '상문'  // 傷門 - 상처, 손상
  | '두문'  // 杜門 - 막힘, 폐쇄
  | '경문'  // 景門 - 경치, 명예
  | '사문'  // 死門 - 죽음, 종결
  | '놀문'  // 驚門 - 놀람, 변화 (경문과 구분하기 위해 놀문으로 변경)
  | '개문'; // 開門 - 개방, 시작

/** 구성(九星) - 9개의 별 */
export type Star =
  | '천봉'  // 天蓬 - 수성, 지혜
  | '천임'  // 天任 - 토성, 신뢰
  | '천충'  // 天冲 - 목성, 충동
  | '천보'  // 天輔 - 목성, 보좌
  | '천영'  // 天英 - 화성, 명예
  | '천예'  // 天芮 - 토성, 질병
  | '천주'  // 天柱 - 금성, 권위
  | '천심'  // 天心 - 금성, 의술
  | '천금'; // 天禽 - 토성, 중심

/** 팔신(八神) - 8개의 신 */
export type Spirit =
  | '직부'  // 直符 - 권력의 신
  | '등사'  // 螣蛇 - 번뇌의 신
  | '태음'  // 太陰 - 음의 신
  | '육합'  // 六合 - 화합의 신
  | '백호'  // 白虎 - 흉의 신
  | '현무'  // 玄武 - 도적의 신
  | '구지'  // 九地 - 방어의 신
  | '구천'; // 九天 - 공격의 신

/** 방위 */
export type Direction =
  | '북'    // 坎 - 1궁
  | '서남'  // 坤 - 2궁
  | '동'    // 震 - 3궁
  | '동남'  // 巽 - 4궁
  | '중앙'  // 中 - 5궁
  | '서북'  // 乾 - 6궁
  | '서'    // 兌 - 7궁
  | '동북'  // 艮 - 8궁
  | '남';   // 離 - 9궁

/** 길흉 판단 */
export type Fortune =
  | 'excellent'  // 대길
  | 'good'       // 길
  | 'neutral'    // 평
  | 'bad'        // 흉
  | 'terrible';  // 대흉

/** 음둔/양둔 */
export type YinYang = 'yin' | 'yang';

/** 오행(五行) */
export type WuXing = '목' | '화' | '토' | '금' | '수';

// ============================================
// 복합 데이터 구조
// ============================================

/** 궁(宮) 정보 */
export interface PalaceInfo {
  /** 궁 번호 (1~9) */
  palace: Palace;

  /** 방위 */
  direction: Direction;

  /** 팔문 */
  gate: Gate;

  /** 구성 */
  star: Star;

  /** 팔신 (5궁 중앙은 신이 없을 수 있음) */
  spirit?: Spirit;

  /** 천간 (天干) */
  tianGan: string;

  /** 지지 (地支) */
  diZhi: string;

  /** 오행 속성 */
  wuXing: WuXing;

  /** 길흉 판단 */
  fortune: Fortune;

  /** 해석 텍스트 */
  interpretation: string;

  /** 추천 행동 */
  recommendations: string[];

  /** 주의사항 */
  warnings: string[];
}

/** 귀문둔갑 차트 (완전한 국) */
export interface QimenChart {
  /** 계산 일시 */
  dateTime: Date;

  /** 국 번호 (1~18: 양둔 1~9, 음둔 1~9) */
  ju: number;

  /** 음둔/양둔 */
  yinYang: YinYang;

  /** 절기 정보 */
  solarTerm: {
    name: string;      // 절기명
    index: number;     // 절기 인덱스 (1~24)
    isStart: boolean;  // 절기 시작일 여부
  };

  /** 시간 간지 */
  hourGanZhi: {
    gan: string;  // 시간 천간
    zhi: string;  // 시간 지지
  };

  /** 일간 (日干) */
  dayGan: string;

  /** 9개 궁의 정보 */
  palaces: {
    [key in Palace]: PalaceInfo;
  };

  /** 전체 길흉 요약 */
  overallFortune: {
    score: number;           // 0-100 점수
    level: Fortune;          // 길흉 등급
    summary: string;         // 요약
    bestPalaces: Palace[];   // 가장 좋은 궁들
    worstPalaces: Palace[];  // 가장 나쁜 궁들
  };
}

/** 귀문둔갑 계산 옵션 */
export interface QimenCalculationOptions {
  /** 계산 시점 (기본값: 현재 시각) */
  dateTime?: Date;

  /** 생년월일 (개인화된 해석용, 선택사항) */
  birthInfo?: {
    year: number;
    month: number;
    day: number;
    hour?: number;
  };

  /** 해석 컨텍스트 (용도에 따른 해석 조정) */
  context?: 'general' | 'business' | 'love' | 'travel' | 'health' | 'wealth' | 'lawsuit' | 'education';

  /** 상세 해석 포함 여부 */
  includeDetailedInterpretation?: boolean;
}

// ============================================
// 참조 데이터 구조
// ============================================

/** 팔문 정보 */
export interface GateData {
  name: Gate;
  element: WuXing;
  nature: 'auspicious' | 'neutral' | 'inauspicious';
  meaning: string;
  effects: {
    positive: string[];
    negative: string[];
  };
}

/** 구성 정보 */
export interface StarData {
  name: Star;
  element: WuXing;
  planet: string;  // 대응하는 천체
  nature: 'auspicious' | 'neutral' | 'inauspicious';
  meaning: string;
  influences: string[];
}

/** 팔신 정보 */
export interface SpiritData {
  name: Spirit;
  nature: 'auspicious' | 'neutral' | 'inauspicious';
  meaning: string;
  characteristics: string[];
}

/** 절기 정보 */
export interface SolarTermData {
  index: number;        // 1~24
  name: string;         // 절기명
  month: number;        // 해당 월
  approxDay: number;    // 대략적인 날짜
  yinYang: YinYang;     // 음둔/양둔
  ju: number;           // 해당 국 번호
}

// ============================================
// 유틸리티 타입
// ============================================

/** 궁 배치 맵 (방위별 궁 번호) */
export type PalaceDirectionMap = {
  [key in Direction]: Palace;
};

/** 구궁 그리드 (3x3 배열로 시각화용) */
export type PalaceGrid = [
  [Palace, Palace, Palace],  // 상단 (동남, 남, 서남)
  [Palace, Palace, Palace],  // 중단 (동, 중앙, 서)
  [Palace, Palace, Palace],  // 하단 (동북, 북, 서북)
];

/** 길흉 점수 범위 */
export interface FortuneScoreRange {
  excellent: [number, number];  // 80-100
  good: [number, number];       // 60-79
  neutral: [number, number];    // 40-59
  bad: [number, number];        // 20-39
  terrible: [number, number];   // 0-19
}

// ============================================
// 이벤트 및 액션 타입
// ============================================

/** 귀문둔갑 관련 이벤트 */
export type QimenEvent =
  | { type: 'CALCULATE_CHART'; payload: QimenCalculationOptions }
  | { type: 'SELECT_PALACE'; payload: { palace: Palace } }
  | { type: 'CHANGE_TIME'; payload: { dateTime: Date } }
  | { type: 'REFRESH_CHART' };

// ============================================
// 에러 타입
// ============================================

/** 귀문둔갑 계산 에러 */
export class QimenCalculationError extends Error {
  constructor(
    message: string,
    public code: 'INVALID_DATE' | 'INVALID_SOLAR_TERM' | 'CALCULATION_FAILED',
    public details?: any,
  ) {
    super(message);
    this.name = 'QimenCalculationError';
  }
}
