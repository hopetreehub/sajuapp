import { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useCalendar } from '@/contexts/CalendarContext'
// 임시 아이콘 컴포넌트들
const CalendarIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

const BookOpenIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
)

const Cog6ToothIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const ChevronLeftIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
)

const ChevronRightIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
)
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

interface LayoutProps {
  children: ReactNode
}

const navigationItems = [
  { path: '/calendar', label: '캘린더', icon: CalendarIcon },
  { path: '/diary', label: '다이어리', icon: BookOpenIcon },
  { path: '/settings', label: '설정', icon: Cog6ToothIcon },
]

const viewModeLabels = {
  year: '년',
  month: '월',
  week: '주',
  day: '일'
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const { 
    currentDate, 
    viewMode, 
    setViewMode, 
    navigatePrevious, 
    navigateNext, 
    navigateToday 
  } = useCalendar()

  const getDateDisplay = () => {
    switch (viewMode) {
      case 'year':
        return format(currentDate, 'yyyy년', { locale: ko })
      case 'month':
        return format(currentDate, 'yyyy년 M월', { locale: ko })
      case 'week':
        return format(currentDate, 'yyyy년 M월 W주차', { locale: ko })
      case 'day':
        return format(currentDate, 'yyyy년 M월 d일 EEEE', { locale: ko })
      default:
        return ''
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo & Navigation */}
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold text-primary-600">운명나침반</h1>
              
              <nav className="hidden md:flex space-x-1">
                {navigationItems.map(item => {
                  const Icon = item.icon
                  const isActive = location.pathname.startsWith(item.path)
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`
                        flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium
                        transition-colors duration-200
                        ${isActive 
                          ? 'bg-primary-50 text-primary-600' 
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }
                      `}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </nav>
            </div>

            {/* Calendar Controls */}
            {location.pathname === '/calendar' && (
              <div className="flex items-center space-x-4">
                {/* View Mode Selector */}
                <div className="hidden lg:flex items-center bg-gray-100 rounded-lg p-1">
                  {(['year', 'month', 'week', 'day'] as const).map(mode => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      className={`
                        px-3 py-1 rounded-md text-sm font-medium transition-colors
                        ${viewMode === mode
                          ? 'bg-white text-primary-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                        }
                      `}
                    >
                      {viewModeLabels[mode]}
                    </button>
                  ))}
                </div>

                {/* Date Navigation */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={navigatePrevious}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    aria-label="이전"
                  >
                    <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
                  </button>

                  <button
                    onClick={navigateToday}
                    className="px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    오늘
                  </button>

                  <button
                    onClick={navigateNext}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    aria-label="다음"
                  >
                    <ChevronRightIcon className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                {/* Current Date Display */}
                <div className="text-lg font-medium text-gray-900">
                  {getDateDisplay()}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200">
          <nav className="flex justify-around py-2">
            {navigationItems.map(item => {
              const Icon = item.icon
              const isActive = location.pathname.startsWith(item.path)
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex flex-col items-center space-y-1 px-3 py-2
                    ${isActive ? 'text-primary-600' : 'text-gray-600'}
                  `}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-xs font-medium">{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}