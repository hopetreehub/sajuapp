# 🔧 주능/주흉 기능 제거 작업지시서

## 📌 작업 요청 사항

### 제거 대상
1. **주능/주흉 범례 UI**
   - 대길, 길, 평운, 흉, 대흉 색상 범례
   - 각 색상별 라벨 표시

2. **인생차트 컬러바**
   - 주능/주흉 기반 배경색 표시
   - 대체: 기본 종합운세만 표시

## 🔍 영향 받는 파일

### 차트 컴포넌트
1. **HundredYearChartFixed.tsx**
   - 주능/주흉 데이터 필드
   - 주능/주흥 기반 배경색 로직

2. **HundredYearChart.tsx**
   - 동일한 주능/주흥 기능

### 페이지 컴포넌트
1. **UnifiedSajuAnalysisPage.tsx**
   - 주능/주흥 범례 렌더링
   - 차트에 주능/주흥 데이터 전달

2. **UnifiedSajuAnalysisPageWithLifeChart.tsx**
   - 주능/주흥 범례 렌더링
   - 차트에 주능/주흥 데이터 전달

3. **TestComprehensiveScoresPage.tsx**
   - 테스트 페이지의 주능/주흥 기능

### API 서비스
1. **sajuAnalysisApi.ts**
   - 주능/주흥 데이터 생성 로직

2. **lifetimeFortuneApi.ts**
   - 주능/주흥 점수 계산

### 데이터 파일
1. **sajuRadarData.ts**
   - 주능/주흥 관련 레이더 데이터

## ✅ 작업 내용

### 1. 차트 컴포넌트 수정

#### HundredYearChartFixed.tsx & HundredYearChart.tsx
- [ ] `주능주흥` 필드 제거
- [ ] 주능/주흥 기반 배경색 로직 제거
- [ ] 기본 종합운세만 표시하도록 수정

### 2. 페이지 컴포넌트 수정

#### UnifiedSajuAnalysisPage.tsx & UnifiedSajuAnalysisPageWithLifeChart.tsx
- [ ] 주능/주흥 범례 UI 제거
- [ ] 차트에 전달하는 주능/주흥 데이터 제거

### 3. API 서비스 수정

#### sajuAnalysisApi.ts & lifetimeFortuneApi.ts
- [ ] 주능/주흥 계산 로직 제거
- [ ] 관련 함수 및 타입 정의 제거

### 4. 데이터 파일 정리
- [ ] sajuRadarData.ts 파일 삭제 또는 수정

## 💡 기대 효과

1. **UI 단순화**
   - 불필요한 색상 범례 제거
   - 사용자에게 혼란 줄이기

2. **성능 개선**
   - 불필요한 계산 로직 제거
   - 렌더링 속도 향상

3. **코드 간소화**
   - 주능/주흥 관련 코드 제거
   - 유지보수 용이성 향상

## 🔍 주의사항

### 호환성 유지
- 기존 데이터 구조와 호환성 유지
- 종합운세 표시 기능은 정상 작동해야 함

### 테스트 필수
- 변경 후 모든 차트가 정상 표시되는지 확인
- 에러 없이 동작하는지 검증

## 📊 세부 수정 사항

### 제거할 코드 패턴

1. **색상 범례 HTML**
```html
<div class="mt-4 flex justify-center space-x-3 text-xs">
  <div class="flex items-center space-x-1">
    <span class="w-3 h-3 rounded" style="background-color: rgba(255, 215, 0, 0.7);"></span>
    <span class="text-gray-700 dark:text-gray-300">주능-대길</span>
  </div>
  <!-- ... -->
</div>
```

2. **주능/주흥 타입 정의**
```typescript
주능주흥?: {
  type: '대길' | '길' | '평' | '흉' | '대흉'
  label: string
  color: string
}
```

3. **배경색 로직**
```typescript
const getBackgroundColor = (data: YearlyFortune) => {
  if (data.주능주흥) {
    // 이 로직 제거
  }
  return undefined; // 기본 배경색 사용
}
```

## 🚀 실행 계획

### 1단계: 분석
- 모든 관련 파일에서 주능/주흥 코드 위치 파악

### 2단계: 수정
- 차트 컴포넌트에서 주능/주흥 관련 코드 제거
- 페이지 컴포넌트에서 범례 UI 제거
- API 서비스에서 관련 로직 제거

### 3단계: 테스트
- 모든 페이지에서 차트 정상 표시 확인
- 콘솔 에러 없는지 확인

### 4단계: 정리
- 불필요한 파일 삭제
- 코드 정리

---

**작성일**: 2025년 9월 23일  
**상태**: 🔴 대기 중  
**우선순위**: 🟡 중간  
**담당**: 프론트엔드 개발팀  
**예상 소요 시간**: 30분