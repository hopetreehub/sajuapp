# 📋 작업지시서: 사주분석 UI 주능/주흉 표시 문제 해결

## 🎯 문제 상황
**작업명**: 사주분석 페이지 주능/주흉 데이터 표시 오류 수정
**담당**: Claude Code Development Team  
**우선순위**: 🔥 CRITICAL  
**예상 소요시간**: 2-3시간
**완료 목표일**: 2025-09-07

## 🔍 현재 문제점

### 증상
1. **주능 버튼**: "주능" 텍스트만 표시되고 실제 데이터 미표시
   - 아이콘: ⚡ (표시됨)
   - 제목: 주능 (표시됨) 
   - 설명: 능력과 잠재력 분석 (표시됨)
   - **데이터: 미표시 ❌**

2. **주흉 버튼**: "주흉" 텍스트만 표시되고 실제 데이터 미표시
   - 아이콘: ⚠️ (표시됨)
   - 제목: 주흉 (표시됨)
   - 설명: 위험과 주의사항 분석 (표시됨)
   - **데이터: 미표시 ❌**

### 백엔드 상태 (정상 ✅)
- API 엔드포인트: `http://localhost:4015/api/saju/categories`
- 데이터베이스: 150+ 카테고리 정상 로드
- API 응답: JSON 데이터 정상 반환

## 🛠️ 작업 내용

### Phase 1: 현재 상태 분석
1. **프론트엔드 컴포넌트 확인**
   - [ ] 사주분석 페이지 컴포넌트 찾기
   - [ ] 주능/주흉 버튼 렌더링 코드 분석
   - [ ] API 호출 및 데이터 바인딩 로직 확인

2. **데이터 흐름 추적**
   - [ ] API 호출 여부 확인
   - [ ] 응답 데이터 상태 관리 확인
   - [ ] 컴포넌트 props/state 확인

### Phase 2: 문제 해결

#### 예상 원인 및 해결방안

1. **API 호출 누락**
```typescript
// 컴포넌트 마운트 시 API 호출 추가
useEffect(() => {
  fetchSajuCategories();
}, []);

const fetchSajuCategories = async () => {
  try {
    const response = await fetch('http://localhost:4015/api/saju/categories');
    const data = await response.json();
    setCategoriesData(data.data);
  } catch (error) {
    console.error('Failed to fetch categories:', error);
  }
};
```

2. **데이터 바인딩 오류**
```typescript
// 주능 데이터 표시
<div className="positive-categories">
  {categoriesData?.positive && Object.entries(categoriesData.positive).map(([category, data]) => (
    <div key={category} className="category-card">
      <h3>{data.icon} {category}</h3>
      <ul>
        {data.items.map((item, idx) => (
          <li key={idx}>{item.name}</li>
        ))}
      </ul>
    </div>
  ))}
</div>

// 주흉 데이터 표시
<div className="negative-categories">
  {categoriesData?.negative && Object.entries(categoriesData.negative).map(([category, data]) => (
    <div key={category} className="category-card">
      <h3>{data.icon} {category}</h3>
      <ul>
        {data.items.map((item, idx) => (
          <li key={idx}>{item.name}</li>
        ))}
      </ul>
    </div>
  ))}
</div>
```

3. **상태 관리 문제**
```typescript
interface SajuCategoryData {
  positive: {
    [key: string]: {
      icon: string;
      items: Array<{
        name: string;
        weight: number;
        confidence: number;
      }>;
    };
  };
  negative: {
    [key: string]: {
      icon: string;
      items: Array<{
        name: string;
        weight: number;
        confidence: number;
      }>;
    };
  };
}

const [categoriesData, setCategoriesData] = useState<SajuCategoryData | null>(null);
const [selectedCategory, setSelectedCategory] = useState<'positive' | 'negative'>('positive');
```

### Phase 3: UI 구현 개선

#### 주능 표시 개선
```tsx
<div className="positive-section">
  <h2 className="text-2xl font-bold mb-4">
    ⚡ 주능 - 긍정적 적성 및 재능
  </h2>
  <div className="grid grid-cols-3 gap-4">
    <CategoryCard title="게임" icon="🎮" items={gameItems} />
    <CategoryCard title="과목" icon="📚" items={subjectItems} />
    <CategoryCard title="무용" icon="💃" items={danceItems} />
    <CategoryCard title="문학" icon="✍️" items={literatureItems} />
    <CategoryCard title="미술" icon="🎨" items={artItems} />
    <CategoryCard title="연예" icon="🎭" items={entertainmentItems} />
    <CategoryCard title="음악" icon="🎵" items={musicItems} />
    <CategoryCard title="전공" icon="🎓" items={majorItems} />
    <CategoryCard title="체능" icon="⚽" items={sportsItems} />
  </div>
</div>
```

#### 주흉 표시 개선
```tsx
<div className="negative-section">
  <h2 className="text-2xl font-bold mb-4">
    ⚠️ 주흉 - 주의사항 및 위험요소
  </h2>
  <div className="grid grid-cols-2 gap-4">
    <CategoryCard title="교통사고" icon="🚗" items={trafficItems} />
    <CategoryCard title="사건" icon="⚖️" items={incidentItems} />
    <CategoryCard title="사고" icon="⚠️" items={accidentItems} />
    <CategoryCard title="사고도로" icon="🛣️" items={roadItems} />
  </div>
</div>
```

### Phase 4: 테스트 및 검증

1. **기능 테스트**
   - [ ] API 호출 성공 확인
   - [ ] 데이터 로딩 상태 표시
   - [ ] 주능 9개 카테고리 모두 표시
   - [ ] 주흉 4개 카테고리 모두 표시
   - [ ] 각 카테고리별 세부 항목 표시

2. **UI/UX 테스트**
   - [ ] 로딩 스피너 표시
   - [ ] 에러 상태 처리
   - [ ] 반응형 디자인
   - [ ] 다크모드 지원

## 📁 수정 대상 파일 (예상)

```
packages/web/src/
├── pages/
│   └── SajuAnalysisPage.tsx       # 메인 페이지
├── components/
│   ├── Saju/
│   │   ├── CategoryDisplay.tsx    # 카테고리 표시 컴포넌트
│   │   ├── PositiveSection.tsx    # 주능 섹션
│   │   └── NegativeSection.tsx    # 주흉 섹션
│   └── UI/
│       └── CategoryCard.tsx       # 카테고리 카드 컴포넌트
└── services/
    └── sajuApi.ts                  # API 서비스
```

## 🎯 완료 기준

### ✅ 성공 조건
1. 주능 버튼 클릭 시 9개 카테고리와 100+ 세부항목 표시
2. 주흉 버튼 클릭 시 4개 카테고리와 50+ 세부항목 표시
3. 각 카테고리별 아이콘 정상 표시
4. 데이터 로딩 중 상태 표시
5. 에러 발생 시 사용자 친화적 메시지

### 📊 검증 방법
1. 브라우저 개발자 도구 Network 탭에서 API 호출 확인
2. Console에서 에러 메시지 없음 확인
3. 실제 화면에서 모든 데이터 표시 확인

## ⚠️ 주의사항

1. **CORS 설정**: 프론트엔드(4000)와 백엔드(4015) 간 CORS 확인
2. **타입 안전성**: TypeScript 타입 정의 필수
3. **성능**: 대량 데이터 렌더링 최적화 (React.memo, useMemo 활용)
4. **접근성**: 스크린 리더 지원을 위한 적절한 ARIA 레이블

## 🚀 구현 순서

1. 현재 사주분석 페이지 컴포넌트 찾기
2. API 호출 로직 구현/수정
3. 상태 관리 및 데이터 바인딩
4. UI 컴포넌트 업데이트
5. 테스트 및 디버깅
6. 최종 확인 및 커밋

---

**📋 작업지시서 ID**: WO-SAJU-UI-2025-002  
**작성일**: 2025-09-07  
**작성자**: Claude Code PM

**🎯 목표: 사용자가 주능/주흉 버튼 클릭 시 실제 분석 데이터를 확인할 수 있도록 UI 완성**