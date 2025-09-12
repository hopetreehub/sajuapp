/**
 * BaZi Calculator 패키지를 사용한 정확한 사주 계산 테스트
 * 현재 패키지가 없으므로 비활성화
 */

// import { BaziCalculator } from 'bazi-calculator-by-alvamind';

export function testAccurateBazi() {
  console.log('=== BaZi Calculator 테스트 (현재 비활성화) ===');
  console.log('bazi-calculator-by-alvamind 패키지가 설치되지 않았습니다.');
  return null;
}

// 한글 변환 함수
export function convertToKorean(str: string): string {
  if (!str) return '';
  
  const map: { [key: string]: string } = {
    '甲': '갑', '乙': '을', '丙': '병', '丁': '정', '戊': '무',
    '己': '기', '庚': '경', '辛': '신', '壬': '임', '癸': '계',
    '子': '자', '丑': '축', '寅': '인', '卯': '묘', '辰': '진', '巳': '사',
    '午': '오', '未': '미', '申': '신', '酉': '유', '戌': '술', '亥': '해',
  };
  
  let result = str;
  for (const [cn, kr] of Object.entries(map)) {
    result = result.replace(new RegExp(cn, 'g'), kr);
  }
  return result;
}

export function runBaziTest() {
  console.log('BaZi 패키지 테스트 건너뜀 (패키지 없음)');
  return null;
}