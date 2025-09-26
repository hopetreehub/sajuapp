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
import TestSajuPage from '@/pages/TestSajuPage';
import SajuTestPage from '@/pages/SajuTestPage';
import { CompatibilityPage } from '@/pages/CompatibilityPage';
import LearningPage from '@/pages/LearningPage';
import TestComprehensiveScoresPage from '@/pages/TestComprehensiveScoresPage';
import SearchPage from '@/pages/SearchPage';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
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
                <Route path="/" element={<CalendarPage />} />
                <Route path="/calendar" element={<Navigate to="/" replace />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/admin" element={<AdminDashboardPage />} />
                <Route path="/fortune" element={<FortunePage />} />
                <Route path="/saju" element={<UnifiedSajuAnalysisPageWithLifeChart />} />
                <Route path="/customers" element={<CustomerManagementPage />} />
                <Route path="/test-saju" element={<TestSajuPage />} />
                <Route path="/saju-test" element={<SajuTestPage />} />
                <Route path="/test-comprehensive" element={<TestComprehensiveScoresPage />} />
                {/* 기존 사주 서브페이지들은 통합 시스템으로 교체됨 */}
                <Route path="/saju/six-areas" element={<div className="p-8 text-center">6대 영역 분석이 통합 시스템으로 이전되었습니다. <a href="/saju" className="text-purple-600">새로운 사주분석</a>으로 이동하세요.</div>} />
                <Route path="/saju/detailed" element={<div className="p-8 text-center">17대 세부운세가 통합 시스템으로 이전되었습니다. <a href="/saju" className="text-purple-600">새로운 사주분석</a>으로 이동하세요.</div>} />
                <Route path="/saju/personality" element={<div className="p-8 text-center">7대 성향 분석이 통합 시스템으로 이전되었습니다. <a href="/saju" className="text-purple-600">새로운 사주분석</a>으로 이동하세요.</div>} />
                <Route path="/saju-chart" element={<SajuChartPage />} />
                <Route path="/saju/interpretation" element={<InterpretationPage />} />
                <Route path="/diary" element={<DiaryPage />} />
                <Route path="/diary/:date" element={<DiaryPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/search" element={<SearchPage />} />
                {/* 추가 예정 페이지 */}
                <Route path="/compatibility" element={<CompatibilityPage />} />
                <Route path="/learning/:courseId" element={<LearningPage />} />
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