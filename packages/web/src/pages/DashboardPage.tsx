import { useState, useEffect } from 'react';
import { useCalendar } from '@/contexts/CalendarContext';
import { 
  getDashboardData, 
  getQuickActions, 
  DashboardStats, 
} from '@/services/dashboardService';
import TodaySummary from '@/components/Dashboard/TodaySummary';
import WeeklyStats from '@/components/Dashboard/WeeklyStats';
import MonthlyHeatmap from '@/components/Dashboard/MonthlyHeatmap';
import QuickActions from '@/components/Dashboard/QuickActions';
import EventModal from '@/components/EventModal';
import DiaryModal from '@/components/DiaryModal';
import ProgressTracker from '@/components/Learning/ProgressTracker';
import CourseCard from '@/components/Learning/CourseCard';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

export default function DashboardPage() {
  const { todos, addTodo } = useCalendar();
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'learning'>('overview');
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  
  // 모달 상태 관리
  const [showEventModal, setShowEventModal] = useState(false);
  const [showDiaryModal, setShowDiaryModal] = useState(false);
  const [showTodoModal, setShowTodoModal] = useState(false);
  
  const quickActions = getQuickActions({
    onAddEvent: () => setShowEventModal(true),
    onAddTodo: () => setShowTodoModal(true),
    onWriteDiary: () => setShowDiaryModal(true),
  });
  
  // 대시보드 데이터 로드
  const loadDashboardData = async (showRefreshing = false) => {
    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    
    try {
      const data = await getDashboardData(todos);
      setDashboardData(data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('대시보드 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // 초기 로드
  useEffect(() => {
    loadDashboardData();
    loadEnrolledCourses();
  }, [todos]);
  
  // 수강 중인 강좌 로드
  const loadEnrolledCourses = async () => {
    try {
      // 임시 데이터 (실제로는 API에서 가져와야 함)
      const mockCourses = [
        {
          id: '1',
          title: '사주 기초 입문 과정',
          description: '사주의 기본 개념부터 실전 해석까지',
          level: 'beginner',
          category: 'basic',
          status: 'published',
          instructor_id: '1',
          instructor_name: '김사주 선생님',
          price: 0,
          rating: 4.8,
          enrollment_count: 1234,
          duration: 240,
          lessons_count: 12,
          created_at: '2024-01-01',
        },
        {
          id: '2',
          title: '고급 사주 해석법',
          description: '전문가 수준의 사주 분석 기법',
          level: 'advanced',
          category: 'professional',
          status: 'published',
          instructor_id: '2',
          instructor_name: '이운세 선생님',
          price: 99000,
          rating: 4.9,
          enrollment_count: 567,
          duration: 480,
          lessons_count: 24,
          created_at: '2024-02-01',
        },
      ];
      setEnrolledCourses(mockCourses);
    } catch (error) {
      console.error('수강 강좌 로딩 실패:', error);
    }
  };
  
  // 새로고침 핸들러
  const handleRefresh = () => {
    loadDashboardData(true);
  };
  
  if (loading && !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 로딩 헤더 */}
          <div className="flex items-center justify-between mb-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded w-48 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-32"></div>
            </div>
            <div className="animate-pulse">
              <div className="h-10 w-24 bg-gray-200 dark:bg-gray-600 rounded"></div>
            </div>
          </div>
          
          {/* 로딩 그리드 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="h-96 bg-gray-200 dark:bg-gray-600 rounded-xl animate-pulse"></div>
              <div className="h-80 bg-gray-200 dark:bg-gray-600 rounded-xl animate-pulse"></div>
            </div>
            <div className="space-y-8">
              <div className="h-64 bg-gray-200 dark:bg-gray-600 rounded-xl animate-pulse"></div>
              <div className="h-96 bg-gray-200 dark:bg-gray-600 rounded-xl animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😵</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            오류가 발생했습니다
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {error}
          </p>
          <button
            onClick={() => loadDashboardData()}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {activeTab === 'overview' ? '📊 대시보드' : '🎓 학습 현황'}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {activeTab === 'overview' ? '한눈에 보는 나의 활동 현황' : '학습 진도와 성취를 확인하세요'}
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* 탭 전환 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'overview'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                개요
              </button>
              <button
                onClick={() => setActiveTab('learning')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'learning'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                학습
              </button>
            </div>
          
            {/* 새로고침 버튼 */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              <ArrowPathIcon className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {refreshing ? '새로고침 중...' : '새로고침'}
              </span>
            </button>
          </div>
        </div>
        
        {/* 메인 콘텐츠 */}
        {activeTab === 'overview' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 왼쪽 컬럼 (2/3) */}
            <div className="lg:col-span-2 space-y-8">
              {/* 오늘의 요약 */}
              {dashboardData && (
                <TodaySummary 
                  todayData={dashboardData.today} 
                  loading={loading}
                />
              )}
              
              {/* 주간 통계 */}
              {dashboardData && (
                <WeeklyStats 
                  weeklyData={dashboardData.week} 
                  loading={loading}
                />
              )}
            </div>
            
            {/* 오른쪽 컬럼 (1/3) */}
            <div className="space-y-8">
              {/* 빠른 액션 */}
              <QuickActions 
                actions={quickActions}
                loading={loading}
              />
              
              {/* 월간 히트맵 */}
              {dashboardData && (
                <MonthlyHeatmap 
                  monthlyData={dashboardData.month} 
                  loading={loading}
                />
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* 학습 진도 추적 */}
            <ProgressTracker userId="user-1" />
            
            {/* 수강 중인 강좌 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                수강 중인 강좌
              </h3>
              
              {enrolledCourses.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📚</div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    수강 중인 강좌가 없습니다
                  </h4>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    새로운 강좌를 수강해보세요
                  </p>
                  <button 
                    onClick={() => window.location.href = '/saju'}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    강좌 둘러보기
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {enrolledCourses.map(course => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      progress={{
                        courseId: course.id,
                        enrollmentId: `enrollment-${course.id}`,
                        progress: course.id === '1' ? 25 : 60,
                        completedLessons: course.id === '1' ? 3 : 14,
                        totalLessons: course.lessons_count,
                        isEnrolled: true,
                        status: course.id === '1' ? 'enrolled' : 'enrolled',
                      }}
                      showEnrollButton={false}
                    />  
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* 하단 인사이트 (선택사항) */}
        {dashboardData && (
          <div className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-700">
            <div className="flex items-start gap-4">
              <div className="text-3xl">🎯</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  오늘의 인사이트
                </h3>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  {dashboardData.today.totalTodos === 0 && (
                    <p>• 오늘 할일을 추가하여 하루를 계획해보세요</p>
                  )}
                  {dashboardData.today.diary === null && (
                    <p>• 하루를 마무리하며 일기를 작성해보세요</p>
                  )}
                  {dashboardData.week.completionRate > 80 && (
                    <p>• 이번 주 할일 완료율이 {dashboardData.week.completionRate}%입니다. 정말 잘하고 계시네요! 🎉</p>
                  )}
                  {dashboardData.week.completionRate < 50 && dashboardData.week.completionRate > 0 && (
                    <p>• 할일 완료율이 낮습니다. 작은 목표부터 차근차근 시작해보세요</p>
                  )}
                  {dashboardData.month.totalActivities === 0 && (
                    <p>• 이번 달의 첫 활동을 기록해보세요!</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* 모달들 */}
      {showEventModal && (
        <EventModal
          isOpen={showEventModal}
          onClose={() => setShowEventModal(false)}
          onSave={(_event) => {

            setShowEventModal(false);
            loadDashboardData(true); // 데이터 새로고침
          }}
        />
      )}

      {showDiaryModal && (
        <DiaryModal
          isOpen={showDiaryModal}
          date={new Date()}
          onClose={() => setShowDiaryModal(false)}
          onSave={() => {
            setShowDiaryModal(false);
            loadDashboardData(true); // 데이터 새로고침
          }}
        />
      )}
      
      {/* Todo 모달은 간단한 prompt로 대체 */}
      {showTodoModal && (() => {
        const todoText = prompt('새로운 할일을 입력하세요:');
        if (todoText) {
          addTodo({
            text: todoText,
            completed: false,
            priority: 'medium',
            date: new Date().toISOString().split('T')[0],
          });
          loadDashboardData(true);
        }
        setShowTodoModal(false);
        return null;
      })()}
    </div>
  );
}