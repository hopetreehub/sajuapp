import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
);

interface YearlyFortune {
  year: number
  age: number
  totalScore: number
  fortune: number      // 행운 (녹색)
  willpower: number    // 의지 (주황색)
  environment: number  // 환경 (파랑색)
  change: number       // 변화 (보라색)
  대운: {
    천간: string
    지지: string
    오행: string
    score: number
  }
  세운: {
    천간: string
    지지: string
    오행: string
    score: number
  }
}

interface HundredYearChartProps {
  data: YearlyFortune[]
  currentAge?: number
  birthYear?: number
}

export default function HundredYearChart({ data, currentAge = 0, birthYear }: HundredYearChartProps) {
  // 현재 연도와 출생연도 계산
  const currentYear = new Date().getFullYear();
  const actualBirthYear = birthYear || (currentAge > 0 ? currentYear - currentAge + 1 : currentYear - 35);
  
  const chartData = useMemo(() => {
    const labels = data.map(d => {
      const year = actualBirthYear + d.age - 1;
      return `${year}년`;
    });
    
    // 막대 그래프용 데이터 (종합 운세)
    const barData = data.map(d => d.totalScore);
    
    // 선 그래프용 데이터 (4가지 기운)
    const fortuneData = data.map(d => d.fortune);
    const willpowerData = data.map(d => d.willpower);
    const environmentData = data.map(d => d.environment);
    const changeData = data.map(d => d.change);

    return {
      labels,
      datasets: [
        // 막대 차트 - 종합 운세 (회색으로 변경)
        {
          type: 'bar' as const,
          label: '종합 운세',
          data: barData,
          backgroundColor: (context: any) => {
            const index = context.dataIndex;
            const age = data[index]?.age;
            // 현재 나이 강조
            if (age === currentAge) return 'rgba(55, 65, 81, 0.8)';  // gray-700
            return 'rgba(156, 163, 175, 0.6)';  // gray-400
          },
          borderColor: (context: any) => {
            const index = context.dataIndex;
            const age = data[index]?.age;
            // 현재 나이 강조
            if (age === currentAge) return 'rgba(55, 65, 81, 1)';  // gray-700
            return 'rgba(107, 114, 128, 1)';  // gray-500
          },
          borderWidth: 1,
          yAxisID: 'y',
          order: 2,
        },
        // 선 차트들 - 4가지 기운 (점 제거)
        {
          type: 'line' as const,
          label: '행운 (재물·명예)',
          data: fortuneData,
          borderColor: '#10b981', // 녹색
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 2,
          pointRadius: 0,        // 점 제거
          pointHoverRadius: 3,   // 호버 시에만 작은 점
          tension: 0.4,
          yAxisID: 'y',
          order: 1,
        },
        {
          type: 'line' as const,
          label: '의지 (추진력·실행)',
          data: willpowerData,
          borderColor: '#f97316', // 주황색
          backgroundColor: 'rgba(249, 115, 22, 0.1)',
          borderWidth: 2,
          pointRadius: 0,        // 점 제거
          pointHoverRadius: 3,   // 호버 시에만 작은 점
          tension: 0.4,
          yAxisID: 'y',
          order: 1,
        },
        {
          type: 'line' as const,
          label: '환경 (대인·지원)',
          data: environmentData,
          borderColor: '#3b82f6', // 파랑색
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 2,
          pointRadius: 0,        // 점 제거
          pointHoverRadius: 3,   // 호버 시에만 작은 점
          tension: 0.4,
          yAxisID: 'y',
          order: 1,
        },
        {
          type: 'line' as const,
          label: '변화 (기회·위기)',
          data: changeData,
          borderColor: '#8b5cf6', // 보라색
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          borderWidth: 2,
          pointRadius: 0,        // 점 제거
          pointHoverRadius: 3,   // 호버 시에만 작은 점
          tension: 0.4,
          yAxisID: 'y',
          order: 1,
        },
      ],
    };
  }, [data, actualBirthYear, currentAge]);

  const options: ChartOptions<'bar' | 'line'> = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      title: {
        display: true,
        text: '100년 인생운세 차트',
        font: {
          size: 18,
          weight: 'bold',
        },
        padding: 20,
      },
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
          },
        },
        title: {
          padding: {
            top: 35,
            bottom: 10,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        // 툴팁을 차트 하단에 고정
        position: 'nearest' as const,
        yAlign: 'bottom' as const,
        callbacks: {
          title: (context) => {
            const index = context[0].dataIndex;
            const yearData = data[index];
            const year = actualBirthYear + yearData.age - 1;
            return `${year}년 (${yearData.age}세)`;
          },
          afterLabel: (context) => {
            const index = context.dataIndex;
            const yearData = data[index];
            if (context.dataset.label === '종합 운세') {
              return [
                `대운: ${yearData.대운.천간}${yearData.대운.지지} (${yearData.대운.오행})`,
                `세운: ${yearData.세운.천간}${yearData.세운.지지} (${yearData.세운.오행})`,
              ];
            }
            return [];
          },
        },
        // 커스텀 툴팁 위치 설정
        external(context: any) {
          const {chart, tooltip} = context;
          const chartElement = chart.canvas;
          
          if (!tooltip || !tooltip.opacity) {
            return;
          }
          
          // 툴팁 요소 가져오기 또는 생성
          let tooltipEl = chartElement.parentNode.querySelector('div.chartjs-tooltip');
          
          if (!tooltipEl) {
            tooltipEl = document.createElement('div');
            tooltipEl.className = 'chartjs-tooltip';
            tooltipEl.style.cssText = `
              position: absolute;
              background: rgba(0, 0, 0, 0.9);
              color: white;
              padding: 12px 16px;
              border-radius: 8px;
              font-size: 13px;
              pointer-events: none;
              transition: all 0.1s ease;
              z-index: 1000;
              min-width: 200px;
              border: 1px solid rgba(255, 255, 255, 0.2);
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            `;
            chartElement.parentNode.appendChild(tooltipEl);
          }
          
          // 툴팁 내용 설정
          if (tooltip.body) {
            const titleLines = tooltip.title || [];
            const bodyLines = tooltip.body.map((bodyItem: any) => bodyItem.lines);
            
            let innerHtml = '<div style="font-weight: bold; margin-bottom: 8px; font-size: 14px;">';
            titleLines.forEach((title: string) => {
              innerHtml += title;
            });
            innerHtml += '</div>';
            
            bodyLines.forEach((body: string[], i: number) => {
              const colors = tooltip.labelColors[i];
              if (colors) {
                const style = `background:${  colors.backgroundColor  }; width: 12px; height: 12px; display: inline-block; margin-right: 8px; border-radius: 2px;`;
                innerHtml += `<div style="margin: 4px 0;"><span style="${  style  }"></span>${  body  }</div>`;
              } else {
                innerHtml += `<div style="margin: 4px 0; color: #cbd5e1; font-size: 12px;">${  body  }</div>`;
              }
            });
            
            tooltipEl.innerHTML = innerHtml;
          }
          
          // 툴팅 위치 계산 - 차트 영점선 아래 공간에 고정
          const position = chart.canvas.getBoundingClientRect();
          const chartArea = chart.chartArea;
          const tooltipHeight = tooltipEl.offsetHeight;
          
          // X 위치는 마우스를 따라가되 화면 밖으로 나가지 않도록
          let left = position.left + window.pageXOffset + tooltip.caretX;
          const tooltipWidth = tooltipEl.offsetWidth;
          
          if (left + tooltipWidth > window.innerWidth) {
            left = window.innerWidth - tooltipWidth - 10;
          }
          
          // Y 위치는 차트 영점선(Y=0) 아래 여백 공간에 고정
          const chartBottom = chartArea.bottom;
          const canvasBottom = position.height;
          const availableSpace = canvasBottom - chartBottom;
          
          // 영점선 아래 여백 공간 중앙에 배치
          const top = position.top + window.pageYOffset + chartBottom + (availableSpace - tooltipHeight) / 2;
          
          tooltipEl.style.left = `${left  }px`;
          tooltipEl.style.top = `${top  }px`;
          tooltipEl.style.opacity = '1';
        },
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: '연도',
          font: {
            size: 14,
          },
        },
        ticks: {
          callback(value: any, index: number) {
            // 10년 단위로만 표시
            if (index % 10 === 0) {
              const year = actualBirthYear + data[index]?.age - 1;
              return `${year}년`;
            }
            return '';
          },
          font: {
            size: 11,
          },
        },
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: '운세 점수',
          font: {
            size: 14,
          },
        },
        min: 0,
        max: 100,
        ticks: {
          stepSize: 20,
          font: {
            size: 11,
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  }), [data, actualBirthYear]);

  // 현재 나이 표시용 플러그인
  const currentAgePlugin = useMemo(() => ({
    id: 'currentAgeIndicator',
    afterDraw: (chart: any) => {
      if (!currentAge || currentAge <= 0) return;
      
      const ctx = chart.ctx;
      const chartArea = chart.chartArea;
      const meta = chart.getDatasetMeta(0);
      
      // 현재 나이에 해당하는 인덱스 찾기
      const currentIndex = data.findIndex(d => d.age === currentAge);
      if (currentIndex === -1) return;
      
      const x = meta.data[currentIndex]?.x;
      if (!x) return;
      
      // 수직선 그리기
      ctx.save();
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(x, chartArea.top);
      ctx.lineTo(x, chartArea.bottom);
      ctx.stroke();
      
      // 현재 나이 라벨
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      const currentYearLabel = actualBirthYear + currentAge - 1;
      ctx.fillText(`현재 ${currentYearLabel}년 (${currentAge}세)`, x, chartArea.top - 40);
      ctx.restore();
    },
  }), [currentAge, data, actualBirthYear]);

  return (
    <div className="w-full">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            100년 인생운세 차트
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            전통 사주학의 대운(大運)과 세운(歲運)을 기반으로 한 100년간의 인생 운세를 시각화합니다.
          </p>
        </div>
        
        {/* 범례 설명 */}
        <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-gray-700 dark:text-gray-300">행운: 재물·명예·성공</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-orange-500 rounded"></div>
            <span className="text-gray-700 dark:text-gray-300">의지: 추진력·실행력</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-gray-700 dark:text-gray-300">환경: 대인관계·지원</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-purple-500 rounded"></div>
            <span className="text-gray-700 dark:text-gray-300">변화: 기회·위기·변동</span>
          </div>
        </div>

        {/* 차트 영역 - 상하단 여백 추가 */}
        <div className="relative h-96 md:h-[500px] pt-8 pb-24">
          <Chart
            type="bar"
            data={chartData}
            options={options}
            plugins={[currentAgePlugin]}
          />
        </div>

        {/* 주요 전환점 안내 */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
            인생 주요 전환점
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <span className="font-medium">20-30세:</span> 기반 구축기
            </div>
            <div>
              <span className="font-medium">40-50세:</span> 성취 발전기
            </div>
            <div>
              <span className="font-medium">60-70세:</span> 완성 안정기
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}