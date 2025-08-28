# 📋 오행 분석부터 PM 종합계획 작업지시서

## 🎯 프로젝트 목표
- **30개 차트 시스템** 완성으로 전문 사주분석 플랫폼 구축
- **오행 균형도**부터 시작하여 체계적 차트 개발 진행
- **PM 전략**에 따른 우선순위 기반 개발 로드맵 실행

## 📊 Phase 1: 핵심 차트 개발 (우선순위 1-10)

### 1. 오행 균형도 차트 (Five Elements Balance)
```typescript
interface FiveElementsAnalysis {
  elements: {
    wood: number;    // 목(木) 0-100
    fire: number;    // 화(火) 0-100
    earth: number;   // 토(土) 0-100
    metal: number;   // 금(金) 0-100
    water: number;   // 수(水) 0-100
  };
  balance: {
    overall: number;           // 전체 균형도
    strongElements: string[];  // 강한 원소들
    weakElements: string[];    // 약한 원소들
    missingElements: string[]; // 부족한 원소들
  };
  recommendations: {
    colors: string[];     // 추천 색상
    directions: string[]; // 추천 방향
    foods: string[];      // 추천 음식
    activities: string[]; // 추천 활동
  };
}
```

**차트 특징:**
- 5각형 레이더 차트로 오행 균형 시각화
- 상생/상극 관계 화살표 표시
- 계절별 변화 추이 분석
- 개인 맞춤 보완 방법 제안

### 2. 십성 분포도 차트 (Ten Gods Distribution)
```typescript
interface TenGodsAnalysis {
  gods: {
    bijeon: number;      // 비견 (같은 오행)
    geopjae: number;     // 겁재 (같은 음양)
    siksin: number;      // 식신 (내가 생하는 것)
    sanggwan: number;    // 상관 (내가 생하되 음양 다름)
    jeongjae: number;    // 정재 (내가 극하는 것)
    pyeonjae: number;    // 편재 (내가 극하되 음양 다름)
    jeonggwan: number;   // 정관 (나를 극하는 것)
    pyeongwan: number;   // 편관 (나를 극하되 음양 다름)
    jeongin: number;     // 정인 (나를 생하는 것)
    pyeongin: number;    // 편인 (나를 생하되 음양 다름)
  };
  dominant: string[];      // 주요 십성
  personality: string;     // 성격 유형
  career: string[];        // 적합 직업
  relationships: string;   // 인간관계 특성
}
```

**차트 특징:**
- 10각형 레이더 차트로 십성 분포 표시
- 직업 적성 분석 및 추천
- 인간관계 패턴 분석
- 시기별 십성 변화 추이

### 3. 대운 흐름도 차트 (Great Fortune Timeline)
```typescript
interface GreatFortuneAnalysis {
  timeline: {
    age: number;
    period: string;      // 대운 간지
    element: string;     // 주 오행
    fortune: number;     // 운세 점수 0-100
    keywords: string[];  // 핵심 키워드
    opportunities: string[];  // 기회 요소
    challenges: string[];     // 도전 요소
  }[];
  currentPeriod: {
    age: number;
    remaining: number;   // 남은 기간(년)
    trend: 'rising' | 'peak' | 'declining' | 'low';
    advice: string;
  };
  majorTransitions: {
    age: number;
    fromTo: string;
    impact: 'positive' | 'negative' | 'neutral';
    preparation: string[];
  }[];
}
```

**차트 특징:**
- 연령별 대운 변화 타임라인
- 현재 위치와 미래 전망 표시
- 중요 전환점 하이라이트
- 각 시기별 맞춤 조언 제공

### 4. 년운 흐름도 차트 (Annual Fortune Flow)
- 12개월 월별 운세 변화
- 길흉 시기 예측 및 대비책
- 중요 결정 추천 시기

### 5. 월운 세부분석 차트 (Monthly Detailed Fortune)
- 매월 세부 운세 분석
- 일주별 변화 패턴
- 실전 활용 가이드

## 📈 Phase 2: 심화 분석 차트 (우선순위 11-20)

### 6. 사업운 전문분석
### 7. 재물운 상세분석  
### 8. 건강운 종합진단
### 9. 인연운 매칭분석
### 10. 학업운 성장곡선
### 11. 직업운 적성분석
### 12. 결혼운 타이밍
### 13. 자녀운 계획수립
### 14. 이사운 방향분석
### 15. 투자운 시기분석

## 🔬 Phase 3: 전문가급 분석 (우선순위 21-30)

### 16. 사주 궁합분석
### 17. 팀워크 조합분석  
### 18. 창업 타이밍 분석
### 19. 해외운 지역분석
### 20. 부동산운 투자분석
### 21. 신용운 재정관리
### 22. 정치운 리더십분석
### 23. 예술운 창작분석
### 24. 종교운 영성분석
### 25. 여행운 방향분석
### 26. 취미운 적성분석
### 27. 봉사운 사회기여
### 28. 은퇴운 노후설계
### 29. 명예운 사회적지위
### 30. 총운 종합분석

## 🛠️ 기술 구현 전략

### 차트 개발 표준화
```typescript
// 모든 차트 공통 인터페이스
interface BaseChart {
  title: string;
  icon: string;
  description: string;
  data: any;
  options: ChartOptions;
  timeframes: ('base' | 'today' | 'month' | 'year')[];
  interpretations: {
    positive: string[];
    neutral: string[];
    negative: string[];
  };
}

// 차트 팩토리 패턴
class ChartFactory {
  static createChart(type: ChartType, data: any): BaseChart;
  static getChartOptions(isDark: boolean): ChartOptions;
  static generateInterpretation(data: any): string;
}
```

### 데이터 계산 엔진
```typescript
// 사주 계산 핵심 로직
interface SajuCalculationEngine {
  calculateFiveElements(birthInfo: SajuBirthInfo): FiveElementsAnalysis;
  calculateTenGods(fourPillars: FourPillars): TenGodsAnalysis;
  calculateGreatFortune(birthInfo: SajuBirthInfo): GreatFortuneAnalysis;
  calculateTimeFrameVariations(base: any, timeframe: string): any;
}
```

### UI 컴포넌트 아키텍처
```
/components
  /charts
    /base
      - BaseChart.tsx         // 공통 차트 래퍼
      - ChartNavigation.tsx   // 네비게이션 컴포넌트
      - TimeFrameSelector.tsx // 시간대 선택기
    /analysis
      - FiveElementsChart.tsx
      - TenGodsChart.tsx
      - GreatFortuneChart.tsx
      - [...]
  /interpretation
    - InterpretationPanel.tsx
    - RecommendationCard.tsx
    - AnalysisReport.tsx
```

## 📅 개발 일정 및 우선순위

### Week 1-2: 오행 균형도 차트
- [ ] FiveElementsChart 컴포넌트 개발
- [ ] 오행 계산 로직 구현
- [ ] 상생상극 관계 시각화
- [ ] 보완 방법 추천 시스템

### Week 3-4: 십성 분포도 차트  
- [ ] TenGodsChart 컴포넌트 개발
- [ ] 십성 계산 알고리즘 구현
- [ ] 직업 적성 매칭 시스템
- [ ] 성격 유형 분석 로직

### Week 5-6: 대운 흐름도 차트
- [ ] GreatFortuneChart 컴포넌트 개발
- [ ] 대운 계산 및 전환점 분석
- [ ] 타임라인 시각화 구현
- [ ] 미래 예측 알고리즘

### Week 7-8: 년운/월운 차트들
- [ ] 연간/월간 운세 계산 로직
- [ ] 시계열 차트 시각화
- [ ] 실전 조언 생성 시스템

## 🎨 디자인 시스템 확장

### 새로운 차트 타입별 색상 팔레트
```typescript
const CHART_COLORS = {
  fiveElements: {
    wood: '#22c55e',   // 녹색 - 목
    fire: '#ef4444',   // 빨강 - 화  
    earth: '#f59e0b',  // 노랑 - 토
    metal: '#6b7280',  // 회색 - 금
    water: '#3b82f6'   // 파랑 - 수
  },
  tenGods: {
    positive: ['#10b981', '#059669', '#047857'],
    neutral: ['#f59e0b', '#d97706', '#b45309'],
    negative: ['#ef4444', '#dc2626', '#b91c1c']
  },
  timeline: {
    past: '#6b7280',
    current: '#8b5cf6', 
    future: '#06b6d4',
    highlight: '#f59e0b'
  }
};
```

## 📊 성능 및 최적화 전략

### 차트 렌더링 최적화
- React.memo로 불필요한 리렌더링 방지
- 가상화(Virtualization)로 대용량 데이터 처리
- 레이지 로딩으로 초기 로드 시간 단축

### 계산 로직 최적화  
- Web Worker로 복잡한 계산 분리
- 메모이제이션으로 중복 계산 방지
- 캐싱 전략으로 반응 속도 개선

## 🚀 배포 및 운영 계획

### 단계별 배포 전략
1. **Alpha**: Phase 1 차트들 내부 테스트
2. **Beta**: 핵심 사용자 대상 피드백 수집
3. **Stable**: 전체 30개 차트 정식 출시

### 품질 관리
- 각 차트별 유닛 테스트 작성
- 통합 테스트로 차트 간 연동 확인
- 사용자 시나리오 기반 E2E 테스트

## 🎯 성공 지표 (KPI)

### 사용자 만족도
- 차트 조회수 및 체류시간
- 사용자 피드백 점수
- 재방문율 증가

### 시스템 성능
- 차트 로딩 시간 < 2초
- 계산 정확도 99% 이상
- 시스템 가용성 99.9% 이상

---

## 📋 즉시 실행 액션 아이템

### 🔥 High Priority (이번 주)
1. **오행 균형도 차트 기반 구조 설계**
2. **FiveElementsChart 컴포넌트 생성** 
3. **오행 계산 로직 프로토타입**
4. **기존 차트들과의 네비게이션 연동**

### ⚡ Medium Priority (다음 주)
1. 십성 분포도 차트 설계
2. 대운 흐름도 데이터 모델링
3. 차트 팩토리 패턴 구현
4. 통합 테스트 환경 구축

### 📌 Low Priority (이후)
1. 고급 분석 차트들 상세 설계
2. 전문가 검토 시스템 구축
3. 다국어 지원 준비
4. 모바일 최적화

---

*이 작업지시서는 30개 차트 시스템 완성을 위한 종합 로드맵입니다. PM의 우선순위에 따라 체계적으로 진행하여 전문 사주분석 플랫폼을 완성하겠습니다.*