# 🔧 운세 표시 기능 정상화 작업지시서

## 📌 현재 문제 상황

### 증상
1. 설정 페이지에서 생년월일시 정보 입력 후 저장
2. 캘린더 페이지로 이동
3. **오늘의 운세가 표시되지 않음**
4. 여전히 "설정하러 가기" 버튼만 표시됨

### 근본 원인
데이터가 3개의 독립적인 저장소에 분산되어 제대로 연동되지 않음:
1. **localStorage** - 설정 페이지에서 저장
2. **sajuSettingsStore (Zustand)** - 운세 계산에 사용
3. **Customer API** - 고객 관리 시스템

## ✅ 해결 방안

### Phase 1: 설정 저장 로직 수정 (완료)

**수정된 파일**: `packages/web/src/pages/SettingsPage.tsx`

#### 변경 사항:
1. **sajuSettingsStore 연동 추가**
   ```typescript
   import { useSajuSettingsStore } from '@/stores/sajuSettingsStore';
   const { setBirthInfo } = useSajuSettingsStore();
   ```

2. **사주 정보 변환 및 저장**
   ```typescript
   const sajuBirthInfo = {
     year: new Date(personalInfo.birthDate).getFullYear(),
     month: new Date(personalInfo.birthDate).getMonth() + 1,
     day: new Date(personalInfo.birthDate).getDate(),
     hour: parseInt(personalInfo.birthTime.split(':')[0]) || 0,
     minute: parseInt(personalInfo.birthTime.split(':')[1]) || 0,
     isLunar: personalInfo.calendarType === 'lunar',
     isMale: personalInfo.gender === 'male',
     name: personalInfo.gender === 'male' ? '사용자(남)' : '사용자(여)',
   };

   setBirthInfo(sajuBirthInfo);
   ```

3. **저장 후 자동 이동**
   - 설정 저장 성공 시 캘린더로 이동 옵션 제공
   - 사용자 확인 후 이동

### Phase 2: 운세 계산 함수 확인 (완료)

**확인된 파일**: `packages/web/src/utils/dailyFortuneCalculator.ts`
- `calculateDailyFortune()` 함수 정상
- 오행 기반 운세 계산 로직 정상
- 개인별 고유 시드값으로 운세 차별화

### Phase 3: 데이터 흐름 정리

```
설정 페이지 (SettingsPage)
    ↓ 저장
┌──────────────────┬────────────────────┐
│   localStorage   │  sajuSettingsStore │
└──────────────────┴────────────────────┘
                   ↑
            TodayFortuneSection
                   ↓
              운세 계산 및 표시
```

## 🔍 테스트 시나리오

### 시나리오 1: 신규 사용자
1. 캘린더 페이지 접속 (`/calendar`)
2. Day View 선택
3. "설정하러 가기" 버튼 클릭
4. 설정 페이지에서 정보 입력:
   - 생년월일: 1990-01-01
   - 생시: 14:30
   - 음력/양력: 양력
   - 성별: 남성
5. "저장" 버튼 클릭
6. 캘린더로 이동 확인 메시지 → "예"
7. **운세가 표시되는지 확인**

### 시나리오 2: 기존 사용자
1. 이미 설정 정보가 있는 경우
2. 캘린더 페이지 접속
3. 운세가 바로 표시되는지 확인

## 📊 현재 상태

### ✅ 완료된 작업
1. **SettingsPage.tsx 수정**
   - sajuSettingsStore 연동
   - 사주 정보 변환 로직 추가
   - 저장 후 캘린더 이동 옵션

2. **TodayFortuneSection.tsx 수정**
   - 설정하러 가기 버튼 활성화
   - 로그인 상태 표시

3. **운세 계산 함수 검증**
   - dailyFortuneCalculator.ts 정상 동작

### 🚀 추가 권장사항

#### 1. 초기 로드 시 데이터 동기화
```typescript
// SettingsPage.tsx useEffect에 추가
useEffect(() => {
  // localStorage와 Store 동기화
  const savedInfo = localStorage.getItem('sajuapp-personal-info');
  const storeInfo = useSajuSettingsStore.getState().birthInfo;

  if (savedInfo && !storeInfo) {
    // localStorage에만 있고 Store에 없으면 동기화
    const parsed = JSON.parse(savedInfo);
    // Store에 저장
  }
}, []);
```

#### 2. 디버깅 도구 추가
```typescript
// TodayFortuneSection에 디버그 정보 추가
console.log('birthInfo:', birthInfo);
console.log('dailyFortune:', dailyFortune);
```

#### 3. 데이터 영속성 개선
- Zustand persist 미들웨어 활용
- 페이지 새로고침 시에도 데이터 유지

## 🚀 즉시 테스트 방법

```bash
# 1. 브라우저 개발자 도구 열기 (F12)

# 2. Application 탭 → Local Storage 확인
# - sajuapp-personal-info 키 확인
# - saju-settings 키 확인

# 3. Console에서 Store 상태 확인
# 브라우저 콘솔에 입력:
localStorage.getItem('saju-settings')

# 4. 캘린더 페이지에서 운세 확인
http://localhost:4000/calendar
# Day View 선택 후 오늘의 운세 섹션 확인
```

## ⚡ 중요 체크포인트

### 1. 데이터 포맷 일치 확인
- SettingsPage의 personalInfo 형식
- sajuSettingsStore의 SajuBirthInfo 형식
- 두 형식 간 변환이 정확한지 확인

### 2. Store 영속성 확인
- 페이지 새로고침 후에도 데이터 유지
- persist 미들웨어 정상 동작

### 3. 운세 계산 트리거
- birthInfo가 null이 아닐 때만 계산
- calculateDailyFortune 함수 호출 확인

## 📋 체크리스트

- [x] 설정 페이지에서 sajuSettingsStore 연동
- [x] 사주 정보 변환 로직 구현
- [x] 저장 후 캘린더 이동 기능
- [x] 운세 계산 함수 검증
- [ ] 페이지 새로고침 후 데이터 유지 테스트
- [ ] 운세 표시 최종 확인
- [ ] 디버깅 로그 제거

## 🐛 트러블슈팅

### 문제: 저장했는데도 운세가 안 보임
1. 브라우저 개발자 도구 → Application → Local Storage
2. `saju-settings` 키 확인
3. 값이 없으면 → Store 저장 실패
4. 값이 있으면 → TodayFortuneSection 렌더링 문제

### 문제: 새로고침하면 설정이 사라짐
1. Zustand persist 설정 확인
2. localStorage 키 이름 확인 (`saju-settings`)
3. Store 초기화 로직 확인

---

**작성일**: 2025년 9월 23일
**상태**: 🟡 진행 중
**우선순위**: 🔴 긴급
**담당**: 프론트엔드 개발팀