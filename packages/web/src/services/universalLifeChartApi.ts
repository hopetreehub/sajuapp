// Universal Life Chart API Service
// 범용 인생차트 API 호출 및 데이터 처리 서비스

import {
  UniversalLifeChartData,
  PersonalInfo,
  SajuComponents,
  LifeChartRequest,
  // LifeChartResponse,
  ExportOptions,
} from '@/types/universalLifeChart';

import { UniversalSajuEngine } from '@/utils/universalSajuEngine';
import { getCustomerById } from '@/services/customerApi';

/**
 * 고객 ID로부터 인생차트 생성
 */
export const generateUniversalLifeChart = async (
  customerId: number,
  _options: Partial<LifeChartRequest> = {},
): Promise<UniversalLifeChartData> => {
  try {

    // 1. 고객 정보 조회
    const response = await getCustomerById(customerId);

    if (!response.success || !response.data) {
      throw new Error('고객 정보를 찾을 수 없습니다');
    }
    const customer = response.data;

    // 2. 사주 데이터 파싱
    let sajuData: SajuComponents;
    try {
      // saju_data가 문자열인지 객체인지 체크
      const parsedSaju = typeof customer.saju_data === 'string'
        ? JSON.parse(customer.saju_data)
        : customer.saju_data;

      sajuData = {
        year: { gan: parsedSaju.year.gan, ji: parsedSaju.year.ji },
        month: { gan: parsedSaju.month.gan, ji: parsedSaju.month.ji },
        day: { gan: parsedSaju.day.gan, ji: parsedSaju.day.ji },
        time: { gan: parsedSaju.time.gan, ji: parsedSaju.time.ji },
      };
    } catch (error) {
      console.error('사주 데이터 파싱 오류:', error, customer.saju_data);
      throw new Error('사주 데이터 파싱에 실패했습니다');
    }

    // 3. 개인 정보 구성
    const parsedSajuForText = typeof customer.saju_data === 'string'
      ? JSON.parse(customer.saju_data)
      : customer.saju_data;

    const personalInfo: PersonalInfo = {
      name: customer.name,
      birthDate: customer.birth_date,
      birthTime: customer.birth_time,
      sajuText: parsedSajuForText.fullSaju || `${sajuData.year.gan}${sajuData.year.ji} ${sajuData.month.gan}${sajuData.month.ji} ${sajuData.day.gan}${sajuData.day.ji} ${sajuData.time.gan}${sajuData.time.ji}`,
      gender: customer.gender as 'male' | 'female',
      lunarSolar: customer.lunar_solar as 'lunar' | 'solar',
    };

    // 4. 범용 인생차트 생성
    const chartData = UniversalSajuEngine.generateUniversalLifeChart(
      sajuData,
      personalInfo,
    );

    return chartData;

  } catch (error) {
    console.error('❌ 인생차트 생성 실패:', error);
    throw error;
  }
};

/**
 * 박준수님 테스트 데이터로 인생차트 생성
 */
export const generateTestLifeChart = (): UniversalLifeChartData => {
  // 박준수님 테스트 사주 데이터
  const testSajuData: SajuComponents = {
    year: { gan: '신', ji: '해' },
    month: { gan: '기', ji: '해' },
    day: { gan: '병', ji: '오' },
    time: { gan: '경', ji: '인' },
  };

  const testPersonalInfo: PersonalInfo = {
    name: '박준수',
    birthDate: '1971-11-17',
    birthTime: '04:00',
    sajuText: '신해 기해 병오 경인',
    gender: 'male',
    lunarSolar: 'solar',
  };

  return UniversalSajuEngine.generateUniversalLifeChart(
    testSajuData,
    testPersonalInfo,
  );
};

/**
 * 정버제니님 테스트 데이터로 인생차트 생성
 */
export const generateTestLifeChart2 = (): UniversalLifeChartData => {
  // 정버제니님 테스트 사주 데이터 (추정)
  const testSajuData: SajuComponents = {
    year: { gan: '병', ji: '진' },
    month: { gan: '정', ji: '유' },
    day: { gan: '신', ji: '미' },
    time: { gan: '계', ji: '사' },
  };

  const testPersonalInfo: PersonalInfo = {
    name: '정버제니',
    birthDate: '1976-09-16',
    birthTime: '09:40',
    sajuText: '병진 정유 신미 계사',
    gender: 'female',
    lunarSolar: 'solar',
  };

  return UniversalSajuEngine.generateUniversalLifeChart(
    testSajuData,
    testPersonalInfo,
  );
};

/**
 * 인생차트 데이터를 다양한 형식으로 내보내기
 */
export const exportLifeChart = async (
  chartData: UniversalLifeChartData,
  options: ExportOptions,
): Promise<Blob> => {
  const { format, quality = 'medium', includeAnalysis = true, watermark = true } = options;

  try {
    switch (format) {
      case 'json':
        return exportAsJSON(chartData, includeAnalysis);

      case 'pdf':
        return exportAsPDF(chartData, quality, includeAnalysis, watermark);

      case 'png':
        return exportAsPNG(chartData, quality, watermark);

      case 'svg':
        return exportAsSVG(chartData, watermark);

      default:
        throw new Error(`지원하지 않는 내보내기 형식: ${format}`);
    }
  } catch (error) {
    console.error('❌ 차트 내보내기 실패:', error);
    throw error;
  }
};

/**
 * JSON 형식으로 내보내기
 */
function exportAsJSON(chartData: UniversalLifeChartData, includeAnalysis: boolean): Blob {
  const exportData = { ...chartData };

  if (!includeAnalysis) {
    // 분석 데이터 제외
    delete (exportData as any).lifePeriods;
    delete (exportData as any).metadata;
  }

  const jsonString = JSON.stringify(exportData, null, 2);
  return new Blob([jsonString], { type: 'application/json' });
}

/**
 * PDF 형식으로 내보내기 (향후 구현)
 */
function exportAsPDF(
  _chartData: UniversalLifeChartData,
  _quality: string,
  _includeAnalysis: boolean,
  _watermark: boolean,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    // PDF 생성 로직 구현 필요 (jsPDF + html2canvas 등 활용)
    reject(new Error('PDF 내보내기는 아직 구현되지 않았습니다'));
  });
}

/**
 * PNG 형식으로 내보내기 (향후 구현)
 */
function exportAsPNG(
  _chartData: UniversalLifeChartData,
  _quality: string,
  _watermark: boolean,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    // PNG 생성 로직 구현 필요 (html2canvas 등 활용)
    reject(new Error('PNG 내보내기는 아직 구현되지 않았습니다'));
  });
}

/**
 * SVG 형식으로 내보내기 (향후 구현)
 */
function exportAsSVG(
  _chartData: UniversalLifeChartData,
  _watermark: boolean,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    // SVG 생성 로직 구현 필요
    reject(new Error('SVG 내보내기는 아직 구현되지 않았습니다'));
  });
}

/**
 * 차트 데이터 유효성 검증
 */
export const validateChartData = (chartData: UniversalLifeChartData): boolean => {
  try {
    // 필수 필드 확인
    if (!chartData.personalInfo || !chartData.timeline || !chartData.chartData) {
      return false;
    }

    // 개인 정보 유효성 확인
    const { personalInfo } = chartData;
    if (!personalInfo.name || !personalInfo.birthDate || !personalInfo.sajuText) {
      return false;
    }

    // 타임라인 유효성 확인
    const { timeline } = chartData;
    if (timeline.startYear <= 0 || timeline.endYear <= timeline.startYear) {
      return false;
    }

    // 차트 데이터 유효성 확인
    const { chartData: data } = chartData;
    const requiredDimensions = ['geunbon', 'woon', 'haeng', 'hyeong', 'byeon'];

    for (const dimension of requiredDimensions) {
      if (!data[dimension as keyof typeof data] || data[dimension as keyof typeof data].length !== 96) {
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('차트 데이터 검증 오류:', error);
    return false;
  }
};

/**
 * 차트 데이터 요약 정보 생성
 */
export const generateChartSummary = (chartData: UniversalLifeChartData) => {
  const { personalInfo, timeline, chartData: data } = chartData;

  // 각 차원별 평균값 계산
  const dimensionAverages = Object.entries(data).reduce((acc, [key, points]) => {
    const average = points.reduce((sum, point) => sum + point.value, 0) / points.length;
    acc[key] = Number(average.toFixed(2));
    return acc;
  }, {} as Record<string, number>);

  // 현재 나이 기준 현재 상태
  const currentStatus = Object.entries(data).reduce((acc, [key, points]) => {
    const currentPoint = points[timeline.currentAge] || points[points.length - 1];
    acc[key] = Number(currentPoint.value.toFixed(2));
    return acc;
  }, {} as Record<string, number>);

  // 최고/최저 시기 찾기
  const extremes = Object.entries(data).reduce((acc, [key, points]) => {
    const maxPoint = points.reduce((max, point) => point.value > max.value ? point : max);
    const minPoint = points.reduce((min, point) => point.value < min.value ? point : min);

    acc[key] = {
      max: { age: maxPoint.age, value: Number(maxPoint.value.toFixed(2)) },
      min: { age: minPoint.age, value: Number(minPoint.value.toFixed(2)) },
    };
    return acc;
  }, {} as Record<string, any>);

  return {
    personalInfo,
    timeline,
    dimensionAverages,
    currentStatus,
    extremes,
    generatedAt: new Date().toISOString(),
  };
};

/**
 * 차트 데이터 캐싱 관리
 */
const chartCache = new Map<string, { data: UniversalLifeChartData; timestamp: number }>();
const CACHE_DURATION = 10 * 60 * 1000; // 10분

export const getCachedChart = (customerId: number): UniversalLifeChartData | null => {
  const cacheKey = `chart_${customerId}`;
  const cached = chartCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  return null;
};

export const setCachedChart = (customerId: number, data: UniversalLifeChartData): void => {
  const cacheKey = `chart_${customerId}`;
  chartCache.set(cacheKey, { data, timestamp: Date.now() });
};

export const clearChartCache = (customerId?: number): void => {
  if (customerId) {
    chartCache.delete(`chart_${customerId}`);
  } else {
    chartCache.clear();
  }
};