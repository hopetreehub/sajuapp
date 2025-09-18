# 🎯 사주 기반 정확한 개인 차트 생성 작업지시서

## 📌 현재 상황
- ✅ **사주 불일치 감지 문제 해결 완료**: "❌ 사주 불일치 감지!" 메시지 제거됨
- ❌ **핵심 문제 지속**: 모든 사람이 동일한 차트 패턴을 보임
- 🎯 **궁극 목표**: 계산된 사주 팔자에 정확히 맞는 개인별 운세 차트 생성

## 🔍 근본 원인 심층 분석

### 1️⃣ 데이터 흐름 vs 차트 생성 분리 문제
```
[사주 데이터 해결] ✅ 완료    [개인별 차트 생성] ❌ 미해결
        ↓                           ↓
  resolveSajuData()              UniversalSajuEngine
  표준 형식 통일                    동일 패턴 생성
```

### 2️⃣ UniversalSajuEngine 분석 필요 영역

#### A. 5차원 데이터 생성 로직
```typescript
// UniversalSajuEngine.generateUniversalLifeChart()
const chartData = {
  geunbon: [], // 근본 차원
  woon: [],    // 운 차원
  haeng: [],   // 행 차원
  hyeong: [],  // 형 차원
  byeon: []    // 변 차원
};
```

**의혹**: 사주 데이터와 관계없이 고정 패턴 생성 가능성

#### B. calculateLifeChartScore 함수 검증
```typescript
// sajuScoreCalculator.ts
function calculateLifeChartScore(age: number, saju: SajuComponents): number {
  // 복잡한 계산이지만 실제 개인차 반영도는?
  const uniqueValue = calculateUniqueValue(saju);
  // uniqueValue가 차트에 충분한 영향을 미치는가?
}
```

### 3️⃣ 실제 문제점 가설

#### 가설 1: 사주 팔자별 운세 계산 로직 부재
- 현재 시스템이 사주 데이터를 받아도 실제 사주학 이론에 따른 계산을 하지 않음
- 년월일시 4개 기둥의 상호작용과 길흉 판단 로직 부재

#### 가설 2: 정통 사주학 이론 미구현
- **대운 시스템**: 10년 단위 인생 변화 주기 미반영
- **세운 시스템**: 년도별 운세 변화 미반영
- **60갑자 고유성**: 각 간지별 특성과 의미 무시
- **오행 상생상극**: 사주 내 오행 관계에 따른 길흉 판단 부재
- **십신론**: 일간을 기준으로 한 타 간지와의 관계 분석 누락

#### 가설 3: 사주 분석 알고리즘 자체 문제
- uniqueValue는 복잡하지만 실제 사주학과 무관한 임의 계산
- 사주 팔자의 강약, 용신, 희신 분석 없음
- 계절별 월령에 따른 오행 강약 판단 부재

## 🎯 해결 전략

### Phase 1: 현재 시스템 진단 (30분)

#### 1. UniversalSajuEngine 동작 검증
```typescript
// 테스트 코드 추가
function testUniversalSajuEngine() {
  // 박준수님 사주
  const parkSaju = { year: {gan: '신', ji: '해'}, ... };

  // 정비제님 사주
  const jungSaju = { year: {gan: '병', ji: '진'}, ... };

  // 동일한 개인정보로 차트 2개 생성
  const parkChart = UniversalSajuEngine.generateUniversalLifeChart(parkSaju, personalInfo);
  const jungChart = UniversalSajuEngine.generateUniversalLifeChart(jungSaju, personalInfo);

  // 차트 차이점 분석
  console.log('박준수 vs 정비제 차트 차이율:', calculateChartDifference(parkChart, jungChart));
}
```

#### 2. 차트 생성 포인트별 로그 추가
```typescript
// UniversalSajuEngine.ts 내부에 디버깅 로그 추가
console.log('🔍 사주 입력:', sajuData);
console.log('📊 5차원 점수 (나이 30):', {
  geunbon: geunbonScore,
  woon: woonScore,
  haeng: haengScore,
  hyeong: hyeongScore,
  byeon: byeonScore
});
console.log('🎯 개인 고유값:', uniqueValue);
console.log('📈 최종 차트 샘플 (30-40세):', lifetimeData.slice(30, 40));
```

### Phase 2: 근본적 개인화 시스템 구축 (90분)

#### 1. 정통 사주학 기반 운세 계산 시스템
```typescript
// 실제 사주학 이론에 따른 사주 분석
class AuthenticSajuAnalyzer {
  // 일간 강약 판단
  calculateDayMasterStrength(saju: SajuComponents): {
    strength: 'strong' | 'weak' | 'balanced';
    yongsin: string; // 용신 (도움이 되는 오행)
    gisin: string;   // 기신 (해로운 오행)
  }

  // 사주 내 십신 분석
  analyzeTenGods(saju: SajuComponents): {
    wealth: number;     // 재성 (재물운)
    authority: number;  // 관성 (권위, 직업운)
    wisdom: number;     // 식상 (지혜, 표현력)
    support: number;    // 인성 (도움, 학습)
    competition: number; // 비겁 (경쟁, 형제)
  }

  // 월령에 따른 오행 강약
  calculateSeasonalStrength(month: string, element: string): number {
    // 봄(인묘진): 목왕 화상 토죄 금수 수휴
    // 여름(사오미): 화왕 토상 금죄 수수 목휴
    // 가을(신유술): 금왕 수상 목죄 화수 토휴
    // 겨울(해자축): 수왕 목상 화죄 토수 금휴
  }
}

// 60갑자별 정통 사주학적 의미
const GAPJA_MEANINGS = {
  '갑자': { nature: '자수생갑목', fortune: '물이 나무를 기르니 학문과 성장', strength: 75 },
  '을축': { nature: '을목극축토', fortune: '나무가 토를 누르니 변화와 극복', strength: 60 },
  '병인': { nature: '병화득인목', fortune: '불이 나무를 만나니 밝고 역동적', strength: 85 },
  '정묘': { nature: '정화약묘목', fortune: '약한 불이니 섬세하고 변덕', strength: 45 },
  '신해': { nature: '신금생해수', fortune: '금이 물을 생하니 지혜롭고 유연', strength: 70 },
  '병진': { nature: '병화득진토', fortune: '불이 토를 얻으니 저장하고 성취', strength: 80 },
  // ... 정통 사주학에 따른 60갑자 해석
};
```

#### 2. 대운 시스템 정밀 구현
```typescript
class PersonalFortuneCalculator {
  private readonly birthSaju: SajuComponents;
  private readonly personalPattern: PersonalPattern;

  constructor(saju: SajuComponents) {
    this.birthSaju = saju;
    this.personalPattern = this.calculatePersonalPattern(saju);
  }

  // 실제 대운 계산
  calculateDaeun(currentAge: number): DaeunInfo {
    const daeunCycle = Math.floor(currentAge / 10);
    const yearPillar = this.birthSaju.year;

    // 순행/역행 결정
    const isForward = this.determineDirection(yearPillar);

    // 대운 천간지지 계산
    const daeunGanJi = this.calculateDaeunGanJi(yearPillar, daeunCycle, isForward);

    return {
      ganJi: daeunGanJi,
      strength: this.calculateDaeunStrength(daeunGanJi, this.birthSaju),
      harmony: this.calculateHarmony(daeunGanJi, this.birthSaju),
      cycle: daeunCycle
    };
  }

  // 사주 팔자에 정확히 맞는 운세 차트 생성
  generateAccurateSajuChart(): YearlyFortune[] {
    const result: YearlyFortune[] = [];
    const sajuAnalysis = this.analyzeSaju(); // 사주 종합 분석

    for (let age = 0; age <= 95; age++) {
      // 정통 사주학 계산
      const daeun = this.calculateRealDaeun(age);  // 실제 대운 계산
      const seun = this.calculateRealSeun(age);    // 실제 세운 계산

      // 사주 팔자 기반 기본 운세
      const sajuBaseScore = this.calculateSajuBasedScore(sajuAnalysis, age);

      // 대운과 사주의 상호작용 (상생/상극)
      const daeunHarmony = this.calculateHarmony(daeun, this.birthSaju);

      // 세운과 사주의 상호작용
      const seunHarmony = this.calculateHarmony(seun, this.birthSaju);

      // 삼합/충/파 등 복잡한 관계 계산
      const complexInteraction = this.calculateComplexInteractions(this.birthSaju, daeun, seun);

      // 정통 사주학에 따른 최종 점수
      const totalScore = this.calculateAuthenticScore({
        sajuBase: sajuBaseScore,
        daeunEffect: daeunHarmony,
        seunEffect: seunHarmony,
        interaction: complexInteraction
      });

      result.push({
        age,
        year: this.birthYear + age,
        totalScore,
        fortune: this.calculateFortuneAspect(sajuAnalysis, daeun, seun),
        willpower: this.calculateWillpowerAspect(sajuAnalysis, age),
        environment: this.calculateEnvironmentAspect(daeun, seun),
        change: this.calculateChangeAspect(seun, complexInteraction),
        대운: daeun,
        세운: seun,
        사주해석: this.getSajuInterpretation(age, sajuAnalysis, daeun, seun)
      });
    }

    return result;
  }

  // 개인별 기본 점수 (나이별로 완전히 다른 패턴)
  private getPersonalBaseScore(age: number): number {
    const pattern = this.personalPattern;

    // 년주 기반 기본 곡선
    const yearEffect = this.calculateYearPillarEffect(age);

    // 월주 기반 계절성
    const monthEffect = this.calculateMonthPillarEffect(age);

    // 일주 기반 개인성
    const dayEffect = this.calculateDayPillarEffect(age);

    // 시주 기반 시간성
    const timeEffect = this.calculateTimePillarEffect(age);

    return Math.round((yearEffect + monthEffect + dayEffect + timeEffect) / 4);
  }
}
```

#### 3. 검증 가능한 차이 생성
```typescript
// 명확한 개인차 보장
function ensurePersonalDifference(chart1: YearlyFortune[], chart2: YearlyFortune[]): boolean {
  let significantDifferences = 0;

  for (let i = 0; i < Math.min(chart1.length, chart2.length); i++) {
    const diff = Math.abs(chart1[i].totalScore - chart2[i].totalScore);
    if (diff > 15) { // 15점 이상 차이
      significantDifferences++;
    }
  }

  // 전체의 30% 이상에서 유의미한 차이가 있어야 함
  const minRequiredDifferences = Math.floor(chart1.length * 0.3);
  return significantDifferences >= minRequiredDifferences;
}
```

### Phase 3: 실시간 검증 시스템 (30분)

#### 1. 브라우저 콘솔 테스트 함수
```javascript
// window.testPersonalCharts() 함수 등록
function testPersonalCharts() {
  console.log('🧪 개인별 차트 차이 테스트 시작');

  // 테스트용 사주 데이터
  const testSajus = [
    { name: '박준수', saju: { year: {gan: '신', ji: '해'}, ... } },
    { name: '정비제', saju: { year: {gan: '병', ji: '진'}, ... } },
    { name: '테스트A', saju: { year: {gan: '갑', ji: '자'}, ... } },
  ];

  const charts = testSajus.map(person => ({
    name: person.name,
    chart: new PersonalFortuneCalculator(person.saju).generatePersonalChart()
  }));

  // 차트 간 차이 분석
  for (let i = 0; i < charts.length; i++) {
    for (let j = i + 1; j < charts.length; j++) {
      const similarity = calculateChartSimilarity(charts[i].chart, charts[j].chart);
      console.log(`${charts[i].name} vs ${charts[j].name} 유사도: ${similarity}%`);

      if (similarity > 70) {
        console.error('❌ 차트가 너무 유사함! 개인화 실패');
      } else {
        console.log('✅ 개인별 차이 확인');
      }
    }
  }
}
```

## 🚀 단계별 실행 계획

### Step 1: 현재 시스템 진단 (즉시 실행)
```bash
# 1. UniversalSajuEngine 동작 분석
# 2. 디버깅 로그 추가
# 3. 박준수/정비제 차트 비교 테스트
```

### Step 2: PersonalFortuneCalculator 클래스 구현
```bash
# 1. 60갑자 패턴 매트릭스 정의
# 2. 대운/세운 시스템 구현
# 3. 개인별 기본 점수 계산 로직
```

### Step 3: 기존 시스템과 통합
```bash
# 1. lifetimeFortuneApi.ts 수정
# 2. PersonalFortuneCalculator 적용
# 3. 브라우저 테스트 및 검증
```

## 🎯 성공 기준

### 정량적 목표
- **사주 팔자가 다르면 차트도 반드시 달라야 함**
- **동일한 사주 팔자면 항상 같은 차트 생성**
- **사주학적 길흉 판단과 차트 점수의 일치도 > 85%**

### 정성적 목표 (사주학 이론 기반)
- **박준수 (신해 기해 병오 경인)**: 금수 상생, 화금 충돌 → 사주학적 분석에 따른 정확한 운세
- **정비제 (병진 정유 신미 계사)**: 화토금 순환, 토금 상생 → 사주학적 분석에 따른 정확한 운세
- **차트는 개인 취향이 아닌 사주 팔자의 객관적 반영**

## 🔧 핵심 파일 수정 목록

1. **packages/web/src/utils/PersonalFortuneCalculator.ts** (신규)
   - 60갑자 기반 개인 패턴 계산

2. **packages/web/src/data/personalPatternMatrix.ts** (신규)
   - 실제 사주학 기반 패턴 데이터

3. **packages/web/src/services/lifetimeFortuneApi.ts** (수정)
   - PersonalFortuneCalculator 적용

4. **packages/web/src/utils/chartTestUtils.ts** (신규)
   - 브라우저 테스트 함수

## ⚠️ 주의사항

1. **기존 해결된 부분 유지**: 사주 데이터 해결 로직은 그대로 유지
2. **점진적 적용**: 기존 UniversalSajuEngine과 병렬로 테스트 후 교체
3. **성능 고려**: 복잡한 계산이므로 캐싱 전략 필수
4. **사용자 기대**: 차트가 바뀌므로 충분한 테스트 필요

## 🎭 예상 결과

### Before (현재)
```
박준수: ~~~~~~~~~~~~~~~~~~~~~ (동일 패턴)
정비제: ~~~~~~~~~~~~~~~~~~~~~ (동일 패턴)
모든 사람: ~~~~~~~~~~~~~~~~~ (사주와 무관한 고정 패턴)
```

### After (목표)
```
박준수: 신해기해병오경인 → 사주학적 계산에 따른 고유 패턴
정비제: 병진정유신미계사 → 사주학적 계산에 따른 고유 패턴
각자의 사주 팔자 → 정확한 사주학 이론에 따른 개별 운세 차트
```

---
**작성일**: 2024-12-18
**작성자**: Claude Code Assistant
**상태**: 실행 대기 중
**우선순위**: 🔴 최고 (핵심 기능 구현)