import React from 'react';
import { CHART_DESIGN_SYSTEM } from '@/constants/chartDesignSystem';

export type TimeFrame = 'base' | 'today' | 'month' | 'year';

interface StandardTimeFrameSelectorProps {
  selected: TimeFrame;
  onChange: (timeFrame: TimeFrame) => void;
  disabled?: TimeFrame[];
  className?: string;
}

const StandardTimeFrameSelector: React.FC<StandardTimeFrameSelectorProps> = ({
  selected,
  onChange,
  disabled = [],
  className = '',
}) => {
  const timeFrameOptions: Array<{ key: TimeFrame; label: string; active: string }> = [
    { key: 'base', label: '기본', active: 'base' },
    { key: 'today', label: '오늘', active: 'today' },
    { key: 'month', label: '이달', active: 'month' },
    { key: 'year', label: '올해', active: 'year' },
  ];

  return (
    <div className={`${CHART_DESIGN_SYSTEM.LAYOUT.timeFrameSelector.container} ${className}`}>
      {timeFrameOptions.map(({ key, label, active }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          disabled={disabled.includes(key)}
          className={`${CHART_DESIGN_SYSTEM.BUTTON_STYLES.timeFrame.base} ${
            selected === key
              ? CHART_DESIGN_SYSTEM.BUTTON_STYLES.timeFrame.active[active]
              : CHART_DESIGN_SYSTEM.BUTTON_STYLES.timeFrame.inactive
          } ${
            disabled.includes(key) 
              ? 'opacity-50 cursor-not-allowed' 
              : ''
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export default StandardTimeFrameSelector;