import { useState, useEffect } from 'react'
import { useCalendar } from '@/contexts/CalendarContext'
import { 
  getDashboardData, 
  getQuickActions, 
  DashboardStats 
} from '@/services/dashboardService'
import TodaySummary from '@/components/Dashboard/TodaySummary'
import WeeklyStats from '@/components/Dashboard/WeeklyStats'
import MonthlyHeatmap from '@/components/Dashboard/MonthlyHeatmap'
import QuickActions from '@/components/Dashboard/QuickActions'
import { ArrowPathIcon } from '@heroicons/react/24/outline'

export default function DashboardPage() {
  const { todos } = useCalendar()
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  
  const quickActions = getQuickActions()
  
  // 대시보드 데이터 로드
  const loadDashboardData = async (showRefreshing = false) => {
    if (showRefreshing) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }
    setError(null)
    
    try {
      const data = await getDashboardData(todos)
      setDashboardData(data)
    } catch (err) {
      console.error('Failed to load dashboard data:', err)
      setError('대시보드 데이터를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }
  
  // 초기 로드
  useEffect(() => {
    loadDashboardData()
  }, [todos])
  
  // 새로고침 핸들러
  const handleRefresh = () => {
    loadDashboardData(true)
  }
  
  if (loading && !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 로딩 헤더 */}
          <div className="flex items-center justify-between mb-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded w-48 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-32"></div>
            </div>
            <div className="animate-pulse">
              <div className="h-10 w-24 bg-gray-200 dark:bg-gray-600 rounded"></div>
            </div>
          </div>
          
          {/* 로딩 그리드 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="h-96 bg-gray-200 dark:bg-gray-600 rounded-xl animate-pulse"></div>
              <div className="h-80 bg-gray-200 dark:bg-gray-600 rounded-xl animate-pulse"></div>
            </div>
            <div className="space-y-8">
              <div className="h-64 bg-gray-200 dark:bg-gray-600 rounded-xl animate-pulse"></div>
              <div className="h-96 bg-gray-200 dark:bg-gray-600 rounded-xl animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😵</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            오류가 발생했습니다
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {error}
          </p>
          <button
            onClick={() => loadDashboardData()}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              📊 대시보드
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              한눈에 보는 나의 활동 현황
            </p>
          </div>
          
          {/* 새로고침 버튼 */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {refreshing ? '새로고침 중...' : '새로고침'}
            </span>
          </button>
        </div>
        
        {/* 메인 콘텐츠 그리드 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 왼쪽 컬럼 (2/3) */}
          <div className="lg:col-span-2 space-y-8">
            {/* 오늘의 요약 */}
            {dashboardData && (
              <TodaySummary 
                todayData={dashboardData.today} 
                loading={loading}
              />
            )}
            
            {/* 주간 통계 */}
            {dashboardData && (
              <WeeklyStats 
                weeklyData={dashboardData.week} 
                loading={loading}
              />
            )}
          </div>
          
          {/* 오른쪽 컬럼 (1/3) */}
          <div className="space-y-8">
            {/* 빠른 액션 */}
            <QuickActions 
              actions={quickActions}
              loading={loading}
            />
            
            {/* 월간 히트맵 */}
            {dashboardData && (
              <MonthlyHeatmap 
                monthlyData={dashboardData.month} 
                loading={loading}
              />
            )}
          </div>
        </div>
        
        {/* 하단 인사이트 (선택사항) */}
        {dashboardData && (
          <div className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-700">
            <div className="flex items-start gap-4">
              <div className="text-3xl">🎯</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  오늘의 인사이트
                </h3>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  {dashboardData.today.totalTodos === 0 && (
                    <p>• 오늘 할일을 추가하여 하루를 계획해보세요</p>
                  )}
                  {dashboardData.today.diary === null && (
                    <p>• 하루를 마무리하며 일기를 작성해보세요</p>
                  )}
                  {dashboardData.week.completionRate > 80 && (
                    <p>• 이번 주 할일 완료율이 {dashboardData.week.completionRate}%입니다. 정말 잘하고 계시네요! 🎉</p>
                  )}
                  {dashboardData.week.completionRate < 50 && dashboardData.week.completionRate > 0 && (
                    <p>• 할일 완료율이 낮습니다. 작은 목표부터 차근차근 시작해보세요</p>
                  )}
                  {dashboardData.month.totalActivities === 0 && (
                    <p>• 이번 달의 첫 활동을 기록해보세요!</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}