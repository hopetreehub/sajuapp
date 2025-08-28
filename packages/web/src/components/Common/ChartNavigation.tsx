import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getPreviousChart, getNextChart, getCurrentChart } from '@/constants/navigationFlow';
import { CHART_DESIGN_SYSTEM } from '@/constants/chartDesignSystem';

interface ChartNavigationProps {
  showCenter?: boolean;
  customPrevious?: { path: string; name: string; icon?: string };
  customNext?: { path: string; name: string; icon?: string };
  className?: string;
}

const ChartNavigation: React.FC<ChartNavigationProps> = ({ 
  showCenter = true,
  customPrevious,
  customNext,
  className = ''
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  // 자동으로 이전/다음 차트 감지
  const previousChart = customPrevious || getPreviousChart(currentPath);
  const nextChart = customNext || getNextChart(currentPath);
  const currentChart = getCurrentChart(currentPath);

  const handlePrevious = () => {
    if (previousChart) {
      navigate(previousChart.path);
    }
  };

  const handleNext = () => {
    if (nextChart) {
      navigate(nextChart.path);
    }
  };

  return (
    <div className={`${CHART_DESIGN_SYSTEM.LAYOUT.navigation.container} ${className}`}>
      {/* 이전 차트 버튼 */}
      {previousChart && (
        <button
          onClick={handlePrevious}
          className={CHART_DESIGN_SYSTEM.BUTTON_STYLES.navigation}
          title={previousChart.name}
        >
          <span className="flex items-center gap-2">
            <span>{CHART_DESIGN_SYSTEM.ICONS.navigation.previous}</span>
            <span className="hidden sm:inline">{previousChart.name}</span>
            {previousChart.icon && <span className="sm:hidden">{previousChart.icon}</span>}
          </span>
        </button>
      )}

      {/* 현재 차트 표시 (옵션) */}
      {showCenter && currentChart && (
        <div className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300">
          <span>{currentChart.icon}</span>
          <span className="hidden md:inline">{currentChart.name}</span>
        </div>
      )}

      {/* 다음 차트 버튼 */}
      {nextChart && (
        <button
          onClick={handleNext}
          className={CHART_DESIGN_SYSTEM.BUTTON_STYLES.navigation}
          title={nextChart.name}
        >
          <span className="flex items-center gap-2">
            <span className="hidden sm:inline">{nextChart.name}</span>
            {nextChart.icon && <span className="sm:hidden">{nextChart.icon}</span>}
            <span>{CHART_DESIGN_SYSTEM.ICONS.navigation.next}</span>
          </span>
        </button>
      )}

      {/* 네비게이션이 없는 경우 홈 버튼 */}
      {!previousChart && !nextChart && (
        <button
          onClick={() => navigate('/')}
          className={CHART_DESIGN_SYSTEM.BUTTON_STYLES.navigation}
        >
          <span className="flex items-center gap-2">
            <span>🏠</span>
            <span>홈으로</span>
          </span>
        </button>
      )}
    </div>
  );
};

export default ChartNavigation;