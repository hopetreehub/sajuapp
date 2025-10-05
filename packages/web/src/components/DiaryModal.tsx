import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { diaryService, DiaryEntry } from '@/services/api';
import Modal from './Modal';

interface DiaryModalProps {
  isOpen: boolean
  onClose: () => void
  date: Date
  onSave?: (entry: DiaryEntry) => void
}

const MOODS = [
  { emoji: '😊', label: '기쁨', traditional: '희(喜)', color: 'wuxing-fire', element: '화(火)' },
  { emoji: '😢', label: '슬픔', traditional: '애(哀)', color: 'wuxing-metal', element: '금(金)' },
  { emoji: '😠', label: '분노', traditional: '노(怒)', color: 'wuxing-wood', element: '목(木)' },
  { emoji: '😰', label: '두려움', traditional: '공(恐)', color: 'wuxing-water', element: '수(水)' },
  { emoji: '🤔', label: '생각', traditional: '사(思)', color: 'wuxing-earth', element: '토(土)' },
  { emoji: '😌', label: '평온', traditional: '정(靜)', color: 'yinyang-yin', element: '음(陰)' },
  { emoji: '🌟', label: '활기', traditional: '양(陽)', color: 'yinyang-yang', element: '양(陽)' },
  { emoji: '😐', label: '담담', traditional: '무(無)', color: 'wuxing-metal-light', element: '중용' },
];

export default function DiaryModal({ isOpen, onClose, date, onSave }: DiaryModalProps) {
  const [_currentDate, _setCurrentDate] = useState(date);
  const [content, setContent] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [existingEntry, setExistingEntry] = useState<DiaryEntry | null>(null);
  const [_yesterdayEntry, _setYesterdayEntry] = useState<DiaryEntry | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [_isAutoSaving, _setIsAutoSaving] = useState(false);

  const fetchDiary = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const diary = await diaryService.getDiaryByDate(dateStr);
      setExistingEntry(diary);
      setContent(diary.content);
      setSelectedMood(diary.mood || '');
    } catch (error: any) {
      // 404는 정상 상황 (해당 날짜에 일기가 없음)
      if (error.response?.status === 404) {
        setExistingEntry(null);
        setContent('');
        setSelectedMood('');
      } else {
        console.error('Failed to fetch diary:', error);
        setError('일기를 불러오는데 실패했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [date]);

  // 날짜가 변경되거나 모달이 열릴 때 기존 일기 조회
  useEffect(() => {
    if (isOpen && date) {
      fetchDiary();
    }
  }, [date, isOpen, fetchDiary]);

  const handleSave = async () => {
    if (!content.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const diaryData = {
        date: dateStr,
        content: content.trim(),
        mood: selectedMood || '😐',
        weather: undefined as string | undefined,
        tags: [] as string[],
      };

      let savedEntry: DiaryEntry;
      
      if (existingEntry?.id) {
        // 기존 일기 수정
        savedEntry = await diaryService.updateDiary(existingEntry.id, diaryData);
      } else {
        // 새 일기 작성
        savedEntry = await diaryService.createDiary(diaryData);
      }

      // 부모 컴포넌트에 저장된 데이터 전달 (선택적)
      if (onSave) {
        onSave(savedEntry);
      }
      
      // 성공 메시지 (선택적)
      alert(existingEntry ? '일기가 수정되었습니다.' : '일기가 저장되었습니다.');
      
      onClose();
    } catch (error: any) {
      console.error('Failed to save diary:', error);
      setError('일기 저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (content !== (existingEntry?.content || '') || selectedMood !== (existingEntry?.mood || '')) {
      if (window.confirm('작성 중인 내용이 있습니다. 정말 닫으시겠습니까?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

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

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">
              ⚠️ {error}
            </p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && !existingEntry && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-600 dark:text-blue-400">
              📖 일기를 불러오는 중...
            </p>
          </div>
        )}

        {/* Traditional Korean Mood Selector */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
            <span className="mr-2">🎭</span>
            오늘의 마음을 선택해주세요
            <span className="ml-2 text-xs text-gray-500">(오행 감정론 기반)</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {MOODS.map(({ emoji, label, traditional, color, element }) => (
              <button
                key={emoji}
                onClick={() => setSelectedMood(emoji)}
                className={`
                  group relative flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105
                  ${selectedMood === emoji
                    ? `border-${color} bg-gradient-to-br from-${color}/10 to-${color}/20 shadow-lg`
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-800'
                  }
                `}
                style={{
                  borderColor: selectedMood === emoji ? `hsl(var(--${color.replace('wuxing-', '').replace('yinyang-', '')}))` : undefined,
                }}
              >
                {/* 이모지와 선택 효과 */}
                <div className="relative mb-2">
                  <span className="text-2xl transition-transform group-hover:scale-110">{emoji}</span>
                  {selectedMood === emoji && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white">✓</span>
                    </div>
                  )}
                </div>

                {/* 한국어 감정명 */}
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {label}
                </span>

                {/* 한자 전통 감정명 */}
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  {traditional}
                </span>

                {/* 오행 원소 표시 */}
                <span className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {element}
                </span>

                {/* 선택시 그라데이션 효과 */}
                {selectedMood === emoji && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-transparent via-white/20 to-transparent opacity-50 pointer-events-none"></div>
                )}
              </button>
            ))}
          </div>

          {/* 선택된 감정에 대한 설명 */}
          {selectedMood && (
            <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              {(() => {
                const selectedMoodData = MOODS.find(m => m.emoji === selectedMood);
                return (
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    <span className="font-semibold">{selectedMoodData?.traditional}</span> - {selectedMoodData?.element} 기운의 감정입니다.
                    {selectedMoodData?.element === '화(火)' && ' 밝고 활발한 에너지를 나타냅니다.'}
                    {selectedMoodData?.element === '금(金)' && ' 차분하고 정제된 에너지를 나타냅니다.'}
                    {selectedMoodData?.element === '목(木)' && ' 성장하고 발전하려는 에너지를 나타냅니다.'}
                    {selectedMoodData?.element === '수(水)' && ' 유연하고 깊이 있는 에너지를 나타냅니다.'}
                    {selectedMoodData?.element === '토(土)' && ' 안정되고 신중한 에너지를 나타냅니다.'}
                    {selectedMoodData?.element === '음(陰)' && ' 고요하고 내향적인 에너지를 나타냅니다.'}
                    {selectedMoodData?.element === '양(陽)' && ' 활발하고 외향적인 에너지를 나타냅니다.'}
                    {selectedMoodData?.element === '중용' && ' 균형잡힌 중도의 마음을 나타냅니다.'}
                  </p>
                );
              })()}
            </div>
          )}
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
  );
}