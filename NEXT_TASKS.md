# 운명나침반 - 다음 개발 작업 지시서
## 작성일: 2025-09-01

---

## 📊 현재 완료된 작업 요약

### ✅ 완료된 기능
1. **캘린더 시스템**
   - 월간 캘린더 뷰 할일 표시 (우선순위별 색상, 툴팁)
   - 태그 시스템 (CRUD, 이벤트 연결)
   - 4가지 뷰 모드 (Year/Month/Week/Day)

2. **백엔드 서비스**
   - Calendar Service (포트 4003) - 일정, 태그 관리
   - Diary Service (포트 4004) - 일기 CRUD, 검색

3. **사주 분석 시스템**
   - 천간/지지 오행 표시
   - 명리학 데이터베이스
   - 차트 시각화

---

## 🎯 즉시 실행 가능한 작업 목록

### 1. 🔗 DiaryModal 백엔드 연동 완성
**우선순위: 🔴 매우 높음**
**예상 소요시간: 1-2시간**
**현재 상태: 백엔드 준비 완료, 프론트엔드 연동 필요**

#### 작업 내용:
```typescript
// 1. DiaryModal.tsx 수정 위치
packages/web/src/components/DiaryModal.tsx

// 2. 수정 내용
- diaryService import 추가
- 날짜별 일기 조회 (useEffect)
- 저장 시 API 호출 (createDiary/updateDiary)
- 로딩 상태 처리
- 에러 핸들링
```

#### 구현 세부사항:
```typescript
// DiaryModal에 추가할 코드
import { diaryService, DiaryEntry } from '@/services/api';

// State 추가
const [existingDiary, setExistingDiary] = useState<DiaryEntry | null>(null);
const [isLoading, setIsLoading] = useState(false);

// 날짜별 일기 조회
useEffect(() => {
  const fetchDiary = async () => {
    try {
      const diary = await diaryService.getDiaryByDate(selectedDate);
      setExistingDiary(diary);
      // 폼 데이터 설정
    } catch (error) {
      // 404는 정상 (해당 날짜 일기 없음)
    }
  };
  fetchDiary();
}, [selectedDate]);

// 저장 함수
const handleSave = async () => {
  if (existingDiary) {
    await diaryService.updateDiary(existingDiary.id, formData);
  } else {
    await diaryService.createDiary(formData);
  }
};
```

#### 테스트 체크리스트:
- [ ] 일기 작성 후 저장 확인
- [ ] 같은 날짜 재방문 시 기존 일기 표시
- [ ] 수정 후 저장 확인
- [ ] 날짜 변경 시 새 일기/기존 일기 전환

---

### 2. 🌙 음력 달력 통합
**우선순위: 🟡 중간**
**예상 소요시간: 3-4시간**

#### 작업 내용:
```bash
# 1. 라이브러리 설치
cd packages/web
npm install korean-lunar-calendar

# 2. 타입 정의 확인
npm install -D @types/korean-lunar-calendar
# 없으면 직접 작성: src/types/lunar.d.ts
```

#### 구현 위치:
```typescript
// 1. 유틸리티 함수 생성
packages/web/src/utils/lunarCalendar.ts

// 2. MonthView 컴포넌트 수정
packages/web/src/components/Calendar/MonthView.tsx
- 각 날짜 셀에 음력 날짜 표시
- format: "음 3.15" 형식

// 3. 설정 페이지 옵션 추가
packages/web/src/pages/SettingsPage.tsx
- 음력 표시 ON/OFF 토글

// 4. 사주 입력 폼 수정
packages/web/src/components/saju/SajuInputForm.tsx
- 음력/양력 선택 라디오 버튼
- 음력 선택 시 자동 변환
```

#### 구현 예시:
```typescript
// utils/lunarCalendar.ts
import KoreanLunarCalendar from 'korean-lunar-calendar';

export const solarToLunar = (date: Date) => {
  const calendar = new KoreanLunarCalendar();
  calendar.setSolarDate(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate()
  );
  return {
    month: calendar.getLunarMonth(),
    day: calendar.getLunarDay(),
    isLeapMonth: calendar.getLeapMonth()
  };
};

// MonthView에서 사용
const lunarDate = solarToLunar(day);
<span className="text-xs text-gray-500">
  음 {lunarDate.month}.{lunarDate.day}
</span>
```

---

### 3. 🔍 통합 검색 시스템
**우선순위: 🟡 중간**
**예상 소요시간: 4-5시간**

#### 작업 내용:

##### A. 검색 컴포넌트 생성
```typescript
// packages/web/src/components/SearchBar.tsx
- 전역 검색바 컴포넌트
- 검색 범위 선택 (일정/할일/일기/태그)
- 실시간 검색 (디바운싱 300ms)
- 검색 결과 드롭다운
```

##### B. 검색 결과 페이지
```typescript
// packages/web/src/pages/SearchResults.tsx
- 통합 검색 결과 표시
- 카테고리별 그룹화
- 결과 클릭 시 해당 페이지/모달로 이동
```

##### C. API 통합
```typescript
// packages/web/src/services/searchService.ts
export const searchService = {
  searchAll: async (query: string) => {
    const [events, diaries, todos] = await Promise.all([
      eventService.getEvents({ search: query }),
      diaryService.searchDiaries({ q: query }),
      // todos는 로컬 필터링
    ]);
    return { events, diaries, todos };
  }
};
```

#### 검색 UI 예시:
```typescript
// Header에 추가할 검색바
<div className="relative">
  <input
    type="text"
    placeholder="일정, 할일, 일기 검색..."
    className="w-64 px-4 py-2 rounded-lg"
    onChange={handleSearch}
  />
  {results.length > 0 && (
    <div className="absolute top-full mt-2 w-full bg-white shadow-lg rounded-lg">
      {/* 검색 결과 표시 */}
    </div>
  )}
</div>
```

---

### 4. 📱 알림 시스템 구현
**우선순위: 🟢 낮음**
**예상 소요시간: 3-4시간**

#### 작업 내용:
1. **브라우저 알림 권한 요청**
2. **일정 알림 스케줄러**
3. **할일 마감 알림**
4. **일기 작성 리마인더**

#### 구현 위치:
```typescript
// packages/web/src/utils/notifications.ts
export const requestNotificationPermission = async () => {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
};

export const scheduleNotification = (title: string, body: string, time: Date) => {
  const delay = time.getTime() - Date.now();
  if (delay > 0) {
    setTimeout(() => {
      new Notification(title, { body, icon: '/icon.png' });
    }, delay);
  }
};
```

---

### 5. 📊 대시보드 페이지 개발
**우선순위: 🟢 낮음**
**예상 소요시간: 4-5시간**

#### 작업 내용:
```typescript
// packages/web/src/pages/Dashboard.tsx
```

##### 구성 요소:
1. **오늘의 요약**
   - 오늘 일정 목록
   - 할일 진행 상황
   - 일기 작성 여부

2. **주간 통계**
   - 할일 완료율 차트
   - 일기 작성 빈도
   - 태그별 이벤트 분포

3. **월간 히트맵**
   - 활동량 시각화
   - 기분 트렌드

4. **빠른 액션**
   - 일정 추가 버튼
   - 할일 추가 버튼
   - 일기 작성 버튼

---

## 🛠️ 기술적 개선 사항

### 1. 성능 최적화
- [ ] React.lazy로 페이지 코드 스플리팅
- [ ] 이미지 최적화 (WebP 변환)
- [ ] API 응답 캐싱 (React Query 도입 검토)

### 2. 코드 품질
- [ ] ESLint 설정 파일 생성
- [ ] Prettier 설정 통일
- [ ] 단위 테스트 추가 (Jest)

### 3. 배포 준비
- [ ] 환경 변수 정리 (.env.example)
- [ ] Docker 컨테이너화
- [ ] CI/CD 파이프라인 구성

---

## 📝 작업 실행 명령어

### 개발 서버 실행 (3개 터미널)
```bash
# Terminal 1 - 프론트엔드
cd packages/web && npx vite --port 4000

# Terminal 2 - 캘린더 서비스
cd packages/backend/services/calendar && npm run dev

# Terminal 3 - 다이어리 서비스  
cd packages/backend/services/diary && npm run dev
```

### 작업 브랜치 생성
```bash
# 기능별 브랜치 생성
git checkout -b feature/diary-modal-integration
git checkout -b feature/lunar-calendar
git checkout -b feature/search-system
```

---

## ⚠️ 주의사항

1. **포트 관리**
   - 프론트엔드: 4000 (절대 고정)
   - 캘린더: 4003
   - 다이어리: 4004
   - 새 서비스: 4005부터 순차 할당

2. **API 호출**
   - 모든 API는 try-catch로 에러 처리
   - 로딩 상태 표시 필수
   - 사용자 ID는 임시로 하드코딩 (추후 인증 시스템 도입)

3. **커밋 규칙**
   - feat: 새 기능
   - fix: 버그 수정
   - refactor: 리팩토링
   - docs: 문서 수정

---

## 📅 권장 작업 순서

1. **1주차**: DiaryModal 연동 → 음력 달력
2. **2주차**: 통합 검색 → 알림 시스템
3. **3주차**: 대시보드 → 성능 최적화
4. **4주차**: 테스트 작성 → 배포 준비

---

*이 문서는 운명나침반 프로젝트의 다음 단계 개발을 위한 상세 작업 지시서입니다.*
*각 작업은 독립적으로 진행 가능하며, 우선순위에 따라 선택하여 개발하시기 바랍니다.*