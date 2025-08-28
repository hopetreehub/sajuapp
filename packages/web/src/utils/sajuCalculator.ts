import { SajuBirthInfo } from '@/types/saju';

// 천간(天干) - 10개
export const HEAVENLY_STEMS = [
  '갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'
] as const;

// 지지(地支) - 12개  
export const EARTHLY_BRANCHES = [
  '자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'
] as const;

// 60갑자 순환표
export const SIXTY_CYCLE = [
  '갑자', '을축', '병인', '정묘', '무진', '기사', '경오', '신미', '임신', '계유',
  '갑술', '을해', '병자', '정축', '무인', '기묘', '경진', '신사', '임오', '계미',
  '갑신', '을유', '병술', '정해', '무자', '기축', '경인', '신묘', '임진', '계사',
  '갑오', '을미', '병신', '정유', '무술', '기해', '경자', '신축', '임인', '계묘',
  '갑진', '을사', '병오', '정미', '무신', '기유', '경술', '신해', '임자', '계축',
  '갑인', '을묘', '병진', '정사', '무오', '기미', '경신', '신유', '임술', '계해'
] as const;

// 월주 계산용 - 년간에 따른 월간 (정월부터 12월까지)
// 갑기년, 을경년, 병신년, 정임년, 무계년
const MONTHLY_STEMS: Record<string, string[]> = {
  '갑': ['병인', '정묘', '무진', '기사', '경오', '신미', '임신', '계유', '갑술', '을해', '병자', '정축'],
  '을': ['무인', '기묘', '경진', '신사', '임오', '계미', '갑신', '을유', '병술', '정해', '무자', '기축'],
  '병': ['경인', '신묘', '임진', '계사', '갑오', '을미', '병신', '정유', '무술', '기해', '경자', '신축'],
  '정': ['임인', '계묘', '갑진', '을사', '병오', '정미', '무신', '기유', '경술', '신해', '임자', '계축'],
  '무': ['갑인', '을묘', '병진', '정사', '무오', '기미', '경신', '신유', '임술', '계해', '갑자', '을축'],
  '기': ['병인', '정묘', '무진', '기사', '경오', '신미', '임신', '계유', '갑술', '을해', '병자', '정축'],
  '경': ['무인', '기묘', '경진', '신사', '임오', '계미', '갑신', '을유', '병술', '정해', '무자', '기축'],
  '신': ['경인', '신묘', '임진', '계사', '갑오', '을미', '병신', '정유', '무술', '기해', '경자', '신축'],
  '임': ['임인', '계묘', '갑진', '을사', '병오', '정미', '무신', '기유', '경술', '신해', '임자', '계축'],
  '계': ['갑인', '을묘', '병진', '정사', '무오', '기미', '경신', '신유', '임술', '계해', '갑자', '을축']
};

// 시주 계산용 - 일간에 따른 시간
const HOURLY_STEMS: Record<string, string[]> = {
  '갑': ['갑자', '을축', '병인', '정묘', '무진', '기사', '경오', '신미', '임신', '계유', '갑술', '을해'],
  '을': ['병자', '정축', '무인', '기묘', '경진', '신사', '임오', '계미', '갑신', '을유', '병술', '정해'],
  '병': ['무자', '기축', '경인', '신묘', '임진', '계사', '갑오', '을미', '병신', '정유', '무술', '기해'],
  '정': ['경자', '신축', '임인', '계묘', '갑진', '을사', '병오', '정미', '무신', '기유', '경술', '신해'],
  '무': ['임자', '계축', '갑인', '을묘', '병진', '정사', '무오', '기미', '경신', '신유', '임술', '계해'],
  '기': ['갑자', '을축', '병인', '정묘', '무진', '기사', '경오', '신미', '임신', '계유', '갑술', '을해'],
  '경': ['병자', '정축', '무인', '기묘', '경진', '신사', '임오', '계미', '갑신', '을유', '병술', '정해'],
  '신': ['무자', '기축', '경인', '신묘', '임진', '계사', '갑오', '을미', '병신', '정유', '무술', '기해'],
  '임': ['경자', '신축', '임인', '계묘', '갑진', '을사', '병오', '정미', '무신', '기유', '경술', '신해'],
  '계': ['임자', '계축', '갑인', '을묘', '병진', '정사', '무오', '기미', '경신', '신유', '임술', '계해']
};

export interface FourPillarsResult {
  year: { heavenly: string; earthly: string; combined: string };
  month: { heavenly: string; earthly: string; combined: string };
  day: { heavenly: string; earthly: string; combined: string };
  hour: { heavenly: string; earthly: string; combined: string };
}

/**
 * 정확한 사주(四柱) 계산 클래스
 */
export class SajuCalculator {
  
  /**
   * 년주 계산 - 정확한 기준으로 재계산
   * 1971년 = 신해년, 1976년 = 병진년을 기준으로 역산
   */
  private static calculateYearPillar(year: number): { heavenly: string; earthly: string; combined: string } {
    // 1971년 = 신해년 (index 47)
    // 1976년 = 병진년 (index 52)
    // 따라서 1924년 = 갑자년 (index 0)
    
    const baseYear = 1924; // 갑자년
    let yearDiff = year - baseYear;
    let cycleIndex = yearDiff % 60;
    
    // 음수 처리
    if (cycleIndex < 0) {
      cycleIndex += 60;
    }
    
    const combined = SIXTY_CYCLE[cycleIndex];
    return {
      heavenly: combined[0],
      earthly: combined[1],
      combined
    };
  }

  /**
   * 월주 계산 - 년간과 월지의 조합
   */
  private static calculateMonthPillar(year: number, month: number): { heavenly: string; earthly: string; combined: string } {
    const yearPillar = this.calculateYearPillar(year);
    const yearStem = yearPillar.heavenly;
    
    // 월지는 고정: 인(1월), 묘(2월), 진(3월), 사(4월), 오(5월), 미(6월), 
    // 신(7월), 유(8월), 술(9월), 해(10월), 자(11월), 축(12월)
    
    // 년간에 따른 월간 계산
    const monthStems = MONTHLY_STEMS[yearStem];
    if (!monthStems) {
      console.error('Invalid year stem:', yearStem);
      return { heavenly: '갑', earthly: '자', combined: '갑자' };
    }
    
    const monthStem = monthStems[month - 1];
    if (!monthStem) {
      console.error('Invalid month index:', month - 1);
      return { heavenly: '갑', earthly: '자', combined: '갑자' };
    }
    
    return {
      heavenly: monthStem[0],
      earthly: monthStem[1], 
      combined: monthStem
    };
  }

  /**
   * 일주 계산 - 정확한 기준일로 재계산
   * 1971년 11월 17일 = 병오일
   * 1976년 9월 16일 = 신미일
   */
  private static calculateDayPillar(year: number, month: number, day: number): { heavenly: string; earthly: string; combined: string } {
    // 기준일: 1971년 11월 17일 = 병오일 (index 42)
    const baseDate = new Date(1971, 10, 17); // 월은 0부터 시작하므로 11월 = 10
    const targetDate = new Date(year, month - 1, day);
    
    // 두 날짜 간의 차이를 일수로 계산
    const timeDiff = targetDate.getTime() - baseDate.getTime();
    const dayDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    
    // 병오(index 42)를 기준으로 계산
    let cycleIndex = (42 + dayDiff) % 60;
    if (cycleIndex < 0) {
      cycleIndex += 60;
    }
    
    const combined = SIXTY_CYCLE[cycleIndex];
    return {
      heavenly: combined[0],
      earthly: combined[1],
      combined
    };
  }

  /**
   * 시주 계산 - 일간과 시지의 조합
   */
  private static calculateHourPillar(year: number, month: number, day: number, hour: number, minute: number = 0): { heavenly: string; earthly: string; combined: string } {
    const dayPillar = this.calculateDayPillar(year, month, day);
    const dayStem = dayPillar.heavenly;
    
    // 시지는 2시간 단위: 
    // 자시(23-01시), 축시(01-03시), 인시(03-05시), 묘시(05-07시), 
    // 진시(07-09시), 사시(09-11시), 오시(11-13시), 미시(13-15시), 
    // 신시(15-17시), 유시(17-19시), 술시(19-21시), 해시(21-23시)
    
    let hourIndex;
    const time = hour + minute / 60; // 분을 시간으로 변환
    
    if (time >= 23 || time < 1) {
      hourIndex = 0; // 자시 (23:00-00:59)
    } else if (time < 3) {
      hourIndex = 1; // 축시 (01:00-02:59)
    } else if (time < 5) {
      hourIndex = 2; // 인시 (03:00-04:59)
    } else if (time < 7) {
      hourIndex = 3; // 묘시 (05:00-06:59)
    } else if (time < 9) {
      hourIndex = 4; // 진시 (07:00-08:59)
    } else if (time < 11) {
      hourIndex = 5; // 사시 (09:00-10:59)
    } else if (time < 13) {
      hourIndex = 6; // 오시 (11:00-12:59)
    } else if (time < 15) {
      hourIndex = 7; // 미시 (13:00-14:59)
    } else if (time < 17) {
      hourIndex = 8; // 신시 (15:00-16:59)
    } else if (time < 19) {
      hourIndex = 9; // 유시 (17:00-18:59)
    } else if (time < 21) {
      hourIndex = 10; // 술시 (19:00-20:59)
    } else {
      hourIndex = 11; // 해시 (21:00-22:59)
    }
    
    const hourStems = HOURLY_STEMS[dayStem];
    if (!hourStems) {
      console.error('Invalid day stem for hour calculation:', dayStem);
      return { heavenly: '갑', earthly: '자', combined: '갑자' };
    }
    
    const combined = hourStems[hourIndex];
    return {
      heavenly: combined[0],
      earthly: combined[1],
      combined
    };
  }

  /**
   * 전체 사주(四柱) 계산 메인 함수
   */
  public static calculateFourPillars(birthInfo: SajuBirthInfo): FourPillarsResult {
    const { year, month, day, hour, minute = 0 } = birthInfo;
    
    // TODO: 음력 변환 로직 추가 필요 (현재는 양력만 처리)
    // if (birthInfo.isLunar) {
    //   // 음력을 양력으로 변환하는 로직 필요
    // }
    
    return {
      year: this.calculateYearPillar(year),
      month: this.calculateMonthPillar(year, month),
      day: this.calculateDayPillar(year, month, day),
      hour: this.calculateHourPillar(year, month, day, hour, minute)
    };
  }

  /**
   * 테스트용 함수 - 두 개의 기준 케이스 검증
   */
  public static testReferenceCases(): void {
    console.log('=== 사주 계산 테스트 ===');
    
    // 테스트 케이스 1: 1971년 11월 17일 04시
    const test1: SajuBirthInfo = {
      year: 1971,
      month: 11,
      day: 17,
      hour: 4,
      minute: 0,
      isLunar: false
    };
    
    const result1 = this.calculateFourPillars(test1);
    console.log('\n테스트 1: 1971년 11월 17일 04시');
    console.log('결과:', formatFourPillarsDetailed(result1));
    console.log('기대값: 신해년 기해월 병오일 경인시');
    console.log('검증:', 
      result1.year.combined === '신해' && 
      result1.month.combined === '기해' && 
      result1.day.combined === '병오' && 
      result1.hour.combined === '경인' ? '✅ 정확' : '❌ 오류'
    );
    
    // 테스트 케이스 2: 1976년 9월 16일 09시 40분
    const test2: SajuBirthInfo = {
      year: 1976,
      month: 9,
      day: 16,
      hour: 9,
      minute: 40,
      isLunar: false
    };
    
    const result2 = this.calculateFourPillars(test2);
    console.log('\n테스트 2: 1976년 9월 16일 09시 40분');
    console.log('결과:', formatFourPillarsDetailed(result2));
    console.log('기대값: 병진년 정유월 신미일 계사시');
    console.log('검증:', 
      result2.year.combined === '병진' && 
      result2.month.combined === '정유' && 
      result2.day.combined === '신미' && 
      result2.hour.combined === '계사' ? '✅ 정확' : '❌ 오류'
    );
  }
}

/**
 * 사주 결과를 문자열로 포맷팅
 */
export function formatFourPillars(pillars: FourPillarsResult): string {
  return `${pillars.year.combined}년 ${pillars.month.combined}월 ${pillars.day.combined}일 ${pillars.hour.combined}시`;
}

/**
 * 사주 결과를 상세 문자열로 포맷팅
 */
export function formatFourPillarsDetailed(pillars: FourPillarsResult): string {
  return `${pillars.year.heavenly}${pillars.year.earthly}년 ${pillars.month.heavenly}${pillars.month.earthly}월 ${pillars.day.heavenly}${pillars.day.earthly}일 ${pillars.hour.heavenly}${pillars.hour.earthly}시`;
}