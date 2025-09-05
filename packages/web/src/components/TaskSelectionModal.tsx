import React, { useEffect } from 'react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

interface TaskSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  date: Date
  position: { x: number, y: number }
  onSelectEvent: () => void
  onSelectTodo: () => void  
  onSelectDiary: () => void
}

export default function TaskSelectionModal({
  isOpen,
  onClose,
  date,
  position,
  onSelectEvent,
  onSelectTodo,
  onSelectDiary
}: TaskSelectionModalProps) {
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element
      if (!target.closest('.task-selection-modal')) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.addEventListener('click', handleClickOutside)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('click', handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div 
      className="task-selection-modal absolute bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 min-w-[240px] max-w-[280px] z-50"
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px`,
        transform: 'translate(-50%, -10px)' // 중앙 정렬 및 약간 위로 이동
      }}
    >
      {/* 헤더 */}
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
          {format(date, 'yyyy년 M월 d일 EEEE', { locale: ko })}
        </p>
      </div>

      {/* 작업 옵션들 */}
      <div className="space-y-2">
        {/* 일정 추가 */}
        <button 
          onClick={() => {
            onSelectEvent()
            onClose()
          }}
          className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-150 group"
        >
          <div className="flex items-start space-x-3">
            <span className="text-xl flex-shrink-0">📅</span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:opacity-80">
                일정 추가
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                새로운 일정을 만듭니다
              </div>
            </div>
            <div className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
              →
            </div>
          </div>
        </button>

        {/* 할일 추가 */}
        <button 
          onClick={() => {
            onSelectTodo()
            onClose()
          }}
          className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-150 group"
        >
          <div className="flex items-start space-x-3">
            <span className="text-xl flex-shrink-0">✅</span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-green-600 dark:text-green-400 group-hover:opacity-80">
                할일 추가
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                새로운 할일을 만듭니다
              </div>
            </div>
            <div className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
              →
            </div>
          </div>
        </button>

        {/* 일기 쓰기 */}
        <button 
          onClick={() => {
            onSelectDiary()
            onClose()
          }}
          className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-150 group"
        >
          <div className="flex items-start space-x-3">
            <span className="text-xl flex-shrink-0">📝</span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-purple-600 dark:text-purple-400 group-hover:opacity-80">
                일기 쓰기
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                오늘의 일기를 작성합니다
              </div>
            </div>
            <div className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
              →
            </div>
          </div>
        </button>
      </div>

      {/* 푸터 */}
      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
        <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
          ESC 키로 닫기
        </p>
      </div>
    </div>
  )
}