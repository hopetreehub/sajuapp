import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

export default function DiaryPage() {
  const { date } = useParams()
  const navigate = useNavigate()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [content, setContent] = useState('')
  const [mood, setMood] = useState<1 | 2 | 3 | 4 | 5>(3)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')

  useEffect(() => {
    if (date) {
      setSelectedDate(new Date(date))
    }
  }, [date])

  const moodEmojis = {
    1: { emoji: '😢', label: '매우 나쁨', color: 'text-red-500' },
    2: { emoji: '😕', label: '나쁨', color: 'text-orange-500' },
    3: { emoji: '😐', label: '보통', color: 'text-yellow-500' },
    4: { emoji: '🙂', label: '좋음', color: 'text-green-500' },
    5: { emoji: '😄', label: '매우 좋음', color: 'text-blue-500' }
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleSave = () => {
    // Save diary entry
    console.log({
      date: selectedDate,
      content,
      mood,
      tags
    })
    // Show success message
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {format(selectedDate, 'yyyy년 M월 d일', { locale: ko })}
              </h1>
              <p className="text-gray-600">
                {format(selectedDate, 'EEEE', { locale: ko })}
              </p>
            </div>
            <input
              type="date"
              value={format(selectedDate, 'yyyy-MM-dd')}
              onChange={(e) => {
                const newDate = new Date(e.target.value)
                setSelectedDate(newDate)
                navigate(`/diary/${format(newDate, 'yyyy-MM-dd')}`)
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Fortune Preview (Placeholder) */}
          <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">오늘의 운세</h3>
            <p className="text-sm text-gray-600">
              오늘은 새로운 시작을 하기에 좋은 날입니다. 긍정적인 에너지가 충만한 하루가 될 것입니다.
            </p>
          </div>
        </div>

        {/* Mood Selector */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">오늘의 기분</h2>
          <div className="flex justify-around">
            {([1, 2, 3, 4, 5] as const).map((moodValue) => {
              const moodData = moodEmojis[moodValue]
              return (
                <button
                  key={moodValue}
                  onClick={() => setMood(moodValue)}
                  className={`
                    flex flex-col items-center p-3 rounded-lg transition-all
                    ${mood === moodValue 
                      ? 'bg-gray-100 ring-2 ring-primary-500' 
                      : 'hover:bg-gray-50'
                    }
                  `}
                >
                  <span className={`text-3xl mb-1 ${moodData.color}`}>
                    {moodData.emoji}
                  </span>
                  <span className="text-xs text-gray-600">
                    {moodData.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Main Content Editor */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">일기 내용</h2>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="오늘은 어떤 하루였나요?"
            className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Tags */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">태그</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-700"
              >
                #{tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-2 text-primary-500 hover:text-primary-700"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              placeholder="태그 추가 (Enter로 추가)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <button
              onClick={handleAddTag}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              추가
            </button>
          </div>
        </div>

        {/* Linked Events (Placeholder) */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">연결된 일정</h2>
          <p className="text-sm text-gray-500">
            이 날짜에 등록된 캘린더 일정이 여기에 표시됩니다.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={() => navigate('/diary')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  )
}