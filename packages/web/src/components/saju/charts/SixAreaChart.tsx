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

type TimeFrame = 'none' | 'today' | 'month' | 'year';

const SixAreaChart: React.FC<SixAreaChartProps> = ({ scores, birthDate }) => {
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
    labels: ['근본', '사고', '인연', '행동', '행운', '환경'],
    datasets: [
      {
        label: '나의 기본 사주',
        data: scoreValues,
        backgroundColor: isDarkMode ? 'rgba(96, 165, 250, 0.4)' : 'rgba(102, 126, 234, 0.2)',
        borderColor: isDarkMode ? 'rgb(96, 165, 250)' : 'rgba(102, 126, 234, 1)',
        // 최고점은 금색으로, 일반점은 기본 색상으로
        pointBackgroundColor: scoreValues.map((_, index) => 
          maxScoreIndexes.includes(index) 
            ? isDarkMode ? '#fbbf24' : '#f59e0b'  // 금색 (최고점)
            : isDarkMode ? 'rgb(96, 165, 250)' : 'rgba(102, 126, 234, 1)'  // 기본 색상
        ),
        pointBorderColor: scoreValues.map((_, index) => 
          maxScoreIndexes.includes(index) 
            ? isDarkMode ? '#ffffff' : '#ffffff'  // 최고점 테두리
            : isDarkMode ? '#ffffff' : '#fff'     // 기본 테두리
        ),
        // 최고점은 더 큰 반지름으로
        pointRadius: scoreValues.map((_, index) => 
          maxScoreIndexes.includes(index) 
            ? isDarkMode ? 10 : 8   // 최고점 크기
            : isDarkMode ? 6 : 5    // 일반점 크기
        ),
        pointHoverRadius: scoreValues.map((_, index) => 
          maxScoreIndexes.includes(index) 
            ? isDarkMode ? 12 : 10  // 최고점 호버 크기
            : isDarkMode ? 8 : 7    // 일반점 호버 크기
        ),
        pointHoverBackgroundColor: scoreValues.map((_, index) => 
          maxScoreIndexes.includes(index) 
            ? isDarkMode ? '#fbbf24' : '#f59e0b'  // 최고점 호버 색상
            : isDarkMode ? '#ffffff' : '#fff'     // 일반점 호버 색상
        ),
        pointHoverBorderColor: scoreValues.map((_, index) => 
          maxScoreIndexes.includes(index) 
            ? isDarkMode ? '#ffffff' : '#ffffff'  // 최고점 호버 테두리
            : isDarkMode ? 'rgb(96, 165, 250)' : 'rgba(102, 126, 234, 1)'  // 일반점 호버 테두리
        ),
        borderWidth: isDarkMode ? 5 : 3
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
        borderWidth: 3,
        pointRadius: 4,
        pointHoverRadius: 6
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
            size: 12
          },
          padding: 15
        }
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return `${context.label}: ${context.parsed.r}점`;
          }
        }
      }
    },
    scales: {
      r: {
        angleLines: {
          display: true,
          color: isDarkMode ? 'rgba(203, 213, 225, 0.6)' : 'rgba(0, 0, 0, 0.1)'
        },
        grid: {
          color: isDarkMode ? 'rgba(203, 213, 225, 0.5)' : 'rgba(0, 0, 0, 0.1)'
        },
        pointLabels: {
          font: {
            size: isDarkMode ? 16 : 15,
            weight: 'bold'
          },
          color: isDarkMode ? '#f8fafc' : '#2c3e50'
        },
        suggestedMin: 0,
        suggestedMax: 100,
        ticks: {
          stepSize: 10,
          color: isDarkMode ? '#cbd5e1' : '#7f8c8d',
          backdropColor: 'transparent',
          font: {
            size: isDarkMode ? 12 : 11,
            weight: isDarkMode ? 'bold' : 'normal'
          }
        }
      }
    }
  };

  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
  const averageScore = (totalScore / 6).toFixed(1);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 text-center">
        사주 6대 영역 종합 분석
      </h2>
      
      {birthDate && (
        <div className="text-center text-gray-600 dark:text-gray-400 mb-6">
          <p className="text-sm">{birthDate}</p>
        </div>
      )}

      <div className="relative h-96 mb-4">
        <Radar data={data} options={options} />
      </div>

      {/* Time Frame Toggle Buttons */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">비교 분석:</span>
        
        {/* 기본 사주 버튼 (항상 활성화) */}
        <button
          className="px-4 py-2 rounded-lg text-sm font-medium bg-purple-500 text-white cursor-default"
          disabled
        >
          ✓ 기본 사주
        </button>
        
        {/* 오늘 버튼 */}
        <button
          onClick={() => setSelectedTimeFrame(selectedTimeFrame === 'today' ? 'none' : 'today')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            selectedTimeFrame === 'today'
              ? 'bg-red-500 text-white'
              : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-red-500 dark:hover:border-red-400'
          }`}
        >
          {selectedTimeFrame === 'today' ? '✓' : '+'} 오늘
        </button>
        
        {/* 이번달 버튼 */}
        <button
          onClick={() => setSelectedTimeFrame(selectedTimeFrame === 'month' ? 'none' : 'month')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            selectedTimeFrame === 'month'
              ? 'bg-green-500 text-white'
              : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-green-500 dark:hover:border-green-400'
          }`}
        >
          {selectedTimeFrame === 'month' ? '✓' : '+'} 이번달
        </button>
        
        {/* 올해 버튼 */}
        <button
          onClick={() => setSelectedTimeFrame(selectedTimeFrame === 'year' ? 'none' : 'year')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            selectedTimeFrame === 'year'
              ? 'bg-blue-500 text-white'
              : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-500 dark:hover:border-blue-400'
          }`}
        >
          {selectedTimeFrame === 'year' ? '✓' : '+'} 올해
        </button>
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
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
          
          return (
            <div
              key={key}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg p-4 text-center"
            >
              <div className="text-2xl mb-1">{emojis[index]}</div>
              <h3 className="text-sm font-semibold">{labels[index]}</h3>
              <div className="text-2xl font-bold my-2">{value}</div>
              <p className="text-xs opacity-90">{descriptions[index]}</p>
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