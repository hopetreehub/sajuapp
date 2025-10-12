import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from '@/pages/AuthPage';
import DashboardPage from '@/pages/DashboardPage';
import AdminDashboardPage from '@/pages/AdminDashboardPage';
import CalendarPage from '@/pages/CalendarPage';
import DiaryPage from '@/pages/DiaryPage';
import SettingsPage from '@/pages/SettingsPage';
import FortunePage from '@/pages/FortunePage';
import SajuChartPage from '@/pages/SajuChartPage';
import InterpretationPage from '@/pages/InterpretationPage';
import UnifiedSajuAnalysisPageWithLifeChart from '@/pages/UnifiedSajuAnalysisPageWithLifeChart';
import CustomerManagementPage from '@/pages/CustomerManagementPage';
import { CompatibilityPage } from '@/pages/CompatibilityPage';
import LearningPage from '@/pages/LearningPage';
import SearchPage from '@/pages/SearchPage';
import TestApi from '@/pages/TestApi';
import QimenView from '@/components/qimen/QimenView';
import ZiweiPage from '@/pages/ZiweiPage';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import ProtectedRoute from '@/components/Auth/ProtectedRoute';
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
                <Routes>
                {/* 공개 라우트 - 로그인 없이 접근 가능 */}
                <Route path="/auth" element={<AuthPage />} />

                {/* 보호된 라우트 - 로그인 필요 */}
                <Route path="/" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
                <Route path="/calendar" element={<Navigate to="/" replace />} />
                <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute><AdminDashboardPage /></ProtectedRoute>} />
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
                {/* 귀문둔갑 */}
                <Route path="/qimen" element={<ProtectedRoute><QimenView /></ProtectedRoute>} />
                {/* 자미두수 */}
                <Route path="/ziwei" element={<ProtectedRoute><ZiweiPage /></ProtectedRoute>} />
              </Routes>
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