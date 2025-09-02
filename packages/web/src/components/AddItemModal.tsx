import React, { useState } from 'react'
import { format } from 'date-fns'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { CalendarEvent } from '@/services/api'
import { TodoInput } from '@/types/todo'

type ItemType = 'event' | 'todo'

interface AddItemModalProps {
  date: Date
  hour?: number
  onClose: () => void
  onAddEvent: (event: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'>) => void
  onAddTodo: (todo: TodoInput) => void
}

export default function AddItemModal({ date, hour, onClose, onAddEvent, onAddTodo }: AddItemModalProps) {
  const [itemType, setItemType] = useState<ItemType>('event')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startTime, setStartTime] = useState(hour ? `${hour.toString().padStart(2, '0')}:00` : '09:00')
  const [endTime, setEndTime] = useState(hour ? `${(hour + 1).toString().padStart(2, '0')}:00` : '10:00')
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium')
  const [hasTime, setHasTime] = useState(Boolean(hour))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) return

    if (itemType === 'event') {
      // 일정 추가
      const eventDateTime = new Date(date)
      const [hours, minutes] = startTime.split(':').map(Number)
      eventDateTime.setHours(hours, minutes, 0, 0)
      
      const endDateTime = new Date(date)
      const [endHours, endMinutes] = endTime.split(':').map(Number)
      endDateTime.setHours(endHours, endMinutes, 0, 0)

      onAddEvent({
        title: title.trim(),
        description: description.trim() || undefined,
        start_time: eventDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        all_day: false,
        location: undefined,
        color: '#3b82f6'
      })
    } else {
      // 할일 추가
      const todoData: TodoInput = {
        text: title.trim(),
        description: description.trim() || undefined,
        completed: false,
        priority,
        date: format(date, 'yyyy-MM-dd'),
        hasTime,
        startTime: hasTime ? startTime : undefined,
        endTime: hasTime ? endTime : undefined
      }

      onAddTodo(todoData)
    }

    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {format(date, 'M월 d일')} 항목 추가
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* 항목 유형 선택 */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
              추가할 항목
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="itemType"
                  value="event"
                  checked={itemType === 'event'}
                  onChange={(e) => setItemType(e.target.value as ItemType)}
                  className="mr-2"
                />
                <span className="text-sm">📅 일정</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="itemType"
                  value="todo"
                  checked={itemType === 'todo'}
                  onChange={(e) => setItemType(e.target.value as ItemType)}
                  className="mr-2"
                />
                <span className="text-sm">✅ 할일</span>
              </label>
            </div>
          </div>

          {/* 제목/할일 내용 */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
              {itemType === 'event' ? '일정 제목' : '할일 내용'}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder={itemType === 'event' ? '일정 제목을 입력하세요' : '할일을 입력하세요'}
              required
            />
          </div>

          {/* 설명 */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
              설명 (선택사항)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
              placeholder="추가 설명을 입력하세요"
            />
          </div>

          {/* 할일 우선순위 */}
          {itemType === 'todo' && (
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                우선순위
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as typeof priority)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="high">🔴 높음</option>
                <option value="medium">🟡 보통</option>
                <option value="low">🟢 낮음</option>
              </select>
            </div>
          )}

          {/* 시간 설정 */}
          <div>
            {itemType === 'todo' && (
              <div className="mb-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={hasTime}
                    onChange={(e) => setHasTime(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    시간 지정
                  </span>
                </label>
              </div>
            )}

            {(itemType === 'event' || hasTime) && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                    시작 시간
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                    {itemType === 'event' ? '종료 시간' : '종료 시간 (선택)'}
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required={itemType === 'event'}
                  />
                </div>
              </div>
            )}
          </div>

          {/* 버튼 */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {itemType === 'event' ? '일정 추가' : '할일 추가'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}