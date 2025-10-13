/**
 * 타로 카드 기록 뷰 컴포넌트
 * 저장된 타로 리딩 기록을 보여주는 컴포넌트
 */

import React, { useState, useEffect } from 'react';
import { getTarotReadings, deleteTarotReading, exportTarotReadings } from '@/utils/tarotStorage';
import type { TarotReading } from '@/types/tarot';
import TarotCardComponent from './TarotCard';

interface TarotHistoryViewProps {
  onClose: () => void;
}

export default function TarotHistoryView({ onClose }: TarotHistoryViewProps) {
  const [readings, setReadings] = useState<TarotReading[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // 기록 로드
  useEffect(() => {
    loadReadings();
  }, []);

  const loadReadings = () => {
    const allReadings = getTarotReadings();
    setReadings(allReadings);
  };

  // 기록 삭제
  const handleDelete = (id: string) => {
    if (window.confirm('이 타로 기록을 삭제하시겠습니까?')) {
      const success = deleteTarotReading(id);
      if (success) {
        loadReadings();
        if (expandedId === id) {
          setExpandedId(null);
        }
      }
    }
  };

  // 기록 내보내기
  const handleExport = () => {
    try {
      const jsonData = exportTarotReadings();
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `타로기록_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      alert('타로 기록을 내보냈습니다');
    } catch (error) {
      console.error('[타로 기록] 내보내기 실패:', error);
      alert('내보내기 실패');
    }
  };

  // 날짜 포맷팅
  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            📜 타로 기록
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            총 {readings.length}개의 기록
          </p>
        </div>
        <div className="flex gap-2">
          {readings.length > 0 && (
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm"
            >
              내보내기
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all text-sm"
          >
            닫기
          </button>
        </div>
      </div>

      {/* 기록 목록 */}
      {readings.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔮</div>
          <p className="text-gray-600 dark:text-gray-400">아직 저장된 타로 기록이 없습니다</p>
        </div>
      ) : (
        <div className="space-y-4">
          {readings.map((reading) => (
            <div
              key={reading.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
            >
              {/* 기록 요약 */}
              <div
                className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-all"
                onClick={() => setExpandedId(expandedId === reading.id ? null : reading.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded-full font-semibold">
                        {reading.spreadName}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(reading.createdAt)}
                      </span>
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-white mb-1">
                      {reading.question}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {reading.cards.length}장의 카드
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(reading.id);
                      }}
                      className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-all"
                      title="삭제"
                    >
                      🗑️
                    </button>
                    <div className="text-gray-400">
                      {expandedId === reading.id ? '▲' : '▼'}
                    </div>
                  </div>
                </div>
              </div>

              {/* 기록 상세 (확장) */}
              {expandedId === reading.id && (
                <div className="p-6 space-y-6">
                  {/* 질문 */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      질문
                    </h4>
                    <p className="text-gray-900 dark:text-white">{reading.question}</p>
                  </div>

                  {/* 카드 배치 */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                      카드 배치
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {reading.cards.map((cardReading, index) => (
                        <div
                          key={index}
                          className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4"
                        >
                          {/* 위치 정보 */}
                          <div className="mb-3">
                            <div className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                              {cardReading.positionName}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              {cardReading.positionMeaning}
                            </div>
                          </div>

                          {/* 카드 미니 뷰 */}
                          <div className="mb-3">
                            <div className="w-full h-48 relative">
                              <TarotCardComponent
                                card={cardReading.card}
                                isReversed={cardReading.isReversed}
                                isFlipped={true}
                                className="w-full h-full"
                              />
                            </div>
                          </div>

                          {/* 카드 정보 */}
                          <div className="text-center">
                            <div className="font-semibold text-gray-900 dark:text-white text-sm">
                              {cardReading.card.nameKo}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                              {cardReading.isReversed ? '역방향 ↓' : '정방향 ↑'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI 해석 */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                      <span>🤖</span>
                      <span>AI 타로 해석</span>
                    </h4>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                      <div className="prose dark:prose-invert max-w-none">
                        <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 text-sm">
                          {reading.aiInterpretation}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
