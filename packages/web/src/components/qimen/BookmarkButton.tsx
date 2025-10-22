import React, { useState, useEffect } from 'react';
import { useQimenBookmarkStore } from '@/stores/qimenBookmarkStore';
import type { QimenChart } from '@/types/qimen';
import type { QimenContext } from '@/data/qimenContextWeights';

interface BookmarkButtonProps {
  chart: QimenChart;
  dateTime: Date;
  customerName?: string;
  customerBirthDate?: string;
  context: QimenContext;
  className?: string;
}

const BookmarkButton: React.FC<BookmarkButtonProps> = ({
  chart,
  dateTime,
  customerName,
  customerBirthDate,
  context,
  className = '',
}) => {
  const { hasBookmark, addBookmark, removeBookmark, getAllBookmarks } =
    useQimenBookmarkStore();

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [note, setNote] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // 즐겨찾기 상태 확인
  useEffect(() => {
    setIsBookmarked(hasBookmark(dateTime, customerName, context));
  }, [dateTime, customerName, context, hasBookmark, getAllBookmarks()]);

  // 즐겨찾기 추가
  const handleAddBookmark = () => {
    // 기본 메모 생성
    const defaultNote = `${chart.yinYang === 'yang' ? '양둔' : '음둔'} ${chart.ju}국 - ${chart.overallFortune.summary.substring(0, 50)}...`;

    // 기본 태그 생성
    const defaultTags: string[] = [
      chart.overallFortune.level, // excellent, good, etc.
      chart.solarTerm.name, // 절기
      context, // 목적
    ];

    addBookmark({
      chart,
      dateTime,
      customerName,
      customerBirthDate,
      context,
      note: note || defaultNote,
      tags: tags.length > 0 ? tags : defaultTags,
      isShared: false,
    });

    setIsBookmarked(true);
    setShowModal(false);
    setNote('');
    setTags([]);
    setTagInput('');

    // Toast 알림 (간단히 alert 사용, 나중에 Toast 컴포넌트로 대체)
    alert('⭐ 즐겨찾기에 추가되었습니다!');
  };

  // 즐겨찾기 제거
  const handleRemoveBookmark = () => {
    const bookmarks = getAllBookmarks();
    const bookmark = bookmarks.find(
      (b) =>
        new Date(b.dateTime).toISOString() === dateTime.toISOString() &&
        b.customerName === customerName &&
        b.context === context,
    );

    if (bookmark) {
      if (confirm('이 즐겨찾기를 삭제하시겠습니까?')) {
        removeBookmark(bookmark.id);
        setIsBookmarked(false);
        alert('즐겨찾기가 삭제되었습니다.');
      }
    }
  };

  // 태그 추가
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  // 태그 제거
  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  // Enter 키로 태그 추가
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <>
      <button
        onClick={isBookmarked ? handleRemoveBookmark : () => setShowModal(true)}
        className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
          isBookmarked
            ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-900/50'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
        } ${className}`}
        title={isBookmarked ? '즐겨찾기 제거' : '즐겨찾기 추가'}
      >
        <span className="text-xl">{isBookmarked ? '⭐' : '☆'}</span>
        <span>{isBookmarked ? '즐겨찾기됨' : '즐겨찾기'}</span>
      </button>

      {/* 즐겨찾기 추가 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* 헤더 */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                  <span>⭐</span>
                  <span>즐겨찾기 추가</span>
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* 본문 */}
            <div className="p-6 space-y-6">
              {/* 차트 정보 요약 */}
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
                  저장할 차트 정보
                </h3>
                <div className="text-sm space-y-1 text-purple-700 dark:text-purple-300">
                  <p>📅 시간: {dateTime.toLocaleString('ko-KR')}</p>
                  <p>
                    ⚡ 국(局): {chart.yinYang === 'yang' ? '양둔' : '음둔'} {chart.ju}국
                  </p>
                  <p>🌸 절기: {chart.solarTerm.name}</p>
                  {customerName && <p>👤 고객: {customerName}</p>}
                  <p>
                    📊 점수: {chart.overallFortune.score}점 ({chart.overallFortune.level})
                  </p>
                </div>
              </div>

              {/* 메모 입력 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  📝 메모 (선택사항)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="이 차트에 대한 메모를 입력하세요... (예: 중요한 회의 시간)"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  rows={4}
                />
              </div>

              {/* 태그 입력 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  🏷️ 태그 (선택사항)
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder="태그 입력 후 Enter..."
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleAddTag}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                  >
                    추가
                  </button>
                </div>

                {/* 태그 목록 */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm"
                      >
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-purple-900 dark:hover:text-purple-100"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* 자동 태그 제안 */}
                {tags.length === 0 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    💡 메모와 태그를 비워두면 자동으로 생성됩니다
                  </p>
                )}
              </div>
            </div>

            {/* 액션 버튼 */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              <button
                onClick={handleAddBookmark}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg font-medium hover:from-yellow-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl"
              >
                ⭐ 즐겨찾기 추가
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BookmarkButton;
