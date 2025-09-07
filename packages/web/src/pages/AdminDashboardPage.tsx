import { useState, useEffect } from 'react'
import { 
  ChartBarIcon,
  AcademicCapIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  StarIcon,
  ArrowTrendingUpIcon,
  BookOpenIcon,
  CheckCircleIcon,
  ClockIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import AcademyStatsCards from '@/components/Admin/AcademyStatsCards'
import CourseManagement from '@/components/Admin/CourseManagement'
import EnrollmentStats from '@/components/Admin/EnrollmentStats'
import RevenueChart from '@/components/Admin/RevenueChart'

interface AcademyStats {
  totalCourses: number
  totalStudents: number
  totalEnrollments: number
  activeEnrollments: number
  completedEnrollments: number
  totalRevenue: number
  averageRating: number
  completionRate: string
}

interface Course {
  id: string
  title: string
  level: string
  category: string
  status: string
  instructor_id: string
  price: number
  rating: number
  enrollment_count: number
  created_at: string
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AcademyStats | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'enrollments' | 'analytics'>('overview')

  // 아카데미 통계 데이터 로드
  const loadAcademyStats = async () => {
    try {
      const response = await fetch('/api/academy/stats/overview')
      if (!response.ok) {
        throw new Error('Failed to fetch academy stats')
      }
      const result = await response.json()
      
      if (result.success) {
        setStats(result.data)
      } else {
        throw new Error(result.error || 'Failed to load stats')
      }
    } catch (err) {
      console.error('Failed to load academy stats:', err)
      setError('통계 데이터를 불러오는데 실패했습니다.')
    }
  }

  // 강좌 목록 로드
  const loadCourses = async () => {
    try {
      const response = await fetch('/api/academy/courses?limit=10&sort_by=created_at&sort_order=desc')
      if (!response.ok) {
        throw new Error('Failed to fetch courses')
      }
      const result = await response.json()
      
      if (result.success) {
        setCourses(result.data.courses)
      } else {
        throw new Error(result.error || 'Failed to load courses')
      }
    } catch (err) {
      console.error('Failed to load courses:', err)
      setError('강좌 데이터를 불러오는데 실패했습니다.')
    }
  }

  // 초기 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setError(null)
      
      try {
        await Promise.all([
          loadAcademyStats(),
          loadCourses()
        ])
      } catch (err) {
        console.error('Failed to load dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const refreshData = async () => {
    await Promise.all([
      loadAcademyStats(),
      loadCourses()
    ])
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 로딩 헤더 */}
          <div className="animate-pulse mb-8">
            <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded w-64 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-48"></div>
          </div>
          
          {/* 로딩 통계 카드들 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
              </div>
            ))}
          </div>
          
          {/* 로딩 차트 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm animate-pulse">
              <div className="h-64 bg-gray-200 dark:bg-gray-600 rounded"></div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm animate-pulse">
              <div className="h-64 bg-gray-200 dark:bg-gray-600 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            데이터를 불러올 수 없습니다
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            새로고침
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <AcademicCapIcon className="h-8 w-8 text-blue-600" />
              아카데미 관리 대시보드
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              운명나침반 교육 플랫폼 관리 및 현황
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={refreshData}
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              새로고침
            </button>
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <PlusIcon className="h-4 w-4" />
              새 강좌
            </button>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-8">
          {[
            { key: 'overview', label: '개요', icon: ChartBarIcon },
            { key: 'courses', label: '강좌 관리', icon: BookOpenIcon },
            { key: 'enrollments', label: '수강 현황', icon: UserGroupIcon },
            { key: 'analytics', label: '분석', icon: ArrowTrendingUpIcon }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as typeof activeTab)}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${
                activeTab === key
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* 탭 컨텐츠 */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* 통계 카드들 */}
            {stats && <AcademyStatsCards stats={stats} />}
            
            {/* 차트 섹션 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {stats && <EnrollmentStats stats={stats} />}
              {stats && <RevenueChart totalRevenue={stats.totalRevenue} />}
            </div>
          </div>
        )}

        {activeTab === 'courses' && (
          <CourseManagement 
            courses={courses} 
            onRefresh={refreshData}
          />
        )}

        {activeTab === 'enrollments' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              수강 현황 관리
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              수강생 관리 기능이 곧 추가됩니다.
            </p>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              상세 분석
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              상세 분석 대시보드가 곧 추가됩니다.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}