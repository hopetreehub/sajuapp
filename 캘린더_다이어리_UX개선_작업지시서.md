# 📅 캘린더 & 다이어리 UX 개선 작업지시서

## 🎯 프로젝트 목표
캘린더와 다이어리의 사용성을 극대화하고, 운세 정보를 자연스럽게 통합하여 일상 관리 도구로서의 가치를 높인다.

## 🔍 현재 문제점 분석

### 1. 캘린더 뷰 표시 문제
- **문제**: 년/월/주/일 달력이 보이지 않음
- **원인**: Layout 컴포넌트 충돌 (구 Layout vs 신규 Header/Footer)
- **해결**: App.tsx에서 라우팅 정리 필요

### 2. 메뉴 구조 비효율성
- 오늘의 운세가 별도 페이지로 분리되어 있음
- 다이어리 접근이 헤더 메뉴를 통해야만 가능
- 일정과 운세, 다이어리가 분리되어 통합적 일상 관리 어려움

### 3. 프라이버시 부재
- 다이어리에 비밀번호 보호 기능 없음
- 민감한 개인 기록 보호 불가

## 🏗 새로운 UX 아키텍처

### 📱 일(Day) 뷰 레이아웃 재설계

```
┌──────────────────────────────────────────────┐
│                  헤더 (네비게이션)              │
├──────────────────────────────────────────────┤
│                                              │
│  ┌─────────────────┬────────────────────┐   │
│  │                 │                    │   │
│  │  왼쪽 영역 (60%)  │  오른쪽 영역 (40%)  │   │
│  │                 │                    │   │
│  │  📅 오늘의 일정   │  🔮 오늘의 운세     │   │
│  │  ─────────────   │  ──────────────    │   │
│  │  • 09:00 회의    │  종합운: 85점       │   │
│  │  • 14:00 미팅    │                    │   │
│  │                 │  💰 금전운: ★★★★☆   │   │
│  │  ✅ 오늘의 할일   │  ❤️ 연애운: ★★★☆☆  │   │
│  │  ─────────────   │  💼 직장운: ★★★★★   │   │
│  │  □ 보고서 작성   │  🏃 건강운: ★★★☆☆  │   │
│  │  ☑ 장보기       │                    │   │
│  │  □ 운동하기     │  행운의 색: 파란색    │   │
│  │                 │  행운의 숫자: 7      │   │
│  │  🏷️ 태그        │  길한 방향: 동쪽     │   │
│  │  #중요 #긴급     │                    │   │
│  │                 │  💡 오늘의 조언      │   │
│  │                 │  "새로운 도전을..."  │   │
│  └─────────────────┴────────────────────┘   │
│                                              │
│  ┌─────────────────────────────────────┐    │
│  │        📝 다이어리 바로가기 버튼        │    │
│  │     [아이콘] 오늘의 일기 작성하기       │    │
│  └─────────────────────────────────────┘    │
│                                              │
└──────────────────────────────────────────────┘
```

### 🔐 다이어리 접근성 & 보안

#### 1. 다이어리 접근 개선
- **위치**: 일 달력 하단에 플로팅 버튼
- **아이콘 상태**:
  - 📝 회색: 일기 없음
  - 📝 파란색: 일기 작성됨
  - 🔒 잠금: 비밀번호 보호 중

#### 2. 비밀번호 보호 시스템
```typescript
interface DiaryProtection {
  isProtected: boolean;
  passwordHash?: string;
  hint?: string;
  lockAfterMinutes?: number;
  biometricEnabled?: boolean;
}
```

## 📋 구현 상세 사항

### Phase 1: 캘린더 뷰 수정 (Day 1)

#### 1.1 Layout 충돌 해결
```typescript
// App.tsx 수정
// 캘린더 페이지는 구 Layout 제거하고 새 Header/Footer 사용
<Route path="/calendar" element={
  <>
    <CalendarPageNew /> {/* Layout 없는 새 버전 */}
  </>
} />
```

#### 1.2 DayView 컴포넌트 재구성
```typescript
// components/Calendar/DayViewEnhanced.tsx
interface DayViewEnhancedProps {
  date: Date;
  events: Event[];
  todos: Todo[];
  fortune: DailyFortune;
  onDiaryClick: () => void;
  hasDiary: boolean;
}

const DayViewEnhanced: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 p-6">
      {/* 왼쪽: 일정과 할일 (3/5) */}
      <div className="lg:col-span-3 space-y-6">
        <DailySchedule />
        <TodoList />
        <TagCloud />
      </div>
      
      {/* 오른쪽: 오늘의 운세 (2/5) */}
      <div className="lg:col-span-2">
        <TodayFortune />
      </div>
      
      {/* 하단: 다이어리 플로팅 버튼 */}
      <DiaryFloatingButton />
    </div>
  );
};
```

### Phase 2: 오늘의 운세 통합 (Day 2)

#### 2.1 운세 위젯 컴포넌트
```typescript
// components/Fortune/TodayFortuneWidget.tsx
const TodayFortuneWidget: React.FC = () => {
  const [fortune, setFortune] = useState<DailyFortune>();
  
  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 
                    dark:from-purple-900/20 dark:to-pink-900/20 
                    rounded-xl p-6">
      <h3 className="text-xl font-bold mb-4">🔮 오늘의 운세</h3>
      
      {/* 종합 점수 */}
      <div className="text-center mb-6">
        <div className="text-4xl font-bold text-purple-600">
          {fortune?.totalScore}점
        </div>
        <div className="text-sm text-gray-600">
          {fortune?.message}
        </div>
      </div>
      
      {/* 카테고리별 운세 */}
      <div className="space-y-3">
        <FortuneCategory icon="💰" label="금전운" score={85} />
        <FortuneCategory icon="❤️" label="연애운" score={72} />
        <FortuneCategory icon="💼" label="직장운" score={90} />
        <FortuneCategory icon="🏃" label="건강운" score={68} />
      </div>
      
      {/* 행운 아이템 */}
      <div className="mt-6 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
        <LuckyItems />
      </div>
    </div>
  );
};
```

### Phase 3: 다이어리 개선 (Day 3)

#### 3.1 다이어리 플로팅 버튼
```typescript
// components/Diary/DiaryFloatingButton.tsx
const DiaryFloatingButton: React.FC = () => {
  const [hasDiary] = useDiaryStatus(currentDate);
  const [isProtected] = useDiaryProtection();
  
  return (
    <div className="fixed bottom-6 right-6 lg:relative lg:bottom-auto lg:right-auto">
      <button
        onClick={handleDiaryOpen}
        className={`
          flex items-center gap-2 px-6 py-3 rounded-full shadow-lg
          transition-all hover:scale-105
          ${hasDiary 
            ? 'bg-blue-500 text-white' 
            : 'bg-white dark:bg-gray-800 text-gray-700'
          }
        `}
      >
        {isProtected && <LockIcon />}
        <DiaryIcon />
        <span>{hasDiary ? '일기 보기' : '일기 작성'}</span>
      </button>
    </div>
  );
};
```

#### 3.2 비밀번호 보호
```typescript
// components/Diary/DiaryProtection.tsx
const DiaryProtection: React.FC = () => {
  const [password, setPassword] = useState('');
  const [showHint, setShowHint] = useState(false);
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl">
        <h3 className="text-xl font-bold mb-4">🔒 다이어리 잠금</h3>
        
        <input
          type="password"
          placeholder="비밀번호 입력"
          className="w-full px-4 py-2 border rounded-lg"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        
        {showHint && (
          <p className="text-sm text-gray-500 mt-2">
            힌트: {protection.hint}
          </p>
        )}
        
        <div className="flex justify-between mt-4">
          <button onClick={() => setShowHint(true)}>
            힌트 보기
          </button>
          <button onClick={handleUnlock}>
            잠금 해제
          </button>
        </div>
      </div>
    </div>
  );
};
```

## 🎨 UI/UX 전문가 페르소나 가이드라인

### 👤 김유진 (UX Designer, 7년 경력)
"사용자가 매일 자연스럽게 찾게 되는 앱이 되어야 합니다."

#### 핵심 원칙:
1. **직관성**: 3초 안에 모든 기능 파악 가능
2. **일관성**: 모든 뷰에서 동일한 인터랙션 패턴
3. **접근성**: 한 손 조작 가능한 터치 타겟
4. **피드백**: 모든 액션에 즉각적 시각 피드백

### 👤 박민수 (Product Manager, 10년 경력)
"운세와 일정 관리의 시너지를 극대화해야 합니다."

#### 비즈니스 가치:
1. **DAU 증가**: 일 달력 + 운세로 매일 방문 유도
2. **사용 시간 증가**: 다이어리로 체류 시간 연장
3. **유료 전환**: 프리미엄 운세 + 다이어리 백업

## 📈 성공 지표 (KPI)

### 사용성 지표
- 일 달력 뷰 사용률: 70% 이상
- 다이어리 작성률: 주 3회 이상 사용자 40%
- 운세 조회율: DAU의 80% 이상

### 기술 지표
- 페이지 로드 시간: < 1.5초
- 다이어리 암호화 시간: < 0.5초
- 운세 API 응답: < 2초

## 🚀 구현 로드맵

### Week 1
- [x] 문제 진단
- [ ] Layout 충돌 해결
- [ ] DayView 레이아웃 재구성
- [ ] 운세 위젯 개발

### Week 2
- [ ] 다이어리 플로팅 버튼
- [ ] 비밀번호 보호 시스템
- [ ] 다이어리 상태 표시
- [ ] 생체인증 연동

### Week 3
- [ ] 성능 최적화
- [ ] 사용자 테스트
- [ ] 버그 수정
- [ ] 배포 준비

## ⚡ 즉시 실행 액션

```bash
# 1. 캘린더 페이지 수정
cd packages/web/src/pages
cp CalendarPage.tsx CalendarPageNew.tsx

# 2. DayView 개선
cd ../components/Calendar
cp DayView.tsx DayViewEnhanced.tsx

# 3. 운세 위젯 생성
mkdir ../Fortune
touch ../Fortune/TodayFortuneWidget.tsx

# 4. 다이어리 보안 추가
mkdir ../Diary
touch ../Diary/DiaryProtection.tsx
```

## 🔒 보안 고려사항

### 다이어리 암호화
- AES-256 암호화 적용
- 비밀번호는 bcrypt 해싱
- 로컬 스토리지에 암호화된 상태로 저장
- 자동 잠금 타이머 (기본 5분)

### 프라이버시
- 다이어리 내용 서버 전송 시 암호화
- 백업 시 종단간 암호화
- 비밀번호 찾기 불가 (보안상)

---

*작성일: 2025-08-28*  
*버전: 1.0*  
*목표: 사용자 중심의 통합 일상 관리 도구*