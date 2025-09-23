# 🔧 로그인 연동 사주 설정 통합 작업지시서

## 📌 현재 상황 분석

### 문제점
1. **설정하러 가기 버튼**이 클릭되지 않음
2. 로그인된 사용자의 사주 정보가 자동으로 적용되지 않음
3. 3가지 독립적인 시스템이 통합되지 않음:
   - 인증 시스템 (authStore)
   - 사주 설정 (sajuSettingsStore)
   - 고객 관리 시스템 (Customer API)

### 시스템 구조
```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Auth Store │     │ Saju Settings│     │  Customer   │
│   (로그인)   │ ──X─│   (사주정보)   │ ──X─│  Management │
└─────────────┘     └──────────────┘     └─────────────┘
       │                    │                     │
       └────────────────────┴─────────────────────┘
                    통합 필요!
```

## ✅ 해결 방안

### Phase 1: 설정하러 가기 버튼 활성화 (완료)

**수정된 파일**: `packages/web/src/components/TodayFortuneSection.tsx`

#### 변경 사항:
1. **라우팅 추가**
   ```typescript
   import { useNavigate } from 'react-router-dom';
   const navigate = useNavigate();
   ```

2. **버튼 클릭 핸들러 구현**
   ```typescript
   onClick={() => {
     navigate('/settings');
   }}
   ```

3. **로그인 상태 표시**
   - 로그인된 사용자 이메일 표시
   - 안내 메시지 추가

### Phase 2: 로그인 사용자 자동 사주 설정 (권장)

#### 2-1. 설정 페이지 개선
```typescript
// SettingsPage.tsx 수정
useEffect(() => {
  // 로그인된 사용자 정보로 자동 채우기
  const { user } = useAuthStore.getState();
  if (user && user.birthInfo) {
    setPersonalInfo({
      birthDate: user.birthInfo.birthDate,
      birthTime: user.birthInfo.birthTime,
      // ...
    });
  }
}, []);
```

#### 2-2. 로그인 시 사주 정보 자동 로드
```typescript
// authStore.ts login 함수 수정
login: async (credentials) => {
  // ... 로그인 처리

  // 사주 정보도 함께 로드
  if (userData.birthInfo) {
    useSajuSettingsStore.getState().setBirthInfo(userData.birthInfo);
  }

  // 고객 정보도 연동
  const customer = await findCustomerByEmail(userData.email);
  if (customer) {
    // 고객 정보 활용
  }
}
```

### Phase 3: 통합 데이터 관리 시스템

#### 3-1. 통합 Hook 생성
```typescript
// hooks/useUserSajuData.ts
export const useUserSajuData = () => {
  const { user } = useAuthStore();
  const { birthInfo } = useSajuSettingsStore();
  const [customer, setCustomer] = useState(null);

  useEffect(() => {
    if (user) {
      // 사용자 정보로 사주 데이터 조회
      loadSajuData(user.id);
    }
  }, [user]);

  return { user, birthInfo, customer };
};
```

#### 3-2. 데이터 동기화
```typescript
// 설정 저장 시 모든 저장소 업데이트
const saveSettings = async () => {
  // localStorage 저장
  localStorage.setItem('sajuapp-personal-info', JSON.stringify(personalInfo));

  // sajuSettingsStore 업데이트
  useSajuSettingsStore.getState().setBirthInfo(personalInfo);

  // 고객 DB에도 저장 (로그인된 경우)
  if (user) {
    await updateCustomerSajuInfo(user.id, personalInfo);
  }
};
```

## 🔍 테스트 시나리오

### 시나리오 1: 비로그인 사용자
1. `/calendar` → Day View 접속
2. "오늘의 운세" 섹션에 "설정하러 가기" 버튼 표시
3. 버튼 클릭 → `/settings` 페이지 이동
4. 생년월일시 입력 및 저장
5. 캘린더로 돌아와서 운세 확인

### 시나리오 2: 로그인 사용자 (사주 정보 없음)
1. 로그인 상태로 캘린더 접속
2. "설정하러 가기" 버튼 + 로그인 이메일 표시
3. 설정 페이지에서 정보 입력
4. 저장 시 사용자 계정과 연동

### 시나리오 3: 로그인 사용자 (사주 정보 있음)
1. 로그인 시 자동으로 사주 정보 로드
2. 운세가 바로 표시됨
3. 설정 변경 가능

## 📊 현재 진행 상황

### ✅ 완료된 작업
1. **TodayFortuneSection.tsx 수정**
   - useNavigate 추가
   - 설정하러 가기 버튼 클릭 핸들러 구현
   - 로그인 상태 표시 추가

2. **CustomerSelector.tsx 개선**
   - 고객 없을 때 안내 UI
   - 설정 페이지 네비게이션

### 🔄 추가 필요 작업
1. **설정 페이지 개선**
   - 로그인 사용자 정보 자동 채우기
   - 저장 후 이전 페이지로 돌아가기

2. **데이터 통합**
   - authStore와 sajuSettingsStore 연동
   - 고객 관리 시스템과 통합

3. **자동 사주 계산**
   - 로그인 시 사주 정보 자동 로드
   - 설정 변경 시 즉시 반영

## 🚀 즉시 테스트 방법

```bash
# 1. 프론트엔드 확인
# http://localhost:4000

# 2. 캘린더 페이지 접속
# http://localhost:4000/calendar

# 3. Day View 선택 후 오늘의 운세 섹션 확인

# 4. "설정하러 가기" 버튼 테스트
# - 클릭 시 /settings 페이지로 이동 확인
# - 로그인 상태 표시 확인

# 5. 설정 페이지에서 정보 입력 및 저장
# - 생년월일시 입력
# - 저장 버튼 클릭
# - 캘린더로 돌아와서 운세 확인
```

## ⚡ 중요 권장사항

### 1. 단일 진실의 원천 (Single Source of Truth)
- 사주 정보는 한 곳에서만 관리
- 권장: sajuSettingsStore를 중앙 저장소로 사용
- 다른 시스템은 이를 참조

### 2. 자동 동기화
- 로그인 시 자동으로 사주 정보 로드
- 설정 변경 시 모든 관련 컴포넌트 자동 업데이트

### 3. 사용자 경험 개선
- 로그인하면 즉시 운세 확인 가능
- 한 번 입력한 정보는 계속 유지
- 다른 기기에서도 동일한 정보 사용

## 📋 체크리스트

- [x] 설정하러 가기 버튼 클릭 가능
- [x] 설정 페이지로 네비게이션
- [x] 로그인 상태 표시
- [ ] 로그인 사용자 정보 자동 채우기
- [ ] 사주 정보 자동 로드
- [ ] 데이터 동기화
- [ ] 고객 관리 시스템 통합

---

**작성일**: 2025년 9월 23일
**상태**: 🟡 진행 중
**우선순위**: 🔴 긴급
**담당**: 프론트엔드 개발팀