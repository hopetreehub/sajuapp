# 타로 질문 예시 개선 작업지시서

## 📋 프로젝트 개요
**작업명**: 타로 질문 예시 카테고리화 및 UX 개선
**작성일**: 2025-10-23
**우선순위**: Medium
**예상 소요시간**: 2-3시간

---

## 🎯 작업 목표

### 현재 문제점
1. ❌ 질문 예시가 단순 배열로 나열되어 사용자가 원하는 질문을 찾기 어려움
2. ❌ 카테고리 구분 없이 모든 질문이 한꺼번에 표시됨
3. ❌ 스프레드별로 질문이 달라도 분류 체계가 없어 혼란스러움
4. ❌ 사용자가 자신의 관심 분야(건강, 재물, 연애 등)에 맞는 질문을 빠르게 선택할 수 없음

### 개선 목표
1. ✅ 질문을 **주제별 카테고리**로 분류하여 직관적인 선택 가능
2. ✅ **탭 또는 버튼 형태**의 카테고리 선택 UI 제공
3. ✅ 선택한 카테고리에 맞는 질문만 필터링하여 표시
4. ✅ 모바일 및 데스크톱에서 모두 사용하기 편리한 UX 구현

---

## 📊 카테고리 분류 체계 (PM 최종 승인 필요)

### 제안 1: 7대 주제 분류
```
🏥 건강      - 건강, 질병, 치료, 웰빙 관련
💰 재물      - 금전, 투자, 재산, 수입 관련
❤️  사랑/연애  - 연애, 결혼, 이별, 만남 관련
👥 인간관계   - 친구, 가족, 직장 동료 관계
💼 사업/커리어 - 직장, 사업, 승진, 이직 관련
📚 학업/성장  - 공부, 시험, 자기계발 관련
🌟 일반/운세  - 오늘의 운세, 전반적 조언
```

### 제안 2: 5대 주제 분류 (단순화 버전)
```
❤️  사랑/관계  - 연애, 결혼, 인간관계 통합
💼 일/사업    - 직장, 사업, 커리어, 학업 통합
💰 재물/건강  - 금전, 건강, 재산 통합
🔮 운세/조언  - 오늘의 운세, 일반 조언
⚡ 결정/선택  - 중요한 결정, 선택의 기로
```

**👉 PM 선택**: ⬜ 제안 1 (7대 주제) / ⬜ 제안 2 (5대 주제) / ⬜ 기타 ___________

---

## 🎨 UI/UX 디자인 제안

### Option A: 탭 형태 (추천)
```
┌─────────────────────────────────────────────────┐
│ 💡 질문 카테고리를 선택하세요                      │
├─────────────────────────────────────────────────┤
│ [❤️ 사랑] [💼 사업] [💰 재물] [👥 관계] [🌟 운세] │ <- 탭
├─────────────────────────────────────────────────┤
│ [이 사람과 결혼해도 될까요?]                       │
│ [그 사람은 나를 좋아하나요?]                       │
│ [헤어진 연인과 재회할 수 있을까요?]                │
│ [새로운 만남이 있을까요?]                         │
└─────────────────────────────────────────────────┘
```

### Option B: 드롭다운 형태
```
┌─────────────────────────────────────────────────┐
│ 💡 질문 예시                                      │
│ ┌─────────────────────────────────────┐         │
│ │ 카테고리 선택: [❤️ 사랑/연애 ▼]       │         │
│ └─────────────────────────────────────┘         │
│                                                  │
│ [이 사람과 결혼해도 될까요?]                       │
│ [그 사람은 나를 좋아하나요?]                       │
└─────────────────────────────────────────────────┘
```

### Option C: 아코디언 형태
```
┌─────────────────────────────────────────────────┐
│ 💡 질문 예시 (카테고리를 펼쳐보세요)               │
│                                                  │
│ ▶ ❤️ 사랑/연애                                   │
│ ▼ 💼 사업/커리어                                 │
│   [승진할 수 있을까요?]                           │
│   [이직해도 괜찮을까요?]                          │
│   [사업이 성공할까요?]                            │
│ ▶ 💰 재물/건강                                   │
│ ▶ 🌟 운세/조언                                   │
└─────────────────────────────────────────────────┘
```

**👉 PM 선택**: ⬜ Option A (탭) / ⬜ Option B (드롭다운) / ⬜ Option C (아코디언)

---

## 📝 카테고리별 질문 예시 (초안)

### 1장 스프레드 (원 카드)

#### ❤️ 사랑/연애
- 오늘 나의 연애운은 어떤가요?
- 그 사람은 나를 좋아하나요?
- 새로운 인연이 다가올까요?
- 지금 고백해도 괜찮을까요?
- 이 사람이 내 운명인가요?

#### 💼 사업/커리어
- 오늘 업무 운은 어떤가요?
- 이 프로젝트는 성공할까요?
- 승진 가능성이 있나요?
- 이직을 고려해야 할까요?
- 사업을 시작해도 괜찮을까요?

#### 💰 재물/금전
- 오늘 금전운은 어떤가요?
- 이 투자는 성공할까요?
- 돈이 들어올 조짐이 있나요?
- 재정 상태가 나아질까요?
- 이 거래를 진행해도 괜찮을까요?

#### 👥 인간관계
- 오늘 대인관계 운은 어떤가요?
- 이 사람과의 관계는 어떻게 될까요?
- 친구와의 갈등이 해결될까요?
- 가족 문제가 풀릴까요?
- 이 사람을 믿어도 괜찮을까요?

#### 🏥 건강/웰빙
- 오늘 건강운은 어떤가요?
- 건강이 나아질까요?
- 지금 시작하는 건강 관리가 효과적일까요?
- 스트레스를 해소할 방법은?
- 병원에 가봐야 할까요?

#### 📚 학업/성장
- 오늘 공부운은 어떤가요?
- 시험에 합격할 수 있을까요?
- 이 공부 방법이 맞나요?
- 자격증 취득이 가능할까요?
- 새로운 기술을 배워도 괜찮을까요?

#### 🌟 일반/운세
- 오늘 나에게 필요한 메시지는?
- 오늘의 전반적인 운세는?
- 지금 내가 집중해야 할 것은?
- 이번 주 가장 중요한 것은?
- 오늘 조심해야 할 일은?

### 3장 스프레드 (과거-현재-미래)

#### ❤️ 사랑/연애
- 이 관계는 어떻게 발전할까요?
- 내 사랑은 어떻게 흘러갈까요?
- 헤어진 연인과 재회할 수 있을까요?
- 결혼까지 갈 수 있을까요?
- 이 짝사랑은 언제 끝날까요?

#### 💼 사업/커리어
- 내 커리어는 앞으로 어떻게 될까요?
- 이 프로젝트의 결과는?
- 회사 생활이 나아질까요?
- 창업 계획은 어떻게 진행될까요?
- 직장에서의 입지는 어떻게 변할까요?

#### 💰 재물/금전
- 내 금전운은 앞으로 어떻게 될까요?
- 재정 상태는 언제 나아질까요?
- 이 투자의 결과는?
- 빚은 언제 갚을 수 있을까요?
- 부동산 매매 시기는 적절한가요?

#### 👥 인간관계
- 이 사람과의 관계는 어떻게 변할까요?
- 친구와의 갈등은 언제 해결될까요?
- 가족 문제는 어떻게 풀릴까요?
- 직장 동료와의 관계는?
- 새로운 인맥은 언제 생길까요?

#### 🏥 건강/웰빙
- 건강 상태는 앞으로 어떻게 변할까요?
- 병은 언제 나을까요?
- 다이어트는 성공할까요?
- 정신 건강은 회복될까요?
- 수술을 받아도 괜찮을까요?

#### 📚 학업/성장
- 학업 성취는 어떻게 될까요?
- 유학 계획은 성공할까요?
- 취업 준비는 언제 끝날까요?
- 자격증 공부는 효과가 있을까요?
- 커리어 전환은 성공할까요?

#### 🌟 일반/운세
- 이 상황은 앞으로 어떻게 변할까요?
- 내 인생의 다음 단계는?
- 이 문제는 언제 해결될까요?
- 내가 원하는 것을 이룰 수 있을까요?
- 앞으로 3개월간 운세는?

### 5장 스프레드 (십자 배치)

#### ❤️ 사랑/연애 - 심층 분석
- 이 관계의 전체적인 흐름은?
- 우리 관계의 장애물은 무엇인가요?
- 이 사랑을 지속하려면?
- 상대방의 진심은 무엇인가요?
- 이별 후 나는 어떻게 해야 하나요?

#### 💼 사업/커리어 - 심층 분석
- 이 사업의 성공 가능성은?
- 승진을 위해 필요한 것은?
- 직장을 옮겨야 할까요?
- 창업 시기와 방향은?
- 경력 개발 전략은?

#### 💰 재물/금전 - 심층 분석
- 재정 문제 해결 방법은?
- 큰 투자를 해도 괜찮을까요?
- 돈을 벌 수 있는 방법은?
- 재산 증식 전략은?
- 금전적 위기를 어떻게 극복할까요?

#### 👥 인간관계 - 심층 분석
- 이 사람과의 갈등 해결 방법은?
- 신뢰할 수 있는 사람인가요?
- 관계 회복이 가능할까요?
- 새로운 인맥 형성 전략은?
- 독립해도 괜찮을까요?

#### 🏥 건강/웰빙 - 심층 분석
- 건강 문제의 원인과 해결책은?
- 치료 방향이 맞나요?
- 생활 습관을 어떻게 바꿔야 하나요?
- 정신 건강 회복 방법은?
- 건강 검진을 받아야 할까요?

#### 🌟 일반/결정 - 심층 분석
- 이 중요한 결정을 내려도 괜찮을까요?
- 인생의 전환점에서 어떻게 해야 하나요?
- 큰 변화를 시도해도 괜찮을까요?
- 이 선택의 장단점은?
- 미래를 위한 최선의 방향은?

---

## 🛠️ 기술 구현 계획

### Phase 1: 데이터 구조 설계

#### 1.1 타입 정의 추가 (`tarotSpread.ts`)
```typescript
// 질문 카테고리 타입 정의
export type QuestionCategory =
  | 'love'        // ❤️ 사랑/연애
  | 'career'      // 💼 사업/커리어
  | 'wealth'      // 💰 재물/금전
  | 'relationship'// 👥 인간관계
  | 'health'      // 🏥 건강/웰빙
  | 'study'       // 📚 학업/성장
  | 'general';    // 🌟 일반/운세

// 카테고리 정보 인터페이스
export interface QuestionCategoryInfo {
  id: QuestionCategory;
  name: string;
  emoji: string;
  color: string; // Tailwind color class
}

// 카테고리별 질문 구조
export interface CategorizedQuestion {
  category: QuestionCategory;
  question: string;
}

// TarotSpread 인터페이스 수정
export interface TarotSpread {
  id: string;
  name: string;
  nameKo: string;
  description: string;
  cardCount: number;
  exampleQuestions?: string[]; // @deprecated - 호환성 유지
  categorizedQuestions?: CategorizedQuestion[]; // 새로운 구조
  positions: Array<{
    position: number;
    name: string;
    meaning: string;
  }>;
}
```

#### 1.2 카테고리 메타데이터 정의
```typescript
export const QUESTION_CATEGORIES: QuestionCategoryInfo[] = [
  {
    id: 'love',
    name: '사랑/연애',
    emoji: '❤️',
    color: 'pink',
  },
  {
    id: 'career',
    name: '사업/커리어',
    emoji: '💼',
    color: 'blue',
  },
  {
    id: 'wealth',
    name: '재물/금전',
    emoji: '💰',
    color: 'yellow',
  },
  {
    id: 'relationship',
    name: '인간관계',
    emoji: '👥',
    color: 'green',
  },
  {
    id: 'health',
    name: '건강/웰빙',
    emoji: '🏥',
    color: 'red',
  },
  {
    id: 'study',
    name: '학업/성장',
    emoji: '📚',
    color: 'indigo',
  },
  {
    id: 'general',
    name: '일반/운세',
    emoji: '🌟',
    color: 'purple',
  },
];
```

### Phase 2: UI 컴포넌트 구현

#### 2.1 새로운 컴포넌트 생성
파일: `packages/web/src/components/tarot/QuestionSelector.tsx`

```typescript
import React, { useState } from 'react';
import type { QuestionCategory, CategorizedQuestion } from '@/utils/tarotSpread';
import { QUESTION_CATEGORIES } from '@/utils/tarotSpread';

interface QuestionSelectorProps {
  questions: CategorizedQuestion[];
  onSelectQuestion: (question: string) => void;
}

export default function QuestionSelector({ questions, onSelectQuestion }: QuestionSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<QuestionCategory>('love');

  // 선택된 카테고리의 질문만 필터링
  const filteredQuestions = questions.filter(q => q.category === selectedCategory);

  return (
    <div className="mt-4">
      {/* 카테고리 탭 */}
      <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
        💡 질문 카테고리를 선택하세요
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {QUESTION_CATEGORIES.map((category) => {
          const isActive = selectedCategory === category.id;
          const count = questions.filter(q => q.category === category.id).length;

          if (count === 0) return null; // 질문이 없는 카테고리는 숨김

          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${isActive
                  ? `bg-${category.color}-500 text-white shadow-md`
                  : `bg-${category.color}-100 dark:bg-${category.color}-900/30 text-${category.color}-700 dark:text-${category.color}-300 hover:bg-${category.color}-200 dark:hover:bg-${category.color}-900/50`
                }
              `}
            >
              {category.emoji} {category.name} ({count})
            </button>
          );
        })}
      </div>

      {/* 질문 리스트 */}
      <div className="flex flex-wrap gap-2">
        {filteredQuestions.length > 0 ? (
          filteredQuestions.map((item, index) => (
            <button
              key={index}
              onClick={() => onSelectQuestion(item.question)}
              className="px-3 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg text-sm hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
            >
              {item.question}
            </button>
          ))
        ) : (
          <div className="text-gray-500 dark:text-gray-400 text-sm">
            이 카테고리에는 아직 질문이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
```

#### 2.2 TarotPage.tsx 수정
```typescript
// 기존 코드:
{selectedSpread.exampleQuestions && selectedSpread.exampleQuestions.length > 0 && (
  <div className="mt-4">
    <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
      💡 질문 예시 (클릭하면 자동 입력됩니다)
    </div>
    <div className="flex flex-wrap gap-2">
      {selectedSpread.exampleQuestions.map((question, index) => (
        <button
          key={index}
          onClick={() => setUserQuestion(question)}
          className="..."
        >
          {question}
        </button>
      ))}
    </div>
  </div>
)}

// 새로운 코드:
{selectedSpread.categorizedQuestions && selectedSpread.categorizedQuestions.length > 0 && (
  <QuestionSelector
    questions={selectedSpread.categorizedQuestions}
    onSelectQuestion={(question) => setUserQuestion(question)}
  />
)}

{/* 호환성: 기존 exampleQuestions도 표시 */}
{!selectedSpread.categorizedQuestions && selectedSpread.exampleQuestions && selectedSpread.exampleQuestions.length > 0 && (
  <div className="mt-4">
    {/* 기존 UI 유지 */}
  </div>
)}
```

### Phase 3: 데이터 마이그레이션

#### 3.1 TAROT_SPREADS 업데이트
```typescript
export const TAROT_SPREADS: TarotSpread[] = [
  {
    id: 'one-card',
    name: 'One Card',
    nameKo: '원 카드',
    description: '오늘의 운세, 간단한 질문에 대한 답변',
    cardCount: 1,
    categorizedQuestions: [
      // ❤️ 사랑/연애
      { category: 'love', question: '오늘 나의 연애운은 어떤가요?' },
      { category: 'love', question: '그 사람은 나를 좋아하나요?' },
      { category: 'love', question: '새로운 인연이 다가올까요?' },

      // 💼 사업/커리어
      { category: 'career', question: '오늘 업무 운은 어떤가요?' },
      { category: 'career', question: '이 프로젝트는 성공할까요?' },

      // 💰 재물/금전
      { category: 'wealth', question: '오늘 금전운은 어떤가요?' },
      { category: 'wealth', question: '이 투자는 성공할까요?' },

      // ... 나머지 카테고리
    ],
    positions: [
      {
        position: 1,
        name: '답변',
        meaning: '질문에 대한 직접적인 답변과 조언',
      },
    ],
  },
  // ... 나머지 스프레드
];
```

---

## ✅ 작업 체크리스트

### 준비 단계
- [ ] PM에게 카테고리 분류 체계 승인 받기 (제안 1 vs 제안 2)
- [ ] PM에게 UI 옵션 승인 받기 (Option A vs B vs C)
- [ ] 각 카테고리별 질문 예시 최종 검토 및 승인
- [ ] Tailwind color 클래스 동적 적용 가능 여부 확인

### 개발 단계
- [ ] **Phase 1**: 타입 정의 및 데이터 구조 설계
  - [ ] `tarotSpread.ts`에 새로운 타입 추가
  - [ ] 카테고리 메타데이터 정의
  - [ ] 기존 코드 호환성 유지 확인

- [ ] **Phase 2**: UI 컴포넌트 구현
  - [ ] `QuestionSelector.tsx` 컴포넌트 생성
  - [ ] 카테고리 탭 UI 구현
  - [ ] 질문 필터링 로직 구현
  - [ ] 반응형 디자인 적용 (모바일/데스크톱)
  - [ ] 다크모드 지원 확인

- [ ] **Phase 3**: 데이터 마이그레이션
  - [ ] 모든 스프레드의 질문을 카테고리별로 재분류
  - [ ] 1장 스프레드 질문 업데이트
  - [ ] 3장 스프레드 질문 업데이트
  - [ ] 5장 스프레드 질문 업데이트
  - [ ] 7장, 10장 스프레드 질문 업데이트

- [ ] **Phase 4**: 통합 및 테스트
  - [ ] `TarotPage.tsx`에 새 컴포넌트 통합
  - [ ] 기존 `exampleQuestions` 호환성 확인
  - [ ] 카테고리 전환 동작 테스트
  - [ ] 질문 선택 기능 테스트
  - [ ] 브라우저 호환성 테스트
  - [ ] 모바일 반응형 테스트

### QA 단계
- [ ] 모든 카테고리에 적절한 질문이 있는지 확인
- [ ] 빈 카테고리는 자동으로 숨겨지는지 확인
- [ ] 카테고리 전환 시 애니메이션 부드러운지 확인
- [ ] 다크모드에서 색상 가독성 확인
- [ ] 접근성(Accessibility) 검토
  - [ ] 키보드 네비게이션 가능
  - [ ] 스크린 리더 호환
  - [ ] 색상 대비 적절

### 문서화
- [ ] 코드 주석 작성
- [ ] JSDoc 문서 작성
- [ ] README 업데이트 (새로운 질문 추가 방법)
- [ ] 변경사항 CHANGELOG에 기록

---

## 📐 기술 제약사항

### Tailwind CSS 동적 클래스 이슈
⚠️ **중요**: Tailwind CSS는 동적 클래스 생성을 지원하지 않습니다.

**문제가 되는 코드**:
```typescript
// ❌ 작동하지 않음 - Tailwind가 클래스를 감지하지 못함
className={`bg-${category.color}-500`}
```

**해결 방법 1**: 전체 클래스명 사용
```typescript
// ✅ 작동함
const colorClasses = {
  pink: 'bg-pink-500 hover:bg-pink-600',
  blue: 'bg-blue-500 hover:bg-blue-600',
  yellow: 'bg-yellow-500 hover:bg-yellow-600',
  // ...
};

className={colorClasses[category.color]}
```

**해결 방법 2**: Safelist 사용 (`tailwind.config.js`)
```javascript
module.exports = {
  safelist: [
    'bg-pink-500', 'bg-pink-100', 'text-pink-700',
    'bg-blue-500', 'bg-blue-100', 'text-blue-700',
    'bg-yellow-500', 'bg-yellow-100', 'text-yellow-700',
    // ... 모든 카테고리 색상
  ],
  // ...
}
```

**👉 권장**: 해결 방법 1 (명시적 매핑)

---

## 🎯 성공 지표

### 정량적 지표
- [ ] 카테고리당 최소 5개 이상의 질문 제공
- [ ] 모든 스프레드(1장, 3장, 5장, 7장, 10장)에 카테고리 적용
- [ ] 페이지 로드 시간 500ms 이내 유지
- [ ] 모바일/데스크톱 반응 속도 동일

### 정성적 지표
- [ ] 사용자가 원하는 질문을 3클릭 이내에 찾을 수 있음
- [ ] 카테고리 아이콘과 색상이 직관적으로 이해됨
- [ ] 질문 선택 후 자동 입력이 즉각적으로 반영됨
- [ ] 전체적인 UI가 기존 디자인과 조화로움

---

## 🚀 배포 계획

### 단계별 배포 (권장)
1. **Alpha**: 내부 테스트 (PM, 개발팀)
2. **Beta**: 일부 사용자 대상 A/B 테스트
3. **Production**: 전체 사용자 배포

### 롤백 계획
- 기존 `exampleQuestions` 필드 유지로 호환성 보장
- Feature Flag로 새 UI/구 UI 전환 가능하게 구현

---

## 📞 문의 및 승인

### PM 승인 필요 사항
1. ✅ 카테고리 분류 체계 최종 확정
2. ✅ UI 디자인 옵션 선택
3. ✅ 각 카테고리별 질문 예시 검토 및 추가/수정
4. ✅ 색상 팔레트 최종 확정

### 다음 단계
PM 승인 후 즉시 개발 착수 가능합니다.

---

**작성자**: Claude Code AI
**검토자**: [PM 이름]
**최종 승인**: [ ] 승인 / [ ] 수정 필요 / [ ] 보류
