import React, { useState, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';

import {
  UniversalLifeChartData,
  ChartDimensionType,
  DEFAULT_CHART_CONFIG,
  DIMENSION_NAMES,
  DIMENSION_DESCRIPTIONS,
} from '@/types/universalLifeChart';

// Chart.js 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  annotationPlugin,
);

interface UniversalLifeChartProps {
  data: UniversalLifeChartData;
  selectedDimensions?: ChartDimensionType[];
  height?: number;
  showControls?: boolean;
}

export default function UniversalLifeChart({
  data,
  selectedDimensions = ['geunbon', 'woon', 'haeng', 'hyeong', 'byeon'],
  height = 400,
  showControls = true,
}: UniversalLifeChartProps) {
  const [activeDimensions, setActiveDimensions] = useState<ChartDimensionType[]>(selectedDimensions);
  const [viewMode, setViewMode] = useState<'line' | 'bar' | 'combined'>('combined');
  const [_zoomRange, _setZoomRange] = useState<{ start: number; end: number } | null>(null);
  const chartRef = useRef<ChartJS<'line'>>(null);

  // 차트 데이터 생성
  const chartData = {
    labels: generateYearLabels(data.timeline),
    datasets: createDatasets(data.chartData, activeDimensions, viewMode),
  };

  // 차트 옵션
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        min: -2.0,
        max: 2.0,
        grid: {
          color: '#E5E7EB',
          borderColor: '#D1D5DB',
        },
        ticks: {
          stepSize: 0.5,
          callback(value: any) {
            if (value === 0) return '기준선';
            if (value > 0) return `+${value}`;
            return value.toString();
          },
          font: {
            size: 12,
          },
        },
        title: {
          display: true,
          text: '운세 지수',
          font: {
            size: 14,
            weight: 'bold' as const,
          },
        },
      },
      x: {
        grid: {
          color: '#F3F4F6',
        },
        ticks: {
          maxTicksLimit: 20,
          callback(value: any, index: number) {
            const year = data.timeline.startYear + index;
            const age = index;

            // 10년 단위로 표시
            if (age % 10 === 0) {
              return `${year}\n(${age}세)`;
            }
            return '';
          },
          font: {
            size: 11,
          },
        },
        title: {
          display: true,
          text: '연도 (나이)',
          font: {
            size: 14,
            weight: 'bold' as const,
          },
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          font: {
            size: 13,
          },
          generateLabels(_chart: ChartJS) {
            return activeDimensions.map((dim, index) => ({
              text: `${DIMENSION_NAMES[dim]} (${DIMENSION_DESCRIPTIONS[dim]})`,
              fillStyle: DEFAULT_CHART_CONFIG.colors[dim],
              strokeStyle: DEFAULT_CHART_CONFIG.colors[dim],
              pointStyle: 'circle',
              datasetIndex: index,
            }));
          },
        },
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          title(context: any) {
            const index = context[0].dataIndex;
            const year = data.timeline.startYear + index;
            const age = index;
            return `${year}년 (${age}세)`;
          },
          label(context: any) {
            const dimensionIndex = context.datasetIndex;
            const dimension = activeDimensions[dimensionIndex];
            const value = context.parsed.y;
            const interpretation = getValueInterpretation(value);

            return `${DIMENSION_NAMES[dimension]}: ${value.toFixed(2)} (${interpretation})`;
          },
          afterBody(context: any) {
            const index = context[0].dataIndex;
            const age = index;
            const phase = data.chartData.geunbon[index]?.phase;

            return [`인생 단계: ${getPhaseKorean(phase)}`, `연령대 특성: ${getAgeCharacteristics(age)}`];
          },
        },
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#374151',
        borderWidth: 1,
      },
      annotation: {
        annotations: {
          currentAge: {
            type: 'line',
            xMin: data.timeline.currentAge,
            xMax: data.timeline.currentAge,
            borderColor: '#3B82F6',
            borderWidth: 3,
            borderDash: [5, 5],
            label: {
              content: `현재 ${data.timeline.currentAge}세`,
              enabled: true,
              position: 'top',
              backgroundColor: '#3B82F6',
              color: '#ffffff',
              font: {
                size: 12,
                weight: 'bold' as const,
              },
            },
          },
          zeroLine: {
            type: 'line',
            yMin: 0,
            yMax: 0,
            borderColor: '#6B7280',
            borderWidth: 2,
            borderDash: [3, 3],
            label: {
              content: '중립선',
              enabled: true,
              position: 'start',
              color: '#6B7280',
            },
          },
        },
      },
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    elements: {
      point: {
        radius: 2,
        hoverRadius: 6,
      },
      line: {
        tension: 0.2,
        borderWidth: 3,
      },
    },
  };

  // 차원 토글 함수
  const toggleDimension = (dimension: ChartDimensionType) => {
    setActiveDimensions(prev =>
      prev.includes(dimension)
        ? prev.filter(d => d !== dimension)
        : [...prev, dimension],
    );
  };

  // 전체/개별 차원 선택
  const selectAllDimensions = () => {
    setActiveDimensions(['geunbon', 'woon', 'haeng', 'hyeong', 'byeon']);
  };

  const _selectSingleDimension = (dimension: ChartDimensionType) => {
    setActiveDimensions([dimension]);
  };

  return (
    <div className="universal-life-chart bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      {/* 헤더 */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          📊 {data.personalInfo.name}님의 인생차트
        </h2>
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <div>📅 생년월일: {data.personalInfo.birthDate} ({data.personalInfo.lunarSolar === 'lunar' ? '음력' : '양력'})</div>
          <div>🕐 생시: {data.personalInfo.birthTime}</div>
          <div>🔮 사주: {data.personalInfo.sajuText}</div>
          <div>📈 인생 진척도: {data.timeline.lifeProgress.toFixed(1)}% (현재 {data.timeline.currentAge}세)</div>
        </div>
      </div>

      {/* 컨트롤 패널 */}
      {showControls && (
        <div className="mb-6 space-y-4">
          {/* 차원 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              표시할 차원 선택:
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {(['geunbon', 'woon', 'haeng', 'hyeong', 'byeon'] as ChartDimensionType[]).map((dimension) => (
                <button
                  key={dimension}
                  onClick={() => toggleDimension(dimension)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    activeDimensions.includes(dimension)
                      ? 'text-white shadow-md'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                  style={{
                    backgroundColor: activeDimensions.includes(dimension)
                      ? DEFAULT_CHART_CONFIG.colors[dimension]
                      : undefined,
                  }}
                >
                  {DIMENSION_NAMES[dimension]}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={selectAllDimensions}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                전체 선택
              </button>
              <button
                onClick={() => setActiveDimensions([])}
                className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                전체 해제
              </button>
            </div>
          </div>

          {/* 보기 모드 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              표시 모드:
            </label>
            <div className="flex gap-2">
              {[
                { value: 'line', label: '선형 차트' },
                { value: 'combined', label: '통합 차트' },
              ].map((mode) => (
                <button
                  key={mode.value}
                  onClick={() => setViewMode(mode.value as any)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    viewMode === mode.value
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 차트 영역 */}
      <div className="chart-container" style={{ height: `${height}px` }}>
        {activeDimensions.length > 0 ? (
          <Line ref={chartRef} data={chartData} options={chartOptions} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            표시할 차원을 선택해주세요
          </div>
        )}
      </div>

      {/* 범례 설명 */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeDimensions.map((dimension) => (
          <div
            key={dimension}
            className="p-3 rounded-lg border"
            style={{ borderColor: DEFAULT_CHART_CONFIG.colors[dimension] }}
          >
            <div className="flex items-center gap-2 mb-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: DEFAULT_CHART_CONFIG.colors[dimension] }}
              />
              <span className="font-medium text-gray-900 dark:text-white">
                {DIMENSION_NAMES[dimension]}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {DIMENSION_DESCRIPTIONS[dimension]}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// 유틸리티 함수들
function generateYearLabels(timeline: any): string[] {
  const labels = [];
  for (let age = 0; age <= 95; age++) {
    labels.push((timeline.startYear + age).toString());
  }
  return labels;
}

function createDatasets(chartData: any, activeDimensions: ChartDimensionType[], viewMode: string) {
  return activeDimensions.map((dimension) => {
    const data = chartData[dimension]?.map((point: any) => point.value) || [];

    return {
      label: DIMENSION_NAMES[dimension],
      data,
      borderColor: DEFAULT_CHART_CONFIG.colors[dimension],
      backgroundColor: `${DEFAULT_CHART_CONFIG.colors[dimension]}20`,
      pointBackgroundColor: DEFAULT_CHART_CONFIG.colors[dimension],
      pointBorderColor: DEFAULT_CHART_CONFIG.colors[dimension],
      pointHoverBackgroundColor: DEFAULT_CHART_CONFIG.colors[dimension],
      pointHoverBorderColor: '#ffffff',
      fill: viewMode === 'combined',
      tension: 0.2,
    };
  });
}

function getValueInterpretation(value: number): string {
  if (value >= 1.5) return '매우 좋음';
  if (value >= 1.0) return '좋음';
  if (value >= 0.5) return '양호함';
  if (value >= -0.5) return '보통';
  if (value >= -1.0) return '주의';
  if (value >= -1.5) return '어려움';
  return '매우 어려움';
}

function getPhaseKorean(phase: string | undefined): string {
  const phaseMap: Record<string, string> = {
    childhood: '유아동기',
    youth: '청소년기',
    early_adult: '청년기',
    middle_adult: '중년전기',
    late_adult: '중년후기',
    senior: '노년전기',
    elder: '노년후기',
  };
  return phaseMap[phase || ''] || '미분류';
}

function getAgeCharacteristics(age: number): string {
  if (age <= 12) return '성장과 발달';
  if (age <= 22) return '학습과 탐색';
  if (age <= 35) return '도전과 성취';
  if (age <= 50) return '안정과 발전';
  if (age <= 65) return '성숙과 지혜';
  if (age <= 80) return '여유와 전수';
  return '완성과 회고';
}