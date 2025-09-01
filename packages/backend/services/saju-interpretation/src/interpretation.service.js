/**
 * 해석 서비스
 * 사주 데이터를 받아서 5대 고전 이론에 기반한 해석을 생성하는 서비스
 */

const dataLoaderService = require('./data-loader.service');

class InterpretationService {
  constructor() {
    this.dataLoader = dataLoaderService;
  }

  /**
   * 종합 해석 생성
   */
  async generateComprehensiveInterpretation(sajuData) {
    // 데이터 로드 확인
    await this.dataLoader.loadAllData();

    const interpretation = {
      basic: this.generateBasicAnalysis(sajuData),
      johoo: this.generateJohooAnalysis(sajuData),
      spiritual: this.generateSpiritualAnalysis(sajuData),
      philosophy: this.generatePhilosophicalInsight(sajuData),
      practical: this.generatePracticalGuidance(sajuData),
      personality: this.generatePersonalityAnalysis(sajuData),
      fortune: this.generateFortuneAnalysis(sajuData),
      career: this.generateCareerGuidance(sajuData),
      relationship: this.generateRelationshipAnalysis(sajuData),
      health: this.generateHealthGuidance(sajuData)
    };

    return interpretation;
  }

  /**
   * 기본 분석 생성
   */
  generateBasicAnalysis(sajuData) {
    const yongshinTheory = this.dataLoader.getYongshinTheory();
    const gyeokgukTheory = this.dataLoader.getGyeokgukTheory();
    
    return {
      dayMaster: sajuData.dayMaster || '일간 정보 없음',
      dayMasterStrength: this.analyzeDayMasterStrength(sajuData),
      yongshin: this.determineYongshin(sajuData, yongshinTheory),
      gyeokguk: this.determineGyeokguk(sajuData, gyeokgukTheory),
      summary: this.generateBasicSummary(sajuData)
    };
  }

  /**
   * 조후 분석 생성
   */
  generateJohooAnalysis(sajuData) {
    const birthMonth = sajuData.birthInfo?.month || 1;
    const season = this.determineSeason(birthMonth);
    const seasonalJohoo = this.dataLoader.getSeasonalJohoo(season);
    const monthlyJohoo = this.dataLoader.getMonthlyJohoo(birthMonth);

    return {
      season: season,
      seasonalCharacteristics: seasonalJohoo?.climate_characteristics || [],
      johooNeeds: seasonalJohoo?.johoo_needs || {},
      monthlyDetails: monthlyJohoo || {},
      recommendations: this.generateJohooRecommendations(sajuData, seasonalJohoo),
      careerGuidance: this.generateJohooCareerGuidance(season)
    };
  }

  /**
   * 신살 분석 생성
   */
  generateSpiritualAnalysis(sajuData) {
    const spirits = this.dataLoader.getSpiritualInfluences();
    const detectedSpirits = this.detectSpirits(sajuData);
    
    return {
      beneficialSpirits: detectedSpirits.beneficial,
      harmfulSpirits: detectedSpirits.harmful,
      dominantInfluence: this.determineDominantSpirit(detectedSpirits),
      mitigation: this.generateSpiritMitigation(detectedSpirits.harmful),
      activation: this.generateSpiritActivation(detectedSpirits.beneficial)
    };
  }

  /**
   * 철학적 통찰 생성
   */
  generatePhilosophicalInsight(sajuData) {
    const principles = this.dataLoader.getPhilosophicalPrinciples();
    
    return {
      cosmicHarmony: this.analyzeCosmicHarmony(sajuData, principles),
      yinYangBalance: this.analyzeYinYangBalance(sajuData),
      fiveElementsWisdom: this.generateFiveElementsWisdom(sajuData),
      lifePhilosophy: this.generateLifePhilosophy(sajuData),
      paradoxicalWisdom: this.generateParadoxicalWisdom(sajuData)
    };
  }

  /**
   * 실용적 지침 생성
   */
  generatePracticalGuidance(sajuData) {
    const sigyeol = this.dataLoader.getSigyeolFormulas();
    const examples = this.dataLoader.getExamples();
    
    return {
      immediateActions: this.generateImmediateActions(sajuData),
      shortTermGoals: this.generateShortTermGoals(sajuData),
      longTermStrategy: this.generateLongTermStrategy(sajuData),
      timingAdvice: this.generateTimingAdvice(sajuData),
      similarCases: this.findSimilarCases(sajuData, examples)
    };
  }

  /**
   * 성격 분석 생성
   */
  generatePersonalityAnalysis(sajuData) {
    const dominantTenGod = this.findDominantTenGod(sajuData);
    const dominantElement = this.findDominantElement(sajuData);
    
    const tenGodPersonality = this.dataLoader.getTenGodPersonality(dominantTenGod);
    const elementPersonality = this.dataLoader.getFiveElementPersonality(dominantElement);
    
    return {
      dominantTraits: {
        tenGod: tenGodPersonality?.traits || {},
        element: elementPersonality?.personality || []
      },
      strengths: this.identifyStrengths(sajuData, tenGodPersonality, elementPersonality),
      weaknesses: this.identifyWeaknesses(sajuData, tenGodPersonality, elementPersonality),
      developmentAreas: this.identifyDevelopmentAreas(sajuData),
      recommendations: this.generatePersonalityRecommendations(sajuData)
    };
  }

  /**
   * 운세 분석 생성
   */
  generateFortuneAnalysis(sajuData) {
    const fortuneRules = this.dataLoader.getFortuneRules();
    const currentYear = new Date().getFullYear();
    
    return {
      currentYear: {
        year: currentYear,
        favorability: this.analyzeYearlyFortune(sajuData, currentYear),
        opportunities: this.identifyOpportunities(sajuData, currentYear),
        challenges: this.identifyChallenges(sajuData, currentYear)
      },
      monthlyTrends: this.generateMonthlyTrends(sajuData),
      luckyElements: this.identifyLuckyElements(sajuData),
      cautionPeriods: this.identifyCautionPeriods(sajuData)
    };
  }

  /**
   * 직업 지도 생성
   */
  generateCareerGuidance(sajuData) {
    const careerRules = this.dataLoader.getCareerRules();
    const yongshin = this.determineYongshin(sajuData);
    
    return {
      suitableCareers: this.identifySuitableCareers(sajuData, careerRules),
      avoidCareers: this.identifyAvoidCareers(sajuData, careerRules),
      careerTiming: this.analyzeCareerTiming(sajuData),
      successFactors: this.identifySuccessFactors(sajuData),
      workEnvironment: this.recommendWorkEnvironment(sajuData, yongshin)
    };
  }

  /**
   * 관계 분석 생성
   */
  generateRelationshipAnalysis(sajuData) {
    const relationshipRules = this.dataLoader.getRelationshipRules();
    
    return {
      marriageCompatibility: this.analyzeMarriageCompatibility(sajuData),
      relationshipPattern: this.identifyRelationshipPattern(sajuData),
      challenges: this.identifyRelationshipChallenges(sajuData),
      advice: this.generateRelationshipAdvice(sajuData, relationshipRules),
      timing: this.analyzeRelationshipTiming(sajuData)
    };
  }

  /**
   * 건강 지도 생성
   */
  generateHealthGuidance(sajuData) {
    const healthRules = this.dataLoader.getHealthRules();
    const weakElements = this.identifyWeakElements(sajuData);
    
    return {
      constitution: this.analyzeConstitution(sajuData, healthRules),
      vulnerabilities: this.identifyHealthVulnerabilities(sajuData, weakElements),
      preventiveCare: this.generatePreventiveCare(sajuData, healthRules),
      seasonalCare: this.generateSeasonalHealthCare(sajuData),
      lifestyle: this.recommendLifestyle(sajuData)
    };
  }

  // === 헬퍼 메서드들 ===

  /**
   * 일간 강약 분석
   */
  analyzeDayMasterStrength(sajuData) {
    // 간단한 강약 판별 로직
    const monthSupport = this.checkMonthSupport(sajuData);
    const rootStrength = this.checkRootStrength(sajuData);
    const helpingElements = this.countHelpingElements(sajuData);
    
    if (monthSupport && rootStrength && helpingElements > 2) {
      return 'strong';
    } else if (!monthSupport && helpingElements < 2) {
      return 'weak';
    }
    return 'neutral';
  }

  /**
   * 용신 결정
   */
  determineYongshin(sajuData, yongshinTheory) {
    const strength = this.analyzeDayMasterStrength(sajuData);
    const season = this.determineSeason(sajuData.birthInfo?.month || 1);
    
    if (!yongshinTheory) return '용신 데이터 없음';
    
    const seasonalInfluence = yongshinTheory.core_principles?.seasonal_influence?.[season];
    
    if (strength === 'strong') {
      return seasonalInfluence?.yongshin_priority?.[0] || '설기용신';
    } else if (strength === 'weak') {
      return '부조용신';
    }
    
    return '조후용신';
  }

  /**
   * 격국 결정
   */
  determineGyeokguk(sajuData, gyeokgukTheory) {
    // 간단한 격국 판별 로직
    const monthStem = sajuData.fourPillars?.month?.heavenly;
    
    if (!gyeokgukTheory || !monthStem) return '격국 미정';
    
    // 월간 기준 간단 판별
    const patterns = gyeokgukTheory.regular_patterns;
    
    // 실제로는 더 복잡한 로직 필요
    return '정관격'; // 예시
  }

  /**
   * 계절 판별
   */
  determineSeason(month) {
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'autumn';
    return 'winter';
  }

  /**
   * 신살 감지
   */
  detectSpirits(sajuData) {
    // 실제 신살 계산 로직 필요
    // 여기서는 예시로 간단히 처리
    return {
      beneficial: ['천을귀인', '문창귀인'],
      harmful: ['양인']
    };
  }

  /**
   * 주요 십성 찾기
   */
  findDominantTenGod(sajuData) {
    const tenGods = sajuData.tenGods;
    if (!tenGods) return 'bijeon';
    
    let maxValue = 0;
    let dominant = 'bijeon';
    
    for (const [key, value] of Object.entries(tenGods)) {
      if (value > maxValue) {
        maxValue = value;
        dominant = key;
      }
    }
    
    return dominant;
  }

  /**
   * 주요 오행 찾기
   */
  findDominantElement(sajuData) {
    const elements = sajuData.fiveElements;
    if (!elements) return 'wood';
    
    let maxValue = 0;
    let dominant = 'wood';
    
    for (const [key, value] of Object.entries(elements)) {
      if (value > maxValue) {
        maxValue = value;
        dominant = key;
      }
    }
    
    return dominant;
  }

  /**
   * 약한 오행 찾기
   */
  identifyWeakElements(sajuData) {
    const elements = sajuData.fiveElements;
    if (!elements) return [];
    
    const weak = [];
    for (const [key, value] of Object.entries(elements)) {
      if (value < 10) {
        weak.push(key);
      }
    }
    
    return weak;
  }

  /**
   * 기타 헬퍼 메서드들...
   * 실제 구현시 더 상세한 로직 필요
   */
  
  checkMonthSupport(sajuData) {
    // 월령 득령 여부 체크
    return true; // 예시
  }

  checkRootStrength(sajuData) {
    // 근의 강약 체크
    return true; // 예시
  }

  countHelpingElements(sajuData) {
    // 도움 주는 오행 개수
    return 3; // 예시
  }

  generateBasicSummary(sajuData) {
    return '종합적으로 균형잡힌 사주입니다.'; // 예시
  }

  generateJohooRecommendations(sajuData, seasonalJohoo) {
    return ['따뜻한 환경 유지', '충분한 수분 섭취']; // 예시
  }

  generateJohooCareerGuidance(season) {
    const guidance = {
      spring: ['성장산업', '교육', '환경'],
      summer: ['IT', '서비스', '엔터테인먼트'],
      autumn: ['금융', '의료', '정밀산업'],
      winter: ['에너지', '난방', '문화산업']
    };
    
    return guidance[season] || [];
  }

  determineDominantSpirit(detectedSpirits) {
    // 가장 영향력 있는 신살 결정
    if (detectedSpirits.beneficial.includes('천을귀인')) {
      return '천을귀인';
    }
    return detectedSpirits.beneficial[0] || detectedSpirits.harmful[0] || '없음';
  }

  generateSpiritMitigation(harmfulSpirits) {
    // 흉신 대응책
    const mitigations = [];
    if (harmfulSpirits.includes('양인')) {
      mitigations.push('인성으로 양인 완화', '수양과 인내심 기르기');
    }
    return mitigations;
  }

  generateSpiritActivation(beneficialSpirits) {
    // 길신 활성화 방법
    const activations = [];
    if (beneficialSpirits.includes('문창귀인')) {
      activations.push('학습과 연구 활동', '글쓰기나 창작 활동');
    }
    return activations;
  }

  analyzeCosmicHarmony(sajuData, principles) {
    // 천지인 조화 분석
    return {
      heaven: '천간 조화 양호',
      earth: '지지 안정적',
      human: '간지 조합 균형',
      overall: '전체적으로 조화로움'
    };
  }

  analyzeYinYangBalance(sajuData) {
    // 음양 균형 분석
    return {
      yinCount: 4,
      yangCount: 4,
      balance: 'perfect',
      recommendation: '현재 균형 유지'
    };
  }

  generateFiveElementsWisdom(sajuData) {
    // 오행 지혜
    return '목화토금수가 조화를 이루어 안정적인 발전 가능';
  }

  generateLifePhilosophy(sajuData) {
    // 인생 철학
    return '균형과 조화를 추구하며 꾸준히 발전하는 삶';
  }

  generateParadoxicalWisdom(sajuData) {
    // 역설적 지혜
    return '약점이 때로는 강점이 될 수 있음을 인식';
  }

  generateImmediateActions(sajuData) {
    return ['건강 관리 시작', '인간관계 정리'];
  }

  generateShortTermGoals(sajuData) {
    return ['3개월 내 자격증 취득', '6개월 내 이직 준비'];
  }

  generateLongTermStrategy(sajuData) {
    return '5년 후 독립 사업 준비';
  }

  generateTimingAdvice(sajuData) {
    return '내년 봄이 중요한 전환점';
  }

  findSimilarCases(sajuData, examples) {
    // 유사 사례 찾기
    return [];
  }

  identifyStrengths(sajuData) {
    return ['리더십', '창의성', '인내심'];
  }

  identifyWeaknesses(sajuData) {
    return ['성급함', '고집'];
  }

  identifyDevelopmentAreas(sajuData) {
    return ['유연성 개발', '소통 능력 향상'];
  }

  generatePersonalityRecommendations(sajuData) {
    return ['장점을 살린 리더 역할', '단점 보완을 위한 명상'];
  }

  analyzeYearlyFortune(sajuData, year) {
    return 'favorable'; // 예시
  }

  identifyOpportunities(sajuData, year) {
    return ['승진 기회', '새로운 만남'];
  }

  identifyChallenges(sajuData, year) {
    return ['건강 주의', '재정 관리'];
  }

  generateMonthlyTrends(sajuData) {
    return Array(12).fill(null).map((_, i) => ({
      month: i + 1,
      trend: 'stable'
    }));
  }

  identifyLuckyElements(sajuData) {
    return ['fire', 'earth'];
  }

  identifyCautionPeriods(sajuData) {
    return ['7월', '11월'];
  }

  identifySuitableCareers(sajuData, rules) {
    return ['관리직', '교육자', '컨설턴트'];
  }

  identifyAvoidCareers(sajuData, rules) {
    return ['극단적 위험 직종'];
  }

  analyzeCareerTiming(sajuData) {
    return '35-45세가 최고 전성기';
  }

  identifySuccessFactors(sajuData) {
    return ['인맥 활용', '전문성 개발'];
  }

  recommendWorkEnvironment(sajuData, yongshin) {
    return '밝고 따뜻한 사무실 환경';
  }

  analyzeMarriageCompatibility(sajuData) {
    return {
      bestMatch: '토일간 배우자',
      avoid: '강한 목일간'
    };
  }

  identifyRelationshipPattern(sajuData) {
    return '안정적이고 장기적인 관계 선호';
  }

  identifyRelationshipChallenges(sajuData) {
    return ['의사소통 부족', '감정 표현 어려움'];
  }

  generateRelationshipAdvice(sajuData, rules) {
    return ['적극적인 소통', '감정 표현 연습'];
  }

  analyzeRelationshipTiming(sajuData) {
    return '30대 초반이 최적기';
  }

  analyzeConstitution(sajuData, rules) {
    return '화기 체질로 활동적';
  }

  identifyHealthVulnerabilities(sajuData, weakElements) {
    return ['심혈관계', '소화기계'];
  }

  generatePreventiveCare(sajuData, rules) {
    return ['규칙적 운동', '스트레스 관리'];
  }

  generateSeasonalHealthCare(sajuData) {
    return {
      spring: '알레르기 주의',
      summer: '수분 섭취',
      autumn: '호흡기 관리',
      winter: '보온 유지'
    };
  }

  recommendLifestyle(sajuData) {
    return ['규칙적 생활', '명상과 요가'];
  }
}

// 싱글톤 인스턴스 생성
const interpretationService = new InterpretationService();

module.exports = interpretationService;