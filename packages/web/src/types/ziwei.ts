/**
 * 자미두수(紫微斗數) 타입 정의
 *
 * 자미두수는 중국 송나라 시대부터 전해지는 운명 분석 시스템으로
 * 14주성(主星)과 12궁위(宮位)를 기반으로 정밀한 운세를 분석합니다.
 */

// 12지지 (12궁위 배치 기준)
export type EarthlyBranch = '子' | '丑' | '寅' | '卯' | '辰' | '巳' | '午' | '未' | '申' | '酉' | '戌' | '亥';

// 12궁위 (12사항궁)
export type Palace =
  | '命宮'     // 명궁 (인생 전체, 성격)
  | '兄弟宮'   // 형제궁 (형제자매, 친구)
  | '夫妻宮'   // 부부궁 (배우자, 결혼)
  | '子女宮'   // 자녀궁 (자녀, 성생활)
  | '財帛宮'   // 재물궁 (금전, 재산)
  | '疾厄宮'   // 질액궁 (건강, 질병)
  | '遷移宮'   // 천이궁 (이동, 외출)
  | '奴僕宮'   // 노복궁 (부하, 친구)
  | '官祿宮'   // 관록궁 (직업, 명예)
  | '田宅宮'   // 전택궁 (부동산, 집)
  | '福德宮'   // 복덕궁 (정신, 취미)
  | '父母宮';  // 부모궁 (부모, 상사)

// 14주성 (주요 별자리)
export type MainStar =
  // 자미성계 (紫微星系) 6성 - 황제의 별
  | '紫微'  // 자미 - 제왕성, 리더십
  | '天機'  // 천기 - 지혜, 계획
  | '太陽'  // 태양 - 명예, 권력
  | '武曲'  // 무곡 - 재물, 용기
  | '天同'  // 천동 - 복덕, 평화
  | '廉貞'  // 염정 - 변화, 정열
  // 천부성계 (天府星系) 8성 - 재상의 별
  | '天府'  // 천부 - 재물, 안정
  | '太陰'  // 태음 - 모성, 재능
  | '貪狼'  // 탐랑 - 욕망, 인기
  | '巨門'  // 거문 - 언변, 분쟁
  | '天相'  // 천상 - 보좌, 조화
  | '天梁'  // 천량 - 수명, 해결
  | '七殺'  // 칠살 - 권력, 고독
  | '破軍';  // 파군 - 파괴, 혁신

// 보조성 (100+ 별자리)
export type AuxiliaryStar =
  // ========== 육길성 (六吉星) ==========
  // 문창문곡 (文昌文曲) - 문예, 학문
  | '文昌' | '文曲'
  // 좌보우필 (左輔右弼) - 보좌, 도움
  | '左輔' | '右弼'
  // 천괴천월 (天魁天鉞) - 귀인, 도움
  | '天魁' | '天鉞'
  // 녹존 (祿存) - 재물
  | '祿存'

  // ========== 육흉성 (六凶星) ==========
  | '擎羊'  // 형벌
  | '陀羅'  // 지연
  | '火星'  // 급성
  | '鈴星'  // 폭발
  | '地劫'  // 공허
  | '地空'  // 손실

  // ========== 사화성 (四化星) ==========
  | '化祿'  // 재물운
  | '化權'  // 권력운
  | '化科'  // 명예운
  | '化忌'  // 불운

  // ========== 일반 보조성 ==========
  | '天馬'  // 변동, 이동
  | '紅鸞'  // 결혼, 연애
  | '天喜'  // 기쁨, 경사
  | '天空'  // 공상, 비현실
  | '天刑'  // 형벌, 소송
  | '天姚'  // 이성운, 매력
  | '天哭'  // 슬픔, 눈물
  | '天虛'  // 허약, 건강
  | '龍池'  // 예술, 문예
  | '鳳閣'  // 명예, 지위

  // ========== 연지성 (年支星) ==========
  | '天官'  // 관록, 지위
  | '天福'  // 복덕, 행복
  | '天廚'  // 음식, 의식주
  | '天才'  // 재능, 총명
  | '天壽'  // 수명, 장수

  // ========== 월지성 (月支星) ==========
  | '天月'  // 질병, 건강
  | '陰煞'  // 음험, 암해

  // ========== 시지성 (時支星) ==========
  | '天貴'  // 귀인, 명예
  | '天傷'  // 상처, 다침

  // ========== 기타 중요 보조성 ==========
  | '台輔'  // 보좌, 도움
  | '封誥'  // 명예, 인정
  | '恩光'  // 은덕, 빛
  | '天巫'  // 종교, 신비
  | '天德'  // 덕행, 도덕
  | '月德'  // 덕행, 평화
  | '解神'  // 해결, 화해
  | '天官符' // 관재, 소송
  | '天福星' // 복록, 행운
  | '天壽星' // 장수, 건강
  | '孤辰'  // 고독, 독립
  | '寡宿'  // 고독, 외로움
  | '蜚廉'  // 분주, 바쁨
  | '破碎'  // 파괴, 손상
  | '華蓋'  // 예술, 고독
  | '咸池'  // 이성, 유흥
  | '天才星' // 재능, 총명
  | '天壽星' // 장수, 건강;

// 납음오행 국수 (局數)
export type ElementBureau = '水二局' | '木三局' | '金四局' | '土五局' | '火六局';

// 궁위 길흉 상태
export enum PalaceStrength {
  PROSPEROUS = '旺',  // 왕성 - 매우 강함
  FAVORABLE = '利',   // 유리 - 강함
  FLAT = '平',        // 평범 - 보통
  WEAK = '陷',        // 함 - 약함
  UNFAVORABLE = '凶', // 흉 - 매우 약함
}

// 궁위 정보
export interface PalaceInfo {
  name: Palace;                    // 궁위 이름
  branch: EarthlyBranch;           // 지지 위치
  mainStars: MainStar[];           // 주성 목록
  auxiliaryStars: AuxiliaryStar[]; // 보조성 목록
  strength: PalaceStrength;        // 길흉 상태
  luckyScore: number;              // 길흉 점수 (0-100)
  description: string;             // 해석
  keywords: string[];              // 키워드
}

// 대운 정보 (10년 단위)
export interface MajorFortune {
  startAge: number;    // 시작 나이
  endAge: number;      // 종료 나이
  palace: Palace;      // 대운궁
  branch: EarthlyBranch; // 지지
  direction: 'forward' | 'backward'; // 순행/역행
  description: string; // 해석
  luckyScore: number;  // 길흉 점수
  keywords: string[];  // 키워드
}

// 유년운 정보 (1년 단위)
export interface YearlyFortune {
  year: number;        // 연도
  age: number;         // 나이
  palace: Palace;      // 유년궁
  branch: EarthlyBranch; // 지지
  description: string; // 해석
  luckyScore: number;  // 길흉 점수
  keywords: string[];  // 키워드
}

// 자미두수 명반 (전체 차트)
export interface ZiweiChart {
  // 생년월일시 정보
  birthInfo: {
    year: number;       // 생년 (양력)
    month: number;      // 생월
    day: number;        // 생일
    hour: number;       // 생시 (0-23)
    minute?: number;    // 생분 (선택)
    lunar: boolean;     // 음력 여부
    gender?: 'male' | 'female'; // 성별 (대운 순역행 결정)
  };

  // 납음오행 국수
  bureau: ElementBureau;

  // 12궁위 배치 (명반의 핵심)
  palaces: Record<Palace, PalaceInfo>;

  // 명궁 위치 (가장 중요)
  lifePalaceBranch: EarthlyBranch;

  // 신궁 위치 (행동력)
  bodyPalaceBranch: EarthlyBranch;

  // 대운 (10년 단위 운세)
  majorFortunes: MajorFortune[];

  // 유년운 (현재 년도 운세)
  yearlyFortune: YearlyFortune;

  // 종합 운세
  overallFortune: {
    score: number;  // 종합 점수 (0-100)
    level: 'excellent' | 'good' | 'neutral' | 'bad' | 'terrible';
    summary: string;           // 요약
    strengths: string[];       // 강점
    weaknesses: string[];      // 약점
    advice: string[];          // 조언
    luckyElements: string[];   // 행운 요소
    unluckyElements: string[]; // 불운 요소
  };

  // 주요 특성
  characteristics: {
    personality: string[];  // 성격 특성
    career: string[];       // 직업 적성
    wealth: string[];       // 재물운
    health: string[];       // 건강
    relationships: string[]; // 인간관계
  };
}

// 자미두수 해석 컨텍스트
export type ZiweiContext =
  | 'general'        // 종합 운세
  | 'career'         // 직업/사업
  | 'wealth'         // 재물/투자
  | 'health'         // 건강/질병
  | 'relationship'   // 인간관계
  | 'marriage'       // 결혼/배우자
  | 'family'         // 가족/자녀
  | 'study';         // 학업/시험

// AI 분석 요청
export interface ZiweiAIRequest {
  chart: ZiweiChart;
  context: ZiweiContext;
  question: string;
  customerName?: string;
}

// 60갑자 (干支)
export interface GanZhi {
  gan: string;  // 천간 (10개)
  zhi: EarthlyBranch; // 지지 (12개)
  nayin: string; // 납음오행
}

// 별자리 정보 (상세)
export interface StarInfo {
  name: MainStar | AuxiliaryStar;
  type: 'main' | 'auxiliary' | 'transformation'; // 주성/보조성/사화성
  nature: 'auspicious' | 'neutral' | 'inauspicious'; // 길성/중성/흉성
  element: '木' | '火' | '土' | '金' | '水' | '中'; // 오행
  description: string; // 설명
  effects: {
    positive: string[];  // 긍정적 영향
    negative: string[];  // 부정적 영향
  };
}
