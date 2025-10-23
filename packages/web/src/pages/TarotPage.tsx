/**
 * 타로 카드 점술 페이지
 * 사용자가 스프레드를 선택하고, 질문을 입력하고, 카드를 뽑아 해석을 받는 메인 페이지
 */

import React, { useState } from 'react';
import { drawMultipleCards } from '@/data/tarotCards';
import {
  TAROT_SPREADS,
  performSpread,
  generateSpreadPrompt,
  type TarotCardPosition,
} from '@/utils/tarotSpread';
import TarotSpreadView from '@/components/tarot/TarotSpreadView';
import TarotHistoryView from '@/components/tarot/TarotHistoryView';
import { saveTarotReading, getTarotReadings as _getTarotReadings } from '@/utils/tarotStorage';
import { exportTarotReadingToPDF, formatDateForFilename } from '@/utils/pdfExport';

type Stage = 'select-spread' | 'enter-question' | 'drawing-cards' | 'show-result';

export default function TarotPage() {
  const [stage, setStage] = useState<Stage>('select-spread');
  const [selectedSpreadId, setSelectedSpreadId] = useState<string>('');
  const [userQuestion, setUserQuestion] = useState<string>('');
  const [cardPositions, setCardPositions] = useState<TarotCardPosition[]>([]);
  const [aiInterpretation, setAiInterpretation] = useState<string>('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // 1단계: 스프레드 선택
  const handleSpreadSelect = (spreadId: string) => {
    setSelectedSpreadId(spreadId);
    setStage('enter-question');
  };

  // 2단계: 질문 입력 완료
  const handleQuestionSubmit = () => {
    if (!userQuestion.trim()) {
      alert('질문을 입력해주세요');
      return;
    }
    setStage('drawing-cards');
    performCardDrawing();
  };

  // 3단계: 카드 뽑기 및 배치
  const performCardDrawing = () => {
    const spread = TAROT_SPREADS.find((s) => s.id === selectedSpreadId);
    if (!spread) return;

    // 카드 뽑기
    const drawnCards = drawMultipleCards(spread.cardCount);

    // 스프레드 실행
    const positions = performSpread(selectedSpreadId, drawnCards);
    if (!positions) {
      alert('카드 배치에 실패했습니다');
      return;
    }

    setCardPositions(positions);

    // 애니메이션 효과를 위한 지연
    setTimeout(() => {
      setStage('show-result');
    }, 1000);
  };

  // AI 해석 요청
  const requestAIInterpretation = async () => {
    if (cardPositions.length === 0) return;

    setIsLoadingAI(true);
    setAiInterpretation('');

    try {
      const prompt = generateSpreadPrompt(selectedSpreadId, cardPositions, userQuestion);

      const response = await fetch('/api/v1/tarot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          userQuestion,
          cardCount: cardPositions.length,
        }),
      });

      if (!response.ok) {
        console.warn('[타로 AI] AI 서비스 응답 실패, fallback 해석 사용');
        throw new Error('AI 해석 요청 실패');
      }

      const data = await response.json();

      if (data.success) {
        setAiInterpretation(data.response);

        // 타로 기록 저장
        const spread = TAROT_SPREADS.find(s => s.id === selectedSpreadId);
        if (spread) {
          saveTarotReading({
            userId: 1, // TODO: 실제 사용자 ID로 변경
            spreadId: selectedSpreadId,
            spreadName: spread.nameKo,
            question: userQuestion,
            cards: cardPositions,
            aiInterpretation: data.response,
          });
          console.log('[타로 기록] 저장 완료');
        }
      } else {
        throw new Error(data.error || 'AI 해석 실패');
      }
    } catch (error) {
      console.error('[타로 AI] Error:', error);

      // Fallback: 기본 해석 제공
      const spread = TAROT_SPREADS.find(s => s.id === selectedSpreadId);
      const fallbackInterpretation = generateFallbackInterpretation(cardPositions, userQuestion, spread?.nameKo || '');
      setAiInterpretation(fallbackInterpretation);

      console.log('[타로 AI] Fallback 해석 사용');
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Fallback 해석 생성 함수 - 향상된 버전
  const generateFallbackInterpretation = (
    positions: TarotCardPosition[],
    question: string,
    spreadName: string,
  ): string => {
    let interpretation = `📖 **${spreadName}** 타로 해석\n\n`;
    interpretation += `💭 **질문**: ${question}\n\n`;
    interpretation += '⚠️ *AI 서비스가 일시적으로 사용 불가능하여 심화 해석을 제공합니다.*\n\n';
    interpretation += '---\n\n';

    // 1. 각 카드 상세 해석
    interpretation += '## 🎴 카드별 상세 해석\n\n';
    positions.forEach((pos, index) => {
      const orientation = pos.isReversed ? '역방향 ↓' : '정방향 ↑';
      const meaning = pos.isReversed ? pos.card.reversedMeaning : pos.card.uprightMeaning;
      const keywords = pos.isReversed ? pos.card.reversedKeywords : pos.card.uprightKeywords;

      interpretation += `### ${index + 1}. ${pos.positionName}: ${pos.card.nameKo} (${orientation})\n\n`;
      interpretation += `**위치의 의미**: ${pos.positionMeaning}\n\n`;
      interpretation += `**카드 해석**: ${meaning}\n\n`;
      interpretation += `**핵심 키워드**: ${keywords.join(' · ')}\n\n`;

      // 위치별 맥락 추가
      interpretation += '**이 위치에서의 메시지**: ';
      interpretation += generatePositionContext(pos, question);
      interpretation += '\n\n---\n\n';
    });

    // 2. 카드 조합 분석
    interpretation += '## 🔗 카드 조합 분석\n\n';
    interpretation += generateCombinationAnalysis(positions, question);
    interpretation += '\n\n';

    // 3. 스프레드별 종합 해석
    interpretation += '## 🌟 종합 해석\n\n';
    interpretation += generateOverallInterpretation(positions, spreadName, question);
    interpretation += '\n\n';

    // 4. 실천적 조언
    interpretation += '## 💡 실천적 조언\n\n';
    interpretation += generatePracticalAdvice(positions, question);
    interpretation += '\n\n';

    // 5. 타이밍과 주의사항
    interpretation += '## ⏰ 타이밍 가이드\n\n';
    interpretation += generateTimingGuidance(positions);
    interpretation += '\n\n';

    interpretation += '---\n\n';
    interpretation += '🔮 **마무리 메시지**\n\n';
    interpretation += '타로는 당신의 내면에 이미 존재하는 지혜를 끌어내는 거울입니다. ';
    interpretation += '이 카드들은 현재 상황의 에너지를 반영하며, 당신이 더 나은 선택을 할 수 있도록 안내합니다. ';
    interpretation += '운명은 정해진 것이 아니라 당신의 의지와 행동으로 만들어가는 것임을 기억하세요.\n\n';
    interpretation += '✨ 이 해석이 당신의 여정에 빛이 되기를 바랍니다.';

    return interpretation;
  };

  // 위치별 맥락 생성
  const generatePositionContext = (pos: TarotCardPosition, _question: string): string => {
    const isReversed = pos.isReversed;
    const suit = pos.card.suit;

    // 메이저 vs 마이너 아르카나 구분
    if (suit === 'major') {
      if (isReversed) {
        return '중요한 전환점이나 큰 흐름이 지연되거나 내면화되고 있습니다. 외적 변화보다는 내적 성찰이 필요한 시기입니다.';
      } else {
        return '인생의 중요한 국면이나 큰 흐름을 나타냅니다. 이는 피할 수 없는 중요한 메시지이자 성장의 기회입니다.';
      }
    } else {
      // 마이너 아르카나 - 원소별 해석
      if (suit === 'wands') {
        return isReversed
          ? '열정과 행동의 에너지가 차단되거나 방향을 잃었습니다. 동기를 재점검할 필요가 있습니다.'
          : '창의성과 열정, 행동력이 필요한 영역입니다. 적극적으로 나아가세요.';
      } else if (suit === 'cups') {
        return isReversed
          ? '감정적 균형이 깨지거나 관계에서 어려움을 겪고 있습니다. 감정을 돌아볼 시간입니다.'
          : '감정, 관계, 직관의 영역입니다. 마음의 소리에 귀 기울이세요.';
      } else if (suit === 'swords') {
        return isReversed
          ? '사고와 논리가 혼란스럽거나 과도한 걱정에 사로잡혀 있습니다. 명료함이 필요합니다.'
          : '이성적 판단과 결단이 필요한 시기입니다. 진실을 직시하세요.';
      } else if (suit === 'pentacles') {
        return isReversed
          ? '물질적 안정이나 실용적 계획에 문제가 있습니다. 재정비가 필요합니다.'
          : '현실적이고 물질적인 측면을 다룹니다. 실용적 접근이 효과적입니다.';
      }
    }
    return '이 카드는 현재 상황에서 중요한 역할을 하고 있습니다.';
  };

  // 카드 조합 분석
  const generateCombinationAnalysis = (positions: TarotCardPosition[], _question: string): string => {
    if (positions.length === 1) {
      return `단일 카드 리딩에서 ${positions[0].card.nameKo}는 현재 상황의 핵심을 명확히 보여줍니다. 이 카드의 메시지에 집중하세요.`;
    }

    let analysis = '';
    const majorCount = positions.filter(p => p.card.suit === 'major').length;
    const reversedCount = positions.filter(p => p.isReversed).length;

    // 메이저 아르카나 비율 분석
    if (majorCount >= positions.length * 0.6) {
      analysis += `🌟 **중요도**: 메이저 아르카나가 ${majorCount}장 나왔습니다. 이는 현재 상황이 인생의 중요한 전환점이거나 큰 의미를 가진 시기임을 나타냅니다. 우주가 당신에게 중요한 메시지를 전하고 있습니다.\n\n`;
    } else if (majorCount === 0) {
      analysis += '📊 **일상적 영역**: 모든 카드가 마이너 아르카나입니다. 이는 일상적이고 관리 가능한 상황을 나타내며, 당신의 선택과 노력으로 충분히 개선할 수 있는 영역입니다.\n\n';
    }

    // 역방향 비율 분석
    if (reversedCount >= positions.length * 0.6) {
      analysis += `⚠️ **에너지 흐름**: ${reversedCount}장의 역방향 카드는 현재 에너지가 내면으로 향하고 있거나, 외적 진행에 장애가 있음을 시사합니다. 서두르기보다는 성찰과 재정비가 필요한 시기입니다.\n\n`;
    } else if (reversedCount === 0) {
      analysis += '✨ **순조로운 흐름**: 모든 카드가 정방향입니다. 에너지가 순조롭게 흐르고 있으며, 상황이 비교적 명확하고 진행 중입니다.\n\n';
    }

    // 3장 이상일 때 시작-중간-끝 패턴 분석
    if (positions.length >= 3) {
      const first = positions[0];
      const _middle = positions[Math.floor(positions.length / 2)];
      const last = positions[positions.length - 1];

      analysis += '🔄 **흐름 패턴**: ';
      if (first.isReversed && !last.isReversed) {
        analysis += '어려운 시작에서 긍정적 결말로 이어지는 상승 곡선을 보입니다. 초기의 어려움을 극복하면 좋은 결과를 얻을 수 있습니다.';
      } else if (!first.isReversed && last.isReversed) {
        analysis += '좋은 시작이지만 결과에 주의가 필요합니다. 과신하지 말고 신중하게 마무리해야 합니다.';
      } else if (!first.isReversed && !last.isReversed) {
        analysis += '전반적으로 긍정적인 흐름입니다. 현재의 방향을 유지하세요.';
      } else {
        analysis += '도전적인 상황이지만, 이는 성장의 기회입니다. 인내심을 가지고 접근하세요.';
      }
      analysis += '\n\n';
    }

    return analysis;
  };

  // 종합 해석
  const generateOverallInterpretation = (positions: TarotCardPosition[], spreadName: string, _question: string): string => {
    const hasReversed = positions.some(p => p.isReversed);
    const allReversed = positions.every(p => p.isReversed);
    const _hasMajor = positions.some(p => p.card.suit === 'major');

    let overall = '';

    // 스프레드별 맞춤 해석
    if (spreadName.includes('원 카드') || positions.length === 1) {
      overall += '이 하나의 카드는 지금 당신이 가장 주목해야 할 핵심 메시지를 담고 있습니다. ';
      overall += hasReversed
        ? '역방향으로 나온 만큼, 외적 행동보다는 내면의 통찰과 재고가 필요한 시점입니다.'
        : '정방향으로 나타난 명확한 에너지를 받아들이고 그 방향으로 나아가세요.';
    } else if (spreadName.includes('과거현재미래') || spreadName.includes('쓰리 카드')) {
      overall += '과거의 영향이 현재에 어떻게 작용하고 있으며, 어떤 미래가 펼쳐질지 보여줍니다. ';
      if (positions.length >= 3) {
        overall += `${positions[0].card.nameKo}의 과거 에너지가 ${positions[1].card.nameKo}의 현재 상황을 만들었고, `;
        overall += `${positions[2].card.nameKo}는 이 흐름이 향하는 방향을 시사합니다.`;
      }
    } else if (spreadName.includes('켈틱')) {
      overall += '켈틱 크로스는 상황을 다각도로 분석하는 가장 포괄적인 스프레드입니다. ';
      overall += '현재 상황의 핵심부터 주변 환경, 내면의 상태, 최종 결과까지 전체적인 그림을 제공합니다.';
    } else if (spreadName.includes('관계')) {
      overall += '관계의 역학과 각 당사자의 감정, 그리고 관계의 방향성을 보여줍니다. ';
      overall += '두 에너지가 어떻게 상호작용하는지 주목하세요.';
    } else if (spreadName.includes('진로') || spreadName.includes('커리어')) {
      overall += '직업과 커리어 경로에 대한 통찰을 제공합니다. ';
      overall += '당신의 재능, 장애물, 기회를 종합적으로 보여주며 실용적 결정을 돕습니다.';
    } else {
      overall += '뽑힌 카드들의 조합은 현재 상황의 다층적 면모를 드러냅니다.';
    }

    overall += '\n\n';

    // 에너지 방향 종합
    if (allReversed) {
      overall += '모든 카드가 역방향이라는 것은 큰 의미를 지닙니다. 지금은 외부로 향하기보다 내면을 돌아보고, ';
      overall += '기존의 접근 방식을 재평가할 시기입니다. 급하게 행동하지 말고 충분한 성찰 시간을 가지세요.';
    } else if (!hasReversed) {
      overall += '모든 카드가 정방향으로 나타나 에너지가 명확하고 순조롭게 흐르고 있습니다. ';
      overall += '당신의 의도와 우주의 흐름이 일치하고 있으니, 자신감을 가지고 나아가세요.';
    } else {
      overall += '정방향과 역방향 카드가 함께 나타나 균형 잡힌 시각을 제공합니다. ';
      overall += '어떤 영역은 순조롭게 진행되고 있지만, 어떤 영역은 재고가 필요합니다.';
    }

    return overall;
  };

  // 실천적 조언
  const generatePracticalAdvice = (positions: TarotCardPosition[], _question: string): string => {
    let advice = '';
    const keywords = positions.flatMap(p =>
      p.isReversed ? p.card.reversedKeywords : p.card.uprightKeywords,
    );

    // 키워드 분석을 통한 조언
    if (keywords.some(k => k.includes('행동') || k.includes('열정') || k.includes('도전'))) {
      advice += '✅ **행동하기**: 생각만 하지 말고 구체적인 첫걸음을 내디디세요. 작은 행동이 큰 변화를 만듭니다.\n\n';
    }

    if (keywords.some(k => k.includes('대기') || k.includes('인내') || k.includes('수용'))) {
      advice += '⏸️ **기다리기**: 서두르지 마세요. 때로는 기다림이 가장 현명한 행동입니다. 상황이 자연스럽게 무르익도록 하세요.\n\n';
    }

    if (keywords.some(k => k.includes('소통') || k.includes('표현') || k.includes('대화'))) {
      advice += '💬 **소통하기**: 마음속 생각을 솔직하게 표현하세요. 대화는 오해를 풀고 관계를 개선하는 열쇠입니다.\n\n';
    }

    if (keywords.some(k => k.includes('계획') || k.includes('전략') || k.includes('준비'))) {
      advice += '📋 **계획하기**: 치밀한 준비와 계획이 성공의 기초입니다. 세부사항을 점검하고 체계적으로 접근하세요.\n\n';
    }

    if (keywords.some(k => k.includes('직관') || k.includes('감정') || k.includes('마음'))) {
      advice += '💖 **마음 듣기**: 논리보다 직관을, 머리보다 가슴의 소리에 귀 기울이세요. 당신의 내면은 이미 답을 알고 있습니다.\n\n';
    }

    // 역방향이 많을 경우
    const reversedCount = positions.filter(p => p.isReversed).length;
    if (reversedCount > positions.length / 2) {
      advice += '🔄 **재정비**: 현재 방식이 효과적이지 않다는 신호입니다. 접근법을 바꾸거나, 휴식을 취하거나, 계획을 수정하세요.\n\n';
    }

    if (advice === '') {
      advice = '카드가 제시하는 방향을 존중하되, 최종 선택은 당신의 자유의지에 달려 있습니다. 두려움보다는 지혜로, 충동보다는 깊은 성찰로 결정하세요.';
    }

    return advice;
  };

  // 타이밍 가이드
  const generateTimingGuidance = (positions: TarotCardPosition[]): string => {
    const hasAces = positions.some(p => p.card.name.includes('Ace'));
    const hasCompletion = positions.some(p =>
      p.card.name.includes('World') ||
      p.card.name.includes('Ten') ||
      p.card.name.includes('Wheel'),
    );
    const reversedCount = positions.filter(p => p.isReversed).length;

    let timing = '';

    if (hasAces && !hasCompletion) {
      timing += '🌱 **시작의 시기**: 새로운 시작과 기회의 에너지가 감지됩니다. 앞으로 1-3개월 내에 중요한 시작이나 기회가 찾아올 수 있습니다.\n\n';
    } else if (hasCompletion) {
      timing += '🎯 **완성의 시기**: 한 사이클이 마무리되고 있습니다. 수확의 시기이거나, 곧 새로운 국면으로 전환될 것입니다.\n\n';
    }

    if (reversedCount > positions.length / 2) {
      timing += '⏳ **대기 권장**: 지금은 급하게 진행하기보다는 준비와 숙고의 시간입니다. 몇 주에서 몇 달의 여유를 가지세요.\n\n';
    } else if (reversedCount === 0) {
      timing += '⚡ **즉시 행동**: 에너지가 활발하게 움직이고 있습니다. 지금이 바로 행동할 때입니다. 기회를 놓치지 마세요.\n\n';
    }

    timing += '📅 **다시 점검할 시기**: 이 리딩의 에너지는 대략 3개월 정도 유효합니다. 그 이후에는 상황이 변화할 수 있으니, 필요하다면 다시 타로에 질문하세요.';

    return timing;
  };

  // 처음으로 돌아가기
  const resetReading = () => {
    setStage('select-spread');
    setSelectedSpreadId('');
    setUserQuestion('');
    setCardPositions([]);
    setAiInterpretation('');
  };

  // PDF 다운로드
  const handleDownloadPDF = async () => {
    try {
      if (!selectedSpread) return;
      const date = formatDateForFilename();
      await exportTarotReadingToPDF(selectedSpread.nameKo, userQuestion, date);
      alert('PDF 다운로드가 완료되었습니다!');
    } catch (error) {
      console.error('[PDF] Error:', error);
      alert('PDF 생성 중 오류가 발생했습니다.');
    }
  };

  const selectedSpread = TAROT_SPREADS.find((s) => s.id === selectedSpreadId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8 relative">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="absolute right-0 top-0 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all"
          >
            {showHistory ? '타로 보기' : '📜 기록 보기'}
          </button>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            🔮 타로 카드 점술
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            마음을 가다듬고 질문을 떠올려보세요
          </p>
        </div>

        {/* 기록 보기 화면 */}
        {showHistory && (
          <TarotHistoryView onClose={() => setShowHistory(false)} />
        )}

        {/* 타로 점술 화면 */}
        {!showHistory && (
          <>
            {/* 진행 상태 표시 */}
            <div className="mb-8">
              <div className="flex justify-center items-center gap-4">
                <StageIndicator
                  label="스프레드 선택"
                  isActive={stage === 'select-spread'}
                  isCompleted={['enter-question', 'drawing-cards', 'show-result'].includes(stage)}
                />
                <div className="w-12 h-0.5 bg-gray-300 dark:bg-gray-700" />
                <StageIndicator
                  label="질문 입력"
                  isActive={stage === 'enter-question'}
                  isCompleted={['drawing-cards', 'show-result'].includes(stage)}
                />
                <div className="w-12 h-0.5 bg-gray-300 dark:bg-gray-700" />
                <StageIndicator
                  label="카드 뽑기"
                  isActive={stage === 'drawing-cards'}
                  isCompleted={stage === 'show-result'}
                />
                <div className="w-12 h-0.5 bg-gray-300 dark:bg-gray-700" />
                <StageIndicator label="결과 확인" isActive={stage === 'show-result'} isCompleted={false} />
              </div>
            </div>

        {/* 1단계: 스프레드 선택 */}
        {stage === 'select-spread' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              타로 스프레드를 선택하세요
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {TAROT_SPREADS.map((spread) => (
                <button
                  key={spread.id}
                  onClick={() => handleSpreadSelect(spread.id)}
                  className="p-4 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-lg hover:shadow-md transition-all text-left"
                >
                  <div className="font-bold text-gray-900 dark:text-white mb-2">
                    {spread.nameKo}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {spread.description}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">
                    카드 수: {spread.cardCount}장
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 2단계: 질문 입력 */}
        {stage === 'enter-question' && selectedSpread && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              질문을 입력하세요
            </h2>
            <div className="mb-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                선택한 스프레드: <span className="font-semibold">{selectedSpread.nameKo}</span> (
                {selectedSpread.cardCount}장)
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-500">
                {selectedSpread.description}
              </div>
            </div>

            <textarea
              value={userQuestion}
              onChange={(e) => setUserQuestion(e.target.value)}
              placeholder="예: 이번 달 사업이 잘 될까요?"
              className="w-full h-32 p-4 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />

            {/* 질문 예제 */}
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
                      className="px-3 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg text-sm hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between mt-4">
              <button
                onClick={() => setStage('select-spread')}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all"
              >
                뒤로
              </button>
              <button
                onClick={handleQuestionSubmit}
                disabled={!userQuestion.trim()}
                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                카드 뽑기
              </button>
            </div>
          </div>
        )}

        {/* 3단계: 카드 뽑는 중 */}
        {stage === 'drawing-cards' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4 animate-pulse">🔮</div>
            <div className="text-xl font-semibold text-gray-900 dark:text-white">
              카드를 뽑고 있습니다...
            </div>
          </div>
        )}

        {/* 4단계: 결과 표시 */}
        {stage === 'show-result' && selectedSpread && cardPositions.length > 0 && (
          <div className="space-y-8">
            {/* 타로 카드 시각적 표시 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <TarotSpreadView
                cardPositions={cardPositions}
                spreadName={selectedSpread.nameKo}
                spreadDescription={selectedSpread.description}
              />
            </div>

            {/* PDF 출력용 컨테이너 */}
            <div
              id="tarot-reading-content"
              className="space-y-6 bg-white dark:bg-gray-900 p-8"
              style={{
                /* PDF 출력 최적화 스타일 */
                WebkitPrintColorAdjust: 'exact',
                printColorAdjust: 'exact',
              }}
            >
              {/* 헤더 정보 (PDF용) */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border-2 border-purple-200 dark:border-purple-700 p-8 mb-6">
                <h2 className="text-3xl font-bold text-center text-purple-700 dark:text-purple-300 mb-3">
                  🔮 타로 카드 상담 결과
                </h2>
                <div className="text-center text-gray-700 dark:text-gray-300 text-lg mb-3">
                  {new Date().toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'long',
                  })}
                </div>
                <div className="text-center text-purple-600 dark:text-purple-400 font-semibold">
                  {selectedSpread.nameKo} | {selectedSpread.description}
                </div>
              </div>

              {/* 질문 표시 */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl border-l-4 border-blue-500 p-6 mb-6">
                <h3 className="text-xl font-bold text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2">
                  <span>💭</span>
                  <span>당신의 질문</span>
                </h3>
                <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed">
                  {userQuestion}
                </p>
              </div>

              {/* 타로 카드 상세 정보 (PDF용) */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  🎴 뽑힌 카드들
                </h3>
                <div className="space-y-4">
                  {cardPositions.map((pos, index) => {
                    const orientation = pos.isReversed ? '역방향 ↓' : '정방향 ↑';
                    const meaning = pos.isReversed ? pos.card.reversedMeaning : pos.card.uprightMeaning;
                    const keywords = pos.isReversed ? pos.card.reversedKeywords : pos.card.uprightKeywords;

                    return (
                      <div
                        key={index}
                        className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                            {index + 1}. {pos.positionName}
                          </h4>
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            pos.isReversed
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                              : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          }`}>
                            {orientation}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {pos.positionMeaning}
                        </div>
                        <div className="mb-3">
                          <span className="text-purple-700 dark:text-purple-300 font-bold text-lg">
                            {pos.card.nameKo}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400 ml-2">
                            ({pos.card.name})
                          </span>
                        </div>
                        <div className="mb-2">
                          <strong className="text-gray-700 dark:text-gray-300">의미:</strong>
                          <span className="text-gray-800 dark:text-gray-200 ml-2">{meaning}</span>
                        </div>
                        <div>
                          <strong className="text-gray-700 dark:text-gray-300">키워드:</strong>
                          <span className="text-gray-600 dark:text-gray-400 ml-2">
                            {keywords.join(', ')}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* AI 해석 결과 */}
              {aiInterpretation && (
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl border-2 border-amber-200 dark:border-amber-700 p-6">
                  <h3 className="text-2xl font-bold text-amber-800 dark:text-amber-300 mb-4 flex items-center gap-2">
                    <span>🤖</span>
                    <span>AI 타로 해석</span>
                  </h3>
                  <div className="text-gray-900 dark:text-gray-100 overflow-hidden break-words whitespace-pre-line leading-relaxed">
                    {aiInterpretation}
                  </div>
                </div>
              )}

              {/* PDF 푸터 */}
              <div className="mt-8 pt-6 border-t-2 border-gray-200 dark:border-gray-700 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  이 타로 리딩은 참고용이며, 최종 결정은 본인의 판단에 따라 이루어져야 합니다.
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                  Generated by 운명나침반 Tarot System
                </p>
              </div>
            </div>

            {/* AI 해석 요청 버튼 (PDF 출력 대상 아님) */}
            {!aiInterpretation && (
              <div className="flex justify-center">
                <button
                  onClick={requestAIInterpretation}
                  disabled={isLoadingAI}
                  className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-lg font-semibold rounded-full hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoadingAI ? '🤖 AI가 해석 중...' : '🤖 AI 해석 받기'}
                </button>
              </div>
            )}

            {/* 하단 버튼 (PDF 출력 대상 아님) */}
            <div className="flex justify-center gap-4">
              <button
                onClick={resetReading}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all"
              >
                처음으로
              </button>
              {aiInterpretation && (
                <button
                  onClick={handleDownloadPDF}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all flex items-center gap-2"
                >
                  📄 PDF 다운로드
                </button>
              )}
            </div>
          </div>
        )}
          </>
        )}
      </div>
    </div>
  );
}

/**
 * 진행 단계 표시 컴포넌트
 */
function StageIndicator({
  label,
  isActive,
  isCompleted,
}: {
  label: string;
  isActive: boolean;
  isCompleted: boolean;
}) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
          isCompleted
            ? 'bg-green-500 text-white'
            : isActive
            ? 'bg-purple-500 text-white'
            : 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
        }`}
      >
        {isCompleted ? '✓' : isActive ? '•' : '○'}
      </div>
      <div
        className={`text-xs mt-2 ${
          isActive || isCompleted
            ? 'text-gray-900 dark:text-white font-semibold'
            : 'text-gray-500 dark:text-gray-500'
        }`}
      >
        {label}
      </div>
    </div>
  );
}
