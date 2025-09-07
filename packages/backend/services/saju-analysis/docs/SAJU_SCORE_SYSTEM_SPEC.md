# 🎯 운명나침반 사주 점수 시스템 작업지시서

## 📋 프로젝트 개요
**목표**: 주능/주흉 카테고리를 사주와 연결하여 시점별(기본/오늘/이달/올해) 점수를 계산하는 통합 시스템 구축

## 🏗️ 시스템 아키텍처

### 1. 점수 계산 체계
```
[사용자 사주] + [시점별 운세] + [카테고리 가중치] = [최종 점수]
```

### 2. 시점별 분석 구조
- **기본 (Base)**: 태어난 사주 본연의 점수
- **오늘 (Daily)**: 오늘의 일운과 사주 상호작용
- **이달 (Monthly)**: 이달의 월운과 사주 상호작용  
- **올해 (Yearly)**: 올해의 세운과 사주 상호작용

## 📊 점수 계산 로직

### 1. 기본 점수 산출 공식
```typescript
interface ScoreCalculation {
  // 1단계: 사주 기본 점수 (0~100)
  baseScore: number = calculateFromSaju(userSaju);
  
  // 2단계: 시점별 가중치 (-50 ~ +50)
  temporalModifier: {
    daily: number;    // 일운 영향
    monthly: number;  // 월운 영향
    yearly: number;   // 세운 영향
  };
  
  // 3단계: 카테고리별 적합도 (0~100)
  categoryFitness: {
    positive: Map<string, number>; // 주능 카테고리
    negative: Map<string, number>; // 주흉 카테고리
  };
  
  // 4단계: 최종 점수 (0~100)
  finalScore: number = baseScore + temporalModifier + categoryFitness;
}
```

### 2. 사주 요소별 가중치

#### 천간지지 상호작용
- **상생 관계**: +20점
- **상극 관계**: -20점
- **합/충 관계**: ±30점

#### 오행 균형도
- **완벽한 균형**: +30점
- **극단적 편중**: -30점
- **적절한 편중**: +10점

#### 십성 발달도
- **주요 십성 발달**: +25점
- **부족한 십성**: -15점

### 3. 시점별 운세 보정

#### 일운 (Daily) 계산
```typescript
dailyScore = {
  interaction: calculateDayPillarInteraction(userSaju, todayPillar),
  weight: 0.2, // 20% 영향
  range: [-10, +10]
}
```

#### 월운 (Monthly) 계산
```typescript
monthlyScore = {
  interaction: calculateMonthPillarInteraction(userSaju, currentMonthPillar),
  weight: 0.3, // 30% 영향
  range: [-15, +15]
}
```

#### 세운 (Yearly) 계산
```typescript
yearlyScore = {
  interaction: calculateYearPillarInteraction(userSaju, currentYearPillar),
  weight: 0.5, // 50% 영향
  range: [-25, +25]
}
```

## 💾 데이터베이스 설계

### 1. 점수 저장 테이블
```sql
CREATE TABLE saju_scores (
  id INTEGER PRIMARY KEY,
  user_id TEXT NOT NULL,
  category_type TEXT CHECK(type IN ('positive', 'negative')),
  category_name TEXT NOT NULL,
  
  -- 시점별 점수
  base_score INTEGER DEFAULT 50,      -- 기본 점수
  daily_score INTEGER,                 -- 오늘 점수
  monthly_score INTEGER,               -- 이달 점수
  yearly_score INTEGER,                -- 올해 점수
  
  -- 메타데이터
  calculated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  saju_data JSON,                      -- 사주 정보 캐싱
  
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 인덱스 추가
CREATE INDEX idx_user_scores ON saju_scores(user_id, category_type);
CREATE INDEX idx_calculated_date ON saju_scores(calculated_at);
```

### 2. 카테고리 가중치 테이블 업데이트
```sql
ALTER TABLE minor_categories ADD COLUMN base_weight REAL DEFAULT 1.0;
ALTER TABLE minor_categories ADD COLUMN temporal_weight JSON;
```

## 🔌 API 엔드포인트 설계

### 1. 통합 점수 조회
```typescript
POST /api/saju/scores/comprehensive
Request: {
  user_id: string;
  birth_date: string;
  birth_time: string;
  is_lunar: boolean;
  time_scope?: 'all' | 'daily' | 'monthly' | 'yearly';
}

Response: {
  positive_scores: {
    [category: string]: {
      base: number;
      daily: number;
      monthly: number;
      yearly: number;
      items: Array<{name: string, score: number}>;
    }
  },
  negative_scores: {
    [category: string]: {
      base: number;
      daily: number;
      monthly: number;
      yearly: number;
      items: Array<{name: string, risk: number}>;
    }
  },
  summary: {
    overall_fortune: number;
    trend: 'rising' | 'stable' | 'declining';
    recommendations: string[];
  }
}
```

### 2. 실시간 점수 업데이트
```typescript
GET /api/saju/scores/realtime/:user_id
Response: {
  current_scores: {
    timestamp: string;
    daily_change: number;
    monthly_change: number;
    yearly_change: number;
  }
}
```

### 3. 카테고리별 상세 점수
```typescript
GET /api/saju/scores/category/:user_id/:category_name
Response: {
  category: string;
  type: 'positive' | 'negative';
  scores: {
    base: number;
    daily: number;
    monthly: number;
    yearly: number;
  },
  breakdown: {
    saju_influence: number;
    temporal_influence: number;
    category_fitness: number;
  },
  items: Array<{
    name: string;
    score: number;
    confidence: number;
  }>
}
```

## 🎨 프론트엔드 UI 설계

### 1. 점수 대시보드 컴포넌트
```tsx
interface ScoreDashboard {
  // 시점별 탭
  tabs: ['기본', '오늘', '이달', '올해'];
  
  // 점수 카드
  scoreCards: {
    positive: CategoryScoreCard[];
    negative: CategoryScoreCard[];
  };
  
  // 시각화
  charts: {
    radarChart: boolean;    // 카테고리별 점수 레이더
    trendChart: boolean;    // 시간별 추세 그래프
    heatmap: boolean;       // 점수 히트맵
  };
}
```

### 2. 점수 표시 형식
- **주능 점수**: 0~100점 (높을수록 좋음)
- **주흉 위험도**: 0~100점 (낮을수록 좋음)
- **색상 코딩**:
  - 🟢 80점 이상: 매우 좋음
  - 🟡 60~79점: 좋음
  - 🟠 40~59점: 보통
  - 🔴 39점 이하: 주의

## 📈 구현 우선순위

### Phase 1 (핵심 기능)
1. ✅ 데이터베이스 정리 (완료)
2. 🔄 점수 계산 엔진 구현
3. 🔄 기본 API 엔드포인트 개발
4. 🔄 기본 UI 컴포넌트 제작

### Phase 2 (고도화)
1. ⏳ 실시간 업데이트 시스템
2. ⏳ 상세 분석 리포트
3. ⏳ 시각화 차트 구현
4. ⏳ 캐싱 및 성능 최적화

### Phase 3 (확장)
1. ⏳ AI 기반 해석 추가
2. ⏳ 개인화 추천 시스템
3. ⏳ 통계 및 트렌드 분석
4. ⏳ 사용자 피드백 반영

## ⚙️ 기술 스택
- **Backend**: Node.js + TypeScript + Express
- **Database**: SQLite + JSON 저장
- **Frontend**: React + TypeScript + Chart.js
- **Cache**: In-memory 캐싱
- **Testing**: Jest + Supertest

## 📝 테스트 시나리오

### 1. 단위 테스트
- 사주 계산 정확도
- 점수 산출 로직
- 시점별 가중치 적용

### 2. 통합 테스트
- API 응답 시간 (<500ms)
- 데이터 일관성
- 동시 요청 처리

### 3. 사용자 테스트
- UI 반응 속도
- 점수 표시 정확도
- 크로스 브라우저 호환성

## 🚀 배포 계획
1. **개발 환경**: localhost:4000
2. **스테이징**: 내부 테스트 서버
3. **프로덕션**: 클라우드 배포

## 📌 주의사항
1. 모든 점수는 0~100 범위로 정규화
2. 사주 데이터는 암호화하여 저장
3. 캐시는 자정에 자동 갱신
4. 에러 처리 및 로깅 필수

---

**작성일**: 2025-01-08
**PM**: Claude Code Swarm PM
**상태**: 🟡 작업 대기중