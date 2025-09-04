import React from 'react';

interface DiaryIndicatorProps {
  date: Date;
  hasDiary: boolean;
  onClick: () => void;
  size?: 'small' | 'medium' | 'large';
  showTooltip?: boolean;
}

const DiaryIndicator: React.FC<DiaryIndicatorProps> = ({
  date,
  hasDiary,
  onClick,
  size = 'small',
  showTooltip = true
}) => {
  if (!hasDiary) return null;

  const sizeClasses = {
    small: 'w-4 h-4 text-xs',
    medium: 'w-5 h-5 text-sm',
    large: 'w-6 h-6 text-base'
  };

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`
        ${sizeClasses[size]}
        flex items-center justify-center
        rounded-full
        bg-purple-50 dark:bg-purple-900/30
        hover:bg-purple-100 dark:hover:bg-purple-900/50
        text-purple-600 dark:text-purple-400
        transition-all duration-200
        hover:scale-110
        active:scale-95
        cursor-pointer
        border border-purple-200 dark:border-purple-700
        shadow-sm hover:shadow-md
      `}
      title={showTooltip ? '일기 보기/수정' : undefined}
      aria-label={`${date.toLocaleDateString()} 일기 보기 또는 수정`}
    >
      <span className="leading-none">📔</span>
    </button>
  );
};

export default DiaryIndicator;