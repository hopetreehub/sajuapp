/**
 * 귀문둔갑 신격(神格) 조합 분석
 *
 * 팔문, 구성, 팔신의 특수 조합 패턴을 분석하여
 * 길격(吉格)과 흉격(凶格)을 판별합니다.
 *
 * @author Claude Code
 * @version 2.0.0
 */

import type { Gate, Star, Spirit, Fortune } from '@/types/qimen';

/**
 * 신격 타입
 */
export type PatternType = 'auspicious' | 'inauspicious' | 'neutral';

/**
 * 신격 정보
 */
export interface Pattern {
  id: string;
  name: string;
  type: PatternType;
  description: string;
  effects: string[];
  strength: number; // 1-10, 영향력 강도
}

/**
 * 신격 조합 규칙
 */
interface PatternRule {
  name: string;
  type: PatternType;
  description: string;
  effects: string[];
  strength: number;
  check: (gate: Gate, star: Star, spirit?: Spirit) => boolean;
}

/**
 * 주요 길격(吉格) 패턴
 */
const AUSPICIOUS_PATTERNS: PatternRule[] = [
  // 1. 청룡반수(青龍返首) - 최고 길격
  {
    name: '청룡반수',
    type: 'auspicious',
    description: '생문과 천영성이 만나 명예와 재물이 함께 오는 대길격',
    effects: [
      '재물운 상승',
      '명예 획득',
      '승진 가능',
      '사업 성공',
      '귀인 만남',
    ],
    strength: 10,
    check: (gate, star) => gate === '생문' && star === '천영',
  },

  // 2. 천지삼기득기(天地三奇得奇) - 귀인 만남
  {
    name: '천지삼기득기',
    type: 'auspicious',
    description: '개문, 천보성, 직부가 만나 귀인의 도움을 받는 길격',
    effects: [
      '귀인 도움',
      '프로젝트 성공',
      '협력 강화',
      '명성 상승',
    ],
    strength: 9,
    check: (gate, star, spirit) =>
      gate === '개문' && star === '천보' && spirit === '직부',
  },

  // 3. 청룡요두(青龍回頭) - 재물 획득
  {
    name: '청룡회두',
    type: 'auspicious',
    description: '생문과 천임성이 만나 안정적인 재물 획득',
    effects: [
      '재물 안정',
      '저축 증가',
      '신뢰 구축',
      '장기 투자 길',
    ],
    strength: 8,
    check: (gate, star) => gate === '생문' && star === '천임',
  },

  // 4. 태백입형(太白入刑) 길격
  {
    name: '태백입형',
    type: 'auspicious',
    description: '경문과 천심성이 만나 의술, 예술, 창조 분야 대길',
    effects: [
      '의술 발전',
      '예술 성공',
      '창조력 발휘',
      '치유 능력',
    ],
    strength: 8,
    check: (gate, star) => gate === '경문' && star === '천심',
  },

  // 5. 현무입간(玄武入坎) - 지혜 개발
  {
    name: '현무입간',
    type: 'auspicious',
    description: '휴문과 천봉성이 만나 지혜와 전략이 발달',
    effects: [
      '지혜 증진',
      '전략 수립',
      '계획 성공',
      '학문 발전',
    ],
    strength: 7,
    check: (gate, star) => gate === '휴문' && star === '천봉',
  },

  // 6. 육합태음(六합太陰) - 협력 강화
  {
    name: '육합태음',
    type: 'auspicious',
    description: '개문에 육합과 태음이 만나 협력과 화합',
    effects: [
      '협력 강화',
      '중재 성공',
      '관계 개선',
      '타협 성공',
    ],
    strength: 7,
    check: (gate, star, spirit) =>
      gate === '개문' && (spirit === '육합' || spirit === '태음'),
  },
];

/**
 * 주요 흉격(凶格) 패턴
 */
const INAUSPICIOUS_PATTERNS: PatternRule[] = [
  // 1. 등사입묘(螣蛇入墓) - 대흉격
  {
    name: '등사입묘',
    type: 'inauspicious',
    description: '사문과 천예성에 등사가 만나 질병, 재앙의 대흉격',
    effects: [
      '질병 주의',
      '재앙 경계',
      '실패 위험',
      '손실 가능',
    ],
    strength: 10,
    check: (gate, star, spirit) =>
      gate === '사문' && star === '천예' && spirit === '등사',
  },

  // 2. 백호당문(白虎當門) - 재난 주의
  {
    name: '백호당문',
    type: 'inauspicious',
    description: '상문에 백호가 머물러 충돌과 상처 위험',
    effects: [
      '충돌 위험',
      '상처 주의',
      '분쟁 발생',
      '사고 경계',
    ],
    strength: 9,
    check: (gate, star, spirit) =>
      gate === '상문' && spirit === '백호',
  },

  // 3. 형격반음(刑格反吟) - 막힘과 지체
  {
    name: '형격반음',
    type: 'inauspicious',
    description: '두문과 천충성이 만나 일이 막히고 지체됨',
    effects: [
      '진행 지체',
      '막힘 발생',
      '소통 불가',
      '고립 위험',
    ],
    strength: 8,
    check: (gate, star) => gate === '두문' && star === '천충',
  },

  // 4. 현무투간(玄武投干) - 도난과 사기
  {
    name: '현무투간',
    type: 'inauspicious',
    description: '현무가 나쁜 궁에 들어가 도난, 사기 위험',
    effects: [
      '도난 위험',
      '사기 주의',
      '배신 가능',
      '속임 경계',
    ],
    strength: 8,
    check: (gate, star, spirit) =>
      (gate === '사문' || gate === '상문') && spirit === '현무',
  },

  // 5. 백호충관(白虎衝官) - 관재수
  {
    name: '백호충관',
    type: 'inauspicious',
    description: '경문에 백호가 있어 관재수, 소송 위험',
    effects: [
      '관재수 발생',
      '소송 위험',
      '법적 문제',
      '명예 손상',
    ],
    strength: 7,
    check: (gate, star, spirit) =>
      gate === '경문' && spirit === '백호',
  },
];

/**
 * 중립 패턴 (특수 상황)
 */
const NEUTRAL_PATTERNS: PatternRule[] = [
  // 1. 반음(反吟) - 돌이킴
  {
    name: '반음',
    type: 'neutral',
    description: '놀문과 천주성이 만나 예상치 못한 변화',
    effects: [
      '예상 변화',
      '돌발 상황',
      '전환 시기',
      '재평가 필요',
    ],
    strength: 6,
    check: (gate, star) => gate === '놀문' && star === '천주',
  },

  // 2. 복음(伏吟) - 정체
  {
    name: '복음',
    type: 'neutral',
    description: '휴문과 천금성이 만나 정체와 반복',
    effects: [
      '정체 상태',
      '반복 패턴',
      '휴식 필요',
      '재정비 시기',
    ],
    strength: 5,
    check: (gate, star) => gate === '휴문' && star === '천금',
  },
];

/**
 * 궁의 신격 조합 분석
 *
 * @param gate 팔문
 * @param star 구성
 * @param spirit 팔신
 * @returns 발견된 신격 패턴 배열
 */
export function analyzePatterns(
  gate: Gate,
  star: Star,
  spirit?: Spirit,
): Pattern[] {
  const patterns: Pattern[] = [];

  // 길격 검사
  for (const rule of AUSPICIOUS_PATTERNS) {
    if (rule.check(gate, star, spirit)) {
      patterns.push({
        id: `auspicious-${patterns.length}`,
        name: rule.name,
        type: rule.type,
        description: rule.description,
        effects: rule.effects,
        strength: rule.strength,
      });
    }
  }

  // 흉격 검사
  for (const rule of INAUSPICIOUS_PATTERNS) {
    if (rule.check(gate, star, spirit)) {
      patterns.push({
        id: `inauspicious-${patterns.length}`,
        name: rule.name,
        type: rule.type,
        description: rule.description,
        effects: rule.effects,
        strength: rule.strength,
      });
    }
  }

  // 중립 패턴 검사
  for (const rule of NEUTRAL_PATTERNS) {
    if (rule.check(gate, star, spirit)) {
      patterns.push({
        id: `neutral-${patterns.length}`,
        name: rule.name,
        type: rule.type,
        description: rule.description,
        effects: rule.effects,
        strength: rule.strength,
      });
    }
  }

  return patterns;
}

/**
 * 신격을 고려한 길흉 재평가
 *
 * @param baseFortune 기본 길흉
 * @param patterns 발견된 신격 패턴
 * @returns 조정된 길흉
 */
export function adjustFortuneWithPatterns(
  baseFortune: Fortune,
  patterns: Pattern[],
): Fortune {
  if (patterns.length === 0) return baseFortune;

  // 가장 강한 패턴의 영향력 적용
  const strongestPattern = patterns.reduce((prev, current) =>
    current.strength > prev.strength ? current : prev
  );

  // 대길격이면 excellent로 상향
  if (strongestPattern.type === 'auspicious' && strongestPattern.strength >= 9) {
    return 'excellent';
  }

  // 대흉격이면 terrible로 하향
  if (strongestPattern.type === 'inauspicious' && strongestPattern.strength >= 9) {
    return 'terrible';
  }

  // 일반 길격이면 한 단계 상향
  if (strongestPattern.type === 'auspicious' && strongestPattern.strength >= 7) {
    const fortuneOrder: Fortune[] = ['terrible', 'bad', 'neutral', 'good', 'excellent'];
    const currentIndex = fortuneOrder.indexOf(baseFortune);
    const newIndex = Math.min(currentIndex + 1, fortuneOrder.length - 1);
    return fortuneOrder[newIndex];
  }

  // 일반 흉격이면 한 단계 하향
  if (strongestPattern.type === 'inauspicious' && strongestPattern.strength >= 7) {
    const fortuneOrder: Fortune[] = ['terrible', 'bad', 'neutral', 'good', 'excellent'];
    const currentIndex = fortuneOrder.indexOf(baseFortune);
    const newIndex = Math.max(currentIndex - 1, 0);
    return fortuneOrder[newIndex];
  }

  return baseFortune;
}

/**
 * 신격 패턴 통계
 */
export function getPatternStatistics(patterns: Pattern[]): {
  total: number;
  auspicious: number;
  inauspicious: number;
  neutral: number;
  averageStrength: number;
} {
  return {
    total: patterns.length,
    auspicious: patterns.filter(p => p.type === 'auspicious').length,
    inauspicious: patterns.filter(p => p.type === 'inauspicious').length,
    neutral: patterns.filter(p => p.type === 'neutral').length,
    averageStrength: patterns.length > 0
      ? patterns.reduce((sum, p) => sum + p.strength, 0) / patterns.length
      : 0,
  };
}
