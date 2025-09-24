# 🔧 오늘의 운세 일관성 통일 작업지시서

## 📌 문제 상황

### 🔍 발견된 문제점

**홈페이지와 일간 캘린더의 오늘의 운세가 서로 다름**

1. **홈페이지 (`HomePage.tsx`)**:
   - 하드코딩된 고정 데이터 사용
   - 랜덤 숫자 생성 (`Math.floor(Math.random() * 100)`)
   - 사주 기반 계산 없음
   - 매번 새로고침 시 다른 값

2. **일간 캘린더 (`DayView.tsx`)**:
   - `TodayFortuneSection` 컴포넌트 사용
   - `calculateDailyFortune()` 함수로 실제 사주 계산
   - 사용자 생년월일시 기반 정확한 운세
   - 일관된 결과

### 🎯 근본 원인
- **홈페이지**: 목업 데이터 (임시 하드코딩)
- **캘린더**: 실제 사주명리 계산
- **통일성 부족**: 서로 다른 데이터 소스 사용

## ✅ 해결 방안

### 📋 통일 기준
**설정에서 입력한 로그인 사용자의 생년월일시를 기반으로 모든 운세 통일**

## 🔧 수정 대상 파일

### 1. **HomePage.tsx** (우선순위: 🔴 긴급)

#### 현재 상태
```typescript
// 🚫 하드코딩된 목업 데이터
const todayFortune = {
  luckyNumber: Math.floor(Math.random() * 100), // 랜덤
  luckyColor: '보라색', // 고정값
  direction: '동쪽', // 고정값
  message: '오늘은 새로운 기회가...', // 고정 메시지
};
```

#### 수정 후
```typescript
// ✅ 실제 사주 기반 계산
const { birthInfo } = useSajuSettingsStore();
const { user } = useAuthStore();

const dailyFortune = useMemo(() => {
  if (!birthInfo) return null;
  return calculateDailyFortune(birthInfo, new Date());
}, [birthInfo]);
```

### 2. **TodayFortuneSection.tsx** (검증 필요)

#### 현재 문제점
- localStorage와 Store 동기화 로직 복잡
- 여러 데이터 소스로 인한 혼동
- 디버깅 로그 과다

#### 개선 방향
- 사용자 인증 정보와 설정 정보 통합
- 단일 데이터 소스 사용
- 로직 단순화

### 3. **DayView.tsx** (현재 정상)

#### 현재 상태: ✅ 정상
- `TodayFortuneSection` 컴포넌트 사용
- 사주 기반 계산 정상 작동

### 4. **기타 운세 표시 컴포넌트**

#### 확인 필요한 파일들
- `DiaryPage.tsx`
- `FortunePage.tsx`
- `TodayFortuneWidget.tsx`

## 📊 상세 수정 작업

### 1단계: HomePage.tsx 수정

#### A. Import 추가
```typescript
import { useSajuSettingsStore } from '@/stores/sajuSettingsStore';
import { useAuthStore } from '@/stores/authStore';
import { calculateDailyFortune } from '@/utils/dailyFortuneCalculator';
import { useMemo } from 'react';
```

#### B. 하드코딩 데이터 제거
```typescript
// 🚫 제거할 코드
const todayFortune = {
  date: new Date().toLocaleDateString(...),
  luckyNumber: Math.floor(Math.random() * 100),
  luckyColor: '보라색',
  direction: '동쪽',
  message: '오늘은 새로운...'
};
```

#### C. 사주 기반 계산 로직 추가
```typescript
// ✅ 추가할 코드
const { birthInfo } = useSajuSettingsStore();
const { user } = useAuthStore();

const dailyFortune = useMemo(() => {
  if (!birthInfo) return null;
  try {
    return calculateDailyFortune(birthInfo, new Date());
  } catch (error) {
    console.error('Fortune calculation failed:', error);
    return null;
  }
}, [birthInfo]);
```

#### D. UI 조건부 렌더링
```typescript
// ✅ 사주 정보 없을 때
if (!birthInfo || !dailyFortune) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-12">
      <h2 className="text-2xl font-bold mb-4">🌟 오늘의 운세</h2>
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          운세를 보려면 설정에서 생년월일시를 입력해주세요
        </p>
        <Link
          to="/settings"
          className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
        >
          설정하러 가기
        </Link>
      </div>
    </div>
  );
}
```

### 2단계: 설정 페이지 연동 강화

#### A. AuthStore와 SajuSettingsStore 동기화
```typescript
// 사용자 로그인 시 자동으로 설정 정보 로드
useEffect(() => {
  if (user && !birthInfo) {
    loadUserSettings(user.id);
  }
}, [user, birthInfo]);
```

#### B. 설정 저장 시 Store 업데이트
```typescript
// 설정 저장 완료 후 Store 즉시 업데이트
const handleSaveSettings = async (settings) => {
  await saveUserSettings(user.id, settings);
  setBirthInfo(convertToSajuBirthInfo(settings));
};
```

### 3단계: 데이터 검증 및 에러 처리

#### A. 생년월일시 유효성 검증
```typescript
const isValidBirthInfo = (birthInfo) => {
  return birthInfo &&
         birthInfo.year && birthInfo.month && birthInfo.day &&
         birthInfo.year > 1900 && birthInfo.year < 2100 &&
         birthInfo.month >= 1 && birthInfo.month <= 12 &&
         birthInfo.day >= 1 && birthInfo.day <= 31;
};
```

#### B. 운세 계산 실패 시 대체 로직
```typescript
const getSafeFortuneData = (birthInfo, date) => {
  try {
    return calculateDailyFortune(birthInfo, date);
  } catch (error) {
    console.error('Fortune calculation failed:', error);
    return getDefaultFortune(date); // 안전한 기본값 반환
  }
};
```

## 🎯 예상 결과

### ✅ 수정 완료 후
1. **일관된 운세**: 모든 페이지에서 동일한 운세 표시
2. **사주 기반**: 실제 생년월일시 기반 정확한 계산
3. **실시간 반영**: 설정 변경 시 즉시 업데이트
4. **에러 처리**: 안전한 대체 로직 제공

### 📊 데이터 흐름
```
사용자 설정 (생년월일시)
    ↓
SajuSettingsStore
    ↓
calculateDailyFortune()
    ↓
모든 페이지 일관된 운세 표시
```

## ⚠️ 주의사항

### 🔒 보안
- 생년월일시 정보는 민감 정보
- localStorage 암호화 고려
- 서버 사이드 검증 필요

### 🎨 UX
- 설정 정보 없을 때 친절한 안내
- 로딩 상태 표시
- 에러 상황 사용자 친화적 메시지

### 🚀 성능
- 불필요한 재계산 방지 (useMemo 활용)
- 컴포넌트 리렌더링 최적화
- 캐싱 전략 고려

## 📋 테스트 체크리스트

### 기능 테스트
- [ ] 홈페이지와 캘린더 운세 일치 확인
- [ ] 설정 변경 시 실시간 반영 확인
- [ ] 생년월일시 없을 때 안내 메시지 표시
- [ ] 다양한 생년월일시로 운세 계산 확인

### 에러 테스트
- [ ] 잘못된 생년월일시 입력 시 처리
- [ ] 네트워크 오류 시 대체 로직
- [ ] localStorage 접근 불가 시 처리

### 호환성 테스트
- [ ] 기존 사용자 데이터 마이그레이션
- [ ] 다양한 브라우저에서 정상 동작
- [ ] 모바일 환경 테스트

## 🚀 실행 계획

### 1단계 (30분)
- HomePage.tsx 수정
- 기본 사주 계산 로직 적용

### 2단계 (20분)
- Store 동기화 로직 개선
- 에러 처리 추가

### 3단계 (10분)
- 테스트 및 검증
- 사용자 경험 최적화

**총 예상 시간**: 60분
**우선순위**: 🔴 긴급
**담당**: 프론트엔드 개발팀

---

**작성일**: 2025년 9월 24일
**상태**: 🔴 대기 중
**관련 이슈**: 홈페이지-캘린더 운세 불일치