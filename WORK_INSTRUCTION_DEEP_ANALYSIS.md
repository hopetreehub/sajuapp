# 🧠 Deep Thinking Analysis - 100년 인생운세 차트 문제 해결 작업지시서

## 📌 핵심 문제
**"사주가 바뀌어도 차트 패턴이 동일하다"** - 사람이 바뀌면 나이만 바뀌고 차트는 고정값 그대로

## 🔍 심층 분석 결과

### 1️⃣ 데이터 흐름 파이프라인 문제점

```
[고객 선택]
    ↓
[Customer 데이터: 사주 8자 포함]
    ↓
[convertCustomerToLifetimeRequest: 생년월일시만 추출] ⚠️ 문제!
    ↓
[fetchLifetimeFortune: 생년월일시만 받음]
    ↓
[SajuCalculator.calculateFourPillars: 사주 재계산]
    ↓
[calculateLifeChartScore: 점수 계산]
```

### 2️⃣ 근본 원인 분석

#### 문제 1: 사주 데이터 손실
- Customer 객체에 이미 계산된 `saju_data`가 있음
- 하지만 `convertCustomerToLifetimeRequest`에서 생년월일시만 추출
- 결과적으로 사주를 다시 계산하는데, 이 과정에서 오류 가능성

#### 문제 2: 불충분한 개인별 차별화
- `calculateLifeChartScore`가 사주별로 충분히 다른 패턴을 생성하지 못함
- uniqueValue 계산이 복잡하지만, 실제 차트에 미치는 영향이 제한적
- 변동폭을 크게 했지만 기본 패턴이 동일할 가능성

#### 문제 3: 캐싱/상태 관리
- 동일한 고객 재선택 시 이전 데이터 사용 가능성
- React 상태 업데이트 타이밍 문제

## 🎯 해결 방안

### Phase 1: 즉시 수정 가능한 부분

#### 1. 사주 데이터 직접 전달
```typescript
// customerDataConverter.ts 수정
export function convertCustomerToLifetimeRequest(
  customer: Customer,
): LifetimeFortuneRequest {
  // 기존 코드...
  return {
    year, month, day, hour,
    isLunar, gender,
    sajuData: customer.saju_data // 추가: 사주 데이터 직접 전달
  };
}
```

#### 2. 디버깅 강화
```typescript
// lifetimeFortuneApi.ts에 검증 로직 추가
function generateMockLifetimeFortune(request: LifetimeFortuneRequest) {
  // 사주 직접 사용 vs 재계산 비교
  if (request.sajuData) {
    console.log('🔴 전달받은 사주:', request.sajuData);
  }
  const calculatedSaju = SajuCalculator.calculateFourPillars(...);
  console.log('🔵 계산된 사주:', calculatedSaju);

  // 두 사주가 일치하는지 확인
  if (request.sajuData && !isSajuEqual(request.sajuData, calculatedSaju)) {
    console.error('⚠️ 사주 불일치 감지!');
  }
}
```

#### 3. 캐시 무효화
```typescript
// 고객 변경 시 캐시 강제 초기화
const loadLifetimeFortune = async (customer: Customer) => {
  // 캐시 키에 타임스탬프 추가
  const cacheKey = `${customer.id}_${Date.now()}`;
  // 또는 캐시 비활성화
  const response = await fetchLifetimeFortune(request, { noCache: true });
};
```

### Phase 2: 근본적 아키텍처 개선

#### 1. 사주 기반 패턴 매트릭스
```typescript
// 60갑자별 고유 패턴 사전 정의
const GAPJA_PATTERNS = {
  '갑자': { base: 65, volatility: 15, cycles: [10, 27, 45] },
  '을축': { base: 58, volatility: 22, cycles: [8, 25, 50] },
  // ... 60개 패턴
};

// 사주 8자 조합으로 개인 패턴 생성
function generatePersonalPattern(saju: SajuComponents) {
  const yearPattern = GAPJA_PATTERNS[saju.year.combined];
  const monthPattern = GAPJA_PATTERNS[saju.month.combined];
  // ... 복합 패턴 생성
}
```

#### 2. 대운 시스템 정밀 구현
```typescript
// 실제 대운 전환 계산
function calculateRealDaeun(saju: SajuComponents, birthDate: Date) {
  // 월령 계산
  const monthAge = calculateMonthAge(birthDate);

  // 대운 시작 나이 계산 (3년 = 1개월 환산)
  const daeunStartAge = Math.floor(monthAge * 3);

  // 순행/역행 결정
  const isForward = determineDirection(saju);

  // 10년 단위 대운 생성
  return generateDaeunCycles(saju, daeunStartAge, isForward);
}
```

#### 3. 완전한 개인화
```typescript
class PersonalFortuneEngine {
  private readonly birthChart: SajuComponents;
  private readonly uniqueFactors: PersonalFactors;

  constructor(customer: Customer) {
    this.birthChart = parseSajuData(customer.saju_data);
    this.uniqueFactors = this.calculateUniqueFactors();
  }

  generateLifeChart(): YearlyFortune[] {
    // 개인별 완전히 다른 차트 생성
    return this.birthChart.map((year, age) => {
      const baseScore = this.getBasePattern(age);
      const daeunEffect = this.getDaeunEffect(age);
      const seunEffect = this.getSeunEffect(year);
      const personalModulation = this.getPersonalModulation(age);

      return {
        age,
        year,
        score: baseScore + daeunEffect + seunEffect + personalModulation
      };
    });
  }
}
```

## 🚀 실행 계획

### 즉시 실행 (Phase 1)
1. ✅ 디버그 로그 추가로 데이터 흐름 확인
2. ✅ 사주 데이터 전달 경로 수정
3. ✅ 캐시 무효화 로직 추가
4. ✅ 브라우저 콘솔에서 실시간 검증

### 다음 단계 (Phase 2)
1. ⏳ 60갑자 패턴 매트릭스 구축
2. ⏳ 실제 대운 시스템 구현
3. ⏳ PersonalFortuneEngine 클래스 개발
4. ⏳ 단위 테스트 작성

## 🧪 검증 방법

### 1. 콘솔 테스트
```javascript
// 브라우저 콘솔에서 실행
window.testUniqueValues(); // 고유값 확인

// 두 명의 다른 고객 선택 후
console.log('고객1 차트:', lifetimeFortune1);
console.log('고객2 차트:', lifetimeFortune2);

// 패턴 비교
const pattern1 = lifetimeFortune1.data.lifetimeFortune.map(d => d.totalScore);
const pattern2 = lifetimeFortune2.data.lifetimeFortune.map(d => d.totalScore);
console.log('패턴 일치율:', calculateSimilarity(pattern1, pattern2));
```

### 2. 시각적 검증
- 박준수님 차트와 정비제님 차트를 나란히 열어 비교
- 차트의 굴곡, 피크, 저점이 완전히 다른지 확인
- 나이대별 패턴 차이 확인

## 📊 예상 결과

### Before (현재)
- 모든 사람의 차트가 유사한 패턴
- 나이만 다르고 곡선은 동일

### After (개선 후)
- 박준수님: 금수 편중, 역행 대운 → 20대 저점, 40대 상승, 60대 피크
- 정비제님: 화토금 균형, 순행 대운 → 30대 피크, 50대 안정, 70대 재상승
- 완전히 다른 개인별 패턴

## 🎯 핵심 메시지
**"하드코딩된 패턴이 아닌, 실제 사주 이론에 기반한 개인별 고유 차트"**

---
작성일: 2024-12-18
작성자: Claude Code Assistant
상태: 대기 중