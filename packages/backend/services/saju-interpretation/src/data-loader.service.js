/**
 * 데이터 로더 서비스
 * 5대 고전 JSON 데이터베이스를 로드하고 관리하는 서비스
 */

const fs = require('fs-extra');
const path = require('path');

class DataLoaderService {
  constructor() {
    this.dataPath = path.join(__dirname, '../../../data');
    this.cache = {};
    this.isLoaded = false;
  }

  /**
   * 모든 데이터베이스 파일 로드
   */
  async loadAllData() {
    if (this.isLoaded) {
      return this.cache;
    }

    try {
      // 자평진전 + 궁통보감 통합 이론
      this.cache.japyeongTheories = await this.loadJsonFile('japyeong-theories.json');
      
      // 해석 규칙 시스템
      this.cache.interpretationRules = await this.loadJsonFile('interpretation-rules.json');
      
      // 실제 사례 데이터베이스
      this.cache.examples = await this.loadJsonFile('examples.json');
      
      // 삼명통회 신살론
      this.cache.spiritualInfluences = await this.loadJsonFile('spiritual-influences.json');
      
      // 적천수 철학 원리
      this.cache.jeokcheonsuPhilosophy = await this.loadJsonFile('jeokcheonsu-philosophy.json');
      
      // 연해자평 시결론 및 통합
      this.cache.yeonhaeSigyeol = await this.loadJsonFile('yeonhae-sigyeol.json');

      this.isLoaded = true;
      console.log('✅ 모든 사주 해석 데이터베이스 로드 완료');
      
      return this.cache;
    } catch (error) {
      console.error('❌ 데이터 로드 실패:', error);
      throw error;
    }
  }

  /**
   * JSON 파일 로드 헬퍼
   */
  async loadJsonFile(filename) {
    const filePath = path.join(this.dataPath, filename);
    try {
      const data = await fs.readJson(filePath);
      console.log(`✅ ${filename} 로드 성공`);
      return data;
    } catch (error) {
      console.error(`❌ ${filename} 로드 실패:`, error);
      throw error;
    }
  }

  /**
   * 용신론 데이터 가져오기
   */
  getYongshinTheory() {
    return this.cache.japyeongTheories?.yongshin_theory || null;
  }

  /**
   * 격국론 데이터 가져오기
   */
  getGyeokgukTheory() {
    return this.cache.japyeongTheories?.gyeogguk_theory || null;
  }

  /**
   * 조후론 데이터 가져오기
   */
  getJohooTheory() {
    return this.cache.japyeongTheories?.goongtong_johoo_theory || null;
  }

  /**
   * 신살 데이터 가져오기
   */
  getSpiritualInfluences() {
    return {
      beneficial: this.cache.spiritualInfluences?.beneficial_spirits || {},
      harmful: this.cache.spiritualInfluences?.harmful_spirits || {}
    };
  }

  /**
   * 철학적 원리 가져오기
   */
  getPhilosophicalPrinciples() {
    return this.cache.jeokcheonsuPhilosophy?.fundamental_principles || null;
  }

  /**
   * 시결론 공식 가져오기
   */
  getSigyeolFormulas() {
    return this.cache.yeonhaeSigyeol?.yeonhae_sigyeol_theory || null;
  }

  /**
   * 성격 해석 규칙 가져오기
   */
  getPersonalityRules() {
    return this.cache.interpretationRules?.personality_interpretation || null;
  }

  /**
   * 운세 해석 규칙 가져오기
   */
  getFortuneRules() {
    return this.cache.interpretationRules?.fortune_interpretation || null;
  }

  /**
   * 직업 해석 규칙 가져오기
   */
  getCareerRules() {
    return this.cache.interpretationRules?.career_interpretation || null;
  }

  /**
   * 건강 해석 규칙 가져오기
   */
  getHealthRules() {
    return this.cache.interpretationRules?.health_interpretation || null;
  }

  /**
   * 관계 해석 규칙 가져오기
   */
  getRelationshipRules() {
    return this.cache.interpretationRules?.relationship_interpretation || null;
  }

  /**
   * 실제 사례 예제 가져오기
   */
  getExamples(patternType = null) {
    if (!patternType) {
      return this.cache.examples || null;
    }
    
    return this.cache.examples?.[patternType] || null;
  }

  /**
   * 계절별 조후 정보 가져오기
   */
  getSeasonalJohoo(season) {
    const johooTheory = this.getJohooTheory();
    if (!johooTheory) return null;

    const seasonalData = johooTheory.core_principles?.seasonal_climate_analysis;
    
    switch(season) {
      case 'spring':
        return seasonalData?.spring_johoo;
      case 'summer':
        return seasonalData?.summer_johoo;
      case 'autumn':
        return seasonalData?.autumn_johoo;
      case 'winter':
        return seasonalData?.winter_johoo;
      default:
        return null;
    }
  }

  /**
   * 월별 상세 조후 정보 가져오기
   */
  getMonthlyJohoo(lunarMonth) {
    const johooTheory = this.getJohooTheory();
    if (!johooTheory) return null;

    return johooTheory.monthly_detailed_johoo?.[`lunar_month_${lunarMonth}`] || null;
  }

  /**
   * 특정 신살 정보 가져오기
   */
  getSpiritInfo(spiritName, type = 'beneficial') {
    const spirits = this.getSpiritualInfluences();
    
    if (type === 'beneficial') {
      // 길신 카테고리들 검색
      for (const category of Object.values(spirits.beneficial || {})) {
        if (category[spiritName]) {
          return category[spiritName];
        }
      }
    } else {
      // 흉신 카테고리들 검색
      for (const category of Object.values(spirits.harmful || {})) {
        if (category[spiritName]) {
          return category[spiritName];
        }
      }
    }
    
    return null;
  }

  /**
   * 십성별 성격 해석 가져오기
   */
  getTenGodPersonality(tenGodName) {
    const rules = this.getPersonalityRules();
    if (!rules) return null;

    return rules.ten_gods_dominant?.[`${tenGodName}_strong`] || null;
  }

  /**
   * 오행별 성격 해석 가져오기
   */
  getFiveElementPersonality(element) {
    const rules = this.getPersonalityRules();
    if (!rules) return null;

    return rules.five_elements_balance?.[`${element}_dominant`] || null;
  }

  /**
   * 캐시 초기화
   */
  clearCache() {
    this.cache = {};
    this.isLoaded = false;
    console.log('✅ 데이터 캐시 초기화 완료');
  }

  /**
   * 데이터 재로드
   */
  async reloadData() {
    this.clearCache();
    return await this.loadAllData();
  }
}

// 싱글톤 인스턴스 생성
const dataLoaderService = new DataLoaderService();

module.exports = dataLoaderService;