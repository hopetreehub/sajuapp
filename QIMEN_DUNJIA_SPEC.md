# 귀문둔갑(奇門遁甲) 시스템 개발 작업지시서

## 📋 프로젝트 개요
- **프로젝트명**: 귀문둔갑 운세 시스템
- **개발 방식**: 기존 운명나침반 앱에 독립 메뉴로 통합
- **롤백 포인트**: commit `299209f` (2025-10-11)
- **개발 기간**: 2-3일 (MVP 기준)

## 🎯 개발 목표
중국 고대 점술 시스템인 귀문둔갑을 웹 애플리케이션으로 구현하여 사용자에게 시간/방위 기반 운세 정보 제공

## 📐 시스템 구성 요소

### 1. 핵심 데이터 구조

#### 구궁(九宮) - 3x3 그리드
```
4 9 2
3 5 7
8 1 6
```
- 중앙(5궁) + 팔방(1,2,3,4,6,7,8,9궁)
- 각 궁은 방위와 연결: 1=북, 2=서남, 3=동, 4=동남, 6=서북, 7=서, 8=동북, 9=남

#### 팔문(八門)
1. 휴문(休門) - 휴식, 평온
2. 생문(生門) - 생성, 발전
3. 상문(傷門) - 상처, 손상
4. 두문(杜門) - 막힘, 폐쇄
5. 경문(景門) - 경치, 명예
6. 사문(死門) - 죽음, 종결
7. 경문(驚門) - 놀람, 변화
8. 개문(開門) - 개방, 시작

#### 구성(九星)
1. 천봉(天蓬) - 수성, 지혜
2. 천임(天任) - 토성, 신뢰
3. 천충(天冲) - 목성, 충동
4. 천보(天輔) - 목성, 보좌
5. 천영(天英) - 화성, 명예
6. 천예(天芮) - 토성, 질병
7. 천주(天柱) - 금성, 권위
8. 천심(天心) - 금성, 의술
9. 천금(天禽) - 토성, 중심

#### 팔신(八神)
1. 직부(直符) - 권력의 신
2. 등사(螣蛇) - 번뇌의 신
3. 태음(太陰) - 음의 신
4. 육합(六合) - 화합의 신
5. 백호(白虎) - 흉의 신
6. 현무(玄武) - 도적의 신
7. 구지(九地) - 방어의 신
8. 구천(九天) - 공격의 신

### 2. 국(局) 계산 로직

#### 국 결정 공식
```typescript
// 1. 절기 확인 (24절기 중 상중하 구분)
// 2. 음둔/양둔 결정 (동지~하지: 양둔, 하지~동지: 음둔)
// 3. 시간 간지 계산
// 4. 구궁 배치 계산
```

#### 시간 계층
- **시간(時)**: 2시간 단위 (자시/축시/인시...)
- **일(日)**: 하루 단위
- **월(月)**: 절기 단위
- **년(年)**: 연도 단위

## 🏗️ 기술 구조

### Phase 1: 데이터 구조 설계 (Day 1 오전)

**파일 생성:**
```
packages/web/src/
├── data/
│   └── qimenDunjiaData.ts      # 팔문/구성/팔신 데이터
├── utils/
│   └── qimenCalculator.ts       # 국 계산 로직
└── types/
    └── qimen.ts                 # TypeScript 타입 정의
```

**타입 정의:**
```typescript
export type Palace = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type Gate = '휴문' | '생문' | '상문' | '두문' | '경문' | '사문' | '경문' | '개문';

export type Star = '천봉' | '천임' | '천충' | '천보' | '천영' | '천예' | '천주' | '천심' | '천금';

export type Spirit = '직부' | '등사' | '태음' | '육합' | '백호' | '현무' | '구지' | '구천';

export interface QimenChart {
  dateTime: Date;
  ju: number;              // 국 번호 (1-18)
  yinYang: 'yin' | 'yang'; // 음둔/양둔
  palaces: {
    [key in Palace]: {
      gate: Gate;
      star: Star;
      spirit?: Spirit;
      tianGan: string;      // 천간
      diZhi: string;        // 지지
      direction: string;    // 방위명
      fortune: 'good' | 'neutral' | 'bad'; // 길흉
      description: string;  // 해석
    }
  };
}
```

### Phase 2: 계산 로직 구현 (Day 1 오후)

**주요 함수:**
```typescript
// 국 계산
export function calculateQimenChart(
  dateTime: Date,
  birthInfo?: { year: number; month: number; day: number }
): QimenChart;

// 절기 계산
function getSolarTerm(date: Date): { term: string; index: number };

// 음둔/양둔 결정
function getYinYangDun(date: Date): 'yin' | 'yang';

// 시간 간지 계산
function getHourGanZhi(date: Date): { gan: string; zhi: string };

// 구궁 배치
function arrangePalaces(
  ju: number,
  yinYang: 'yin' | 'yang',
  hourGanZhi: { gan: string; zhi: string }
): QimenChart['palaces'];

// 길흉 판단
function evaluateFortune(
  palace: QimenChart['palaces'][Palace]
): 'good' | 'neutral' | 'bad';

// 해석 생성
function generateInterpretation(
  palace: QimenChart['palaces'][Palace],
  context: 'general' | 'business' | 'love' | 'travel'
): string;
```

### Phase 3: UI 컴포넌트 개발 (Day 2)

**컴포넌트 구조:**
```
packages/web/src/components/qimen/
├── QimenView.tsx                  # 메인 뷰
├── QimenChart.tsx                 # 구궁 차트
├── PalaceCard.tsx                 # 각 궁 카드
├── FortuneInterpretation.tsx      # 해석 패널
└── TimeSelector.tsx               # 시간 선택기
```

**UI 레이아웃:**
```
┌─────────────────────────────────────┐
│  ⚡ 귀문둔갑                         │
├─────────────────────────────────────┤
│  [날짜/시간 선택기]                  │
├─────────────────────────────────────┤
│  구궁 차트 (3x3 그리드)              │
│  ┌─────┬─────┬─────┐              │
│  │ 4궁 │ 9궁 │ 2궁 │              │
│  ├─────┼─────┼─────┤              │
│  │ 3궁 │ 5궁 │ 7궁 │              │
│  ├─────┼─────┼─────┤              │
│  │ 8궁 │ 1궁 │ 6궁 │              │
│  └─────┴─────┴─────┘              │
├─────────────────────────────────────┤
│  [선택한 궁 상세 정보]               │
│  - 방위: 남                         │
│  - 팔문: 개문                       │
│  - 구성: 천영                       │
│  - 길흉: 대길                       │
│  - 해석: ...                        │
└─────────────────────────────────────┘
```

### Phase 4: 메인 메뉴 통합 (Day 3 오전)

**라우팅 추가:**
```typescript
// packages/web/src/App.tsx 수정
<Route path="/qimen" element={<QimenView />} />
```

**메뉴 추가:**
```typescript
// 네비게이션에 추가
{
  path: '/qimen',
  icon: <Sparkles />,
  label: '귀문둔갑',
  description: '시간과 방위의 길흉'
}
```

### Phase 5: 테스트 및 검증 (Day 3 오후)

**테스트 케이스:**
1. 현재 시간 국 계산 정확성
2. 과거/미래 시간 계산
3. 특정 시간대 길흉 판단
4. UI 반응성 및 다크모드
5. 모바일 레이아웃

## 🎨 디자인 가이드

### 색상 체계
```css
/* 길흉 색상 */
--fortune-good: #10B981;    /* 초록 */
--fortune-neutral: #6B7280; /* 회색 */
--fortune-bad: #EF4444;     /* 빨강 */

/* 궁 배경 */
--palace-bg-light: #F3F4F6;
--palace-bg-dark: #1F2937;

/* 강조색 */
--qimen-primary: #8B5CF6;   /* 보라 */
--qimen-secondary: #EC4899; /* 핑크 */
```

### 반응형 브레이크포인트
- Mobile: < 768px (1열 레이아웃)
- Tablet: 768px - 1024px (2열 레이아웃)
- Desktop: > 1024px (3열 레이아웃)

## 📝 개발 체크리스트

### Day 1
- [ ] Git 브랜치 생성 (`feature/qimen-dunjia`)
- [ ] 타입 정의 작성
- [ ] 기본 데이터 작성 (팔문/구성/팔신)
- [ ] 절기 계산 함수
- [ ] 국 계산 기본 로직
- [ ] 단위 테스트

### Day 2
- [ ] UI 컴포넌트 뼈대
- [ ] 구궁 차트 시각화
- [ ] 궁 클릭 인터랙션
- [ ] 시간 선택기
- [ ] 해석 패널
- [ ] 다크모드 지원

### Day 3
- [ ] 메인 메뉴 통합
- [ ] 라우팅 추가
- [ ] 사주 데이터 연동 (선택)
- [ ] E2E 테스트
- [ ] 성능 최적화
- [ ] Git 커밋 및 PR

## 🚨 롤백 절차

문제 발생 시:
```bash
# 1. 현재 작업 저장 (선택)
git stash

# 2. 체크포인트로 롤백
git reset --hard 299209f

# 3. 작업 브랜치 삭제 (필요시)
git branch -D feature/qimen-dunjia

# 4. 새로 시작
git checkout -b feature/qimen-dunjia-v2
```

## 📚 참고 자료

### 귀문둔갑 이론
- 24절기 표
- 음둔/양둔 전환 규칙
- 구궁비성도
- 팔문길흉표

### 기술 문서
- React TypeScript Best Practices
- Chart.js / D3.js 문서
- Tailwind CSS 그리드 시스템

## 🎯 성공 기준

1. **기능 완성도**
   - 현재 시간 기준 국 계산 정확도 95% 이상
   - 모든 궁에 대한 길흉 판단 제공
   - 방위별 상세 해석 제공

2. **사용자 경험**
   - 페이지 로드 시간 < 2초
   - 차트 렌더링 < 1초
   - 모바일 반응형 완벽 지원

3. **코드 품질**
   - TypeScript 에러 0개
   - ESLint 경고 0개
   - 단위 테스트 커버리지 > 70%

## 📊 예상 산출물

- `qimenDunjiaData.ts` (~300줄)
- `qimenCalculator.ts` (~500줄)
- `qimen.ts` (~100줄)
- `QimenView.tsx` (~200줄)
- `QimenChart.tsx` (~300줄)
- `PalaceCard.tsx` (~150줄)
- 테스트 파일들 (~300줄)

**총 예상 코드량**: ~1,850줄

---

## ✅ 승인 및 시작

**작성일**: 2025-10-11
**작성자**: Claude Code
**롤백 포인트**: commit `299209f`

**사용자 승인 대기 중...**

승인 후 작업 시작하겠습니다! 🚀
