# 🔧 사주 불일치 문제 해결 작업지시서

## 📌 핵심 문제
**"❌ 사주 불일치 감지!" - 백엔드와 프론트엔드가 서로 다른 사주 계산 엔진을 사용하여 동일한 생년월일시에 대해 서로 다른 결과 생성**

## 🔍 근본 원인 분석

### 1️⃣ 이중 사주 계산 엔진 문제
```
Backend (고객 저장)                    Frontend (차트 생성)
     ↓                                      ↓
accurateSajuCalculator.ts         sajuCalculator.ts
     ↓                                      ↓
calculateCompleteSaju()           calculateFourPillars()
     ↓                                      ↓
{year:{gan,ji}, month:{gan,ji},    {year:{heavenly,earthly},
 day:{gan,ji}, time:{gan,ji}}       month:{heavenly,earthly},
                                    day:{heavenly,earthly},
                                    hour:{heavenly,earthly}}
```

### 2️⃣ 데이터 구조 불일치
#### Backend (accurateSajuCalculator.ts)
```typescript
interface SajuResult {
  year: { gan: string, ji: string }
  month: { gan: string, ji: string }
  day: { gan: string, ji: string }
  time: { gan: string, ji: string }
}
```

#### Frontend (sajuCalculator.ts)
```typescript
interface FourPillarsResult {
  year: { heavenly: string, earthly: string, combined: string }
  month: { heavenly: string, earthly: string, combined: string }
  day: { heavenly: string, earthly: string, combined: string }
  hour: { heavenly: string, earthly: string, combined: string }
}
```

### 3️⃣ 계산 알고리즘 차이점
- **Backend**: 정확한 음력 변환, 24절기 고려, 시간대 보정
- **Frontend**: 간소화된 계산, 기본적인 갑자 변환만
- **결과**: 동일한 입력에 대해 서로 다른 사주 생성

## 🎯 해결 방안

### Phase 1: 즉시 해결 (Data Flow 통일)

#### 1. 사주 데이터 구조 통일
```typescript
// 새로운 공통 인터페이스 정의
interface StandardSajuData {
  year: { gan: string, ji: string, combined: string }
  month: { gan: string, ji: string, combined: string }
  day: { gan: string, ji: string, combined: string }
  time: { gan: string, ji: string, combined: string }
}

// 변환 함수 추가
function convertToStandardFormat(backendSaju: any): StandardSajuData {
  return {
    year: {
      gan: backendSaju.year.gan,
      ji: backendSaju.year.ji,
      combined: backendSaju.year.gan + backendSaju.year.ji
    },
    month: {
      gan: backendSaju.month.gan,
      ji: backendSaju.month.ji,
      combined: backendSaju.month.gan + backendSaju.month.ji
    },
    day: {
      gan: backendSaju.day.gan,
      ji: backendSaju.day.ji,
      combined: backendSaju.day.gan + backendSaju.day.ji
    },
    time: {
      gan: backendSaju.time.gan,
      ji: backendSaju.time.ji,
      combined: backendSaju.time.gan + backendSaju.time.ji
    }
  };
}
```

#### 2. lifetimeFortuneApi.ts 수정
```typescript
// 사주 불일치 검사 로직 수정
function validateSajuConsistency(customerSaju: any, calculatedSaju: any): boolean {
  if (!customerSaju) return false;

  // 백엔드 구조를 표준 형식으로 변환
  const standardCustomerSaju = convertToStandardFormat(customerSaju);

  // 프론트엔드 구조와 비교
  const isMatch =
    standardCustomerSaju.year.combined === calculatedSaju.year.combined &&
    standardCustomerSaju.month.combined === calculatedSaju.month.combined &&
    standardCustomerSaju.day.combined === calculatedSaju.day.combined &&
    standardCustomerSaju.time.combined === calculatedSaju.hour.combined;

  return isMatch;
}

// 사주 데이터 우선순위 로직
function resolveSajuData(customerSaju: any, calculatedSaju: any): StandardSajuData {
  if (customerSaju && validateSajuConsistency(customerSaju, calculatedSaju)) {
    console.log('✅ 사주 일치 - 고객 데이터 사용');
    return convertToStandardFormat(customerSaju);
  } else {
    console.log('🔄 사주 불일치 - 재계산 데이터 사용');
    return {
      year: { gan: calculatedSaju.year.heavenly, ji: calculatedSaju.year.earthly, combined: calculatedSaju.year.combined },
      month: { gan: calculatedSaju.month.heavenly, ji: calculatedSaju.month.earthly, combined: calculatedSaju.month.combined },
      day: { gan: calculatedSaju.day.heavenly, ji: calculatedSaju.day.earthly, combined: calculatedSaju.day.combined },
      time: { gan: calculatedSaju.hour.heavenly, ji: calculatedSaju.hour.earthly, combined: calculatedSaju.hour.combined }
    };
  }
}
```

### Phase 2: 근본적 해결 (Single Source of Truth)

#### 1. 계산 엔진 통일 방안
```typescript
// Option A: Backend 엔진을 Frontend로 이식
// accurateSajuCalculator.ts의 로직을 sajuCalculator.ts에 통합

// Option B: Frontend에서 Backend API 호출
async function calculateSajuViaAPI(birthInfo: BirthInfo): Promise<StandardSajuData> {
  const response = await fetch('/api/saju/calculate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(birthInfo)
  });
  return convertToStandardFormat(await response.json());
}

// Option C: 공통 라이브러리 생성
// packages/shared/saju-calculator/ 생성하여 양쪽에서 사용
```

#### 2. 데이터베이스 마이그레이션
```sql
-- 기존 saju_data 검증 및 재계산
UPDATE customers
SET saju_data = (
  SELECT accurate_saju_calculation(birth_date, birth_time, lunar_solar)
  FROM customers c2
  WHERE c2.id = customers.id
)
WHERE saju_data IS NULL OR saju_data = '';

-- 사주 일관성 검증 컬럼 추가
ALTER TABLE customers ADD COLUMN saju_verified BOOLEAN DEFAULT FALSE;
```

## 🚀 단계별 실행 계획

### Step 1: 데이터 구조 표준화 (30분)
```bash
# 1. 공통 타입 정의 생성
touch packages/web/src/types/standardSaju.ts

# 2. 변환 함수 구현
edit packages/web/src/utils/sajuDataConverter.ts

# 3. lifetimeFortuneApi.ts 로직 수정
edit packages/web/src/services/lifetimeFortuneApi.ts
```

### Step 2: 불일치 해결 로직 구현 (45분)
```typescript
// lifetimeFortuneApi.ts에 추가
function generateMockLifetimeFortune(request: LifetimeFortuneRequest) {
  // 1. 고객 사주 데이터 검증
  const customerSaju = request.sajuData;

  // 2. 재계산 사주 데이터
  const calculatedSaju = SajuCalculator.calculateFourPillars(...);

  // 3. 일치성 검사 및 데이터 선택
  const finalSajuData = resolveSajuData(customerSaju, calculatedSaju);

  // 4. 통일된 형식으로 차트 생성
  const chartData = UniversalSajuEngine.generateUniversalLifeChart(finalSajuData, personalInfo);

  return chartData;
}
```

### Step 3: 검증 및 테스트 (15분)
```javascript
// 브라우저 콘솔 테스트
// 1. 박준수님 선택 후 콘솔 확인
console.log('박준수 사주 검증 결과');

// 2. 정비제님 선택 후 콘솔 확인
console.log('정비제 사주 검증 결과');

// 3. "❌ 사주 불일치 감지!" 메시지 사라짐 확인
// 4. "✅ 사주 일치 확인" 또는 "🔄 사주 불일치 - 재계산 데이터 사용" 확인
```

### Step 4: 장기 해결책 준비 (별도 작업)
- Backend API 엔드포인트 `/api/saju/calculate` 추가
- Frontend에서 사주 계산을 Backend로 위임
- 캐싱 전략 구현

## 🎯 예상 결과

### Before (현재 상태)
```
lifetimeFortuneApi.ts:125 ❌ 사주 불일치 감지!
전달받은: {year: "병진", month: "정유", day: "신미", time: "계사"}
계산된: {year: "을미", month: "무신", day: "갑술", time: "경진"}
```

### After (수정 후)
```
lifetimeFortuneApi.ts:140 ✅ 사주 데이터 통일 완료
최종 사용: {year: "병진", month: "정유", day: "신미", time: "계사"}
차트 생성: ✅ 개인별 고유 패턴 적용
```

## 🔧 핵심 수정 파일 목록

1. **packages/web/src/types/standardSaju.ts** (신규)
   - 표준 사주 데이터 인터페이스 정의

2. **packages/web/src/utils/sajuDataConverter.ts** (신규)
   - Backend ↔ Frontend 데이터 변환 로직

3. **packages/web/src/services/lifetimeFortuneApi.ts** (수정)
   - 사주 불일치 해결 로직 추가
   - 검증 및 선택 알고리즘 구현

4. **packages/web/src/utils/customerDataConverter.ts** (수정)
   - 표준 형식 사주 데이터 전달

## ⚠️ 주의사항

1. **데이터 백업**: 사주 데이터 수정 전 customers 테이블 백업 필수
2. **점진적 적용**: 한 번에 모든 계산 엔진을 교체하지 말고 단계적 검증
3. **성능 고려**: 사주 계산은 CPU 집약적이므로 캐싱 전략 필수
4. **사용자 영향**: 기존 고객의 차트가 변경될 수 있음을 고려

## 🎭 검증 기준

### 성공 조건
- [ ] "❌ 사주 불일치 감지!" 메시지 완전 제거
- [ ] 박준수님과 정비제님 차트가 완전히 다른 패턴 표시
- [ ] 동일한 고객 재선택 시 일관된 차트 생성
- [ ] 콘솔 에러 없음

### 실패 조건
- [ ] 여전히 사주 불일치 메시지 표시
- [ ] 차트 패턴이 여전히 동일
- [ ] 새로운 타입스크립트 에러 발생
- [ ] 성능 심각한 저하

---
**작성일**: 2024-12-18
**작성자**: Claude Code Assistant
**상태**: 실행 대기 중
**우선순위**: 🔴 최고 (시스템 무결성 문제)