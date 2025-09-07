/**
 * 사주 분석 API 서비스
 * 백엔드 사주 분석 서비스와 연동
 */

import { SajuRadarCategory, SajuRadarSubcategory, SajuRadarItem } from '@/types/sajuRadar';

const SAJU_ANALYSIS_API_BASE = 'http://localhost:4015/api/saju';

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

/**
 * 백엔드에서 사주 카테고리 데이터 가져오기
 */
export async function fetchSajuCategories(): Promise<ApiCategoryResponse> {
  try {
    console.log('🔮 백엔드 사주 카테고리 데이터 요청...');
    
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
    console.log('✅ 사주 카테고리 데이터 수신 완료:', data);

    return data;
  } catch (error) {
    console.error('❌ 사주 카테고리 데이터 가져오기 실패:', error);
    throw error;
  }
}

/**
 * API 응답 데이터를 프론트엔드 구조로 변환
 */
export function transformApiDataToRadarCategories(apiData: ApiCategoryResponse['data']): SajuRadarCategory[] {
  const categories: SajuRadarCategory[] = [];

  // 주능 (positive) 카테고리 변환
  if (apiData.positive) {
    const positiveSubcategories: SajuRadarSubcategory[] = Object.entries(apiData.positive).map(([categoryName, categoryData]) => ({
      id: categoryName.toLowerCase().replace(/\s+/g, '_'),
      name: categoryName,
      items: categoryData.items.map((item, index) => ({
        id: `${categoryName.toLowerCase()}_${index}`,
        name: item.name,
        baseScore: Math.round(item.weight * item.confidence)
      }))
    }));

    categories.push({
      id: 'juneung',
      name: '주능',
      icon: '⚡',
      description: '능력과 잠재력 분석',
      subcategories: positiveSubcategories
    });
  }

  // 주흉 (negative) 카테고리 변환  
  if (apiData.negative) {
    const negativeSubcategories: SajuRadarSubcategory[] = Object.entries(apiData.negative).map(([categoryName, categoryData]) => ({
      id: categoryName.toLowerCase().replace(/\s+/g, '_'),
      name: categoryName,
      items: categoryData.items.map((item, index) => ({
        id: `${categoryName.toLowerCase()}_${index}`,
        name: item.name,
        baseScore: Math.round((100 - item.weight) * item.confidence) // 주흉은 역산
      }))
    }));

    categories.push({
      id: 'juhyung',
      name: '주흉',
      icon: '⚠️',
      description: '위험과 주의사항 분석',
      subcategories: negativeSubcategories
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
    console.log('💾 캐시된 사주 카테고리 데이터 사용');
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
  console.log('💾 사주 카테고리 데이터 캐시 저장');
}

/**
 * 사주 카테고리 데이터 가져오기 (캐시 우선, 없으면 API 호출)
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