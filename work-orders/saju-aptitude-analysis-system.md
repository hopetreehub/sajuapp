# 📋 작업지시서: 사주 기반 적성 분석 시스템 구축

## 🎯 프로젝트 개요
**작업명**: 주능/주흉 카테고리 및 사주 계산 엔진 완전 구현  
**담당**: Claude Code Development Team  
**우선순위**: 🔥 HIGH  
**예상 소요시간**: 4-6시간  
**완료 목표일**: 2025-09-07

## 📊 요구사항 분석

### 1. 데이터 구조 설계
#### 주능(긍정적 적성) 시스템
- **대항목**: 주능
- **중항목**: 게임, 과목, 무용, 문학, 미술, 연예, 음악, 전공, 체능 (9개 분야)
- **소항목**: 총 100+ 개의 세부 항목

#### 주흉(주의사항) 시스템  
- **대항목**: 주흉
- **중항목**: 교통사고, 사건, 사고, 사고도로 (4개 분야)
- **소항목**: 총 50+ 개의 주의사항

### 2. 기술 요구사항
- SQLite 데이터베이스 설계 (계층형 구조)
- Node.js/Express 백엔드 API
- React/TypeScript 프론트엔드
- 사주 계산 엔진 구현
- 실시간 분석 결과 제공

## 🔧 구현 단계

### Phase 1: 백엔드 데이터 구조 구축
```sql
-- 대분류 테이블
CREATE TABLE major_categories (
  id INTEGER PRIMARY KEY,
  name TEXT UNIQUE, -- '주능', '주흉'
  description TEXT
);

-- 중분류 테이블  
CREATE TABLE middle_categories (
  id INTEGER PRIMARY KEY,
  major_id INTEGER,
  name TEXT, -- '게임', '연예', '교통사고' 등
  description TEXT,
  FOREIGN KEY (major_id) REFERENCES major_categories (id)
);

-- 소분류 테이블
CREATE TABLE minor_categories (
  id INTEGER PRIMARY KEY,
  middle_id INTEGER,
  name TEXT, -- '가수', 'FPS게임', '과속사고' 등
  description TEXT,
  saju_weight REAL DEFAULT 1.0, -- 사주 계산 가중치
  FOREIGN KEY (middle_id) REFERENCES middle_categories (id)
);
```

### Phase 2: 사주 계산 엔진 개발
```typescript
interface SajuData {
  year: number;    // 생년
  month: number;   // 생월  
  day: number;     // 생일
  hour: number;    // 생시
}

interface AptitudeResult {
  positive: { // 주능
    category: string;
    items: string[];
    confidence: number; // 0-100%
  }[];
  negative: { // 주흉
    category: string;
    items: string[];
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  }[];
}
```

### Phase 3: 프론트엔드 UI 컴포넌트
- **AptitudeAnalysisPage**: 사주 입력 및 분석 결과 페이지
- **CategoryTree**: 계층형 카테고리 표시 컴포넌트
- **SajuCalculator**: 사주 계산 로직 컴포넌트
- **ResultDashboard**: 분석 결과 대시보드

## 📋 상세 작업 목록

### 🗄️ 백엔드 개발 (packages/backend/services/saju-analysis)
- [ ] 1.1 데이터베이스 스키마 설계 및 마이그레이션
- [ ] 1.2 주능 카테고리 데이터 삽입 (100+ 항목)
- [ ] 1.3 주흉 카테고리 데이터 삽입 (50+ 항목)  
- [ ] 1.4 사주 계산 로직 구현
  - [ ] 천간지지 계산
  - [ ] 오행 분석
  - [ ] 십성 분석
  - [ ] 신살 분석
- [ ] 1.5 적성 분석 API 엔드포인트 구현
- [ ] 1.6 결과 저장/조회 API 구현

### 🎨 프론트엔드 개발 (packages/web/src)
- [ ] 2.1 사주 입력 폼 컴포넌트 (`SajuInputForm.tsx`)
- [ ] 2.2 적성 분석 결과 페이지 (`AptitudeAnalysisPage.tsx`)
- [ ] 2.3 카테고리 트리 뷰 컴포넌트 (`CategoryTreeView.tsx`)
- [ ] 2.4 주능/주흉 결과 카드 (`AptitudeResultCard.tsx`)
- [ ] 2.5 사주 상세 정보 모달 (`SajuDetailModal.tsx`)
- [ ] 2.6 TypeScript 타입 정의 (`types/saju.ts`)

### 🧮 사주 계산 엔진
- [ ] 3.1 달력 변환 로직 (양력↔음력)
- [ ] 3.2 간지 계산 알고리즘
- [ ] 3.3 오행 상생상극 분석
- [ ] 3.4 적성 매칭 알고리즘
- [ ] 3.5 주의사항 위험도 계산
- [ ] 3.6 신뢰도 점수 산출

### 🔗 연동 및 테스트
- [ ] 4.1 API Gateway 라우팅 설정
- [ ] 4.2 프론트엔드-백엔드 연동
- [ ] 4.3 단위 테스트 작성
- [ ] 4.4 통합 테스트 실행
- [ ] 4.5 성능 최적화

## 📁 예상 파일 구조

```
packages/
├── backend/services/saju-analysis/
│   ├── src/
│   │   ├── index.ts              # 메인 서버
│   │   ├── models/
│   │   │   ├── SajuModel.ts      # 사주 계산 모델
│   │   │   └── CategoryModel.ts  # 카테고리 모델
│   │   ├── services/
│   │   │   ├── SajuCalculator.ts # 사주 계산 엔진
│   │   │   └── AptitudeAnalyzer.ts # 적성 분석 엔진
│   │   ├── routes/
│   │   │   ├── categories.ts     # 카테고리 API
│   │   │   └── analysis.ts       # 분석 API
│   │   └── migrations/
│   │       ├── 001_create_categories.sql
│   │       └── 002_insert_data.sql
│   └── data/
│       └── saju.db
└── web/src/
    ├── pages/
    │   └── AptitudeAnalysisPage.tsx
    ├── components/Saju/
    │   ├── SajuInputForm.tsx
    │   ├── CategoryTreeView.tsx
    │   ├── AptitudeResultCard.tsx
    │   └── SajuDetailModal.tsx
    ├── services/
    │   └── sajuApi.ts
    └── types/
        └── saju.ts
```

## 🎯 핵심 기능 명세

### 1. 사주 입력 시스템
```typescript
interface SajuInput {
  birthDate: string;    // YYYY-MM-DD
  birthTime: string;    // HH:MM
  isLunar: boolean;     // 음력 여부
  gender: 'M' | 'F';    // 성별
  timezone?: string;    // 시간대
}
```

### 2. 적성 분석 결과
```typescript
interface AnalysisResult {
  // 주능 (긍정적 적성)
  positive: {
    games: string[];          // 게임 분야
    subjects: string[];       // 과목 분야  
    dance: string[];          // 무용 분야
    literature: string[];     // 문학 분야
    arts: string[];           // 미술 분야
    entertainment: string[];  // 연예 분야
    music: string[];          // 음악 분야
    majors: string[];         // 전공 분야
    sports: string[];         // 체능 분야
  };
  
  // 주흉 (주의사항)
  negative: {
    trafficAccidents: string[];  // 교통사고
    incidents: string[];         // 사건
    accidents: string[];         // 사고  
    roadHazards: string[];      // 사고도로
  };
  
  // 메타 정보
  confidence: number;        // 신뢰도 (0-100%)
  calculatedAt: string;      // 계산 시점
  sajuDetails: SajuDetails;  // 사주 상세 정보
}
```

### 3. API 엔드포인트 설계
```
GET  /api/saju/categories              # 전체 카테고리 조회
GET  /api/saju/categories/positive     # 주능 카테고리만
GET  /api/saju/categories/negative     # 주흉 카테고리만
POST /api/saju/analyze                 # 사주 분석 실행
GET  /api/saju/analysis/:userId        # 저장된 분석 결과 조회
POST /api/saju/analysis/save           # 분석 결과 저장
```

## ⚙️ 기술적 고려사항

### 1. 사주 계산 정확성
- 전통 명리학 알고리즘 적용
- 음력/양력 변환 라이브러리 사용
- 절기 기준 정확한 월 계산
- 지역별 시차 보정

### 2. 성능 최적화
- 계산 결과 캐싱
- 데이터베이스 인덱스 최적화
- 비동기 분석 처리
- 결과 페이지네이션

### 3. 사용자 경험
- 직관적인 카테고리 표시
- 실시간 입력 검증
- 로딩 상태 표시
- 분석 결과 시각화

## 🚀 배포 및 테스트 계획

### 1. 개발 환경 테스트
- [ ] 로컬 서버 구동 (포트 4015)
- [ ] API 엔드포인트 테스트
- [ ] 프론트엔드 연동 확인
- [ ] 사주 계산 정확성 검증

### 2. 사용자 시나리오 테스트
- [ ] 다양한 생년월일 입력 테스트
- [ ] 음력/양력 변환 테스트  
- [ ] 결과 저장/조회 테스트
- [ ] 모바일 반응형 테스트

## 📝 완료 기준

### ✅ 완료 조건
1. **백엔드**: 모든 API 엔드포인트 정상 동작
2. **프론트엔드**: 직관적이고 완전한 UI/UX
3. **계산 엔진**: 전통 명리학 기반 정확한 분석
4. **데이터**: 150+ 카테고리 완전 구축
5. **연동**: 기존 시스템과 완벽한 통합
6. **테스트**: 모든 기능 정상 작동 확인

### 📊 품질 지표
- API 응답 시간: < 2초
- 계산 정확도: 95% 이상
- UI 반응성: 매끄러운 인터랙션
- 데이터 완정성: 모든 카테고리 구현

---

## 🎉 기대 효과

1. **사용자 만족도 향상**: 정확하고 상세한 적성 분석
2. **서비스 차별화**: 전통 사주와 현대적 분류의 결합
3. **데이터 활용도**: 개인별 맞춤 추천 시스템 기반
4. **확장성**: 향후 AI 분석 모듈 추가 가능

**🚀 이 시스템 완성으로 운명나침반이 단순한 달력 앱을 넘어선 종합 운세 플랫폼으로 진화합니다!**

---

**📋 작업지시서 ID**: WO-SAJU-2025-001  
**작성일**: 2025-09-07  
**최종 검토**: Claude Code PM