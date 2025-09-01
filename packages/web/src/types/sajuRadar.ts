// 통합 사주 레이더차트 시스템 타입 정의

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
  id: string
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