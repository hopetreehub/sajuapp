import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { SajuBirthInfo } from '@/types/saju';
import { FiveElementsData, ElementRelationship, FiveElementsRecommendation, FiveElementsAnalysisResult } from '@/types/fiveElements';
import { FiveElementsCalculator, ELEMENT_DETAILS } from '@/utils/fiveElementsCalculator';
import { CHART_DESIGN_SYSTEM } from '@/constants/chartDesignSystem';
import StandardChartHeader from './common/StandardChartHeader';
import StandardTimeFrameSelector from './common/StandardTimeFrameSelector';
import useStandardRadarChart from '@/hooks/useStandardRadarChart';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface FiveElementsChartProps {
  birthInfo: SajuBirthInfo;
  birthDate?: string;
  showRecommendations?: boolean;
}

const FiveElementsChart: React.FC<FiveElementsChartProps> = ({
  birthInfo,
  birthDate,
  showRecommendations = true
}) => {
  // 오행 분석 데이터 계산
  const analysisResult: FiveElementsAnalysisResult = useMemo(() => {
    return FiveElementsCalculator.calculateFromBirthInfo(birthInfo);
  }, [birthInfo]);

  const { elements, relationships, recommendations } = analysisResult;

  // 표준 레이더차트 훅 사용
  const {
    chartData,
    chartOptions,
    selectedTimeFrame,
    setSelectedTimeFrame
  } = useStandardRadarChart({
    baseData: elements,
    chartType: 'five-elements',
    calculator: FiveElementsCalculator,
    labels: ['목 🌳', '화 🔥', '토 🏔️', '금 ⚔️', '수 🌊'],
    colors: {
      primary: '#8b5cf6',
      secondary: '#06b6d4',
      background: 'rgba(139, 92, 246, 0.1)'
    }
  });

  return (
    <div className={CHART_DESIGN_SYSTEM.LAYOUT.chartContainer.wrapper}>
      {/* 표준 차트 헤더 */}
      <StandardChartHeader 
        title="오행균형도 분석"
        description="목, 화, 토, 금, 수의 균형과 상생상극 관계를 분석합니다"
        birthDate={birthDate}
        icon="🌟"
      />

      {/* 레이더 차트 */}
      <div className="mb-6" style={{ height: CHART_DESIGN_SYSTEM.DIMENSIONS.height }}>
        <Radar data={chartData} options={chartOptions} />
      </div>

      {/* 표준 시간대 선택 버튼 */}
      <StandardTimeFrameSelector 
        selected={selectedTimeFrame}
        onChange={setSelectedTimeFrame}
      />

      {/* 균형도 표시 */}
      <BalanceIndicator balance={relationships} />

      {/* 오행별 강도 카드 */}
      <ElementStrengthCards elements={elements} />

      {/* 추천사항 패널 */}
      {showRecommendations && (
        <RecommendationPanel recommendations={recommendations} />
      )}
    </div>
  );
};

// 균형도 표시 컴포넌트
const BalanceIndicator: React.FC<{ balance: ElementRelationship }> = ({ balance }) => {
  const getBalanceColor = (score: number) => {
    if (score >= 70) return 'text-green-600 dark:text-green-400';
    if (score >= 40) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getBalanceText = (score: number) => {
    if (score >= 70) return '균형적';
    if (score >= 40) return '보통';
    return '불균형적';
  };

  return (
    <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
      <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-3 text-center">
        ⚖️ 오행 균형도
      </h4>
      <div className="text-center">
        <div className={`text-3xl font-bold mb-2 ${getBalanceColor(balance.balance_score)}`}>
          {balance.balance_score}점
        </div>
        <div className="text-gray-600 dark:text-gray-400 mb-3">
          {getBalanceText(balance.balance_score)}인 오행 상태
        </div>
        
        {/* 강한/약한 원소 표시 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="text-center">
            <h5 className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">
              🔝 강한 원소
            </h5>
            <div className="flex justify-center gap-2">
              {balance.dominant_elements.map((element, index) => (
                <span key={index} className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded">
                  {element}
                </span>
              ))}
            </div>
          </div>
          
          <div className="text-center">
            <h5 className="text-sm font-medium text-orange-600 dark:text-orange-400 mb-2">
              📉 약한 원소
            </h5>
            <div className="flex justify-center gap-2">
              {balance.weak_elements.map((element, index) => (
                <span key={index} className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs rounded">
                  {element}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 오행별 강도 카드 컴포넌트
const ElementStrengthCards: React.FC<{ elements: FiveElementsData }> = ({ elements }) => {
  return (
    <div className="mb-6">
      <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 text-center">
        🏷️ 오행별 강도
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {Object.entries(elements).map(([key, value]) => {
          const elementKey = key as keyof FiveElementsData;
          const detail = ELEMENT_DETAILS[elementKey];
          
          return (
            <div
              key={key}
              className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">{detail.icon}</div>
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {detail.name}({detail.korean})
                </h5>
                <div 
                  className="text-2xl font-bold mb-2"
                  style={{ color: detail.color.primary }}
                >
                  {value}
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{ 
                      backgroundColor: detail.color.primary,
                      width: `${value}%` 
                    }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                  {detail.season} • {detail.direction}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 추천사항 패널 컴포넌트
const RecommendationPanel: React.FC<{ recommendations: FiveElementsRecommendation }> = ({ recommendations }) => {
  return (
    <div className="space-y-6">
      <h4 className="text-lg font-semibold text-gray-800 dark:text-white text-center">
        💡 개인맞춤 추천사항
      </h4>
      
      {/* 유익한 색상 */}
      <div className="p-4 bg-white dark:bg-gray-700 rounded-lg">
        <h5 className="text-md font-medium text-gray-800 dark:text-white mb-3 flex items-center gap-2">
          🎨 추천 색상
        </h5>
        <div className="space-y-2">
          {recommendations.colors.beneficial.map((color, index) => (
            <div key={index} className="flex items-center gap-3">
              <div 
                className="w-6 h-6 rounded-full border border-gray-300"
                style={{ backgroundColor: color.hex }}
              ></div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {color.name}
                </span>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {color.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 유익한 방향 */}
      <div className="p-4 bg-white dark:bg-gray-700 rounded-lg">
        <h5 className="text-md font-medium text-gray-800 dark:text-white mb-3 flex items-center gap-2">
          🧭 추천 방향
        </h5>
        <div className="space-y-2">
          {recommendations.directions.beneficial.map((direction, index) => (
            <div key={index} className="flex items-start gap-3">
              <span className="text-purple-600 dark:text-purple-400 font-medium">
                {direction.direction}
              </span>
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {direction.element}: {direction.benefit}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 라이프스타일 추천 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 식습관 */}
        <div className="p-4 bg-white dark:bg-gray-700 rounded-lg">
          <h6 className="text-sm font-medium text-gray-800 dark:text-white mb-2">
            🍽️ 식습관
          </h6>
          {recommendations.lifestyle.diet.map((item, index) => (
            <div key={index} className="text-xs text-gray-600 dark:text-gray-400 mb-1">
              {item.food}
            </div>
          ))}
        </div>

        {/* 운동 */}
        <div className="p-4 bg-white dark:bg-gray-700 rounded-lg">
          <h6 className="text-sm font-medium text-gray-800 dark:text-white mb-2">
            🏃‍♂️ 운동
          </h6>
          {recommendations.lifestyle.exercise.map((item, index) => (
            <div key={index} className="text-xs text-gray-600 dark:text-gray-400 mb-1">
              {item.type}
            </div>
          ))}
        </div>

        {/* 직업 */}
        <div className="p-4 bg-white dark:bg-gray-700 rounded-lg">
          <h6 className="text-sm font-medium text-gray-800 dark:text-white mb-2">
            💼 직업
          </h6>
          {recommendations.lifestyle.career.map((item, index) => (
            <div key={index} className="text-xs text-gray-600 dark:text-gray-400 mb-1">
              {item.field}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FiveElementsChart;