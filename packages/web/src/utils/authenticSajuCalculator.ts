/**
 * 정통 사주학 기반 운세 계산기 v1.0
 *
 * 사주학 전문가 가이드라인 준수:
 * 1. 격국(格局) 분석: 일간 강약, 계절별 오행 강약 판단
 * 2. 용신(用神) 선정: 개인별 핵심 필요 오행 결정
 * 3. 대운(大運) 계산: 10년 주기 순역행 계산
 * 4. 세운(歲運) 연계: 1년 주기 60갑자 순환
 * 5. 개인별 패턴 생성: 사주 팔자에 따른 고유 차트
 *
 * 테스트 케이스:
 * - 박준수(신해기해병오경인): 용신 목화 → 목화운 75점+, 금수운 35점-
 * - 정비제(병진정유신미계사): 용신 수목 → 수목운 75점+, 화토운 35점-
 */

// ==================== 기본 타입 정의 ====================

export type OhHaeng = '목' | '화' | '토' | '금' | '수';
export type CheonGan = '갑' | '을' | '병' | '정' | '무' | '기' | '경' | '신' | '임' | '계';
export type JiJi = '자' | '축' | '인' | '묘' | '진' | '사' | '오' | '미' | '신' | '유' | '술' | '해';

export interface SajuPalJa {
  year: { gan: CheonGan; ji: JiJi };
  month: { gan: CheonGan; ji: JiJi };
  day: { gan: CheonGan; ji: JiJi };
  time: { gan: CheonGan; ji: JiJi };
}

export interface GyeokGukAnalysis {
  일간: CheonGan;
  일간오행: OhHaeng;
  일간강약: '강' | '약' | '중';
  월령: JiJi;
  계절: '봄' | '여름' | '가을' | '겨울';
  월령지원: number; // 0-100
  오행분포: Record<OhHaeng, number>;
  격국유형: string;
}

export interface YongSinAnalysis {
  용신: OhHaeng[];
  기신: OhHaeng[];
  희신: OhHaeng[];
  기신원인: string;
  용신점수: Record<OhHaeng, number>;
}

export interface DaeUnData {
  cycle: number; // 0-9 (0-9세, 10-19세, ...)
  천간: CheonGan;
  지지: JiJi;
  오행: OhHaeng;
  순역행: '순행' | '역행';
  점수: number;
  특징: string;
}

export interface SeUnData {
  년도: number;
  나이: number;
  천간: CheonGan;
  지지: JiJi;
  오행: OhHaeng;
  점수: number;
  대운상호작용: number;
}

export interface AuthenticLifeChart {
  개인정보: {
    사주: string;
    격국: GyeokGukAnalysis;
    용신: YongSinAnalysis;
  };
  대운목록: DaeUnData[];
  연도별점수: Array<{
    나이: number;
    년도: number;
    총점: number;
    대운점수: number;
    세운점수: number;
    용신효과: number;
    상세: SeUnData;
  }>;
  통계: {
    최고점년도: { 나이: number; 점수: number };
    최저점년도: { 나이: number; 점수: number };
    평균점수: number;
    용신부합도: number;
  };
}

// ==================== 정통 사주학 데이터 ====================

// 천간 배열 (갑을병정무기경신임계)
export const CHEON_GAN: CheonGan[] = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];

// 지지 배열 (자축인묘진사오미신유술해)
export const JI_JI: JiJi[] = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];

// 천간의 오행 매핑
export const CHEON_GAN_OH_HAENG: Record<CheonGan, OhHaeng> = {
  '갑': '목', '을': '목',
  '병': '화', '정': '화',
  '무': '토', '기': '토',
  '경': '금', '신': '금',
  '임': '수', '계': '수',
};

// 지지의 오행 매핑
export const JI_JI_OH_HAENG: Record<JiJi, OhHaeng> = {
  '인': '목', '묘': '목',
  '사': '화', '오': '화',
  '진': '토', '술': '토', '축': '토', '미': '토',
  '신': '금', '유': '금',
  '자': '수', '해': '수',
};

// 60갑자 순서 (정통 사주학)
export const 육십갑자: Array<{간: CheonGan; 지: JiJi; 순서: number}> = [];
(() => {
  let 순서 = 0;
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 10; j++) {
      const 간 = CHEON_GAN[j];
      const 지 = JI_JI[(j + i * 10) % 12];
      육십갑자.push({간, 지, 순서: 순서++});
    }
  }
})();

// 오행 상생 관계 (정통)
export const 오행상생: Record<OhHaeng, OhHaeng> = {
  '목': '화', // 목생화
  '화': '토', // 화생토
  '토': '금', // 토생금
  '금': '수', // 금생수
  '수': '목',  // 수생목
};

// 오행 상극 관계 (정통)
export const 오행상극: Record<OhHaeng, OhHaeng> = {
  '목': '토', // 목극토
  '화': '금', // 화극금
  '토': '수', // 토극수
  '금': '목', // 금극목
  '수': '화',  // 수극화
};

// 계절별 오행 강약 (정통 사주학)
export const 계절별오행강약: Record<string, Record<OhHaeng, number>> = {
  '봄': { '목': 100, '화': 50, '토': 25, '금': 10, '수': 75 }, // 목왕, 화상, 토사, 금수, 수상
  '여름': { '목': 25, '화': 100, '토': 75, '금': 10, '수': 10 }, // 화왕, 토상, 목사, 금수, 수수
  '가을': { '목': 10, '화': 10, '토': 25, '금': 100, '수': 50 }, // 금왕, 수상, 토사, 목수, 화수
  '겨울': { '목': 50, '화': 10, '토': 10, '금': 75, '수': 100 },  // 수왕, 목상, 금사, 화수, 토수
};

// 지지별 계절 매핑
export const 지지계절: Record<JiJi, string> = {
  '인': '봄', '묘': '봄', '진': '봄',
  '사': '여름', '오': '여름', '미': '여름',
  '신': '가을', '유': '가을', '술': '가을',
  '자': '겨울', '축': '겨울', '해': '겨울',
};

// 천간 합 (정통)
export const 천간합: Record<CheonGan, CheonGan> = {
  '갑': '기', '기': '갑',
  '을': '경', '경': '을',
  '병': '신', '신': '병',
  '정': '임', '임': '정',
  '무': '계', '계': '무',
};

// 지지 충 (정통)
export const 지지충: Record<JiJi, JiJi> = {
  '자': '오', '오': '자',
  '축': '미', '미': '축',
  '인': '신', '신': '인',
  '묘': '유', '유': '묘',
  '진': '술', '술': '진',
  '사': '해', '해': '사',
};

// 지지 합 (육합)
export const 지지육합: Record<JiJi, JiJi> = {
  '자': '축', '축': '자',
  '인': '해', '해': '인',
  '묘': '술', '술': '묘',
  '진': '유', '유': '진',
  '사': '신', '신': '사',
  '오': '미', '미': '오',
};

// ==================== AuthenticSajuCalculator 클래스 ====================

export class AuthenticSajuCalculator {
  private static DEBUG = true;

  /**
   * 메인 계산 함수: 정통 사주학 기반 100년 인생운세 계산
   */
  public static calculateAuthenticLifeChart(
    sajuPalja: SajuPalJa,
    birthYear: number,
  ): AuthenticLifeChart {
    if (this.DEBUG) {


    }

    // 1. 격국 분석
    const 격국 = this.analyzeGyeokGuk(sajuPalja);

    // 2. 용신 선정
    const 용신 = this.selectYongSin(격국);

    // 3. 대운 계산
    const 대운목록 = this.calculateDaeUn(sajuPalja, 격국);

    // 4. 96년 연도별 점수 계산
    const 연도별점수 = this.calculateYearlyScores(sajuPalja, 격국, 용신, 대운목록, birthYear);

    // 5. 통계 계산
    const 통계 = this.calculateStatistics(연도별점수, 용신);

    if (this.DEBUG) {


    }

    return {
      개인정보: {
        사주: this.formatSaju(sajuPalja),
        격국,
        용신,
      },
      대운목록,
      연도별점수,
      통계,
    };
  }

  /**
   * 1단계: 격국(格局) 분석 - 일간 강약과 계절 오행 판단
   */
  private static analyzeGyeokGuk(saju: SajuPalJa): GyeokGukAnalysis {
    const 일간 = saju.day.gan;
    const 일간오행 = CHEON_GAN_OH_HAENG[일간];
    const 월령 = saju.month.ji;
    const 계절 = 지지계절[월령] as '봄' | '여름' | '가을' | '겨울';

    // 오행 분포 계산
    const 오행분포: Record<OhHaeng, number> = { '목': 0, '화': 0, '토': 0, '금': 0, '수': 0 };

    // 천간 오행 카운트 (각 2점)
    [saju.year.gan, saju.month.gan, saju.day.gan, saju.time.gan].forEach(간 => {
      오행분포[CHEON_GAN_OH_HAENG[간]] += 20;
    });

    // 지지 오행 카운트 (각 3점)
    [saju.year.ji, saju.month.ji, saju.day.ji, saju.time.ji].forEach(지 => {
      오행분포[JI_JI_OH_HAENG[지]] += 30;
    });

    // 월령 지원도 계산 (일간이 월령에서 얼마나 지원받는가)
    const 계절강약 = 계절별오행강약[계절];
    const 월령지원 = 계절강약[일간오행];

    // 일간 강약 판단 (정통 방식)
    let 일간강약: '강' | '약' | '중';
    const 일간점수 = 오행분포[일간오행] + 월령지원;

    if (일간점수 >= 120) {
      일간강약 = '강';
    } else if (일간점수 <= 60) {
      일간강약 = '약';
    } else {
      일간강약 = '중';
    }

    // 격국 유형 결정
    let 격국유형 = '일반격';
    if (일간강약 === '강') {
      격국유형 = '신강격';
    } else if (일간강약 === '약') {
      격국유형 = '신약격';
    }

    if (this.DEBUG) {


    }

    return {
      일간,
      일간오행,
      일간강약,
      월령,
      계절,
      월령지원,
      오행분포,
      격국유형,
    };
  }

  /**
   * 2단계: 용신(用神) 선정 - 개인별 핵심 필요 오행 결정
   */
  private static selectYongSin(격국: GyeokGukAnalysis): YongSinAnalysis {
    const 용신점수: Record<OhHaeng, number> = { '목': 0, '화': 0, '토': 0, '금': 0, '수': 0 };

    // 기본 용신 선정 원리
    if (격국.일간강약 === '약') {
      // 신약: 일간을 돕는 오행이 용신
      용신점수[격국.일간오행] += 100; // 비견, 겁재
      용신점수[this.getGeneratingElement(격국.일간오행)] += 90; // 정인, 편인
    } else if (격국.일간강약 === '강') {
      // 신강: 일간을 소모하는 오행이 용신
      용신점수[오행상생[격국.일간오행]] += 100; // 식신, 상관
      용신점수[오행상극[격국.일간오행]] += 90; // 정재, 편재
      용신점수[this.getConflictingElement(격국.일간오행)] += 80; // 정관, 편관
    } else {
      // 중화: 부족한 오행 보충
      const 오행평균 = Object.values(격국.오행분포).reduce((a, b) => a + b) / 5;
      Object.entries(격국.오행분포).forEach(([오행, 점수]) => {
        if (점수 < 오행평균) {
          용신점수[오행 as OhHaeng] += (오행평균 - 점수);
        }
      });
    }

    // 계절 보정 (부족한 오행 우선)
    const 계절강약 = 계절별오행강약[격국.계절];
    Object.entries(계절강약).forEach(([오행, 강도]) => {
      if (강도 < 30) { // 약한 오행
        용신점수[오행 as OhHaeng] += 50;
      }
    });

    // 용신 순위 정렬
    const 정렬된용신 = Object.entries(용신점수)
      .sort(([,a], [,b]) => b - a)
      .map(([오행]) => 오행 as OhHaeng);

    const 용신 = 정렬된용신.slice(0, 2); // 1, 2용신
    const 기신 = 정렬된용신.slice(2, 4); // 희용신
    const 희신 = 정렬된용신.slice(4); // 기타

    let 기신원인 = '';
    if (격국.일간강약 === '약') {
      기신원인 = '신약으로 인한 부족 오행 보충 필요';
    } else if (격국.일간강약 === '강') {
      기신원인 = '신강으로 인한 과잉 오행 소모 필요';
    } else {
      기신원인 = '중화로 인한 균형 오행 보완 필요';
    }

    if (this.DEBUG) {


    }

    return { 용신, 기신, 희신, 기신원인, 용신점수 };
  }

  /**
   * 3단계: 대운(大運) 계산 - 10년 주기 순역행
   */
  private static calculateDaeUn(saju: SajuPalJa, 격국: GyeokGukAnalysis): DaeUnData[] {
    const 대운목록: DaeUnData[] = [];

    // 순역행 결정 (정통 방식)
    const 일간 = saju.day.gan;
    const 년간 = saju.year.gan;
    const 순역행 = this.determineDaeunDirection(일간, 년간);

    // 월주 기준으로 대운 진행
    const 월간인덱스 = CHEON_GAN.indexOf(saju.month.gan);
    const 월지인덱스 = JI_JI.indexOf(saju.month.ji);

    for (let cycle = 0; cycle < 10; cycle++) {
      let 대운간인덱스: number;
      let 대운지인덱스: number;

      if (순역행 === '순행') {
        대운간인덱스 = (월간인덱스 + cycle + 1) % 10;
        대운지인덱스 = (월지인덱스 + cycle + 1) % 12;
      } else {
        대운간인덱스 = (월간인덱스 - cycle - 1 + 10) % 10;
        대운지인덱스 = (월지인덱스 - cycle - 1 + 12) % 12;
      }

      const 천간 = CHEON_GAN[대운간인덱스];
      const 지지 = JI_JI[대운지인덱스];
      const 오행 = CHEON_GAN_OH_HAENG[천간];

      // 대운 점수 계산 (일간과의 관계)
      let 점수 = 50;

      // 일간과 대운간 관계
      if (천간 === 일간) {
        점수 += 15; // 비견
      } else if (천간합[일간] === 천간) {
        점수 += 25; // 천간합
      } else if (오행상생[오행] === 격국.일간오행) {
        점수 += 20; // 인성
      } else if (오행상극[오행] === 격국.일간오행) {
        점수 -= 15; // 관성
      }

      // 지지 충합 관계
      if (지지충[saju.day.ji] === 지지) {
        점수 -= 20; // 일지충
      } else if (지지육합[saju.day.ji] === 지지) {
        점수 += 15; // 일지합
      }

      const 특징 = this.analyzeDaeunFeatures(cycle, 천간, 지지, 순역행);

      대운목록.push({
        cycle,
        천간,
        지지,
        오행,
        순역행,
        점수: Math.max(10, Math.min(90, 점수)),
        특징,
      });
    }

    if (this.DEBUG) {


      대운목록.slice(0, 3).forEach(대운 => {

      });
    }

    return 대운목록;
  }

  /**
   * 4단계: 96년 연도별 점수 계산 (개인차 강화)
   */
  private static calculateYearlyScores(
    saju: SajuPalJa,
    격국: GyeokGukAnalysis,
    용신: YongSinAnalysis,
    대운목록: DaeUnData[],
    birthYear: number,
  ): AuthenticLifeChart['연도별점수'] {
    const 연도별점수: AuthenticLifeChart['연도별점수'] = [];

    // 격국별 기본 점수 차별화
    const 격국별기본점수 = this.get격국별기본점수(격국.격국유형, 격국.일간);
    const 일간보정값 = this.get일간보정값(격국.일간);

    for (let age = 0; age <= 95; age++) {
      const 년도 = birthYear + age;
      const 대운사이클 = Math.floor(age / 10);
      const 현재대운 = 대운목록[대운사이클] || 대운목록[대운목록.length - 1];

      // 세운 계산 (60갑자 순환)
      const 세운간인덱스 = (년도 - 4) % 10;
      const 세운지인덱스 = (년도 - 4) % 12;
      const 세운간 = CHEON_GAN[세운간인덱스];
      const 세운지 = JI_JI[세운지인덱스];
      const 세운오행 = CHEON_GAN_OH_HAENG[세운간];

      // 세운 점수 계산 (개인차 강화)
      let 세운점수 = 격국별기본점수 + 일간보정값;  // 격국과 일간 반영

      // 일간과 세운간 관계
      if (세운간 === saju.day.gan) {
        세운점수 += 10;
      } else if (천간합[saju.day.gan] === 세운간) {
        세운점수 += 15;
      }

      // 용신 효과 계산 (개인차 극대화!)
      let 용신효과 = 0;
      const 나이가중치 = this.get나이별용신가중치(age);

      if (용신.용신.includes(세운오행)) {
        용신효과 += 35 * 나이가중치;  // 강화된 용신 효과
      } else if (용신.희신.includes(세운오행)) {
        용신효과 += 18 * 나이가중치;  // 희신
      } else if (용신.기신.includes(세운오행)) {
        용신효과 -= 30 * 나이가중치;  // 강화된 기신 효과
      }

      // 대운-세운 상호작용
      let 대운상호작용 = 0;
      if (현재대운.천간 === 세운간) {
        대운상호작용 += 20; // 대운세운 천간 같음
      }
      if (현재대운.지지 === 세운지) {
        대운상호작용 += 15; // 대운세운 지지 같음
      }
      if (지지충[현재대운.지지] === 세운지) {
        대운상호작용 -= 25; // 대운세운 지지 충
      }

      // 총점 계산
      const 대운점수 = 현재대운.점수;
      const 총점 = Math.max(10, Math.min(90,
        대운점수 * 0.4 +
        (세운점수 + 용신효과) * 0.4 +
        대운상호작용 * 0.2,
      ));

      const 세운상세: SeUnData = {
        년도,
        나이: age,
        천간: 세운간,
        지지: 세운지,
        오행: 세운오행,
        점수: 세운점수,
        대운상호작용,
      };

      연도별점수.push({
        나이: age,
        년도,
        총점: Math.round(총점),
        대운점수,
        세운점수,
        용신효과,
        상세: 세운상세,
      });
    }

    return 연도별점수;
  }

  /**
   * 5단계: 통계 계산
   */
  private static calculateStatistics(
    연도별점수: AuthenticLifeChart['연도별점수'],
    _용신: YongSinAnalysis,
  ): AuthenticLifeChart['통계'] {
    const 점수들 = 연도별점수.map(년 => 년.총점);
    const 최고점 = Math.max(...점수들);
    const 최저점 = Math.min(...점수들);
    const 평균점수 = 점수들.reduce((a, b) => a + b) / 점수들.length;

    const 최고점년도 = 연도별점수.find(년 => 년.총점 === 최고점)!;
    const 최저점년도 = 연도별점수.find(년 => 년.총점 === 최저점)!;

    // 용신 부합도 계산
    const 용신부합점수 = 연도별점수.filter(년 => 년.용신효과 > 20);
    const 용신부합도 = (용신부합점수.length / 연도별점수.length) * 100;

    return {
      최고점년도: { 나이: 최고점년도.나이, 점수: 최고점 },
      최저점년도: { 나이: 최저점년도.나이, 점수: 최저점 },
      평균점수: Math.round(평균점수),
      용신부합도: Math.round(용신부합도),
    };
  }

  // ==================== 개인차 강화 헬퍼 함수들 ====================

  /**
   * 격국별 기본 점수 차별화
   */
  private static get격국별기본점수(격국유형: string, _일간: CheonGan): number {
    const 격국점수맵: Record<string, number> = {
      '신강격': 70,  // 안정적이고 지속적
      '신약격': 50,  // 변화무쌍하고 극적
      '종격': 60,    // 특정 분야 집중
      '특수격': 65,  // 예측 불가능
      '기타': 55,
    };

    const 기본점수 = 격국점수맵[격국유형] || 55;
    return 기본점수;
  }

  /**
   * 일간별 개성 보정
   */
  private static get일간보정값(일간: CheonGan): number {
    const 일간특성: Record<CheonGan, number> = {
      '갑': 5,   // 리더십
      '을': 3,   // 유연성
      '병': 7,   // 열정
      '정': 4,   // 섬세함
      '무': 6,   // 안정성
      '기': 2,   // 변화
      '경': 8,   // 결단력
      '신': 3,   // 예리함
      '임': 4,   // 지혜
      '계': 5,    // 통찰력
    };

    return 일간특성[일간] || 0;
  }

  /**
   * 나이별 용신 중요도 가중치
   */
  private static get나이별용신가중치(age: number): number {
    if (age >= 20 && age <= 40) {
      return 1.5;  // 청년기 용신 중요
    } else if (age >= 40 && age <= 60) {
      return 1.3;  // 중년기 용신 중요
    } else if (age >= 60) {
      return 1.1;  // 노년기 안정 추구
    }
    return 1.0;  // 유년기
  }

  // ==================== 기존 헬퍼 함수들 ====================

  private static getGeneratingElement(element: OhHaeng): OhHaeng {
    const reverse = Object.fromEntries(
      Object.entries(오행상생).map(([k, v]) => [v, k]),
    );
    return reverse[element] as OhHaeng;
  }

  private static getConflictingElement(element: OhHaeng): OhHaeng {
    const reverse = Object.fromEntries(
      Object.entries(오행상극).map(([k, v]) => [v, k]),
    );
    return reverse[element] as OhHaeng;
  }

  private static determineDaeunDirection(일간: CheonGan, 년간: CheonGan): '순행' | '역행' {
    // 남성: 양간생년 순행, 음간생년 역행
    // 여성: 양간생년 역행, 음간생년 순행
    // 임시로 남성 기준 (실제로는 성별 정보 필요)
    const 양간 = ['갑', '병', '무', '경', '임'];
    const 년간이양간 = 양간.includes(년간);

    return 년간이양간 ? '순행' : '역행';
  }

  private static analyzeDaeunFeatures(cycle: number, 간: CheonGan, _지: JiJi, _순역행: '순행' | '역행'): string {
    const features = [];

    if (cycle === 0) features.push('기초형성기');
    else if (cycle === 1) features.push('성장발전기');
    else if (cycle === 2) features.push('도전기회기');
    else if (cycle === 3) features.push('안정확립기');
    else if (cycle === 4) features.push('성숙전성기');
    else if (cycle === 5) features.push('지혜전수기');
    else features.push('완성회고기');

    const 오행 = CHEON_GAN_OH_HAENG[간];
    features.push(`${오행}기운`);

    return features.join(', ');
  }

  private static formatSaju(saju: SajuPalJa): string {
    return `${saju.year.gan}${saju.year.ji} ${saju.month.gan}${saju.month.ji} ${saju.day.gan}${saju.day.ji} ${saju.time.gan}${saju.time.ji}`;
  }

  // ==================== 테스트 케이스 생성 ====================

  /**
   * 박준수 테스트 케이스: 신해기해병오경인
   * 예상: 용신 목화, 목화운에서 75점+, 금수운에서 35점-
   */
  public static createParkJunSooTestCase(): SajuPalJa {
    return {
      year: { gan: '신', ji: '해' },  // 신해
      month: { gan: '기', ji: '해' }, // 기해
      day: { gan: '병', ji: '오' },   // 병오
      time: { gan: '경', ji: '인' },   // 경인
    };
  }

  /**
   * 정비제 테스트 케이스: 병진정유신미계사
   * 예상: 용신 수목, 수목운에서 75점+, 화토운에서 35점-
   */
  public static createJeongBiJeTestCase(): SajuPalJa {
    return {
      year: { gan: '병', ji: '진' },  // 병진
      month: { gan: '정', ji: '유' }, // 정유
      day: { gan: '신', ji: '미' },   // 신미
      time: { gan: '계', ji: '사' },   // 계사
    };
  }

  /**
   * 디버그용 테스트 실행
   */
  public static runTestCases(): void {

    // 박준수 테스트

    const 박준수사주 = this.createParkJunSooTestCase();
    const _박준수결과 = this.calculateAuthenticLifeChart(박준수사주, 1971);


    // 정비제 테스트

    const 정비제사주 = this.createJeongBiJeTestCase();
    const _정비제결과 = this.calculateAuthenticLifeChart(정비제사주, 1976);


  }
}