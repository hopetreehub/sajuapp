import { useState } from 'react'
import { 
  BookOpenIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  StarIcon,
  UserGroupIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'

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

interface CourseManagementProps {
  courses: Course[]
  onRefresh: () => void
}

export default function CourseManagement({ courses, onRefresh }: CourseManagementProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterLevel, setFilterLevel] = useState('all')

  const levelLabels = {
    beginner: '초급',
    intermediate: '중급', 
    advanced: '고급',
    expert: '전문가'
  }

  const categoryLabels = {
    basic: '기초',
    fortune: '운세',
    compatibility: '궁합',
    professional: '전문가',
    special: '특강'
  }

  const statusLabels = {
    draft: '초안',
    published: '공개',
    archived: '보관됨',
    coming_soon: '출시 예정'
  }

  const statusColors = {
    draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    published: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    archived: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    coming_soon: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
  }

  // 필터링된 강좌 목록
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || course.status === filterStatus
    const matchesCategory = filterCategory === 'all' || course.category === filterCategory
    const matchesLevel = filterLevel === 'all' || course.level === filterLevel

    return matchesSearch && matchesStatus && matchesCategory && matchesLevel
  })

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            강좌 관리
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            총 {filteredCourses.length}개의 강좌
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <PlusIcon className="h-4 w-4" />
          새 강좌 추가
        </button>
      </div>

      {/* 검색 및 필터 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* 검색 */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="강좌명 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* 상태 필터 */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">모든 상태</option>
            <option value="draft">초안</option>
            <option value="published">공개</option>
            <option value="archived">보관됨</option>
            <option value="coming_soon">출시 예정</option>
          </select>

          {/* 카테고리 필터 */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">모든 카테고리</option>
            <option value="basic">기초</option>
            <option value="fortune">운세</option>
            <option value="compatibility">궁합</option>
            <option value="professional">전문가</option>
            <option value="special">특강</option>
          </select>

          {/* 레벨 필터 */}
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">모든 레벨</option>
            <option value="beginner">초급</option>
            <option value="intermediate">중급</option>
            <option value="advanced">고급</option>
            <option value="expert">전문가</option>
          </select>
        </div>
      </div>

      {/* 강좌 목록 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        {filteredCourses.length === 0 ? (
          <div className="p-12 text-center">
            <BookOpenIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              강좌가 없습니다
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              새로운 강좌를 추가하거나 검색 조건을 변경해보세요
            </p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              새 강좌 추가
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    강좌 정보
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    가격
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    통계
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    생성일
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                {filteredCourses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                            <BookOpenIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {course.title}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                              {categoryLabels[course.category as keyof typeof categoryLabels]}
                            </span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                              {levelLabels[course.level as keyof typeof levelLabels]}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[course.status as keyof typeof statusColors]}`}>
                        {statusLabels[course.status as keyof typeof statusLabels]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {course.price === 0 ? '무료' : formatPrice(course.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <UserGroupIcon className="h-4 w-4 mr-1" />
                          {course.enrollment_count}
                        </div>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <StarIcon className="h-4 w-4 mr-1" />
                          {course.rating.toFixed(1)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(course.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button className="text-gray-400 hover:text-red-600 dark:hover:text-red-400">
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}