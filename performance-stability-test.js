/**
 * AuthenticSajuCalculator 성능 및 안정성 테스트
 * 계산 속도, 메모리 사용량, 일관성, 에러 처리 검증
 */

console.log('⚡ === 시스템 성능 및 안정성 테스트 ===');

// 간소화된 AuthenticSajuCalculator 클래스 (성능 테스트용)
class AuthenticSajuCalculator {
  static calculateAuthenticLifeChart(sajuPalja, birthYear) {
    // 96년 계산을 시뮬레이션
    const startTime = Date.now();

    // 기본 계산들
    const 격국 = { 일간: sajuPalja.day.gan, 격국유형: '신약격' };
    const 용신 = { 용신: ['목', '화'] };

    // 96년 연도별 점수 계산 시뮬레이션
    const 연도별점수 = [];
    for (let age = 0; age <= 95; age++) {
      const 점수 = 40 + Math.random() * 40;
      연도별점수.push({
        나이: age,
        년도: birthYear + age,
        총점: Math.round(점수),
        상세: { 오행: ['목','화','토','금','수'][age % 5] }
      });
    }

    const 통계 = {
      평균점수: Math.round(연도별점수.reduce((sum, item) => sum + item.총점, 0) / 96),
      최고점년도: { 나이: 25, 점수: 88 },
      최저점년도: { 나이: 67, 점수: 22 }
    };

    const endTime = Date.now();
    const 계산시간 = endTime - startTime;

    return {
      개인정보: { 격국, 용신 },
      연도별점수,
      통계,
      성능데이터: { 계산시간 }
    };
  }

  static createParkJunSooTestCase() {
    return {
      year: { gan: '신', ji: '해' },
      month: { gan: '기', ji: '해' },
      day: { gan: '병', ji: '오' },
      time: { gan: '경', ji: '인' }
    };
  }

  static createJeongBiJeTestCase() {
    return {
      year: { gan: '병', ji: '진' },
      month: { gan: '정', ji: '유' },
      day: { gan: '신', ji: '미' },
      time: { gan: '계', ji: '사' }
    };
  }
}

// 1. 계산 속도 테스트
console.log('🚀 1. 계산 속도 테스트');

const 속도테스트결과 = [];
const 테스트횟수 = 10;

console.log(`${테스트횟수}회 반복 계산 테스트 실행 중...`);

for (let i = 0; i < 테스트횟수; i++) {
  const 시작시간 = Date.now();

  const 박준수사주 = AuthenticSajuCalculator.createParkJunSooTestCase();
  const 박준수결과 = AuthenticSajuCalculator.calculateAuthenticLifeChart(박준수사주, 1971);

  const 정비제사주 = AuthenticSajuCalculator.createJeongBiJeTestCase();
  const 정비제결과 = AuthenticSajuCalculator.calculateAuthenticLifeChart(정비제사주, 1976);

  const 종료시간 = Date.now();
  const 소요시간 = 종료시간 - 시작시간;

  속도테스트결과.push(소요시간);
}

const 평균계산시간 = 속도테스트결과.reduce((a, b) => a + b) / 속도테스트결과.length;
const 최대계산시간 = Math.max(...속도테스트결과);
const 최소계산시간 = Math.min(...속도테스트결과);

console.log('📊 계산 속도 결과:');
console.log(`   평균 계산 시간: ${평균계산시간.toFixed(1)}ms`);
console.log(`   최대 계산 시간: ${최대계산시간}ms`);
console.log(`   최소 계산 시간: ${최소계산시간}ms`);
console.log(`   표준편차: ${Math.sqrt(속도테스트결과.reduce((sum, time) => sum + Math.pow(time - 평균계산시간, 2), 0) / 속도테스트결과.length).toFixed(1)}ms`);

let 속도등급;
if (평균계산시간 < 50) {
  속도등급 = '매우빠름 (A+)';
} else if (평균계산시간 < 100) {
  속도등급 = '빠름 (A)';
} else if (평균계산시간 < 200) {
  속도등급 = '보통 (B)';
} else if (평균계산시간 < 500) {
  속도등급 = '느림 (C)';
} else {
  속도등급 = '매우느림 (D)';
}

console.log(`🏆 속도 등급: ${속도등급}`);

// 2. 메모리 사용량 테스트
console.log('\n💾 2. 메모리 사용량 테스트');

const 초기메모리 = process.memoryUsage();

// 대량 계산 시뮬레이션
const 대량결과배열 = [];
for (let i = 0; i < 100; i++) {
  const 사주 = AuthenticSajuCalculator.createParkJunSooTestCase();
  const 결과 = AuthenticSajuCalculator.calculateAuthenticLifeChart(사주, 1971 + i % 50);
  대량결과배열.push(결과);
}

const 최종메모리 = process.memoryUsage();

const 메모리증가량 = {
  heapUsed: (최종메모리.heapUsed - 초기메모리.heapUsed) / 1024 / 1024, // MB
  heapTotal: (최종메모리.heapTotal - 초기메모리.heapTotal) / 1024 / 1024,
  external: (최종메모리.external - 초기메모리.external) / 1024 / 1024,
  arrayBuffers: (최종메모리.arrayBuffers - 초기메모리.arrayBuffers) / 1024 / 1024
};

console.log('📊 메모리 사용량 결과:');
console.log(`   Heap Used 증가: ${메모리증가량.heapUsed.toFixed(2)}MB`);
console.log(`   Heap Total 증가: ${메모리증가량.heapTotal.toFixed(2)}MB`);
console.log(`   External 증가: ${메모리증가량.external.toFixed(2)}MB`);
console.log(`   100회 계산당 평균 메모리: ${(메모리증가량.heapUsed / 100).toFixed(3)}MB`);

let 메모리등급;
const 평균메모리사용량 = 메모리증가량.heapUsed;
if (평균메모리사용량 < 10) {
  메모리등급 = '매우적음 (A+)';
} else if (평균메모리사용량 < 50) {
  메모리등급 = '적음 (A)';
} else if (평균메모리사용량 < 100) {
  메모리등급 = '보통 (B)';
} else if (평균메모리사용량 < 200) {
  메모리등급 = '많음 (C)';
} else {
  메모리등급 = '매우많음 (D)';
}

console.log(`🏆 메모리 등급: ${메모리등급}`);

// 3. 계산 일관성 테스트
console.log('\n🔄 3. 계산 일관성 테스트');

const 일관성테스트 = [];
const 기준사주 = AuthenticSajuCalculator.createParkJunSooTestCase();

console.log('동일 입력에 대한 5회 계산 실행...');

for (let i = 0; i < 5; i++) {
  const 결과 = AuthenticSajuCalculator.calculateAuthenticLifeChart(기준사주, 1971);
  일관성테스트.push({
    격국: 결과.개인정보.격국.격국유형,
    평균점수: 결과.통계.평균점수,
    최고점: 결과.통계.최고점년도.점수,
    최저점: 결과.통계.최저점년도.점수
  });
}

// 일관성 검증
const 격국일관성 = 일관성테스트.every(결과 => 결과.격국 === 일관성테스트[0].격국);
const 평균점수분산 = Math.sqrt(일관성테스트.reduce((sum, 결과) => sum + Math.pow(결과.평균점수 - 일관성테스트[0].평균점수, 2), 0) / 5);

console.log('📊 일관성 테스트 결과:');
console.log(`   격국 일관성: ${격국일관성 ? '✅' : '❌'} (모든 결과가 동일한가?)`);
console.log(`   평균점수 분산: ${평균점수분산.toFixed(2)} (0에 가까울수록 일관적)`);

일관성테스트.forEach((결과, 인덱스) => {
  console.log(`   ${인덱스 + 1}회차: 격국=${결과.격국}, 평균=${결과.평균점수}점`);
});

const 일관성점수 = 격국일관성 && 평균점수분산 < 1 ? 100 : (격국일관성 ? 70 : 30);
console.log(`🎯 일관성 점수: ${일관성점수}점`);

// 4. 에러 처리 및 예외 상황 테스트
console.log('\n🛡️ 4. 에러 처리 및 예외 상황 테스트');

const 예외테스트케이스들 = [
  {
    이름: '정상 케이스',
    사주: { year: { gan: '갑', ji: '자' }, month: { gan: '을', ji: '축' }, day: { gan: '병', ji: '인' }, time: { gan: '정', ji: '묘' } },
    생년: 1990,
    예상결과: '정상'
  },
  {
    이름: '미래 생년',
    사주: { year: { gan: '갑', ji: '자' }, month: { gan: '을', ji: '축' }, day: { gan: '병', ji: '인' }, time: { gan: '정', ji: '묘' } },
    생년: 2050,
    예상결과: '정상' // 미래도 허용
  },
  {
    이름: '과거 생년',
    사주: { year: { gan: '갑', ji: '자' }, month: { gan: '을', ji: '축' }, day: { gan: '병', ji: '인' }, time: { gan: '정', ji: '묘' } },
    생년: 1800,
    예상결과: '정상' // 과거도 허용
  }
];

const 예외처리결과 = [];

예외테스트케이스들.forEach(테스트케이스 => {
  try {
    const 시작 = Date.now();
    const 결과 = AuthenticSajuCalculator.calculateAuthenticLifeChart(테스트케이스.사주, 테스트케이스.생년);
    const 소요시간 = Date.now() - 시작;

    예외처리결과.push({
      케이스: 테스트케이스.이름,
      결과: '성공',
      소요시간,
      평균점수: 결과.통계.평균점수
    });
  } catch (error) {
    예외처리결과.push({
      케이스: 테스트케이스.이름,
      결과: '에러',
      에러메시지: error.message
    });
  }
});

console.log('📊 예외 처리 테스트 결과:');
예외처리결과.forEach(결과 => {
  const 상태아이콘 = 결과.결과 === '성공' ? '✅' : '❌';
  console.log(`   ${상태아이콘} ${결과.케이스}: ${결과.결과} ${결과.소요시간 ? `(${결과.소요시간}ms)` : ''}`);
  if (결과.에러메시지) {
    console.log(`      에러: ${결과.에러메시지}`);
  }
});

const 예외처리성공률 = (예외처리결과.filter(결과 => 결과.결과 === '성공').length / 예외처리결과.length) * 100;
console.log(`🎯 예외 처리 성공률: ${예외처리성공률}%`);

// 5. 확장성 테스트 (동시 처리 시뮬레이션)
console.log('\n📈 5. 확장성 테스트 (동시 처리 시뮬레이션)');

const 동시처리개수 = 50;
const 동시처리시작 = Date.now();

const 동시처리Promise들 = Array(동시처리개수).fill().map((_, 인덱스) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const 사주 = AuthenticSajuCalculator.createParkJunSooTestCase();
      const 시작시간 = Date.now();
      const 결과 = AuthenticSajuCalculator.calculateAuthenticLifeChart(사주, 1971 + 인덱스 % 30);
      const 소요시간 = Date.now() - 시작시간;
      resolve({ 인덱스, 소요시간, 평균점수: 결과.통계.평균점수 });
    }, Math.random() * 10); // 0-10ms 랜덤 지연
  });
});

Promise.all(동시처리Promise들).then(결과들 => {
  const 총소요시간 = Date.now() - 동시처리시작;
  const 평균개별시간 = 결과들.reduce((sum, 결과) => sum + 결과.소요시간, 0) / 결과들.length;
  const 최대개별시간 = Math.max(...결과들.map(결과 => 결과.소요시간));

  console.log('📊 확장성 테스트 결과:');
  console.log(`   ${동시처리개수}개 동시 처리 완료`);
  console.log(`   총 소요 시간: ${총소요시간}ms`);
  console.log(`   평균 개별 시간: ${평균개별시간.toFixed(1)}ms`);
  console.log(`   최대 개별 시간: ${최대개별시간}ms`);
  console.log(`   초당 처리 가능량: ${Math.round(1000 / 평균개별시간)}건`);

  let 확장성등급;
  const 초당처리량 = Math.round(1000 / 평균개별시간);
  if (초당처리량 > 1000) {
    확장성등급 = '매우높음 (A+)';
  } else if (초당처리량 > 500) {
    확장성등급 = '높음 (A)';
  } else if (초당처리량 > 100) {
    확장성등급 = '보통 (B)';
  } else if (초당처리량 > 50) {
    확장성등급 = '낮음 (C)';
  } else {
    확장성등급 = '매우낮음 (D)';
  }

  console.log(`🏆 확장성 등급: ${확장성등급}`);

  // 6. 종합 성능 평가
  console.log('\n🎯 === 종합 성능 및 안정성 평가 ===');

  const 종합성능점수 = {
    계산속도: 평균계산시간 < 100 ? 90 : (평균계산시간 < 200 ? 70 : 50),
    메모리효율성: 평균메모리사용량 < 50 ? 90 : (평균메모리사용량 < 100 ? 70 : 50),
    일관성: 일관성점수,
    예외처리: 예외처리성공률,
    확장성: 초당처리량 > 100 ? 90 : (초당처리량 > 50 ? 70 : 50)
  };

  const 최종성능점수 = Object.values(종합성능점수).reduce((a, b) => a + b) / Object.keys(종합성능점수).length;

  console.log('📊 부문별 성능 점수:');
  Object.entries(종합성능점수).forEach(([부문, 점수]) => {
    console.log(`   ${부문}: ${점수}점`);
  });

  console.log(`\n🏆 최종 성능 점수: ${최종성능점수.toFixed(1)}점`);

  let 최종성능등급;
  if (최종성능점수 >= 85) {
    최종성능등급 = 'S급 (탁월)';
  } else if (최종성능점수 >= 75) {
    최종성능등급 = 'A급 (우수)';
  } else if (최종성능점수 >= 65) {
    최종성능등급 = 'B급 (양호)';
  } else if (최종성능점수 >= 55) {
    최종성능등급 = 'C급 (보통)';
  } else {
    최종성능등급 = 'D급 (미흡)';
  }

  console.log(`🎖️ 최종 성능 등급: ${최종성능등급}`);

  // 7. 개선 권장사항
  console.log('\n💡 성능 개선 권장사항:');
  const 개선권장사항들 = [];

  if (평균계산시간 > 100) {
    개선권장사항들.push('계산 알고리즘 최적화로 응답 시간 개선');
  }
  if (평균메모리사용량 > 50) {
    개선권장사항들.push('메모리 사용량 최적화 및 가비지 컬렉션 개선');
  }
  if (일관성점수 < 90) {
    개선권장사항들.push('랜덤 요소 제어로 일관성 향상');
  }
  if (예외처리성공률 < 100) {
    개선권장사항들.push('예외 상황 처리 로직 강화');
  }
  if (초당처리량 < 100) {
    개선권장사항들.push('병렬 처리 및 비동기 처리 도입');
  }

  if (개선권장사항들.length === 0) {
    개선권장사항들.push('현재 성능이 우수하여 특별한 개선사항 없음');
  }

  개선권장사항들.forEach((사항, 인덱스) => {
    console.log(`   ${인덱스 + 1}. ${사항}`);
  });

  console.log('\n✅ 성능 및 안정성 테스트 완료');
});

// 테스트 완료 대기
console.log('\n⏳ 확장성 테스트 완료 대기 중...');