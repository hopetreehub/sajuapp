# 🔍 통합 검색 시스템 구현 작업 지시서

## 📋 작업 개요
- **목표**: 캘린더 이벤트, 할일, 일기를 통합 검색하는 시스템 구현
- **예상 소요시간**: 4-5시간
- **우선순위**: 🟡 중간

## 🎯 핵심 요구사항

### 1. 검색 대상
- ✅ 캘린더 이벤트 (제목, 설명, 태그)
- ✅ 할일 (제목, 설명, 우선순위)
- ✅ 일기 (내용, 기분, 태그)
- ✅ 태그 (이름으로 검색)

### 2. 검색 기능
- 실시간 검색 (디바운싱 300ms)
- 카테고리별 필터링
- 날짜 범위 검색
- 정렬 옵션 (최신순, 관련도순)

---

## 📂 파일 구조 및 구현 계획

### Phase 1: 검색 서비스 계층 구현
```typescript
// 1. packages/web/src/services/searchService.ts
export interface SearchOptions {
  query: string
  categories?: ('events' | 'todos' | 'diaries' | 'tags')[]
  startDate?: string
  endDate?: string
  limit?: number
}

export interface SearchResult {
  type: 'event' | 'todo' | 'diary' | 'tag'
  id: string
  title: string
  content?: string
  date?: string
  highlight?: string // 검색어 하이라이트
  score?: number // 관련도 점수
}

export const searchService = {
  // 통합 검색
  searchAll: async (options: SearchOptions): Promise<SearchResult[]> => {
    const results = await Promise.all([
      searchEvents(options),
      searchTodos(options),
      searchDiaries(options)
    ])
    return mergeAndSortResults(results.flat(), options)
  },
  
  // 개별 검색
  searchEvents: async (options: SearchOptions) => {},
  searchTodos: (options: SearchOptions) => {},
  searchDiaries: async (options: SearchOptions) => {}
}
```

### Phase 2: 검색바 컴포넌트
```typescript
// 2. packages/web/src/components/SearchBar.tsx
interface SearchBarProps {
  onSearch?: (results: SearchResult[]) => void
  placeholder?: string
  className?: string
}

export default function SearchBar({ onSearch, placeholder, className }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['all'])
  
  // 디바운싱 훅
  const debouncedQuery = useDebounce(query, 300)
  
  // 검색 실행
  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      performSearch()
    }
  }, [debouncedQuery, selectedCategories])
  
  return (
    <div className="relative">
      {/* 검색 입력 */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder || "일정, 할일, 일기 검색..."}
          className="w-full px-4 py-2 pl-10 pr-4 rounded-lg border"
        />
        <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
      </div>
      
      {/* 카테고리 필터 */}
      <div className="flex gap-2 mt-2">
        {['all', 'events', 'todos', 'diaries'].map(category => (
          <button
            key={category}
            onClick={() => toggleCategory(category)}
            className={`px-3 py-1 rounded-full text-xs ${
              selectedCategories.includes(category) 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-200'
            }`}
          >
            {getCategoryLabel(category)}
          </button>
        ))}
      </div>
      
      {/* 검색 결과 드롭다운 */}
      {showDropdown && results.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-white shadow-lg rounded-lg max-h-96 overflow-y-auto">
          {groupResultsByType(results).map(([type, items]) => (
            <div key={type}>
              <div className="px-4 py-2 bg-gray-50 font-semibold text-sm">
                {getTypeLabel(type)} ({items.length})
              </div>
              {items.map(item => (
                <SearchResultItem key={item.id} item={item} onClick={handleItemClick} />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

### Phase 3: 검색 결과 아이템 컴포넌트
```typescript
// 3. packages/web/src/components/SearchResultItem.tsx
interface SearchResultItemProps {
  item: SearchResult
  onClick: (item: SearchResult) => void
}

export default function SearchResultItem({ item, onClick }: SearchResultItemProps) {
  const getIcon = () => {
    switch (item.type) {
      case 'event': return <CalendarIcon />
      case 'todo': return <CheckCircleIcon />
      case 'diary': return <BookOpenIcon />
      case 'tag': return <TagIcon />
    }
  }
  
  return (
    <div 
      onClick={() => onClick(item)}
      className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-start gap-3"
    >
      <div className="mt-1">{getIcon()}</div>
      <div className="flex-1">
        <div className="font-medium text-sm">{item.title}</div>
        {item.content && (
          <div className="text-xs text-gray-600 mt-1 line-clamp-2">
            {item.highlight || item.content}
          </div>
        )}
        {item.date && (
          <div className="text-xs text-gray-400 mt-1">
            {format(new Date(item.date), 'yyyy년 M월 d일')}
          </div>
        )}
      </div>
    </div>
  )
}
```

### Phase 4: 검색 결과 페이지
```typescript
// 4. packages/web/src/pages/SearchResultsPage.tsx
export default function SearchResultsPage() {
  const { query } = useParams()
  const [results, setResults] = useState<SearchResult[]>([])
  const [filters, setFilters] = useState({
    categories: ['all'],
    dateRange: null,
    sortBy: 'relevance'
  })
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">
        "{query}" 검색 결과
      </h1>
      
      {/* 필터 섹션 */}
      <div className="flex gap-4 mb-6">
        <CategoryFilter />
        <DateRangeFilter />
        <SortSelector />
      </div>
      
      {/* 결과 섹션 */}
      <div className="grid gap-4">
        {Object.entries(groupByType(results)).map(([type, items]) => (
          <ResultSection key={type} type={type} items={items} />
        ))}
      </div>
    </div>
  )
}
```

### Phase 5: 헤더 통합
```typescript
// 5. packages/web/src/components/Layout/Header.tsx 수정
export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Logo />
        
        {/* 검색바 추가 */}
        <div className="flex-1 max-w-xl mx-8">
          <SearchBar />
        </div>
        
        <NavigationMenu />
      </div>
    </header>
  )
}
```

### Phase 6: 유틸리티 함수
```typescript
// 6. packages/web/src/utils/searchUtils.ts
export const highlightText = (text: string, query: string): string => {
  const regex = new RegExp(`(${query})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}

export const calculateRelevanceScore = (item: any, query: string): number => {
  let score = 0
  const lowerQuery = query.toLowerCase()
  
  // 제목 매치 (높은 점수)
  if (item.title?.toLowerCase().includes(lowerQuery)) {
    score += 10
  }
  
  // 내용 매치 (중간 점수)
  if (item.content?.toLowerCase().includes(lowerQuery)) {
    score += 5
  }
  
  // 태그 매치 (낮은 점수)
  if (item.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))) {
    score += 3
  }
  
  return score
}

export const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value)
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    
    return () => clearTimeout(handler)
  }, [value, delay])
  
  return debouncedValue
}
```

### Phase 7: 백엔드 검색 엔드포인트
```typescript
// 7. packages/backend/services/diary/src/routes/diaries.ts 수정
// GET /api/diaries/search 엔드포인트 개선
router.get('/search', async (req: Request, res: Response) => {
  const { q, categories, startDate, endDate, limit = 20 } = req.query
  
  // SQL 쿼리 개선 (LIKE 검색)
  const query = `
    SELECT * FROM diary_entries 
    WHERE user_id = ? 
    AND content LIKE ?
    ${startDate ? 'AND date >= ?' : ''}
    ${endDate ? 'AND date <= ?' : ''}
    ORDER BY date DESC
    LIMIT ?
  `
})

// 8. packages/backend/services/calendar/src/routes/events.ts 수정
// 검색 엔드포인트 추가
router.get('/search', async (req: Request, res: Response) => {
  // 이벤트 검색 로직
})
```

---

## 🔧 구현 순서

### 1단계: 기본 구조 (1시간)
1. [ ] searchService.ts 생성
2. [ ] SearchResult 타입 정의
3. [ ] 기본 검색 함수 구현

### 2단계: UI 컴포넌트 (2시간)
1. [ ] SearchBar 컴포넌트 구현
2. [ ] SearchResultItem 컴포넌트 구현
3. [ ] 디바운싱 훅 구현
4. [ ] 드롭다운 UI 구현

### 3단계: 통합 작업 (1시간)
1. [ ] Header에 SearchBar 추가
2. [ ] 라우팅 설정
3. [ ] 검색 결과 페이지 구현

### 4단계: 백엔드 연동 (30분)
1. [ ] Diary 검색 API 연결
2. [ ] Calendar 검색 API 연결
3. [ ] 할일 검색 (로컬) 구현

### 5단계: 최적화 (30분)
1. [ ] 검색 결과 캐싱
2. [ ] 무한 스크롤 구현
3. [ ] 검색어 하이라이팅

---

## 🎨 UI/UX 가이드라인

### 검색바 디자인
- 너비: 최대 600px
- 높이: 40px
- 아이콘: 왼쪽 돋보기 아이콘
- 포커스 시: 보라색 테두리
- 플레이스홀더: "일정, 할일, 일기 검색..."

### 검색 결과 드롭다운
- 최대 높이: 400px
- 그림자: shadow-lg
- 각 아이템: hover 시 배경색 변경
- 카테고리별 그룹화
- 스크롤: 부드러운 스크롤

### 검색 결과 페이지
- 그리드 레이아웃
- 카드 형식 결과
- 페이지네이션 또는 무한 스크롤
- 필터 사이드바

---

## ⚠️ 주의사항

1. **성능 고려사항**
   - 디바운싱 필수 (300ms)
   - 검색 결과 20개 제한
   - 캐싱 활용

2. **접근성**
   - 키보드 네비게이션 지원
   - 스크린 리더 호환
   - 적절한 ARIA 레이블

3. **에러 처리**
   - 네트워크 에러 처리
   - 빈 결과 처리
   - 로딩 상태 표시

---

## ✅ 완료 기준

- [ ] 검색바에서 실시간 검색 가능
- [ ] 3가지 이상 카테고리 검색 지원
- [ ] 검색 결과 클릭 시 해당 페이지/모달 이동
- [ ] 모바일 반응형 디자인
- [ ] 검색어 하이라이팅
- [ ] 로딩 및 에러 상태 처리

---

## 🧪 테스트 시나리오

1. **기본 검색**
   - "회의" 검색 → 일정, 할일, 일기 결과 표시
   - 빈 검색어 → 결과 없음
   - 특수문자 검색 → 에러 없이 처리

2. **필터링**
   - 카테고리 선택 → 해당 카테고리만 표시
   - 날짜 범위 설정 → 기간 내 결과만 표시

3. **상호작용**
   - 검색 결과 클릭 → 상세 페이지 이동
   - ESC 키 → 드롭다운 닫기
   - 외부 클릭 → 드롭다운 닫기

---

*이 작업 지시서는 통합 검색 시스템 구현을 위한 상세 가이드입니다.*
*예상 소요시간: 4-5시간*