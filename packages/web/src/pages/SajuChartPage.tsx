import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSajuSettingsStore } from '@/stores/sajuSettingsStore'
import { SajuCalculator, formatFourPillarsDetailed } from '@/utils/sajuCalculator'
import { FiveElementsBalanceChart } from '@/components/saju/charts/FiveElementsBalanceChart'
import { TenGodsDistributionChart } from '@/components/saju/charts/TenGodsDistributionChart'
import { BirthInfoHeader } from '@/components/saju/BirthInfoHeader'
import { SajuData } from '@/types/saju'

const SajuChartPage: React.FC = () => {
  const navigate = useNavigate()
  const { birthInfo } = useSajuSettingsStore()
  const [activeChart, setActiveChart] = useState<'fiveElements' | 'tenGods'>('fiveElements')
  const [chartType, setChartType] = useState<'bar' | 'doughnut'>('bar')

  // 사주 데이터 계산
  const sajuData = useMemo((): SajuData | null => {
    if (!birthInfo) return null
    
    try {
      const fourPillars = SajuCalculator.calculateFourPillars(birthInfo)
      const result = {
        birthInfo,
        fourPillars: {
          year: { heavenly: fourPillars.year.heavenly, earthly: fourPillars.year.earthly },
          month: { heavenly: fourPillars.month.heavenly, earthly: fourPillars.month.earthly },
          day: { heavenly: fourPillars.day.heavenly, earthly: fourPillars.day.earthly },
          hour: { heavenly: fourPillars.hour.heavenly, earthly: fourPillars.hour.earthly }
        },
        sixAreas: {
          foundation: 75,
          thinking: 68,
          relationship: 82,
          action: 71,
          luck: 65,
          environment: 78
        },
        fiveElements: {
          wood: 22,
          fire: 18,
          earth: 25,
          metal: 20,
          water: 15
        },
        tenGods: {
          bijeon: 12,
          geopjae: 8,
          siksin: 10,
          sanggwan: 7,
          jeongjae: 11,
          pyeonjae: 9,
          jeonggwan: 13,
          pyeongwan: 10,
          jeongin: 11,
          pyeongin: 9
        },
        totalScore: 439,
        averageScore: 73.2
      }
      return {
        ...result,
        dayMaster: fourPillars.day.heavenly,
        personalityTraits: {
          emotion: 75,
          logic: 80,
          artistic: 65,
          rational: 70,
          character: 85,
          intelligence: 78,
          learning: 72
        },
        seventeenFortunes: {
          health: 75,
          marriage: 68,
          power: 72,
          fame: 65,
          accident: 30,
          business: 78,
          movement: 60,
          separation: 35,
          relationship: 82,
          children: 70,
          talent: 85,
          wealth: 73,
          ancestor: 65,
          career: 80,
          family: 77,
          study: 75,
          fortune: 70
        }
      }
    } catch (error) {
      console.error('사주 계산 오류:', error)
      return null
    }
  }, [birthInfo])

  // 생년월일 정보가 없는 경우
  if (!birthInfo || !sajuData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              사주 정보가 필요합니다
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              차트를 확인하려면 먼저 생년월일 정보를 입력해주세요.
            </p>
            <button
              onClick={() => navigate('/settings')}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              생년월일 입력하기
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto p-6">
        {/* 헤더 */}
        <div className="mb-8">
          <BirthInfoHeader
            birthInfo={birthInfo}
            fourPillars={{
              year: { heavenly: sajuData.fourPillars.year.heavenly, earthly: sajuData.fourPillars.year.earthly, combined: `${sajuData.fourPillars.year.heavenly}${sajuData.fourPillars.year.earthly}` },
              month: { heavenly: sajuData.fourPillars.month.heavenly, earthly: sajuData.fourPillars.month.earthly, combined: `${sajuData.fourPillars.month.heavenly}${sajuData.fourPillars.month.earthly}` },
              day: { heavenly: sajuData.fourPillars.day.heavenly, earthly: sajuData.fourPillars.day.earthly, combined: `${sajuData.fourPillars.day.heavenly}${sajuData.fourPillars.day.earthly}` },
              hour: { heavenly: sajuData.fourPillars.hour.heavenly, earthly: sajuData.fourPillars.hour.earthly, combined: `${sajuData.fourPillars.hour.heavenly}${sajuData.fourPillars.hour.earthly}` }
            }}
            userName={birthInfo.name}
            showEditButton
            onEditClick={() => navigate('/settings')}
          />
        </div>

        {/* 차트 선택 탭 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveChart('fiveElements')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeChart === 'fiveElements'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                🎯 오행균형도
              </button>
              <button
                onClick={() => setActiveChart('tenGods')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeChart === 'tenGods'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                ⭐ 십성분포도
              </button>
            </div>

            {/* 차트 타입 선택 (십성분포도일 때만) */}
            {activeChart === 'tenGods' && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">차트 타입:</span>
                <div className="flex rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
                  <button
                    onClick={() => setChartType('bar')}
                    className={`px-3 py-1 text-sm transition-colors ${
                      chartType === 'bar'
                        ? 'bg-blue-500 text-white'
                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                  >
                    막대
                  </button>
                  <button
                    onClick={() => setChartType('doughnut')}
                    className={`px-3 py-1 text-sm transition-colors ${
                      chartType === 'doughnut'
                        ? 'bg-blue-500 text-white'
                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                  >
                    도넛
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 차트 영역 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 메인 차트 */}
          <div className="lg:col-span-2">
            {activeChart === 'fiveElements' ? (
              <FiveElementsBalanceChart
                sajuData={sajuData}
                height={450}
                showLegend={true}
                showTooltips={true}
              />
            ) : (
              <TenGodsDistributionChart
                sajuData={sajuData}
                height={450}
                chartType={chartType}
                showCategory={true}
              />
            )}
          </div>
        </div>

        {/* 추가 정보 섹션 */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 총점 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">총점</div>
                <div className="text-2xl font-bold text-gray-800 dark:text-white">
                  {sajuData.totalScore.toFixed(0)}점
                </div>
              </div>
              <div className="text-4xl">💯</div>
            </div>
          </div>

          {/* 평균 점수 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">평균</div>
                <div className="text-2xl font-bold text-gray-800 dark:text-white">
                  {sajuData.averageScore.toFixed(1)}점
                </div>
              </div>
              <div className="text-4xl">📊</div>
            </div>
          </div>

          {/* 일간 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">일간</div>
                <div className="text-2xl font-bold text-gray-800 dark:text-white">
                  {sajuData.dayMaster}
                </div>
              </div>
              <div className="text-4xl">☯️</div>
            </div>
          </div>
        </div>

        {/* 네비게이션 버튼 */}
        <div className="mt-8 flex justify-center space-x-4">
          <button
            onClick={() => navigate('/saju')}
            className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            사주 분석으로
          </button>
          <button
            onClick={() => navigate('/six-areas')}
            className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            6대 영역 분석
          </button>
        </div>
      </div>
    </div>
  )
}

export default SajuChartPage