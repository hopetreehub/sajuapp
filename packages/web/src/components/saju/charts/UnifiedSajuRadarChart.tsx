import React, { useState, useEffect, useMemo } from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
} from 'chart.js';
import { Radar, Bar } from 'react-chartjs-2';
import { SajuRadarData, SajuRadarItem, TimeFrame, TimeFrameWeights } from '@/types/sajuRadar';
import { CHART_DESIGN_SYSTEM, getTimeFrameColors, getChartOptions } from '@/constants/chartDesignSystem';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

interface UnifiedSajuRadarChartProps {
  data: SajuRadarData;
  birthDate?: string;
  sajuData?: any;
}

const UnifiedSajuRadarChart: React.FC<UnifiedSajuRadarChartProps> = ({ 
  data, 
  birthDate, 
  sajuData 
}) => {
  // 다크모드 실시간 감지 (기존과 동일)
  const [isDarkMode, setIsDarkMode] = useState(false);
  // 시간대 선택 상태 (기존과 동일)
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

  // 시간대별 가중치 정의 (카테고리별로 다르게 적용 가능)
  const timeFrameWeights: { [key in TimeFrame]: TimeFrameWeights } = {
    base: {},
    today: {
      // 오늘: 감성적, 즉석적 요소 강화
      emotion: 1.3,
      social: 1.2,
      energy: 1.4,
      intuitive: 1.3
    },
    month: {
      // 이달: 논리적, 계획적 요소 강화
      logical: 1.3,
      planning: 1.3,
      relationship: 1.35,
      career: 1.2
    },
    year: {
      // 올해: 안정적, 장기적 요소 강화
      stability: 1.3,
      wisdom: 1.4,
      growth: 1.3,
      foundation: 1.2
    }
  };

  // 개선된 시간대별 데이터 생성 함수 (기존과 동일 로직)
  const generateTimeBasedScore = (
    baseScore: number,
    weight: number = 1.0,
    variance: number,
    maxLimit: number = 85
  ): number => {
    // 기본 점수를 낮춤 (0.8 배율 적용)
    const adjustedBase = baseScore * 0.8;
    
    // 가중치 적용
    const weightedScore = adjustedBase * weight;
    
    // 변동성 추가
    const randomVariance = (Math.random() - 0.5) * variance;
    const finalScore = weightedScore + randomVariance;
    
    // 최소 20, 최대 maxLimit으로 제한
    return Math.max(20, Math.min(maxLimit, Math.round(finalScore)));
  };

  // 시간대별 데이터 메모이제이션
  const timeFrameData = useMemo(() => {
    const result: { [key in TimeFrame]?: number[] } = {};
    
    // 기본 데이터
    result.base = data.items.map(item => item.baseScore);
    
    // 오늘: 큰 변동성
    result.today = data.items.map(item => 
      generateTimeBasedScore(item.baseScore, 1.0, 25)
    );
    
    // 이번달: 중간 변동성
    result.month = data.items.map(item => 
      generateTimeBasedScore(item.baseScore, 1.0, 18)
    );
    
    // 올해: 작은 변동성
    result.year = data.items.map(item => 
      generateTimeBasedScore(item.baseScore, 1.0, 12)
    );
    
    return result;
  }, [data.items]);

  // 최고점 찾기 로직 (기존과 동일)
  const scoreValues = data.items.map(item => item.baseScore);
  const maxScore = Math.max(...scoreValues);
  const maxScoreIndexes = scoreValues.map((score, index) => score === maxScore ? index : -1).filter(index => index !== -1);
  
  // 통일된 시간대 색상 사용 (기존과 동일)
  const timeFrameColors = {
    today: getTimeFrameColors('today'),
    month: getTimeFrameColors('month'),
    year: getTimeFrameColors('year')
  };

  // 시간대별 라벨 (기존과 동일)
  const timeFrameLabels = {
    today: '오늘의 운세',
    month: '이번달 운세',
    year: '올해 운세'
  };

  const chartData = {
    labels: data.items.map(item => item.name),
    datasets: [
      {
        label: '나의 기본 사주',
        data: scoreValues,
        backgroundColor: getTimeFrameColors('base').background,
        borderColor: getTimeFrameColors('base').border,
        // 최고점은 금색으로, 일반점은 기본 색상으로 (기존과 동일)
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
        // 최고점은 더 큰 반지름으로 (기존과 동일)
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
      // 선택된 시간대 데이터셋 추가 (기존과 동일)
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

  // 다크모드 개선된 차트 옵션 사용 (기존과 동일)
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

  const totalScore = scoreValues.reduce((sum, score) => sum + score, 0);
  const averageScore = (totalScore / data.items.length).toFixed(1);

  // 2개 항목일 때 바 차트용 데이터와 옵션
  const barChartData = {
    labels: data.items.map(item => item.name),
    datasets: [
      {
        label: '나의 기본 사주',
        data: scoreValues,
        backgroundColor: scoreValues.map((_, index) => 
          maxScoreIndexes.includes(index) 
            ? '#f59e0b'  // 금색 (최고점)
            : getTimeFrameColors('base').background
        ),
        borderColor: scoreValues.map((_, index) => 
          maxScoreIndexes.includes(index) 
            ? '#f59e0b'  // 금색 (최고점)
            : getTimeFrameColors('base').border
        ),
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false
      }
    ]
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: isDarkMode ? '#374151' : '#f3f4f6',
        titleColor: isDarkMode ? '#ffffff' : '#000000',
        bodyColor: isDarkMode ? '#ffffff' : '#000000',
        borderColor: isDarkMode ? '#6b7280' : '#d1d5db',
        borderWidth: 1,
        callbacks: {
          label: (context: any) => {
            return `${context.dataset.label}: ${context.parsed.y}점`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: isDarkMode ? '#9ca3af' : '#6b7280'
        }
      },
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: isDarkMode ? '#374151' : '#e5e7eb'
        },
        ticks: {
          color: isDarkMode ? '#9ca3af' : '#6b7280'
        }
      }
    }
  };

  // 2개 이하 항목일 때는 바 차트 사용
  const useBarChart = data.items.length <= 2;

  return (
    <div className={CHART_DESIGN_SYSTEM.LAYOUT.chartContainer.wrapper}>
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
          🔮 {data.title} 상세 분석
        </h3>
        {birthDate && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            출생정보: {birthDate}
          </p>
        )}
        {useBarChart && (
          <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
            💡 항목이 적어 막대 차트로 표시됩니다
          </p>
        )}
      </div>

      {/* 차트 영역 - 조건부 렌더링 */}
      <div className="mb-6" style={{ height: CHART_DESIGN_SYSTEM.DIMENSIONS.height }}>
        {useBarChart ? (
          <Bar data={barChartData} options={barOptions} />
        ) : (
          <Radar data={chartData} options={options} />
        )}
      </div>

      {/* 시간대 선택 버튼 - 차트 아래 배치 (기존과 동일) */}
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
                ? CHART_DESIGN_SYSTEM.BUTTON_STYLES.timeFrame.active[key as keyof typeof CHART_DESIGN_SYSTEM.BUTTON_STYLES.timeFrame.active]
                : CHART_DESIGN_SYSTEM.BUTTON_STYLES.timeFrame.inactive
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 점수 카드들 - 통일된 디자인 (기존과 동일) */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {data.items.map((item, index) => {
          const color = CHART_DESIGN_SYSTEM.COLORS.primary[index % CHART_DESIGN_SYSTEM.COLORS.primary.length];
          
          return (
            <div
              key={item.id}
              className={CHART_DESIGN_SYSTEM.SCORE_CARD_STYLES.container}
            >
              <div className="text-center">
                <div className={CHART_DESIGN_SYSTEM.SCORE_CARD_STYLES.icon}>
                  {index % 8 === 0 ? '🌱' : 
                   index % 8 === 1 ? '🧠' : 
                   index % 8 === 2 ? '❤️' : 
                   index % 8 === 3 ? '⚡' : 
                   index % 8 === 4 ? '🍀' : 
                   index % 8 === 5 ? '🌍' : 
                   index % 8 === 6 ? '🎯' : '💎'}
                </div>
                <h4 className={CHART_DESIGN_SYSTEM.SCORE_CARD_STYLES.label}>
                  {item.name}
                </h4>
                <div
                  className={CHART_DESIGN_SYSTEM.SCORE_CARD_STYLES.score}
                  style={{ color }}
                >
                  {item.baseScore}
                </div>
                <div className={CHART_DESIGN_SYSTEM.SCORE_CARD_STYLES.progressBar.container}>
                  <div
                    className={CHART_DESIGN_SYSTEM.SCORE_CARD_STYLES.progressBar.fill}
                    style={{ 
                      backgroundColor: color,
                      width: `${item.baseScore}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 종합 점수 - 기존과 동일 */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-xl p-6 text-center">
        <h3 className="text-xl font-semibold mb-3">종합 {data.title} 지수</h3>
        <div className="text-4xl font-bold mb-2">{totalScore}/{data.items.length * 100}</div>
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

export default UnifiedSajuRadarChart;