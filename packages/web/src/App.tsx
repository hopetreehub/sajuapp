import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from '@/pages/HomePage'
import CalendarPage from '@/pages/CalendarPage'
import DiaryPage from '@/pages/DiaryPage'
import SettingsPage from '@/pages/SettingsPage'
import FortunePage from '@/pages/FortunePage'
import SajuAnalysisPage from '@/pages/SajuAnalysisPage'
import SixAreasPage from '@/pages/SixAreasPage'
import DetailedFortunePage from '@/pages/DetailedFortunePage'
import PersonalityAnalysisPage from '@/pages/PersonalityAnalysisPage'
import SajuChartPage from '@/pages/SajuChartPage'
import Header from '@/components/Layout/Header'
import Footer from '@/components/Layout/Footer'
import { CalendarProvider } from '@/contexts/CalendarContext'
import { ThemeProvider } from '@/contexts/ThemeContext'

function App() {
  return (
    <ThemeProvider>
      <Router>
        <CalendarProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/fortune" element={<FortunePage />} />
                <Route path="/saju" element={<SajuAnalysisPage />} />
                <Route path="/saju/six-areas" element={<SixAreasPage />} />
                <Route path="/saju/detailed" element={<DetailedFortunePage />} />
                <Route path="/saju/personality" element={<PersonalityAnalysisPage />} />
                <Route path="/saju/charts" element={<SajuChartPage />} />
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