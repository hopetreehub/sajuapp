import { QuickAction } from '@/services/dashboardService'

interface QuickActionsProps {
  actions: QuickAction[]
  loading?: boolean
}

export default function QuickActions({ actions, loading }: QuickActionsProps) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-600 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            빠른 액션
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            자주 사용하는 기능들을 빠르게 실행하세요
          </p>
        </div>
        <div className="text-2xl">⚡</div>
      </div>
      
      {/* 액션 버튼들 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={action.action}
            className={`
              flex flex-col items-center justify-center p-4 rounded-lg text-white
              ${action.color} 
              transition-all duration-200 hover:scale-105 hover:shadow-lg
              focus:outline-none focus:ring-4 focus:ring-opacity-50
            `}
          >
            <div className="text-2xl mb-2">{action.icon}</div>
            <span className="text-sm font-medium text-center">
              {action.label}
            </span>
          </button>
        ))}
      </div>
      
      {/* 추가 액션 힌트 */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="text-blue-500 text-lg">💡</div>
          <div>
            <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
              생산성 팁
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              매일 아침 오늘 할 일을 정리하고, 저녁에는 하루를 되돌아보며 일기를 작성해보세요.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}