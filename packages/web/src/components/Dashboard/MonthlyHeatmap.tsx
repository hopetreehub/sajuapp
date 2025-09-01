import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns'
import { ko } from 'date-fns/locale'
import { DashboardStats } from '@/services/dashboardService'

interface MonthlyHeatmapProps {
  monthlyData: DashboardStats['month']
  loading?: boolean
}

export default function MonthlyHeatmap({ monthlyData, loading }: MonthlyHeatmapProps) {
  const today = new Date()
  const monthStart = startOfMonth(today)
  const monthEnd = endOfMonth(today)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-7 gap-2 mb-4">
            {Array.from({ length: 42 }).map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 dark:bg-gray-600 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }
  
  // 강도별 색상
  const getIntensityColor = (intensity: number) => {
    switch (intensity) {
      case 0: return 'bg-gray-100 dark:bg-gray-700'
      case 1: return 'bg-green-200 dark:bg-green-800/50'
      case 2: return 'bg-green-300 dark:bg-green-700/70'
      case 3: return 'bg-green-400 dark:bg-green-600/80'
      case 4: return 'bg-green-500 dark:bg-green-500'
      default: return 'bg-gray-100 dark:bg-gray-700'
    }
  }
  
  const getIntensityFromDate = (date: Date): number => {
    const dateStr = format(date, 'yyyy-MM-dd')
    const heatmapEntry = monthlyData.activityHeatmap.find(entry => entry.date === dateStr)
    return heatmapEntry?.intensity || 0
  }
  
  const weekDays = ['일', '월', '화', '수', '목', '금', '토']
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            월간 활동 히트맵
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {format(today, 'yyyy년 M월', { locale: ko })} 활동량 시각화
          </p>
        </div>
        <div className="text-2xl">📅</div>
      </div>
      
      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-xs text-gray-500 dark:text-gray-400 font-medium">
            {day}
          </div>
        ))}
      </div>
      
      {/* 달력 히트맵 */}
      <div className="grid grid-cols-7 gap-2 mb-6">
        {calendarDays.map(day => {
          const intensity = getIntensityFromDate(day)
          const isCurrentMonth = day >= monthStart && day <= monthEnd
          const isToday = format(day, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
          
          return (
            <div
              key={day.toISOString()}
              className={`
                aspect-square flex items-center justify-center text-xs font-medium rounded-lg transition-all cursor-pointer
                ${isCurrentMonth ? getIntensityColor(intensity) : 'bg-gray-50 dark:bg-gray-800/50'}
                ${isCurrentMonth ? 'text-gray-800 dark:text-gray-200' : 'text-gray-400 dark:text-gray-500'}
                ${isToday ? 'ring-2 ring-blue-500' : ''}
                hover:scale-105
              `}
              title={`${format(day, 'M월 d일', { locale: ko })}: 활동량 ${intensity}`}
            >
              {format(day, 'd')}
            </div>
          )
        })}
      </div>
      
      {/* 강도 범례 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">적음</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map(intensity => (
              <div
                key={intensity}
                className={`w-3 h-3 rounded-sm ${getIntensityColor(intensity)}`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">많음</span>
        </div>
        
        <div className="text-sm text-gray-500 dark:text-gray-400">
          총 활동: {monthlyData.totalActivities}개
        </div>
      </div>
      
      {/* 태그 분포 */}
      {monthlyData.tagDistribution.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            🏷️ 인기 태그
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {monthlyData.tagDistribution.slice(0, 6).map((tag) => (
              <div
                key={tag.name}
                className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: tag.color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {tag.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {tag.count}회 사용
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* 활동 없음 메시지 */}
      {monthlyData.totalActivities === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <div className="text-4xl mb-3">📊</div>
          <p>이번 달 활동 기록이 없습니다</p>
          <p className="text-sm">일정과 일기를 작성하여 활동을 기록해보세요!</p>
        </div>
      )}
    </div>
  )
}