/**
 * BaZi Calculator 패키지를 사용한 정확한 사주 계산 테스트
 */

import { BaziCalculator } from 'bazi-calculator-by-alvamind';

export function testAccurateBazi() {
  console.log('=== 정확한 BaZi 계산 테스트 ===');
  
  // 1971년 11월 17일 04시 테스트
  const calculator = new BaziCalculator(
    1971,   // Year
    11,     // Month  
    17,     // Day
    4,      // Hour (24-hour format)
    'male'  // Gender
  );
  
  console.log('\n1971년 11월 17일 04시:');
  console.log('사주팔자:', calculator.toString());
  
  // 상세 분석
  const analysis = calculator.getCompleteAnalysis();
  console.log('\n상세 분석:');
  console.log('년주:', analysis.fourPillars.yearPillar);
  console.log('월주:', analysis.fourPillars.monthPillar);
  console.log('일주:', analysis.fourPillars.dayPillar);
  console.log('시주:', analysis.fourPillars.hourPillar);
  
  // 오행 분석
  console.log('\n오행 분석:');
  console.log(analysis.elements);
  
  // 다른 테스트 케이스들
  const testCases = [
    { year: 1984, month: 2, day: 4, hour: 12, desc: '1984년 갑자년 입춘일' },
    { year: 2000, month: 1, day: 1, hour: 0, desc: '2000년 1월 1일' },
    { year: 1976, month: 9, day: 16, hour: 10, desc: '1976년 9월 16일' }
  ];
  
  testCases.forEach(tc => {
    const calc = new BaziCalculator(tc.year, tc.month, tc.day, tc.hour, 'male');
    console.log(`\n${tc.desc}:`);
    console.log('사주:', calc.toString());
  });
  
  return analysis;
}

// 한글 변환 함수
export function convertToKorean(baziString: string): string {
  const mapping: { [key: string]: string } = {
    // 천간
    '甲': '갑', '乙': '을', '丙': '병', '丁': '정', '戊': '무',
    '己': '기', '庚': '경', '辛': '신', '壬': '임', '癸': '계',
    
    // 지지
    '子': '자', '丑': '축', '寅': '인', '卯': '묘', '辰': '진', '巳': '사',
    '午': '오', '未': '미', '申': '신', '酉': '유', '戌': '술', '亥': '해',
    
    // 기타
    '年': '년', '月': '월', '日': '일', '時': '시'
  };
  
  let result = baziString;
  for (const [chinese, korean] of Object.entries(mapping)) {
    result = result.replace(new RegExp(chinese, 'g'), korean);
  }
  return result;
}

// 실행 함수
export function runBaziTest() {
  const result = testAccurateBazi();
  return result;
}