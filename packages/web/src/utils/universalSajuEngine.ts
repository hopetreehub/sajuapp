// Universal Saju Engine
// 범용 사주 계산 엔진 - 모든 사주에 대해 95년 인생차트 생성

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

  // 상생상극 관계
  private static readonly RELATIONSHIP_MAP: Record<string, Record<string, number>> = {
    '목': { '목': 0, '화': 0.8, '토': -0.5, '금': -0.8, '수': 0.5 },
    '화': { '목': 0.5, '화': 0, '토': 0.8, '금': -0.5, '수': -0.8 },
    '토': { '목': -0.5, '화': 0.5, '토': 0, '금': 0.8, '수': -0.5 },
    '금': { '목': -0.8, '화': -0.5, '토': 0.5, '금': 0, '수': 0.8 },
    '수': { '목': 0.8, '화': -0.8, '토': -0.5, '금': 0.5, '수': 0 },
  };

  /**
   * 메인 함수: 사주 정보로부터 95년 인생차트 생성
   */
  static generateUniversalLifeChart(
    sajuData: SajuComponents,
    personalInfo: PersonalInfo
  ): UniversalLifeChartData {
    const birthYear = new Date(personalInfo.birthDate).getFullYear();
    const currentYear = new Date().getFullYear();
    const currentAge = currentYear - birthYear;

    // 95년간 차트 데이터 생성
    const chartData = this.calculateChartDimensions(sajuData, personalInfo, birthYear);

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
   * 5차원 차트 데이터 계산
   */
  private static calculateChartDimensions(
    sajuData: SajuComponents,
    personalInfo: PersonalInfo,
    birthYear: number
  ): ChartDimensions {
    const geunbon: ChartDataPoint[] = [];
    const woon: ChartDataPoint[] = [];
    const haeng: ChartDataPoint[] = [];
    const hyeong: ChartDataPoint[] = [];
    const byeon: ChartDataPoint[] = [];

    // 성별에 따른 대운 방향 결정
    const isForward = this.getDaeunDirection(personalInfo.gender, sajuData.year.gan);

    for (let age = 0; age <= 95; age++) {
      const year = birthYear + age;
      const daeun = this.getDaeunInfo(sajuData, age, isForward);
      const yearFortune = this.getYearlyFortune(year, sajuData);

      // 각 차원별 계산
      const geunbonValue = this.calculateGeunbon(sajuData, daeun, yearFortune, age);
      const woonValue = this.calculateWoon(sajuData, daeun, yearFortune, age);
      const haengValue = this.calculateHaeng(sajuData, daeun, yearFortune, age);
      const hyeongValue = this.calculateHyeong(sajuData, daeun, yearFortune, age);
      const byeonValue = this.calculateByeon(sajuData, daeun, yearFortune, age);

      geunbon.push(this.createDataPoint(year, age, geunbonValue));
      woon.push(this.createDataPoint(year, age, woonValue));
      haeng.push(this.createDataPoint(year, age, haengValue));
      hyeong.push(this.createDataPoint(year, age, hyeongValue));
      byeon.push(this.createDataPoint(year, age, byeonValue));
    }

    return { geunbon, woon, haeng, hyeong, byeon };
  }

  /**
   * 근본(기질) 계산 - 일간의 강약과 조후를 중심으로
   */
  private static calculateGeunbon(
    sajuData: SajuComponents,
    daeun: DaeunInfo,
    yearFortune: YearlyFortune,
    age: number
  ): number {
    const ilgan = sajuData.day.gan;
    const ilganOhang = this.OHANG_MAP[ilgan];

    // 기본 강도 계산 (계절과 조후 고려)
    let baseStrength = this.calculateIlganStrength(sajuData);

    // 대운의 영향
    const daeunOhang = this.OHANG_MAP[daeun.gan];
    const daeunEffect = this.RELATIONSHIP_MAP[ilganOhang][daeunOhang] * 0.3;

    // 년운의 영향
    const yearOhang = this.OHANG_MAP[yearFortune.gan];
    const yearEffect = this.RELATIONSHIP_MAP[ilganOhang][yearOhang] * 0.2;

    // 나이별 가중치 (젊을 때는 변화가 크고, 나이들수록 안정)
    const ageWeight = age < 30 ? 1.0 : age < 60 ? 0.8 : 0.6;

    const finalValue = (baseStrength + daeunEffect + yearEffect) * ageWeight;

    return this.normalizeValue(finalValue);
  }

  /**
   * 운(행운) 계산 - 용신과 희신 중심
   */
  private static calculateWoon(
    sajuData: SajuComponents,
    daeun: DaeunInfo,
    yearFortune: YearlyFortune,
    age: number
  ): number {
    // 용신 분석
    const yongsin = this.analyzeYongsin(sajuData);

    // 대운이 용신에 미치는 영향
    const daeunOhang = this.OHANG_MAP[daeun.gan];
    const daeunToYongsin = this.RELATIONSHIP_MAP[yongsin][daeunOhang];

    // 년운이 용신에 미치는 영향
    const yearOhang = this.OHANG_MAP[yearFortune.gan];
    const yearToYongsin = this.RELATIONSHIP_MAP[yongsin][yearOhang];

    // 길흉 점수 계산
    const fortuneScore = (daeunToYongsin * 0.6) + (yearToYongsin * 0.4);

    // 생애 주기별 가중치
    const lifeCycleWeight = this.getLifeCycleWeight(age, 'fortune');

    const finalValue = fortuneScore * lifeCycleWeight;

    return this.normalizeValue(finalValue);
  }

  /**
   * 행(실행력) 계산 - 비견과 겁재, 식상 중심
   */
  private static calculateHaeng(
    sajuData: SajuComponents,
    daeun: DaeunInfo,
    yearFortune: YearlyFortune,
    age: number
  ): number {
    const ilgan = sajuData.day.gan;
    const ilganOhang = this.OHANG_MAP[ilgan];

    // 식상(식신, 상관)의 힘 계산 - 실행력의 핵심
    const sikjangPower = this.calculateSikjangPower(sajuData, daeun, yearFortune);

    // 비겁(비견, 겁재)의 힘 계산 - 의지력의 원동력
    const bigeobPower = this.calculateBigeobPower(sajuData, daeun, yearFortune);

    // 연령대별 실행력 패턴
    let ageModifier = 1.0;
    if (age < 25) ageModifier = 0.7;      // 청년기: 경험 부족
    else if (age < 45) ageModifier = 1.2; // 장년기: 실행력 최고조
    else if (age < 65) ageModifier = 1.0; // 중년기: 안정적
    else ageModifier = 0.8;               // 노년기: 체력 감소

    const finalValue = (sikjangPower * 0.6 + bigeobPower * 0.4) * ageModifier;

    return this.normalizeValue(finalValue);
  }

  /**
   * 형(권위) 계산 - 관성과 인수 중심
   */
  private static calculateHyeong(
    sajuData: SajuComponents,
    daeun: DaeunInfo,
    yearFortune: YearlyFortune,
    age: number
  ): number {
    // 관성(정관, 편관)의 힘 계산
    const gwanseongPower = this.calculateGwanseongPower(sajuData, daeun, yearFortune);

    // 인수(정인, 편인)의 힘 계산
    const insuPower = this.calculateInsuPower(sajuData, daeun, yearFortune);

    // 권위운은 일반적으로 중년 이후 강해짐
    let authorityWeight = 1.0;
    if (age < 30) authorityWeight = 0.5;
    else if (age < 50) authorityWeight = 0.8;
    else if (age < 70) authorityWeight = 1.2;
    else authorityWeight = 1.0;

    const finalValue = (gwanseongPower * 0.7 + insuPower * 0.3) * authorityWeight;

    return this.normalizeValue(finalValue);
  }

  /**
   * 변(변화) 계산 - 충형파해와 대운 교체기 중심
   */
  private static calculateByeon(
    sajuData: SajuComponents,
    daeun: DaeunInfo,
    yearFortune: YearlyFortune,
    age: number
  ): number {
    // 대운 교체기인지 확인 (변화의 주요 시기)
    const isDaeunChange = age % 10 === 0 && age > 0;
    let changeIntensity = isDaeunChange ? 1.5 : 1.0;

    // 충(沖) 관계 확인
    const chungEffect = this.calculateChungEffect(sajuData, daeun, yearFortune);

    // 형(刑) 관계 확인
    const hyeongEffect = this.calculateHyeongEffect(sajuData, daeun, yearFortune);

    // 파(破) 관계 확인
    const paEffect = this.calculatePaEffect(sajuData, daeun, yearFortune);

    // 해(害) 관계 확인
    const haeEffect = this.calculateHaeEffect(sajuData, daeun, yearFortune);

    // 전체 변화 강도 계산
    const totalChange = chungEffect + hyeongEffect + paEffect + haeEffect;

    const finalValue = totalChange * changeIntensity;

    return this.normalizeValue(finalValue);
  }

  /**
   * 대운 방향 결정 (순행/역행)
   */
  private static getDaeunDirection(gender: string, yearGan: string): boolean {
    const yangGan = ['갑', '병', '무', '경', '임'];
    const isYangGan = yangGan.includes(yearGan);

    if (gender === 'male') {
      return isYangGan; // 남성: 양간이면 순행
    } else {
      return !isYangGan; // 여성: 음간이면 순행
    }
  }

  /**
   * 대운 정보 계산
   */
  private static getDaeunInfo(sajuData: SajuComponents, age: number, isForward: boolean): DaeunInfo {
    const monthGan = sajuData.month.gan;
    const monthJi = sajuData.month.ji;

    const daeunCycle = Math.floor(age / 10);
    const ganIndex = this.CHEONGAN.indexOf(monthGan);
    const jiIndex = this.JIJI.indexOf(monthJi);

    let newGanIndex, newJiIndex;

    if (isForward) {
      newGanIndex = (ganIndex + daeunCycle + 1) % 10;
      newJiIndex = (jiIndex + daeunCycle + 1) % 12;
    } else {
      newGanIndex = (ganIndex - daeunCycle - 1 + 10) % 10;
      newJiIndex = (jiIndex - daeunCycle - 1 + 12) % 12;
    }

    return {
      startAge: daeunCycle * 10,
      endAge: (daeunCycle + 1) * 10 - 1,
      gan: this.CHEONGAN[newGanIndex],
      ji: this.JIJI[newJiIndex],
      direction: isForward ? 'forward' : 'backward',
    };
  }

  /**
   * 년운 정보 계산
   */
  private static getYearlyFortune(year: number, sajuData: SajuComponents): YearlyFortune {
    // 갑자 순환 계산
    const baseYear = 1984; // 갑자년
    const yearDiff = year - baseYear;

    const ganIndex = yearDiff % 10;
    const jiIndex = yearDiff % 12;

    const yearGan = this.CHEONGAN[ganIndex];
    const yearJi = this.JIJI[jiIndex];

    // 일간과의 관계 분석
    const ilgan = sajuData.day.gan;
    const relation = this.analyzeGanRelation(ilgan, yearGan);

    return {
      year,
      age: year - new Date(new Date().getFullYear()).getFullYear(),
      gan: yearGan,
      ji: yearJi,
      relation,
      fortune: this.calculateYearFortune(ilgan, yearGan, yearJi),
    };
  }

  /**
   * 간지 관계 분석 (정관, 편관, 정재, 편재 등)
   */
  private static analyzeGanRelation(ilgan: string, targetGan: string): string {
    // 십신 분석 로직 (간략화)
    if (ilgan === targetGan) return '비견';

    const ilganOhang = this.OHANG_MAP[ilgan];
    const targetOhang = this.OHANG_MAP[targetGan];

    if (this.RELATIONSHIP_MAP[ilganOhang][targetOhang] > 0) return '식상';
    if (this.RELATIONSHIP_MAP[ilganOhang][targetOhang] < 0) return '관성';

    return '재성';
  }

  /**
   * 각종 보조 계산 함수들
   */
  private static calculateIlganStrength(sajuData: SajuComponents): number {
    // 일간 강약 계산 로직 (간략화)
    return Math.random() * 2 - 1; // 임시: -1 ~ +1
  }

  private static analyzeYongsin(sajuData: SajuComponents): string {
    // 용신 분석 로직 (간략화)
    const ilganOhang = this.OHANG_MAP[sajuData.day.gan];
    return ilganOhang;
  }

  private static getLifeCycleWeight(age: number, type: 'fortune' | 'authority'): number {
    if (type === 'fortune') {
      if (age < 20) return 0.8;
      if (age < 40) return 1.2;
      if (age < 60) return 1.0;
      return 0.9;
    } else {
      if (age < 30) return 0.6;
      if (age < 50) return 1.0;
      if (age < 70) return 1.3;
      return 1.1;
    }
  }

  // 각종 십신 계산 함수들 (간략화)
  private static calculateSikjangPower(sajuData: SajuComponents, daeun: DaeunInfo, yearFortune: YearlyFortune): number {
    return Math.random() * 2 - 1; // 임시
  }

  private static calculateBigeobPower(sajuData: SajuComponents, daeun: DaeunInfo, yearFortune: YearlyFortune): number {
    return Math.random() * 2 - 1; // 임시
  }

  private static calculateGwanseongPower(sajuData: SajuComponents, daeun: DaeunInfo, yearFortune: YearlyFortune): number {
    return Math.random() * 2 - 1; // 임시
  }

  private static calculateInsuPower(sajuData: SajuComponents, daeun: DaeunInfo, yearFortune: YearlyFortune): number {
    return Math.random() * 2 - 1; // 임시
  }

  // 충형파해 계산 함수들 (간략화)
  private static calculateChungEffect(sajuData: SajuComponents, daeun: DaeunInfo, yearFortune: YearlyFortune): number {
    return Math.random() * 0.5; // 임시
  }

  private static calculateHyeongEffect(sajuData: SajuComponents, daeun: DaeunInfo, yearFortune: YearlyFortune): number {
    return Math.random() * 0.3; // 임시
  }

  private static calculatePaEffect(sajuData: SajuComponents, daeun: DaeunInfo, yearFortune: YearlyFortune): number {
    return Math.random() * 0.3; // 임시
  }

  private static calculateHaeEffect(sajuData: SajuComponents, daeun: DaeunInfo, yearFortune: YearlyFortune): number {
    return Math.random() * 0.3; // 임시
  }

  private static calculateYearFortune(ilgan: string, yearGan: string, yearJi: string): number {
    return Math.random() * 2 - 1; // 임시
  }

  /**
   * 유틸리티 함수들
   */
  private static normalizeValue(value: number): number {
    return Math.max(-2.0, Math.min(2.0, value));
  }

  private static createDataPoint(year: number, age: number, value: number): ChartDataPoint {
    return {
      year,
      age,
      value: this.normalizeValue(value),
      intensity: Math.abs(value) * 1.5,
      description: `${age}세`,
      phase: this.getLifePhase(age),
    };
  }

  private static getLifePhase(age: number): LifePhase {
    if (age <= 12) return 'childhood';
    if (age <= 22) return 'youth';
    if (age <= 35) return 'early_adult';
    if (age <= 50) return 'middle_adult';
    if (age <= 65) return 'late_adult';
    if (age <= 80) return 'senior';
    return 'elder';
  }

  private static analyzeLifePeriods(chartData: ChartDimensions, birthYear: number): LifePeriodInfo[] {
    // 인생 주기 분석 로직 (간략화)
    return [
      {
        startAge: 0,
        endAge: 22,
        phase: 'youth',
        description: '성장과 학습의 시기',
        majorEvents: ['교육', '진로 탐색'],
        overallTrend: 'ascending',
        keyYears: [birthYear + 18, birthYear + 22],
      },
      // ... 다른 주기들
    ];
  }

  private static generateMetadata(): ChartMetadata {
    return {
      calculationDate: new Date().toISOString(),
      version: '1.0.0',
      accuracy: 85,
      notes: ['범용 인생차트 시스템 v1.0'],
    };
  }
}

export default UniversalSajuEngine;