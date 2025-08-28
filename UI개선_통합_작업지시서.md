# UI 개선 통합 작업지시서

## 📋 작업 개요
- **작업일**: 2025-08-28
- **담당자**: Claude Code  
- **목표**: 캘린더 및 설정 페이지 사용성 개선

## 🎯 요구사항 분석

### 1. **오늘의 할일 버튼 표시 문제** 🔧
**현재 상태**: 할일 추가 버튼이 보이지 않음
**목표**: 할일을 쉽게 추가할 수 있는 UI 제공

### 2. **일기 작성 팝업 시스템** 📝
**현재 상태**: 플로팅 버튼으로 페이지 이동
**목표**: 할일 아래 작은 아이콘 + 팝업 모달로 일기 작성

### 3. **설정 페이지 시간 입력 개선** ⏰
**현재 상태**: 24시간 + 오전/오후 선택 중복
**목표**: 24시간 표시만 사용 (오전/오후 선택 제거)

### 4. **주간달력 시간범위 및 할일 통합** 📅
**현재 상태**: 주간달력 시간범위 미정, 할일 기능 없음
**목표**: 9시-19시 표시 + 할일 CRUD 기능 통합

## 🔧 상세 구현 계획

### Task 1: 오늘의 할일 버튼 표시 수정

#### 문제 분석
- DayViewEnhanced에서 할일 추가 버튼이 누락되었을 가능성
- 할일 섹션의 "추가" 버튼 확인 필요

#### 구현 방법
```tsx
// DayViewEnhanced.tsx - 할일 섹션
<div className="flex space-x-2 mt-4">
  <input
    type="text"
    value={newTodo}
    onChange={(e) => setNewTodo(e.target.value)}
    onKeyPress={(e) => e.key === 'Enter' && addTodo()}
    placeholder="새 할일 추가..."
    className="flex-1 px-3 py-2 border rounded-lg"
  />
  <button
    onClick={addTodo}
    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
  >
    추가
  </button>
</div>
```

### Task 2: 일기 작성 팝업 시스템

#### UI 설계
```
오늘의 할일 (2/3 완료)
├── ☑ 보고서 작성
├── ☐ 장보기  
└── ☐ 운동하기
─────────────────────────
📝 오늘의 일기 [아이콘 클릭]
```

#### 구현 구조
```tsx
// DiaryModal.tsx (새 컴포넌트)
const DiaryModal = ({ isOpen, onClose, date }) => {
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('');
  
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="diary-editor">
        <h2>{format(date, 'yyyy년 M월 d일')} 일기</h2>
        
        {/* 기분 선택 */}
        <div className="mood-selector">
          {['😊', '😐', '😢', '😠', '😴'].map(emoji => (...))}
        </div>
        
        {/* 일기 내용 */}
        <textarea 
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="오늘 하루는 어떠셨나요?"
          rows={8}
        />
        
        {/* 저장 버튼 */}
        <div className="actions">
          <button onClick={handleSave}>저장</button>
          <button onClick={onClose}>취소</button>
        </div>
      </div>
    </Modal>
  );
};
```

#### 통합 위치
```tsx
// DayViewEnhanced.tsx - 할일 섹션 하단
<div className="mt-4 pt-4 border-t border-gray-200">
  <button 
    onClick={() => setIsDiaryOpen(true)}
    className="flex items-center space-x-2 text-sm text-gray-600 hover:text-purple-600"
  >
    <span className="text-lg">📝</span>
    <span>오늘의 일기</span>
    {hasDiaryEntry && <span className="w-2 h-2 bg-green-500 rounded-full"></span>}
  </button>
</div>
```

### Task 3: 설정 페이지 시간 입력 개선

#### 현재 문제점
```tsx
// 현재: 중복된 시간 입력 방식
<input type="time" />           // 24시간 표시
<select>                        // 오전/오후 선택
  <option value="am">오전</option>
  <option value="pm">오후</option>
</select>
```

#### 개선 방향
```tsx
// 개선: 24시간 표시만 사용
<input 
  type="time" 
  step="1800" // 30분 단위
  className="w-full px-3 py-2 border rounded-lg"
/>
<p className="text-xs text-gray-500 mt-1">
  24시간 형식으로 입력해주세요 (예: 14:30)
</p>
```

### Task 4: 주간달력 시간범위 및 할일 통합

#### A. 주간달력 시간범위 변경 (9시-19시)

**파일**: `WeekView.tsx`
```tsx
// 현재 시간 범위 확장
const HOURS = Array.from({ length: 11 }, (_, i) => i + 9) // 9-19시

// 시간 표시 로직
const renderTimeSlots = () => {
  return HOURS.map(hour => (
    <div key={hour} className="time-slot">
      <div className="time-label">
        {format(new Date().setHours(hour), 'HH:mm')}
      </div>
      <div className="time-content">
        {/* 이벤트 및 할일 영역 */}
      </div>
    </div>
  ));
};
```

#### B. 주간달력 할일 통합

**기능 요구사항**:
- 각 요일별로 할일 표시
- 할일 추가/수정/삭제 기능
- 일간달력과 데이터 동기화

**구현 구조**:
```tsx
// WeekView.tsx
const WeekView = ({ events, todos, onCreateTodo, onUpdateTodo, onDeleteTodo }) => {
  return (
    <div className="week-view">
      {/* 시간 헤더 */}
      <div className="time-header">...</div>
      
      {/* 요일별 컬럼 */}
      {weekDays.map(day => (
        <div key={day} className="day-column">
          <div className="day-header">{format(day, 'E')}</div>
          
          {/* 시간별 슬롯 */}
          {HOURS.map(hour => (
            <div key={hour} className="time-slot">
              {/* 이벤트 표시 */}
              <EventsInSlot date={day} hour={hour} events={events} />
              
              {/* 할일 표시 */}
              <TodosInSlot date={day} todos={todos} />
            </div>
          ))}
          
          {/* 할일 추가 영역 */}
          <div className="todos-section">
            <TodoList 
              date={day}
              todos={getDayTodos(day, todos)}
              onAdd={onCreateTodo}
              onUpdate={onUpdateTodo}
              onDelete={onDeleteTodo}
            />
          </div>
        </div>
      ))}
    </div>
  );
};
```

## 📂 파일 수정 목록

### 기존 파일 수정
```
packages/web/src/
├── components/Calendar/
│   ├── DayViewEnhanced.tsx     (할일 버튼, 일기 아이콘 추가)
│   └── WeekView.tsx            (시간범위, 할일 통합)
├── pages/
│   └── SettingsPage.tsx        (시간 입력 방식 수정)
└── types/
    └── diary.ts                (일기 타입 정의 - 새 파일)
```

### 새로 생성할 파일
```
packages/web/src/
├── components/
│   ├── DiaryModal.tsx          (일기 작성 팝업)
│   ├── TodoList.tsx            (재사용 가능한 할일 컴포넌트)
│   └── Modal.tsx               (공통 모달 컴포넌트)
└── services/
    └── diaryService.ts         (일기 API 서비스)
```

## 🎨 디자인 명세

### 1. 일기 팝업 모달
```scss
.diary-modal {
  width: 500px;
  max-width: 90vw;
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  
  .mood-selector {
    display: flex;
    gap: 12px;
    margin: 16px 0;
    
    .mood-option {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 2px solid transparent;
      cursor: pointer;
      
      &.selected {
        border-color: #8b5cf6;
        background: #f3f4f6;
      }
    }
  }
  
  .diary-textarea {
    width: 100%;
    min-height: 200px;
    padding: 16px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-family: inherit;
    resize: vertical;
  }
}
```

### 2. 일기 아이콘 디자인
```tsx
// 일기 상태에 따른 아이콘
const DiaryIcon = ({ hasEntry, onClick }) => (
  <button 
    onClick={onClick}
    className={`
      flex items-center space-x-2 px-3 py-2 rounded-lg transition-all
      ${hasEntry 
        ? 'bg-green-50 text-green-700 hover:bg-green-100' 
        : 'text-gray-500 hover:text-purple-600 hover:bg-purple-50'
      }
    `}
  >
    <span className="text-lg">📝</span>
    <span className="text-sm">오늘의 일기</span>
    {hasEntry && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
  </button>
);
```

### 3. 주간달력 할일 표시
```scss
.week-todo-item {
  background: #f8fafc;
  border-left: 3px solid #6366f1;
  padding: 4px 8px;
  margin: 2px 0;
  border-radius: 0 4px 4px 0;
  font-size: 12px;
  
  &.completed {
    background: #f0fdf4;
    border-left-color: #10b981;
    text-decoration: line-through;
    opacity: 0.7;
  }
}
```

## ⚡ 구현 단계

### Phase 1: 기본 UI 수정 (30분)
1. ✅ 할일 추가 버튼 확인 및 수정
2. 🔄 설정페이지 오전/오후 선택 제거
3. 🔄 주간달력 시간범위 9-19시 변경

### Phase 2: 일기 시스템 구현 (45분)
1. 🔄 Modal 컴포넌트 생성
2. 🔄 DiaryModal 컴포넌트 구현
3. 🔄 일기 아이콘 및 상태 표시
4. 🔄 DayViewEnhanced에 통합

### Phase 3: 주간달력 할일 통합 (60분)
1. 🔄 WeekView에서 할일 데이터 구조 설계
2. 🔄 요일별 할일 표시 시스템
3. 🔄 할일 CRUD 기능 구현
4. 🔄 일간달력과 데이터 동기화

### Phase 4: 테스트 및 최적화 (15분)
1. 🔄 전체 기능 테스트
2. 🔄 다크모드 지원 확인
3. 🔄 모바일 반응형 검증
4. 🔄 성능 최적화

## 🔍 데이터 구조

### 할일 데이터 구조
```typescript
interface Todo {
  id: string;
  text: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  date: string; // YYYY-MM-DD
  createdAt: Date;
  updatedAt: Date;
}
```

### 일기 데이터 구조
```typescript
interface DiaryEntry {
  id: string;
  date: string; // YYYY-MM-DD
  content: string;
  mood: '😊' | '😐' | '😢' | '😠' | '😴';
  createdAt: Date;
  updatedAt: Date;
}
```

### Context 확장
```typescript
interface CalendarContextType {
  // 기존 필드들...
  
  // 할일 관련
  todos: Todo[];
  addTodo: (todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTodo: (id: string, updates: Partial<Todo>) => void;
  deleteTodo: (id: string) => void;
  
  // 일기 관련
  diaryEntries: DiaryEntry[];
  saveDiaryEntry: (entry: Omit<DiaryEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  getDiaryEntry: (date: string) => DiaryEntry | null;
}
```

## ✅ 완료 체크리스트

### 기본 UI 수정
- [ ] 할일 추가 버튼 표시 확인
- [ ] 설정 페이지 오전/오후 선택 제거
- [ ] 주간달력 시간 9시-19시 변경

### 일기 시스템
- [ ] Modal 컴포넌트 구현
- [ ] DiaryModal UI 완성
- [ ] 기분 선택 기능
- [ ] 일기 저장/불러오기
- [ ] 일기 상태 아이콘 표시

### 주간달력 할일 통합
- [ ] WeekView에 할일 표시 영역 추가
- [ ] 요일별 할일 필터링
- [ ] 할일 추가/수정/삭제 기능
- [ ] 일간달력과 데이터 동기화
- [ ] 완료/미완료 상태 토글

### 품질 보증
- [ ] 다크모드 완벽 지원
- [ ] 모바일 반응형 동작
- [ ] 접근성 준수 (ARIA 라벨)
- [ ] 성능 최적화 (메모화)
- [ ] 에러 처리 및 로딩 상태

## 🎯 성공 기준

1. ✅ **할일 기능**: 일간/주간 달력 모두에서 할일 추가/수정/삭제 가능
2. ✅ **일기 기능**: 간편한 팝업으로 일기 작성, 상태 표시
3. ✅ **시간 설정**: 24시간 형식만 사용, 직관적인 입력
4. ✅ **주간달력**: 9-19시 표시, 할일과 일정이 모두 보임
5. ✅ **통합성**: 모든 기능이 매끄럽게 연동되어 동작

## 🚨 주의사항

### 성능 고려사항
- 주간달력에서 7일 × 11시간 = 77개 슬롯 렌더링
- `useMemo`로 계산 최적화 필수
- 할일 필터링 로직 효율화

### 데이터 동기화
- 일간달력과 주간달력 할일 데이터 실시간 동기화
- Context API 또는 상태 관리 라이브러리 활용
- 로컬스토리지 백업 고려

### 사용자 경험
- 팝업 모달은 ESC 키로 닫기 가능
- 외부 클릭으로 모달 닫기 가능
- 저장 중 로딩 상태 표시

---

*이 작업지시서는 캘린더 앱의 사용성과 기능성을 대폭 향상시키는 통합 개선 계획입니다.*