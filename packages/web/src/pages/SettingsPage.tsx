import { useState } from 'react'
import { useCalendar } from '@/contexts/CalendarContext'

export default function SettingsPage() {
  const { settings } = useCalendar()
  const [localSettings, setLocalSettings] = useState(settings)
  const [activeTab, setActiveTab] = useState<'general' | 'calendar' | 'diary' | 'account'>('general')

  const tabs = [
    { id: 'general', label: '일반', icon: '⚙️' },
    { id: 'calendar', label: '캘린더', icon: '📅' },
    { id: 'diary', label: '다이어리', icon: '📝' },
    { id: 'account', label: '계정', icon: '👤' }
  ]

  const handleSave = () => {
    // Save settings
    console.log('Saving settings:', localSettings)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">설정</h1>

        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-64">
            <nav className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors
                    ${activeTab === tab.id 
                      ? 'bg-primary-50 text-primary-600' 
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <span className="text-xl">{tab.icon}</span>
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {/* General Settings */}
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">일반 설정</h2>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      테마
                    </label>
                    <select
                      value={localSettings.theme}
                      onChange={(e) => setLocalSettings({...localSettings, theme: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="light">라이트</option>
                      <option value="dark">다크</option>
                      <option value="system">시스템 설정 따르기</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      언어
                    </label>
                    <select
                      value={localSettings.language}
                      onChange={(e) => setLocalSettings({...localSettings, language: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="ko">한국어</option>
                      <option value="en">English</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      시간대
                    </label>
                    <select
                      value={localSettings.timezone}
                      onChange={(e) => setLocalSettings({...localSettings, timezone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="Asia/Seoul">서울 (GMT+9)</option>
                      <option value="America/New_York">뉴욕 (GMT-5)</option>
                      <option value="Europe/London">런던 (GMT+0)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Calendar Settings */}
              {activeTab === 'calendar' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">캘린더 설정</h2>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      기본 보기
                    </label>
                    <select
                      value={localSettings.defaultView}
                      onChange={(e) => setLocalSettings({...localSettings, defaultView: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="year">년</option>
                      <option value="month">월</option>
                      <option value="week">주</option>
                      <option value="day">일</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      주 시작일
                    </label>
                    <select
                      value={localSettings.weekStartsOn}
                      onChange={(e) => setLocalSettings({...localSettings, weekStartsOn: parseInt(e.target.value) as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="0">일요일</option>
                      <option value="1">월요일</option>
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={localSettings.showLunarCalendar}
                        onChange={(e) => setLocalSettings({...localSettings, showLunarCalendar: e.target.checked})}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm font-medium text-gray-700">음력 날짜 표시</span>
                    </label>
                  </div>

                  <div>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={localSettings.showFortune}
                        onChange={(e) => setLocalSettings({...localSettings, showFortune: e.target.checked})}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm font-medium text-gray-700">운세 정보 표시</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Diary Settings */}
              {activeTab === 'diary' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">다이어리 설정</h2>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      기본 공개 범위
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                      <option value="private">비공개</option>
                      <option value="friends">친구만</option>
                      <option value="public">전체 공개</option>
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm font-medium text-gray-700">일일 알림 활성화</span>
                    </label>
                    <p className="text-sm text-gray-500 mt-1 ml-7">
                      매일 저녁 9시에 다이어리 작성 알림을 받습니다.
                    </p>
                  </div>

                  <div>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm font-medium text-gray-700">자동 저장</span>
                    </label>
                    <p className="text-sm text-gray-500 mt-1 ml-7">
                      작성 중인 내용을 30초마다 자동으로 저장합니다.
                    </p>
                  </div>
                </div>
              )}

              {/* Account Settings */}
              {activeTab === 'account' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">계정 설정</h2>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      이메일
                    </label>
                    <input
                      type="email"
                      defaultValue="user@example.com"
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      사용자명
                    </label>
                    <input
                      type="text"
                      defaultValue="홍길동"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      프로필 사진
                    </label>
                    <div className="flex items-center space-x-4">
                      <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center text-2xl text-gray-500">
                        👤
                      </div>
                      <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        사진 변경
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <button className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      계정 삭제
                    </button>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end gap-3">
                <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  취소
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  저장
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}