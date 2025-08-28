# 📋 사주 분석 시스템 UI/UX 통일 작업지시서

## 🎯 프로젝트 목표
- **6대 영역, 17대 운세, 7대 성향 분석** 페이지 UI/UX 완전 통일
- **향후 30개 이상 추가될 차트**를 고려한 확장 가능한 디자인 시스템 구축
- 일관된 사용자 경험과 시각적 통일성 확보

## 🎨 디자인 시스템 표준화 가이드

### 1. 레이더 차트 통일 기준

#### 📊 차트 크기 표준
```typescript
// 모든 레이더 차트 공통 크기
const CHART_DIMENSIONS = {
  height: '400px',        // 고정 높이 (h-96 → h-[400px])
  minHeight: '350px',     // 최소 높이
  maxHeight: '450px',     // 최대 높이
  aspectRatio: '1:1'      // 정사각형 비율 유지
}
```

#### 🌈 통일 색상 팔레트
```typescript
// 30개 차트를 위한 메인 색상 팔레트
const CHART_COLORS = {
  primary: [
    '#8b5cf6',   // 보라색 (메인)
    '#06b6d4',   // 청록색
    '#f59e0b',   // 주황색
    '#ef4444',   // 빨간색
    '#10b981',   // 녹색
    '#f97316',   // 진한 주황
    '#8b5a2b'    // 갈색
  ],
  secondary: [
    '#a78bfa',   // 연보라
    '#22d3ee',   // 연청록
    '#fbbf24',   // 연주황
    '#fb7185',   // 연빨강
    '#34d399',   // 연녹색
    '#fb923c',   // 연주황2
    '#a3a3a3'    // 회색
  ],
  accent: [
    '#c084fc',   // 밝은보라
    '#67e8f9',   // 밝은청록
    '#fcd34d',   // 밝은노랑
    '#fda4af',   // 밝은분홍
    '#6ee7b7',   // 밝은민트
    '#fdba74',   // 밝은살구
    '#d1d5db'    // 밝은회색
  ]
}

// 배경색 통일
const CHART_BACKGROUNDS = {
  base: 'rgba(139, 92, 246, 0.1)',      // 기본 차트
  today: 'rgba(239, 68, 68, 0.15)',     // 오늘
  month: 'rgba(6, 182, 212, 0.15)',     // 이달  
  year: 'rgba(245, 158, 11, 0.15)'      // 올해
}
```

#### ⚙️ 차트 옵션 표준화
```typescript
// 모든 레이더 차트 공통 옵션
const STANDARD_CHART_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        font: { size: 12, weight: 600 },
        padding: 16,
        boxWidth: 12
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#ffffff',
      bodyColor: '#ffffff',
      borderColor: '#8b5cf6',
      borderWidth: 1,
      cornerRadius: 8
    }
  },
  scales: {
    r: {
      beginAtZero: true,
      max: 100,
      min: 0,
      ticks: {
        stepSize: 10,
        font: { size: 10 },
        color: '#6b7280',
        backdropColor: 'transparent'
      },
      grid: {
        color: 'rgba(107, 114, 128, 0.2)',
        lineWidth: 1
      },
      angleLines: {
        color: 'rgba(107, 114, 128, 0.2)',
        lineWidth: 1
      },
      pointLabels: {
        font: { size: 11, weight: 600 },
        color: '#374151'
      }
    }
  }
}
```

### 2. 네비게이션 버튼 통일

#### 🔘 버튼 레이아웃 표준
```typescript
// 페이지 상단 네비게이션 버튼 위치
const NAVIGATION_LAYOUT = {
  position: 'center',              // 중앙 정렬
  gap: '16px',                     // gap-4
  marginBottom: '24px',            // mb-6
  flexDirection: 'row',            // 가로 배치
  flexWrap: 'wrap',               // 모바일에서 줄바꿈
  maxButtonsPerRow: 4             // 한 줄 최대 4개
}

// 버튼 스타일 통일
const BUTTON_STYLES = {
  base: `px-6 py-3 rounded-xl shadow-lg hover:shadow-xl 
         transform hover:scale-105 transition-all duration-200 
         font-semibold text-white`,
  
  // 분석별 고유 색상
  sixArea: 'bg-gradient-to-r from-purple-600 to-pink-600',      // 6대 영역
  seventeen: 'bg-gradient-to-r from-blue-600 to-indigo-600',    // 17대 운세
  personality: 'bg-gradient-to-r from-green-600 to-teal-600',   // 7대 성향
  
  // 공통 네비게이션 버튼
  navigation: `bg-white dark:bg-gray-800 text-gray-700 
               dark:text-gray-300 hover:bg-gray-50 
               dark:hover:bg-gray-700 shadow-md`
}
```

#### 📱 반응형 버튼 배치
```html
<!-- 표준 네비게이션 구조 -->
<div class="flex flex-wrap justify-center gap-4 mb-6">
  <!-- 이전 페이지 -->
  <button class="navigation-button">← 이전 분석</button>
  
  <!-- 현재 페이지 표시 -->
  <span class="current-page-indicator">현재 페이지</span>
  
  <!-- 다음 페이지 -->
  <button class="navigation-button">다음 분석 →</button>
</div>
```

### 3. 시간대 선택 버튼 통일

#### 🕐 시간대 버튼 표준
```typescript
const TIME_FRAME_BUTTONS = {
  layout: {
    position: 'flex flex-wrap gap-3 mb-6',
    alignment: 'justify-start'
  },
  styles: {
    base: 'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
    active: {
      base: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
      today: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
      month: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      year: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
    },
    inactive: `bg-gray-100 dark:bg-gray-700 text-gray-600 
               dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600`
  }
}
```

### 4. 페이지 레이아웃 통일

#### 📄 표준 페이지 구조
```html
<!-- 모든 분석 페이지 공통 구조 -->
<div class="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 
            dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
  <div class="max-w-7xl mx-auto px-4 py-8">
    
    <!-- 1. 페이지 헤더 (통일) -->
    <div class="text-center mb-8">
      <h1 class="text-3xl md:text-4xl font-bold bg-gradient-to-r 
                 from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
        🎯 [분석명] 분석
      </h1>
      <p class="text-gray-600 dark:text-gray-300 text-lg">
        [분석 설명]
      </p>
    </div>

    <!-- 2. 네비게이션 버튼 (통일) -->
    <div class="flex flex-wrap justify-center gap-4 mb-6">
      <!-- 네비게이션 버튼들 -->
    </div>

    <!-- 3. 로딩 상태 (통일) -->
    <div class="loading-container">
      <!-- 통일된 로딩 스피너 -->
    </div>

    <!-- 4. 메인 차트 영역 (통일) -->
    <div class="main-chart-container mb-8">
      <!-- 레이더 차트 -->
    </div>

    <!-- 5. 상세 정보 카드들 (통일) -->
    <div class="details-section">
      <!-- 분석 결과 상세 정보 -->
    </div>

    <!-- 6. 하단 안내 (통일) -->
    <div class="footer-notice mt-8">
      <!-- 개인정보 입력 안내 등 -->
    </div>
    
  </div>
</div>
```

### 5. 컴포넌트별 세부 표준

#### 📊 점수 카드 통일
```typescript
const SCORE_CARD_STYLES = {
  container: `p-4 bg-white dark:bg-gray-700 rounded-xl shadow-sm 
              border border-gray-200 dark:border-gray-600 
              hover:shadow-md transition-shadow`,
  
  icon: 'text-2xl mb-2',
  
  label: `text-sm font-medium text-gray-700 dark:text-gray-300 
          mb-1 text-center`,
  
  score: 'text-xl font-bold text-center',
  
  progressBar: {
    container: 'w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-2',
    fill: 'h-2 rounded-full transition-all duration-300'
  }
}
```

#### 🎨 아이콘 및 이모지 표준
```typescript
const STANDARD_ICONS = {
  // 분석 타입별 메인 아이콘
  sixArea: '📊',
  seventeen: '🔮', 
  personality: '🧠',
  
  // 공통 UI 아이콘
  loading: '⏳',
  info: '📋',
  guide: '💡',
  settings: '⚙️',
  navigation: {
    previous: '←',
    next: '→',
    up: '↑',
    down: '↓'
  }
}
```

## 🛠️ 구현 우선순위

### Phase 1: 기본 통일 (즉시 구현)
1. **레이더 차트 크기 통일** - 모든 차트 h-[400px] 적용
2. **색상 팔레트 통일** - 30개 차트용 색상 시스템 구축
3. **버튼 위치 표준화** - 네비게이션 버튼 중앙 정렬
4. **로딩 스피너 통일** - 동일한 로딩 애니메이션

### Phase 2: 고급 통일 (2차 구현)  
1. **시간대 선택 UI 통일** - 모든 페이지 동일한 시간대 버튼
2. **점수 카드 디자인 통일** - 일관된 카드 레이아웃
3. **반응형 레이아웃 최적화** - 모바일/태블릿 대응
4. **다크모드 완전 지원** - 모든 차트 다크모드 색상

### Phase 3: 확장성 준비 (3차 구현)
1. **차트 컴포넌트 공통화** - BaseAnalysisChart 생성
2. **설정 시스템 구축** - 사용자 차트 선호도 저장
3. **애니메이션 통일** - 차트 등장/전환 애니메이션
4. **접근성 개선** - 스크린 리더, 키보드 네비게이션

## 📏 측정 가능한 기준

### UI 일관성 체크리스트
- [ ] 모든 레이더 차트 크기 동일 (400px)
- [ ] 색상 팔레트 30개 차트 지원
- [ ] 네비게이션 버튼 위치 통일
- [ ] 시간대 선택 UI 일관성
- [ ] 로딩 상태 표시 통일
- [ ] 반응형 레이아웃 일관성
- [ ] 다크모드 완전 지원
- [ ] 폰트 및 텍스트 크기 통일

### 성능 기준
- [ ] 페이지 로딩 시간 < 2초
- [ ] 차트 렌더링 시간 < 1초
- [ ] 페이지 간 전환 애니메이션 부드러움
- [ ] 모바일 반응성 60fps 유지

## 🎯 최종 목표

**30개 이상의 차트가 추가되어도 완벽하게 통일된 UI/UX를 제공하는 확장 가능한 디자인 시스템 구축**

---

*이 작업지시서는 사주 분석 시스템의 모든 차트와 페이지에 적용되어야 합니다.*