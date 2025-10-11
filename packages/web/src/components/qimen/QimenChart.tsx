/**
 * 귀문둔갑 3x3 구궁 차트
 *
 * 로서도(洛書圖) 배치에 따른 9개 궁 시각화
 * @author Claude Code
 * @version 1.0.0
 */

import React from 'react';
import type { QimenChart, Palace } from '@/types/qimen';
import { PALACE_GRID } from '@/data/qimenDunjiaData';
import PalaceCard from './PalaceCard';

interface QimenChart3x3Props {
  chart: QimenChart;
  selectedPalace: Palace | null;
  onPalaceSelect: (palace: Palace) => void;
}

export default function QimenChart3x3({
  chart,
  selectedPalace,
  onPalaceSelect,
}: QimenChart3x3Props) {
  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="grid grid-cols-3 gap-2 md:gap-4 aspect-square">
        {PALACE_GRID.map((row, rowIndex) =>
          row.map((palace, colIndex) => {
            const palaceInfo = chart.palaces[palace];
            const isSelected = selectedPalace === palace;

            return (
              <PalaceCard
                key={palace}
                palace={palaceInfo}
                isSelected={isSelected}
                onClick={() => onPalaceSelect(palace)}
              />
            );
          })
        )}
      </div>

      {/* 방위 표시 */}
      <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        <div className="flex justify-center items-center gap-8">
          <div>🧭 북쪽(상): 1궁</div>
          <div>🧭 남쪽(하): 9궁</div>
          <div>🧭 동쪽(좌): 3궁</div>
          <div>🧭 서쪽(우): 7궁</div>
        </div>
      </div>
    </div>
  );
}
