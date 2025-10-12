/**
 * 자미두수 12궁위 차트 시각화 컴포넌트
 *
 * 12궁위를 원형 또는 그리드 레이아웃으로 표시하고
 * 각 궁위의 주성, 보조성, 길흉 상태를 시각화합니다.
 */

import React from 'react';
import type { ZiweiChart, Palace, PalaceInfo } from '@/types/ziwei';

interface ZiweiChartViewProps {
  chart: ZiweiChart;
  selectedPalace: Palace | null;
  onPalaceSelect: (palace: Palace) => void;
}

export default function ZiweiChartView({
  chart,
  selectedPalace,
  onPalaceSelect,
}: ZiweiChartViewProps) {
  // 12궁위 배치 순서 (시계 방향)
  const palaceOrder: Palace[] = [
    '命宮', '兄弟宮', '夫妻宮', '子女宮',
    '財帛宮', '疾厄宮', '遷移宮', '奴僕宮',
    '官祿宮', '田宅宮', '福德宮', '父母宮',
  ];

  // 3x4 그리드 배치
  const gridLayout = [
    ['巳', '午', '未', '申'],
    ['辰', '', '', '酉'],
    ['卯', '', '', '戌'],
    ['寅', '丑', '子', '亥'],
  ];

  // 지지와 궁위 매핑
  const branchToPalace: Record<string, Palace | null> = {};
  palaceOrder.forEach((palace) => {
    const palaceInfo = chart.palaces[palace];
    branchToPalace[palaceInfo.branch] = palace;
  });

  // 길흉 색상 계산
  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700';
    if (score >= 60) return 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700';
    if (score >= 40) return 'bg-gray-50 dark:bg-gray-800/20 border-gray-300 dark:border-gray-700';
    if (score >= 20) return 'bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700';
    return 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700';
  };

  const getScoreTextColor = (score: number): string => {
    if (score >= 80) return 'text-green-700 dark:text-green-300';
    if (score >= 60) return 'text-blue-700 dark:text-blue-300';
    if (score >= 40) return 'text-gray-700 dark:text-gray-300';
    if (score >= 20) return 'text-orange-700 dark:text-orange-300';
    return 'text-red-700 dark:text-red-300';
  };

  // 궁위 카드 렌더링
  const renderPalaceCard = (palace: Palace | null, branch: string) => {
    if (!palace) {
      // 중앙 빈 공간
      return (
        <div className="aspect-square flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-2">⭐</div>
            <div className="text-sm font-bold text-purple-600 dark:text-purple-400">
              자미두수
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              紫微斗數
            </div>
          </div>
        </div>
      );
    }

    const palaceInfo: PalaceInfo = chart.palaces[palace];
    const isSelected = selectedPalace === palace;
    const isLifePalace = palace === '命宮';

    return (
      <button
        onClick={() => onPalaceSelect(palace)}
        className={`
          aspect-square w-full p-3 rounded-lg border-2 transition-all duration-200
          ${getScoreColor(palaceInfo.luckyScore)}
          ${isSelected ? 'ring-4 ring-purple-500 scale-105 shadow-xl' : 'hover:scale-102 hover:shadow-lg'}
          ${isLifePalace ? 'ring-2 ring-purple-300 dark:ring-purple-700' : ''}
        `}
      >
        <div className="h-full flex flex-col justify-between text-left">
          {/* 상단: 지지 + 궁위명 */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                {branch}
              </span>
              {isLifePalace && (
                <span className="text-xs bg-purple-200 dark:bg-purple-800 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded">
                  命
                </span>
              )}
            </div>
            <h3 className={`text-sm font-bold mb-2 ${getScoreTextColor(palaceInfo.luckyScore)}`}>
              {palace}
            </h3>
          </div>

          {/* 중간: 주성 */}
          <div className="flex-1 space-y-0.5">
            {palaceInfo.mainStars.slice(0, 2).map((star, idx) => (
              <div
                key={idx}
                className="text-xs font-medium text-purple-700 dark:text-purple-300 truncate"
              >
                ★ {star}
              </div>
            ))}
            {palaceInfo.mainStars.length > 2 && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                +{palaceInfo.mainStars.length - 2}성
              </div>
            )}
          </div>

          {/* 하단: 길흉 점수 */}
          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {palaceInfo.strength}
              </span>
              <span className={`text-sm font-bold ${getScoreTextColor(palaceInfo.luckyScore)}`}>
                {palaceInfo.luckyScore}
              </span>
            </div>
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          📊 12궁위 명반
        </h2>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          명궁: {chart.lifePalaceBranch} · 신궁: {chart.bodyPalaceBranch}
        </div>
      </div>

      {/* 12궁위 그리드 (3x4 중앙 빈 공간) */}
      <div className="grid grid-cols-4 gap-3 max-w-4xl mx-auto">
        {gridLayout.map((row, rowIdx) =>
          row.map((branch, colIdx) => {
            const palace = branch ? branchToPalace[branch] : null;
            return (
              <div key={`${rowIdx}-${colIdx}`}>
                {renderPalaceCard(palace, branch)}
              </div>
            );
          }),
        )}
      </div>

      {/* 범례 */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center gap-6 flex-wrap text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 dark:bg-green-900/30 border-2 border-green-300 dark:border-green-700 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">대길 (80+)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-300 dark:border-blue-700 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">길 (60+)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-100 dark:bg-gray-800/30 border-2 border-gray-300 dark:border-gray-700 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">평 (40+)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-100 dark:bg-orange-900/30 border-2 border-orange-300 dark:border-orange-700 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">흉 (20+)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 dark:bg-red-900/30 border-2 border-red-300 dark:border-red-700 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">대흉 (20-)</span>
          </div>
        </div>
      </div>

      {/* 클릭 안내 */}
      {!selectedPalace && (
        <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
          💡 궁위를 클릭하면 상세 정보를 확인할 수 있습니다
        </div>
      )}
    </div>
  );
}
