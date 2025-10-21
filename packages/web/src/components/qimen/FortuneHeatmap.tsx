/**
 * 귀문둔갑 길흉 히트맵 시각화
 *
 * 9개 궁의 길흉을 색상 그라데이션으로 표현
 * @author Claude Code
 * @version 1.0.0
 */

import React from 'react';
import type { QimenChart, Palace, Fortune } from '@/types/qimen';

interface FortuneHeatmapProps {
  chart: QimenChart;
  selectedPalace: Palace | null;
  onPalaceSelect: (palace: Palace) => void;
}

/**
 * Fortune 레벨별 색상 정의
 */
const FORTUNE_COLORS: Record<Fortune, {
  bg: string;
  bgHover: string;
  border: string;
  text: string;
  glow: string;
}> = {
  excellent: {
    bg: 'bg-green-500/80',
    bgHover: 'hover:bg-green-500',
    border: 'border-green-400',
    text: 'text-white',
    glow: 'shadow-green-500/50',
  },
  good: {
    bg: 'bg-green-400/70',
    bgHover: 'hover:bg-green-400',
    border: 'border-green-300',
    text: 'text-white',
    glow: 'shadow-green-400/50',
  },
  neutral: {
    bg: 'bg-gray-400/60',
    bgHover: 'hover:bg-gray-400',
    border: 'border-gray-300',
    text: 'text-white',
    glow: 'shadow-gray-400/50',
  },
  bad: {
    bg: 'bg-orange-400/70',
    bgHover: 'hover:bg-orange-400',
    border: 'border-orange-300',
    text: 'text-white',
    glow: 'shadow-orange-400/50',
  },
  terrible: {
    bg: 'bg-red-500/80',
    bgHover: 'hover:bg-red-500',
    border: 'border-red-400',
    text: 'text-white',
    glow: 'shadow-red-500/50',
  },
};

/**
 * Fortune 레벨별 한글 표시
 */
const FORTUNE_LABELS: Record<Fortune, string> = {
  excellent: '대길',
  good: '길',
  neutral: '평',
  bad: '흉',
  terrible: '대흉',
};

/**
 * 점수를 색상 강도로 변환 (0-100)
 */
function getScoreIntensity(fortune: Fortune): string {
  const intensityMap: Record<Fortune, string> = {
    excellent: 'brightness-110',
    good: 'brightness-105',
    neutral: 'brightness-100',
    bad: 'brightness-95',
    terrible: 'brightness-90',
  };
  return intensityMap[fortune];
}

/**
 * 궁 번호를 그리드 좌표로 변환 (3x3)
 * @deprecated Currently not used, reserved for future grid-based layout
 */
function _getPalaceGridPosition(palace: Palace): { row: number; col: number } {
  const grid = [
    [4, 9, 2],  // 상단
    [3, 5, 7],  // 중단
    [8, 1, 6],  // 하단
  ];

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      if (grid[row][col] === palace) {
        return { row, col };
      }
    }
  }

  return { row: 1, col: 1 }; // 기본값 (중앙)
}

export default function FortuneHeatmap({
  chart,
  selectedPalace,
  onPalaceSelect,
}: FortuneHeatmapProps) {
  // 3x3 그리드 배열
  const grid: Palace[][] = [
    [4, 9, 2],
    [3, 5, 7],
    [8, 1, 6],
  ];

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-4 text-center">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">
          🎨 길흉 히트맵
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          색상이 진할수록 강한 길흉을 나타냅니다
        </p>
      </div>

      {/* 3x3 그리드 */}
      <div className="grid grid-cols-3 gap-2 p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl backdrop-blur-sm">
        {grid.map((row, rowIndex) => (
          <React.Fragment key={rowIndex}>
            {row.map((palace) => {
              const palaceInfo = chart.palaces[palace];
              const colors = FORTUNE_COLORS[palaceInfo.fortune];
              const isSelected = selectedPalace === palace;

              // 신격 패턴 표시
              const hasPatterns = palaceInfo.patterns && palaceInfo.patterns.length > 0;
              const strongPattern = hasPatterns && palaceInfo.patterns
                ? palaceInfo.patterns.reduce((prev, curr) =>
                    curr.strength > prev.strength ? curr : prev,
                  )
                : null;

              return (
                <button
                  key={palace}
                  onClick={() => onPalaceSelect(palace)}
                  className={`
                    relative aspect-square rounded-lg transition-all duration-300 ease-in-out
                    ${colors.bg} ${colors.bgHover}
                    border-2 ${isSelected ? `${colors.border} border-4` : 'border-white/30'}
                    ${colors.text}
                    shadow-lg ${isSelected ? colors.glow : ''}
                    transform ${isSelected ? 'scale-105' : 'scale-100'}
                    hover:scale-110 hover:shadow-xl
                    cursor-pointer
                    ${getScoreIntensity(palaceInfo.fortune)}
                  `}
                  style={{
                    filter: isSelected ? 'brightness(1.1)' : 'brightness(1)',
                  }}
                >
                  {/* 궁 번호 */}
                  <div className="absolute top-1 left-1 text-xs font-semibold opacity-75">
                    {palace}궁
                  </div>

                  {/* 신격 패턴 뱃지 */}
                  {hasPatterns && strongPattern && (
                    <div className="absolute top-1 right-1">
                      <div
                        className={`
                          w-2 h-2 rounded-full animate-pulse
                          ${strongPattern.type === 'auspicious' ? 'bg-yellow-300' :
                            strongPattern.type === 'inauspicious' ? 'bg-purple-300' :
                            'bg-blue-300'}
                        `}
                        title={strongPattern.name}
                      />
                    </div>
                  )}

                  {/* 중앙: 길흉 표시 */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-2xl font-bold mb-1">
                      {FORTUNE_LABELS[palaceInfo.fortune]}
                    </div>
                    <div className="text-xs opacity-90">
                      {palaceInfo.direction}
                    </div>
                  </div>

                  {/* 하단: 팔문 표시 */}
                  <div className="absolute bottom-1 left-0 right-0 text-center text-xs font-medium opacity-90">
                    {palaceInfo.gate}
                  </div>

                  {/* 선택 효과 */}
                  {isSelected && (
                    <div className="absolute inset-0 border-2 border-white rounded-lg animate-pulse" />
                  )}
                </button>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {/* 범례 */}
      <div className="mt-6 p-4 bg-white/80 dark:bg-gray-800/80 rounded-lg backdrop-blur-sm">
        <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 text-center">
          🎨 색상 범례
        </h4>
        <div className="flex justify-center gap-3 flex-wrap">
          {(Object.entries(FORTUNE_LABELS) as [Fortune, string][]).map(([fortune, label]) => {
            const colors = FORTUNE_COLORS[fortune];
            return (
              <div key={fortune} className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded ${colors.bg} border-2 ${colors.border}`}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        {/* 신격 패턴 범례 */}
        <div className="mt-3 pt-3 border-t border-gray-300 dark:border-gray-600">
          <div className="flex justify-center gap-4 text-xs text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-yellow-300 animate-pulse" />
              <span>길격</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-purple-300 animate-pulse" />
              <span>흉격</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-blue-300 animate-pulse" />
              <span>중립</span>
            </div>
          </div>
        </div>
      </div>

      {/* 통계 요약 */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
          <div className="text-xs text-green-700 dark:text-green-300 mb-1">길한 궁</div>
          <div className="text-xl font-bold text-green-800 dark:text-green-200">
            {chart.overallFortune.bestPalaces.length}
          </div>
        </div>
        <div className="p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg text-center">
          <div className="text-xs text-gray-700 dark:text-gray-300 mb-1">평균</div>
          <div className="text-xl font-bold text-gray-800 dark:text-gray-200">
            {chart.overallFortune.score}점
          </div>
        </div>
        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-center">
          <div className="text-xs text-red-700 dark:text-red-300 mb-1">흉한 궁</div>
          <div className="text-xl font-bold text-red-800 dark:text-red-200">
            {chart.overallFortune.worstPalaces.length}
          </div>
        </div>
      </div>
    </div>
  );
}
