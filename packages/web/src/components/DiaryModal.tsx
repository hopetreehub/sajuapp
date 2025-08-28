import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import Modal from './Modal'

interface DiaryEntry {
  id?: string
  date: string
  content: string
  mood: string
  createdAt?: Date
  updatedAt?: Date
}

interface DiaryModalProps {
  isOpen: boolean
  onClose: () => void
  date: Date
  existingEntry?: DiaryEntry | null
  onSave: (entry: DiaryEntry) => void
}

const MOODS = [
  { emoji: '😊', label: '기분 좋음' },
  { emoji: '😐', label: '보통' },
  { emoji: '😢', label: '슬픔' },
  { emoji: '😠', label: '화남' },
  { emoji: '😴', label: '피곤함' },
  { emoji: '🤔', label: '고민' },
  { emoji: '😍', label: '설렘' },
  { emoji: '😱', label: '놀람' }
]

export default function DiaryModal({ isOpen, onClose, date, existingEntry, onSave }: DiaryModalProps) {
  const [content, setContent] = useState('')
  const [selectedMood, setSelectedMood] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (existingEntry) {
      setContent(existingEntry.content)
      setSelectedMood(existingEntry.mood)
    } else {
      setContent('')
      setSelectedMood('')
    }
  }, [existingEntry, isOpen])

  const handleSave = async () => {
    if (!content.trim()) return

    setIsLoading(true)
    try {
      const entry: DiaryEntry = {
        id: existingEntry?.id,
        date: format(date, 'yyyy-MM-dd'),
        content: content.trim(),
        mood: selectedMood || '😐',
        ...(existingEntry ? { updatedAt: new Date() } : { createdAt: new Date() })
      }

      onSave(entry)
      onClose()
    } catch (error) {
      console.error('Failed to save diary:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (content !== (existingEntry?.content || '') || selectedMood !== (existingEntry?.mood || '')) {
      if (window.confirm('작성 중인 내용이 있습니다. 정말 닫으시겠습니까?')) {
        onClose()
      }
    } else {
      onClose()
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-2xl">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            📝 {format(date, 'yyyy년 M월 d일 EEEE', { locale: ko })} 일기
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl"
          >
            ✕
          </button>
        </div>

        {/* Mood Selector */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            오늘의 기분을 선택해주세요
          </h3>
          <div className="flex flex-wrap gap-3">
            {MOODS.map(({ emoji, label }) => (
              <button
                key={emoji}
                onClick={() => setSelectedMood(emoji)}
                className={`
                  flex items-center space-x-2 px-3 py-2 rounded-lg border-2 transition-all
                  ${selectedMood === emoji
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                    : 'border-gray-200 dark:border-gray-600 hover:border-purple-300'
                  }
                `}
              >
                <span className="text-xl">{emoji}</span>
                <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Editor */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            오늘 하루는 어떠셨나요?
          </h3>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="오늘 있었던 일, 느낀 점, 감사한 일 등을 자유롭게 적어보세요..."
            rows={8}
            className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg resize-none bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <div className="flex justify-between mt-2">
            <span className="text-xs text-gray-500">
              {content.length} / 1000자
            </span>
            <span className="text-xs text-gray-400">
              Tab 키로 들여쓰기 가능
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={!content.trim() || isLoading}
            className={`
              px-6 py-2 rounded-lg text-white font-medium transition-colors
              ${content.trim() && !isLoading
                ? 'bg-purple-600 hover:bg-purple-700'
                : 'bg-gray-400 cursor-not-allowed'
              }
            `}
          >
            {isLoading ? '저장 중...' : existingEntry ? '수정하기' : '저장하기'}
          </button>
        </div>

        {/* Tips */}
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            💡 <strong>팁:</strong> 일기는 자동으로 저장되지 않습니다. 작성 완료 후 반드시 저장 버튼을 눌러주세요.
          </p>
        </div>
      </div>
    </Modal>
  )
}