interface AcademyStats {
  totalCourses: number
  totalStudents: number
  totalEnrollments: number
  activeEnrollments: number
  completedEnrollments: number
  totalRevenue: number
  averageRating: number
  completionRate: string
}

interface EnrollmentStatsProps {
  stats: AcademyStats
}

export default function EnrollmentStats({ stats }: EnrollmentStatsProps) {
  const completionRateNum = parseFloat(stats.completionRate)
  
  // 파이 차트를 위한 SVG 경로 계산
  const calculatePieSlice = (percentage: number, startAngle: number = 0) => {
    const angle = (percentage * 360) / 100
    const endAngle = startAngle + angle
    
    const x1 = 50 + 40 * Math.cos((Math.PI * startAngle) / 180)
    const y1 = 50 + 40 * Math.sin((Math.PI * startAngle) / 180)
    const x2 = 50 + 40 * Math.cos((Math.PI * endAngle) / 180)
    const y2 = 50 + 40 * Math.sin((Math.PI * endAngle) / 180)
    
    const largeArcFlag = angle > 180 ? 1 : 0
    
    if (percentage === 100) {
      return `M 50 10 A 40 40 0 1 1 49.99 10 Z`
    }
    
    return `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`
  }

  const activePercentage = stats.totalEnrollments > 0 
    ? (stats.activeEnrollments / stats.totalEnrollments) * 100 
    : 0
  
  const completedPercentage = stats.totalEnrollments > 0 
    ? (stats.completedEnrollments / stats.totalEnrollments) * 100 
    : 0

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          수강신청 현황
        </h3>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          전체 {stats.totalEnrollments.toLocaleString()}건
        </div>
      </div>

      <div className="flex items-center justify-center space-x-8">
        {/* 파이 차트 */}
        <div className="relative">
          <svg viewBox="0 0 100 100" className="w-32 h-32 transform -rotate-90">
            {/* 배경 원 */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-gray-200 dark:text-gray-700"
            />
            
            {/* 완료된 수강 */}
            {completedPercentage > 0 && (
              <path
                d={calculatePieSlice(completedPercentage, 0)}
                fill="currentColor"
                className="text-green-500"
              />
            )}
            
            {/* 진행중인 수강 */}
            {activePercentage > 0 && (
              <path
                d={calculatePieSlice(activePercentage, (completedPercentage * 360) / 100)}
                fill="currentColor"
                className="text-blue-500"
              />
            )}
          </svg>
          
          {/* 중앙 텍스트 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {completionRateNum.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                완료율
              </div>
            </div>
          </div>
        </div>

        {/* 범례 */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                완료
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {stats.completedEnrollments.toLocaleString()}건 ({completedPercentage.toFixed(1)}%)
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                진행중
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {stats.activeEnrollments.toLocaleString()}건 ({activePercentage.toFixed(1)}%)
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                기타
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {(stats.totalEnrollments - stats.activeEnrollments - stats.completedEnrollments).toLocaleString()}건
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 추가 통계 */}
      <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {stats.totalStudents.toLocaleString()}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            총 학생 수
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {stats.averageRating.toFixed(1)}/5.0
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            평균 만족도
          </div>
        </div>
      </div>
    </div>
  )
}