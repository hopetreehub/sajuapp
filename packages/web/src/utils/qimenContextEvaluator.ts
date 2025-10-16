/**
 * 귀문둔갑 목적별 평가 시스템
 *
 * context에 따라 길흉 점수를 재계산하고 맞춤 해석 생성
 * @author Claude Code
 * @version 2.0.0
 */

import type { Gate, Star, Spirit, Fortune, PalaceInfo, QimenChart } from '@/types/qimen';
import type { Customer } from '@/services/customerApi';
import { GATES, STARS, SPIRITS } from '@/data/qimenDunjiaData';
import { getContextWeights, type QimenContext } from '@/data/qimenContextWeights';
import { analyzeBirthDate } from '@/utils/birthYearAnalysis';

// ============================================
// 목적별 평가 함수
// ============================================

/**
 * 목적에 맞춘 길흉 점수 계산
 * @param gate 팔문
 * @param star 구성
 * @param spirit 팔신
 * @param context 목적
 * @returns 조정된 점수 (0-100)
 */
export function evaluateFortuneWithContext(
  gate: Gate,
  star: Star,
  spirit: Spirit | undefined,
  context?: QimenContext,
): { score: number; fortune: Fortune; contextBonus: number } {
  // 기본 점수 계산 (context 없을 때)
  let baseScore = 50;

  // 팔문 영향
  const gateNature = GATES[gate].nature;
  if (gateNature === 'auspicious') baseScore += 15;
  else if (gateNature === 'inauspicious') baseScore -= 15;

  // 구성 영향
  const starNature = STARS[star].nature;
  if (starNature === 'auspicious') baseScore += 15;
  else if (starNature === 'inauspicious') baseScore -= 15;

  // 팔신 영향
  if (spirit) {
    const spiritNature = SPIRITS[spirit].nature;
    if (spiritNature === 'auspicious') baseScore += 20;
    else if (spiritNature === 'inauspicious') baseScore -= 20;
  }

  // context가 없으면 기본 점수 반환
  if (!context || context === 'general') {
    const fortune = scoreToFortune(baseScore);
    return { score: baseScore, fortune, contextBonus: 0 };
  }

  // context별 가중치 적용
  const weights = getContextWeights(context);
  let contextBonus = 0;

  // 팔문 가중치
  const gateWeight = weights.gates[gate] || 0;
  contextBonus += gateWeight * 20; // 최대 ±20점

  // 구성 가중치
  const starWeight = weights.stars[star] || 0;
  contextBonus += starWeight * 15; // 최대 ±15점

  // 팔신 가중치
  if (spirit) {
    const spiritWeight = weights.spirits[spirit] || 0;
    contextBonus += spiritWeight * 15; // 최대 ±15점
  }

  // 최종 점수
  const finalScore = Math.max(0, Math.min(100, baseScore + contextBonus));
  const fortune = scoreToFortune(finalScore);

  return { score: finalScore, fortune, contextBonus };
}

/**
 * 점수를 Fortune 타입으로 변환
 */
function scoreToFortune(score: number): Fortune {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'neutral';
  if (score >= 20) return 'bad';
  return 'terrible';
}

// ============================================
// 목적별 맞춤 해석 생성
// ============================================

/**
 * 목적에 맞춘 맞춤 해석 생성
 */
export function generateContextualInterpretation(
  palace: PalaceInfo,
  context?: QimenContext,
): string {
  const weights = getContextWeights(context);
  const { gate, star, spirit, direction } = palace;

  let interpretation = `${direction} 방위는 `;

  // context별 특화 해석
  if (context === 'business') {
    interpretation += generateBusinessInterpretation(gate, star, spirit);
  } else if (context === 'love') {
    interpretation += generateLoveInterpretation(gate, star, spirit);
  } else if (context === 'travel') {
    interpretation += generateTravelInterpretation(gate, star, spirit);
  } else if (context === 'health') {
    interpretation += generateHealthInterpretation(gate, star, spirit);
  } else if (context === 'wealth') {
    interpretation += generateWealthInterpretation(gate, star, spirit);
  } else if (context === 'lawsuit') {
    interpretation += generateLawsuitInterpretation(gate, star, spirit);
  } else if (context === 'education') {
    interpretation += generateEducationInterpretation(gate, star, spirit);
  } else {
    // 일반 해석
    interpretation += `${GATES[gate].meaning}. ${STARS[star].meaning}`;
    if (spirit) interpretation += `. ${SPIRITS[spirit].meaning}이 작용합니다.`;
  }

  return interpretation;
}

// ============================================
// 목적별 상세 해석 함수들
// ============================================

function generateBusinessInterpretation(gate: Gate, star: Star, spirit?: Spirit): string {
  let text = '';

  if (gate === '생문') {
    text += '새로운 사업이나 프로젝트 시작에 매우 유리합니다. ';
  } else if (gate === '개문') {
    text += '영업, 개업, 새로운 거래처 개척에 좋습니다. ';
  } else if (gate === '경문') {
    text += '홍보, 마케팅, 브랜딩 활동에 효과적입니다. ';
  } else if (gate === '두문') {
    text += '계약이나 협상이 막힐 수 있으니 신중하세요. ';
  } else if (gate === '사문') {
    text += '사업 종결이나 손실 위험이 있으니 주의가 필요합니다. ';
  }

  if (star === '천보') {
    text += '협력자나 파트너의 도움을 받을 수 있습니다.';
  } else if (star === '천임') {
    text += '신뢰를 바탕으로 한 거래가 성사됩니다.';
  } else if (star === '천예') {
    text += '손실이나 분쟁의 위험이 있으니 계약서를 꼼꼼히 확인하세요.';
  }

  if (spirit === '직부') {
    text += ' 권력자나 고위직의 승인을 받기 좋습니다.';
  } else if (spirit === '육합') {
    text += ' 계약 체결과 협상 타결에 유리합니다.';
  } else if (spirit === '백호') {
    text += ' 갈등이나 소송으로 비화될 수 있으니 주의하세요.';
  }

  return text;
}

function generateLoveInterpretation(gate: Gate, star: Star, spirit?: Spirit): string {
  let text = '';

  if (gate === '생문') {
    text += '새로운 만남이나 관계 발전에 좋은 시기입니다. ';
  } else if (gate === '휴문') {
    text += '편안하고 안정적인 관계를 유지할 수 있습니다. ';
  } else if (gate === '개문') {
    text += '솔직한 대화와 새로운 시작이 가능합니다. ';
  } else if (gate === '상문') {
    text += '감정적 갈등이나 다툼이 있을 수 있습니다. ';
  } else if (gate === '사문') {
    text += '이별이나 관계 종결의 위험이 있습니다. ';
  }

  if (star === '천임') {
    text += '신뢰와 책임감 있는 관계가 형성됩니다.';
  } else if (star === '천보') {
    text += '조화롭고 서로 지지하는 관계입니다.';
  } else if (star === '천예') {
    text += '건강이나 스트레스 문제가 관계에 영향을 줄 수 있습니다.';
  }

  if (spirit === '육합') {
    text += ' 결혼이나 동거 등 공식적 관계로 발전하기 좋습니다.';
  } else if (spirit === '태음') {
    text += ' 은밀하거나 조용한 만남이 좋습니다.';
  } else if (spirit === '백호') {
    text += ' 큰 싸움이나 갈등이 생길 수 있으니 조심하세요.';
  }

  return text;
}

function generateTravelInterpretation(gate: Gate, star: Star, spirit?: Spirit): string {
  let text = '';

  if (gate === '개문') {
    text += '여행 출발에 매우 좋은 시기입니다. ';
  } else if (gate === '생문') {
    text += '의미있고 발전적인 여행이 될 것입니다. ';
  } else if (gate === '휴문') {
    text += '휴양과 힐링에 좋은 여행입니다. ';
  } else if (gate === '두문') {
    text += '항공편 지연이나 교통 막힘이 있을 수 있습니다. ';
  } else if (gate === '사문') {
    text += '사고나 위험이 있으니 여행을 재고하세요. ';
  }

  if (star === '천충') {
    text += '빠르고 역동적인 이동이 가능합니다.';
  } else if (star === '천보') {
    text += '안전하고 순조로운 여행이 됩니다.';
  } else if (star === '천예') {
    text += '건강 문제나 사고에 주의하세요.';
  }

  if (spirit === '구천') {
    text += ' 비행기나 고속 이동수단이 유리합니다.';
  } else if (spirit === '백호') {
    text += ' 교통사고나 분실 위험이 있으니 주의하세요.';
  } else if (spirit === '현무') {
    text += ' 도난이나 사기를 조심하세요.';
  }

  return text;
}

function generateHealthInterpretation(gate: Gate, star: Star, spirit?: Spirit): string {
  let text = '';

  if (gate === '휴문') {
    text += '휴식과 회복에 매우 좋은 시기입니다. ';
  } else if (gate === '생문') {
    text += '생명력이 강해지고 건강이 회복됩니다. ';
  } else if (gate === '상문') {
    text += '부상이나 통증이 있을 수 있으니 주의하세요. ';
  } else if (gate === '사문') {
    text += '중병이나 수술 위험이 있으니 검진을 받으세요. ';
  }

  if (star === '천심') {
    text += '의사나 치료사를 만나기 좋은 시기입니다.';
  } else if (star === '천임') {
    text += '안정적인 치료 경과가 예상됩니다.';
  } else if (star === '천예') {
    text += '질병이 악화되거나 새로운 증상이 나타날 수 있습니다.';
  }

  if (spirit === '백호') {
    text += ' 수술이 필요할 수 있으니 정밀 검사를 받으세요.';
  } else if (spirit === '구지') {
    text += ' 요양과 안정이 필요합니다.';
  } else if (spirit === '등사') {
    text += ' 과도한 걱정과 스트레스는 피하세요.';
  }

  return text;
}

function generateWealthInterpretation(gate: Gate, star: Star, spirit?: Spirit): string {
  let text = '';

  if (gate === '생문') {
    text += '재물운이 매우 좋아 수입이 증가합니다. ';
  } else if (gate === '개문') {
    text += '새로운 수입원이나 투자 기회가 생깁니다. ';
  } else if (gate === '경문') {
    text += '명성을 통한 재물 획득이 가능합니다. ';
  } else if (gate === '사문') {
    text += '손실이나 파산 위험이 있으니 투자를 삼가세요. ';
  }

  if (star === '천보') {
    text += '재물운이 최상입니다. 투자 결정을 내리기 좋습니다.';
  } else if (star === '천임') {
    text += '안정적인 투자나 저축이 유리합니다.';
  } else if (star === '천예') {
    text += '사기나 손실 위험이 있으니 신중하세요.';
  }

  if (spirit === '직부') {
    text += ' 정당한 이익과 공식적인 수입이 들어옵니다.';
  } else if (spirit === '현무') {
    text += ' 도박이나 투기는 절대 피하세요. 사기 위험이 있습니다.';
  }

  return text;
}

function generateLawsuitInterpretation(gate: Gate, star: Star, spirit?: Spirit): string {
  let text = '';

  if (gate === '경문') {
    text += '명분과 증거가 확실하여 유리합니다. ';
  } else if (gate === '개문') {
    text += '공개적이고 투명한 대응이 좋습니다. ';
  } else if (gate === '휴문') {
    text += '화해나 합의로 마무리하는 것이 좋습니다. ';
  } else if (gate === '사문') {
    text += '패소 위험이 높으니 신중하게 대응하세요. ';
  }

  if (star === '천영') {
    text += '명분과 공정성이 인정받습니다.';
  } else if (star === '천임') {
    text += '신뢰와 정직함이 유리하게 작용합니다.';
  } else if (star === '천예') {
    text += '불리한 상황이 예상됩니다.';
  }

  if (spirit === '직부') {
    text += ' 정의가 승리하고 승소 가능성이 높습니다.';
  } else if (spirit === '육합') {
    text += ' 합의나 조정으로 원만하게 해결될 수 있습니다.';
  } else if (spirit === '백호') {
    text += ' 갈등이 격화되고 장기전이 될 수 있습니다.';
  }

  return text;
}

function generateEducationInterpretation(gate: Gate, star: Star, spirit?: Spirit): string {
  let text = '';

  if (gate === '생문') {
    text += '학습 능력이 향상되고 성적이 오릅니다. ';
  } else if (gate === '개문') {
    text += '새로운 학습이나 교육 시작에 좋습니다. ';
  } else if (gate === '경문') {
    text += '시험이나 발표에서 좋은 결과를 얻습니다. ';
  } else if (gate === '두문') {
    text += '학습에 막힘이 있거나 이해가 어려울 수 있습니다. ';
  }

  if (star === '천보') {
    text += '학습 능력이 뛰어나고 이해가 빠릅니다.';
  } else if (star === '천임') {
    text += '성실하게 공부하면 좋은 결과를 얻습니다.';
  } else if (star === '천영') {
    text += '시험에서 우수한 성적을 거둡니다.';
  } else if (star === '천예') {
    text += '집중력이 떨어지고 성적이 하락할 수 있습니다.';
  }

  if (spirit === '직부') {
    text += ' 합격이나 입학 가능성이 매우 높습니다.';
  } else if (spirit === '육합') {
    text += ' 그룹 스터디나 협력 학습이 효과적입니다.';
  } else if (spirit === '등사') {
    text += ' 시험 불안이나 걱정은 명상으로 극복하세요.';
  }

  return text;
}

// ============================================
// 목적별 추천 행동 생성
// ============================================

export function generateContextualRecommendations(
  palace: PalaceInfo,
  context?: QimenContext,
): string[] {
  const recommendations: string[] = [];
  const weights = getContextWeights(context);

  if (!context || context === 'general') {
    return palace.recommendations;
  }

  // context별 맞춤 추천
  if (context === 'business') {
    if (palace.fortune === 'excellent' || palace.fortune === 'good') {
      recommendations.push('이 시간에 중요한 계약이나 미팅을 잡으세요');
      recommendations.push('신규 거래처 방문이나 영업 활동에 좋습니다');
      recommendations.push('투자 결정이나 사업 확장을 고려하세요');
    }
  } else if (context === 'love') {
    if (palace.fortune === 'excellent' || palace.fortune === 'good') {
      recommendations.push('프로포즈나 고백하기 좋은 시간입니다');
      recommendations.push('데이트를 제안하거나 만남을 가지세요');
      recommendations.push('관계 발전에 대한 대화를 나누세요');
    }
  } else if (context === 'travel') {
    if (palace.fortune === 'excellent' || palace.fortune === 'good') {
      recommendations.push('여행 출발에 좋은 시간입니다');
      recommendations.push('이 방향으로 이동하면 길합니다');
      recommendations.push('중요한 출장이나 업무 여행을 계획하세요');
    }
  }

  return recommendations.length > 0 ? recommendations : palace.recommendations;
}

// ============================================
// AI 프롬프트 생성
// ============================================

/**
 * AI가 답변할 수 있도록 귀문둔갑 정보를 구조화된 프롬프트로 변환
 */
export function generateAIPrompt(
  chart: QimenChart,
  context?: QimenContext,
  userQuestion?: string,
  customer?: Customer | null,
): string {
  const weights = getContextWeights(context);
  const contextLabel = context ? weights.description : '일반적인 상담';

  // 9궁 정보를 간단하게 정리
  const palaceInfo = Object.values(chart.palaces).map(p => {
    const evaluation = evaluateFortuneWithContext(p.gate, p.star, p.spirit, context);
    return `${p.palace}궁(${p.direction}): ${p.gate}, ${p.star}, ${p.spirit || '없음'} - ${evaluation.score}점`;
  }).join(', ');

  // 고객 정보 분석
  let customerInfo = '';
  if (customer) {
    const birthAnalysis = analyzeBirthDate(customer.birth_date);
    const birthYear = parseInt(customer.birth_date.split('-')[0]);
    const birthMonth = parseInt(customer.birth_date.split('-')[1]);
    const birthDay = parseInt(customer.birth_date.split('-')[2]);
    const age = new Date().getFullYear() - birthYear;

    if (birthAnalysis) {
      customerInfo = `

🙋 고객 정보:
- 이름: ${customer.name}님
- 생년월일: ${customer.birth_date} (${customer.lunar_solar === 'lunar' ? '음력' : '양력'})
- 나이: ${age}세
- 생년 천간: ${birthAnalysis.stem}
- 오행: ${birthAnalysis.element}
- 생시: ${customer.birth_time || '미상'}
- 특징: ${birthAnalysis.characteristics.personality}`;
    }
  }

  // 고객 사주 정보 추출 (중복 호출 방지)
  let customerSajuInfo = '';
  if (customer) {
    const birthAnalysis = analyzeBirthDate(customer.birth_date);
    if (birthAnalysis) {
      customerSajuInfo = `${customer.name}님의 사주(생년 천간: ${birthAnalysis.stem}, 오행: ${birthAnalysis.element})와 귀문둔갑을 연결하여`;
    }
  }

  let prompt = `당신은 30년 경력의 귀문둔갑 전문가입니다. ${customer ? customer.name + '님에게' : '고객에게'} 친구처럼 편하게 조언하듯 자연스럽게 대화하세요.
${customerInfo}

📍 현재 귀문둔갑 상황:
- 현재 시간: ${chart.dateTime.toLocaleString('ko-KR')}
- 국(局): ${chart.yinYang === 'yang' ? '양둔' : '음둔'} ${chart.ju}국
- 절기: ${chart.solarTerm.name}
- 전체 기운: ${chart.overallFortune.score}점
- 추천 방위: ${chart.overallFortune.bestPalaces.map(p => chart.palaces[p].direction).join(', ')}
- 주의 방위: ${chart.overallFortune.worstPalaces.map(p => chart.palaces[p].direction).join(', ')}

💬 사용자 질문: "${userQuestion}"

✅ 반드시 지킬 사항:
1. 🌏 순수 한국어만 사용 (한자어 단어는 괜찮지만, 중국어 글자, 영어, 일본어, 아랍어 등 외국어 문자는 절대 금지)
2. 🚫 <think> 태그나 사고 과정 절대 보여주지 말 것
3. 📝 마크다운 형식(#, **, -, 등) 사용하지 말 것
4. 💬 친구에게 말하듯 "~거든요", "~해요", "~네요" 같은 편한 말투 사용
5. 💡 현실적이고 균형 잡힌 조언 제공:
   - 좋은 점만 강조하지 말고 주의할 점도 반드시 언급
   - 낮은 점수(60점 미만) 궁위나 방위는 솔직하게 알려주고 극복 방법 제시
   - "~하면 좋아요"가 아닌 "~해야 합니다", "~주의하세요" 같은 구체적 표현 사용
6. 📋 구체적인 실천 방법 제시:
   - 추상적인 조언 금지 (예: "노력하세요" ❌)
   - 구체적인 행동 지침 제공 (예: "오전 9시-11시 사이 동쪽 방향에서 계약하세요" ✅)
   - ${customerSajuInfo || ''} 시간(예: 오전 9시에서 11시 사이), 방향, 방법을 명확히 제시
7. ⚠️ 위험 요소 명확히 전달:
   - 점수가 낮은 궁위는 어떤 문제가 생길 수 있는지 구체적으로 설명
   - 피해야 할 행동, 조심해야 할 시기와 방위를 명시
8. 🔮 오행 원리로 간단히 이유 설명
9. 📏 400-600자 정도로 충분히 설명

지금 바로 순수 한국어로만 답변을 시작하세요 (외국어 문자 사용 절대 금지):`;

  return prompt;
}

// 헬퍼 함수들
function getSolarTermMeaning(name: string): string {
  const meanings: Record<string, string> = {
    '입춘': '봄의 시작, 만물이 소생하는 시기',
    '우수': '눈이 비로 변하는 때',
    '경칩': '겨울잠 자던 벌레들이 깨어나는 시기',
    '춘분': '낮과 밤의 길이가 같아지는 때',
    '청명': '하늘이 맑고 밝은 봄의 절정',
    '곡우': '봄비가 내려 곡식을 기르는 때',
    '입하': '여름의 시작',
    '소만': '만물이 점차 자라나는 시기',
    '망종': '씨앗을 뿌리기 좋은 때',
    '하지': '일년 중 낮이 가장 긴 날',
    '소서': '더위가 시작되는 때',
    '대서': '더위가 가장 심한 시기',
    '입추': '가을의 시작',
    '처서': '더위가 끝나가는 때',
    '백로': '이슬이 맺히기 시작하는 시기',
    '추분': '낮과 밤의 길이가 같아지는 가을',
    '한로': '찬 이슬이 맺히는 때',
    '상강': '서리가 내리기 시작하는 시기',
    '입동': '겨울의 시작',
    '소설': '첫눈이 내리는 때',
    '대설': '눈이 많이 내리는 시기',
    '동지': '일년 중 밤이 가장 긴 날',
    '소한': '추위가 시작되는 때',
    '대한': '일년 중 가장 추운 시기',
  };
  return meanings[name] || '24절기 중 하나';
}

function getGanZhiMeaning(ganZhi: { gan: string; zhi: string }): string {
  const ganMeanings: Record<string, string> = {
    '갑': '양목(陽木), 큰 나무',
    '을': '음목(陰木), 작은 풀',
    '병': '양화(陽火), 태양',
    '정': '음화(陰火), 등불',
    '무': '양토(陽土), 산',
    '기': '음토(陰土), 밭',
    '경': '양금(陽金), 쇠',
    '신': '음금(陰金), 보석',
    '임': '양수(陽水), 바다',
    '계': '음수(陰水), 빗물',
  };

  const zhiMeanings: Record<string, string> = {
    '자': '쥐띠, 한밤중',
    '축': '소띠, 새벽 1-3시',
    '인': '호랑이띠, 새벽 3-5시',
    '묘': '토끼띠, 아침 5-7시',
    '진': '용띠, 아침 7-9시',
    '사': '뱀띠, 오전 9-11시',
    '오': '말띠, 정오',
    '미': '양띠, 오후 1-3시',
    '신': '원숭이띠, 오후 3-5시',
    '유': '닭띠, 저녁 5-7시',
    '술': '개띠, 저녁 7-9시',
    '해': '돼지띠, 밤 9-11시',
  };

  return `${ganMeanings[ganZhi.gan] || ganZhi.gan}, ${zhiMeanings[ganZhi.zhi] || ganZhi.zhi}`;
}

function getFortuneDescription(fortune: Fortune): string {
  const descriptions: Record<Fortune, string> = {
    'excellent': '대길(大吉) - 모든 일이 순조로운 최상의 시기',
    'good': '길(吉) - 긍정적이고 유리한 흐름',
    'neutral': '평(平) - 안정적이나 큰 변화는 없는 상태',
    'bad': '흉(凶) - 주의가 필요한 시기',
    'terrible': '대흉(大凶) - 매우 불리하니 신중해야 할 때',
  };
  return descriptions[fortune];
}

function getFortuneEmoji(fortune: Fortune): string {
  const emojis: Record<Fortune, string> = {
    'excellent': '🌟',
    'good': '✨',
    'neutral': '⚖️',
    'bad': '⚠️',
    'terrible': '❌',
  };
  return emojis[fortune];
}

function getDirectionEmoji(direction: string): string {
  const emojis: Record<string, string> = {
    '북': '⬆️',
    '남': '⬇️',
    '동': '➡️',
    '서': '⬅️',
    '동북': '↗️',
    '동남': '↘️',
    '서남': '↙️',
    '서북': '↖️',
    '중앙': '⭕',
  };
  return emojis[direction] || '📍';
}
