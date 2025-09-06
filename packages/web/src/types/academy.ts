/**
 * 운명나침반 아카데미 시스템 타입 정의
 * 사주학 교육 플랫폼을 위한 포괄적 타입 시스템
 */

// 기본 엔티티 타입들
export type CourseLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert'
export type CourseCategory = 'basic' | 'fortune' | 'compatibility' | 'professional' | 'special'
export type CourseStatus = 'draft' | 'published' | 'archived' | 'coming_soon'
export type LessonType = 'video' | 'text' | 'practice' | 'live' | 'quiz' | 'assignment'
export type EnrollmentStatus = 'active' | 'completed' | 'paused' | 'cancelled' | 'expired'

// 강사 정보
export interface Instructor {
  id: string
  name: string
  email: string
  avatar?: string
  bio: string
  expertise: string[]
  rating: number
  totalStudents: number
  totalCourses: number
  isVerified: boolean
  socialLinks?: {
    website?: string
    youtube?: string
    instagram?: string
  }
  createdAt: string
  updatedAt: string
}

// 리소스 (첨부파일 등)
export interface Resource {
  id: string
  name: string
  type: 'pdf' | 'image' | 'video' | 'audio' | 'document'
  url: string
  size: number
  downloadable: boolean
  createdAt: string
}

// 퀴즈 관련
export interface QuizQuestion {
  id: string
  question: string
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay'
  options?: string[]
  correctAnswer?: string | string[]
  explanation?: string
  points: number
}

export interface Quiz {
  id: string
  title: string
  description?: string
  questions: QuizQuestion[]
  timeLimit?: number // 분 단위
  passingScore: number // 백분율
  maxAttempts: number
  randomizeQuestions: boolean
}

// 강의 (레슨)
export interface Lesson {
  id: string
  moduleId: string
  title: string
  description?: string
  type: LessonType
  order: number
  duration: number // 분 단위
  content?: string
  videoUrl?: string
  resources: Resource[]
  quiz?: Quiz
  isPreview: boolean // 미리보기 가능 여부
  isCompleted?: boolean // 수강생용
  watchTime?: number // 수강생 시청 시간
  lastWatchedAt?: string
  createdAt: string
  updatedAt: string
}

// 모듈 (챕터)
export interface Module {
  id: string
  courseId: string
  title: string
  description?: string
  order: number
  lessons: Lesson[]
  totalDuration: number
  completedLessons?: number // 수강생용
  isCompleted?: boolean
  createdAt: string
  updatedAt: string
}

// 강좌
export interface Course {
  id: string
  title: string
  subtitle?: string
  description: string
  thumbnail?: string
  trailer?: string
  level: CourseLevel
  category: CourseCategory
  status: CourseStatus
  instructor: Instructor
  modules: Module[]
  
  // 가격 정보
  price: number
  originalPrice?: number
  discountPercentage?: number
  isFree: boolean
  isSubscriptionOnly: boolean
  
  // 통계 정보
  rating: number
  reviewCount: number
  enrollmentCount: number
  totalDuration: number // 분 단위
  totalLessons: number
  
  // 메타데이터
  tags: string[]
  prerequisites: string[]
  learningObjectives: string[]
  targetAudience: string[]
  
  // 날짜
  publishedAt?: string
  createdAt: string
  updatedAt: string
  
  // 수강생용 추가 필드
  isEnrolled?: boolean
  progress?: number // 완료율 (0-100)
  lastAccessedAt?: string
  completedAt?: string
  certificate?: Certificate
}

// 수강 등록
export interface Enrollment {
  id: string
  userId: string
  courseId: string
  course: Course
  status: EnrollmentStatus
  progress: number // 0-100
  currentModuleId?: string
  currentLessonId?: string
  
  // 시간 추적
  totalWatchTime: number // 분 단위
  lastAccessedAt?: string
  enrolledAt: string
  completedAt?: string
  expiresAt?: string
  
  // 점수 및 평가
  quizScores: { [quizId: string]: number }
  overallScore?: number
  certificate?: Certificate
  
  // 결제 정보 (선택적)
  paymentId?: string
  amountPaid: number
}

// 수료증
export interface Certificate {
  id: string
  userId: string
  courseId: string
  enrollmentId: string
  studentName: string
  courseName: string
  instructorName: string
  completedAt: string
  score?: number
  certificateNumber: string
  verificationUrl: string
  isValid: boolean
  templateId: string
}

// 진도 추적
export interface Progress {
  id: string
  userId: string
  courseId: string
  moduleId?: string
  lessonId?: string
  type: 'lesson_completed' | 'quiz_completed' | 'module_completed' | 'course_completed'
  completedAt: string
  score?: number
  timeSpent: number // 분 단위
}

// 리뷰 & 평가
export interface Review {
  id: string
  userId: string
  courseId: string
  rating: number // 1-5
  title?: string
  comment?: string
  isVerified: boolean // 수료 후 작성 여부
  helpfulCount: number
  createdAt: string
  updatedAt: string
  user: {
    name: string
    avatar?: string
  }
}

// 질문 & 답변 (Q&A)
export interface Question {
  id: string
  userId: string
  courseId: string
  lessonId?: string
  title: string
  content: string
  isAnswered: boolean
  isPinned: boolean
  upvotes: number
  createdAt: string
  updatedAt: string
  user: {
    name: string
    avatar?: string
  }
  answers: Answer[]
}

export interface Answer {
  id: string
  questionId: string
  userId: string
  content: string
  isInstructorAnswer: boolean
  isAccepted: boolean
  upvotes: number
  createdAt: string
  updatedAt: string
  user: {
    name: string
    avatar?: string
    isInstructor?: boolean
  }
}

// 아카데미 통계
export interface AcademyStats {
  totalCourses: number
  totalStudents: number
  totalInstructors: number
  totalRevenue: number
  
  // 최근 30일 통계
  recentEnrollments: number
  recentCompletions: number
  recentRevenue: number
  
  // 인기 강좌
  popularCourses: Array<{
    course: Course
    enrollmentCount: number
    rating: number
  }>
  
  // 카테고리별 통계
  categoryStats: Array<{
    category: CourseCategory
    courseCount: number
    enrollmentCount: number
    revenue: number
  }>
}

// 관리자 대시보드용 필터
export interface CourseFilters {
  status?: CourseStatus[]
  category?: CourseCategory[]
  level?: CourseLevel[]
  instructorId?: string
  searchQuery?: string
  priceRange?: {
    min: number
    max: number
  }
  rating?: {
    min: number
    max: number
  }
  sortBy?: 'title' | 'created_at' | 'updated_at' | 'rating' | 'enrollment_count' | 'revenue'
  sortOrder?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

// 학습자 대시보드용 필터
export interface EnrollmentFilters {
  status?: EnrollmentStatus[]
  category?: CourseCategory[]
  level?: CourseLevel[]
  progress?: {
    min: number
    max: number
  }
  sortBy?: 'enrolled_at' | 'last_accessed_at' | 'progress' | 'course_title'
  sortOrder?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

// API 응답 타입
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// 실시간 알림
export interface Notification {
  id: string
  userId: string
  type: 'enrollment' | 'completion' | 'certificate' | 'new_content' | 'announcement'
  title: string
  message: string
  data?: any
  isRead: boolean
  createdAt: string
}