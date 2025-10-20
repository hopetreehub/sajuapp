/**
 * 귀문둔갑 학습 퀴즈 컴포넌트
 *
 * 인터랙티브 퀴즈 시스템으로 학습 내용 확인
 * @author Claude Code
 * @version 1.0.0
 */

import React, { useState, useMemo, useCallback } from 'react';
import type { Quiz as QuizData, QuizQuestion } from '@/data/qimenCourses';

interface QuizProps {
  quiz: QuizData;
  onComplete: (score: number) => void;
  onExit: () => void;
}

type AnswerState = 'unanswered' | 'correct' | 'incorrect';

interface QuestionResult {
  questionId: string;
  selectedAnswer: number;
  isCorrect: boolean;
}

function Quiz({ quiz, onComplete, onExit }: QuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answerState, setAnswerState] = useState<AnswerState>('unanswered');
  const [results, setResults] = useState<QuestionResult[]>([]);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  const totalQuestions = quiz.questions.length;

  // 진행률 계산
  const progress = useMemo(
    () => Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100),
    [currentQuestionIndex, totalQuestions]
  );

  // 답변 제출
  const handleSubmitAnswer = useCallback(() => {
    if (selectedAnswer === null) return;

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    setAnswerState(isCorrect ? 'correct' : 'incorrect');
    setShowExplanation(true);

    // 결과 저장
    setResults((prev) => [
      ...prev,
      {
        questionId: currentQuestion.id,
        selectedAnswer,
        isCorrect,
      },
    ]);
  }, [selectedAnswer, currentQuestion]);

  // 다음 문제로
  const handleNextQuestion = useCallback(() => {
    if (isLastQuestion) {
      // 퀴즈 완료
      const correctCount = results.filter((r) => r.isCorrect).length + (answerState === 'correct' ? 1 : 0);
      const score = Math.round((correctCount / totalQuestions) * 100);
      onComplete(score);
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setAnswerState('unanswered');
    }
  }, [isLastQuestion, results, answerState, totalQuestions, onComplete]);

  // 답변 선택
  const handleSelectAnswer = useCallback((index: number) => {
    if (answerState !== 'unanswered') return; // 이미 제출한 경우 변경 불가
    setSelectedAnswer(index);
  }, [answerState]);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* 퀴즈 헤더 */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">❓ 퀴즈</h1>
          <button
            onClick={onExit}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          >
            나가기
          </button>
        </div>

        {/* 진행률 바 */}
        <div className="mb-2 flex items-center justify-between text-sm">
          <span>
            문제 {currentQuestionIndex + 1} / {totalQuestions}
          </span>
          <span>{progress}% 완료</span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
          <div
            className="bg-white h-full rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 질문 카드 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 shadow-lg">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          {currentQuestion.question}
        </h2>

        {/* 답안 선택지 */}
        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrectAnswer = index === currentQuestion.correctAnswer;
            const showResult = answerState !== 'unanswered';

            let bgColor = 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600';
            let borderColor = 'border-gray-200 dark:border-gray-600';
            let textColor = 'text-gray-900 dark:text-white';

            if (showResult) {
              if (isCorrectAnswer) {
                bgColor = 'bg-green-50 dark:bg-green-900/20';
                borderColor = 'border-green-500 dark:border-green-600';
                textColor = 'text-green-900 dark:text-green-300';
              } else if (isSelected && !isCorrectAnswer) {
                bgColor = 'bg-red-50 dark:bg-red-900/20';
                borderColor = 'border-red-500 dark:border-red-600';
                textColor = 'text-red-900 dark:text-red-300';
              }
            } else if (isSelected) {
              bgColor = 'bg-purple-50 dark:bg-purple-900/20';
              borderColor = 'border-purple-500 dark:border-purple-600';
              textColor = 'text-purple-900 dark:text-purple-300';
            }

            return (
              <button
                key={index}
                onClick={() => handleSelectAnswer(index)}
                disabled={answerState !== 'unanswered'}
                className={`w-full p-4 rounded-lg border-2 ${bgColor} ${borderColor} ${textColor} text-left transition-all transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:transform-none`}
              >
                <div className="flex items-center gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-white dark:bg-gray-600 flex items-center justify-center font-bold">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="flex-1 font-medium">{option}</span>
                  {showResult && isCorrectAnswer && (
                    <span className="text-2xl">✅</span>
                  )}
                  {showResult && isSelected && !isCorrectAnswer && (
                    <span className="text-2xl">❌</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* 설명 (답변 제출 후) */}
        {showExplanation && (
          <div
            className={`mt-6 p-4 rounded-lg border-2 ${
              answerState === 'correct'
                ? 'bg-green-50 dark:bg-green-900/20 border-green-500 dark:border-green-600'
                : 'bg-red-50 dark:bg-red-900/20 border-red-500 dark:border-red-600'
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-3xl">
                {answerState === 'correct' ? '🎉' : '📚'}
              </span>
              <div className="flex-1">
                <h3
                  className={`font-bold text-lg mb-2 ${
                    answerState === 'correct'
                      ? 'text-green-900 dark:text-green-300'
                      : 'text-red-900 dark:text-red-300'
                  }`}
                >
                  {answerState === 'correct' ? '정답입니다!' : '아쉽네요...'}
                </h3>
                <p
                  className={`${
                    answerState === 'correct'
                      ? 'text-green-800 dark:text-green-400'
                      : 'text-red-800 dark:text-red-400'
                  }`}
                >
                  {currentQuestion.explanation}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="mt-6 flex justify-end gap-3">
          {!showExplanation ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={selectedAnswer === null}
              className="px-8 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors"
            >
              답변 제출
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="px-8 py-3 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-lg transition-colors"
            >
              {isLastQuestion ? '결과 보기' : '다음 문제'}
            </button>
          )}
        </div>
      </div>

      {/* 힌트 카드 (선택사항) */}
      {answerState === 'unanswered' && (
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-4">
          <p className="text-sm text-blue-800 dark:text-blue-300 flex items-start gap-2">
            <span className="text-lg">💡</span>
            <span>
              답을 선택한 후 "답변 제출" 버튼을 클릭하세요. 제출 후에는 정답과
              해설을 확인할 수 있습니다.
            </span>
          </p>
        </div>
      )}

      {/* 점수 정보 */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-700 dark:text-gray-300">
            합격 기준: {quiz.passingScore}점
          </span>
          <span className="text-gray-700 dark:text-gray-300">
            현재 진행: {results.length} / {totalQuestions} 문제 완료
          </span>
        </div>
      </div>
    </div>
  );
}

// 퀴즈 결과 화면
interface QuizResultProps {
  score: number;
  passingScore: number;
  totalQuestions: number;
  correctCount: number;
  onRetry: () => void;
  onExit: () => void;
}

export function QuizResult({
  score,
  passingScore,
  totalQuestions,
  correctCount,
  onRetry,
  onExit,
}: QuizResultProps) {
  const passed = score >= passingScore;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* 결과 헤더 */}
      <div
        className={`rounded-xl p-8 text-white text-center shadow-xl ${
          passed
            ? 'bg-gradient-to-r from-green-500 to-emerald-500'
            : 'bg-gradient-to-r from-orange-500 to-red-500'
        }`}
      >
        <div className="text-6xl mb-4">{passed ? '🎉' : '📚'}</div>
        <h1 className="text-3xl font-bold mb-2">
          {passed ? '축하합니다!' : '조금 더 공부가 필요해요'}
        </h1>
        <p className="text-lg opacity-90">
          {passed
            ? '퀴즈를 통과했습니다!'
            : '다시 한 번 도전해보세요'}
        </p>
      </div>

      {/* 점수 카드 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
        <div className="text-center mb-6">
          <div className="text-6xl font-bold text-gray-900 dark:text-white mb-2">
            {score}점
          </div>
          <div className="text-gray-600 dark:text-gray-400">
            {correctCount} / {totalQuestions} 문제 정답
          </div>
        </div>

        {/* 진행률 바 */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden mb-2">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              passed
                ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                : 'bg-gradient-to-r from-orange-500 to-red-500'
            }`}
            style={{ width: `${score}%` }}
          />
        </div>
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>0점</span>
          <span className="font-bold">합격선: {passingScore}점</span>
          <span>100점</span>
        </div>
      </div>

      {/* 피드백 */}
      <div
        className={`rounded-xl p-6 border-2 ${
          passed
            ? 'bg-green-50 dark:bg-green-900/20 border-green-500 dark:border-green-600'
            : 'bg-orange-50 dark:bg-orange-900/20 border-orange-500 dark:border-orange-600'
        }`}
      >
        <h3
          className={`font-bold text-lg mb-2 ${
            passed
              ? 'text-green-900 dark:text-green-300'
              : 'text-orange-900 dark:text-orange-300'
          }`}
        >
          {passed ? '✨ 완벽해요!' : '💪 다시 도전하세요!'}
        </h3>
        <p
          className={`${
            passed
              ? 'text-green-800 dark:text-green-400'
              : 'text-orange-800 dark:text-orange-400'
          }`}
        >
          {passed
            ? '이 레슨의 핵심 개념을 잘 이해하셨습니다. 다음 레슨으로 넘어가세요!'
            : '레슨 내용을 다시 복습하고 퀴즈에 재도전해보세요. 충분히 합격할 수 있어요!'}
        </p>
      </div>

      {/* 액션 버튼 */}
      <div className="flex gap-4">
        {!passed && (
          <button
            onClick={onRetry}
            className="flex-1 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors"
          >
            🔄 다시 시도
          </button>
        )}
        <button
          onClick={onExit}
          className={`${passed ? 'flex-1' : 'flex-1'} py-4 ${
            passed
              ? 'bg-green-500 hover:bg-green-600'
              : 'bg-gray-500 hover:bg-gray-600'
          } text-white font-bold rounded-xl transition-colors`}
        >
          {passed ? '다음 레슨으로 →' : '레슨으로 돌아가기'}
        </button>
      </div>
    </div>
  );
}

export default React.memo(Quiz);
