// 통합 사주 레이더차트 11개 대항목 데이터
import { SajuRadarCategory } from '@/types/sajuRadar'

export const SAJU_RADAR_CATEGORIES: SajuRadarCategory[] = [
  {
    id: 'jubon',
    name: '주본',
    icon: '🎯',
    description: '기본 성향과 본성 분석',
    subcategories: [
      {
        id: 'personality',
        name: '성격',
        items: [
          { id: 'active', name: '적극성', baseScore: 75 },
          { id: 'passive', name: '소극성', baseScore: 45 },
          { id: 'extrovert', name: '외향성', baseScore: 80 },
          { id: 'introvert', name: '내향성', baseScore: 40 },
          { id: 'emotional', name: '감정기복', baseScore: 60 },
          { id: 'stable', name: '안정성', baseScore: 70 },
          { id: 'optimistic', name: '낙관성', baseScore: 75 },
          { id: 'pessimistic', name: '비관성', baseScore: 35 }
        ]
      },
      {
        id: 'temperament',
        name: '기질',
        items: [
          { id: 'calm', name: '침착함', baseScore: 70 },
          { id: 'hasty', name: '급성', baseScore: 40 },
          { id: 'meticulous', name: '꼼꼼함', baseScore: 85 },
          { id: 'bold', name: '대범함', baseScore: 50 },
          { id: 'patient', name: '인내력', baseScore: 65 },
          { id: 'impulsive', name: '충동성', baseScore: 45 }
        ]
      },
      {
        id: 'social',
        name: '사회성',
        items: [
          { id: 'leadership', name: '리더십', baseScore: 60 },
          { id: 'cooperation', name: '협력성', baseScore: 70 },
          { id: 'communication', name: '소통력', baseScore: 75 },
          { id: 'adaptation', name: '적응력', baseScore: 65 }
        ]
      }
    ]
  },
  {
    id: 'juun',
    name: '주운',
    icon: '🍀',
    description: '운세와 길흉 분석',
    subcategories: [
      {
        id: 'fortune',
        name: '운세',
        items: [
          { id: 'luck', name: '행운', baseScore: 65 },
          { id: 'timing', name: '타이밍', baseScore: 55 },
          { id: 'opportunity', name: '기회', baseScore: 70 },
          { id: 'crisis', name: '위기극복', baseScore: 60 }
        ]
      },
      {
        id: 'destiny',
        name: '운명',
        items: [
          { id: 'fate', name: '숙명', baseScore: 75 },
          { id: 'karma', name: '인과응보', baseScore: 65 },
          { id: 'blessing', name: '복덕', baseScore: 70 }
        ]
      }
    ]
  },
  {
    id: 'noe',
    name: '뇌',
    icon: '🧠',
    description: '사고력과 지능 분석',
    subcategories: [
      {
        id: 'intelligence',
        name: '지능',
        items: [
          { id: 'logical', name: '논리력', baseScore: 70 },
          { id: 'creative', name: '창의력', baseScore: 65 },
          { id: 'analytical', name: '분석력', baseScore: 75 },
          { id: 'intuitive', name: '직관력', baseScore: 60 },
          { id: 'memory', name: '기억력', baseScore: 70 }
        ]
      },
      {
        id: 'wisdom',
        name: '지혜',
        items: [
          { id: 'judgment', name: '판단력', baseScore: 65 },
          { id: 'insight', name: '통찰력', baseScore: 60 },
          { id: 'experience', name: '경험치', baseScore: 55 }
        ]
      }
    ]
  },
  {
    id: 'jugeon',
    name: '주건',
    icon: '💪',
    description: '건강과 체력 분석',
    subcategories: [
      {
        id: 'physical',
        name: '신체',
        items: [
          { id: 'vitality', name: '활력', baseScore: 70 },
          { id: 'endurance', name: '지구력', baseScore: 65 },
          { id: 'immunity', name: '면역력', baseScore: 60 },
          { id: 'recovery', name: '회복력', baseScore: 55 }
        ]
      },
      {
        id: 'mental',
        name: '정신',
        items: [
          { id: 'stress', name: '스트레스 저항', baseScore: 50 },
          { id: 'mental_strength', name: '정신력', baseScore: 65 },
          { id: 'balance', name: '심신균형', baseScore: 60 }
        ]
      }
    ]
  },
  {
    id: 'juyeon',
    name: '주연',
    icon: '🤝',
    description: '인간관계와 연결 분석',
    subcategories: [
      {
        id: 'relationship',
        name: '인간관계',
        items: [
          { id: 'friendship', name: '우정', baseScore: 70 },
          { id: 'love', name: '연애', baseScore: 65 },
          { id: 'family', name: '가족', baseScore: 75 },
          { id: 'colleague', name: '동료', baseScore: 60 },
          { id: 'mentor', name: '멘토', baseScore: 55 }
        ]
      },
      {
        id: 'social_network',
        name: '사회적 연결',
        items: [
          { id: 'networking', name: '네트워킹', baseScore: 60 },
          { id: 'influence', name: '영향력', baseScore: 50 },
          { id: 'popularity', name: '인기', baseScore: 55 }
        ]
      }
    ]
  },
  {
    id: 'jujae',
    name: '주재',
    icon: '🎨',
    description: '재능과 특기 분석',
    subcategories: [
      {
        id: 'artistic',
        name: '예술',
        items: [
          { id: 'music', name: '음악', baseScore: 50 },
          { id: 'art', name: '미술', baseScore: 45 },
          { id: 'literature', name: '문학', baseScore: 55 },
          { id: 'performance', name: '공연', baseScore: 40 }
        ]
      },
      {
        id: 'skill',
        name: '기능',
        items: [
          { id: 'technical', name: '기술력', baseScore: 65 },
          { id: 'craftsmanship', name: '장인정신', baseScore: 60 },
          { id: 'innovation', name: '혁신력', baseScore: 55 }
        ]
      }
    ]
  },
  {
    id: 'jueop',
    name: '주업',
    icon: '💼',
    description: '직업과 사업 분석',
    subcategories: [
      {
        id: 'career',
        name: '직업',
        items: [
          { id: 'profession', name: '전문성', baseScore: 70 },
          { id: 'promotion', name: '승진운', baseScore: 60 },
          { id: 'job_stability', name: '직장안정', baseScore: 65 },
          { id: 'workplace', name: '직장운', baseScore: 55 }
        ]
      },
      {
        id: 'business',
        name: '사업',
        items: [
          { id: 'entrepreneurship', name: '창업', baseScore: 50 },
          { id: 'business_sense', name: '사업감각', baseScore: 45 },
          { id: 'investment', name: '투자운', baseScore: 40 }
        ]
      }
    ]
  },
  {
    id: 'jumul',
    name: '주물',
    icon: '💰',
    description: '재물과 경제 분석',
    subcategories: [
      {
        id: 'wealth',
        name: '재물',
        items: [
          { id: 'income', name: '수입', baseScore: 60 },
          { id: 'savings', name: '저축', baseScore: 55 },
          { id: 'property', name: '부동산', baseScore: 50 },
          { id: 'windfall', name: '횡재', baseScore: 30 }
        ]
      },
      {
        id: 'financial',
        name: '금전관리',
        items: [
          { id: 'money_sense', name: '금전감각', baseScore: 65 },
          { id: 'spending', name: '소비패턴', baseScore: 60 },
          { id: 'debt', name: '부채관리', baseScore: 70 }
        ]
      }
    ]
  },
  {
    id: 'jusaeng',
    name: '주생',
    icon: '🌱',
    description: '생활과 일상 분석',
    subcategories: [
      {
        id: 'daily_life',
        name: '일상',
        items: [
          { id: 'lifestyle', name: '생활패턴', baseScore: 70 },
          { id: 'hobby', name: '취미생활', baseScore: 65 },
          { id: 'leisure', name: '여가활동', baseScore: 60 },
          { id: 'routine', name: '규칙성', baseScore: 55 }
        ]
      },
      {
        id: 'environment',
        name: '환경',
        items: [
          { id: 'home', name: '주거환경', baseScore: 70 },
          { id: 'neighborhood', name: '근린환경', baseScore: 65 },
          { id: 'travel', name: '여행운', baseScore: 50 }
        ]
      }
    ]
  },
  {
    id: 'juneung',
    name: '주능',
    icon: '⚡',
    description: '능력과 역량 분석',
    subcategories: [
      {
        id: 'ability',
        name: '능력',
        items: [
          { id: 'learning', name: '학습능력', baseScore: 75 },
          { id: 'adaptation', name: '적응능력', baseScore: 70 },
          { id: 'problem_solving', name: '문제해결', baseScore: 65 },
          { id: 'execution', name: '실행력', baseScore: 60 }
        ]
      },
      {
        id: 'potential',
        name: '잠재력',
        items: [
          { id: 'growth', name: '성장가능성', baseScore: 80 },
          { id: 'hidden_talent', name: '숨은재능', baseScore: 55 },
          { id: 'development', name: '발전성', baseScore: 70 }
        ]
      }
    ]
  },
  {
    id: 'juhyung',
    name: '주흉',
    icon: '⚠️',
    description: '위험 요소와 주의사항 분석',
    subcategories: [
      {
        id: 'risk',
        name: '위험',
        items: [
          { id: 'accident', name: '사고위험', baseScore: 20 }, // 낮을수록 좋음
          { id: 'health_risk', name: '건강위험', baseScore: 25 },
          { id: 'financial_risk', name: '재정위험', baseScore: 30 },
          { id: 'relationship_risk', name: '인관위험', baseScore: 35 }
        ]
      },
      {
        id: 'caution',
        name: '주의사항',
        items: [
          { id: 'overconfidence', name: '자만주의', baseScore: 40 },
          { id: 'stubbornness', name: '고집', baseScore: 45 },
          { id: 'impulsiveness', name: '성급함', baseScore: 50 }
        ]
      }
    ]
  }
]