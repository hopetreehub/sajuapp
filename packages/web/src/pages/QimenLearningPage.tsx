/**
 * 귀문둔갑 학습 페이지
 *
 * 전체 학습 시스템 통합 페이지 (코스, 레슨, 퀴즈, 용어사전)
 * @author Claude Code
 * @version 1.0.0
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  allCourses,
  getLessonById,
  calculateProgress,
  type Course,
  type Lesson,
  type CourseLevel,
  type UserProgress,
} from '@/data/qimenCourses';
import {
  allGlossaryTerms,
  searchTerms,
  getTermsByCategory,
  getRelatedTerms,
  categoryInfo,
  type GlossaryTerm,
  type GlossaryCategory,
} from '@/data/qimenGlossary';
import LessonViewer from '@/components/qimen/LessonViewer';
import Quiz, { QuizResult } from '@/components/qimen/Quiz';

type ViewMode = 'courses' | 'lesson' | 'quiz' | 'quiz-result' | 'glossary';

function QimenLearningPage() {
  // 뷰 모드 상태
  const [viewMode, setViewMode] = useState<ViewMode>('courses');

  // 코스/레슨 상태
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  // 퀴즈 상태
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [quizCorrectCount, setQuizCorrectCount] = useState<number>(0);

  // 사용자 진행률 (실제로는 백엔드에서 가져와야 함)
  const [userProgress, setUserProgress] = useState<UserProgress[]>([
    {
      userId: 'demo-user',
      courseId: 'beginner',
      completedLessons: [],
      quizScores: {},
    },
  ]);

  // 용어사전 상태
  const [glossarySearch, setGlossarySearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<GlossaryCategory | null>(null);
  const [selectedTerm, setSelectedTerm] = useState<GlossaryTerm | null>(null);

  // 현재 코스의 진행률
  const currentCourseProgress = useMemo(() => {
    if (!selectedCourse) return null;
    const progress = userProgress.find((p) => p.courseId === selectedCourse.id);
    if (!progress) return null;

    return {
      ...progress,
      progressPercentage: calculateProgress(
        selectedCourse.id,
        progress.completedLessons
      ),
    };
  }, [selectedCourse, userProgress]);

  // 코스 선택 핸들러
  const handleSelectCourse = useCallback((course: Course) => {
    setSelectedCourse(course);
    setViewMode('courses'); // 레슨 목록 표시
  }, []);

  // 레슨 선택 핸들러
  const handleSelectLesson = useCallback((lesson: Lesson) => {
    setSelectedLesson(lesson);
    setViewMode('lesson');
  }, []);

  // 레슨 완료 핸들러
  const handleCompleteLesson = useCallback(() => {
    if (!selectedLesson || !selectedCourse) return;

    setUserProgress((prev) => {
      const updatedProgress = prev.map((p) => {
        if (p.courseId === selectedCourse.id) {
          if (!p.completedLessons.includes(selectedLesson.id)) {
            return {
              ...p,
              completedLessons: [...p.completedLessons, selectedLesson.id],
            };
          }
        }
        return p;
      });

      // 코스가 없으면 추가
      if (!updatedProgress.some((p) => p.courseId === selectedCourse.id)) {
        updatedProgress.push({
          userId: 'demo-user',
          courseId: selectedCourse.id,
          completedLessons: [selectedLesson.id],
          quizScores: {},
        });
      }

      return updatedProgress;
    });
  }, [selectedLesson, selectedCourse]);

  // 퀴즈 시작 핸들러
  const handleStartQuiz = useCallback(() => {
    setViewMode('quiz');
    setQuizScore(null);
  }, []);

  // 퀴즈 완료 핸들러
  const handleCompleteQuiz = useCallback(
    (score: number) => {
      if (!selectedLesson || !selectedCourse) return;

      const totalQuestions = selectedLesson.quiz?.questions.length || 0;
      const correctCount = Math.round((score / 100) * totalQuestions);

      setQuizScore(score);
      setQuizCorrectCount(correctCount);
      setViewMode('quiz-result');

      // 진행률 업데이트
      setUserProgress((prev) =>
        prev.map((p) => {
          if (p.courseId === selectedCourse.id) {
            return {
              ...p,
              quizScores: {
                ...p.quizScores,
                [selectedLesson.id]: score,
              },
            };
          }
          return p;
        })
      );
    },
    [selectedLesson, selectedCourse]
  );

  // 퀴즈 재시도 핸들러
  const handleRetryQuiz = useCallback(() => {
    setViewMode('quiz');
    setQuizScore(null);
  }, []);

  // 용어사전 검색 결과
  const glossaryResults = useMemo(() => {
    if (glossarySearch.trim()) {
      return searchTerms(glossarySearch);
    }
    if (selectedCategory) {
      return getTermsByCategory(selectedCategory);
    }
    return allGlossaryTerms;
  }, [glossarySearch, selectedCategory]);

  // 레슨 완료 여부 확인
  const isLessonCompleted = useCallback(
    (lessonId: string) => {
      if (!selectedCourse) return false;
      const progress = userProgress.find((p) => p.courseId === selectedCourse.id);
      return progress?.completedLessons.includes(lessonId) || false;
    },
    [selectedCourse, userProgress]
  );

  // 레슨 퀴즈 점수 가져오기
  const getLessonQuizScore = useCallback(
    (lessonId: string) => {
      if (!selectedCourse) return undefined;
      const progress = userProgress.find((p) => p.courseId === selectedCourse.id);
      return progress?.quizScores[lessonId];
    },
    [selectedCourse, userProgress]
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
      {/* 헤더 */}
      <header className="bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-4xl">🎓</span>
              <div>
                <h1 className="text-3xl font-bold">귀문둔갑 학습센터</h1>
                <p className="text-purple-100 text-sm">
                  체계적으로 배우는 귀문둔갑의 모든 것
                </p>
              </div>
            </div>

            {/* 네비게이션 탭 */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setViewMode('courses');
                  setSelectedCourse(null);
                  setSelectedLesson(null);
                }}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  viewMode === 'courses' || viewMode === 'lesson' || viewMode === 'quiz' || viewMode === 'quiz-result'
                    ? 'bg-white text-purple-600 font-bold'
                    : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                📚 학습 코스
              </button>
              <button
                onClick={() => setViewMode('glossary')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  viewMode === 'glossary'
                    ? 'bg-white text-purple-600 font-bold'
                    : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                📖 용어사전
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* 코스 목록 뷰 */}
        {viewMode === 'courses' && !selectedCourse && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              학습 코스 선택
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              {allCourses.map((course) => {
                const progress = userProgress.find((p) => p.courseId === course.id);
                const progressPercentage = progress
                  ? calculateProgress(course.id, progress.completedLessons)
                  : 0;

                const levelColors: Record<CourseLevel, string> = {
                  beginner: 'from-green-500 to-emerald-500',
                  intermediate: 'from-blue-500 to-cyan-500',
                  advanced: 'from-purple-500 to-pink-500',
                };

                const levelNames: Record<CourseLevel, string> = {
                  beginner: '초급',
                  intermediate: '중급',
                  advanced: '고급',
                };

                return (
                  <button
                    key={course.id}
                    onClick={() => handleSelectCourse(course)}
                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-left hover:shadow-xl transition-all transform hover:scale-105"
                  >
                    <div
                      className={`w-16 h-16 rounded-full bg-gradient-to-r ${levelColors[course.level]} flex items-center justify-center text-4xl mb-4 shadow-lg`}
                    >
                      {course.icon}
                    </div>

                    <div className="mb-2">
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-medium text-gray-700 dark:text-gray-300">
                        {levelNames[course.level]}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {course.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {course.description}
                    </p>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                        <span>📖 {course.lessons.length}개 레슨</span>
                        <span>⏱️ {course.estimatedHours}시간</span>
                      </div>

                      {/* 진행률 바 */}
                      <div>
                        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                          <span>진행률</span>
                          <span>{progressPercentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={`bg-gradient-to-r ${levelColors[course.level]} h-full rounded-full transition-all`}
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 레슨 목록 뷰 */}
        {viewMode === 'courses' && selectedCourse && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSelectedCourse(null)}
                className="text-purple-600 dark:text-purple-400 hover:underline"
              >
                ← 코스 목록으로
              </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-start gap-4 mb-6">
                <span className="text-5xl">{selectedCourse.icon}</span>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {selectedCourse.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {selectedCourse.description}
                  </p>

                  {currentCourseProgress && (
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                          <span>전체 진행률</span>
                          <span>{currentCourseProgress.progressPercentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all"
                            style={{
                              width: `${currentCourseProgress.progressPercentage}%`,
                            }}
                          />
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {currentCourseProgress.completedLessons.length} /{' '}
                        {selectedCourse.lessons.length} 레슨 완료
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 레슨 목록 */}
              <div className="space-y-3">
                {selectedCourse.lessons.map((lesson, idx) => {
                  const isCompleted = isLessonCompleted(lesson.id);
                  const score = getLessonQuizScore(lesson.id);

                  const typeIcons: Record<string, string> = {
                    theory: '📖',
                    practice: '🎯',
                    quiz: '❓',
                    'case-study': '📋',
                  };

                  return (
                    <button
                      key={lesson.id}
                      onClick={() => handleSelectLesson(lesson)}
                      className="w-full bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg p-4 text-left transition-all border-2 border-transparent hover:border-purple-300 dark:hover:border-purple-600"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center font-bold text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-600">
                          {idx + 1}
                        </div>

                        <span className="text-2xl">{typeIcons[lesson.type]}</span>

                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 dark:text-white">
                            {lesson.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {lesson.description}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            ⏱️ {lesson.duration}분
                          </span>
                          {isCompleted && (
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 rounded text-xs font-bold">
                              ✅ 완료
                            </span>
                          )}
                          {score !== undefined && (
                            <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded text-xs font-bold">
                              {score}점
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 레슨 뷰 */}
        {viewMode === 'lesson' && selectedLesson && selectedCourse && (
          <div>
            <div className="mb-4">
              <button
                onClick={() => {
                  setViewMode('courses');
                  setSelectedLesson(null);
                }}
                className="text-purple-600 dark:text-purple-400 hover:underline"
              >
                ← {selectedCourse.title}로 돌아가기
              </button>
            </div>

            <LessonViewer
              lesson={selectedLesson}
              isCompleted={isLessonCompleted(selectedLesson.id)}
              quizScore={getLessonQuizScore(selectedLesson.id)}
              onComplete={handleCompleteLesson}
              onStartQuiz={selectedLesson.quiz ? handleStartQuiz : undefined}
            />
          </div>
        )}

        {/* 퀴즈 뷰 */}
        {viewMode === 'quiz' && selectedLesson?.quiz && (
          <Quiz
            quiz={selectedLesson.quiz}
            onComplete={handleCompleteQuiz}
            onExit={() => setViewMode('lesson')}
          />
        )}

        {/* 퀴즈 결과 뷰 */}
        {viewMode === 'quiz-result' && selectedLesson?.quiz && quizScore !== null && (
          <QuizResult
            score={quizScore}
            passingScore={selectedLesson.quiz.passingScore}
            totalQuestions={selectedLesson.quiz.questions.length}
            correctCount={quizCorrectCount}
            onRetry={handleRetryQuiz}
            onExit={() => setViewMode('lesson')}
          />
        )}

        {/* 용어사전 뷰 */}
        {viewMode === 'glossary' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                📖 귀문둔갑 용어사전
              </h2>

              {/* 검색 바 */}
              <input
                type="text"
                value={glossarySearch}
                onChange={(e) => {
                  setGlossarySearch(e.target.value);
                  setSelectedCategory(null);
                }}
                placeholder="용어 검색... (예: 생문, 천영성, 직부)"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />

              {/* 카테고리 필터 */}
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setGlossarySearch('');
                  }}
                  className={`px-3 py-1 rounded-full text-sm ${
                    !selectedCategory && !glossarySearch
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  전체
                </button>
                {Object.entries(categoryInfo).map(([key, info]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setSelectedCategory(key as GlossaryCategory);
                      setGlossarySearch('');
                    }}
                    className={`px-3 py-1 rounded-full text-sm ${
                      selectedCategory === key
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {info.icon} {info.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 검색 결과 */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {glossaryResults.map((term) => (
                <button
                  key={term.id}
                  onClick={() => setSelectedTerm(term)}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 text-left hover:shadow-lg transition-all hover:border-purple-300 dark:hover:border-purple-600"
                >
                  <div className="flex items-start gap-3">
                    {term.icon && <span className="text-2xl">{term.icon}</span>}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900 dark:text-white">
                          {term.term}
                        </h3>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {term.hanja}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {term.shortDescription}
                      </p>
                      <span className="mt-2 inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-400">
                        {categoryInfo[term.category].icon}{' '}
                        {categoryInfo[term.category].name}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {glossaryResults.length === 0 && (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                검색 결과가 없습니다.
              </div>
            )}
          </div>
        )}

        {/* 용어 상세 모달 */}
        {selectedTerm && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedTerm(null)}
          >
            <div
              className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {selectedTerm.icon && (
                    <span className="text-4xl">{selectedTerm.icon}</span>
                  )}
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedTerm.term}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedTerm.hanja}
                      {selectedTerm.pronunciation &&
                        ` (${selectedTerm.pronunciation})`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTerm(null)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                    한 줄 설명
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    {selectedTerm.shortDescription}
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                    상세 설명
                  </h3>
                  <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-line">
                    {selectedTerm.detailedDescription}
                  </div>
                </div>

                {selectedTerm.examples && selectedTerm.examples.length > 0 && (
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                      사용 예시
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                      {selectedTerm.examples.map((example, idx) => (
                        <li key={idx}>{example}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedTerm.relatedTerms &&
                  selectedTerm.relatedTerms.length > 0 && (
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                        관련 용어
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {getRelatedTerms(selectedTerm.id).map((relatedTerm) => (
                          <button
                            key={relatedTerm.id}
                            onClick={() => setSelectedTerm(relatedTerm)}
                            className="px-3 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-full text-sm hover:bg-purple-200 dark:hover:bg-purple-900/60"
                          >
                            {relatedTerm.term}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default QimenLearningPage;
