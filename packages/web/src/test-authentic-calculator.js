/**
 * AuthenticSajuCalculator 테스트 스크립트
 * 브라우저 콘솔에서 실행하여 박준수와 정비제의 차트 비교 분석
 */

// 이 스크립트를 브라우저 콘솔에서 실행
console.log('🧪 정통 사주학 계산기 테스트 시작');

// 1. AuthenticSajuCalculator 모듈 가져오기 (이미 로드되어 있다고 가정)
// import { AuthenticSajuCalculator } from './src/utils/authenticSajuCalculator.ts';

function runAuthenticSajuTest() {
  console.log('🔮 === 정통 사주학 테스트 케이스 실행 ===');

  // 박준수 테스트 (신해기해병오경인)
  console.log('\n👤 박준수 (신해기해병오경인) 테스트:');
  const 박준수사주 = {
    year: { gan: '신', ji: '해' },  // 신해
    month: { gan: '기', ji: '해' }, // 기해
    day: { gan: '병', ji: '오' },   // 병오
    time: { gan: '경', ji: '인' }   // 경인
  };

  const 박준수결과 = AuthenticSajuCalculator.calculateAuthenticLifeChart(박준수사주, 1971);

  console.log('📋 박준수 분석 결과:');
  console.log('   격국:', 박준수결과.개인정보.격국.격국유형);
  console.log('   일간:', 박준수결과.개인정보.격국.일간, '(', 박준수결과.개인정보.격국.일간오행, ')');
  console.log('   일간강약:', 박준수결과.개인정보.격국.일간강약);
  console.log('   용신:', 박준수결과.개인정보.용신.용신);
  console.log('   기신:', 박준수결과.개인정보.용신.기신);
  console.log('   평균점수:', 박준수결과.통계.평균점수);
  console.log('   최고점:', 박준수결과.통계.최고점년도.나이, '세 (', 박준수결과.통계.최고점년도.점수, '점)');
  console.log('   최저점:', 박준수결과.통계.최저점년도.나이, '세 (', 박준수결과.통계.최저점년도.점수, '점)');

  // 정비제 테스트 (병진정유신미계사)
  console.log('\n👤 정비제 (병진정유신미계사) 테스트:');
  const 정비제사주 = {
    year: { gan: '병', ji: '진' },  // 병진
    month: { gan: '정', ji: '유' }, // 정유
    day: { gan: '신', ji: '미' },   // 신미
    time: { gan: '계', ji: '사' }   // 계사
  };

  const 정비제결과 = AuthenticSajuCalculator.calculateAuthenticLifeChart(정비제사주, 1976);

  console.log('📋 정비제 분석 결과:');
  console.log('   격국:', 정비제결과.개인정보.격국.격국유형);
  console.log('   일간:', 정비제결과.개인정보.격국.일간, '(', 정비제결과.개인정보.격국.일간오행, ')');
  console.log('   일간강약:', 정비제결과.개인정보.격국.일간강약);
  console.log('   용신:', 정비제결과.개인정보.용신.용신);
  console.log('   기신:', 정비제결과.개인정보.용신.기신);
  console.log('   평균점수:', 정비제결과.통계.평균점수);
  console.log('   최고점:', 정비제결과.통계.최고점년도.나이, '세 (', 정비제결과.통계.최고점년도.점수, '점)');
  console.log('   최저점:', 정비제결과.통계.최저점년도.나이, '세 (', 정비제결과.통계.최저점년도.점수, '점)');

  // 차이 분석
  console.log('\n📊 === 차이 분석 ===');
  console.log('평균점수 차이:', Math.abs(박준수결과.통계.평균점수 - 정비제결과.통계.평균점수), '점');
  console.log('최고점 차이:', Math.abs(박준수결과.통계.최고점년도.점수 - 정비제결과.통계.최고점년도.점수), '점');
  console.log('최저점 차이:', Math.abs(박준수결과.통계.최저점년도.점수 - 정비제결과.통계.최저점년도.점수), '점');

  // 연령대별 점수 비교
  console.log('\n📈 연령대별 점수 비교:');
  [20, 30, 40, 50, 60, 70].forEach(age => {
    const 박준수점수 = 박준수결과.연도별점수[age]?.총점 || 0;
    const 정비제점수 = 정비제결과.연도별점수[age]?.총점 || 0;
    const 차이 = Math.abs(박준수점수 - 정비제점수);
    console.log(`   ${age}세: 박준수 ${박준수점수}점, 정비제 ${정비제점수}점 (차이: ${차이}점)`);
  });

  // 용신 운세 vs 기신 운세 확인
  console.log('\n⭐ 용신 효과 분석:');

  // 박준수: 용신이 목화라면 목화운에서 높은 점수 기대
  const 박준수용신운년도들 = 박준수결과.연도별점수.filter(년도 =>
    박준수결과.개인정보.용신.용신.includes(년도.상세.오행)
  );
  const 박준수용신평균 = 박준수용신운년도들.length > 0 ?
    박준수용신운년도들.reduce((sum, 년도) => sum + 년도.총점, 0) / 박준수용신운년도들.length : 0;

  // 정비제: 용신이 수목이라면 수목운에서 높은 점수 기대
  const 정비제용신운년도들 = 정비제결과.연도별점수.filter(년도 =>
    정비제결과.개인정보.용신.용신.includes(년도.상세.오행)
  );
  const 정비제용신평균 = 정비제용신운년도들.length > 0 ?
    정비제용신운년도들.reduce((sum, 년도) => sum + 년도.총점, 0) / 정비제용신운년도들.length : 0;

  console.log(`박준수 용신운 평균: ${Math.round(박준수용신평균)}점 (전체 평균: ${박준수결과.통계.평균점수}점)`);
  console.log(`정비제 용신운 평균: ${Math.round(정비제용신평균)}점 (전체 평균: ${정비제결과.통계.평균점수}점)`);

  return { 박준수결과, 정비제결과 };
}

// 즉시 실행
const testResults = runAuthenticSajuTest();
console.log('✅ 테스트 완료. testResults 변수에 결과 저장됨.');