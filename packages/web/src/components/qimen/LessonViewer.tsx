/**
 * 귀문둔갑 학습 레슨 뷰어
 *
 * 레슨 콘텐츠를 표시하고 진행률을 추적
 * @author Claude Code
 * @version 1.0.0
 */

import React, { useState, useMemo } from 'react';
import type { Lesson, LessonType } from '@/data/qimenCourses';
import ReactMarkdown from 'react-markdown';

interface LessonViewerProps {
  lesson: Lesson;
  isCompleted: boolean;
  quizScore?: number;
  onComplete: () => void;
  onStartQuiz?: () => void;
  onStartPractice?: () => void;
}

function LessonViewer({
  lesson,
  isCompleted,
  quizScore,
  onComplete,
  onStartQuiz,
  onStartPractice,
}: LessonViewerProps) {
  const [showKeyPoints, setShowKeyPoints] = useState(true);

  // 레슨 타입별 아이콘
  const lessonTypeIcon = useMemo(() => {
    const icons: Record<LessonType, string> = {
      theory: '📖',
      practice: '🎯',
      quiz: '❓',
      'case-study': '📋',
    };
    return icons[lesson.type];
  }, [lesson.type]);

  // 레슨 타입별 색상
  const lessonTypeColor = useMemo(() => {
    const colors: Record<LessonType, string> = {
      theory: 'blue',
      practice: 'green',
      quiz: 'purple',
      'case-study': 'orange',
    };
    return colors[lesson.type];
  }, [lesson.type]);

  const colorClasses = {
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-700',
      text: 'text-blue-900 dark:text-blue-300',
      button: 'bg-blue-500 hover:bg-blue-600',
    },
    green: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-700',
      text: 'text-green-900 dark:text-green-300',
      button: 'bg-green-500 hover:bg-green-600',
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      border: 'border-purple-200 dark:border-purple-700',
      text: 'text-purple-900 dark:text-purple-300',
      button: 'bg-purple-500 hover:bg-purple-600',
    },
    orange: {
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      border: 'border-orange-200 dark:border-orange-700',
      text: 'text-orange-900 dark:text-orange-300',
      button: 'bg-orange-500 hover:bg-orange-600',
    },
  };

  const colors = colorClasses[lessonTypeColor as keyof typeof colorClasses];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* 레슨 헤더 */}
      <div className={`p-6 rounded-xl border ${colors.bg} ${colors.border}`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{lessonTypeIcon}</span>
            <div>
              <h1 className={`text-2xl font-bold ${colors.text}`}>
                {lesson.title}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {lesson.description}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="px-3 py-1 bg-white dark:bg-gray-800 rounded-full text-sm font-medium">
              ⏱️ {lesson.duration}분
            </span>
            {isCompleted && (
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 rounded-full text-sm font-bold">
                ✅ 완료
              </span>
            )}
            {quizScore !== undefined && (
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-full text-sm font-bold">
                📊 {quizScore}점
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 핵심 포인트 */}
      {lesson.keyPoints.length > 0 && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-6">
          <button
            onClick={() => setShowKeyPoints(!showKeyPoints)}
            className="w-full flex items-center justify-between text-left"
          >
            <h2 className="text-xl font-bold text-yellow-900 dark:text-yellow-300 flex items-center gap-2">
              💡 핵심 포인트
            </h2>
            <span className="text-2xl">
              {showKeyPoints ? '▼' : '▶'}
            </span>
          </button>
          {showKeyPoints && (
            <ul className="mt-4 space-y-2">
              {lesson.keyPoints.map((point, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-yellow-800 dark:text-yellow-400"
                >
                  <span className="text-yellow-600 dark:text-yellow-500">✓</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* 레슨 콘텐츠 (Markdown) */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 shadow-sm">
        <div className="prose dark:prose-invert max-w-none">
          <ReactMarkdown
            components={{
              h1: ({ children }) => (
                <h1 className="text-3xl font-bold mt-8 mb-4 text-gray-900 dark:text-white border-b-2 border-gray-200 dark:border-gray-700 pb-2">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-2xl font-bold mt-6 mb-3 text-gray-800 dark:text-gray-200">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-xl font-semibold mt-4 mb-2 text-gray-700 dark:text-gray-300">
                  {children}
                </h3>
              ),
              p: ({ children }) => (
                <p className="my-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                  {children}
                </p>
              ),
              ul: ({ children }) => (
                <ul className="my-4 space-y-2 list-disc list-inside">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="my-4 space-y-2 list-decimal list-inside">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="text-gray-700 dark:text-gray-300 ml-4">
                  {children}
                </li>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-blue-500 dark:border-blue-400 pl-4 py-2 my-4 bg-blue-50 dark:bg-blue-900/20 rounded-r">
                  {children}
                </blockquote>
              ),
              code: ({ children, className }) => {
                const isBlock = className?.includes('language-');
                if (isBlock) {
                  return (
                    <pre className="bg-gray-900 dark:bg-gray-950 text-gray-100 p-4 rounded-lg overflow-x-auto my-4">
                      <code>{children}</code>
                    </pre>
                  );
                }
                return (
                  <code className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-1.5 py-0.5 rounded text-sm">
                    {children}
                  </code>
                );
              },
              table: ({ children }) => (
                <div className="overflow-x-auto my-4">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border border-gray-300 dark:border-gray-600">
                    {children}
                  </table>
                </div>
              ),
              thead: ({ children }) => (
                <thead className="bg-gray-100 dark:bg-gray-800">
                  {children}
                </thead>
              ),
              tbody: ({ children }) => (
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {children}
                </tbody>
              ),
              th: ({ children }) => (
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                  {children}
                </td>
              ),
            }}
          >
            {lesson.content}
          </ReactMarkdown>
        </div>
      </div>

      {/* 실습 데이터 (practice 타입인 경우) */}
      {lesson.type === 'practice' && lesson.practiceData && (
        <div className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 border border-green-200 dark:border-green-700 rounded-xl p-6">
          <h2 className="text-xl font-bold text-green-900 dark:text-green-300 mb-4 flex items-center gap-2">
            🎯 실습 과제
          </h2>

          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 dark:text-green-400 mb-2">
                시나리오
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                {lesson.practiceData.scenario}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 dark:text-green-400 mb-2">
                  📅 날짜
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {lesson.practiceData.date}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 dark:text-green-400 mb-2">
                  ⏰ 시간
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {lesson.practiceData.time}
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 dark:text-green-400 mb-2">
                💡 힌트
              </h3>
              <ul className="space-y-2">
                {lesson.practiceData.hints.map((hint, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-gray-700 dark:text-gray-300"
                  >
                    <span className="text-green-600 dark:text-green-500">
                      {idx + 1}.
                    </span>
                    <span>{hint}</span>
                  </li>
                ))}
              </ul>
            </div>

            {onStartPractice && (
              <button
                onClick={onStartPractice}
                className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-colors"
              >
                🎯 실습 시작하기
              </button>
            )}
          </div>
        </div>
      )}

      {/* 퀴즈 시작 버튼 (quiz가 있는 경우) */}
      {lesson.quiz && onStartQuiz && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-purple-900 dark:text-purple-300 mb-2">
                ❓ 퀴즈로 학습 점검
              </h2>
              <p className="text-sm text-purple-700 dark:text-purple-400">
                총 {lesson.quiz.questions.length}문제 • 합격 기준:{' '}
                {lesson.quiz.passingScore}점
              </p>
            </div>
            <button
              onClick={onStartQuiz}
              className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-lg transition-colors"
            >
              퀴즈 시작
            </button>
          </div>
        </div>
      )}

      {/* 완료 버튼 */}
      {!isCompleted && (
        <div className="flex justify-end">
          <button
            onClick={onComplete}
            className={`px-8 py-4 ${colors.button} text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105`}
          >
            ✅ 레슨 완료하기
          </button>
        </div>
      )}

      {isCompleted && (
        <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl">
          <p className="text-lg font-bold text-green-700 dark:text-green-300">
            🎉 이 레슨을 완료했습니다!
          </p>
          <p className="text-sm text-green-600 dark:text-green-400 mt-2">
            다음 레슨으로 이동하세요
          </p>
        </div>
      )}
    </div>
  );
}

export default React.memo(LessonViewer);
