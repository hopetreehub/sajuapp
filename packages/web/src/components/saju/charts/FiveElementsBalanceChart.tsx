import React, { useMemo } from 'react'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
import { FiveElementsData } from '@/types/fiveElements'
import { FiveElementsAnalyzer } from '@/utils/fiveElementsAnalyzer'
import { SajuData } from '@/types/saju'

// Chart.js 컴포넌트 등록
ChartJS.register(ArcElement, Tooltip, Legend)

interface FiveElementsBalanceChartProps {
  sajuData: SajuData
  height?: number
  className?: string
  showLegend?: boolean
  showTooltips?: boolean
}

export const FiveElementsBalanceChart: React.FC<FiveElementsBalanceChartProps> = ({
  sajuData,
  height = 350,
  className = '',
  showLegend = true,
  showTooltips = true
}) => {
  // 사주 데이터로부터 오행 분석
  const elementsData = useMemo(() => {
    return FiveElementsAnalyzer.analyzeFromSaju(sajuData)
  }, [sajuData])

  // 오행 관계 분석
  const relationships = useMemo(() => {
    return FiveElementsAnalyzer.analyzeElementRelationships(elementsData)
  }, [elementsData])

  // 추천사항 생성
  const recommendations = useMemo(() => {
    return FiveElementsAnalyzer.generateRecommendations(elementsData, relationships)
  }, [elementsData, relationships])

  // 오행 세부 정보
  const elementDetails = useMemo(() => {
    return FiveElementsAnalyzer.getElementDetails()
  }, [])

  // Chart.js용 데이터 생성
  const chartData = useMemo(() => {
    return FiveElementsAnalyzer.generateChartData(elementsData)
  }, [elementsData])

  // 차트 옵션 설정
  const options: ChartOptions<'doughnut'> = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: showLegend,
        position: 'right' as const,
        labels: {
          font: {
            family: 'Noto Sans KR, sans-serif',
            size: 12
          },
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle',
          generateLabels: (chart) => {
            const datasets = chart.data.datasets
            if (datasets.length > 0) {
              const dataset = datasets[0]
              return chart.data.labels?.map((label, index) => {
                const value = dataset.data[index] as number
                const total = (dataset.data as number[]).reduce((sum, val) => sum + val, 0)
                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0'
                
                return {
                  text: `${label} (${percentage}%)`,
                  fillStyle: dataset.backgroundColor?.[index] as string || '#000',
                  strokeStyle: dataset.borderColor?.[index] as string || '#000',
                  lineWidth: 2,
                  hidden: false,
                  index
                }
              }) || []
            }
            return []
          }
        }
      },
      tooltip: {
        enabled: showTooltips,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        titleFont: {
          family: 'Noto Sans KR, sans-serif',
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          family: 'Noto Sans KR, sans-serif',
          size: 12
        },
        callbacks: {
          label: function(context) {
            const label = context.label || ''
            const value = context.parsed as number
            const total = context.dataset.data.reduce((sum: number, val) => sum + (val as number), 0)
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0'
            
            // 오행별 특성 정보 추가
            const elementKey = Object.keys(elementsData)[context.dataIndex] as keyof FiveElementsData
            const detail = elementDetails[elementKey]
            
            return [
              `${label}: ${value}점 (${percentage}%)`,
              `특성: ${detail.characteristics.positive.join(', ')}`
            ]
          }
        }
      }
    },
    cutout: '50%',  // 도넛 형태 (중앙 구멍 크기)
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1000
    }
  }), [showLegend, showTooltips, elementsData, elementDetails])

  // 균형 상태 평가
  const getBalanceStatus = () => {
    const score = relationships.balance_score
    if (score >= 80) return { status: '매우 균형', color: 'text-green-600', icon: '🟢' }
    if (score >= 60) return { status: '균형 양호', color: 'text-blue-600', icon: '🔵' }
    if (score >= 40) return { status: '보통', color: 'text-yellow-600', icon: '🟡' }
    return { status: '불균형', color: 'text-red-600', icon: '🔴' }
  }

  const balanceStatus = getBalanceStatus()

  // 데이터가 없는 경우
  const hasData = Object.values(elementsData).some(value => value > 0)
  if (!hasData) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height }}>
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-2">📊</div>
          <div className="text-lg font-medium">오행 데이터가 없습니다</div>
          <div className="text-sm">사주 정보를 확인해주세요</div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 ${className}`}>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
            🎯 오행 균형도
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            목, 화, 토, 금, 수 다섯 요소의 조화 상태
          </p>
        </div>
        <div className="text-right">
          <div className={`text-sm font-medium ${balanceStatus.color} flex items-center`}>
            <span className="mr-1">{balanceStatus.icon}</span>
            {balanceStatus.status}
          </div>
          <div className="text-xs text-gray-500">
            균형점수: {relationships.balance_score.toFixed(0)}점
          </div>
        </div>
      </div>

      {/* 차트 영역 */}
      <div className="relative mb-6" style={{ height: height - 150 }}>
        <Doughnut data={chartData} options={options} />
        
        {/* 중앙 요약 정보 */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800 dark:text-white">
              {relationships.balance_score.toFixed(0)}
            </div>
            <div className="text-xs text-gray-500">균형점수</div>
          </div>
        </div>
      </div>

      {/* 분석 결과 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        {/* 강한 오행 */}
        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
          <div className="font-medium text-green-800 dark:text-green-200 mb-1">
            💪 강한 오행
          </div>
          {relationships.dominant_elements.length > 0 ? (
            <div className="text-green-700 dark:text-green-300">
              {relationships.dominant_elements.map(element => 
                elementDetails[element as keyof FiveElementsData].korean
              ).join(', ')}
            </div>
          ) : (
            <div className="text-green-600 dark:text-green-400 text-xs">
              균형적 분포
            </div>
          )}
        </div>

        {/* 약한 오행 */}
        <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
          <div className="font-medium text-red-800 dark:text-red-200 mb-1">
            ⚠️ 약한 오행
          </div>
          {relationships.weak_elements.length > 0 ? (
            <div className="text-red-700 dark:text-red-300">
              {relationships.weak_elements.map(element => 
                elementDetails[element as keyof FiveElementsData].korean
              ).join(', ')}
            </div>
          ) : (
            <div className="text-red-600 dark:text-red-400 text-xs">
              특별히 약한 요소 없음
            </div>
          )}
        </div>

        {/* 추천 색상 */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
          <div className="font-medium text-blue-800 dark:text-blue-200 mb-1">
            🎨 추천 색상
          </div>
          {recommendations.colors.beneficial.length > 0 ? (
            <div className="flex items-center space-x-2">
              <div 
                className="w-4 h-4 rounded"
                style={{ backgroundColor: recommendations.colors.beneficial[0].hex }}
              ></div>
              <span className="text-blue-700 dark:text-blue-300 text-xs">
                {recommendations.colors.beneficial[0].name}
              </span>
            </div>
          ) : (
            <div className="text-blue-600 dark:text-blue-400 text-xs">
              균형 유지
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FiveElementsBalanceChart