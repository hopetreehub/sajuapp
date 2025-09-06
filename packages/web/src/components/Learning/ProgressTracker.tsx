import { useState, useEffect } from 'react'
import { 
  ChartBarIcon, 
  ClockIcon, 
  CalendarIcon,
  TrophyIcon,
  BookOpenIcon,
  StarIcon
} from '@heroicons/react/24/outline'

interface LearningStats {
  totalCoursesEnrolled: number
  completedCourses: number
  inProgressCourses: number
  totalLessonsCompleted: number
  totalStudyTime: number
  averageScore: number
  streak: number
  certificates: number
}

interface WeeklyProgress {
  week: string
  lessonsCompleted: number
  studyTime: number
}

interface ProgressTrackerProps {
  userId: string
}

export default function ProgressTracker({ userId }: ProgressTrackerProps) {
  const [stats, setStats] = useState<LearningStats | null>(null)
  const [weeklyData, setWeeklyData] = useState<WeeklyProgress[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadLearningStats()
    loadWeeklyProgress()
  }, [userId])

  const loadLearningStats = async () => {
    try {
      // 임시 데이터 (실제로는 API에서 가져와야 함)
      const mockStats: LearningStats = {
        totalCoursesEnrolled: 5,
        completedCourses: 2,
        inProgressCourses: 3,
        totalLessonsCompleted: 24,
        totalStudyTime: 14400, // 4시간 (초 단위)
        averageScore: 87,
        streak: 7,
        certificates: 2
      }
      
      setStats(mockStats)
      setIsLoading(false)
    } catch (error) {
      console.error('학습 통계 로딩 실패:', error)
      setIsLoading(false)
    }
  }

  const loadWeeklyProgress = () => {
    // 임시 데이터
    const mockWeeklyData: WeeklyProgress[] = [
      { week: '1주', lessonsCompleted: 2, studyTime: 1800 },
      { week: '2주', lessonsCompleted: 4, studyTime: 2400 },
      { week: '3주', lessonsCompleted: 6, studyTime: 3200 },
      { week: '4주', lessonsCompleted: 5, studyTime: 2800 },
      { week: '5주', lessonsCompleted: 7, studyTime: 4200 }
    ]
    
    setWeeklyData(mockWeeklyData)
  }

  const formatStudyTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (hours > 0) {
      return `${hours}시간 ${minutes}분`
    }
    return `${minutes}분`
  }

  const maxLessons = Math.max(...weeklyData.map(d => d.lessonsCompleted))

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="space-y-6">
      {/* 주요 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <BookOpenIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.completedCourses}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                완료한 강좌
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <ClockIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {Math.floor(stats.totalStudyTime / 3600)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                총 학습시간
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <StarIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.averageScore}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                평균 점수
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <CalendarIcon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.streak}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                연속 학습일
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 주간 진도 차트 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            주간 학습 진도
          </h3>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <ChartBarIcon className="h-4 w-4 mr-1" />
            최근 5주
          </div>
        </div>

        <div className="space-y-4">
          {weeklyData.map((week, index) => (
            <div key={index} className="flex items-center space-x-4">
              <div className="w-8 text-sm text-gray-600 dark:text-gray-400">
                {week.week}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-700 dark:text-gray-300">
                    {week.lessonsCompleted}개 레슨
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    {formatStudyTime(week.studyTime)}
                  </span>
                </div>
                <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(week.lessonsCompleted / maxLessons) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 성취 현황 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 강좌 진행률 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            강좌 진행 현황
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">완료</span>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                {stats.completedCourses}개
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">진행중</span>
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                {stats.inProgressCourses}개
              </span>
            </div>
            
            {/* 진행률 막대 */}
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400">전체 진행률</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {Math.round((stats.completedCourses / stats.totalCoursesEnrolled) * 100)}%
                </span>
              </div>
              <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full"
                  style={{ width: `${(stats.completedCourses / stats.totalCoursesEnrolled) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* 성취 배지 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            성취 현황
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <TrophyIcon className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  수료증 {stats.certificates}개
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  강좌 완주 인증
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, index) => (
                  <StarIcon 
                    key={index}
                    className={`h-5 w-5 ${
                      index < Math.floor(stats.averageScore / 20) 
                        ? 'text-yellow-500 fill-current' 
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                ))}
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  평균 {stats.averageScore}점
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  퀴즈 성적
                </p>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-3">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                🔥 {stats.streak}일 연속 학습 중!
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                계속해서 꾸준히 학습해보세요
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}