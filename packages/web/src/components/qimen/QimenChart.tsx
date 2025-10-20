/**
 * 귀문둔갑 3x3 구궁 차트
 *
 * 로서도(洛書圖) 배치에 따른 9개 궁 시각화
 * @author Claude Code
 * @version 1.1.0 - Performance optimized with React.memo and useCallback
 */

import React, { useCallback, useMemo } from 'react';
import type { QimenChart, Palace } from '@/types/qimen';
import { PALACE_GRID } from '@/data/qimenDunjiaData';
import PalaceCard from './PalaceCard';

interface QimenChart3x3Props {
  chart: QimenChart;
  selectedPalace: Palace | null;
  onPalaceSelect: (palace: Palace) => void;
}

function QimenChart3x3({
  chart,
  selectedPalace,
  onPalaceSelect,
}: QimenChart3x3Props) {
  // 각 궁의 onClick 핸들러를 메모이제이션
  const handlePalaceClick = useCallback(
    (palace: Palace) => {
      onPalaceSelect(palace);
    },
    [onPalaceSelect]
  );

  // 궁 카드 렌더링 최적화
  const palaceCards = useMemo(
    () =>
      PALACE_GRID.flatMap((row) =>
        row.map((palace) => {
          const palaceInfo = chart.palaces[palace];
          const isSelected = selectedPalace === palace;

          return (
            <PalaceCard
              key={palace}
              palace={palaceInfo}
              isSelected={isSelected}
              onClick={() => handlePalaceClick(palace)}
            />
          );
        })
      ),
    [chart.palaces, selectedPalace, handlePalaceClick]
  );

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="grid grid-cols-3 gap-2 md:gap-4 aspect-square">
        {palaceCards}
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

// React.memo로 성능 최적화: chart, selectedPalace, onPalaceSelect이 변경되지 않으면 리렌더링 방지
export default React.memo(QimenChart3x3);
