// 주문차트 PDF 기반 정확한 7개 대항목 타입 정의

export interface SajuRadarItem {
  id: string
  name: string
  baseScore: number
  timeFrameScores?: {
    today?: number
    month?: number
    year?: number
  }
}

export interface SajuSubcategory {
  id: string
  name: string
  items: SajuRadarItem[]
}

export interface SajuRadarCategory {
  id: 'jubon' | 'juun' | 'noe' | 'jugeon' | 'juyeon' | 'jujae' | 'jueop' // 정확한 7개만
  name: string
  icon: string
  description: string
  subcategories: SajuSubcategory[]
}

export interface SajuRadarData {
  categoryId: string
  subcategoryId: string
  title: string
  items: SajuRadarItem[]
  chartData: number[]
  maxValue: number
}

export type TimeFrame = 'base' | 'today' | 'month' | 'year'

export interface TimeFrameWeights {
  [key: string]: number
}

// 주본 중항목 타입
export interface JubonSubcategories {
  geunbonbon: SajuRadarItem[]      // 근본본 (6개)
  seonghyang: SajuRadarItem[]      // 성향 (7개)
  yokjeong: SajuRadarItem[]        // 욕정 (16개)
  jugak: SajuRadarItem[]           // 주격 (10개)
}

// 주운 타입 (22개 운세 항목)
export interface JuunItems {
  jeonche: SajuRadarItem[]         // 전체 22개 운세
}

// 뇌 타입 (17개 뇌 부위)
export interface NoeItems {
  jeonche: SajuRadarItem[]         // 전체 17개 뇌 부위
}

// 주건 중항목 타입
export interface JugeonSubcategories {
  biman: SajuRadarItem[]           // 비만 (12개)
  simri: SajuRadarItem[]           // 심리 (12개)
  inchegye: SajuRadarItem[]        // 인체계 (12개)
  jeongryeok: SajuRadarItem[]      // 정력 (8개)
  jilhwan: SajuRadarItem[]         // 질환 (27개)
}

// 주연 중항목 타입
export interface JuyeonSubcategories {
  oega: SajuRadarItem[]            // 외가 (10개)
  iseong: SajuRadarItem[]          // 이성 (6개)
  inyeon: SajuRadarItem[]          // 인연 (12개)
  seonbae: SajuRadarItem[]         // 선배 (7개)
  chinga: SajuRadarItem[]          // 친가 (12개)
  chingu: SajuRadarItem[]          // 친구 (7개)
  hubae: SajuRadarItem[]           // 후배 (7개)
}

// 주재 중항목 타입
export interface JujaeSubcategories {
  nonri: SajuRadarItem[]           // 논리 (24개)
  yesul: SajuRadarItem[]           // 예술 (24개)
  hakseup: SajuRadarItem[]         // 학습 (24개)
  neungryeok: SajuRadarItem[]      // 능력 (38개)
  seonghyang: SajuRadarItem[]      // 성향 (7개)
  tuja: SajuRadarItem[]            // 투자 (2개)
}

// 주업 중항목 타입
export interface JueopSubcategories {
  eommu: SajuRadarItem[]           // 업무 (19개)
  eopjong: SajuRadarItem[]         // 업종 (9개)
  jigeop: SajuRadarItem[]          // 직업 (많은 직업들...)
}