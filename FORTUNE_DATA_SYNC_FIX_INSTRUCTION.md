# 🔧 운세 데이터 동기화 문제 해결 작업지시서

## 📌 현재 문제 상황

### 증상
1. 로그인 완료 (demo@sajuapp.com)
2. 설정 페이지에서 생년월일시 정보 입력 및 저장
3. 캘린더 페이지 Day View에서 여전히 "설정이 필요합니다" 메시지 표시
4. **오늘의 운세가 표시되지 않음**

### 근본 원인
**sajuSettingsStore가 localStorage와 동기화되지 않는 문제**
- localStorage에는 데이터가 저장되지만
- Zustand Store(sajuSettingsStore)에는 제대로 반영되지 않음
- TodayFortuneSection이 Store에서만 데이터를 읽음

## ✅ 해결 방안

### Phase 1: 디버깅 로그 추가 (완료)

**수정된 파일**:
- `TodayFortuneSection.tsx` - 데이터 로드 상태 추적
- `SettingsPage.tsx` - 저장 과정 추적

### Phase 2: localStorage와 Store 동기화 (완료)

**수정된 파일**: `TodayFortuneSection.tsx`

#### 추가된 로직:
```typescript
// localStorage에서 데이터 불러와서 Store에 동기화
React.useEffect(() => {
  if (!birthInfo) {
    const savedPersonalInfo = localStorage.getItem('sajuapp-personal-info');
    if (savedPersonalInfo) {
      // 데이터 변환 후 Store에 저장
      setBirthInfo(sajuBirthInfo);
    }
  }
}, [birthInfo, setBirthInfo]);
```

### Phase 3: 데이터 흐름 검증

#### 데이터 저장 흐름:
```
설정 페이지 입력
    ↓
personalInfo (localStorage 형식)
    ↓ 변환
sajuBirthInfo (Store 형식)
    ↓
┌─────────────┬──────────────┐
│ localStorage│ sajuSettings │
│   저장 ✓    │   Store ?    │
└─────────────┴──────────────┘
```

#### 데이터 로드 흐름:
```
TodayFortuneSection 렌더링
    ↓
Store 확인 → 없음
    ↓
localStorage 확인 → 있음
    ↓
변환 후 Store 저장
    ↓
운세 계산 및 표시
```

## 🔍 테스트 시나리오

### 브라우저 콘솔 확인 사항

1. **설정 저장 시 콘솔 로그**:
```javascript
[설정페이지] 사주 정보 저장됨: {year: 1990, month: 1, ...}
[설정페이지] Store에 저장된 정보: {year: 1990, month: 1, ...}
```

2. **캘린더 페이지 로드 시 콘솔 로그**:
```javascript
[TodayFortuneSection] birthInfo가 없음, localStorage 확인...
[TodayFortuneSection] localStorage에서 데이터 발견: {birthDate: "1990-01-01", ...}
[TodayFortuneSection] Store에 저장할 사주 정보: {year: 1990, ...}
[TodayFortuneSection] Calculated fortune: {totalLuck: 75, ...}
```

### 수동 테스트 절차

1. **브라우저 개발자 도구 열기 (F12)**
2. **Application 탭 → Local Storage 확인**
   - `sajuapp-personal-info` 키 존재 확인
   - `saju-settings` 키 존재 확인

3. **Console 탭에서 직접 확인**:
```javascript
// localStorage 데이터 확인
localStorage.getItem('sajuapp-personal-info')

// Store 데이터 확인
localStorage.getItem('saju-settings')
```

4. **캘린더 페이지 새로고침**
   - Ctrl+F5로 강력 새로고침
   - 운세가 표시되는지 확인

## 📊 현재 상태

### ✅ 완료된 작업
1. **디버깅 로그 추가**
   - 데이터 저장/로드 과정 추적 가능

2. **localStorage → Store 자동 동기화**
   - TodayFortuneSection이 로드될 때 자동으로 동기화

3. **데이터 변환 로직 구현**
   - personalInfo → sajuBirthInfo 변환

### 🚨 주의사항

#### 데이터 형식 차이
**localStorage (personalInfo)**:
```json
{
  "birthDate": "1990-01-01",
  "birthTime": "14:30",
  "calendarType": "solar",
  "gender": "male"
}
```

**Store (sajuBirthInfo)**:
```json
{
  "year": 1990,
  "month": 1,
  "day": 1,
  "hour": 14,
  "minute": 30,
  "isLunar": false,
  "isMale": true,
  "name": "사용자(남)"
}
```

## 🐛 트러블슈팅

### 문제 1: 설정 저장 후에도 운세 안 보임
**해결책**:
1. 브라우저 캐시 삭제
2. localStorage 직접 확인
3. 페이지 강력 새로고침 (Ctrl+F5)

### 문제 2: Store가 persist되지 않음
**확인 사항**:
- Zustand persist 미들웨어 설정
- localStorage 키 이름: `saju-settings`

### 문제 3: 데이터는 있는데 계산 실패
**확인 사항**:
- birthInfo 필드 누락 여부
- 날짜 형식 파싱 오류
- calculateDailyFortune 함수 에러

## 🚀 즉시 해결 방법

### 임시 해결책 (브라우저 콘솔에서 실행)
```javascript
// Store에 직접 데이터 주입 (테스트용)
const testData = {
  year: 1990,
  month: 1,
  day: 1,
  hour: 14,
  minute: 30,
  isLunar: false,
  isMale: true,
  name: "테스트"
};

localStorage.setItem('saju-settings', JSON.stringify({
  state: { birthInfo: testData },
  version: 0
}));

// 페이지 새로고침
location.reload();
```

## 📋 체크리스트

- [x] localStorage와 Store 동기화 로직 추가
- [x] 데이터 변환 함수 구현
- [x] 디버깅 로그 추가
- [ ] 페이지 새로고침 후 데이터 유지 확인
- [ ] 운세 계산 및 표시 확인
- [ ] 프로덕션용 디버깅 로그 제거

## 🎯 최종 목표

1. 설정 페이지에서 정보 입력 → 저장
2. 캘린더 페이지로 이동
3. **오늘의 운세가 바로 표시됨**
4. 페이지 새로고침 후에도 운세 유지

---

**작성일**: 2025년 9월 23일
**상태**: 🟡 진행 중
**우선순위**: 🔴 긴급
**예상 해결 시간**: 10분