# 🔮 주능(主能) · 주흉(主凶) 차트 표시 복원 작업지시서

## 📌 현재 문제
**"이전에 보였던 주능과 주흉 차트가 수정 과정에서 사라짐"** - 기존 구현되었던 길흉 판단 시각화가 최근 수정으로 인해 표시되지 않음

## ✅ 사용자 확인 사항
- 주능/주흉은 **이미 구현되어 있었음**
- 차트가 보이다가 수정하면서 **차트만 안 보이게 됨**
- 백엔드에서는 **아마 계산되고 있을 것**으로 추정
- UI에 주능/주흉 버튼은 존재함 (카테고리 네비게이션에서 확인)

## 🔍 문제 심층 분석

### 1️⃣ 주능(主能) · 주흉(主凶) 개념 정리

#### 사주학적 정의
- **주능(主能)**: 해당 시기의 주요 능력/강점이 되는 기운
  - 용신운: 필요한 오행이 오는 시기
  - 희신운: 도움이 되는 오행이 오는 시기
  - 합화운: 조화로운 관계가 형성되는 시기

- **주흉(主凶)**: 해당 시기의 주요 약점/위험이 되는 기운
  - 기신운: 해로운 오행이 오는 시기
  - 충극운: 충돌과 갈등이 발생하는 시기
  - 파해운: 파괴와 해체의 기운이 오는 시기

### 2️⃣ 현재 시스템 분석

#### A. 실제 구현 상태 확인
```typescript
// sajuRadarData.ts 분석
- 주능 카테고리: ✅ 존재함 (id: 'juneung')
- 주흉 카테고리: ✅ 존재함 (id: 'juhyung')
- 동적 로딩: ✅ 백엔드에서 데이터 로드하는 로직 구현됨
- UI 버튼: ✅ 카테고리 네비게이션에 표시됨
```

#### B. 차트 표시 상태 확인
```typescript
// HundredYearChart.tsx 분석
- 100년 차트: ✅ 정상 작동
- 4가지 기운 선: ✅ 표시됨 (행운, 의지, 환경, 변화)
- 주능/주흉 오버레이: ❌ 없음!
- 색상 구분: ⚠️ 점수 기반 색상만 있고 주능/주흉 구분 없음
```

#### C. 데이터 구조 확인
```typescript
// lifetimeFortuneApi.ts
interface YearlyFortune {
  totalScore: number     // 총점
  fortune: number        // 행운
  willpower: number      // 의지
  environment: number    // 환경
  change: number         // 변화
  // ❌ 주능/주흉 필드 없음!
}
```

### 3️⃣ 근본 원인

1. **데이터 필드 누락**: YearlyFortune에 주능/주흉 타입 필드가 없음
2. **차트 오버레이 제거됨**: HundredYearChart에서 주능/주흉 시각화 코드가 사라짐
3. **계산은 되지만 표시 안됨**: 점수는 계산되지만 주능/주흉 구분 표시가 없음

## 🎯 해결 방안

### Phase 1: 데이터 구조 확장 (30분)

#### 1. YearlyFortune 인터페이스 확장
```typescript
export interface YearlyFortune {
  // 기존 필드들...

  // 🆕 주능/주흉 필드 추가
  주능주흉: {
    type: '대길' | '길' | '평' | '흉' | '대흉';
    label: string;           // "용신운", "기신운" 등
    description: string;     // 상세 설명
    color: string;          // 시각화 색상
    strength: number;       // 강도 (0-100)
  };

  // 🆕 세부 길흉 요소
  길흉요소: {
    용신효과: boolean;      // 용신운 여부
    기신영향: boolean;      // 기신운 여부
    충극여부: boolean;      // 충/극 발생 여부
    합화여부: boolean;      // 합/화 발생 여부
    특수격국: string | null; // 특수한 운세 패턴
  };
}
```

#### 2. AuthenticSajuCalculator 주능/주흉 판단 로직
```typescript
private static calculate주능주흉(
  연도데이터: any,
  용신: YongSinAnalysis,
  격국: GyeokGukAnalysis
): YearlyFortune['주능주흉'] {

  // 점수 기반 기본 판단
  const 총점 = 연도데이터.총점;
  const 용신효과 = 연도데이터.용신효과;

  // 주능/주흉 분류
  if (총점 >= 80 && 용신효과 > 20) {
    return {
      type: '대길',
      label: '주능 - 대운',
      description: '용신이 강하게 작용하는 최상의 시기',
      color: '#FFD700', // 금색
      strength: 95
    };
  } else if (총점 >= 65 && 용신효과 > 10) {
    return {
      type: '길',
      label: '주능 - 길운',
      description: '전반적으로 좋은 기운이 작용하는 시기',
      color: '#32CD32', // 연두색
      strength: 75
    };
  } else if (총점 >= 45 && 총점 <= 55) {
    return {
      type: '평',
      label: '평운',
      description: '특별한 길흉이 없는 평온한 시기',
      color: '#808080', // 회색
      strength: 50
    };
  } else if (총점 < 35 && 용신효과 < -10) {
    return {
      type: '대흉',
      label: '주흉 - 대흉',
      description: '기신이 강하게 작용하는 주의 시기',
      color: '#8B0000', // 진한 빨강
      strength: 15
    };
  } else if (총점 < 45) {
    return {
      type: '흉',
      label: '주흉 - 흉운',
      description: '어려움이 예상되는 시기',
      color: '#FF6347', // 연한 빨강
      strength: 30
    };
  }

  return {
    type: '평',
    label: '평운',
    description: '보통 운세',
    color: '#808080',
    strength: 50
  };
}
```

### Phase 2: UI 컴포넌트 구현 (45분)

#### 1. 주능/주흉 표시 컴포넌트
```tsx
// components/saju/JuneungJuhungIndicator.tsx
interface Props {
  data: YearlyFortune[];
  currentAge: number;
}

export default function JuneungJuhungIndicator({ data, currentAge }: Props) {
  const current = data.find(d => d.age === currentAge);

  return (
    <div className="주능주흉-indicator">
      {/* 현재 운세 상태 */}
      <div className="current-status" style={{
        backgroundColor: current?.주능주흉.color,
        opacity: current?.주능주흉.strength / 100
      }}>
        <h3>{current?.주능주흉.label}</h3>
        <p>{current?.주능주흉.description}</p>
      </div>

      {/* 시간대별 주능/주흉 막대 그래프 */}
      <div className="timeline">
        {data.map(year => (
          <div
            key={year.age}
            className={`year-bar ${year.주능주흉.type}`}
            style={{
              height: `${year.주능주흉.strength}%`,
              backgroundColor: year.주능주흉.color
            }}
            title={`${year.age}세: ${year.주능주흉.label}`}
          />
        ))}
      </div>

      {/* 범례 */}
      <div className="legend">
        <span className="대길">⭐ 주능-대길</span>
        <span className="길">✨ 주능-길</span>
        <span className="평">➖ 평운</span>
        <span className="흉">⚠️ 주흉-흉</span>
        <span className="대흉">🚨 주흉-대흉</span>
      </div>
    </div>
  );
}
```

#### 2. 차트에 주능/주흉 오버레이
```tsx
// HundredYearChart 수정
function HundredYearChart({ data, currentAge, birthYear }) {
  return (
    <div className="chart-container">
      {/* 기존 차트 */}
      <LineChart data={data} />

      {/* 🆕 주능/주흉 오버레이 */}
      <div className="overlay-layer">
        {data.map(year => {
          if (year.주능주흉.type === '대길') {
            return (
              <div
                key={year.age}
                className="highlight-zone 대길"
                style={{
                  left: `${(year.age / 100) * 100}%`,
                  backgroundColor: 'rgba(255, 215, 0, 0.2)'
                }}
              >
                <span className="label">주능</span>
              </div>
            );
          }
          if (year.주능주흉.type === '대흉') {
            return (
              <div
                key={year.age}
                className="highlight-zone 대흉"
                style={{
                  left: `${(year.age / 100) * 100}%`,
                  backgroundColor: 'rgba(139, 0, 0, 0.2)'
                }}
              >
                <span className="label">주흉</span>
              </div>
            );
          }
        })}
      </div>
    </div>
  );
}
```

### Phase 3: 시각적 강화 (30분)

#### 1. 색상 코딩 시스템
```css
/* 주능/주흉 색상 체계 */
.주능-대길 {
  background: linear-gradient(135deg, #FFD700, #FFA500);
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
}

.주능-길 {
  background: linear-gradient(135deg, #32CD32, #90EE90);
}

.평운 {
  background: #E0E0E0;
}

.주흉-흉 {
  background: linear-gradient(135deg, #FF6347, #FFA07A);
}

.주흉-대흉 {
  background: linear-gradient(135deg, #8B0000, #DC143C);
  box-shadow: 0 0 20px rgba(139, 0, 0, 0.5);
}
```

#### 2. 애니메이션 효과
```css
/* 주능 시기 반짝임 효과 */
@keyframes 주능-glow {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 1; box-shadow: 0 0 30px gold; }
}

.주능-대길 {
  animation: 주능-glow 2s infinite;
}

/* 주흉 시기 경고 효과 */
@keyframes 주흉-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.주흉-대흉 {
  animation: 주흉-pulse 1.5s infinite;
}
```

## 🚀 단계별 실행 계획

### Step 1: 데이터 구조 수정 (20분)
1. ⬜ YearlyFortune 인터페이스에 주능주흉 필드 추가
2. ⬜ lifetimeFortuneApi.ts에서 주능주흉 계산 로직 추가
3. ⬜ 점수 기반으로 주능/주흉 타입 결정

### Step 2: 차트 오버레이 구현 (30분)
1. ⬜ HundredYearChart에 주능/주흉 하이라이트 영역 추가
2. ⬜ 주능 시기: 금색 배경 오버레이
3. ⬜ 주흉 시기: 빨간색 배경 오버레이

### Step 3: 시각적 표시 강화 (20분)
1. ⬜ 막대 차트 색상을 주능/주흉에 따라 변경
2. ⬜ 범례에 주능/주흉 추가
3. ⬜ 툴팁에 주능/주흉 정보 표시

### Step 4: 테스트 및 검증 (20분)
1. ⬜ 주능/주흉 표시 확인
2. ⬜ 색상과 오버레이 확인
3. ⬜ 사용자 피드백 반영

## 🎯 예상 결과

### Before (현재)
```
- 단순 점수 그래프만 표시
- 길흉 판단 불가
- 중요 시기 파악 어려움
```

### After (목표)
```
- 주능 시기: 🌟 금색 하이라이트 + "주능" 라벨
- 평운 시기: ➖ 회색 표시
- 주흉 시기: ⚠️ 빨간색 경고 + "주흉" 라벨
- 한눈에 길흉 파악 가능
```

## ⚠️ 핵심 요구사항

1. **명확한 시각화**: 주능은 밝고 긍정적인 색상, 주흉은 어둡고 경고적인 색상
2. **정확한 판단**: 사주학적 근거에 따른 정확한 길흉 판단
3. **직관적 UI**: 전문 지식 없이도 이해 가능한 표시
4. **성능 최적화**: 96년치 데이터 렌더링 최적화

## 📊 성공 기준

- [ ] 주능 시기가 명확히 표시됨 (금색/연두색)
- [ ] 주흉 시기가 명확히 표시됨 (빨간색/주황색)
- [ ] 현재 나이의 주능/주흉 상태 강조
- [ ] 전체 인생 주기의 길흉 패턴 한눈에 파악
- [ ] 박준수와 정비제의 주능/주흉 패턴이 다름

---
**작성일**: 2024-12-19
**수정일**: 2025-09-19
**작성자**: Claude Code Assistant
**상태**: 실행 대기 중
**우선순위**: 🔴 최고 (핵심 기능 복원)
**변경사항**: 사용자 피드백 반영 - 이전에 작동했던 기능 복원으로 방향 수정