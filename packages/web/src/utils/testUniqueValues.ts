/**
 * 개인별 고유값 생성 테스트
 * 박준수님과 정비제님의 사주 데이터로 고유값 차이 검증
 */

// 박준수님 사주 데이터 (1971-11-17 04:00)
const PARK_SAJU = {
  year: { gan: '신', ji: '해' },
  month: { gan: '기', ji: '해' },
  day: { gan: '병', ji: '오' },
  time: { gan: '경', ji: '인' },
};

// 정비제님 사주 데이터 (1976-09-16 09:40)
const JUNG_SAJU = {
  year: { gan: '병', ji: '진' },
  month: { gan: '정', ji: '유' },
  day: { gan: '신', ji: '미' },
  time: { gan: '계', ji: '사' },
};

// 천간지지 맵핑
const CHEONGAN_MAP: Record<string, number> = {
  갑: 1, 을: 2, 병: 3, 정: 4, 무: 5,
  기: 6, 경: 7, 신: 8, 임: 9, 계: 10,
};

const JIJI_MAP: Record<string, number> = {
  자: 1, 축: 2, 인: 3, 묘: 4, 진: 5, 사: 6,
  오: 7, 미: 8, 신: 9, 유: 10, 술: 11, 해: 12,
};

// 오행 매핑
const CHEONGAN_OHHAENG: Record<string, string> = {
  갑: '목', 을: '목', 병: '화', 정: '화', 무: '토',
  기: '토', 경: '금', 신: '금', 임: '수', 계: '수',
};

const JIJI_OHHAENG: Record<string, string> = {
  자: '수', 축: '토', 인: '목', 묘: '목', 진: '토', 사: '화',
  오: '화', 미: '토', 신: '금', 유: '금', 술: '토', 해: '수',
};

function calculateUniqueValue(saju: any): number {
  // 1. 기본 천간지지 값
  const ganValues = CHEONGAN_MAP;
  const jiValues = JIJI_MAP;

  // 2. 60갑자 조합별 고유 패턴 계수
  const gapjaPattern = ((ganValues[saju.year.gan] - 1) * 12 + (jiValues[saju.year.ji] - 1)) % 60;
  const monthPattern = ((ganValues[saju.month.gan] - 1) * 12 + (jiValues[saju.month.ji] - 1)) % 60;
  const dayPattern = ((ganValues[saju.day.gan] - 1) * 12 + (jiValues[saju.day.ji] - 1)) % 60;
  const timePattern = ((ganValues[saju.time.gan] - 1) * 12 + (jiValues[saju.time.ji] - 1)) % 60;

  // 3. 오행 편중도 계산
  const elements: Record<string, number> = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
  [saju.year.gan, saju.month.gan, saju.day.gan, saju.time.gan].forEach(gan => {
    elements[CHEONGAN_OHHAENG[gan]]++;
  });
  [saju.year.ji, saju.month.ji, saju.day.ji, saju.time.ji].forEach(ji => {
    elements[JIJI_OHHAENG[ji]]++;
  });

  const elementValues = Object.values(elements);
  const maxElement = Math.max(...elementValues);
  const minElement = Math.min(...elementValues);
  const elementImbalance = (maxElement - minElement) * 100;

  // 7. 종합 고유값 계산
  const complexUniqueValue = (
    gapjaPattern * 1000 + monthPattern * 500 + dayPattern * 800 + timePattern * 300 +
    elementImbalance * 20
  );

  return complexUniqueValue;
}

// 테스트 실행
export function testUniqueValues() {
  const parkUniqueValue = calculateUniqueValue(PARK_SAJU);
  const jungUniqueValue = calculateUniqueValue(JUNG_SAJU);

  console.log('🔍 개인별 고유값 테스트 결과:');
  console.log(`박준수님 (신해 기해 병오 경인): ${parkUniqueValue}`);
  console.log(`정비제님 (병진 정유 신미 계사): ${jungUniqueValue}`);
  console.log(`차이값: ${Math.abs(parkUniqueValue - jungUniqueValue)}`);
  console.log(`차이율: ${(Math.abs(parkUniqueValue - jungUniqueValue) / Math.max(parkUniqueValue, jungUniqueValue) * 100).toFixed(2)}%`);

  // 각 구성요소별 차이 확인
  console.log('\n📊 구성요소별 분석:');

  // 박준수님 분석
  const parkGapja = ((CHEONGAN_MAP[PARK_SAJU.year.gan] - 1) * 12 + (JIJI_MAP[PARK_SAJU.year.ji] - 1)) % 60;
  const parkElements: Record<string, number> = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
  [PARK_SAJU.year.gan, PARK_SAJU.month.gan, PARK_SAJU.day.gan, PARK_SAJU.time.gan].forEach(gan => {
    parkElements[CHEONGAN_OHHAENG[gan]]++;
  });
  [PARK_SAJU.year.ji, PARK_SAJU.month.ji, PARK_SAJU.day.ji, PARK_SAJU.time.ji].forEach(ji => {
    parkElements[JIJI_OHHAENG[ji]]++;
  });

  // 정비제님 분석
  const jungGapja = ((CHEONGAN_MAP[JUNG_SAJU.year.gan] - 1) * 12 + (JIJI_MAP[JUNG_SAJU.year.ji] - 1)) % 60;
  const jungElements: Record<string, number> = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
  [JUNG_SAJU.year.gan, JUNG_SAJU.month.gan, JUNG_SAJU.day.gan, JUNG_SAJU.time.gan].forEach(gan => {
    jungElements[CHEONGAN_OHHAENG[gan]]++;
  });
  [JUNG_SAJU.year.ji, JUNG_SAJU.month.ji, JUNG_SAJU.day.ji, JUNG_SAJU.time.ji].forEach(ji => {
    jungElements[JIJI_OHHAENG[ji]]++;
  });

  console.log(`박준수님 - 갑자패턴: ${parkGapja}, 오행분포: ${JSON.stringify(parkElements)}`);
  console.log(`정비제님 - 갑자패턴: ${jungGapja}, 오행분포: ${JSON.stringify(jungElements)}`);

  return { parkUniqueValue, jungUniqueValue };
}

// 브라우저 콘솔에서 실행 가능하도록 window 객체에 추가
if (typeof window !== 'undefined') {
  (window as any).testUniqueValues = testUniqueValues;
  console.log('🚀 테스트 함수 등록 완료: window.testUniqueValues() 호출하여 테스트 실행');
}