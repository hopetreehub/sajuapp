import React, { useState, useEffect, useRef } from 'react'
import { format, addDays, subDays } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Camera } from 'lucide-react'
import { diaryService } from '@/services/diaryService'

interface DiaryNotebookModalProps {
  isOpen: boolean
  onClose: () => void
  date: Date
  onSave?: () => void
}

interface DiaryEntry {
  content: string
  mood: string
  images: string[]
}

const MOODS = [
  { emoji: '😊', label: '기분 좋음', value: 'happy' },
  { emoji: '😐', label: '보통', value: 'neutral' },
  { emoji: '😢', label: '슬픔', value: 'sad' },
  { emoji: '😠', label: '화남', value: 'angry' }
]

const INSPIRATIONAL_MESSAGES = [
  { emoji: '🙏', message: '따뜻한 잠자리, 맛있는 음식... 당연한 것들에 감사해보세요.', color: 'amber' },
  { emoji: '💝', message: '마음이 무거울 때일수록, 작은 행복을 찾아보세요.', color: 'pink' },
  { emoji: '🌟', message: '오늘의 작은 성취도 충분히 축하할 만해요.', color: 'blue' },
  { emoji: '🌱', message: '천천히라도 괜찮아요. 꾸준히 나아가고 있으니까요.', color: 'green' }
]

export default function DiaryNotebookModal({ isOpen, onClose, date, onSave }: DiaryNotebookModalProps) {
  const [todayEntry, setTodayEntry] = useState<DiaryEntry>({ content: '', mood: 'neutral', images: [] })
  const [yesterdayEntry, setYesterdayEntry] = useState<DiaryEntry>({ content: '', mood: 'neutral', images: [] })
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const today = date
  const yesterday = subDays(date, 1)
  const todayMessage = INSPIRATIONAL_MESSAGES[Math.floor(Math.random() * INSPIRATIONAL_MESSAGES.length)]

  useEffect(() => {
    if (isOpen) {
      loadDiaryEntries()
    }
  }, [isOpen, date])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return
      
      if (e.ctrlKey && e.key === 'ArrowLeft') {
        e.preventDefault()
        // 어제로 이동 (구현 예정)
      } else if (e.ctrlKey && e.key === 'ArrowRight') {
        e.preventDefault()
        // 내일로 이동 (구현 예정)
      } else if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const loadDiaryEntries = async () => {
    setIsLoading(true)
    try {
      // 오늘 일기 로드
      const todayData = await diaryService.getDiaryByDate(format(today, 'yyyy-MM-dd'))
      if (todayData) {
        setTodayEntry({
          content: todayData.content || '',
          mood: todayData.mood || 'neutral',
          images: todayData.images || []
        })
      } else {
        setTodayEntry({ content: '', mood: 'neutral', images: [] })
      }

      // 어제 일기 로드
      const yesterdayData = await diaryService.getDiaryByDate(format(yesterday, 'yyyy-MM-dd'))
      if (yesterdayData) {
        setYesterdayEntry({
          content: yesterdayData.content || '',
          mood: yesterdayData.mood || 'neutral',
          images: yesterdayData.images || []
        })
      } else {
        setYesterdayEntry({ content: '', mood: 'neutral', images: [] })
      }
    } catch (error) {
      console.error('일기 로드 실패:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!todayEntry.content.trim()) return

    setIsSaving(true)
    try {
      await diaryService.saveDiary({
        date: format(today, 'yyyy-MM-dd'),
        content: todayEntry.content,
        mood: todayEntry.mood,
        images: todayEntry.images
      })
      
      onSave?.()
      onClose()
    } catch (error) {
      console.error('일기 저장 실패:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // 최대 3장 제한
    const remainingSlots = 3 - todayEntry.images.length
    const filesToProcess = files.slice(0, remainingSlots)

    try {
      const imagePromises = filesToProcess.map(file => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = (e) => {
            const img = new Image()
            img.onload = () => {
              const canvas = document.createElement('canvas')
              const ctx = canvas.getContext('2d')!
              
              // WebP로 압축
              const maxWidth = 800
              const maxHeight = 600
              let { width, height } = img
              
              if (width > maxWidth || height > maxHeight) {
                const ratio = Math.min(maxWidth / width, maxHeight / height)
                width *= ratio
                height *= ratio
              }
              
              canvas.width = width
              canvas.height = height
              ctx.drawImage(img, 0, 0, width, height)
              
              const compressedData = canvas.toDataURL('image/webp', 0.8)
              resolve(compressedData)
            }
            img.src = e.target?.result as string
          }
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
      })

      const newImages = await Promise.all(imagePromises)
      setTodayEntry(prev => ({
        ...prev,
        images: [...prev.images, ...newImages]
      }))
    } catch (error) {
      console.error('이미지 업로드 실패:', error)
    }

    // 파일 입력 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getColorStyles = (color: string) => {
    switch (color) {
      case 'pink':
        return {
          backgroundColor: 'rgba(236, 72, 153, 0.082)',
          borderColor: 'rgba(236, 72, 153, 0.25)',
          color: 'rgb(236, 72, 153)'
        }
      case 'blue':
        return {
          backgroundColor: 'rgba(59, 130, 246, 0.082)',
          borderColor: 'rgba(59, 130, 246, 0.25)',
          color: 'rgb(59, 130, 246)'
        }
      case 'green':
        return {
          backgroundColor: 'rgba(34, 197, 94, 0.082)',
          borderColor: 'rgba(34, 197, 94, 0.25)',
          color: 'rgb(34, 197, 94)'
        }
      default: // amber
        return {
          backgroundColor: 'rgba(245, 158, 11, 0.082)',
          borderColor: 'rgba(245, 158, 11, 0.25)',
          color: 'rgb(245, 158, 11)'
        }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="relative bg-gradient-to-b from-amber-50 to-amber-100 dark:from-slate-800 dark:to-slate-900 rounded-2xl shadow-2xl border-2 border-amber-200 dark:border-slate-700 p-8 max-w-6xl w-full max-h-[90vh] overflow-auto">
        {/* 헤더 */}
        <div className="flex justify-between items-start mb-6">
          <div className="text-sm font-medium text-amber-700 dark:text-gray-400">
            {format(today, 'yyyy년 M월', { locale: ko })}
          </div>
          <div className="flex-1 text-center">
            <h1 className="text-2xl font-light text-amber-800 dark:text-gray-200 tracking-wide" style={{ fontFamily: 'Georgia, serif' }}>
              하루의 여백
            </h1>
            <div className="w-20 h-0.5 bg-gradient-to-r from-amber-400 to-amber-600 dark:from-purple-500 dark:to-indigo-500 mx-auto mt-2 rounded-full"></div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* 양면 일기장 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[500px] relative">
          {/* 중앙 구분선 - 대형 화면에서만 표시 */}
          <div className="hidden lg:block absolute left-1/2 top-16 bottom-16 w-px bg-gradient-to-b from-amber-300 via-amber-400 to-amber-300 dark:from-transparent dark:via-slate-500 dark:to-transparent"></div>
          
          {/* 좌측 페이지 - 어제 일기 */}
          <div className="diary-page relative">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-300 dark:bg-slate-600 rounded-full"></div>
            <div className="pl-6">
              <div className="border-b-2 border-dashed border-amber-300 dark:border-slate-600 pb-3 mb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-semibold text-amber-700 dark:text-gray-300">
                      {format(yesterday, 'M월 d일', { locale: ko })}
                    </h2>
                    <p className="text-sm text-amber-600 dark:text-gray-400">
                      {format(yesterday, 'EEEE', { locale: ko })}
                    </p>
                  </div>
                </div>
                <div className="mt-3 p-2 bg-amber-100/50 dark:bg-slate-700/30 rounded-lg border border-amber-200 dark:border-slate-600">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-amber-600 dark:text-gray-400">🙏</span>
                    <span className="text-amber-700 dark:text-gray-300 leading-relaxed">
                      따뜻한 잠자리, 맛있는 음식... 당연한 것들에 감사해보세요.
                    </span>
                  </div>
                </div>
              </div>
              <div className="diary-content">
                {yesterdayEntry.content ? (
                  <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap" style={{ fontFamily: 'Georgia, serif', fontSize: '14px' }}>
                    {yesterdayEntry.content}
                  </div>
                ) : (
                  <div className="text-center text-gray-400 dark:text-gray-500 italic py-8">
                    <p className="text-sm">어제의 일기가 없습니다</p>
                    <span className="text-2xl">📝</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 우측 페이지 - 오늘 일기 */}
          <div className="diary-page relative">
            <div className="absolute right-0 top-0 bottom-0 w-1 bg-red-300 dark:bg-slate-600 rounded-full"></div>
            <div className="pr-6">
              <div className="border-b-2 border-dashed border-amber-300 dark:border-slate-600 pb-3 mb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-semibold text-amber-700 dark:text-gray-300">
                      {format(today, 'M월 d일', { locale: ko })}
                    </h2>
                    <p className="text-sm text-amber-600 dark:text-gray-400">
                      {format(today, 'EEEE', { locale: ko })}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {MOODS.map((mood) => (
                      <button
                        key={mood.value}
                        onClick={() => setTodayEntry(prev => ({ ...prev, mood: mood.value }))}
                        className={`text-xl p-1 rounded transition-all hover:scale-110 ${
                          todayEntry.mood === mood.value
                            ? 'bg-amber-200 dark:bg-slate-700 shadow-sm'
                            : 'hover:bg-amber-100 dark:hover:bg-slate-800'
                        }`}
                        title={mood.label}
                      >
                        {mood.emoji}
                      </button>
                    ))}
                  </div>
                </div>
                <div 
                  className="mt-3 p-3 rounded-lg border-2 border-dashed shadow-sm"
                  style={getColorStyles(todayMessage.color)}
                >
                  <div className="flex items-start gap-2 text-xs">
                    <span className="text-base mt-1" style={{ color: getColorStyles(todayMessage.color).color }}>
                      {todayMessage.emoji}
                    </span>
                    <span 
                      className="leading-relaxed font-medium"
                      style={{ color: getColorStyles(todayMessage.color).color }}
                    >
                      {todayMessage.message}
                    </span>
                  </div>
                </div>
              </div>
              <div className="diary-content">
                <textarea
                  ref={textareaRef}
                  value={todayEntry.content}
                  onChange={(e) => setTodayEntry(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="오늘 하루는 어땠나요? 마음속 이야기를 자유롭게 적어보세요..."
                  className="w-full h-64 p-0 border-none bg-transparent resize-none focus:outline-none text-gray-700 dark:text-gray-300 placeholder-amber-400 dark:placeholder-gray-500 leading-relaxed"
                  style={{
                    fontFamily: 'Georgia, serif',
                    fontSize: '14px',
                    lineHeight: '24px',
                    background: 'repeating-linear-gradient(transparent, transparent 23px, rgba(251, 191, 36, 0.2) 23px, rgba(251, 191, 36, 0.2) 24px)'
                  }}
                />
                <div className="mt-4">
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg cursor-pointer transition-colors w-fit">
                      <Camera className="w-4 h-4" />
                      <span className="text-sm">사진 추가</span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      최대 3장 • 자동 WebP 압축 • 50MB 이하
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs text-gray-500 mt-2">
                  <div className="flex items-center gap-3">
                    <span>{todayEntry.content.length}자</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-amber-500">✨</span>
                    <span>일기장</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 네비게이션 */}
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-amber-200 dark:border-slate-700">
          <button className="flex items-center gap-2 px-4 py-2 text-amber-700 dark:text-gray-300 hover:bg-amber-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <span className="text-lg">◀</span>
            <span className="text-sm font-medium">어제</span>
          </button>
          <div className="flex flex-col items-center gap-1">
            <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium transition-colors">
              오늘
            </button>
            <div className="text-xs text-amber-600 dark:text-gray-500">
              Ctrl + ← → 로 페이지 이동
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 text-amber-700 dark:text-gray-300 hover:bg-amber-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <span className="text-sm font-medium">내일</span>
            <span className="text-lg">▶</span>
          </button>
        </div>

        {/* 저장 버튼 */}
        <div className="flex justify-end items-center mt-4">
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={!todayEntry.content.trim() || isSaving}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                todayEntry.content.trim()
                  ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm'
                  : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }`}
            >
              {isSaving ? '저장 중...' : `저장하기 (${todayEntry.content.length}자)`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}