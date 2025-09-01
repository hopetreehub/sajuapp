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
import { SeventeenFortuneScores } from '@/types/saju';
import { CHART_DESIGN_SYSTEM } from '@/constants/chartDesignSystem';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface SeventeenFortuneChartProps {
  scores: SeventeenFortuneScores;
  birthDate?: string;
}

type TimeFrame = 'none' | 'today' | 'month' | 'year';

// 운세별 설정
const fortuneConfig = {
  health: { label: '건강운', icon: '💪', color: '#10b981' },
  marriage: { label: '결혼운', icon: '💑', color: '#ec4899' },
  power: { label: '권력운', icon: '👑', color: '#6366f1' },
  fame: { label: '명예운', icon: '🌟', color: '#f59e0b' },
  accident: { label: '사고운', icon: '⚠️', color: '#ef4444', reverse: true },
  business: { label: '사업운', icon: '💼', color: '#3b82f6' },
  movement: { label: '이동운', icon: '✈️', color: '#06b6d4' },
  separation: { label: '이별운', icon: '💔', color: '#64748b', reverse: true },
  relationship: { label: '인연운', icon: '🤝', color: '#8b5cf6' },
  children: { label: '자식운', icon: '👶', color: '#84cc16' },
  talent: { label: '재능운', icon: '🎨', color: '#a855f7' },
  wealth: { label: '재물운', icon: '💰', color: '#eab308' },
  ancestor: { label: '조상운', icon: '🏛️', color: '#78716c' },
  career: { label: '직업운', icon: '📈', color: '#0ea5e9' },
  family: { label: '집안운', icon: '🏠', color: '#059669' },
  study: { label: '학업운', icon: '📚', color: '#7c3aed' },
  fortune: { label: '행운운', icon: '🍀', color: '#22c55e' }
};

const SeventeenFortuneChart: React.FC<SeventeenFortuneChartProps> = ({ scores, birthDate }) => {
  // 다크모드 실시간 감지
  const [isDarkMode, setIsDarkMode] = useState(false);
  // 시간대 선택 상태
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<TimeFrame>('none');

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
      health: 1.3,
      accident: 0.7,      // 사고운 감소 = 좋음
      movement: 1.4,
      relationship: 1.2,
      wealth: 0.9,
      career: 1.1,
      separation: 0.8,    // 이별운 감소 = 좋음
      // 나머지는 기본값
    },
    month: {
      business: 1.3,
      wealth: 1.2,
      career: 1.25,
      study: 1.2,
      talent: 1.15,
      fame: 1.1,
      // 나머지는 기본값
    },
    year: {
      marriage: 1.2,
      children: 1.3,
      family: 1.25,
      ancestor: 1.1,
      health: 0.9,
      fortune: 1.15,
      // 나머지는 기본값
    }
  };

  // 개선된 시간대별 데이터 생성 함수
  const generateTimeBasedScore = (
    baseScore: number, 
    weight: number = 1.0, 
    variance: number,
    maxLimit: number = 80
  ): number => {
    // 기본 점수를 낮춤 (0.85 배율 적용)
    const adjustedBase = baseScore * 0.85;
    
    // 가중치 적용
    const weightedScore = adjustedBase * weight;
    
    // 변동성 추가
    const randomVariance = (Math.random() - 0.5) * variance;
    const finalScore = weightedScore + randomVariance;
    
    // 최소 15, 최대 maxLimit으로 제한
    return Math.max(15, Math.min(maxLimit, Math.round(finalScore)));
  };

  // 시간대별 데이터 메모이제이션
  const timeFrameData = useMemo(() => {
    const data: { [key in TimeFrame]?: number[] } = {};
    const fortuneKeys = Object.keys(fortuneConfig) as (keyof SeventeenFortuneScores)[];
    
    // 오늘: 단기 영향 운세 중심
    data.today = fortuneKeys.map(key => {
      const weight = timeFrameWeights.today[key] || 1.0;
      return generateTimeBasedScore(scores[key], weight, 20);
    });
    
    // 이번달: 중기 영향 운세 중심
    data.month = fortuneKeys.map(key => {
      const weight = timeFrameWeights.month[key] || 1.0;
      return generateTimeBasedScore(scores[key], weight, 15);
    });
    
    // 올해: 장기 영향 운세 중심
    data.year = fortuneKeys.map(key => {
      const weight = timeFrameWeights.year[key] || 1.0;
      return generateTimeBasedScore(scores[key], weight, 10);
    });
    
    return data;
  }, [scores]);

  // 점수 값 배열
  const scoreValues = Object.keys(fortuneConfig).map(
    key => scores[key as keyof SeventeenFortuneScores]
  );

  // 최고점 찾기 로직 (역방향 운세 제외)
  const normalFortuneIndexes = Object.keys(fortuneConfig).map((key, index) => 
    fortuneConfig[key as keyof typeof fortuneConfig].reverse ? -1 : index
  ).filter(index => index !== -1);
  
  const normalScores = normalFortuneIndexes.map(index => scoreValues[index]);
  const maxScore = Math.max(...normalScores);
  const maxScoreIndexes = scoreValues.map((score, index) => 
    score === maxScore && !fortuneConfig[Object.keys(fortuneConfig)[index] as keyof typeof fortuneConfig].reverse ? index : -1
  ).filter(index => index !== -1);

  // 시간대별 색상 설정
  const timeFrameColors = {
    today: {
      border: '#ef4444',
      background: 'rgba(239, 68, 68, 0.2)'
    },
    month: {
      border: '#10b981',
      background: 'rgba(16, 185, 129, 0.2)'
    },
    year: {
      border: '#3b82f6',
      background: 'rgba(59, 130, 246, 0.2)'
    }
  };

  // 시간대별 라벨
  const timeFrameLabels = {
    today: '오늘의 운세',
    month: '이번달 운세',
    year: '올해 운세'
  };

  const data = {
    labels: Object.values(fortuneConfig).map(config => config.label),
    datasets: [
      {
        label: '나의 기본 운세',
        data: scoreValues,
        backgroundColor: isDarkMode ? 'rgba(139, 92, 246, 0.3)' : 'rgba(147, 51, 234, 0.2)',
        borderColor: isDarkMode ? 'rgb(139, 92, 246)' : 'rgb(147, 51, 234)',
        // 최고점은 금색으로, 일반점은 기본 색상으로
        pointBackgroundColor: scoreValues.map((_, index) => 
          maxScoreIndexes.includes(index) 
            ? isDarkMode ? '#fbbf24' : '#f59e0b'  // 금색 (최고점)
            : isDarkMode ? 'rgb(139, 92, 246)' : 'rgb(147, 51, 234)'  // 기본 색상
        ),
        pointBorderColor: scoreValues.map((_, index) => 
          maxScoreIndexes.includes(index) 
            ? '#ffffff'  // 최고점 테두리
            : '#ffffff'  // 기본 테두리
        ),
        // 최고점은 더 큰 반지름으로
        pointRadius: scoreValues.map((_, index) => 
          maxScoreIndexes.includes(index) ? 8 : 4
        ),
        pointHoverRadius: scoreValues.map((_, index) => 
          maxScoreIndexes.includes(index) ? 10 : 6
        ),
        borderWidth: 2
      },
      // 선택된 시간대 데이터셋 추가
      ...(selectedTimeFrame !== 'none' && timeFrameData[selectedTimeFrame] ? [{
        label: timeFrameLabels[selectedTimeFrame],
        data: timeFrameData[selectedTimeFrame],
        backgroundColor: timeFrameColors[selectedTimeFrame].background,
        borderColor: timeFrameColors[selectedTimeFrame].border,
        pointBackgroundColor: timeFrameColors[selectedTimeFrame].border,
        pointBorderColor: '#ffffff',
        pointHoverBackgroundColor: '#ffffff',
        pointHoverBorderColor: timeFrameColors[selectedTimeFrame].border,
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5
      }] : [])
    ]
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: selectedTimeFrame !== 'none',
        position: 'top' as const,
        labels: {
          color: isDarkMode ? '#f8fafc' : '#2c3e50',
          font: {
            size: 11
          },
          padding: 10
        }
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const index = context.dataIndex;
            const key = Object.keys(fortuneConfig)[index];
            const config = fortuneConfig[key as keyof typeof fortuneConfig];
            const value = context.parsed.r;
            const description = config.reverse 
              ? `${context.dataset.label}: ${value}점 (낮을수록 좋음)`
              : `${context.dataset.label}: ${value}점`;
            return description;
          }
        }
      }
    },
    scales: {
      r: {
        angleLines: {
          display: true,
          color: isDarkMode ? 'rgba(203, 213, 225, 0.3)' : 'rgba(0, 0, 0, 0.1)'
        },
        grid: {
          color: isDarkMode ? 'rgba(203, 213, 225, 0.3)' : 'rgba(0, 0, 0, 0.1)'
        },
        pointLabels: {
          font: {
            size: isDarkMode ? 11 : 10,
            weight: 'bold'
          },
          color: isDarkMode ? '#e2e8f0' : '#334155',
          padding: 5
        },
        suggestedMin: 0,
        suggestedMax: 100,
        ticks: {
          stepSize: 10,
          color: isDarkMode ? '#cbd5e1' : '#94a3b8',
          backdropColor: 'transparent',
          font: {
            size: 9
          },
          display: true
        }
      }
    }
  };

  // 전체 점수 계산
  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
  const averageScore = (totalScore / 17).toFixed(1);

  // 운세 카드를 위한 데이터 정리
  const fortuneItems = Object.entries(fortuneConfig).map(([key, config]) => ({
    key,
    ...config,
    score: scores[key as keyof SeventeenFortuneScores]
  }));

  const getScoreColor = (score: number, reverse: boolean = false) => {
    if (reverse) {
      // 역방향: 낮을수록 좋음
      if (score <= 30) return 'text-green-600 dark:text-green-400';
      if (score <= 50) return 'text-yellow-600 dark:text-yellow-400';
      if (score <= 70) return 'text-orange-600 dark:text-orange-400';
      return 'text-red-600 dark:text-red-400';
    } else {
      // 정방향: 높을수록 좋음
      if (score >= 70) return 'text-green-600 dark:text-green-400';
      if (score >= 50) return 'text-yellow-600 dark:text-yellow-400';
      if (score >= 30) return 'text-orange-600 dark:text-orange-400';
      return 'text-red-600 dark:text-red-400';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 text-center">
        17대 세부운세 종합 분석
      </h2>
      
      {birthDate && (
        <div className="text-center text-gray-600 dark:text-gray-400 mb-6">
          <p className="text-sm">{birthDate}</p>
        </div>
      )}

      <div className="relative h-[500px] mb-4">
        <Radar data={data} options={options} />
      </div>

      {/* 시간대 선택 버튼 - 통일된 디자인 */}
      <div className={`${CHART_DESIGN_SYSTEM.LAYOUT.timeFrameSelector.container} mb-6`}>
        <button
          className={`${CHART_DESIGN_SYSTEM.BUTTON_STYLES.timeFrame.base} ${CHART_DESIGN_SYSTEM.BUTTON_STYLES.timeFrame.active.base}`}
          disabled
        >
          기본
        </button>
        <button
          onClick={() => setSelectedTimeFrame(selectedTimeFrame === 'today' ? 'none' : 'today')}
          className={`${CHART_DESIGN_SYSTEM.BUTTON_STYLES.timeFrame.base} ${
            selectedTimeFrame === 'today'
              ? CHART_DESIGN_SYSTEM.BUTTON_STYLES.timeFrame.active.today
              : CHART_DESIGN_SYSTEM.BUTTON_STYLES.timeFrame.inactive
          }`}
        >
          오늘
        </button>
        <button
          onClick={() => setSelectedTimeFrame(selectedTimeFrame === 'month' ? 'none' : 'month')}
          className={`${CHART_DESIGN_SYSTEM.BUTTON_STYLES.timeFrame.base} ${
            selectedTimeFrame === 'month'
              ? CHART_DESIGN_SYSTEM.BUTTON_STYLES.timeFrame.active.month
              : CHART_DESIGN_SYSTEM.BUTTON_STYLES.timeFrame.inactive
          }`}
        >
          이달
        </button>
        <button
          onClick={() => setSelectedTimeFrame(selectedTimeFrame === 'year' ? 'none' : 'year')}
          className={`${CHART_DESIGN_SYSTEM.BUTTON_STYLES.timeFrame.base} ${
            selectedTimeFrame === 'year'
              ? CHART_DESIGN_SYSTEM.BUTTON_STYLES.timeFrame.active.year
              : CHART_DESIGN_SYSTEM.BUTTON_STYLES.timeFrame.inactive
          }`}
        >
          올해
        </button>
      </div>

      {/* Fortune Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 mb-6">
        {fortuneItems.map(item => (
          <div
            key={item.key}
            className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-lg p-3 text-center"
          >
            <div className="text-2xl mb-1">{item.icon}</div>
            <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-200">
              {item.label}
            </h3>
            <div className={`text-xl font-bold mt-1 ${getScoreColor(item.score, item.reverse)}`}>
              {item.score}
            </div>
            {item.reverse && (
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                (낮을수록 좋음)
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Total Score */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-xl p-4 text-center">
        <h3 className="text-lg font-semibold mb-2">종합 운세 지수</h3>
        <div className="text-3xl font-bold mb-1">{totalScore}/1700</div>
        <div className="text-sm">
          평균 {averageScore}점 - 
          {Number(averageScore) >= 70 ? ' 매우 우수한 운세' :
           Number(averageScore) >= 50 ? ' 양호한 운세' :
           Number(averageScore) >= 30 ? ' 보통 운세' : ' 주의가 필요한 운세'}
        </div>
      </div>
    </div>
  );
};

export default SeventeenFortuneChart;