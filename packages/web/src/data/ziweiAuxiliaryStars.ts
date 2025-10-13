/**
 * 자미두수 보조성(輔星) 데이터베이스
 *
 * 100+ 보조성의 속성, 길흉, 오행, 배치 규칙 정의
 * @author Claude Code - 자미두수 전문가
 * @version 2.0.0
 */

import type { AuxiliaryStar } from '@/types/ziwei';

// 보조성 카테고리
export type AuxiliaryStarCategory =
  | 'lucky'        // 육길성 (六吉星)
  | 'unlucky'      // 육흉성 (六凶星)
  | 'transformation' // 사화성 (四化星)
  | 'general'      // 일반 보조성
  | 'year'         // 연지성 (年支星)
  | 'month'        // 월지성 (月支星)
  | 'day'          // 일지성 (日支星)
  | 'hour';        // 시지성 (時支星)

// 보조성 상세 정보
export interface AuxiliaryStarInfo {
  name: AuxiliaryStar;
  category: AuxiliaryStarCategory;
  nature: 'auspicious' | 'neutral' | 'inauspicious';
  element?: '木' | '火' | '土' | '金' | '水';
  score: number; // 길흉 점수 (-10 ~ +15)
  description: string;
  effects: {
    positive: string[];
    negative: string[];
  };
  keywords: string[];
}

// ============================================
// 육길성 (六吉星)
// ============================================

export const LUCKY_STARS: Record<string, AuxiliaryStarInfo> = {
  '文昌': {
    name: '文昌',
    category: 'lucky',
    nature: 'auspicious',
    element: '金',
    score: 8,
    description: '문예, 학문, 시험운을 주관하는 길성. 총명하고 문장력이 뛰어남',
    effects: {
      positive: ['학업 성취', '시험 합격', '문서운', '명예', '재능'],
      negative: ['현실성 부족', '이상주의'],
    },
    keywords: ['학문', '시험', '문서', '총명', '문장'],
  },
  '文曲': {
    name: '文曲',
    category: 'lucky',
    nature: 'auspicious',
    element: '水',
    score: 7,
    description: '문예, 구변, 예술적 재능을 주관. 언변과 표현력이 좋음',
    effects: {
      positive: ['언변', '예술', '외교', '다재다능', '인기'],
      negative: ['산만함', '일관성 부족'],
    },
    keywords: ['언변', '예술', '외교', '구변', '재치'],
  },
  '左輔': {
    name: '左輔',
    category: 'lucky',
    nature: 'auspicious',
    element: '土',
    score: 10,
    description: '귀인의 도움, 보좌, 협력을 상징. 리더십과 조직력',
    effects: {
      positive: ['귀인 도움', '리더십', '조직력', '협력', '보좌'],
      negative: ['독립성 부족'],
    },
    keywords: ['귀인', '도움', '보좌', '리더십', '협력'],
  },
  '右弼': {
    name: '右弼',
    category: 'lucky',
    nature: 'auspicious',
    element: '水',
    score: 10,
    description: '보좌, 협조, 조화를 상징. 인간관계가 원만함',
    effects: {
      positive: ['인화', '협조', '조화', '중재', '보좌'],
      negative: ['주체성 부족'],
    },
    keywords: ['보좌', '협조', '조화', '인화', '중재'],
  },
  '天魁': {
    name: '天魁',
    category: 'lucky',
    nature: 'auspicious',
    element: '火',
    score: 9,
    description: '낮의 귀인. 공개적이고 명예로운 도움을 받음',
    effects: {
      positive: ['귀인 출현', '명예', '승진', '공식 도움', '권위'],
      negative: [],
    },
    keywords: ['귀인', '명예', '승진', '권위', '공식'],
  },
  '天鉞': {
    name: '天鉞',
    category: 'lucky',
    nature: 'auspicious',
    element: '火',
    score: 9,
    description: '밤의 귀인. 은밀하고 실질적인 도움을 받음',
    effects: {
      positive: ['은밀한 도움', '위기 해결', '실질적 지원', '보호'],
      negative: [],
    },
    keywords: ['귀인', '은밀', '도움', '보호', '해결'],
  },
  '祿存': {
    name: '祿存',
    category: 'lucky',
    nature: 'auspicious',
    element: '土',
    score: 12,
    description: '재물, 복록을 상징. 금전운이 좋고 안정적',
    effects: {
      positive: ['재물', '복록', '안정', '저축', '수입'],
      negative: ['인색함', '보수적'],
    },
    keywords: ['재물', '복록', '안정', '저축', '수입'],
  },
};

// ============================================
// 육흉성 (六凶星)
// ============================================

export const UNLUCKY_STARS: Record<string, AuxiliaryStarInfo> = {
  '擎羊': {
    name: '擎羊',
    category: 'unlucky',
    nature: 'inauspicious',
    element: '金',
    score: -7,
    description: '형벌, 사고, 수술을 상징. 급하고 충동적',
    effects: {
      positive: ['추진력', '결단력', '용기'],
      negative: ['사고', '수술', '형벌', '충동', '다툼'],
    },
    keywords: ['형벌', '사고', '수술', '충동', '급함'],
  },
  '陀羅': {
    name: '陀羅',
    category: 'unlucky',
    nature: 'inauspicious',
    element: '金',
    score: -6,
    description: '지연, 끈기, 집착을 상징. 일이 늦어지고 복잡함',
    effects: {
      positive: ['끈기', '인내', '신중'],
      negative: ['지연', '집착', '우유부단', '복잡', '지체'],
    },
    keywords: ['지연', '집착', '끈기', '복잡', '지체'],
  },
  '火星': {
    name: '火星',
    category: 'unlucky',
    nature: 'inauspicious',
    element: '火',
    score: -5,
    description: '급성, 화재, 폭발을 상징. 성격이 급하고 충동적',
    effects: {
      positive: ['신속', '적극', '열정'],
      negative: ['화재', '급성', '충동', '사고', '폭발'],
    },
    keywords: ['급성', '화재', '충동', '신속', '열정'],
  },
  '鈴星': {
    name: '鈴星',
    category: 'unlucky',
    nature: 'inauspicious',
    element: '火',
    score: -5,
    description: '서서히 타는 불. 만성적 문제, 불화',
    effects: {
      positive: ['열정', '지속', '노력'],
      negative: ['만성병', '불화', '소송', '구설', '번뇌'],
    },
    keywords: ['만성', '불화', '소송', '구설', '번뇌'],
  },
  '地劫': {
    name: '地劫',
    category: 'unlucky',
    nature: 'inauspicious',
    element: '火',
    score: -8,
    description: '공허, 손실, 도난을 상징. 재물 손실',
    effects: {
      positive: ['직관', '영감', '초월'],
      negative: ['손실', '도난', '공허', '사기', '낭비'],
    },
    keywords: ['손실', '도난', '공허', '사기', '낭비'],
  },
  '地空': {
    name: '地空',
    category: 'unlucky',
    nature: 'inauspicious',
    element: '火',
    score: -8,
    description: '허무, 좌절, 실패를 상징. 계획이 무산됨',
    effects: {
      positive: ['철학', '종교', '초월'],
      negative: ['실패', '좌절', '허무', '무산', '손해'],
    },
    keywords: ['실패', '좌절', '허무', '무산', '손해'],
  },
};

// ============================================
// 사화성 (四化星)
// ============================================

export const TRANSFORMATION_STARS: Record<string, AuxiliaryStarInfo> = {
  '化祿': {
    name: '化祿',
    category: 'transformation',
    nature: 'auspicious',
    element: '土',
    score: 15,
    description: '재물운 상승. 수입 증가, 인기, 명예',
    effects: {
      positive: ['재물 증가', '인기', '명예', '기회', '성공'],
      negative: [],
    },
    keywords: ['재물', '인기', '명예', '기회', '성공'],
  },
  '化權': {
    name: '化權',
    category: 'transformation',
    nature: 'auspicious',
    element: '木',
    score: 12,
    description: '권력운 상승. 지위 향상, 리더십, 영향력',
    effects: {
      positive: ['권력', '지위', '리더십', '영향력', '승진'],
      negative: ['고집', '독선'],
    },
    keywords: ['권력', '지위', '리더십', '영향력', '승진'],
  },
  '化科': {
    name: '化科',
    category: 'transformation',
    nature: 'auspicious',
    element: '金',
    score: 10,
    description: '명예운 상승. 시험 합격, 학문 성취, 명성',
    effects: {
      positive: ['명예', '시험', '학문', '명성', '인정'],
      negative: [],
    },
    keywords: ['명예', '시험', '학문', '명성', '인정'],
  },
  '化忌': {
    name: '化忌',
    category: 'transformation',
    nature: 'inauspicious',
    element: '水',
    score: -10,
    description: '불운, 장애, 좌절. 계획이 틀어지고 어려움 발생',
    effects: {
      positive: [],
      negative: ['불운', '장애', '좌절', '어려움', '손실'],
    },
    keywords: ['불운', '장애', '좌절', '어려움', '손실'],
  },
};

// ============================================
// 연지성 (年支星)
// ============================================

export const YEAR_BRANCH_STARS: Record<string, AuxiliaryStarInfo> = {
  '天官': {
    name: '天官',
    category: 'year',
    nature: 'auspicious',
    element: '土',
    score: 6,
    description: '관록, 지위, 공직운. 승진과 명예',
    effects: {
      positive: ['승진', '지위', '관록', '명예', '공직'],
      negative: [],
    },
    keywords: ['승진', '지위', '관록', '명예', '공직'],
  },
  '天福': {
    name: '天福',
    category: 'year',
    nature: 'auspicious',
    element: '土',
    score: 7,
    description: '복덕, 행복, 평안. 길운이 함께함',
    effects: {
      positive: ['복덕', '행복', '평안', '길운', '안정'],
      negative: [],
    },
    keywords: ['복덕', '행복', '평안', '길운', '안정'],
  },
  '天廚': {
    name: '天廚',
    category: 'year',
    nature: 'auspicious',
    element: '土',
    score: 5,
    description: '의식주, 음식, 생활 안정. 풍족함',
    effects: {
      positive: ['의식주', '음식', '생활', '풍족', '안정'],
      negative: ['식탐'],
    },
    keywords: ['의식주', '음식', '생활', '풍족', '안정'],
  },
  '天才': {
    name: '天才',
    category: 'year',
    nature: 'auspicious',
    element: '金',
    score: 6,
    description: '재능, 총명, 영리함. 학습 능력 뛰어남',
    effects: {
      positive: ['재능', '총명', '영리', '학습', '지혜'],
      negative: [],
    },
    keywords: ['재능', '총명', '영리', '학습', '지혜'],
  },
  '天壽': {
    name: '天壽',
    category: 'year',
    nature: 'auspicious',
    element: '土',
    score: 8,
    description: '장수, 건강, 수명. 장수 운이 좋음',
    effects: {
      positive: ['장수', '건강', '수명', '장생', '복'],
      negative: [],
    },
    keywords: ['장수', '건강', '수명', '장생', '복'],
  },
};

// ============================================
// 월지성 (月支星)
// ============================================

export const MONTH_BRANCH_STARS: Record<string, AuxiliaryStarInfo> = {
  '天月': {
    name: '天月',
    category: 'month',
    nature: 'inauspicious',
    element: '火',
    score: -4,
    description: '질병, 건강 문제, 병고. 건강 주의',
    effects: {
      positive: [],
      negative: ['질병', '건강 문제', '병고', '통증', '허약'],
    },
    keywords: ['질병', '건강', '병고', '통증', '허약'],
  },
  '陰煞': {
    name: '陰煞',
    category: 'month',
    nature: 'inauspicious',
    element: '水',
    score: -5,
    description: '음험, 암해, 은밀한 해. 배신과 모함',
    effects: {
      positive: [],
      negative: ['음험', '암해', '배신', '모함', '은밀'],
    },
    keywords: ['음험', '암해', '배신', '모함', '은밀'],
  },
};

// ============================================
// 시지성 (時支星)
// ============================================

export const HOUR_BRANCH_STARS: Record<string, AuxiliaryStarInfo> = {
  '天貴': {
    name: '天貴',
    category: 'hour',
    nature: 'auspicious',
    element: '火',
    score: 7,
    description: '귀인, 명예, 고귀함. 지위가 높아짐',
    effects: {
      positive: ['귀인', '명예', '고귀', '지위', '품격'],
      negative: [],
    },
    keywords: ['귀인', '명예', '고귀', '지위', '품격'],
  },
  '天傷': {
    name: '天傷',
    category: 'hour',
    nature: 'inauspicious',
    element: '金',
    score: -3,
    description: '상처, 다침, 부상. 사고 조심',
    effects: {
      positive: [],
      negative: ['상처', '다침', '부상', '사고', '통증'],
    },
    keywords: ['상처', '다침', '부상', '사고', '통증'],
  },
};

// ============================================
// 기타 중요 보조성
// ============================================

export const OTHER_STARS: Record<string, AuxiliaryStarInfo> = {
  '台輔': {
    name: '台輔',
    category: 'general',
    nature: 'auspicious',
    element: '土',
    score: 7,
    description: '보좌, 도움, 협력. 귀인의 지원',
    effects: {
      positive: ['보좌', '도움', '협력', '지원', '귀인'],
      negative: [],
    },
    keywords: ['보좌', '도움', '협력', '지원', '귀인'],
  },
  '封誥': {
    name: '封誥',
    category: 'general',
    nature: 'auspicious',
    element: '土',
    score: 6,
    description: '명예, 인정, 포상. 공적 인정',
    effects: {
      positive: ['명예', '인정', '포상', '공적', '칭찬'],
      negative: [],
    },
    keywords: ['명예', '인정', '포상', '공적', '칭찬'],
  },
  '恩光': {
    name: '恩光',
    category: 'general',
    nature: 'auspicious',
    element: '火',
    score: 5,
    description: '은덕, 빛, 영광. 좋은 평판',
    effects: {
      positive: ['은덕', '빛', '영광', '평판', '명성'],
      negative: [],
    },
    keywords: ['은덕', '빛', '영광', '평판', '명성'],
  },
  '天巫': {
    name: '天巫',
    category: 'general',
    nature: 'neutral',
    element: '水',
    score: 2,
    description: '종교, 신비, 영감. 직관력 뛰어남',
    effects: {
      positive: ['종교', '신비', '영감', '직관', '감수성'],
      negative: ['미신', '환상'],
    },
    keywords: ['종교', '신비', '영감', '직관', '감수성'],
  },
  '天德': {
    name: '天德',
    category: 'general',
    nature: 'auspicious',
    element: '土',
    score: 8,
    description: '덕행, 도덕, 선행. 화를 복으로 바꿈',
    effects: {
      positive: ['덕행', '도덕', '선행', '화해', '해결'],
      negative: [],
    },
    keywords: ['덕행', '도덕', '선행', '화해', '해결'],
  },
  '月德': {
    name: '月德',
    category: 'general',
    nature: 'auspicious',
    element: '土',
    score: 7,
    description: '덕행, 평화, 안정. 평온함',
    effects: {
      positive: ['덕행', '평화', '안정', '평온', '조화'],
      negative: [],
    },
    keywords: ['덕행', '평화', '안정', '평온', '조화'],
  },
  '解神': {
    name: '解神',
    category: 'general',
    nature: 'auspicious',
    element: '木',
    score: 6,
    description: '해결, 화해, 풀림. 문제 해결',
    effects: {
      positive: ['해결', '화해', '풀림', '타협', '조정'],
      negative: [],
    },
    keywords: ['해결', '화해', '풀림', '타협', '조정'],
  },
  '天官符': {
    name: '天官符',
    category: 'general',
    nature: 'inauspicious',
    element: '金',
    score: -4,
    description: '관재, 소송, 법적 문제. 관청 일',
    effects: {
      positive: [],
      negative: ['관재', '소송', '법적 문제', '관청', '분쟁'],
    },
    keywords: ['관재', '소송', '법적', '관청', '분쟁'],
  },
  '孤辰': {
    name: '孤辰',
    category: 'general',
    nature: 'inauspicious',
    element: '火',
    score: -3,
    description: '고독, 독립, 외로움. 혼자 있음',
    effects: {
      positive: ['독립', '자주', '집중'],
      negative: ['고독', '외로움', '고립', '인연 부족'],
    },
    keywords: ['고독', '독립', '외로움', '고립', '인연'],
  },
  '寡宿': {
    name: '寡宿',
    category: 'general',
    nature: 'inauspicious',
    element: '水',
    score: -3,
    description: '고독, 외로움, 배우자 인연 박함',
    effects: {
      positive: ['집중', '독립', '사색'],
      negative: ['고독', '외로움', '배우자 인연 부족', '이별'],
    },
    keywords: ['고독', '외로움', '배우자', '이별', '독립'],
  },
  '蜚廉': {
    name: '蜚廉',
    category: 'general',
    nature: 'inauspicious',
    element: '火',
    score: -2,
    description: '분주, 바쁨, 소모. 쉴 틈 없음',
    effects: {
      positive: ['활동', '역동'],
      negative: ['분주', '바쁨', '소모', '피곤', '불안'],
    },
    keywords: ['분주', '바쁨', '소모', '피곤', '활동'],
  },
  '破碎': {
    name: '破碎',
    category: 'general',
    nature: 'inauspicious',
    element: '金',
    score: -4,
    description: '파괴, 손상, 깨짐. 물건 파손',
    effects: {
      positive: [],
      negative: ['파괴', '손상', '파손', '손실', '깨짐'],
    },
    keywords: ['파괴', '손상', '파손', '손실', '깨짐'],
  },
  '華蓋': {
    name: '華蓋',
    category: 'general',
    nature: 'neutral',
    element: '木',
    score: 1,
    description: '예술, 고독, 종교. 예술적 재능과 고독',
    effects: {
      positive: ['예술', '재능', '종교', '철학', '사색'],
      negative: ['고독', '외로움', '고립'],
    },
    keywords: ['예술', '재능', '고독', '종교', '사색'],
  },
  '咸池': {
    name: '咸池',
    category: 'general',
    nature: 'neutral',
    element: '水',
    score: 0,
    description: '이성운, 유흥, 색정. 이성 관계 복잡',
    effects: {
      positive: ['매력', '인기', '사교'],
      negative: ['유흥', '색정', '스캔들', '문란', '유혹'],
    },
    keywords: ['이성', '유흥', '매력', '스캔들', '사교'],
  },
};

// ============================================
// 일반 보조성
// ============================================

export const GENERAL_STARS: Record<string, AuxiliaryStarInfo> = {
  '天馬': {
    name: '天馬',
    category: 'general',
    nature: 'neutral',
    element: '火',
    score: 5,
    description: '변동, 이동, 바쁨을 상징. 활동적이고 역동적',
    effects: {
      positive: ['이동', '변화', '활동', '기회', '역동'],
      negative: ['불안정', '분주', '정착 어려움'],
    },
    keywords: ['이동', '변동', '활동', '바쁨', '역동'],
  },
  '紅鸞': {
    name: '紅鸞',
    category: 'general',
    nature: 'auspicious',
    element: '水',
    score: 8,
    description: '결혼, 연애, 기쁜 일. 혼인운이 좋음',
    effects: {
      positive: ['결혼', '연애', '기쁨', '인연', '만남'],
      negative: ['감정 소모'],
    },
    keywords: ['결혼', '연애', '기쁨', '인연', '혼인'],
  },
  '天喜': {
    name: '天喜',
    category: 'general',
    nature: 'auspicious',
    element: '水',
    score: 7,
    description: '기쁨, 경사, 좋은 소식. 희소식이 들림',
    effects: {
      positive: ['기쁨', '경사', '희소식', '축하', '행복'],
      negative: [],
    },
    keywords: ['기쁨', '경사', '희소식', '축하', '행복'],
  },
  '天空': {
    name: '天空',
    category: 'general',
    nature: 'inauspicious',
    element: '火',
    score: -4,
    description: '공상, 이상, 비현실적. 실속이 없음',
    effects: {
      positive: ['창의', '상상', '예술'],
      negative: ['공상', '비현실', '실속 없음', '낭비'],
    },
    keywords: ['공상', '이상', '비현실', '창의', '상상'],
  },
  '天刑': {
    name: '天刑',
    category: 'general',
    nature: 'inauspicious',
    element: '火',
    score: -3,
    description: '형벌, 소송, 법적 문제. 다툼과 분쟁',
    effects: {
      positive: ['정의감', '엄격', '원칙'],
      negative: ['소송', '형벌', '분쟁', '다툼', '처벌'],
    },
    keywords: ['소송', '형벌', '분쟁', '다툼', '정의'],
  },
  '天姚': {
    name: '天姚',
    category: 'general',
    nature: 'neutral',
    element: '水',
    score: 0,
    description: '이성운, 매력, 유혹. 이성 관계가 복잡',
    effects: {
      positive: ['매력', '인기', '예술', '감수성'],
      negative: ['유혹', '스캔들', '복잡', '애정 문제'],
    },
    keywords: ['이성', '매력', '유혹', '인기', '감수성'],
  },
  '天哭': {
    name: '天哭',
    category: 'general',
    nature: 'inauspicious',
    element: '金',
    score: -2,
    description: '슬픔, 눈물, 이별. 감정적 고통',
    effects: {
      positive: ['감수성', '공감', '예술'],
      negative: ['슬픔', '눈물', '이별', '상실', '애도'],
    },
    keywords: ['슬픔', '눈물', '이별', '상실', '감정'],
  },
  '天虛': {
    name: '天虛',
    category: 'general',
    nature: 'inauspicious',
    element: '水',
    score: -2,
    description: '허약, 건강 문제, 공허함',
    effects: {
      positive: ['섬세', '조심', '신중'],
      negative: ['허약', '건강 문제', '공허', '불안'],
    },
    keywords: ['허약', '건강', '공허', '불안', '섬세'],
  },
  '龍池': {
    name: '龍池',
    category: 'general',
    nature: 'auspicious',
    element: '水',
    score: 4,
    description: '예술적 재능, 문예, 미적 감각',
    effects: {
      positive: ['예술', '문예', '미적 감각', '창의', '재능'],
      negative: [],
    },
    keywords: ['예술', '문예', '미감', '창의', '재능'],
  },
  '鳳閣': {
    name: '鳳閣',
    category: 'general',
    nature: 'auspicious',
    element: '火',
    score: 4,
    description: '명예, 지위, 권위. 고상함',
    effects: {
      positive: ['명예', '지위', '권위', '고상', '품격'],
      negative: [],
    },
    keywords: ['명예', '지위', '권위', '고상', '품격'],
  },
};

// ============================================
// 전체 보조성 통합
// ============================================

export const ALL_AUXILIARY_STARS: Record<string, AuxiliaryStarInfo> = {
  ...LUCKY_STARS,
  ...UNLUCKY_STARS,
  ...TRANSFORMATION_STARS,
  ...YEAR_BRANCH_STARS,
  ...MONTH_BRANCH_STARS,
  ...HOUR_BRANCH_STARS,
  ...OTHER_STARS,
  ...GENERAL_STARS,
};

// ============================================
// 보조성 검색 헬퍼
// ============================================

export function getAuxiliaryStarInfo(starName: AuxiliaryStar): AuxiliaryStarInfo | undefined {
  return ALL_AUXILIARY_STARS[starName];
}

export function getAuxiliaryStarsByCategory(category: AuxiliaryStarCategory): AuxiliaryStarInfo[] {
  return Object.values(ALL_AUXILIARY_STARS).filter(star => star.category === category);
}

export function getAuxiliaryStarScore(starName: AuxiliaryStar): number {
  return ALL_AUXILIARY_STARS[starName]?.score || 0;
}
