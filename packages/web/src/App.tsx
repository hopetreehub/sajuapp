import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from '@/pages/HomePage'
import DashboardPage from '@/pages/DashboardPage'
import CalendarPage from '@/pages/CalendarPage'
import DiaryPage from '@/pages/DiaryPage'
import SettingsPage from '@/pages/SettingsPage'
import FortunePage from '@/pages/FortunePage'
import SajuChartPage from '@/pages/SajuChartPage'
import InterpretationPage from '@/pages/InterpretationPage'
import UnifiedSajuAnalysisPage from '@/pages/UnifiedSajuAnalysisPage'
import CustomerManagementPage from '@/pages/CustomerManagementPage'
import Header from '@/components/Layout/Header'
import Footer from '@/components/Layout/Footer'
import { CalendarProvider } from '@/contexts/CalendarContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { initializeNotifications } from '@/utils/notifications'

function App() {
  // 알림 시스템 초기화
  useEffect(() => {
    initializeNotifications()
  }, [])

  return (
    <ThemeProvider>
      <Router>
        <CalendarProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/fortune" element={<FortunePage />} />
                <Route path="/saju" element={<UnifiedSajuAnalysisPage />} />
                <Route path="/customers" element={<CustomerManagementPage />} />
                {/* 기존 사주 서브페이지들은 통합 시스템으로 교체됨 */}
                <Route path="/saju/six-areas" element={<div className="p-8 text-center">6대 영역 분석이 통합 시스템으로 이전되었습니다. <a href="/saju" className="text-purple-600">새로운 사주분석</a>으로 이동하세요.</div>} />
                <Route path="/saju/detailed" element={<div className="p-8 text-center">17대 세부운세가 통합 시스템으로 이전되었습니다. <a href="/saju" className="text-purple-600">새로운 사주분석</a>으로 이동하세요.</div>} />
                <Route path="/saju/personality" element={<div className="p-8 text-center">7대 성향 분석이 통합 시스템으로 이전되었습니다. <a href="/saju" className="text-purple-600">새로운 사주분석</a>으로 이동하세요.</div>} />
                <Route path="/saju-chart" element={<SajuChartPage />} />
                <Route path="/saju/interpretation" element={<InterpretationPage />} />
                <Route path="/diary" element={<DiaryPage />} />
                <Route path="/diary/:date" element={<DiaryPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                {/* 추가 예정 페이지 */}
                <Route path="/compatibility" element={<div className="p-8 text-center">궁합 페이지 개발 중...</div>} />
              </Routes>
            </main>
            <Footer />
          </div>
        </CalendarProvider>
      </Router>
    </ThemeProvider>
  )
}

export default App