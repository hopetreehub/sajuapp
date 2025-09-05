import { useState, useEffect } from 'react'
import { format, addDays, subDays } from 'date-fns'
import { ko } from 'date-fns/locale'
import { diaryService, DiaryEntry } from '@/services/api'
import { generateDiaryAdvice, getCategoryIcon, getCategoryColor } from '@/utils/diaryAdvice'
import { Camera, X } from 'lucide-react'
import ImageViewer from './ImageViewer'

interface DiaryBookModalProps {
  isOpen: boolean
  onClose: () => void
  date: Date
  onSave?: (entry: DiaryEntry) => void
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

export default function DiaryBookModal({ isOpen, onClose, date, onSave }: DiaryBookModalProps) {
  const [currentDate, setCurrentDate] = useState(date)
  const [content, setContent] = useState('')
  const [selectedMood, setSelectedMood] = useState('😊')
  const [isLoading, setIsLoading] = useState(false)
  const [todayEntry, setTodayEntry] = useState<DiaryEntry | null>(null)
  const [yesterdayEntry, setYesterdayEntry] = useState<DiaryEntry | null>(null)
  const [isAutoSaving, setIsAutoSaving] = useState(false)
  const [wordCount, setWordCount] = useState(0)
  const [images, setImages] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [imageViewerOpen, setImageViewerOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // 오늘과 어제의 운세 조언 생성
  const todayAdvice = generateDiaryAdvice(currentDate)
  const yesterdayAdvice = generateDiaryAdvice(subDays(currentDate, 1))
  const yesterday = subDays(currentDate, 1)

  // 날짜 변경 시 일기 조회
  useEffect(() => {
    if (isOpen) {
      setCurrentDate(date)
      loadDiaries(date)
    }
  }, [isOpen, date])

  // currentDate 변경 시 일기 조회
  useEffect(() => {
    if (isOpen && currentDate) {
      loadDiaries(currentDate)
    }
  }, [currentDate])

  // 자동 저장 (3초 후)
  useEffect(() => {
    if (!content.trim() || !todayEntry) return

    const timer = setTimeout(() => {
      if (content !== todayEntry?.content || 
          selectedMood !== todayEntry?.mood || 
          JSON.stringify(images) !== JSON.stringify(todayEntry?.images || [])) {
        autoSave()
      }
    }, 3000)

    return () => clearTimeout(timer)
  }, [content, selectedMood, images])

  // 글자 수 계산
  useEffect(() => {
    setWordCount(content.length)
  }, [content])

  // todayEntry 변경 시 이미지 상태 동기화 (디버그 로그 포함)
  useEffect(() => {
    if (todayEntry) {
      console.log('✅ todayEntry 변경 감지:', {
        date: todayEntry.date,
        hasImages: !!todayEntry.images,
        imageCount: todayEntry.images?.length || 0,
        images: todayEntry.images
      })
      
      // 기존 상태와 비교해서 다를 경우에만 업데이트
      const existingImageStr = JSON.stringify(images)
      const newImageStr = JSON.stringify(todayEntry.images || [])
      
      if (existingImageStr !== newImageStr) {
        console.log('🔄 이미지 상태 업데이트:', {
          기존: images.length,
          새로운: todayEntry.images?.length || 0
        })
        setImages(todayEntry.images || [])
      }
    } else {
      console.log('📝 새 일기 작성 모드 - 이미지 초기화')
      if (images.length > 0) {
        setImages([])
      }
    }
  }, [todayEntry])

  const loadDiaries = async (targetDate: Date) => {
    setIsLoading(true)
    try {
      const todayStr = format(targetDate, 'yyyy-MM-dd')
      const yesterdayStr = format(subDays(targetDate, 1), 'yyyy-MM-dd')

      // 오늘 일기 조회
      try {
        const todayDiary = await diaryService.getDiaryByDate(todayStr)
        console.log('📖 일기 로드 성공:', {
          date: todayStr,
          hasContent: !!todayDiary.content,
          hasImages: !!todayDiary.images,
          imageCount: todayDiary.images?.length || 0,
          imagesFirstChar: todayDiary.images?.[0]?.substring(0, 30) || 'none'
        })
        
        setTodayEntry(todayDiary)
        setContent(todayDiary.content || '')
        setSelectedMood(todayDiary.mood || '😊')
        setImages(todayDiary.images || [])
      } catch (error: any) {
        if (error.response?.status === 404) {
          console.log('📄 일기 없음 - 새 일기 모드')
          setTodayEntry(null)
          setContent('')
          setSelectedMood('😊')
          setImages([])
        }
      }

      // 어제 일기 조회
      try {
        const yesterdayDiary = await diaryService.getDiaryByDate(yesterdayStr)
        setYesterdayEntry(yesterdayDiary)
      } catch (error: any) {
        if (error.response?.status === 404) {
          setYesterdayEntry(null)
        }
      }
    } catch (error) {
      console.error('Failed to load diaries:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const autoSave = async () => {
    if (!content.trim()) return
    
    setIsAutoSaving(true)
    try {
      const dateStr = format(currentDate, 'yyyy-MM-dd')
      const diaryData = {
        date: dateStr,
        content: content.trim(),
        mood: selectedMood,
        weather: undefined as string | undefined,
        images: images.length > 0 ? images : undefined,
        tags: [] as string[]
      }

      if (todayEntry?.id) {
        await diaryService.updateDiary(todayEntry.id, diaryData)
      } else {
        const newEntry = await diaryService.createDiary(diaryData)
        setTodayEntry(newEntry)
      }
    } catch (error) {
      console.error('Auto save failed:', error)
    } finally {
      setIsAutoSaving(false)
    }
  }

  const handleSave = async () => {
    if (!content.trim()) return

    setIsLoading(true)
    try {
      const dateStr = format(currentDate, 'yyyy-MM-dd')
      
      // 이미지 크기 검증 및 디버그 정보
      let processedImages: string[] | undefined = undefined
      if (images.length > 0) {
        processedImages = []
        for (const img of images) {
          // Base64 크기 확인
          const sizeMB = (img.length * 3) / 4 / (1024 * 1024)
          console.log(`이미지 크기: ${sizeMB.toFixed(2)}MB`)
          
          // 크기가 너무 크면 재압축
          if (sizeMB > 1) {
            console.warn(`이미지가 1MB를 초과합니다. 현재: ${sizeMB.toFixed(2)}MB`)
          }
          processedImages.push(img)
        }
      }
      
      const diaryData = {
        date: dateStr,
        content: content.trim(),
        mood: selectedMood,
        weather: undefined as string | undefined,
        images: processedImages,
        tags: [] as string[]
      }

      console.log('저장할 일기 데이터:', {
        date: dateStr,
        contentLength: content.length,
        mood: selectedMood,
        imageCount: processedImages?.length || 0,
        totalDataSize: JSON.stringify(diaryData).length / 1024 + 'KB'
      })

      let savedEntry: DiaryEntry
      
      if (todayEntry?.id) {
        console.log('기존 일기 업데이트:', todayEntry.id)
        savedEntry = await diaryService.updateDiary(todayEntry.id, diaryData)
      } else {
        console.log('새 일기 생성')
        savedEntry = await diaryService.createDiary(diaryData)
      }

      console.log('저장 성공:', savedEntry)
      setTodayEntry(savedEntry)
      
      if (onSave) {
        onSave(savedEntry)
      }
      
      // 성공 알림
      alert('일기가 저장되었습니다!')
    } catch (error: any) {
      console.error('일기 저장 실패 상세 정보:')
      console.error('Error object:', error)
      console.error('Error message:', error?.message)
      console.error('Error response:', error?.response)
      console.error('Error status:', error?.response?.status)
      console.error('Error data:', error?.response?.data)
      
      // 더 구체적인 에러 메시지
      let errorMessage = '일기 저장에 실패했습니다.'
      if (error?.response?.status === 413) {
        errorMessage = '이미지 크기가 너무 큽니다. 더 작은 이미지를 선택해주세요.'
      } else if (error?.response?.status === 500) {
        errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
      } else if (error?.response?.status === 404) {
        errorMessage = '다이어리 서비스에 연결할 수 없습니다.'
      } else if (error?.message) {
        errorMessage = `저장 실패: ${error.message}`
      }
      
      alert(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePrevDay = () => {
    setCurrentDate(subDays(currentDate, 1))
  }

  const handleNextDay = () => {
    setCurrentDate(addDays(currentDate, 1))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft' && e.ctrlKey) {
      handlePrevDay()
    } else if (e.key === 'ArrowRight' && e.ctrlKey) {
      handleNextDay()
    } else if (e.key === 'Escape') {
      onClose()
    } else if (e.key === 's' && e.ctrlKey) {
      e.preventDefault()
      handleSave()
    }
  }

  // 이미지를 WebP로 변환하고 압축하는 함수 (고급 압축 알고리즘)
  const compressAndConvertImage = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      const img = new Image()
      
      img.onload = () => {
        let { width, height } = img
        
        // 스마트 크기 조정 - 파일 크기에 따라 다른 전략
        const originalSizeMB = file.size / (1024 * 1024)
        let maxWidth = 1920, maxHeight = 1920, quality = 0.85
        
        // 파일 크기별 최적화 전략
        if (originalSizeMB > 20) {
          // 매우 큰 파일 (20MB+) - 적극적 압축
          maxWidth = 1200
          maxHeight = 1200
          quality = 0.7
        } else if (originalSizeMB > 10) {
          // 큰 파일 (10-20MB) - 중간 압축
          maxWidth = 1600
          maxHeight = 1600
          quality = 0.75
        } else if (originalSizeMB > 5) {
          // 중간 파일 (5-10MB) - 경량 압축
          maxWidth = 1920
          maxHeight = 1920
          quality = 0.8
        }
        // 5MB 이하는 기본 설정 유지
        
        // 비율 유지하면서 크기 조정
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        if (ratio < 1) {
          width = Math.floor(width * ratio)
          height = Math.floor(height * ratio)
        }
        
        // 캔버스 크기 설정
        canvas.width = width
        canvas.height = height
        
        // 고품질 렌더링 설정
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        
        // 이미지 그리기
        ctx.drawImage(img, 0, 0, width, height)
        
        // WebP 지원 여부 확인
        const testCanvas = document.createElement('canvas')
        testCanvas.width = testCanvas.height = 1
        const testCtx = testCanvas.getContext('2d')!
        testCtx.fillRect(0, 0, 1, 1)
        const supportsWebP = testCanvas.toDataURL('image/webp').startsWith('data:image/webp')
        
        // 최적 포맷 선택 및 압축
        let compressedDataUrl: string
        if (supportsWebP) {
          compressedDataUrl = canvas.toDataURL('image/webp', quality)
        } else {
          compressedDataUrl = canvas.toDataURL('image/jpeg', quality)
        }
        
        // 추가 압축이 필요한 경우 품질 조정
        const compressedSize = (compressedDataUrl.length * 3) / 4 / (1024 * 1024)
        if (compressedSize > 2 && quality > 0.5) {
          const newQuality = Math.max(0.5, quality * 0.8)
          compressedDataUrl = canvas.toDataURL(supportsWebP ? 'image/webp' : 'image/jpeg', newQuality)
        }
        
        resolve(compressedDataUrl)
      }
      
      img.src = URL.createObjectURL(file)
    })
  }

  // Image upload handlers
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    
    // 최대 3장 제한
    if (images.length + files.length > 3) {
      alert('최대 3장까지 업로드 가능합니다')
      return
    }
    
    setIsUploading(true)
    
    try {
      const newImages: string[] = []
      for (const file of Array.from(files)) {
        // 이미지 파일 타입 확인
        if (!file.type.startsWith('image/')) {
          alert('이미지 파일만 업로드 가능합니다')
          continue
        }
        
        // 원본 파일이 너무 큰 경우 (50MB 제한)
        if (file.size > 50 * 1024 * 1024) {
          alert('파일 크기는 50MB 이하만 가능합니다')
          continue
        }
        
        // 압축 및 WebP 변환
        const compressedImage = await compressAndConvertImage(file)
        
        // 압축된 이미지 크기 확인 (Base64는 원본의 약 1.33배)
        const compressedSizeBytes = (compressedImage.length * 3) / 4
        const compressedSizeMB = compressedSizeBytes / (1024 * 1024)
        const compressionRatio = ((1 - compressedSizeBytes / file.size) * 100).toFixed(1)
        const format = compressedImage.startsWith('data:image/webp') ? 'WebP' : 'JPEG'
        
        console.log(`✅ 이미지 압축 완료: ${file.name}`)
        console.log(`📐 포맷: ${format} | 원본: ${(file.size / (1024 * 1024)).toFixed(2)}MB → 압축: ${compressedSizeMB.toFixed(2)}MB`)
        console.log(`📈 압축률: ${compressionRatio}% 감소`)
        
        newImages.push(compressedImage)
      }
      
      setImages(prev => [...prev, ...newImages])
    } catch (error) {
      console.error('Image upload failed:', error)
      alert('이미지 업로드 중 오류가 발생했습니다')
    } finally {
      setIsUploading(false)
      // Clear input
      e.target.value = ''
    }
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div 
        className="diary-book-container relative max-w-6xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 일기장 그림자 */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/20 to-gray-700/40 dark:from-slate-900/40 dark:to-slate-700/60 rounded-2xl transform rotate-1 scale-105" />
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800/30 to-gray-600/50 dark:from-slate-800/50 dark:to-slate-600/70 rounded-2xl transform -rotate-1 scale-102" />
        
        {/* 메인 일기장 */}
        <div className="relative bg-gradient-to-b from-amber-50 to-amber-100 dark:from-slate-800 dark:to-slate-900 rounded-2xl shadow-2xl border-2 border-amber-200 dark:border-slate-700 p-8">
          
          {/* 상단 헤더 */}
          <div className="flex justify-between items-start mb-6">
            {/* 날짜 (좌상단) */}
            <div className="text-sm font-medium text-amber-700 dark:text-gray-400">
              {format(currentDate, 'yyyy년 M월', { locale: ko })}
            </div>
            
            {/* 일기장 제목 (중앙) */}
            <div className="flex-1 text-center">
              <h1 className="text-2xl font-light text-amber-800 dark:text-gray-200 tracking-wide" style={{ fontFamily: 'Georgia, serif' }}>
                하루의 여백
              </h1>
              <div className="w-20 h-0.5 bg-gradient-to-r from-amber-400 to-amber-600 dark:from-purple-500 dark:to-indigo-500 mx-auto mt-2 rounded-full" />
            </div>
            
            {/* 닫기 버튼 (우상단) */}
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* 일기장 내용 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[500px]">
            
            {/* 왼쪽 페이지 - 어제 일기 */}
            <div className="diary-page relative">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-300 dark:bg-slate-600 rounded-full" />
              <div className="pl-6">
                {/* 어제 날짜 헤더 */}
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
                    {yesterdayEntry?.mood && (
                      <span className="text-2xl">{yesterdayEntry.mood}</span>
                    )}
                  </div>
                  
                  {/* 어제의 조언 */}
                  <div className="mt-3 p-2 bg-amber-100/50 dark:bg-slate-700/30 rounded-lg border border-amber-200 dark:border-slate-600">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-amber-600 dark:text-gray-400">
                        {getCategoryIcon(yesterdayAdvice.category)}
                      </span>
                      <span className="text-amber-700 dark:text-gray-300 leading-relaxed">
                        {yesterdayAdvice.advice}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 어제 일기 내용 */}
                <div className="diary-content">
                  {yesterdayEntry ? (
                    <div className="space-y-3">
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap text-sm" style={{ fontFamily: 'Georgia, serif' }}>
                        {yesterdayEntry.content}
                      </p>
                      <div className="text-xs text-gray-500 text-right">
                        {yesterdayEntry.content.length}자
                      </div>
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

            {/* 가운데 바인딩 라인 */}
            <div className="hidden lg:block absolute left-1/2 top-16 bottom-16 w-px bg-gradient-to-b from-amber-300 via-amber-400 to-amber-300 dark:from-transparent dark:via-slate-500 dark:to-transparent" />
            
            {/* 오른쪽 페이지 - 오늘 일기 */}
            <div className="diary-page relative">
              <div className="absolute right-0 top-0 bottom-0 w-1 bg-red-300 dark:bg-slate-600 rounded-full" />
              <div className="pr-6">
                {/* 오늘 날짜 헤더 */}
                <div className="border-b-2 border-dashed border-amber-300 dark:border-slate-600 pb-3 mb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-lg font-semibold text-amber-700 dark:text-gray-300">
                        {format(currentDate, 'M월 d일', { locale: ko })}
                      </h2>
                      <p className="text-sm text-amber-600 dark:text-gray-400">
                        {format(currentDate, 'EEEE', { locale: ko })}
                      </p>
                    </div>
                    
                    {/* 기분 선택 */}
                    <div className="flex gap-1">
                      {MOODS.slice(0, 4).map(({ emoji }) => (
                        <button
                          key={emoji}
                          onClick={() => setSelectedMood(emoji)}
                          className={`text-xl p-1 rounded transition-all hover:scale-110 ${
                            selectedMood === emoji ? 'bg-amber-200 dark:bg-slate-700 shadow-sm' : 'hover:bg-amber-100 dark:hover:bg-slate-800'
                          }`}
                          title={MOODS.find(m => m.emoji === emoji)?.label}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* 오늘의 조언 */}
                  <div 
                    className="mt-3 p-3 rounded-lg border-2 border-dashed shadow-sm"
                    style={{ 
                      backgroundColor: getCategoryColor(todayAdvice.category) + '15',
                      borderColor: getCategoryColor(todayAdvice.category) + '40'
                    }}
                  >
                    <div className="flex items-start gap-2 text-xs">
                      <span className="text-base mt-1" style={{ color: getCategoryColor(todayAdvice.category) }}>
                        {getCategoryIcon(todayAdvice.category)}
                      </span>
                      <span 
                        className="leading-relaxed font-medium"
                        style={{ color: getCategoryColor(todayAdvice.category) }}
                      >
                        {todayAdvice.advice}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 오늘 일기 작성 영역 */}
                <div className="diary-content">
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="오늘 하루는 어땠나요? 마음속 이야기를 자유롭게 적어보세요..."
                    className="w-full h-64 p-0 border-none bg-transparent resize-none focus:outline-none text-gray-700 dark:text-gray-300 placeholder-amber-400 dark:placeholder-gray-500 leading-relaxed"
                    style={{ 
                      fontFamily: 'Georgia, serif',
                      fontSize: '14px',
                      lineHeight: '24px',
                      background: `repeating-linear-gradient(
                        transparent,
                        transparent 23px,
                        rgba(251, 191, 36, 0.2) 23px,
                        rgba(251, 191, 36, 0.2) 24px
                      )`
                    }}
                  />

                  {/* 이미지 업로드 섹션 */}
                  <div className="mt-4">
                    {/* 업로드 버튼 */}
                    <div className="flex items-center gap-3">
                      <label className={`flex items-center gap-2 px-3 py-2 
                                       bg-slate-100 dark:bg-slate-700 
                                       hover:bg-slate-200 dark:hover:bg-slate-600 
                                       rounded-lg cursor-pointer transition-colors w-fit
                                       ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <Camera className="w-4 h-4" />
                        <span className="text-sm">
                          {isUploading ? '압축 중...' : '사진 추가'}
                        </span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          multiple 
                          className="hidden"
                          onChange={handleImageUpload}
                          disabled={isUploading}
                        />
                      </label>
                      
                      {/* 압축 정보 */}
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        최대 3장 • 자동 WebP 압축 • 50MB 이하
                      </span>
                    </div>

                    {/* 이미지 썸네일 */}
                    {images.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mt-3">
                        {images.map((img, idx) => (
                          <div key={idx} className="relative group">
                            <img 
                              src={img} 
                              className="w-full h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                              alt={`업로드된 이미지 ${idx + 1}`}
                              onClick={() => {
                                setCurrentImageIndex(idx)
                                setImageViewerOpen(true)
                              }}
                            />
                            <button 
                              onClick={() => removeImage(idx)}
                              className="absolute top-1 right-1 
                                         bg-red-500 hover:bg-red-600 text-white 
                                         rounded-full w-5 h-5 flex items-center justify-center
                                         opacity-0 group-hover:opacity-100 
                                         transition-opacity text-xs font-bold"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 로딩 상태 */}
                    {isUploading && (
                      <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
                        <span>이미지 업로드 중...</span>
                      </div>
                    )}
                  </div>
                  
                  {/* 하단 정보 */}
                  <div className="flex justify-between items-center text-xs text-gray-500 mt-2">
                    <div className="flex items-center gap-3">
                      <span>{wordCount}자</span>
                      {isAutoSaving && (
                        <span className="text-blue-500 animate-pulse">자동 저장 중...</span>
                      )}
                    </div>
                    
                    {/* 날씨나 기타 정보 */}
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
            <button
              onClick={handlePrevDay}
              className="flex items-center gap-2 px-4 py-2 text-amber-700 dark:text-gray-300 hover:bg-amber-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <span className="text-lg">◀</span>
              <span className="text-sm font-medium">어제</span>
            </button>

            <div className="text-center">
              <div className="text-xs text-amber-600 dark:text-gray-500">
                Ctrl + ← → 로 페이지 이동
              </div>
            </div>

            <button
              onClick={handleNextDay}
              className="flex items-center gap-2 px-4 py-2 text-amber-700 dark:text-gray-300 hover:bg-amber-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <span className="text-sm font-medium">내일</span>
              <span className="text-lg">▶</span>
            </button>
          </div>

          {/* 액션 버튼들 */}
          <div className="flex justify-end items-center mt-4">
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={!content.trim() || isLoading}
                className={`
                  px-6 py-2 rounded-lg font-medium transition-colors
                  ${content.trim() && !isLoading
                    ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm'
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
                  }
                `}
              >
                {isLoading ? '저장 중...' : '저장하기'}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* 이미지 뷰어 */}
      <ImageViewer
        images={images}
        currentIndex={currentImageIndex}
        isOpen={imageViewerOpen}
        onClose={() => setImageViewerOpen(false)}
      />
    </div>
  )
}