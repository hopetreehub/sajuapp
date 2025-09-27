/**
 * 정통 사주학 계산기 테스트 및 검증
 * 박준수/정비제 테스트 케이스 실행
 */

import { AuthenticSajuCalculator } from './authenticSajuCalculator';
import { fetchLifetimeFortune } from '../services/lifetimeFortuneApi';

export class AuthenticSajuTest {
  /**
   * 박준수 테스트: 신해기해병오경인 (1971년생)
   * 예상 결과: 용신 목화, 목화운에서 75점+, 금수운에서 35점-
   */
  public static async testParkJunSoo(): Promise<void> {
    console.log('🧪 === 박준수 테스트 케이스 실행 ===');
    console.log('📋 사주: 신해기해병오경인 (1971년생)');

    try {
      // 1. 직접 계산기 테스트
      const 사주 = AuthenticSajuCalculator.createParkJunSooTestCase();
      const 결과 = AuthenticSajuCalculator.calculateAuthenticLifeChart(사주, 1971);

      console.log('✅ 직접 계산 결과:');
      console.log(`   격국: ${결과.개인정보.격국.격국유형} (일간강약: ${결과.개인정보.격국.일간강약})`);
      console.log(`   용신: [${결과.개인정보.용신.용신.join(', ')}]`);
      console.log(`   평균점수: ${결과.통계.평균점수}점`);

      // 2. API 테스트
      console.log('\n🔄 API 테스트 실행 중...');
      const apiResult = await fetchLifetimeFortune({
        year: 1971,
        month: 11, // 신해년 기해월
        day: 15,   // 추정
        hour: 11,  // 경인시 (오전 11시)
        isLunar: false,
        useAuthenticCalculator: true,
      });

      if (apiResult.success) {
        const 분석 = apiResult.data.analysis;
        console.log('✅ API 호출 성공:');
        console.log(`   평균점수: ${분석.averageScore}점`);
        console.log(`   최고점: ${분석.bestYear.age}세 (${분석.bestYear.score}점)`);
        console.log(`   최저점: ${분석.worstYear.age}세 (${분석.worstYear.score}점)`);

        // 용신 부합도 검증
        const lifetimeFortune = apiResult.data.lifetimeFortune;
        const 목화운점수 = this.analyzeFortuneTrend(lifetimeFortune, ['목', '화']);
        const 금수운점수 = this.analyzeFortuneTrend(lifetimeFortune, ['금', '수']);

        console.log('\n📊 용신 부합도 검증:');
        console.log(`   목화운 평균: ${목화운점수.평균점수}점 (${목화운점수.샘플수}개 샘플)`);
        console.log(`   금수운 평균: ${금수운점수.평균점수}점 (${금수운점수.샘플수}개 샘플)`);

        // 검증 결과
        const 목화운양호 = 목화운점수.평균점수 >= 60;
        const 금수운낮음 = 금수운점수.평균점수 <= 50;
        const 차이충분 = 목화운점수.평균점수 - 금수운점수.평균점수 >= 15;

        if (목화운양호 && 금수운낮음 && 차이충분) {
          console.log('✅ 박준수 테스트 PASS: 용신 목화 효과 확인됨');
        } else {
          console.log('❌ 박준수 테스트 FAIL: 용신 효과 미흡');
          console.log(`   목화운 양호: ${목화운양호}, 금수운 낮음: ${금수운낮음}, 차이 충분: ${차이충분}`);
        }
      } else {
        console.error('❌ API 호출 실패');
      }

    } catch (error) {
      console.error('❌ 박준수 테스트 오류:', error);
    }
  }

  /**
   * 정비제 테스트: 병진정유신미계사 (1976년생)
   * 예상 결과: 용신 수목, 수목운에서 75점+, 화토운에서 35점-
   */
  public static async testJeongBiJe(): Promise<void> {
    console.log('\n🧪 === 정비제 테스트 케이스 실행 ===');
    console.log('📋 사주: 병진정유신미계사 (1976년생)');

    try {
      // 1. 직접 계산기 테스트
      const 사주 = AuthenticSajuCalculator.createJeongBiJeTestCase();
      const 결과 = AuthenticSajuCalculator.calculateAuthenticLifeChart(사주, 1976);

      console.log('✅ 직접 계산 결과:');
      console.log(`   격국: ${결과.개인정보.격국.격국유형} (일간강약: ${결과.개인정보.격국.일간강약})`);
      console.log(`   용신: [${결과.개인정보.용신.용신.join(', ')}]`);
      console.log(`   평균점수: ${결과.통계.평균점수}점`);

      // 2. API 테스트
      console.log('\n🔄 API 테스트 실행 중...');
      const apiResult = await fetchLifetimeFortune({
        year: 1976,
        month: 8,  // 병진년 정유월
        day: 20,   // 신미일 추정
        hour: 9,   // 계사시 (오전 9시)
        isLunar: false,
        useAuthenticCalculator: true,
      });

      if (apiResult.success) {
        const 분석 = apiResult.data.analysis;
        console.log('✅ API 호출 성공:');
        console.log(`   평균점수: ${분석.averageScore}점`);
        console.log(`   최고점: ${분석.bestYear.age}세 (${분석.bestYear.score}점)`);
        console.log(`   최저점: ${분석.worstYear.age}세 (${분석.worstYear.score}점)`);

        // 용신 부합도 검증
        const lifetimeFortune = apiResult.data.lifetimeFortune;
        const 수목운점수 = this.analyzeFortuneTrend(lifetimeFortune, ['수', '목']);
        const 화토운점수 = this.analyzeFortuneTrend(lifetimeFortune, ['화', '토']);

        console.log('\n📊 용신 부합도 검증:');
        console.log(`   수목운 평균: ${수목운점수.평균점수}점 (${수목운점수.샘플수}개 샘플)`);
        console.log(`   화토운 평균: ${화토운점수.평균점수}점 (${화토운점수.샘플수}개 샘플)`);

        // 검증 결과
        const 수목운양호 = 수목운점수.평균점수 >= 60;
        const 화토운낮음 = 화토운점수.평균점수 <= 50;
        const 차이충분 = 수목운점수.평균점수 - 화토운점수.평균점수 >= 15;

        if (수목운양호 && 화토운낮음 && 차이충분) {
          console.log('✅ 정비제 테스트 PASS: 용신 수목 효과 확인됨');
        } else {
          console.log('❌ 정비제 테스트 FAIL: 용신 효과 미흡');
          console.log(`   수목운 양호: ${수목운양호}, 화토운 낮음: ${화토운낮음}, 차이 충분: ${차이충분}`);
        }
      } else {
        console.error('❌ API 호출 실패');
      }

    } catch (error) {
      console.error('❌ 정비제 테스트 오류:', error);
    }
  }

  /**
   * 개인별 차이 검증: 박준수와 정비제의 동일 나이 점수 비교
   */
  public static async testPersonalDifference(): Promise<void> {
    console.log('\n🧪 === 개인별 차이 검증 ===');

    try {
      const [박준수결과, 정비제결과] = await Promise.all([
        fetchLifetimeFortune({
          year: 1971, month: 11, day: 15, hour: 11,
          useAuthenticCalculator: true,
        }),
        fetchLifetimeFortune({
          year: 1976, month: 8, day: 20, hour: 9,
          useAuthenticCalculator: true,
        }),
      ]);

      if (박준수결과.success && 정비제결과.success) {
        // 45세, 50세, 55세 점수 비교
        const 비교나이들 = [45, 50, 55];

        console.log('📊 동일 나이 점수 비교:');
        비교나이들.forEach(나이 => {
          const 박준수점수 = 박준수결과.data.lifetimeFortune[나이]?.totalScore || 0;
          const 정비제점수 = 정비제결과.data.lifetimeFortune[나이]?.totalScore || 0;
          const 점수차이 = Math.abs(박준수점수 - 정비제점수);

          console.log(`   ${나이}세: 박준수 ${박준수점수}점, 정비제 ${정비제점수}점, 차이 ${점수차이}점`);

          if (점수차이 >= 20) {
            console.log(`     ✅ ${나이}세 개인차 충분 (20점 이상)`);
          } else {
            console.log(`     ⚠️  ${나이}세 개인차 부족 (20점 미만)`);
          }
        });

        // 전체 패턴 비교
        const 박준수평균 = 박준수결과.data.analysis.averageScore;
        const 정비제평균 = 정비제결과.data.analysis.averageScore;
        const 평균차이 = Math.abs(박준수평균 - 정비제평균);

        console.log('\n📈 전체 패턴 비교:');
        console.log(`   박준수 평균: ${박준수평균}점`);
        console.log(`   정비제 평균: ${정비제평균}점`);
        console.log(`   평균 차이: ${평균차이}점`);

        if (평균차이 >= 10) {
          console.log('✅ 전체적으로 개인별 차이 확인됨');
        } else {
          console.log('❌ 전체적으로 개인별 차이 부족');
        }

      } else {
        console.error('❌ API 호출 실패');
      }

    } catch (error) {
      console.error('❌ 개인별 차이 검증 오류:', error);
    }
  }

  /**
   * 특정 오행 운세 기간 분석
   */
  private static analyzeFortuneTrend(
    lifetimeFortune: any[],
    targetElements: string[],
  ): { 평균점수: number; 샘플수: number } {
    const 대상연도들 = lifetimeFortune.filter(년도 => {
      const 대운오행 = 년도.대운?.오행;
      const 세운오행 = 년도.세운?.오행;
      return targetElements.includes(대운오행) || targetElements.includes(세운오행);
    });

    if (대상연도들.length === 0) {
      return { 평균점수: 0, 샘플수: 0 };
    }

    const 총점수 = 대상연도들.reduce((합, 년도) => 합 + 년도.totalScore, 0);
    const 평균점수 = Math.round(총점수 / 대상연도들.length);

    return { 평균점수, 샘플수: 대상연도들.length };
  }

  /**
   * 전체 테스트 실행
   */
  public static async runAllTests(): Promise<void> {
    console.log('🚀 === 정통 사주학 계산기 전체 테스트 시작 ===\n');

    await this.testParkJunSoo();
    await this.testJeongBiJe();
    await this.testPersonalDifference();

    console.log('\n🏁 === 전체 테스트 완료 ===');
  }
}