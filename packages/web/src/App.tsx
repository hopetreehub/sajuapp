import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import ProtectedRoute from '@/components/Auth/ProtectedRoute';

// Lazy load pages for better performance
const AuthPage = lazy(() => import('@/pages/AuthPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const AdminDashboardPage = lazy(() => import('@/pages/AdminDashboardPage'));
const AdminUserManagementPage = lazy(() => import('@/pages/AdminUserManagementPage'));
const CalendarPage = lazy(() => import('@/pages/CalendarPage'));
const DiaryPage = lazy(() => import('@/pages/DiaryPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const FortunePage = lazy(() => import('@/pages/FortunePage'));
const SajuChartPage = lazy(() => import('@/pages/SajuChartPage'));
const InterpretationPage = lazy(() => import('@/pages/InterpretationPage'));
const UnifiedSajuAnalysisPageWithLifeChart = lazy(() => import('@/pages/UnifiedSajuAnalysisPageWithLifeChart'));
const CustomerManagementPage = lazy(() => import('@/pages/CustomerManagementPage'));
const CompatibilityPage = lazy(() => import('@/pages/CompatibilityPage').then(module => ({ default: module.CompatibilityPage })));
const LearningPage = lazy(() => import('@/pages/LearningPage'));
const SearchPage = lazy(() => import('@/pages/SearchPage'));
const TestApi = lazy(() => import('@/pages/TestApi'));
const QimenView = lazy(() => import('@/components/qimen/QimenView'));
const QimenLearningPage = lazy(() => import('@/pages/QimenLearningPage'));
const ZiweiPage = lazy(() => import('@/pages/ZiweiPage'));
const TarotPage = lazy(() => import('@/pages/TarotPage'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="flex flex-col items-center space-y-4">
      <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-gray-600 dark:text-gray-400">로딩 중...</p>
    </div>
  </div>
);
import { CalendarProvider } from '@/contexts/CalendarContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { YearlyMemoProvider } from '@/contexts/YearlyMemoContext';
import { initializeNotifications } from '@/utils/notifications';

function App() {
  // 알림 시스템 초기화
  useEffect(() => {
    initializeNotifications();
  }, []);

  return (
    <ThemeProvider>
      <Router>
        <CalendarProvider>
          <YearlyMemoProvider>
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1">
                <Suspense fallback={<LoadingFallback />}>
                  <Routes>
                {/* 공개 라우트 - 로그인 없이 접근 가능 */}
                <Route path="/auth" element={<AuthPage />} />

                {/* 보호된 라우트 - 로그인 필요 */}
                <Route path="/" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
                <Route path="/calendar" element={<Navigate to="/" replace />} />
                <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute><AdminDashboardPage /></ProtectedRoute>} />
                <Route path="/admin/users" element={<ProtectedRoute><AdminUserManagementPage /></ProtectedRoute>} />
                <Route path="/fortune" element={<ProtectedRoute><FortunePage /></ProtectedRoute>} />
                <Route path="/saju" element={<ProtectedRoute><UnifiedSajuAnalysisPageWithLifeChart /></ProtectedRoute>} />
                <Route path="/customers" element={<ProtectedRoute><CustomerManagementPage /></ProtectedRoute>} />
                <Route path="/test-api" element={<ProtectedRoute><TestApi /></ProtectedRoute>} />
                {/* 기존 사주 서브페이지들은 통합 시스템으로 교체됨 */}
                <Route path="/saju/six-areas" element={<ProtectedRoute><div className="p-8 text-center">6대 영역 분석이 통합 시스템으로 이전되었습니다. <a href="/saju" className="text-purple-600">새로운 사주분석</a>으로 이동하세요.</div></ProtectedRoute>} />
                <Route path="/saju/detailed" element={<ProtectedRoute><div className="p-8 text-center">17대 세부운세가 통합 시스템으로 이전되었습니다. <a href="/saju" className="text-purple-600">새로운 사주분석</a>으로 이동하세요.</div></ProtectedRoute>} />
                <Route path="/saju/personality" element={<ProtectedRoute><div className="p-8 text-center">7대 성향 분석이 통합 시스템으로 이전되었습니다. <a href="/saju" className="text-purple-600">새로운 사주분석</a>으로 이동하세요.</div></ProtectedRoute>} />
                <Route path="/saju-chart" element={<ProtectedRoute><SajuChartPage /></ProtectedRoute>} />
                <Route path="/saju/interpretation" element={<ProtectedRoute><InterpretationPage /></ProtectedRoute>} />
                <Route path="/diary" element={<ProtectedRoute><DiaryPage /></ProtectedRoute>} />
                <Route path="/diary/:date" element={<ProtectedRoute><DiaryPage /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
                {/* 추가 예정 페이지 */}
                <Route path="/compatibility" element={<ProtectedRoute><CompatibilityPage /></ProtectedRoute>} />
                <Route path="/learning/:courseId" element={<ProtectedRoute><LearningPage /></ProtectedRoute>} />
                {/* 귀문둔갑 - 인증 불필요 (개발/테스트용) */}
                <Route path="/qimen" element={<QimenView />} />
                <Route path="/qimen/learning" element={<QimenLearningPage />} />
                {/* 자미두수 */}
                <Route path="/ziwei" element={<ProtectedRoute><ZiweiPage /></ProtectedRoute>} />
                {/* 타로 카드 */}
                <Route path="/tarot" element={<ProtectedRoute><TarotPage /></ProtectedRoute>} />
              </Routes>
                </Suspense>
            </main>
            <Footer />
          </div>
          </YearlyMemoProvider>
        </CalendarProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;