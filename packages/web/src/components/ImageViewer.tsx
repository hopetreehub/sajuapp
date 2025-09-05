import React, { useState, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface ImageViewerProps {
  images: string[]
  currentIndex: number
  isOpen: boolean
  onClose: () => void
  onNext?: () => void
  onPrev?: () => void
}

export default function ImageViewer({ 
  images, 
  currentIndex: initialIndex, 
  isOpen, 
  onClose,
  onNext,
  onPrev
}: ImageViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setCurrentIndex(initialIndex)
  }, [initialIndex])

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowLeft') {
        handlePrevImage()
      } else if (e.key === 'ArrowRight') {
        handleNextImage()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, currentIndex, images.length])

  const handleNextImage = () => {
    if (images.length <= 1) return
    const nextIndex = (currentIndex + 1) % images.length
    setCurrentIndex(nextIndex)
    setIsLoading(true)
    onNext?.()
  }

  const handlePrevImage = () => {
    if (images.length <= 1) return
    const prevIndex = (currentIndex - 1 + images.length) % images.length
    setCurrentIndex(prevIndex)
    setIsLoading(true)
    onPrev?.()
  }

  const handleImageLoad = () => {
    setIsLoading(false)
  }

  if (!isOpen || !images || images.length === 0) return null

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center"
      onClick={onClose}
    >
      {/* 헤더 */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between bg-gradient-to-b from-black/50 to-transparent">
        <div className="text-white text-sm font-medium">
          {currentIndex + 1} / {images.length}
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-sm"
          aria-label="닫기"
        >
          <X className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* 이미지 컨테이너 */}
      <div 
        className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 로딩 스피너 */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        )}

        {/* 메인 이미지 */}
        <img
          src={images[currentIndex]}
          alt={`이미지 ${currentIndex + 1}`}
          className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
          onLoad={handleImageLoad}
          style={{ display: isLoading ? 'none' : 'block' }}
        />

        {/* 좌우 네비게이션 버튼 */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handlePrevImage()
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all backdrop-blur-sm group"
              aria-label="이전 이미지"
            >
              <ChevronLeft className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleNextImage()
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all backdrop-blur-sm group"
              aria-label="다음 이미지"
            >
              <ChevronRight className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
            </button>
          </>
        )}
      </div>

      {/* 하단 썸네일 바 (옵션) */}
      {images.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
          <div className="flex items-center justify-center gap-2 overflow-x-auto max-w-full">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation()
                  setCurrentIndex(index)
                  setIsLoading(true)
                }}
                className={`
                  relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0
                  ${index === currentIndex 
                    ? 'border-white scale-110 shadow-xl' 
                    : 'border-white/30 hover:border-white/60 hover:scale-105'
                  }
                `}
              >
                <img
                  src={image}
                  alt={`썸네일 ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 키보드 단축키 안내 */}
      <div className="absolute bottom-4 left-4 text-white/60 text-xs">
        <div>ESC: 닫기</div>
        <div>← →: 이미지 이동</div>
      </div>
    </div>
  )
}