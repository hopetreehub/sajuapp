import { BaziCalculator } from 'bazi-calculator-by-alvamind';

// 1971년 11월 17일 04시 테스트
console.log('=== 1971년 11월 17일 04시 정확한 사주 계산 ===\n');

const calculator = new BaziCalculator(
  1971,   // Year
  11,     // Month  
  17,     // Day
  4,      // Hour (24-hour format)
  'male'  // Gender
);

console.log('BaZi 사주팔자:', calculator.toString());

const analysis = calculator.getCompleteAnalysis();
console.log('\n상세 분석:');
console.log('년주:', analysis.fourPillars?.yearPillar);
console.log('월주:', analysis.fourPillars?.monthPillar);
console.log('일주:', analysis.fourPillars?.dayPillar);
console.log('시주:', analysis.fourPillars?.hourPillar);

// 한글 변환
function toKorean(str) {
  if (!str) return '';
  const map = {
    '甲': '갑', '乙': '을', '丙': '병', '丁': '정', '戊': '무',
    '己': '기', '庚': '경', '辛': '신', '壬': '임', '癸': '계',
    '子': '자', '丑': '축', '寅': '인', '卯': '묘', '辰': '진', '巳': '사',
    '午': '오', '未': '미', '申': '신', '酉': '유', '戌': '술', '亥': '해'
  };
  
  let result = str;
  for (const [cn, kr] of Object.entries(map)) {
    result = result.replace(new RegExp(cn, 'g'), kr);
  }
  return result;
}

const koreanBazi = toKorean(calculator.toString());
console.log('\n한글 사주:', koreanBazi);

// 추가 테스트
console.log('\n=== 다른 날짜 테스트 ===');

const test2 = new BaziCalculator(1984, 2, 4, 12, 'male');
console.log('1984년 2월 4일 12시:', toKorean(test2.toString()));

const test3 = new BaziCalculator(2000, 1, 1, 0, 'male');
console.log('2000년 1월 1일 00시:', toKorean(test3.toString()));