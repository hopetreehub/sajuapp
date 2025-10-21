/**
 * 사주 분석 API 서비스
 * 백엔드 사주 분석 서비스와 연동
 */

import { SajuRadarCategory, SajuSubcategory } from '@/types/sajuRadar';

// API URL 설정 - Vercel 풀스택
const SAJU_ANALYSIS_API_BASE = import.meta.env.DEV
  ? '/api/saju'  // 로컬 개발 환경 (Vite 프록시 사용)
  : '/api/saju';  // 프로덕션 환경 (Vercel 풀스택)

// 디버깅용 로그 (removed for production)

export interface ApiCategoryResponse {
  success: boolean;
  message: string;
  data: {
    positive: {
      [key: string]: {
        icon: string;
        items: Array<{
          name: string;
          weight: number;
          confidence: number;
        }>;
      };
    };
    negative: {
      [key: string]: {
        icon: string;
        items: Array<{
          name: string;
          weight: number;
          confidence: number;
        }>;
      };
    };
  };
}

// 새로운 종합 점수 API 응답 인터페이스
export interface ComprehensiveScoreResponse {
  success: boolean;
  message: string;
  data: {
    positive_scores: {
      [category_name: string]: {
        category_name: string;
        category_type: 'positive';
        base_score: number;
        daily_score: number;
        monthly_score: number;
        yearly_score: number;
        items: Array<{
          name: string;
          score: number;
          confidence: number;
        }>;
      };
    };
    negative_scores: {
      [category_name: string]: {
        category_name: string;
        category_type: 'negative';
        base_score: number;
        daily_score: number;
        monthly_score: number;
        yearly_score: number;
        items: Array<{
          name: string;
          score: number;
          confidence: number;
        }>;
      };
    };
    summary: {
      overall_fortune: number;
      trend: string;
      recommendations: string[];
    };
  };
}

// 사주 정보 인터페이스
export interface SajuBirthInfo {
  user_id: string;
  birth_date: string; // YYYY-MM-DD
  birth_time: string; // HH:MM
  is_lunar: boolean;
}

/**
 * 백엔드에서 사주 카테고리 데이터 가져오기 (기존 API)
 */
export async function fetchSajuCategories(): Promise<ApiCategoryResponse> {
  try {

    const response = await fetch(`${SAJU_ANALYSIS_API_BASE}/categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiCategoryResponse = await response.json();

    return data;
  } catch (error) {
    console.error('❌ 사주 카테고리 데이터 가져오기 실패:', error);
    throw error;
  }
}

/**
 * 종합 점수 API - 시점별 주능/주흉 분석 (기본/오늘/이달/올해)
 */
export async function fetchComprehensiveScores(birthInfo: SajuBirthInfo): Promise<ComprehensiveScoreResponse> {
  try {

    const response = await fetch(`${SAJU_ANALYSIS_API_BASE}/scores/comprehensive`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(birthInfo),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ComprehensiveScoreResponse = await response.json();

    return data;
  } catch (error) {
    console.error('❌ 종합 점수 데이터 가져오기 실패:', error);
    throw error;
  }
}

/**
 * API 응답 데이터를 프론트엔드 구조로 변환 (기존 API용)
 */
export function transformApiDataToRadarCategories(apiData: ApiCategoryResponse['data']): SajuRadarCategory[] {
  const categories: SajuRadarCategory[] = [];

  // 주능 (positive) 카테고리 변환
  if (apiData.positive) {
    const positiveSubcategories: SajuSubcategory[] = Object.entries(apiData.positive).map(([categoryName, categoryData]) => ({
      id: categoryName.toLowerCase().replace(/\s+/g, '_'),
      name: categoryName,
      items: categoryData.items.map((item, index) => ({
        id: `${categoryName.toLowerCase()}_${index}`,
        name: item.name,
        baseScore: Math.round(item.weight * item.confidence),
      })),
    }));

    categories.push({
      id: 'juneung',
      name: '주능',
      icon: '⚡',
      description: '능력과 잠재력 분석',
      subcategories: positiveSubcategories,
    });
  }

  // 주흉 (negative) 카테고리 변환  
  if (apiData.negative) {
    const negativeSubcategories: SajuSubcategory[] = Object.entries(apiData.negative).map(([categoryName, categoryData]) => ({
      id: categoryName.toLowerCase().replace(/\s+/g, '_'),
      name: categoryName,
      items: categoryData.items.map((item, index) => ({
        id: `${categoryName.toLowerCase()}_${index}`,
        name: item.name,
        baseScore: Math.round((100 - item.weight) * item.confidence), // 주흉은 역산
      })),
    }));

    categories.push({
      id: 'juhyung',
      name: '주흉',
      icon: '⚠️',
      description: '위험과 주의사항 분석',
      subcategories: negativeSubcategories,
    });
  }

  return categories;
}

/**
 * 종합 점수 데이터를 프론트엔드 구조로 변환 (신규 API용)
 */
export function transformComprehensiveScoreToRadarCategories(
  scoreData: ComprehensiveScoreResponse['data'],
  timeframe: 'base' | 'daily' | 'monthly' | 'yearly' = 'base',
): SajuRadarCategory[] {
  const categories: SajuRadarCategory[] = [];

  // 주능 (positive) 카테고리 변환
  if (scoreData.positive_scores) {
    const positiveSubcategories: SajuSubcategory[] = Object.entries(scoreData.positive_scores).map(([categoryName, categoryData]) => ({
      id: categoryName.toLowerCase().replace(/\s+/g, '_'),
      name: categoryName,
      items: categoryData.items.map((item, index) => ({
        id: `${categoryName.toLowerCase()}_${index}`,
        name: item.name,
        baseScore: item.score, // 이미 계산된 점수 사용
        // 시점별 점수 추가
        dailyScore: timeframe === 'daily' ? item.score : undefined,
        monthlyScore: timeframe === 'monthly' ? item.score : undefined,
        yearlyScore: timeframe === 'yearly' ? item.score : undefined,
      })),
    }));

    categories.push({
      id: 'juneung',
      name: '주능',
      icon: '⚡',
      description: '능력과 잠재력 분석',
      subcategories: positiveSubcategories,
    });
  }

  // 주흉 (negative) 카테고리 변환  
  if (scoreData.negative_scores) {
    const negativeSubcategories: SajuSubcategory[] = Object.entries(scoreData.negative_scores).map(([categoryName, categoryData]) => ({
      id: categoryName.toLowerCase().replace(/\s+/g, '_'),
      name: categoryName,
      items: categoryData.items.map((item, index) => ({
        id: `${categoryName.toLowerCase()}_${index}`,
        name: item.name,
        baseScore: 100 - item.score, // 주흉은 역산
        // 시점별 점수 추가
        dailyScore: timeframe === 'daily' ? (100 - item.score) : undefined,
        monthlyScore: timeframe === 'monthly' ? (100 - item.score) : undefined,
        yearlyScore: timeframe === 'yearly' ? (100 - item.score) : undefined,
      })),
    }));

    categories.push({
      id: 'juhyung',
      name: '주흉',
      icon: '⚠️',
      description: '위험과 주의사항 분석',
      subcategories: negativeSubcategories,
    });
  }

  return categories;
}

/**
 * 카테고리 데이터 캐시
 */
let cachedCategories: SajuRadarCategory[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5분

/**
 * 캐시된 카테고리 데이터 가져오기 (캐시가 유효한 경우)
 */
export function getCachedCategories(): SajuRadarCategory[] | null {
  if (cachedCategories && (Date.now() - cacheTimestamp) < CACHE_DURATION) {

    return cachedCategories;
  }
  return null;
}

/**
 * 카테고리 데이터 캐시 저장
 */
export function setCachedCategories(categories: SajuRadarCategory[]): void {
  cachedCategories = categories;
  cacheTimestamp = Date.now();

}

/**
 * 사주 카테고리 데이터 가져오기 (캐시 우선, 없으면 API 호출) - 기존 방식
 */
export async function getSajuCategories(): Promise<SajuRadarCategory[]> {
  // 캐시 확인
  const cached = getCachedCategories();
  if (cached) {
    return cached;
  }

  // API 호출
  const apiResponse = await fetchSajuCategories();
  const transformedData = transformApiDataToRadarCategories(apiResponse.data);

  // 캐시 저장
  setCachedCategories(transformedData);

  return transformedData;
}

/**
 * 종합 점수 기반 사주 분석 (신규 API) - 시점별 분석 포함
 */
export async function getComprehensiveSajuAnalysis(
  birthInfo: SajuBirthInfo,
  timeframe: 'base' | 'daily' | 'monthly' | 'yearly' = 'base',
): Promise<{
  categories: SajuRadarCategory[],
  summary: ComprehensiveScoreResponse['data']['summary']
}> {
  try {
    // 종합 점수 API 호출
    const response = await fetchComprehensiveScores(birthInfo);
    
    // 데이터 변환
    const categories = transformComprehensiveScoreToRadarCategories(response.data, timeframe);
    
    return {
      categories,
      summary: response.data.summary,
    };
  } catch (error) {
    console.error('❌ 종합 사주 분석 실패:', error);
    throw error;
  }
}