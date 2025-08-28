import React, { useMemo, useState } from 'react';
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
import { PersonalityTraits } from '@/types/saju';
import { CHART_DESIGN_SYSTEM, getTimeFrameColors } from '@/constants/chartDesignSystem';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface PersonalityAnalysisChartProps {
  traits: PersonalityTraits;
  birthDate?: string;
}

type TimeFrame = 'base' | 'today' | 'month' | 'year';

const PersonalityAnalysisChart: React.FC<PersonalityAnalysisChartProps> = ({ 
  traits, 
  birthDate 
}) => {
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<TimeFrame>('base');

  // 성향별 아이콘과 색상 정의
  const traitConfig = {
    emotion: { icon: '💖', color: '#ff6b9d', label: '감성' },
    logic: { icon: '🔍', color: '#4ecdc4', label: '논리성' },
    artistic: { icon: '🎨', color: '#ff9f43', label: '예술성' },
    rational: { icon: '🧠', color: '#45b7d1', label: '이성' },
    character: { icon: '🌟', color: '#96ceb4', label: '인성' },
    intelligence: { icon: '📚', color: '#ffeaa7', label: '지성' },
    learning: { icon: '📖', color: '#dda0dd', label: '학습성' }
  };

  const labels = [
    '감성 💖', '논리성 🔍', '예술성 🎨', '이성 🧠', 
    '인성 🌟', '지성 📚', '학습성 📖'
  ];

  // 시간대별 가중치 (성향별 특성 반영)
  const timeFrameWeights = useMemo(() => ({
    today: {
      emotion: 1.3,     // 감성은 오늘 높게
      logic: 0.8,       // 논리성은 오늘 낮게  
      artistic: 1.2,    // 예술성은 오늘 높게
      rational: 0.7,    // 이성은 오늘 낮게
      character: 1.1,   // 인성은 오늘 약간 높게
      intelligence: 0.9,// 지성은 오늘 약간 낮게
      learning: 1.0     // 학습성은 기본
    },
    month: {
      emotion: 0.9,     // 감성은 이번달 낮게
      logic: 1.3,       // 논리성은 이번달 높게
      artistic: 1.1,    // 예술성은 이번달 약간 높게
      rational: 1.4,    // 이성은 이번달 높게
      character: 1.2,   // 인성은 이번달 높게
      intelligence: 1.3,// 지성은 이번달 높게
      learning: 1.1     // 학습성은 이번달 약간 높게
    },
    year: {
      emotion: 0.8,     // 감성은 올해 낮게
      logic: 1.2,       // 논리성은 올해 높게
      artistic: 0.9,    // 예술성은 올해 낮게
      rational: 1.3,    // 이성은 올해 높게
      character: 1.4,   // 인성은 올해 가장 높게
      intelligence: 1.4,// 지성은 올해 가장 높게
      learning: 1.3     // 학습성은 올해 높게
    }
  }), []);

  // 시간대별 데이터 생성
  const getTimeFrameData = useMemo(() => (timeFrame: TimeFrame) => {
    if (timeFrame === 'base') {
      return [traits.emotion, traits.logic, traits.artistic, traits.rational, 
              traits.character, traits.intelligence, traits.learning];
    }

    const weights = timeFrameWeights[timeFrame];
    return [
      Math.min(100, Math.max(0, traits.emotion * weights.emotion)),
      Math.min(100, Math.max(0, traits.logic * weights.logic)),
      Math.min(100, Math.max(0, traits.artistic * weights.artistic)),
      Math.min(100, Math.max(0, traits.rational * weights.rational)),
      Math.min(100, Math.max(0, traits.character * weights.character)),
      Math.min(100, Math.max(0, traits.intelligence * weights.intelligence)),
      Math.min(100, Math.max(0, traits.learning * weights.learning))
    ];
  }, [traits, timeFrameWeights]);

  // 차트 데이터 구성
  const chartData = useMemo(() => {
    const baseData = getTimeFrameData('base');
    const currentData = getTimeFrameData(selectedTimeFrame);
    
    const datasets = [
      // 기본 데이터셋
      {
        label: '기본 성향',
        data: baseData,
        backgroundColor: getTimeFrameColors('base').background,
        borderColor: getTimeFrameColors('base').border,
        borderWidth: 3,
        pointBackgroundColor: getTimeFrameColors('base').border,
        pointBorderColor: '#ffffff',
        pointRadius: 5,
        pointHoverRadius: 7,
      }
    ];

    // 선택된 시간대 데이터 추가
    if (selectedTimeFrame !== 'base') {
      const colors = getTimeFrameColors(selectedTimeFrame);
      datasets.push({
        label: selectedTimeFrame === 'today' ? '오늘의 성향' : 
               selectedTimeFrame === 'month' ? '이달의 성향' : '올해의 성향',
        data: currentData,
        backgroundColor: colors.background,
        borderColor: colors.border,
        borderWidth: 3,
        pointBackgroundColor: colors.border,
        pointBorderColor: '#ffffff',
        pointRadius: 5,
        pointHoverRadius: 7,
      });
    }

    return { labels, datasets };
  }, [labels, selectedTimeFrame, getTimeFrameData]);

  // 통일된 차트 옵션 사용
  const options = {
    ...CHART_DESIGN_SYSTEM.CHART_OPTIONS,
    plugins: {
      ...CHART_DESIGN_SYSTEM.CHART_OPTIONS.plugins,
      legend: {
        ...CHART_DESIGN_SYSTEM.CHART_OPTIONS.plugins.legend,
        display: selectedTimeFrame !== 'base'
      },
      tooltip: {
        ...CHART_DESIGN_SYSTEM.CHART_OPTIONS.plugins.tooltip,
        callbacks: {
          label: (context: any) => {
            return `${context.dataset.label}: ${context.parsed.r.toFixed(1)}점`;
          }
        }
      }
    }
  };

  // 균형 지수 계산
  const balanceIndicators = useMemo(() => {
    const currentData = getTimeFrameData(selectedTimeFrame);
    const [emotion, logic, artistic, rational] = currentData;
    
    return {
      emotionVsRational: {
        emotion: emotion,
        rational: rational,
        balance: Math.abs(emotion - rational),
        dominant: emotion > rational ? '감성형' : '이성형'
      },
      logicVsArtistic: {
        logic: logic,
        artistic: artistic,
        balance: Math.abs(logic - artistic),
        dominant: logic > artistic ? '논리형' : '예술형'
      }
    };
  }, [getTimeFrameData, selectedTimeFrame]);

  // 성향 유형 분류
  const personalityType = useMemo(() => {
    const currentData = getTimeFrameData(selectedTimeFrame);
    const [emotion, logic, artistic, rational, character, intelligence, learning] = currentData;
    
    const avgScore = currentData.reduce((sum, score) => sum + score, 0) / 7;
    
    if (character >= 70 && intelligence >= 70) return { type: '지혜형', icon: '🧙‍♂️', description: '높은 인성과 지성을 가진 균형잡힌 성격' };
    if (emotion >= 70 && artistic >= 70) return { type: '예술가형', icon: '🎭', description: '감성적이고 창의적인 예술가 기질' };
    if (logic >= 70 && rational >= 70) return { type: '분석가형', icon: '🔬', description: '논리적이고 이성적인 분석가 성격' };
    if (learning >= 70) return { type: '학습자형', icon: '📚', description: '배움을 즐기는 지적 호기심이 강한 성격' };
    if (character >= 65) return { type: '인격자형', icon: '🌟', description: '따뜻하고 배려심이 깊은 성격' };
    if (avgScore >= 60) return { type: '균형형', icon: '⚖️', description: '전반적으로 균형잡힌 안정적인 성격' };
    
    return { type: '발전형', icon: '🌱', description: '성장 가능성이 높은 발전하는 성격' };
  }, [getTimeFrameData, selectedTimeFrame]);

  return (
    <div className={CHART_DESIGN_SYSTEM.LAYOUT.chartContainer.wrapper}>
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
          🧠 7대 성향 분석
        </h3>
        {birthDate && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            출생정보: {birthDate}
          </p>
        )}
      </div>

      {/* 시간대 선택 버튼 - 통일된 디자인 */}
      <div className={CHART_DESIGN_SYSTEM.LAYOUT.timeFrameSelector.container}>
        {[
          { key: 'base' as TimeFrame, label: '기본', active: 'base' },
          { key: 'today' as TimeFrame, label: '오늘', active: 'today' },
          { key: 'month' as TimeFrame, label: '이달', active: 'month' },
          { key: 'year' as TimeFrame, label: '올해', active: 'year' }
        ].map(({ key, label, active }) => (
          <button
            key={key}
            onClick={() => setSelectedTimeFrame(key)}
            className={`${CHART_DESIGN_SYSTEM.BUTTON_STYLES.timeFrame.base} ${
              selectedTimeFrame === key
                ? CHART_DESIGN_SYSTEM.BUTTON_STYLES.timeFrame.active[active]
                : CHART_DESIGN_SYSTEM.BUTTON_STYLES.timeFrame.inactive
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 레이더 차트 - 통일된 크기 */}
      <div className="mb-6" style={{ height: CHART_DESIGN_SYSTEM.DIMENSIONS.height }}>
        <Radar data={chartData} options={options} />
      </div>

      {/* 성향 유형 표시 */}
      <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
        <div className="text-center">
          <div className="text-3xl mb-2">{personalityType.icon}</div>
          <h4 className="text-lg font-bold text-purple-700 dark:text-purple-300">
            {personalityType.type}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {personalityType.description}
          </p>
        </div>
      </div>

      {/* 균형 지수 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            💖 감성 vs 이성 🧠
          </h4>
          <div className="flex items-center justify-between text-sm">
            <span>감성: {balanceIndicators.emotionVsRational.emotion.toFixed(1)}</span>
            <span className="font-medium text-purple-600 dark:text-purple-400">
              {balanceIndicators.emotionVsRational.dominant}
            </span>
            <span>이성: {balanceIndicators.emotionVsRational.rational.toFixed(1)}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-2">
            <div
              className="bg-gradient-to-r from-pink-500 to-blue-500 h-2 rounded-full transition-all"
              style={{ 
                width: `${100 - balanceIndicators.emotionVsRational.balance}%` 
              }}
            ></div>
          </div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            🔍 논리성 vs 예술성 🎨
          </h4>
          <div className="flex items-center justify-between text-sm">
            <span>논리: {balanceIndicators.logicVsArtistic.logic.toFixed(1)}</span>
            <span className="font-medium text-purple-600 dark:text-purple-400">
              {balanceIndicators.logicVsArtistic.dominant}
            </span>
            <span>예술: {balanceIndicators.logicVsArtistic.artistic.toFixed(1)}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-2">
            <div
              className="bg-gradient-to-r from-teal-500 to-orange-500 h-2 rounded-full transition-all"
              style={{ 
                width: `${100 - balanceIndicators.logicVsArtistic.balance}%` 
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* 성향별 점수 카드 - 통일된 디자인 */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {Object.entries(traitConfig).map(([key, config], index) => {
          const currentData = getTimeFrameData(selectedTimeFrame);
          const traitIndex = ['emotion', 'logic', 'artistic', 'rational', 'character', 'intelligence', 'learning'].indexOf(key);
          const score = currentData[traitIndex];
          const color = CHART_DESIGN_SYSTEM.COLORS.primary[index];
          
          return (
            <div
              key={key}
              className={CHART_DESIGN_SYSTEM.SCORE_CARD_STYLES.container}
            >
              <div className="text-center">
                <div className={CHART_DESIGN_SYSTEM.SCORE_CARD_STYLES.icon}>
                  {config.icon}
                </div>
                <h5 className={CHART_DESIGN_SYSTEM.SCORE_CARD_STYLES.label}>
                  {config.label}
                </h5>
                <div
                  className={CHART_DESIGN_SYSTEM.SCORE_CARD_STYLES.score}
                  style={{ color }}
                >
                  {score.toFixed(0)}
                </div>
                <div className={CHART_DESIGN_SYSTEM.SCORE_CARD_STYLES.progressBar.container}>
                  <div
                    className={CHART_DESIGN_SYSTEM.SCORE_CARD_STYLES.progressBar.fill}
                    style={{ 
                      backgroundColor: color,
                      width: `${score}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PersonalityAnalysisChart;