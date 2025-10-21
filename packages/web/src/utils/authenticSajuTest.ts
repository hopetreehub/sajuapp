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


    try {
      // 1. 직접 계산기 테스트
      const 사주 = AuthenticSajuCalculator.createParkJunSooTestCase();
      const _결과 = AuthenticSajuCalculator.calculateAuthenticLifeChart(사주, 1971);


      // 2. API 테스트

      const apiResult = await fetchLifetimeFortune({
        year: 1971,
        month: 11, // 신해년 기해월
        day: 15,   // 추정
        hour: 11,  // 경인시 (오전 11시)
        isLunar: false,
        useAuthenticCalculator: true,
      });

      if (apiResult.success) {
        const _분석 = apiResult.data.analysis;


        // 용신 부합도 검증
        const lifetimeFortune = apiResult.data.lifetimeFortune;
        const 목화운점수 = this.analyzeFortuneTrend(lifetimeFortune, ['목', '화']);
        const 금수운점수 = this.analyzeFortuneTrend(lifetimeFortune, ['금', '수']);


        // 검증 결과
        const 목화운양호 = 목화운점수.평균점수 >= 60;
        const 금수운낮음 = 금수운점수.평균점수 <= 50;
        const 차이충분 = 목화운점수.평균점수 - 금수운점수.평균점수 >= 15;

        if (목화운양호 && 금수운낮음 && 차이충분) {

        } else {


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


    try {
      // 1. 직접 계산기 테스트
      const 사주 = AuthenticSajuCalculator.createJeongBiJeTestCase();
      const _결과 = AuthenticSajuCalculator.calculateAuthenticLifeChart(사주, 1976);


      // 2. API 테스트

      const apiResult = await fetchLifetimeFortune({
        year: 1976,
        month: 8,  // 병진년 정유월
        day: 20,   // 신미일 추정
        hour: 9,   // 계사시 (오전 9시)
        isLunar: false,
        useAuthenticCalculator: true,
      });

      if (apiResult.success) {
        const _분석 = apiResult.data.analysis;


        // 용신 부합도 검증
        const lifetimeFortune = apiResult.data.lifetimeFortune;
        const 수목운점수 = this.analyzeFortuneTrend(lifetimeFortune, ['수', '목']);
        const 화토운점수 = this.analyzeFortuneTrend(lifetimeFortune, ['화', '토']);


        // 검증 결과
        const 수목운양호 = 수목운점수.평균점수 >= 60;
        const 화토운낮음 = 화토운점수.평균점수 <= 50;
        const 차이충분 = 수목운점수.평균점수 - 화토운점수.평균점수 >= 15;

        if (수목운양호 && 화토운낮음 && 차이충분) {

        } else {


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

        비교나이들.forEach(나이 => {
          const 박준수점수 = 박준수결과.data.lifetimeFortune[나이]?.totalScore || 0;
          const 정비제점수 = 정비제결과.data.lifetimeFortune[나이]?.totalScore || 0;
          const 점수차이 = Math.abs(박준수점수 - 정비제점수);

          if (점수차이 >= 20) {

          } else {

          }
        });

        // 전체 패턴 비교
        const 박준수평균 = 박준수결과.data.analysis.averageScore;
        const 정비제평균 = 정비제결과.data.analysis.averageScore;
        const 평균차이 = Math.abs(박준수평균 - 정비제평균);


        if (평균차이 >= 10) {

        } else {

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

    await this.testParkJunSoo();
    await this.testJeongBiJe();
    await this.testPersonalDifference();

  }
}