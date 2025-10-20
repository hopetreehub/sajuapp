import React, { useMemo } from 'react';
import { evaluateEventTiming, getFortuneIcon, getFortuneColor } from '@/utils/qimenOptimalTime';
import type { Fortune } from '@/types/qimen';

interface QimenEventIndicatorProps {
  /** 일정 시작 시간 */
  startTime: Date | string;
  /** 일정 종료 시간 (선택사항) */
  endTime?: Date | string;
  /** 간단한 표시 모드 (아이콘만) */
  compact?: boolean;
  /** 툴팁 표시 여부 */
  showTooltip?: boolean;
}

/**
 * 귀문둔갑 일정 시간 평가 표시 컴포넌트
 *
 * 일정의 시작/종료 시간에 대한 귀문둔갑 평가를 시각적으로 표시합니다.
 *
 * @example
 * ```tsx
 * <QimenEventIndicator
 *   startTime={event.start_time}
 *   endTime={event.end_time}
 *   compact={true}
 * />
 * ```
 */
const QimenEventIndicator: React.FC<QimenEventIndicatorProps> = ({
  startTime,
  endTime,
  compact = false,
  showTooltip = true,
}) => {
  // 시간 평가 계산
  const evaluation = useMemo(() => {
    const start = typeof startTime === 'string' ? new Date(startTime) : startTime;
    const end = endTime ? (typeof endTime === 'string' ? new Date(endTime) : endTime) : undefined;

    return evaluateEventTiming(start, end);
  }, [startTime, endTime]);

  // Fortune 레벨별 한글 레이블
  const getFortuneLabel = (fortune: Fortune): string => {
    const labels: Record<Fortune, string> = {
      excellent: '대길',
      good: '길',
      neutral: '평',
      bad: '흉',
      terrible: '대흉',
    };
    return labels[fortune];
  };

  if (compact) {
    // 간단한 표시 모드 (아이콘만)
    return (
      <span
        className={`inline-flex items-center justify-center text-xs ${getFortuneColor(evaluation.fortune)}`}
        title={showTooltip ? `귀문둔갑: ${getFortuneLabel(evaluation.fortune)} (${evaluation.score}점)` : undefined}
      >
        {getFortuneIcon(evaluation.fortune)}
      </span>
    );
  }

  // 상세 표시 모드
  return (
    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted/50 border border-border">
      <span className="text-sm">{getFortuneIcon(evaluation.fortune)}</span>
      <div className="flex flex-col">
        <span className={`text-xs font-medium ${getFortuneColor(evaluation.fortune)}`}>
          {getFortuneLabel(evaluation.fortune)}
        </span>
        <span className="text-[10px] text-muted-foreground">
          {evaluation.score}점
        </span>
      </div>
    </div>
  );
};

export default QimenEventIndicator;
