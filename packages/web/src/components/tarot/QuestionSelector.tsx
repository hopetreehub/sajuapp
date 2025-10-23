/**
 * 타로 질문 카테고리 선택 컴포넌트
 * - 7대 카테고리별 탭 UI
 * - 다크모드 최적화
 * - 반응형 디자인
 */

import React, { useState, useMemo } from 'react';
import type { QuestionCategory, CategorizedQuestion } from '@/utils/tarotSpread';
import { QUESTION_CATEGORIES } from '@/utils/tarotSpread';

interface QuestionSelectorProps {
  questions: CategorizedQuestion[];
  onSelectQuestion: (question: string) => void;
  currentQuestion?: string; // 현재 선택된 질문 (하이라이트용)
}

export default function QuestionSelector({
  questions,
  onSelectQuestion,
  currentQuestion = '',
}: QuestionSelectorProps) {
  // 첫 번째로 질문이 있는 카테고리를 기본 선택
  const firstAvailableCategory = useMemo(() => {
    for (const category of QUESTION_CATEGORIES) {
      const count = questions.filter((q) => q.category === category.id).length;
      if (count > 0) return category.id;
    }
    return 'general';
  }, [questions]);

  const [selectedCategory, setSelectedCategory] = useState<QuestionCategory>(firstAvailableCategory);

  // 선택된 카테고리의 질문만 필터링
  const filteredQuestions = useMemo(
    () => questions.filter((q) => q.category === selectedCategory),
    [questions, selectedCategory]
  );

  // 카테고리별 질문 개수
  const getCategoryCount = (categoryId: QuestionCategory): number => {
    return questions.filter((q) => q.category === categoryId).length;
  };

  return (
    <div className="mt-4 space-y-4">
      {/* 헤더 */}
      <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
        💡 질문 카테고리를 선택하세요
      </div>

      {/* 카테고리 탭 */}
      <div className="flex flex-wrap gap-2">
        {QUESTION_CATEGORIES.map((category) => {
          const count = getCategoryCount(category.id);
          if (count === 0) return null; // 질문이 없는 카테고리는 숨김

          const isActive = selectedCategory === category.id;
          const classes = isActive
            ? category.colorClasses.active
            : `${category.colorClasses.inactive} ${category.colorClasses.hover}`;

          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`
                px-4 py-2.5 rounded-lg text-sm font-medium transition-all
                focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
                dark:focus:ring-offset-gray-800
                ${classes}
                ${isActive ? 'scale-105' : 'scale-100'}
              `}
              title={category.description}
            >
              <span className="flex items-center gap-2">
                <span className="text-base">{category.emoji}</span>
                <span>{category.name}</span>
                <span className="text-xs opacity-75">({count})</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* 질문 리스트 */}
      <div className="space-y-2">
        {filteredQuestions.length > 0 ? (
          <>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {QUESTION_CATEGORIES.find((c) => c.id === selectedCategory)?.description}
            </div>
            <div className="flex flex-wrap gap-2">
              {filteredQuestions.map((item, index) => {
                const isSelected = item.question === currentQuestion;

                return (
                  <button
                    key={index}
                    onClick={() => onSelectQuestion(item.question)}
                    className={`
                      px-3 py-2 rounded-lg text-sm transition-all
                      focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
                      dark:focus:ring-offset-gray-800
                      ${
                        isSelected
                          ? 'bg-purple-500 dark:bg-purple-600 text-white shadow-md ring-2 ring-purple-300 dark:ring-purple-500'
                          : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50'
                      }
                    `}
                  >
                    {item.question}
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
            <div className="text-2xl mb-2">🤔</div>
            <div>이 카테고리에는 아직 질문이 없습니다.</div>
            <div className="text-xs mt-1">다른 카테고리를 선택해보세요.</div>
          </div>
        )}
      </div>
    </div>
  );
}
