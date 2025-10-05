import React, { useMemo } from 'react';
import { useSajuSettingsStore } from '@/stores/sajuSettingsStore';
import { useFortuneStore } from '@/stores/fortuneStore';
import { getFortuneInfo } from '@/utils/dailyFortuneCalculator';

interface DailyFortuneIndicatorProps {
  date: Date;
  compact?: boolean;
}

const DailyFortuneIndicator: React.FC<DailyFortuneIndicatorProps> = ({ date, compact = false }) => {
  const { birthInfo } = useSajuSettingsStore();
  const { calculateFortune } = useFortuneStore();

  // 일간 운세 계산
  const dailyFortune = useMemo(() => {
    if (!birthInfo) return null;
    return calculateFortune(birthInfo, date);
  }, [birthInfo, date, calculateFortune]);

  if (!dailyFortune || !birthInfo) {
    return null;
  }

  const fortuneInfo = getFortuneInfo(dailyFortune.totalLuck);

  if (compact) {
    // 간단한 표시 모드 (MonthView용)
    return (
      <div className="absolute bottom-1 right-1 flex items-center gap-0.5">
        {/* 운세 레벨 아이콘 */}
        <span
          className="text-xs"
          title={`오늘의 운세: ${fortuneInfo.label} (${Math.round(dailyFortune.totalLuck)}%)`}
        >
          {dailyFortune.totalLuck >= 80 ? '🌟' :
           dailyFortune.totalLuck >= 60 ? '⭐' :
           dailyFortune.totalLuck >= 40 ? '☆' : '⚪'}
        </span>
        {/* 운세 점수 막대 */}
        <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${dailyFortune.totalLuck}%`,
              backgroundColor: fortuneInfo.color,
            }}
          />
        </div>
      </div>
    );
  }

  // 상세 표시 모드 (DayView, WeekView용)
  return (
    <div className="p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">일간 운세</span>
          <span className="text-lg">{fortuneInfo.icon || '🔮'}</span>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold" style={{ color: fortuneInfo.color }}>
            {Math.round(dailyFortune.totalLuck)}%
          </div>
          <div className="text-xs" style={{ color: fortuneInfo.color }}>
            {fortuneInfo.label}
          </div>
        </div>
      </div>

      {/* 세부 운세 표시 */}
      <div className="grid grid-cols-5 gap-1 text-xs">
        <div className="text-center">
          <div className="text-gray-500 dark:text-gray-400">연애</div>
          <div className="font-semibold">{Math.round(dailyFortune.loveLuck)}%</div>
        </div>
        <div className="text-center">
          <div className="text-gray-500 dark:text-gray-400">재물</div>
          <div className="font-semibold">{Math.round(dailyFortune.wealthLuck)}%</div>
        </div>
        <div className="text-center">
          <div className="text-gray-500 dark:text-gray-400">건강</div>
          <div className="font-semibold">{Math.round(dailyFortune.healthLuck)}%</div>
        </div>
        <div className="text-center">
          <div className="text-gray-500 dark:text-gray-400">직업</div>
          <div className="font-semibold">{Math.round(dailyFortune.careerLuck)}%</div>
        </div>
        <div className="text-center">
          <div className="text-gray-500 dark:text-gray-400">학업</div>
          <div className="font-semibold">{Math.round(dailyFortune.studyLuck)}%</div>
        </div>
      </div>

      {/* 행운 아이템 */}
      {!compact && (
        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1">
            <div
              className="w-3 h-3 rounded-full border border-gray-300"
              style={{ backgroundColor: dailyFortune.luckyColor }}
              title={`행운의 색: ${dailyFortune.luckyColor}`}
            />
            <span className="text-gray-500 dark:text-gray-400">색상</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-bold">{dailyFortune.luckyNumber}</span>
            <span className="text-gray-500 dark:text-gray-400">숫자</span>
          </div>
        </div>
      )}

      {/* 조언 메시지 */}
      {!compact && dailyFortune.message && (
        <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 italic">
          💡 {dailyFortune.message}
        </div>
      )}
    </div>
  );
};

export default DailyFortuneIndicator;