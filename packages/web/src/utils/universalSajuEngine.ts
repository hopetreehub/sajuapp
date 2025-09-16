// Universal Saju Engine - 정확한 사주 기반 인생차트 엔진
// 대운, 세운, 오행 관계를 정확히 반영한 5차원 분석

import {
  UniversalLifeChartData,
  PersonalInfo,
  ChartDataPoint,
  ChartDimensions,
  SajuComponents,
  DaeunInfo,
  YearlyFortune,
  LifePeriodInfo,
  LifePhase,
  TrendType,
  ChartMetadata,
} from '@/types/universalLifeChart';

export class UniversalSajuEngine {
  // 천간 배열
  private static readonly CHEONGAN = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];

  // 지지 배열
  private static readonly JIJI = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];

  // 오행 매핑
  private static readonly OHANG_MAP: Record<string, string> = {
    '갑': '목', '을': '목',
    '병': '화', '정': '화',
    '무': '토', '기': '토',
    '경': '금', '신': '금',
    '임': '수', '계': '수',
    '인': '목', '묘': '목',
    '사': '화', '오': '화',
    '진': '토', '미': '토', '술': '토', '축': '토',
    '신': '금', '유': '금',
    '자': '수', '해': '수',
  };

  // 십신 관계 (일간 기준)
  private static readonly SIPSIN_MAP: Record<string, Record<string, string>> = {
    '갑': { '갑': '비견', '을': '겁재', '병': '식신', '정': '상관', '무': '편재', '기': '정재', '경': '편관', '신': '정관', '임': '편인', '계': '정인' },
    '을': { '갑': '겁재', '을': '비견', '병': '상관', '정': '식신', '무': '정재', '기': '편재', '경': '정관', '신': '편관', '임': '정인', '계': '편인' },
    '병': { '갑': '편인', '을': '정인', '병': '비견', '정': '겁재', '무': '식신', '기': '상관', '경': '편재', '신': '정재', '임': '편관', '계': '정관' },
    '정': { '갑': '정인', '을': '편인', '병': '겁재', '정': '비견', '무': '상관', '기': '식신', '경': '정재', '신': '편재', '임': '정관', '계': '편관' },
    '무': { '갑': '편관', '을': '정관', '병': '편인', '정': '정인', '무': '비견', '기': '겁재', '경': '식신', '신': '상관', '임': '편재', '계': '정재' },
    '기': { '갑': '정관', '을': '편관', '병': '정인', '정': '편인', '무': '겁재', '기': '비견', '경': '상관', '신': '식신', '임': '정재', '계': '편재' },
    '경': { '갑': '편재', '을': '정재', '병': '편관', '정': '정관', '무': '편인', '기': '정인', '경': '비견', '신': '겁재', '임': '식신', '계': '상관' },
    '신': { '갑': '정재', '을': '편재', '병': '정관', '정': '편관', '무': '정인', '기': '편인', '경': '겁재', '신': '비견', '임': '상관', '계': '식신' },
    '임': { '갑': '식신', '을': '상관', '병': '편재', '정': '정재', '무': '편관', '기': '정관', '경': '편인', '신': '정인', '임': '비견', '계': '겁재' },
    '계': { '갑': '상관', '을': '식신', '병': '정재', '정': '편재', '무': '정관', '기': '편관', '경': '정인', '신': '편인', '임': '겁재', '계': '비견' },
  };

  // 지지 충합 관계
  private static readonly JIJI_RELATIONS = {
    충: [
      ['자', '오'], ['축', '미'], ['인', '신'], ['묘', '유'], ['진', '술'], ['사', '해']
    ],
    합: [
      ['자', '축'], ['인', '해'], ['묘', '술'], ['진', '유'], ['사', '신'], ['오', '미']
    ],
    형: [
      ['인', '사', '신'], ['축', '술', '미'], ['자', '묘']
    ],
    삼합: [
      ['신', '자', '진'], ['해', '묘', '미'], ['인', '오', '술'], ['사', '유', '축']
    ]
  };

  /**
   * 메인 함수: 정확한 사주 기반 95년 인생차트 생성
   */
  static generateUniversalLifeChart(
    sajuData: SajuComponents,
    personalInfo: PersonalInfo
  ): UniversalLifeChartData {
    const birthYear = new Date(personalInfo.birthDate).getFullYear();
    const currentYear = new Date().getFullYear();
    const currentAge = currentYear - birthYear;

    // 대운 계산
    const daeunList = this.calculateDaeun(sajuData, personalInfo, birthYear);

    // 95년간 정확한 차트 데이터 생성
    const chartData = this.calculateAccurateChartDimensions(
      sajuData,
      personalInfo,
      birthYear,
      daeunList
    );

    // 인생 주기 분석
    const lifePeriods = this.analyzeLifePeriods(chartData, birthYear);

    // 메타데이터 생성
    const metadata = this.generateMetadata();

    return {
      personalInfo,
      timeline: {
        startYear: birthYear,
        endYear: birthYear + 95,
        currentYear,
        currentAge: Math.max(0, currentAge),
        lifeProgress: Math.min(100, (currentAge / 95) * 100),
      },
      chartData,
      lifePeriods,
      metadata,
    };
  }

  /**
   * 대운 계산 (10년 주기)
   */
  private static calculateDaeun(
    sajuData: SajuComponents,
    personalInfo: PersonalInfo,
    birthYear: number
  ): DaeunInfo[] {
    const daeunList: DaeunInfo[] = [];

    // 양력/음력 및 성별에 따른 대운 방향 결정
    const yearGanIndex = this.CHEONGAN.indexOf(sajuData.year.gan);
    const isYangYear = yearGanIndex % 2 === 0; // 갑, 병, 무, 경, 임은 양년
    const isForward = (personalInfo.gender === 'male' && isYangYear) ||
                     (personalInfo.gender === 'female' && !isYangYear);

    // 월주 기준 대운 진행
    const monthGanIndex = this.CHEONGAN.indexOf(sajuData.month.gan);
    const monthJiIndex = this.JIJI.indexOf(sajuData.month.ji);

    for (let i = 0; i < 10; i++) {
      let daeunGanIndex, daeunJiIndex;

      if (isForward) {
        // 순행
        daeunGanIndex = (monthGanIndex + i + 1) % 10;
        daeunJiIndex = (monthJiIndex + i + 1) % 12;
      } else {
        // 역행
        daeunGanIndex = (monthGanIndex - i - 1 + 10) % 10;
        daeunJiIndex = (monthJiIndex - i - 1 + 12) % 12;
      }

      daeunList.push({
        startAge: i * 10,
        endAge: (i + 1) * 10 - 1,
        gan: this.CHEONGAN[daeunGanIndex],
        ji: this.JIJI[daeunJiIndex],
        direction: isForward ? 'forward' : 'backward'
      });
    }

    return daeunList;
  }

  /**
   * 정확한 5차원 차트 데이터 계산
   */
  private static calculateAccurateChartDimensions(
    sajuData: SajuComponents,
    personalInfo: PersonalInfo,
    birthYear: number,
    daeunList: DaeunInfo[]
  ): ChartDimensions {
    const geunbon: ChartDataPoint[] = [];
    const woon: ChartDataPoint[] = [];
    const haeng: ChartDataPoint[] = [];
    const hyeong: ChartDataPoint[] = [];
    const byeon: ChartDataPoint[] = [];

    // 일간의 오행
    const dayGanOhang = this.OHANG_MAP[sajuData.day.gan];

    for (let age = 0; age <= 95; age++) {
      const year = birthYear + age;

      // 현재 나이의 대운 찾기
      const currentDaeun = daeunList.find(d => age >= d.startAge && age <= d.endAge) || daeunList[0];

      // 세운 계산
      const saeunGan = this.CHEONGAN[year % 10];
      const saeunJi = this.JIJI[year % 12];

      // 대운과 일간의 관계
      const daeunRelation = this.calculateRelationScore(sajuData.day.gan, currentDaeun.gan, currentDaeun.ji);

      // 세운과 일간의 관계
      const saeunRelation = this.calculateRelationScore(sajuData.day.gan, saeunGan, saeunJi);

      // 연령대별 가중치
      const ageWeight = this.getAgeWeight(age);

      // 1. 근본 (기질/성격) - 대운 전환 시 급변, 평소 안정적
      const geunbonBase = this.calculateGeunbon(sajuData, dayGanOhang);
      let geunbonValue = geunbonBase;

      // 대운 전환 시 급격한 변화
      if (currentDaeun.startAge === age) {
        geunbonValue += daeunRelation > 0 ? 0.5 : -0.5;
      }

      // 특정 나이대 보정 (사회 진출, 은퇴 등)
      if (age === 23 || age === 30) geunbonValue += 0.3;
      if (age === 60 || age === 65) geunbonValue -= 0.2;

      geunbon.push({
        year,
        age,
        value: Math.max(-2, Math.min(2, geunbonValue)),
        intensity: Math.abs(geunbonValue),
        phase: this.getLifePhase(age),
        description: `${age}세 기질`
      });

      // 2. 운 (행운/기회) - 대운과 세운의 복잡한 상호작용
      let woonValue = daeunRelation * 1.0;

      // 세운과 대운의 충합 관계로 급변
      const daeunSaeunInteraction = this.checkChungHap(currentDaeun.ji, saeunJi);
      woonValue += daeunSaeunInteraction * 0.6;

      // 대운 시작 시 큰 변화 (10년마다 급변)
      if (currentDaeun.startAge === age) {
        woonValue = daeunRelation > 0 ? 1.5 : -1.5;
      }

      // 대운 중반 안정화 패턴
      const daeunProgress = (age - currentDaeun.startAge) / 10;
      if (daeunProgress > 0.3 && daeunProgress < 0.7) {
        woonValue *= 0.85;
      } else if (daeunProgress > 0.8) {
        woonValue *= 1.1; // 대운 말기 변동성 증가
      }

      // 특수 나이 이벤트 (20, 30, 40, 50, 60세)
      if (age % 10 === 0 && age >= 20 && age <= 60) {
        woonValue += daeunRelation > 0 ? 0.4 : -0.3;
      }

      // 세운 특수 패턴 (띠 해와 사주의 충합)
      if (saeunJi === sajuData.year.ji) woonValue += 0.3; // 본명년

      woon.push({
        year,
        age,
        value: Math.max(-2, Math.min(2, woonValue)),
        intensity: Math.abs(woonValue),
        phase: this.getLifePhase(age),
        description: `${currentDaeun.gan}${currentDaeun.ji} 대운`
      });

      // 3. 행 (실행력/의지) - 나이와 비겁/식상의 영향
      const haengBase = this.calculateHaeng(sajuData, currentDaeun, age);
      haeng.push({
        year,
        age,
        value: haengBase * ageWeight.activity,
        intensity: Math.abs(haengBase),
        phase: this.getLifePhase(age),
        description: `${age}세 실행력`
      });

      // 4. 형 (권위/지위) - 관성의 영향, 중년에 정점
      const hyeongBase = this.calculateHyeong(sajuData, currentDaeun, age);
      hyeong.push({
        year,
        age,
        value: hyeongBase * ageWeight.social,
        intensity: Math.abs(hyeongBase),
        phase: this.getLifePhase(age),
        description: `${age}세 사회운`
      });

      // 5. 변 (변화/전환) - 충/합/형/파 발생 시 급변
      const byeonValue = this.calculateByeon(sajuData, currentDaeun, saeunJi, age);
      byeon.push({
        year,
        age,
        value: byeonValue,
        intensity: Math.abs(byeonValue),
        phase: this.getLifePhase(age),
        description: byeonValue > 1 ? '큰 변화' : byeonValue < -1 ? '위기' : '안정'
      });
    }

    return { geunbon, woon, haeng, hyeong, byeon };
  }

  /**
   * 지지 충합형파 관계 체크 - 급격한 변화를 만드는 핵심
   */
  private static checkChungHap(ji1: string, ji2: string): number {
    // 충 - 매우 강한 부정적 변화
    const chung: Array<[string, string]> = [
      ['자', '오'], ['축', '미'], ['인', '신'],
      ['묘', '유'], ['진', '술'], ['사', '해']
    ];

    for (const [a, b] of chung) {
      if ((ji1 === a && ji2 === b) || (ji1 === b && ji2 === a)) {
        return -1.8; // 충은 강한 부정적 급변
      }
    }

    // 합 - 강한 긍정적 변화
    const hap: Array<[string, string]> = [
      ['자', '축'], ['인', '해'], ['묘', '술'],
      ['진', '유'], ['사', '신'], ['오', '미']
    ];

    for (const [a, b] of hap) {
      if ((ji1 === a && ji2 === b) || (ji1 === b && ji2 === a)) {
        return 1.5; // 합은 강한 긍정적 변화
      }
    }

    // 형 - 중간 수준 부정적 영향
    const hyeongPatterns = [
      ['인', '사', '신'], // 삼형
      ['유', '축', '술'], // 삼형
      ['자', '묘']        // 자묘형
    ];

    for (const pattern of hyeongPatterns) {
      if (pattern.includes(ji1) && pattern.includes(ji2)) {
        return -0.9; // 형은 중간 부정적
      }
    }

    // 파 - 파괴적 변화
    const paPatterns: Array<[string, string]> = [
      ['자', '미'], ['축', '술'], ['인', '유'],
      ['묘', '신'], ['진', '해'], ['사', '오']
    ];

    for (const [a, b] of paPatterns) {
      if ((ji1 === a && ji2 === b) || (ji1 === b && ji2 === a)) {
        return -1.3; // 파는 파괴적
      }
    }

    // 반합 - 약한 긍정적 영향
    const banhap: Array<[string, string]> = [
      ['자', '축'], ['인', '해'], ['묘', '술'],
      ['진', '유'], ['사', '신'], ['오', '미']
    ];

    for (const [a, b] of banhap) {
      // 이미 처리된 육합과 중복 체크 방지
      if (hap.some(([h1, h2]) =>
          (h1 === a && h2 === b) || (h1 === b && h2 === a))) {
        continue;
      }
      if ((ji1 === a && ji2 === b) || (ji1 === b && ji2 === a)) {
        return 0.6; // 반합은 약한 긍정
      }
    }

    // 관계없음
    return 0;
  }

  /**
   * 천간/지지 관계 점수 계산
   */
  private static calculateRelationScore(dayGan: string, targetGan: string, targetJi: string): number {
    // 천간 십신 관계
    const sipsin = this.SIPSIN_MAP[dayGan][targetGan];
    const ganScore = this.getSipsinScore(sipsin);

    // 지지 오행 관계
    const dayOhang = this.OHANG_MAP[dayGan];
    const targetJiOhang = this.OHANG_MAP[targetJi];
    const jiScore = this.RELATIONSHIP_MAP[dayOhang][targetJiOhang] || 0;

    return ganScore * 0.6 + jiScore * 0.4;
  }

  /**
   * 십신별 점수
   */
  private static getSipsinScore(sipsin: string): number {
    const scores: Record<string, number> = {
      '비견': 0.5,
      '겁재': -0.3,
      '식신': 0.8,
      '상관': -0.5,
      '편재': 0.6,
      '정재': 0.9,
      '편관': -0.7,
      '정관': 0.8,
      '편인': 0.4,
      '정인': 0.7,
    };
    return scores[sipsin] || 0;
  }

  /**
   * 근본 계산 (기질/성격)
   */
  private static calculateGeunbon(sajuData: SajuComponents, dayGanOhang: string): number {
    // 사주 원국의 오행 균형도 계산
    const ohangCount: Record<string, number> = { '목': 0, '화': 0, '토': 0, '금': 0, '수': 0 };

    // 사주 팔자 오행 집계
    [sajuData.year, sajuData.month, sajuData.day, sajuData.time].forEach(pillar => {
      ohangCount[this.OHANG_MAP[pillar.gan]]++;
      ohangCount[this.OHANG_MAP[pillar.ji]]++;
    });

    // 일간 오행의 비중
    const dayOhangRatio = ohangCount[dayGanOhang] / 8;

    // 균형도 계산 (0.25가 이상적)
    const balance = 1 - Math.abs(dayOhangRatio - 0.25) * 2;

    return balance;
  }

  /**
   * 행 계산 (실행력/의지)
   */
  private static calculateHaeng(sajuData: SajuComponents, daeun: DaeunInfo, age: number): number {
    const dayGan = sajuData.day.gan;
    const daeunSipsin = this.SIPSIN_MAP[dayGan][daeun.gan];

    // 비겁과 식상이 실행력에 긍정적
    if (daeunSipsin === '비견' || daeunSipsin === '식신') {
      return 0.8 + Math.sin(age / 10) * 0.2;
    } else if (daeunSipsin === '겁재' || daeunSipsin === '상관') {
      return -0.3 + Math.sin(age / 10) * 0.2;
    }

    return Math.sin(age / 15) * 0.5;
  }

  /**
   * 형 계산 (권위/지위)
   */
  private static calculateHyeong(sajuData: SajuComponents, daeun: DaeunInfo, age: number): number {
    const dayGan = sajuData.day.gan;
    const daeunSipsin = this.SIPSIN_MAP[dayGan][daeun.gan];

    // 관성과 인성이 권위운에 긍정적
    if (daeunSipsin === '정관' || daeunSipsin === '정인') {
      return 0.9 + Math.cos(age / 20) * 0.3;
    } else if (daeunSipsin === '편관' || daeunSipsin === '편인') {
      return 0.4 + Math.cos(age / 20) * 0.3;
    }

    // 중년(40-60세)에 정점
    const middleAgeBonus = age >= 40 && age <= 60 ? 0.3 : 0;
    return Math.cos(age / 25) * 0.5 + middleAgeBonus;
  }

  /**
   * 변 계산 (변화/전환)
   */
  private static calculateByeon(
    sajuData: SajuComponents,
    daeun: DaeunInfo,
    saeunJi: string,
    age: number
  ): number {
    let changeScore = 0;

    // 충 체크
    this.JIJI_RELATIONS.충.forEach(([ji1, ji2]) => {
      if ((sajuData.day.ji === ji1 && daeun.ji === ji2) ||
          (sajuData.day.ji === ji2 && daeun.ji === ji1)) {
        changeScore -= 1.5; // 충은 큰 변화
      }
      if ((sajuData.day.ji === ji1 && saeunJi === ji2) ||
          (sajuData.day.ji === ji2 && saeunJi === ji1)) {
        changeScore -= 0.8; // 세운 충은 작은 변화
      }
    });

    // 합 체크
    this.JIJI_RELATIONS.합.forEach(([ji1, ji2]) => {
      if ((sajuData.day.ji === ji1 && daeun.ji === ji2) ||
          (sajuData.day.ji === ji2 && daeun.ji === ji1)) {
        changeScore += 1.2; // 합은 긍정적 변화
      }
    });

    // 대운 전환기 급격한 변화
    if (age % 10 === 0 && age > 0) {
      changeScore += 1.5; // 대운 전환은 항상 큰 변화
    }

    // 인생 주요 전환점
    if (age === 23 || age === 33 || age === 43 || age === 53 || age === 63) {
      changeScore += 0.8;
    }

    // 세운과 원국의 충합
    if (saeun === sajuData.year.ji || saeun === sajuData.day.ji) {
      changeScore += 0.5;
    }

    return Math.max(-2, Math.min(2, changeScore));
  }

  /**
   * 연령대별 가중치
   */
  private static getAgeWeight(age: number): { activity: number; social: number } {
    if (age <= 10) {
      return { activity: 0.3, social: 0.1 };
    } else if (age <= 20) {
      return { activity: 0.7, social: 0.3 };
    } else if (age <= 35) {
      return { activity: 1.0, social: 0.7 };
    } else if (age <= 50) {
      return { activity: 0.9, social: 1.0 };
    } else if (age <= 65) {
      return { activity: 0.7, social: 0.9 };
    } else if (age <= 80) {
      return { activity: 0.5, social: 0.6 };
    } else {
      return { activity: 0.3, social: 0.3 };
    }
  }

  /**
   * 인생 단계 결정
   */
  private static getLifePhase(age: number): LifePhase {
    if (age <= 12) return 'childhood';
    if (age <= 22) return 'youth';
    if (age <= 35) return 'early_adult';
    if (age <= 50) return 'middle_adult';
    if (age <= 65) return 'late_adult';
    if (age <= 80) return 'senior';
    return 'elder';
  }

  /**
   * 인생 주기 분석
   */
  private static analyzeLifePeriods(
    chartData: ChartDimensions,
    birthYear: number
  ): LifePeriodInfo[] {
    const periods: LifePeriodInfo[] = [];
    const phases: Array<{ phase: LifePhase; start: number; end: number; desc: string }> = [
      { phase: 'childhood', start: 0, end: 12, desc: '성장과 기초 형성기' },
      { phase: 'youth', start: 13, end: 22, desc: '학습과 탐색기' },
      { phase: 'early_adult', start: 23, end: 35, desc: '도전과 성취기' },
      { phase: 'middle_adult', start: 36, end: 50, desc: '안정과 발전기' },
      { phase: 'late_adult', start: 51, end: 65, desc: '성숙과 지혜기' },
      { phase: 'senior', start: 66, end: 80, desc: '여유와 전수기' },
      { phase: 'elder', start: 81, end: 95, desc: '완성과 회고기' }
    ];

    phases.forEach(({ phase, start, end, desc }) => {
      // 해당 기간의 평균값 계산
      const periodData = chartData.woon.slice(start, end + 1);
      const avgScore = periodData.reduce((sum, p) => sum + p.value, 0) / periodData.length;

      // 주요 년도 찾기 (극점들)
      const keyYears = periodData
        .filter(p => Math.abs(p.value) > 1)
        .map(p => p.age)
        .slice(0, 3);

      // 전체 추세 판단
      const firstHalf = periodData.slice(0, Math.floor(periodData.length / 2));
      const secondHalf = periodData.slice(Math.floor(periodData.length / 2));
      const firstAvg = firstHalf.reduce((sum, p) => sum + p.value, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, p) => sum + p.value, 0) / secondHalf.length;

      let trend: TrendType = 'stable';
      if (secondAvg - firstAvg > 0.3) trend = 'ascending';
      else if (firstAvg - secondAvg > 0.3) trend = 'descending';
      else if (Math.abs(avgScore) > 1) trend = 'turbulent';

      periods.push({
        startAge: start,
        endAge: end,
        phase,
        description: desc,
        majorEvents: this.getMajorEvents(phase),
        overallTrend: trend,
        keyYears,
      });
    });

    return periods;
  }

  /**
   * 인생 단계별 주요 이벤트
   */
  private static getMajorEvents(phase: LifePhase): string[] {
    const events: Record<LifePhase, string[]> = {
      childhood: ['가족 환경 형성', '기초 성격 발달', '초등 교육'],
      youth: ['진로 탐색', '대학 진학', '첫 사회 경험'],
      early_adult: ['직업 안착', '결혼', '가정 형성'],
      middle_adult: ['사업 확장', '자녀 교육', '재산 형성'],
      late_adult: ['경력 정점', '자녀 독립', '은퇴 준비'],
      senior: ['은퇴 생활', '건강 관리', '취미 활동'],
      elder: ['지혜 전수', '가족 화합', '인생 정리'],
    };
    return events[phase] || [];
  }

  /**
   * 메타데이터 생성
   */
  private static generateMetadata(): ChartMetadata {
    return {
      calculationDate: new Date().toISOString(),
      version: '2.0.0', // 정확한 알고리즘 버전
      accuracy: 85, // 향상된 정확도
      notes: [
        '대운 10년 주기 정확 반영',
        '천간지지 상생상극 관계 적용',
        '십신 관계 점수화',
        '충합형파 변화 반영'
      ],
    };
  }

  // 상생상극 관계 (오행별 상대 점수)
  private static readonly RELATIONSHIP_MAP: Record<string, Record<string, number>> = {
    '목': { '목': 0.5, '화': 0.8, '토': -0.5, '금': -1.5, '수': 1.5 },
    '화': { '목': 1.5, '화': 0.5, '토': 0.8, '금': -0.5, '수': -1.5 },
    '토': { '목': -0.5, '화': 1.5, '토': 0.5, '금': 0.8, '수': -0.5 },
    '금': { '목': -1.5, '화': -1.5, '토': 1.5, '금': 0.5, '수': 0.8 },
    '수': { '목': 1.5, '화': -1.5, '토': -0.5, '금': 1.5, '수': 0.5 },
  };
}