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

type Stage = 'select-spread' | 'enter-question' | 'drawing-cards' | 'show-result';

export default function TarotPage() {
  const [stage, setStage] = useState<Stage>('select-spread');
  const [selectedSpreadId, setSelectedSpreadId] = useState<string>('');
  const [userQuestion, setUserQuestion] = useState<string>('');
  const [cardPositions, setCardPositions] = useState<TarotCardPosition[]>([]);
  const [aiInterpretation, setAiInterpretation] = useState<string>('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);

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
        }),
      });

      if (!response.ok) {
        throw new Error('AI 해석 요청 실패');
      }

      const data = await response.json();

      if (data.success) {
        setAiInterpretation(data.response);
      } else {
        throw new Error(data.error || 'AI 해석 실패');
      }
    } catch (error) {
      console.error('[타로 AI] Error:', error);
      alert('AI 해석을 가져오는 중 오류가 발생했습니다');
    } finally {
      setIsLoadingAI(false);
    }
  };

  // 처음으로 돌아가기
  const resetReading = () => {
    setStage('select-spread');
    setSelectedSpreadId('');
    setUserQuestion('');
    setCardPositions([]);
    setAiInterpretation('');
  };

  const selectedSpread = TAROT_SPREADS.find((s) => s.id === selectedSpreadId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            🔮 타로 카드 점술
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            마음을 가다듬고 질문을 떠올려보세요
          </p>
        </div>

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
            {/* 질문 표시 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                당신의 질문
              </h3>
              <p className="text-gray-700 dark:text-gray-300">{userQuestion}</p>
            </div>

            {/* 타로 스프레드 표시 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <TarotSpreadView
                cardPositions={cardPositions}
                spreadName={selectedSpread.nameKo}
                spreadDescription={selectedSpread.description}
              />
            </div>

            {/* AI 해석 요청 버튼 */}
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

            {/* AI 해석 결과 */}
            {aiInterpretation && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span>🤖</span>
                  <span>AI 타로 해석</span>
                </h3>
                <div className="prose dark:prose-invert max-w-none">
                  <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200">
                    {aiInterpretation}
                  </div>
                </div>
              </div>
            )}

            {/* 하단 버튼 */}
            <div className="flex justify-center gap-4">
              <button
                onClick={resetReading}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all"
              >
                처음으로
              </button>
              {aiInterpretation && (
                <button
                  onClick={() => window.print()}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
                >
                  결과 인쇄하기
                </button>
              )}
            </div>
          </div>
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
