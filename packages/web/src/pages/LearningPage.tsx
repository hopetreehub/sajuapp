import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  BookOpenIcon, 
  PlayIcon, 
  CheckCircleIcon, 
  ClockIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  QuestionMarkCircleIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';

interface LessonProgress {
  lessonId: string
  completed: boolean
  completedAt?: string
  timeSpent: number
  score?: number
}

interface CourseProgress {
  courseId: string
  enrollmentId: string
  progress: number
  completedLessons: number
  totalLessons: number
  currentLessonId?: string
  lessonProgress: LessonProgress[]
}

interface Lesson {
  id: string
  title: string
  type: 'video' | 'text' | 'quiz'
  duration: number
  content?: string
  videoUrl?: string
  quiz?: {
    questions: Array<{
      question: string
      options: string[]
      correctAnswer: number
    }>
  }
}

interface Course {
  id: string
  title: string
  description: string
  lessons: Lesson[]
  instructor: {
    name: string
    avatar?: string
  }
}

export default function LearningPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  useEffect(() => {
    if (courseId) {
      loadCourse();
      loadProgress();
    }
  }, [courseId]);

  const loadCourse = async () => {
    try {
      // 임시 데이터 (실제로는 API에서 가져와야 함)
      const mockCourse: Course = {
        id: courseId || '1',
        title: '사주 기초 입문 과정',
        description: '사주의 기본 개념부터 실전 해석까지',
        instructor: {
          name: '김사주 선생님',
        },
        lessons: [
          {
            id: '1',
            title: '사주란 무엇인가?',
            type: 'video',
            duration: 1200,
            videoUrl: '/videos/lesson1.mp4',
          },
          {
            id: '2',
            title: '천간과 지지의 이해',
            type: 'text',
            duration: 900,
            content: '천간과 지지는 사주의 기본 구성 요소입니다...',
          },
          {
            id: '3',
            title: '기초 이론 퀴즈',
            type: 'quiz',
            duration: 600,
            quiz: {
              questions: [
                {
                  question: '천간은 몇 개입니까?',
                  options: ['8개', '10개', '12개', '14개'],
                  correctAnswer: 1,
                },
                {
                  question: '지지는 몇 개입니까?',
                  options: ['10개', '12개', '14개', '16개'],
                  correctAnswer: 1,
                },
              ],
            },
          },
          {
            id: '4',
            title: '오행의 상생상극',
            type: 'video',
            duration: 1500,
            videoUrl: '/videos/lesson4.mp4',
          },
        ],
      };
      
      setCourse(mockCourse);
      setCurrentLesson(mockCourse.lessons[0]);
      setIsLoading(false);
    } catch (error) {
      console.error('강좌 로딩 실패:', error);
      setIsLoading(false);
    }
  };

  const loadProgress = async () => {
    try {
      // 임시 데이터 (실제로는 API에서 가져와야 함)
      const mockProgress: CourseProgress = {
        courseId: courseId || '1',
        enrollmentId: 'enrollment-1',
        progress: 25,
        completedLessons: 1,
        totalLessons: 4,
        currentLessonId: '2',
        lessonProgress: [
          { lessonId: '1', completed: true, completedAt: '2024-01-01', timeSpent: 1200 },
          { lessonId: '2', completed: false, timeSpent: 300 },
          { lessonId: '3', completed: false, timeSpent: 0 },
          { lessonId: '4', completed: false, timeSpent: 0 },
        ],
      };
      
      setProgress(mockProgress);
    } catch (error) {
      console.error('진도 로딩 실패:', error);
    }
  };

  const completeLesson = async (lessonId: string, score?: number) => {
    if (!progress) return;
    
    const updatedProgress = { ...progress };
    const lessonProgressIndex = updatedProgress.lessonProgress.findIndex(lp => lp.lessonId === lessonId);
    
    if (lessonProgressIndex >= 0) {
      updatedProgress.lessonProgress[lessonProgressIndex] = {
        ...updatedProgress.lessonProgress[lessonProgressIndex],
        completed: true,
        completedAt: new Date().toISOString(),
        score,
      };
      
      updatedProgress.completedLessons = updatedProgress.lessonProgress.filter(lp => lp.completed).length;
      updatedProgress.progress = Math.round((updatedProgress.completedLessons / updatedProgress.totalLessons) * 100);
      
      setProgress(updatedProgress);
      
      // API 호출로 진도 업데이트 (실제 구현 시)
      // await updateProgress(updatedProgress)
    }
  };

  const navigateToLesson = (lessonId: string) => {
    const lesson = course?.lessons.find(l => l.id === lessonId);
    if (lesson) {
      setCurrentLesson(lesson);
      setShowQuiz(false);
      setQuizAnswers([]);
      setQuizScore(null);
    }
  };

  const handleQuizSubmit = () => {
    if (!currentLesson?.quiz) return;
    
    let correctAnswers = 0;
    currentLesson.quiz.questions.forEach((question, index) => {
      if (quizAnswers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });
    
    const score = Math.round((correctAnswers / currentLesson.quiz.questions.length) * 100);
    setQuizScore(score);
    
    if (score >= 70) {
      completeLesson(currentLesson.id, score);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getLessonIcon = (type: string, completed: boolean) => {
    if (completed) return CheckCircleIconSolid;
    
    switch (type) {
      case 'video': return VideoCameraIcon;
      case 'text': return DocumentTextIcon;
      case 'quiz': return QuestionMarkCircleIcon;
      default: return BookOpenIcon;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">강좌를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookOpenIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            강좌를 찾을 수 없습니다
          </h2>
          <button 
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            대시보드로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 헤더 */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {course.title}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {course.instructor.name}
                </p>
              </div>
            </div>
            
            {/* 진도율 */}
            {progress && (
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {progress.completedLessons}/{progress.totalLessons} 완료
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {progress.progress}% 진행
                  </p>
                </div>
                <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress.progress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 레슨 목록 */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                강의 목록
              </h3>
              <div className="space-y-2">
                {course.lessons.map((lesson, index) => {
                  const lessonProgress = progress?.lessonProgress.find(lp => lp.lessonId === lesson.id);
                  const completed = lessonProgress?.completed || false;
                  const Icon = getLessonIcon(lesson.type, completed);
                  const isActive = currentLesson?.id === lesson.id;
                  
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => navigateToLesson(lesson.id)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        isActive 
                          ? 'bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700' 
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className={`h-5 w-5 ${
                          completed 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-gray-400 dark:text-gray-500'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${
                            isActive 
                              ? 'text-purple-700 dark:text-purple-300' 
                              : 'text-gray-900 dark:text-white'
                          }`}>
                            {index + 1}. {lesson.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDuration(lesson.duration)}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 메인 컨텐츠 */}
          <div className="lg:col-span-3">
            {currentLesson && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                {/* 레슨 헤더 */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {currentLesson.title}
                      </h2>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          {formatDuration(currentLesson.duration)}
                        </span>
                        <span className="capitalize">
                          {currentLesson.type === 'video' ? '동영상' : 
                           currentLesson.type === 'text' ? '텍스트' : '퀴즈'}
                        </span>
                      </div>
                    </div>
                    
                    {progress?.lessonProgress.find(lp => lp.lessonId === currentLesson.id)?.completed && (
                      <div className="flex items-center text-green-600 dark:text-green-400">
                        <CheckCircleIconSolid className="h-6 w-6 mr-2" />
                        <span className="font-medium">완료</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 레슨 컨텐츠 */}
                <div className="p-6">
                  {currentLesson.type === 'video' && (
                    <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center mb-6">
                      <div className="text-center text-white">
                        <PlayIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg">동영상 플레이어</p>
                        <p className="text-sm opacity-75">
                          실제 구현 시 video 태그로 교체됩니다
                        </p>
                      </div>
                    </div>
                  )}

                  {currentLesson.type === 'text' && currentLesson.content && (
                    <div className="prose dark:prose-invert max-w-none">
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {currentLesson.content}
                      </p>
                    </div>
                  )}

                  {currentLesson.type === 'quiz' && currentLesson.quiz && (
                    <div className="space-y-6">
                      {!showQuiz ? (
                        <div className="text-center py-8">
                          <QuestionMarkCircleIcon className="h-16 w-16 text-purple-600 dark:text-purple-400 mx-auto mb-4" />
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            퀴즈를 시작하시겠습니까?
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 mb-6">
                            {currentLesson.quiz.questions.length}개의 문제가 있습니다
                          </p>
                          <button
                            onClick={() => setShowQuiz(true)}
                            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                          >
                            퀴즈 시작
                          </button>
                        </div>
                      ) : (
                        <div>
                          {currentLesson.quiz.questions.map((question, index) => (
                            <div key={index} className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                                {index + 1}. {question.question}
                              </h4>
                              <div className="space-y-2">
                                {question.options.map((option, optionIndex) => (
                                  <label key={optionIndex} className="flex items-center">
                                    <input
                                      type="radio"
                                      name={`question-${index}`}
                                      value={optionIndex}
                                      onChange={() => {
                                        const newAnswers = [...quizAnswers];
                                        newAnswers[index] = optionIndex;
                                        setQuizAnswers(newAnswers);
                                      }}
                                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                                    />
                                    <span className="ml-3 text-gray-700 dark:text-gray-300">
                                      {option}
                                    </span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          ))}
                          
                          {quizScore === null ? (
                            <button
                              onClick={handleQuizSubmit}
                              disabled={quizAnswers.length !== currentLesson.quiz.questions.length}
                              className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              제출하기
                            </button>
                          ) : (
                            <div className="text-center py-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
                              <StarIcon className="h-12 w-12 text-yellow-500 mx-auto mb-2" />
                              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                퀴즈 완료!
                              </h3>
                              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                                {quizScore}점
                              </p>
                              <p className="text-gray-600 dark:text-gray-400">
                                {quizScore >= 70 ? '합격입니다! 🎉' : '70점 이상이 필요합니다. 다시 시도해보세요.'}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 완료 버튼 */}
                  {currentLesson.type !== 'quiz' && !progress?.lessonProgress.find(lp => lp.lessonId === currentLesson.id)?.completed && (
                    <div className="mt-6 text-center">
                      <button
                        onClick={() => completeLesson(currentLesson.id)}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <CheckCircleIcon className="h-5 w-5 inline mr-2" />
                        레슨 완료
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}