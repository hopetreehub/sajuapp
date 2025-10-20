# 귀문둔갑(奇門遁甲) 기능 강화 작업지시서

**작성일**: 2025-10-19
**브랜치**: `feature/qimen-dunjia`
**작성자**: PM (Swarm + 전문가 페르소나)
**우선순위**: 🔥 High Priority

---

## 📋 Executive Summary

운명나침반 앱의 귀문둔갑 기능은 **이미 매우 우수한 수준**으로 구현되어 있습니다. 현재 시스템은 PRD에서 요구한 **세계 최초 모바일 구현**을 성공적으로 달성했으며, 실시간 계산, AI 통합, 목적별 분석 등 핵심 기능이 모두 작동합니다.

이 작업지시서는 **이미 탄탄한 기반** 위에 다음 단계의 강화 기능을 추가하는 것을 목표로 합니다.

---

## ✅ 현재 구현 상태 (검증 완료)

### 핵심 기능 (100% 구현)
- ✅ **정밀한 귀문둔갑 계산 엔진**
  - 절기 정확 계산 (24절기)
  - 음둔/양둔 자동 판별
  - 국(局) 1~18 전체 계산
  - 팔문(八門), 구성(九星), 팔신(八神) 배치
  - 신격 패턴 분석 (조합 분석)

- ✅ **사용자 인터페이스**
  - 3x3 구궁 차트 시각화
  - 길흉 히트맵 모드
  - 개별 궁 상세 정보 모달
  - 시간 선택기 (날짜/시간)
  - 초보자 가이드 팝업
  - 간단 요약 / 상세 모드 전환

- ✅ **고급 기능**
  - 고객 선택 및 개인화 해석
  - 8가지 목적별 해석 (일반/사업/혼인/건강/이사여행/학업/소송/분실물)
  - AI 채팅 (Claude API 통합)
  - 시간대 비교 분석
  - PDF 출력
  - 자동 갱신 (2시간마다)
  - 변경 히스토리 추적
  - 길흉 방위 요약

### 컴포넌트 구조 (10개 컴포넌트)
```
packages/web/src/components/qimen/
├── QimenView.tsx          # 메인 뷰 (통합 관리)
├── QimenChart.tsx         # 3x3 구궁 차트
├── PalaceCard.tsx         # 개별 궁 카드
├── PalaceDetail.tsx       # 궁 상세 모달
├── TimeSelector.tsx       # 시간 선택기
├── SimpleSummary.tsx      # 간단 요약
├── AIChat.tsx             # AI 채팅
├── FortuneHeatmap.tsx     # 길흉 히트맵
├── TimeComparison.tsx     # 시간대 비교
└── BeginnerGuide.tsx      # 초보자 가이드
```

### 백엔드 API
```
packages/backend/services/ai-service/src/routes/
└── qimen.routes.ts
    ├── POST /api/v1/qimen/chat       # AI 채팅
    └── POST /api/v1/qimen/interpret  # 전체 해석
```

---

## 🎯 강화 목표

### 단기 목표 (1-2주)
1. 캘린더 통합으로 실용성 극대화
2. 알림 시스템으로 사용자 참여도 증가
3. 저장/공유 기능으로 바이럴 효과

### 중기 목표 (1개월)
4. 통계/분석 기능으로 전문성 강화
5. 모바일 UX 최적화
6. 교육 콘텐츠 확대

### 장기 목표 (2-3개월)
7. 3D 시각화로 차별화
8. 다국어 지원으로 글로벌 진출
9. API 개방으로 생태계 구축

---

## 📝 상세 작업 항목

### 🔥 Priority 1: 캘린더 통합 (High Impact)

#### 작업 ID: QIMEN-001
**제목**: 귀문둔갑 + 캘린더 일정 통합
**예상 시간**: 8-12시간
**난이도**: ⭐⭐⭐

#### 목표
사용자가 캘린더에서 일정을 생성할 때 해당 시간의 귀문둔갑 길흉 정보를 자동으로 표시하고, 최적의 시간을 제안합니다.

#### 구현 사항
1. **캘린더 일정 생성 시 귀문둔갑 정보 표시**
   ```typescript
   // packages/web/src/components/Calendar/EventFormModal.tsx
   interface EventFormData {
     title: string;
     startTime: Date;
     endTime: Date;
     qimenInfo?: {
       score: number;
       level: Fortune;
       bestPalace: Palace;
       warnings: string[];
       recommendations: string[];
     };
   }
   ```

2. **최적 시간 제안 기능**
   ```typescript
   // packages/web/src/utils/qimenOptimalTime.ts
   export function suggestOptimalTimes(
     baseDate: Date,
     purpose: QimenContext,
     durationHours: number,
     rangeHours: number = 24
   ): Array<{
     startTime: Date;
     endTime: Date;
     qimenScore: number;
     reason: string;
   }>
   ```

3. **일정 목록에 길흉 아이콘 표시**
   - 🌟 대길 (80-100점)
   - ✨ 길 (60-79점)
   - ⚖️ 평 (40-59점)
   - ⚠️ 흉 (20-39점)
   - ❌ 대흉 (0-19점)

#### 파일 수정/생성
- `packages/web/src/components/Calendar/EventFormModal.tsx` (수정)
- `packages/web/src/components/Calendar/EventList.tsx` (수정)
- `packages/web/src/utils/qimenOptimalTime.ts` (신규)
- `packages/web/src/hooks/useQimenCalendarIntegration.ts` (신규)

#### 검증 기준
- [ ] 일정 생성 시 귀문둔갑 정보 실시간 계산
- [ ] 최적 시간 제안 3개 이상 표시
- [ ] 캘린더 뷰에서 길흉 아이콘 정상 표시
- [ ] 성능: 1초 이내 계산 완료

---

### 🔥 Priority 2: 알림 시스템 (High Engagement)

#### 작업 ID: QIMEN-002
**제목**: 중요 시간대 알림 시스템
**예상 시간**: 6-8시간
**난이도**: ⭐⭐

#### 목표
사용자가 설정한 목적에 따라 길한 시간대가 도래하면 자동으로 알림을 보냅니다.

#### 구현 사항
1. **알림 설정 UI**
   ```typescript
   // packages/web/src/components/qimen/NotificationSettings.tsx
   interface QimenNotificationSettings {
     enabled: boolean;
     contexts: QimenContext[];  // 알림 받을 목적
     minScore: number;           // 최소 점수 (예: 80점 이상만 알림)
     timeRange: {
       start: string;            // "09:00"
       end: string;              // "18:00"
     };
     frequency: 'realtime' | 'hourly' | 'daily';
   }
   ```

2. **백그라운드 체크 로직**
   ```typescript
   // packages/web/src/workers/qimenNotificationWorker.ts
   // Service Worker를 사용하여 백그라운드에서 주기적으로 체크
   ```

3. **브라우저 알림 통합**
   - Web Notification API 사용
   - 알림 권한 요청 UI
   - 알림 클릭 시 귀문둔갑 페이지로 이동

#### 파일 수정/생성
- `packages/web/src/components/qimen/NotificationSettings.tsx` (신규)
- `packages/web/src/workers/qimenNotificationWorker.ts` (신규)
- `packages/web/src/utils/browserNotification.ts` (신규)
- `packages/web/src/components/qimen/QimenView.tsx` (수정 - 설정 버튼 추가)

#### 검증 기준
- [ ] 알림 설정 UI 정상 작동
- [ ] 길한 시간대 도래 시 알림 발송
- [ ] 알림 클릭 시 올바른 페이지로 이동
- [ ] 배터리 사용량 최소화 (1시간당 1회 체크)

---

### 🔥 Priority 3: 저장 및 공유 기능 (Viral Effect)

#### 작업 ID: QIMEN-003
**제목**: 귀문둔갑 결과 저장 및 공유
**예상 시간**: 10-14시간
**난이도**: ⭐⭐⭐⭐

#### 목표
사용자가 중요한 귀문둔갑 분석 결과를 저장하고, SNS나 메신저로 공유할 수 있습니다.

#### 구현 사항
1. **즐겨찾기 기능**
   ```typescript
   // packages/web/src/stores/qimenBookmarkStore.ts
   interface QimenBookmark {
     id: string;
     dateTime: Date;
     chart: QimenChart;
     customerName?: string;
     context: QimenContext;
     note: string;
     createdAt: Date;
     tags: string[];
   }
   ```

2. **이미지 생성 및 공유**
   ```typescript
   // packages/web/src/utils/qimenImageExport.ts
   export async function exportQimenToImage(
     chart: QimenChart,
     options: {
       format: 'png' | 'jpg';
       size: 'sm' | 'md' | 'lg';
       includeWatermark: boolean;
       theme: 'light' | 'dark';
     }
   ): Promise<Blob>
   ```

3. **공유 기능**
   - 카카오톡 공유
   - Facebook 공유
   - Twitter 공유
   - URL 복사 (단축 URL)
   - 이미지 다운로드

4. **공유 페이지 (Public URL)**
   ```
   https://운명나침반.com/qimen/share/{uuid}
   ```
   - 로그인 없이 볼 수 있는 공개 페이지
   - SEO 최적화 (OG 태그)
   - 귀문둔갑 차트 읽기 전용 표시

#### 파일 수정/생성
- `packages/web/src/stores/qimenBookmarkStore.ts` (신규)
- `packages/web/src/components/qimen/BookmarkButton.tsx` (신규)
- `packages/web/src/components/qimen/ShareModal.tsx` (신규)
- `packages/web/src/utils/qimenImageExport.ts` (신규)
- `packages/web/src/pages/QimenSharePage.tsx` (신규)
- `packages/backend/services/qimen-share/` (신규 마이크로서비스)

#### 검증 기준
- [ ] 즐겨찾기 추가/삭제 정상 작동
- [ ] 이미지 내보내기 1024x1024 고해상도
- [ ] 공유 URL 생성 및 접근 가능
- [ ] SNS 공유 시 미리보기 정상 표시

---

### 🟡 Priority 4: 통계 및 트렌드 분석 (Professional)

#### 작업 ID: QIMEN-004
**제목**: 장기 귀문둔갑 통계 및 트렌드 분석
**예상 시간**: 12-16시간
**난이도**: ⭐⭐⭐⭐

#### 목표
사용자의 과거 귀문둔갑 데이터를 분석하여 패턴을 발견하고, 미래를 예측합니다.

#### 구현 사항
1. **개인 통계 대시보드**
   ```typescript
   // packages/web/src/components/qimen/StatsDashboard.tsx
   interface QimenStats {
     totalChecks: number;
     averageScore: number;
     mostFrequentContext: QimenContext;
     bestTimeOfDay: string;  // "09:00-11:00"
     favoriteDirection: Direction;
     weeklyTrend: Array<{
       week: string;
       avgScore: number;
     }>;
     monthlyPatterns: Array<{
       month: string;
       excellentDays: number;
       terribleDays: number;
     }>;
   }
   ```

2. **패턴 인식 AI**
   ```typescript
   // packages/web/src/utils/qimenPatternAI.ts
   export function analyzeUserPatterns(
     history: QimenBookmark[]
   ): {
     insights: string[];
     recommendations: string[];
     predictions: Array<{
       date: Date;
       score: number;
       confidence: number;
     }>;
   }
   ```

3. **시각화 차트**
   - 월별 평균 점수 그래프
   - 시간대별 길흉 히트맵
   - 방위별 선호도 레이더 차트
   - 목적별 성공률 바 차트

#### 파일 수정/생성
- `packages/web/src/components/qimen/StatsDashboard.tsx` (신규)
- `packages/web/src/utils/qimenPatternAI.ts` (신규)
- `packages/web/src/hooks/useQimenStats.ts` (신규)
- `packages/backend/services/qimen-analytics/` (신규 마이크로서비스)

#### 검증 기준
- [ ] 통계 데이터 정확성 99% 이상
- [ ] 패턴 인식 30일 이상 데이터 필요
- [ ] 예측 정확도 70% 이상
- [ ] 로딩 시간 2초 이내

---

### 🟡 Priority 5: 모바일 UX 최적화 (User Experience)

#### 작업 ID: QIMEN-005
**제목**: 모바일 최적화 및 제스처 지원
**예상 시간**: 8-12시간
**난이도**: ⭐⭐⭐

#### 목표
모바일 환경에서 더 직관적이고 쾌적한 사용자 경험을 제공합니다.

#### 구현 사항
1. **제스처 지원**
   - 스와이프로 시간 변경 (← → )
   - 핀치로 확대/축소
   - 길게 누르기로 즐겨찾기 추가
   - 더블 탭으로 궁 상세 보기

2. **반응형 레이아웃 개선**
   - 구궁 차트 자동 크기 조정
   - 세로/가로 모드 최적화
   - 아이패드 등 태블릿 전용 레이아웃

3. **성능 최적화**
   ```typescript
   // React.memo, useMemo, useCallback 적극 활용
   // 이미지 lazy loading
   // 코드 스플리팅
   ```

4. **오프라인 지원**
   - Service Worker로 오프라인 캐시
   - 최근 조회 차트 로컬 저장
   - 오프라인 시 알림 표시

#### 파일 수정/생성
- `packages/web/src/hooks/useGestures.ts` (신규)
- `packages/web/src/utils/mobileOptimization.ts` (신규)
- `packages/web/public/service-worker.js` (신규)
- 모든 qimen 컴포넌트 성능 최적화

#### 검증 기준
- [ ] 제스처 인식률 95% 이상
- [ ] 모바일 로딩 시간 1초 이내
- [ ] Lighthouse 모바일 점수 90점 이상
- [ ] 오프라인 모드 정상 작동

---

### 🟢 Priority 6: 교육 콘텐츠 확대 (Education)

#### 작업 ID: QIMEN-006
**제목**: 귀문둔갑 학습 시스템 구축
**예상 시간**: 16-20시간
**난이도**: ⭐⭐⭐⭐⭐

#### 목표
사용자가 귀문둔갑을 체계적으로 학습할 수 있는 교육 콘텐츠를 제공합니다.

#### 구현 사항
1. **단계별 학습 코스**
   ```typescript
   // packages/web/src/data/qimenCourses.ts
   const courses = [
     {
       level: 1,
       title: "귀문둔갑 입문",
       lessons: [
         { id: "L1-1", title: "귀문둔갑이란?", duration: "5분" },
         { id: "L1-2", title: "구궁의 의미", duration: "10분" },
         { id: "L1-3", title: "팔문 이해하기", duration: "15분" },
         // ...
       ]
     },
     // 중급, 고급 코스...
   ];
   ```

2. **인터랙티브 퀴즈**
   - 각 레슨 후 이해도 테스트
   - 실전 문제 (예: "사업 계약하기 좋은 시간은?")
   - 레벨 시스템 (초보자 → 고수)

3. **실습 모드**
   - 과거 유명 사건의 귀문둔갑 분석
   - 사용자가 직접 차트 해석 연습
   - AI가 피드백 제공

4. **용어 사전**
   - 팔문, 구성, 팔신 상세 설명
   - 검색 기능
   - 즐겨찾기

#### 파일 수정/생성
- `packages/web/src/pages/QimenLearningPage.tsx` (신규)
- `packages/web/src/components/qimen/LessonViewer.tsx` (신규)
- `packages/web/src/components/qimen/Quiz.tsx` (신규)
- `packages/web/src/data/qimenCourses.ts` (신규)
- `packages/web/src/data/qimenGlossary.ts` (신규)

#### 검증 기준
- [ ] 20개 이상 레슨 콘텐츠
- [ ] 퀴즈 정답률 추적
- [ ] 학습 진행률 표시
- [ ] 수료증 발급 기능

---

### 🟢 Priority 7: 3D 시각화 (Innovation)

#### 작업 ID: QIMEN-007
**제목**: 3D 구궁팔괘도 시각화
**예상 시간**: 20-30시간
**난이도**: ⭐⭐⭐⭐⭐

#### 목표
2D 평면 차트를 넘어 3D 입체 구궁도로 차별화된 경험을 제공합니다.

#### 구현 사항
1. **Three.js 기반 3D 렌더링**
   ```typescript
   // packages/web/src/components/qimen/Qimen3DView.tsx
   import * as THREE from 'three';
   import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

   // 9개 궁을 3D 공간에 배치
   // 각 궁의 높이로 길흉 표현
   // 빛 효과로 강조
   ```

2. **인터랙션**
   - 마우스 드래그로 회전
   - 줌 인/아웃
   - 궁 클릭으로 상세 정보

3. **애니메이션**
   - 시간 경과에 따른 변화 애니메이션
   - 팔문/구성/팔신 이동 시각화
   - 입자 효과

#### 파일 수정/생성
- `packages/web/src/components/qimen/Qimen3DView.tsx` (신규)
- `packages/web/src/utils/qimen3DRenderer.ts` (신규)
- Three.js 라이브러리 추가

#### 검증 기준
- [ ] 60 FPS 유지
- [ ] 모바일에서도 정상 작동
- [ ] WebGL 미지원 브라우저 대응
- [ ] 3D/2D 모드 전환 가능

---

## 🛠️ 기술 스택

### 추가 필요 라이브러리
```json
{
  "dependencies": {
    "three": "^0.160.0",                    // 3D 시각화
    "@react-three/fiber": "^8.15.0",        // React + Three.js
    "@react-three/drei": "^9.92.0",          // Three.js 헬퍼
    "html2canvas": "^1.4.1",                 // 이미 있음 (이미지 캡처)
    "chart.js": "^4.5.0",                    // 이미 있음 (통계 차트)
    "workbox-webpack-plugin": "^7.0.0"       // Service Worker
  }
}
```

---

## 📊 성공 지표 (KPI)

### 사용자 참여도
- **MAU (Monthly Active Users)**: 귀문둔갑 페이지 방문자 20% 증가
- **세션 시간**: 평균 5분 → 8분
- **재방문율**: 주 2회 → 주 4회

### 기능 사용률
- **캘린더 통합**: 일정 생성 시 귀문둔갑 정보 확인 60% 이상
- **알림 설정**: 활성 사용자의 40% 이상 알림 설정
- **공유 기능**: 월 1,000회 이상 공유

### 비즈니스 임팩트
- **프리미엄 전환율**: 귀문둔갑 사용자의 15% → 20%
- **바이럴 계수**: 공유 1회당 0.3명 신규 유입
- **NPS (Net Promoter Score)**: 70점 이상

---

## ⚠️ 리스크 및 대응 방안

### 기술적 리스크
| 리스크 | 확률 | 영향도 | 대응 방안 |
|--------|------|--------|-----------|
| 3D 렌더링 성능 저하 | 중간 | 높음 | WebGL 미지원 시 2D 모드로 자동 전환 |
| 알림 권한 거부율 높음 | 높음 | 중간 | 권한 요청 전 명확한 가치 제안 |
| 공유 기능 서버 부하 | 낮음 | 중간 | CDN + 캐싱으로 부하 분산 |

### 일정 리스크
| 마일스톤 | 예상 | 버퍼 | 총 |
|----------|------|------|-----|
| Priority 1-3 | 4주 | 1주 | 5주 |
| Priority 4-5 | 3주 | 1주 | 4주 |
| Priority 6-7 | 5주 | 2주 | 7주 |
| **총** | **12주** | **4주** | **16주** |

---

## 📅 단계별 실행 계획

### Phase 1: 기초 강화 (Week 1-5)
```
Week 1-2: QIMEN-001 캘린더 통합
Week 3: QIMEN-002 알림 시스템
Week 4-5: QIMEN-003 저장/공유 기능
```

### Phase 2: 전문성 강화 (Week 6-9)
```
Week 6-7: QIMEN-004 통계/트렌드 분석
Week 8-9: QIMEN-005 모바일 UX 최적화
```

### Phase 3: 차별화 (Week 10-16)
```
Week 10-13: QIMEN-006 교육 콘텐츠
Week 14-16: QIMEN-007 3D 시각화 (선택)
```

---

## 🔍 검증 및 테스트 전략

### 단위 테스트
- 각 유틸리티 함수 Jest 테스트
- 커버리지 80% 이상 유지

### 통합 테스트
- E2E 테스트 (Playwright)
- 주요 사용자 플로우 시나리오

### 사용자 테스트
- 베타 테스터 20명 모집
- A/B 테스트 (기존 vs 신규 기능)
- 피드백 수집 및 개선

---

## 💰 비용 추정

### 개발 비용
- **인력**: 2명 × 16주 = 32인주
- **시급 환산**: 5만원 × 40시간 × 16주 = 3,200만원

### 인프라 비용
- **CDN**: 월 10만원 (이미지 공유)
- **AI API**: 월 20만원 (통계 분석)
- **서버 증설**: 월 30만원 (마이크로서비스 추가)
- **총**: 월 60만원

### ROI 예측
- **추가 수익**: 프리미엄 전환율 5% 증가 → 월 5,000만원
- **투자 회수**: 1개월 이내

---

## 📝 다음 단계 (Action Items)

### 즉시 시작 (Day 1)
1. ✅ 작업지시서 검토 및 승인
2. 개발 환경 설정 (Three.js 등 라이브러리 설치)
3. Git 브랜치 생성 (`feature/qimen-calendar-integration`)
4. QIMEN-001 작업 착수

### Week 1 종료 시
- [ ] QIMEN-001 50% 진행
- [ ] 중간 데모 준비
- [ ] 피드백 수집

### Phase 1 종료 시 (Week 5)
- [ ] Priority 1-3 기능 모두 완료
- [ ] E2E 테스트 100% 통과
- [ ] 베타 출시 및 사용자 피드백

---

## 🎯 최종 목표

**"운명나침반의 귀문둔갑 기능을 세계 최고 수준으로 만들기"**

- ✅ 정확한 계산 (이미 달성)
- ✅ 아름다운 시각화 (이미 달성)
- 🔥 실생활 통합 (캘린더, 알림)
- 🔥 바이럴 효과 (공유, SNS)
- 🔥 교육 가치 (학습 콘텐츠)
- 🔥 차별화 (3D, 통계)

---

**작성자**: Claude (Swarm PM)
**검토자**: (대기 중)
**승인자**: (대기 중)
**다음 업데이트**: Phase 1 완료 후

---

## 📚 참고 자료

### 내부 문서
- `E:\projects\sajuapp\prd.md` - 제품 요구사항 문서
- `E:\projects\sajuapp\CLAUDE.md` - 개발 가이드라인
- `E:\projects\sajuapp\E2E-TEST-REPORT.md` - 테스트 보고서
- `E:\projects\sajuapp\NEXT-SESSION-GUIDE.md` - 다음 세션 가이드

### 기술 문서
- Three.js 공식 문서: https://threejs.org/docs/
- Web Notification API: https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API
- Service Worker: https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API

---

**✨ 이 작업지시서는 살아있는 문서입니다. 진행 상황에 따라 지속적으로 업데이트됩니다.**
