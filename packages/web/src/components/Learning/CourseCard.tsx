import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpenIcon,
  ClockIcon,
  UserIcon,
  StarIcon,
  PlayIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';

interface Course {
  id: string
  title: string
  description: string
  level: string
  category: string
  status: string
  instructor_id: string
  instructor_name: string
  price: number
  rating: number
  enrollment_count: number
  duration: number
  lessons_count: number
  created_at: string
  thumbnail?: string
}

interface EnrollmentProgress {
  courseId: string
  enrollmentId: string
  progress: number
  completedLessons: number
  totalLessons: number
  isEnrolled: boolean
  status: 'enrolled' | 'completed' | 'not_enrolled'
}

interface CourseCardProps {
  course: Course
  progress?: EnrollmentProgress
  showEnrollButton?: boolean
  onEnroll?: (courseId: string) => void
}

export default function CourseCard({ 
  course, 
  progress, 
  showEnrollButton = true,
  onEnroll, 
}: CourseCardProps) {
  const navigate = useNavigate();
  const [isEnrolling, setIsEnrolling] = useState(false);

  const levelLabels = {
    beginner: '초급',
    intermediate: '중급', 
    advanced: '고급',
    expert: '전문가',
  };

  const categoryLabels = {
    basic: '기초',
    fortune: '운세',
    compatibility: '궁합',
    professional: '전문가',
    special: '특강',
  };

  const formatPrice = (price: number) => {
    if (price === 0) return '무료';
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}시간 ${mins}분`;
    }
    return `${mins}분`;
  };

  const handleEnroll = async () => {
    if (!onEnroll) return;
    
    setIsEnrolling(true);
    try {
      await onEnroll(course.id);
    } catch (error) {
      console.error('수강신청 실패:', error);
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleContinue = () => {
    navigate(`/learning/${course.id}`);
  };

  const handleStart = () => {
    navigate(`/learning/${course.id}`);
  };

  const getActionButton = () => {
    if (!progress?.isEnrolled) {
      return (
        <button
          onClick={handleEnroll}
          disabled={isEnrolling || course.status !== 'published'}
          className="w-full px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isEnrolling ? '수강신청 중...' : 
           course.price === 0 ? '무료 수강하기' : `${formatPrice(course.price)} 결제`}
        </button>
      );
    }

    if (progress.status === 'completed') {
      return (
        <button
          onClick={handleStart}
          className="w-full px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
        >
          <CheckCircleIconSolid className="h-4 w-4 mr-1" />
          다시 보기
        </button>
      );
    }

    if (progress.progress > 0) {
      return (
        <button
          onClick={handleContinue}
          className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
        >
          <PlayIcon className="h-4 w-4 mr-1" />
          이어서 보기
        </button>
      );
    }

    return (
      <button
        onClick={handleStart}
        className="w-full px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
      >
        <PlayIcon className="h-4 w-4 mr-1" />
        시작하기
      </button>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden group hover:shadow-md transition-shadow">
      {/* 썸네일 */}
      <div className="relative h-48 bg-gradient-to-br from-purple-400 to-blue-500 overflow-hidden">
        {course.thumbnail ? (
          <img 
            src={course.thumbnail} 
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-white">
            <BookOpenIcon className="h-16 w-16 opacity-50" />
          </div>
        )}
        
        {/* 상태 배지 */}
        <div className="absolute top-3 left-3">
          {progress?.status === 'completed' && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
              <CheckCircleIconSolid className="h-3 w-3 mr-1" />
              완료
            </span>
          )}
          {progress?.isEnrolled && progress.status !== 'completed' && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
              <PlayIcon className="h-3 w-3 mr-1" />
              수강중
            </span>
          )}
          {course.status !== 'published' && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
              <LockClosedIcon className="h-3 w-3 mr-1" />
              준비중
            </span>
          )}
        </div>

        {/* 가격 배지 */}
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/90 text-gray-900">
            {formatPrice(course.price)}
          </span>
        </div>

        {/* 진도율 (수강 중인 경우) */}
        {progress?.isEnrolled && progress.status !== 'completed' && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/50">
            <div className="p-3">
              <div className="flex items-center justify-between text-white text-xs mb-1">
                <span>진도율</span>
                <span>{progress.progress}%</span>
              </div>
              <div className="bg-white/20 rounded-full h-1">
                <div 
                  className="bg-white h-1 rounded-full transition-all duration-300"
                  style={{ width: `${progress.progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 컨텐츠 */}
      <div className="p-5">
        {/* 카테고리 및 레벨 */}
        <div className="flex items-center space-x-2 mb-3">
          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
            {categoryLabels[course.category as keyof typeof categoryLabels]}
          </span>
          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
            {levelLabels[course.level as keyof typeof levelLabels]}
          </span>
        </div>

        {/* 제목 */}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {course.title}
        </h3>

        {/* 설명 */}
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
          {course.description}
        </p>

        {/* 강사 정보 */}
        <div className="flex items-center space-x-2 mb-4">
          <UserIcon className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {course.instructor_name}
          </span>
        </div>

        {/* 메타 정보 */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
          <div className="flex items-center space-x-3">
            <span className="flex items-center">
              <ClockIcon className="h-3 w-3 mr-1" />
              {formatDuration(course.duration)}
            </span>
            <span className="flex items-center">
              <BookOpenIcon className="h-3 w-3 mr-1" />
              {course.lessons_count}개 강의
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              <StarIcon className="h-3 w-3 mr-1 text-yellow-500" />
              <span>{course.rating.toFixed(1)}</span>
            </div>
            <span>({course.enrollment_count})</span>
          </div>
        </div>

        {/* 액션 버튼 */}
        {showEnrollButton && getActionButton()}

        {/* 진도 세부 정보 (수강 중인 경우) */}
        {progress?.isEnrolled && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {progress.completedLessons}/{progress.totalLessons} 강의 완료
              {progress.status === 'completed' && (
                <span className="ml-2 text-green-600 dark:text-green-400">
                  🎉 수료 완료
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}