/**
 * 타로 스프레드 표시 컴포넌트
 * 선택한 스프레드에 따라 카드를 배치하고 표시
 */

import React, { useState } from 'react';
import TarotCardComponent, { TarotCardDetail } from './TarotCard';
import type { TarotCardPosition } from '@/utils/tarotSpread';

interface TarotSpreadViewProps {
  cardPositions: TarotCardPosition[];
  spreadName: string;
  spreadDescription: string;
  onCardClick?: (position: TarotCardPosition) => void;
}

export default function TarotSpreadView({
  cardPositions,
  spreadName,
  spreadDescription,
  onCardClick,
}: TarotSpreadViewProps) {
  const [selectedCard, setSelectedCard] = useState<TarotCardPosition | null>(null);
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());

  const handleCardClick = (position: TarotCardPosition) => {
    // 카드 뒤집기
    setFlippedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(position.position)) {
        newSet.delete(position.position);
      } else {
        newSet.add(position.position);
      }
      return newSet;
    });

    setSelectedCard(position);
    onCardClick?.(position);
  };

  // 스프레드별 레이아웃 결정 (반응형)
  const getLayoutClass = () => {
    const count = cardPositions.length;
    if (count === 1) return 'grid-cols-1';
    if (count === 3) return 'grid-cols-1 sm:grid-cols-3';
    if (count === 5) return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5';
    if (count === 6) return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3';
    if (count === 7) return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
    if (count === 10) return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5'; // Celtic Cross
    if (count === 13) return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7'; // Year Ahead
    return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
  };

  return (
    <div className="space-y-6">
      {/* 스프레드 헤더 */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {spreadName}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">{spreadDescription}</p>
      </div>

      {/* 카드 그리드 */}
      <div className={`grid ${getLayoutClass()} gap-8 justify-items-center`}>
        {cardPositions.map((position) => (
          <div key={position.position} className="flex flex-col items-center space-y-4 max-w-[180px]">
            {/* 위치 라벨 - 카드 위 */}
            <div className="text-center px-3 py-2 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg w-full">
              <div className="text-sm font-bold text-purple-700 dark:text-purple-300 mb-1">
                {position.position}. {position.positionName}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 leading-tight">
                {position.positionMeaning}
              </div>
            </div>

            {/* 타로 카드 */}
            <TarotCardComponent
              card={position.card}
              isReversed={position.isReversed}
              isFlipped={flippedCards.has(position.position)}
              onClick={() => handleCardClick(position)}
              className="w-40 h-64 shadow-xl"
            />

            {/* 카드 정보 - 카드 아래 (펼쳐졌을 때만 표시) */}
            {flippedCards.has(position.position) && (
              <div className="text-center px-2 py-1 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 w-full">
                <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate">
                  {position.card.nameKo}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                  {position.isReversed ? '역방향 ↓' : '정방향 ↑'}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 모든 카드 뒤집기 버튼 - 카드와 충분한 간격 확보 */}
      <div className="mt-24 mb-12 pt-8 border-t-2 border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row justify-center gap-6 px-4">
          <button
            onClick={() => {
              const allPositions = new Set(cardPositions.map((cp) => cp.position));
              setFlippedCards(allPositions);
            }}
            className="px-10 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-lg font-bold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all shadow-2xl hover:shadow-3xl hover:scale-105 transform relative z-10"
          >
            🔓 모든 카드 펼치기
          </button>
          <button
            onClick={() => setFlippedCards(new Set())}
            className="px-10 py-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white text-lg font-bold rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all shadow-2xl hover:shadow-3xl hover:scale-105 transform relative z-10"
          >
            🔒 모든 카드 뒤집기
          </button>
        </div>
      </div>

      {/* 선택된 카드 상세 정보 */}
      {selectedCard && flippedCards.has(selectedCard.position) && (
        <div className="mt-12 pt-8 border-t-4 border-purple-200 dark:border-purple-800">
          <div className="mb-4 text-center">
            <h3 className="text-xl font-bold text-purple-600 dark:text-purple-400">
              📖 선택한 카드 상세 정보
            </h3>
          </div>
          <TarotCardDetail
            card={selectedCard.card}
            isReversed={selectedCard.isReversed}
            positionName={selectedCard.positionName}
            positionMeaning={selectedCard.positionMeaning}
          />
        </div>
      )}
    </div>
  );
}
