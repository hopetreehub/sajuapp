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

  // 스프레드별 레이아웃 결정
  const getLayoutClass = () => {
    const count = cardPositions.length;
    if (count === 1) return 'grid-cols-1';
    if (count === 3) return 'grid-cols-3';
    if (count === 5) return 'grid-cols-5';
    if (count === 6) return 'grid-cols-3';
    if (count === 7) return 'grid-cols-4';
    if (count === 10) return 'grid-cols-5'; // Celtic Cross
    if (count === 13) return 'grid-cols-7'; // Year Ahead
    return 'grid-cols-4';
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
      <div className={`grid ${getLayoutClass()} gap-6 justify-items-center`}>
        {cardPositions.map((position) => (
          <div key={position.position} className="flex flex-col items-center space-y-3">
            {/* 위치 라벨 */}
            <div className="text-center px-2 min-h-[60px] flex flex-col justify-center">
              <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                {position.position}. {position.positionName}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500 leading-tight">
                {position.positionMeaning}
              </div>
            </div>

            {/* 타로 카드 */}
            <TarotCardComponent
              card={position.card}
              isReversed={position.isReversed}
              isFlipped={flippedCards.has(position.position)}
              onClick={() => handleCardClick(position)}
              className="w-40 h-64"
            />
          </div>
        ))}
      </div>

      {/* 모든 카드 뒤집기 버튼 */}
      <div className="flex justify-center gap-4 mt-6">
        <button
          onClick={() => {
            const allPositions = new Set(cardPositions.map((cp) => cp.position));
            setFlippedCards(allPositions);
          }}
          className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-md"
        >
          모든 카드 펼치기
        </button>
        <button
          onClick={() => setFlippedCards(new Set())}
          className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all shadow-md"
        >
          모든 카드 뒤집기
        </button>
      </div>

      {/* 선택된 카드 상세 정보 */}
      {selectedCard && flippedCards.has(selectedCard.position) && (
        <div className="mt-8">
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
