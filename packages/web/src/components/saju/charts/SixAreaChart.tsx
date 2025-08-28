import React, { useState, useEffect, useMemo } from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { SixAreaScores } from '@/types/saju';
import { CHART_DESIGN_SYSTEM, getTimeFrameColors, getChartOptions } from '@/constants/chartDesignSystem';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface SixAreaChartProps {
  scores: SixAreaScores;
  birthDate?: string;
}

type TimeFrame = 'base' | 'today' | 'month' | 'year';

const SixAreaChart: React.FC<SixAreaChartProps> = ({ scores, birthDate }) => {
  // 다크모드 실시간 감지
  const [isDarkMode, setIsDarkMode] = useState(false);
  // 시간대 선택 상태
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<TimeFrame>('base');

  useEffect(() => {
    // 초기 다크모드 상태 확인
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };

    checkDarkMode();

    // MutationObserver로 다크모드 변경 감지
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  // 시간대별 영역 가중치 정의
  const timeFrameWeights = {
    today: {
      foundation: 0.7,     // 근본 약화
      thinking: 1.3,       // 사고 강화
      relationship: 0.85,  // 인연 약간 약화
      action: 1.4,         // 행동 크게 강화
      luck: 1.2,           // 행운 강화
      environment: 0.8     // 환경 약화
    },
    month: {
      foundation: 0.9,
      thinking: 0.95,
      relationship: 1.35,  // 인연 크게 강화
      action: 0.75,        // 행동 약화
      luck: 1.25,          // 행운 강화
      environment: 1.1     // 환경 약간 강화
    },
    year: {
      foundation: 1.15,    // 근본 강화
      thinking: 1.1,       // 사고 약간 강화
      relationship: 0.95,
      action: 0.85,        // 행동 약화
      luck: 0.7,           // 행운 크게 약화
      environment: 1.3     // 환경 크게 강화
    }
  };

  // 개선된 시간대별 데이터 생성 함수
  const generateTimeBasedScore = (
    baseScore: number, 
    weight: number, 
    variance: number,
    maxLimit: number = 85
  ): number => {
    // 기본 점수를 낮춤 (0.8 배율 적용)
    const adjustedBase = baseScore * 0.8;
    
    // 가중치 적용
    const weightedScore = adjustedBase * weight;
    
    // 변동성 추가 (더 큰 범위)
    const randomVariance = (Math.random() - 0.5) * variance;
    const finalScore = weightedScore + randomVariance;
    
    // 최소 20, 최대 maxLimit으로 제한
    return Math.max(20, Math.min(maxLimit, Math.round(finalScore)));
  };

  // 시간대별 데이터 메모이제이션
  const timeFrameData = useMemo(() => {
    const data: { [key in TimeFrame]?: number[] } = {};
    
    // 오늘: 행동력 중심, 큰 변동성
    data.today = [
      generateTimeBasedScore(scores.foundation, timeFrameWeights.today.foundation, 25),
      generateTimeBasedScore(scores.thinking, timeFrameWeights.today.thinking, 20),
      generateTimeBasedScore(scores.relationship, timeFrameWeights.today.relationship, 22),
      generateTimeBasedScore(scores.action, timeFrameWeights.today.action, 18),
      generateTimeBasedScore(scores.luck, timeFrameWeights.today.luck, 30),
      generateTimeBasedScore(scores.environment, timeFrameWeights.today.environment, 25)
    ];
    
    // 이번달: 관계 중심, 중간 변동성
    data.month = [
      generateTimeBasedScore(scores.foundation, timeFrameWeights.month.foundation, 18),
      generateTimeBasedScore(scores.thinking, timeFrameWeights.month.thinking, 16),
      generateTimeBasedScore(scores.relationship, timeFrameWeights.month.relationship, 15),
      generateTimeBasedScore(scores.action, timeFrameWeights.month.action, 20),
      generateTimeBasedScore(scores.luck, timeFrameWeights.month.luck, 22),
      generateTimeBasedScore(scores.environment, timeFrameWeights.month.environment, 17)
    ];
    
    // 올해: 안정적, 작은 변동성
    data.year = [
      generateTimeBasedScore(scores.foundation, timeFrameWeights.year.foundation, 12),
      generateTimeBasedScore(scores.thinking, timeFrameWeights.year.thinking, 10),
      generateTimeBasedScore(scores.relationship, timeFrameWeights.year.relationship, 14),
      generateTimeBasedScore(scores.action, timeFrameWeights.year.action, 15),
      generateTimeBasedScore(scores.luck, timeFrameWeights.year.luck, 18),
      generateTimeBasedScore(scores.environment, timeFrameWeights.year.environment, 10)
    ];
    
    return data;
  }, [scores]);

  // 최고점 찾기 로직
  const scoreValues = [
    scores.foundation,
    scores.thinking,
    scores.relationship,
    scores.action,
    scores.luck,
    scores.environment
  ];
  const maxScore = Math.max(...scoreValues);
  const maxScoreIndexes = scoreValues.map((score, index) => score === maxScore ? index : -1).filter(index => index !== -1);
  
  // 통일된 시간대 색상 사용
  const timeFrameColors = {
    today: getTimeFrameColors('today'),
    month: getTimeFrameColors('month'),
    year: getTimeFrameColors('year')
  };

  // 시간대별 라벨
  const timeFrameLabels = {
    today: '오늘의 운세',
    month: '이번달 운세',
    year: '올해 운세'
  };

  const data = {
    labels: ['근본', '사고', '인연', '행동', '행운', '환경'],
    datasets: [
      {
        label: '나의 기본 사주',
        data: scoreValues,
        backgroundColor: getTimeFrameColors('base').background,
        borderColor: getTimeFrameColors('base').border,
        // 최고점은 금색으로, 일반점은 기본 색상으로
        pointBackgroundColor: scoreValues.map((_, index) => 
          maxScoreIndexes.includes(index) 
            ? '#f59e0b'  // 금색 (최고점)
            : getTimeFrameColors('base').border  // 기본 색상
        ),
        pointBorderColor: scoreValues.map((_, index) => 
          maxScoreIndexes.includes(index) 
            ? '#ffffff'  // 최고점 테두리
            : '#ffffff'  // 기본 테두리
        ),
        // 최고점은 더 큰 반지름으로
        pointRadius: scoreValues.map((_, index) => 
          maxScoreIndexes.includes(index) ? 8 : 5
        ),
        pointHoverRadius: scoreValues.map((_, index) => 
          maxScoreIndexes.includes(index) ? 10 : 7
        ),
        pointHoverBackgroundColor: scoreValues.map((_, index) => 
          maxScoreIndexes.includes(index) 
            ? '#f59e0b'  // 최고점 호버 색상
            : '#ffffff'  // 일반점 호버 색상
        ),
        pointHoverBorderColor: scoreValues.map((_, index) => 
          maxScoreIndexes.includes(index) 
            ? '#ffffff'  // 최고점 호버 테두리
            : getTimeFrameColors('base').border  // 일반점 호버 테두리
        ),
        borderWidth: 3
      },
      // 선택된 시간대 데이터셋 추가
      ...(selectedTimeFrame !== 'base' && timeFrameData[selectedTimeFrame] ? [{
        label: timeFrameLabels[selectedTimeFrame],
        data: timeFrameData[selectedTimeFrame],
        backgroundColor: timeFrameColors[selectedTimeFrame].background,
        borderColor: timeFrameColors[selectedTimeFrame].border,
        pointBackgroundColor: timeFrameColors[selectedTimeFrame].border,
        pointBorderColor: '#ffffff',
        pointHoverBackgroundColor: '#ffffff',
        pointHoverBorderColor: timeFrameColors[selectedTimeFrame].border,
        borderWidth: 3,
        pointRadius: 4,
        pointHoverRadius: 6
      }] : [])
    ]
  };

  // 다크모드 개선된 차트 옵션 사용
  const options = getChartOptions(isDarkMode, {
    plugins: {
      legend: {
        display: selectedTimeFrame !== 'base'
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return `${context.dataset.label}: ${context.parsed.r}점`;
          }
        }
      }
    }
  });

  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
  const averageScore = (totalScore / 6).toFixed(1);

  return (
    <div className={CHART_DESIGN_SYSTEM.LAYOUT.chartContainer.wrapper}>
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
          📊 6대 영역 종합 분석
        </h3>
        {birthDate && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            출생정보: {birthDate}
          </p>
        )}
      </div>

      {/* 레이더 차트 - 통일된 크기 */}
      <div className="mb-6" style={{ height: CHART_DESIGN_SYSTEM.DIMENSIONS.height }}>
        <Radar data={data} options={options} />
      </div>

      {/* 시간대 선택 버튼 - 차트 아래 배치 */}
      <div className={`${CHART_DESIGN_SYSTEM.LAYOUT.timeFrameSelector.container} mb-6`}>
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

      {/* 점수 카드들 - 통일된 디자인 */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {Object.entries(scores).map(([key, value], index) => {
          const labels = ['근본', '사고', '인연', '행동', '행운', '환경'];
          const descriptions = [
            '태생적 기질과 잠재력',
            '사고방식과 창의력',
            '대인관계와 사회성',
            '실행력과 추진력',
            '운세와 기회 포착',
            '환경 적응과 변화'
          ];
          const emojis = ['🌱', '🧠', '❤️', '⚡', '🍀', '🌍'];
          const color = CHART_DESIGN_SYSTEM.COLORS.primary[index];
          
          return (
            <div
              key={key}
              className={CHART_DESIGN_SYSTEM.SCORE_CARD_STYLES.container}
            >
              <div className="text-center">
                <div className={CHART_DESIGN_SYSTEM.SCORE_CARD_STYLES.icon}>
                  {emojis[index]}
                </div>
                <h4 className={CHART_DESIGN_SYSTEM.SCORE_CARD_STYLES.label}>
                  {labels[index]}
                </h4>
                <div
                  className={CHART_DESIGN_SYSTEM.SCORE_CARD_STYLES.score}
                  style={{ color }}
                >
                  {value}
                </div>
                <div className={CHART_DESIGN_SYSTEM.SCORE_CARD_STYLES.progressBar.container}>
                  <div
                    className={CHART_DESIGN_SYSTEM.SCORE_CARD_STYLES.progressBar.fill}
                    style={{ 
                      backgroundColor: color,
                      width: `${value}%` 
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {descriptions[index]}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Total Score */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-xl p-6 text-center">
        <h3 className="text-xl font-semibold mb-3">종합 운명 지수</h3>
        <div className="text-4xl font-bold mb-2">{totalScore}/600</div>
        <div className="text-lg">
          평균 {averageScore}점 - 
          {Number(averageScore) >= 80 ? ' 매우 우수한 사주' :
           Number(averageScore) >= 60 ? ' 양호한 사주' :
           Number(averageScore) >= 40 ? ' 평범한 사주' : ' 노력이 필요한 사주'}
        </div>
      </div>
    </div>
  );
};

export default SixAreaChart;