import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { 
  CalendarIcon, 
  CheckCircleIcon, 
  BookOpenIcon,
  ChartBarIcon, 
} from '@heroicons/react/24/outline';
import { DashboardStats } from '@/services/dashboardService';

interface WeeklyStatsProps {
  weeklyData: DashboardStats['week']
  loading?: boolean
}

export default function WeeklyStats({ weeklyData, loading }: WeeklyStatsProps) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-600 rounded mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-full"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }
  
  const maxActivity = Math.max(
    ...weeklyData.activityData.map(day => day.events + day.todos + (day.diary ? 1 : 0)),
    1,
  );
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            주간 통계
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            지난 7일간의 활동 요약
          </p>
        </div>
        <div className="text-2xl">📈</div>
      </div>
      
      {/* 통계 요약 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* 완료율 */}
        <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {weeklyData.completionRate}%
          </div>
          <div className="text-xs text-green-600/70 dark:text-green-400/70 mt-1">
            할일 완료율
          </div>
        </div>
        
        {/* 총 이벤트 */}
        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {weeklyData.totalEvents}
          </div>
          <div className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1">
            총 일정
          </div>
        </div>
        
        {/* 일기 작성 */}
        <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {weeklyData.totalDiaries}
          </div>
          <div className="text-xs text-purple-600/70 dark:text-purple-400/70 mt-1">
            일기 작성
          </div>
        </div>
        
        {/* 기분 변화 */}
        <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-lg">
          <div className="text-2xl">
            {weeklyData.moodTrend.length > 0 
              ? weeklyData.moodTrend[weeklyData.moodTrend.length - 1].mood
              : '😐'
            }
          </div>
          <div className="text-xs text-yellow-600/70 dark:text-yellow-400/70 mt-1">
            최근 기분
          </div>
        </div>
      </div>
      
      {/* 일별 활동 차트 */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
          <ChartBarIcon className="h-5 w-5" />
          일별 활동량
        </h3>
        
        <div className="space-y-3">
          {weeklyData.activityData.map((day, _index) => {
            const totalActivity = day.events + day.todos + (day.diary ? 1 : 0);
            const percentage = maxActivity > 0 ? (totalActivity / maxActivity) * 100 : 0;
            const dayName = format(new Date(day.date), 'E', { locale: ko });
            const dayOfMonth = format(new Date(day.date), 'd');
            
            return (
              <div key={day.date} className="flex items-center gap-3">
                <div className="w-12 text-xs text-gray-500 dark:text-gray-400">
                  {dayName} {dayOfMonth}
                </div>
                
                <div className="flex-1 flex items-center gap-2">
                  {/* 활동량 바 */}
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6 relative overflow-hidden">
                    {percentage > 0 && (
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    )}
                    
                    {/* 활동 아이콘들 */}
                    <div className="absolute inset-0 flex items-center justify-start pl-2 gap-1">
                      {day.events > 0 && (
                        <CalendarIcon className="h-3 w-3 text-white" />
                      )}
                      {day.todos > 0 && (
                        <CheckCircleIcon className="h-3 w-3 text-white" />
                      )}
                      {day.diary && (
                        <BookOpenIcon className="h-3 w-3 text-white" />
                      )}
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 dark:text-gray-400 w-8 text-right">
                    {totalActivity}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* 기분 트렌드 */}
      {weeklyData.moodTrend.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
            📊 기분 트렌드
          </h3>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {weeklyData.moodTrend.map((mood, _index) => {
              const date = new Date(mood.date);
              const dayName = format(date, 'E', { locale: ko });
              const dayOfMonth = format(date, 'd');
              
              return (
                <div key={mood.date} className="flex-shrink-0 text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="text-2xl mb-1">{mood.mood}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {dayName} {dayOfMonth}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* 활동 없음 메시지 */}
      {weeklyData.totalEvents === 0 && weeklyData.totalDiaries === 0 && weeklyData.completionRate === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <ChartBarIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>이번 주 활동 기록이 없습니다</p>
          <p className="text-sm">일정을 추가하고 일기를 작성해보세요!</p>
        </div>
      )}
    </div>
  );
}