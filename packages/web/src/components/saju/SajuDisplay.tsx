import React from 'react';

interface SajuDisplayProps {
  sajuString?: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export const SajuDisplay: React.FC<SajuDisplayProps> = ({
  sajuString,
  size = 'medium',
  className = '',
}) => {
  if (!sajuString || sajuString === '계산 실패' || sajuString === '계산 중...') {
    return (
      <div className={`text-gray-500 dark:text-gray-400 ${className}`}>
        <span className="text-sm">사주 계산 중...</span>
      </div>
    );
  }

  const parts = sajuString.split(' ');
  if (parts.length !== 4) {
    return (
      <div className={`text-red-500 dark:text-red-400 ${className}`}>
        <span className="text-sm">사주 형식 오류</span>
      </div>
    );
  }

  const [year, month, day, time] = parts;

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return {
          container: 'text-sm',
          pillar: 'px-2 py-1',
          char: 'text-base',
          label: 'text-xs',
        };
      case 'large':
        return {
          container: 'text-lg',
          pillar: 'px-4 py-3',
          char: 'text-2xl',
          label: 'text-sm',
        };
      default: // medium
        return {
          container: 'text-base',
          pillar: 'px-3 py-2',
          char: 'text-xl',
          label: 'text-xs',
        };
    }
  };

  const classes = getSizeClasses();

  return (
    <div className={`${classes.container} ${className}`}>
      <div className="grid grid-cols-4 gap-2 max-w-md mx-auto">
        {/* 년주 */}
        <div className="text-center">
          <div className={`bg-gradient-to-b from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30
                          border border-red-200 dark:border-red-700 rounded-lg ${classes.pillar}`}>
            <div className={`font-bold text-red-800 dark:text-red-200 ${classes.char}`}>
              {year}
            </div>
          </div>
          <div className={`text-gray-600 dark:text-gray-400 mt-1 ${classes.label}`}>년주</div>
        </div>

        {/* 월주 */}
        <div className="text-center">
          <div className={`bg-gradient-to-b from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30
                          border border-blue-200 dark:border-blue-700 rounded-lg ${classes.pillar}`}>
            <div className={`font-bold text-blue-800 dark:text-blue-200 ${classes.char}`}>
              {month}
            </div>
          </div>
          <div className={`text-gray-600 dark:text-gray-400 mt-1 ${classes.label}`}>월주</div>
        </div>

        {/* 일주 */}
        <div className="text-center">
          <div className={`bg-gradient-to-b from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30
                          border border-green-200 dark:border-green-700 rounded-lg ${classes.pillar}`}>
            <div className={`font-bold text-green-800 dark:text-green-200 ${classes.char}`}>
              {day}
            </div>
          </div>
          <div className={`text-gray-600 dark:text-gray-400 mt-1 ${classes.label}`}>일주</div>
        </div>

        {/* 시주 */}
        <div className="text-center">
          <div className={`bg-gradient-to-b from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30
                          border border-purple-200 dark:border-purple-700 rounded-lg ${classes.pillar}`}>
            <div className={`font-bold text-purple-800 dark:text-purple-200 ${classes.char}`}>
              {time}
            </div>
          </div>
          <div className={`text-gray-600 dark:text-gray-400 mt-1 ${classes.label}`}>시주</div>
        </div>
      </div>

      {/* 전체 사주 문자열 */}
      <div className="text-center mt-3">
        <div className="inline-flex items-center space-x-1 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
          <span className="text-xs text-gray-600 dark:text-gray-400">사주:</span>
          <span className="font-mono font-semibold text-gray-800 dark:text-gray-200">
            {sajuString}
          </span>
        </div>
      </div>
    </div>
  );
};