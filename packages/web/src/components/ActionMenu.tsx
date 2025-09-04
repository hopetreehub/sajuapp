import { useEffect, useRef } from 'react'

export type ActionType = 'event' | 'todo' | 'diary'

interface ActionMenuProps {
  isOpen: boolean
  onClose: () => void
  date: Date
  position: { x: number, y: number }
  onSelectAction: (action: ActionType) => void
}

export default function ActionMenu({ 
  isOpen, 
  onClose, 
  date, 
  position, 
  onSelectAction 
}: ActionMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const adjustedPosition = {
    x: Math.min(position.x, window.innerWidth - 200), // 메뉴가 화면을 벗어나지 않도록
    y: Math.min(position.y, window.innerHeight - 160)
  }

  const actions = [
    {
      type: 'event' as ActionType,
      icon: '📅',
      label: '일정 추가',
      description: '새로운 일정을 만듭니다',
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      type: 'todo' as ActionType,
      icon: '✅',
      label: '할일 추가',
      description: '새로운 할일을 만듭니다',
      color: 'text-green-600 dark:text-green-400'
    },
    {
      type: 'diary' as ActionType,
      icon: '📝',
      label: '일기 쓰기',
      description: '오늘의 일기를 작성합니다',
      color: 'text-purple-600 dark:text-purple-400'
    }
  ]

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    }).format(date)
  }

  const handleAction = (actionType: ActionType) => {
    onSelectAction(actionType)
    onClose()
  }

  return (
    <div 
      className="fixed inset-0 z-50"
      style={{
        background: 'rgba(0, 0, 0, 0.1)',
      }}
    >
      <div
        ref={menuRef}
        className="absolute bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 min-w-[240px] max-w-[280px]"
        style={{
          left: adjustedPosition.x,
          top: adjustedPosition.y,
        }}
      >
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              작업 선택
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-lg"
            >
              ✕
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {formatDate(date)}
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          {actions.map((action) => (
            <button
              key={action.type}
              onClick={() => handleAction(action.type)}
              className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-150 group"
            >
              <div className="flex items-start space-x-3">
                <span className="text-xl flex-shrink-0">{action.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium ${action.color} group-hover:opacity-80`}>
                    {action.label}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {action.description}
                  </div>
                </div>
                <div className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                  →
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
            ESC 키로 닫기
          </p>
        </div>
      </div>
    </div>
  )
}