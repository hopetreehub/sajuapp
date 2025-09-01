import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSajuSettingsStore } from '@/stores/sajuSettingsStore'
import { calculateSajuData } from '@/utils/sajuDataCalculator'
import { interpretationService, InterpretationResponse } from '@/services/api'
import { BirthInfoHeader } from '@/components/saju/BirthInfoHeader'
import InterpretationPanel from '@/components/charts/InterpretationPanel'
import { SajuData } from '@/types/saju'

// 카테고리 정보
const INTERPRETATION_CATEGORIES = [
  { id: 'basic', name: '기본 분석', icon: '🔍', color: 'blue' },
  { id: 'personality', name: '성격 분석', icon: '🧠', color: 'purple' },
  { id: 'fortune', name: '운세 분석', icon: '🌟', color: 'yellow' },
  { id: 'career', name: '직업 지도', icon: '💼', color: 'green' },
  { id: 'relationship', name: '관계 분석', icon: '❤️', color: 'red' },
  { id: 'health', name: '건강 지도', icon: '🏥', color: 'cyan' },
  { id: 'spiritual', name: '신살 분석', icon: '⚡', color: 'indigo' },
  { id: 'johoo', name: '조후 분석', icon: '🌡️', color: 'orange' }
] as const

type CategoryId = typeof INTERPRETATION_CATEGORIES[number]['id']

const InterpretationPage: React.FC = () => {
  const navigate = useNavigate()
  const { birthInfo } = useSajuSettingsStore()
  const [activeCategory, setActiveCategory] = useState<CategoryId>('basic')
  const [interpretation, setInterpretation] = useState<InterpretationResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 사주 데이터 계산
  const sajuData = useMemo((): SajuData | null => {
    if (!birthInfo) return null
    
    try {
      return calculateSajuData(birthInfo)
    } catch (error) {
      console.error('사주 계산 오류:', error)
      return null
    }
  }, [birthInfo])

  // 종합 해석 데이터 로드
  useEffect(() => {
    const loadInterpretation = async () => {
      if (!sajuData) return
      
      setLoading(true)
      setError(null)
      
      try {
        const response = await interpretationService.getComprehensiveInterpretation(sajuData)
        setInterpretation(response)
      } catch (error) {
        console.error('해석 데이터 로드 실패:', error)
        setError('해석 데이터를 불러올 수 없습니다.')
      } finally {
        setLoading(false)
      }
    }

    loadInterpretation()
  }, [sajuData])

  // 생년월일 정보가 없는 경우
  if (!birthInfo || !sajuData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              사주 정보가 필요합니다
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              종합 해석을 확인하려면 먼저 생년월일 정보를 입력해주세요.
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

        {/* 페이지 제목 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            📚 종합 사주 해석
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            5대 고전을 기반으로 한 심층 분석
          </p>
        </div>

        {/* 카테고리 탭 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {INTERPRETATION_CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center space-x-2 ${
                  activeCategory === category.id
                    ? `bg-${category.color}-500 text-white shadow-lg transform scale-105`
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <span className="text-xl">{category.icon}</span>
                <span className="text-sm">{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 해석 내용 표시 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <InterpretationPanel
            interpretation={interpretation}
            loading={loading}
            error={error}
            category={activeCategory}
            showTabs={false}
            fullHeight={true}
          />
        </div>

        {/* 네비게이션 버튼 */}
        <div className="mt-8 flex justify-center space-x-4">
          <button
            onClick={() => navigate('/saju-chart')}
            className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            📊 차트 보기
          </button>
          <button
            onClick={() => navigate('/calendar')}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            📅 캘린더로 돌아가기
          </button>
        </div>
      </div>
    </div>
  )
}

export default InterpretationPage