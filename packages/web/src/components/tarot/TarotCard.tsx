/**
 * 타로 카드 컴포넌트
 * 개별 타로 카드를 표시하는 컴포넌트
 */

import React from 'react';
import type { TarotCard } from '@/data/tarotCards';

interface TarotCardProps {
  card: TarotCard;
  isReversed?: boolean;
  isFlipped?: boolean;
  onClick?: () => void;
  className?: string;
}

export default function TarotCardComponent({
  card,
  isReversed = false,
  isFlipped = false,
  onClick,
  className = '',
}: TarotCardProps) {
  const orientation = isReversed ? '역방향' : '정방향';
  const meaning = isReversed ? card.reversedMeaning : card.uprightMeaning;
  const keywords = isReversed ? card.reversedKeywords : card.uprightKeywords;

  // 슈트별 색상
  const suitColors = {
    major: 'from-purple-500 to-pink-500',
    wands: 'from-red-500 to-orange-500',
    cups: 'from-blue-500 to-cyan-500',
    swords: 'from-gray-600 to-slate-800',
    pentacles: 'from-yellow-600 to-amber-700',
  };

  const bgGradient = suitColors[card.suit];

  return (
    <div
      onClick={onClick}
      className={`relative cursor-pointer transition-all duration-500 transform hover:scale-105 ${className}`}
      style={{
        transformStyle: 'preserve-3d',
        transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
      }}
    >
      {/* 카드 뒷면 */}
      <div
        className="absolute inset-0 rounded-xl shadow-lg overflow-hidden"
        style={{
          backfaceVisibility: 'hidden',
        }}
      >
        <img
          src="/image/back/back.webp"
          alt="타로 카드 뒷면"
          className="w-full h-full object-cover"
        />
      </div>

      {/* 카드 앞면 */}
      <div
        className={`bg-white rounded-xl shadow-lg border-2 border-gray-300 overflow-hidden ${
          isReversed ? 'rotate-180' : ''
        }`}
        style={{
          backfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)',
        }}
      >
        <div className={`relative w-full h-full ${isReversed ? 'rotate-180' : ''}`}>
          {/* 카드 중앙 (이미지) - 전체를 차지 */}
          <div className="absolute inset-0">
            {card.imagePath ? (
              <img
                src={card.imagePath}
                alt={card.nameKo}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <div className="text-5xl text-gray-400 font-bold">
                  {card.number}
                </div>
              </div>
            )}
          </div>

          {/* 카드 헤더 - 이미지 위에 오버레이 (투명 배경) */}
          <div className="absolute top-0 left-0 right-0 text-center bg-gradient-to-b from-black/70 to-transparent py-2 px-2">
            <div className="text-[10px] font-semibold text-white/90 mb-0.5">
              {card.suit === 'major' ? 'Major Arcana' : card.suit.toUpperCase()}
            </div>
            <div className="text-xs font-bold text-white leading-tight drop-shadow-lg">
              {card.nameKo}
            </div>
          </div>

          {/* 카드 푸터 - 방향 표시 (이미지 위에 오버레이) */}
          {isReversed && (
            <div className="absolute bottom-0 left-0 right-0 text-center bg-gradient-to-t from-red-600/90 to-transparent py-1.5">
              <div className="text-xs font-semibold text-white drop-shadow-lg">
                ↓ 역방향 ↓
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * 타로 카드 상세 정보 컴포넌트
 */
interface TarotCardDetailProps {
  card: TarotCard;
  isReversed: boolean;
  positionName?: string;
  positionMeaning?: string;
}

export function TarotCardDetail({
  card,
  isReversed,
  positionName,
  positionMeaning,
}: TarotCardDetailProps) {
  const meaning = isReversed ? card.reversedMeaning : card.uprightMeaning;
  const keywords = isReversed ? card.reversedKeywords : card.uprightKeywords;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      {/* 위치 정보 (있을 경우) */}
      {positionName && (
        <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
            {positionName}
          </h3>
          {positionMeaning && (
            <p className="text-sm text-gray-600 dark:text-gray-400">{positionMeaning}</p>
          )}
        </div>
      )}

      {/* 카드 정보 */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {card.nameKo}
          </h2>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              isReversed
                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            }`}
          >
            {isReversed ? '역방향 ↓' : '정방향 ↑'}
          </span>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{card.name}</p>
      </div>

      {/* 의미 */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          카드 의미
        </h4>
        <p className="text-gray-800 dark:text-gray-200">{meaning}</p>
      </div>

      {/* 키워드 */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          키워드
        </h4>
        <div className="flex flex-wrap gap-2">
          {keywords.map((keyword, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
            >
              {keyword}
            </span>
          ))}
        </div>
      </div>

      {/* 상징 */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          상징
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">{card.symbolism}</p>
      </div>

      {/* 설명 */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          해석
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">{card.description}</p>
      </div>
    </div>
  );
}
