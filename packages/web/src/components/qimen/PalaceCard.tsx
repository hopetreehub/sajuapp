/**
 * 귀문둔갑 궁(宮) 카드
 *
 * 각 궁의 팔문/구성/팔신 정보를 카드 형태로 표시
 * @author Claude Code
 * @version 1.0.0
 */

import React from 'react';
import type { PalaceInfo } from '@/types/qimen';

interface PalaceCardProps {
  palace: PalaceInfo;
  isSelected: boolean;
  onClick: () => void;
}

export default function PalaceCard({ palace, isSelected, onClick }: PalaceCardProps) {
  // 길흉에 따른 색상
  const getFortuneColor = () => {
    switch (palace.fortune) {
      case 'excellent':
        return 'from-green-400 to-emerald-500 dark:from-green-500 dark:to-emerald-600';
      case 'good':
        return 'from-blue-400 to-cyan-500 dark:from-blue-500 dark:to-cyan-600';
      case 'neutral':
        return 'from-gray-400 to-slate-500 dark:from-gray-500 dark:to-slate-600';
      case 'bad':
        return 'from-orange-400 to-amber-500 dark:from-orange-500 dark:to-amber-600';
      case 'terrible':
        return 'from-red-400 to-rose-500 dark:from-red-500 dark:to-rose-600';
      default:
        return 'from-gray-400 to-slate-500 dark:from-gray-500 dark:to-slate-600';
    }
  };

  // 길흉 이모지
  const getFortuneEmoji = () => {
    switch (palace.fortune) {
      case 'excellent':
        return '🌟';
      case 'good':
        return '✨';
      case 'neutral':
        return '⚖️';
      case 'bad':
        return '⚠️';
      case 'terrible':
        return '❌';
      default:
        return '⚖️';
    }
  };

  return (
    <button
      onClick={onClick}
      className={`
        relative p-3 md:p-4 rounded-xl transition-all duration-300
        ${isSelected
          ? 'ring-4 ring-purple-500 ring-offset-2 dark:ring-offset-gray-900 scale-105 shadow-2xl'
          : 'ring-1 ring-gray-300 dark:ring-gray-700 hover:ring-2 hover:ring-purple-400 hover:scale-102 shadow-lg hover:shadow-xl'
        }
        bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm
        cursor-pointer
      `}
    >
      {/* 궁 번호 및 방위 */}
      <div className="flex justify-between items-start mb-2">
        <div className={`
          text-sm font-bold px-2 py-1 rounded-full
          bg-gradient-to-r ${getFortuneColor()}
          text-white
        `}>
          {palace.palace}궁
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-300 font-medium">
          {palace.direction}
        </div>
      </div>

      {/* 팔문 */}
      <div className="mb-2">
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">팔문</div>
        <div className="text-lg font-bold text-gray-800 dark:text-gray-100">
          {palace.gate}
        </div>
      </div>

      {/* 구성 */}
      <div className="mb-2">
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">구성</div>
        <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">
          {palace.star}
        </div>
      </div>

      {/* 팔신 */}
      {palace.spirit && (
        <div className="mb-2">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">팔신</div>
          <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            {palace.spirit}
          </div>
        </div>
      )}

      {/* 길흉 표시 */}
      <div className="absolute top-2 right-2 text-2xl">
        {getFortuneEmoji()}
      </div>

      {/* 간지 */}
      <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {palace.tianGan}{palace.diZhi} · {palace.wuXing}
        </div>
      </div>

      {/* 선택 시 강조 효과 */}
      {isSelected && (
        <div className="absolute inset-0 rounded-xl bg-purple-500/10 dark:bg-purple-400/10 pointer-events-none"></div>
      )}
    </button>
  );
}
