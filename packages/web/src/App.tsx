import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import CalendarPage from '@/pages/CalendarPage'
import DiaryPage from '@/pages/DiaryPage'
import SettingsPage from '@/pages/SettingsPage'
import Layout from '@/components/Common/Layout'
import { CalendarProvider } from '@/contexts/CalendarContext'

function App() {
  return (
    <Router>
      <CalendarProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/calendar" replace />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/diary" element={<DiaryPage />} />
            <Route path="/diary/:date" element={<DiaryPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </Layout>
      </CalendarProvider>
    </Router>
  )
}

export default App