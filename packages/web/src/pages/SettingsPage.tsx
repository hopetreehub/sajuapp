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
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-foreground mb-6">설정</h1>

        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-64">
            <nav className="bg-background rounded-lg shadow-sm border border-border p-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors
                    ${activeTab === tab.id 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-foreground hover:bg-muted'
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
            <div className="bg-background rounded-lg shadow-sm border border-border p-6">
              {/* General Settings */}
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-foreground mb-4">일반 설정</h2>

                  {/* 생년월일시 섹션 */}
                  <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-700">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                      <span className="mr-2">🎂</span>
                      사주 정보 (개인화 운세를 위해 필요)
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* 생년월일 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          생년월일 *
                        </label>
                        <input
                          type="date"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                          placeholder="YYYY-MM-DD"
                        />
                      </div>
                      
                      {/* 생시 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          출생 시간 *
                        </label>
                        <input
                          type="time"
                          step="1800"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          24시간 형식으로 입력해주세요 (예: 14:30)
                        </p>
                      </div>
                      
                      {/* 음력/양력 선택 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          달력 종류 *
                        </label>
                        <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                          <option value="solar">양력</option>
                          <option value="lunar">음력</option>
                        </select>
                      </div>
                      
                      {/* 성별 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          성별 *
                        </label>
                        <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                          <option value="">선택해주세요</option>
                          <option value="male">남성</option>
                          <option value="female">여성</option>
                        </select>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          전통 사주학에서 성별에 따른 해석이 달라집니다
                        </p>
                      </div>
                    </div>

                    {/* 출생지 (선택사항) */}
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        출생지 (선택사항)
                      </label>
                      <input
                        type="text"
                        placeholder="예: 서울시 강남구"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        더 정확한 시간 계산을 위해 출생지를 입력할 수 있습니다
                      </p>
                    </div>

                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        💡 <strong>개인정보 보호:</strong> 입력하신 정보는 개인화된 운세 제공을 위해서만 사용되며, 로컬에 안전하게 저장됩니다.
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      테마
                    </label>
                    <select
                      value={localSettings.theme}
                      onChange={(e) => setLocalSettings({...localSettings, theme: e.target.value as any})}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-background text-foreground"
                    >
                      <option value="light">라이트</option>
                      <option value="dark">다크</option>
                      <option value="system">시스템 설정 따르기</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      언어
                    </label>
                    <select
                      value={localSettings.language}
                      onChange={(e) => setLocalSettings({...localSettings, language: e.target.value as any})}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-background text-foreground"
                    >
                      <option value="ko">한국어</option>
                      <option value="en">English</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      시간대
                    </label>
                    <select
                      value={localSettings.timezone}
                      onChange={(e) => setLocalSettings({...localSettings, timezone: e.target.value})}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-background text-foreground"
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
                  <h2 className="text-lg font-semibold text-foreground mb-4">캘린더 설정</h2>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      기본 보기
                    </label>
                    <select
                      value={localSettings.defaultView}
                      onChange={(e) => setLocalSettings({...localSettings, defaultView: e.target.value as any})}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-background text-foreground"
                    >
                      <option value="year">년</option>
                      <option value="month">월</option>
                      <option value="week">주</option>
                      <option value="day">일</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      주 시작일
                    </label>
                    <select
                      value={localSettings.weekStartsOn}
                      onChange={(e) => setLocalSettings({...localSettings, weekStartsOn: parseInt(e.target.value) as any})}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-background text-foreground"
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
                        className="w-4 h-4 text-primary border-border rounded focus:ring-primary/50"
                      />
                      <span className="text-sm font-medium text-foreground">음력 날짜 표시</span>
                    </label>
                  </div>

                  <div>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={localSettings.showFortune}
                        onChange={(e) => setLocalSettings({...localSettings, showFortune: e.target.checked})}
                        className="w-4 h-4 text-primary border-border rounded focus:ring-primary/50"
                      />
                      <span className="text-sm font-medium text-foreground">운세 정보 표시</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Diary Settings */}
              {activeTab === 'diary' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-foreground mb-4">다이어리 설정</h2>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      기본 공개 범위
                    </label>
                    <select className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-background text-foreground">
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
                        className="w-4 h-4 text-primary border-border rounded focus:ring-primary/50"
                      />
                      <span className="text-sm font-medium text-foreground">일일 알림 활성화</span>
                    </label>
                    <p className="text-sm text-muted-foreground mt-1 ml-7">
                      매일 저녁 9시에 다이어리 작성 알림을 받습니다.
                    </p>
                  </div>

                  <div>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-4 h-4 text-primary border-border rounded focus:ring-primary/50"
                      />
                      <span className="text-sm font-medium text-foreground">자동 저장</span>
                    </label>
                    <p className="text-sm text-muted-foreground mt-1 ml-7">
                      작성 중인 내용을 30초마다 자동으로 저장합니다.
                    </p>
                  </div>
                </div>
              )}

              {/* Account Settings */}
              {activeTab === 'account' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-foreground mb-4">계정 설정</h2>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      이메일
                    </label>
                    <input
                      type="email"
                      defaultValue="user@example.com"
                      disabled
                      className="w-full px-3 py-2 border border-border rounded-lg bg-muted text-muted-foreground"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      사용자명
                    </label>
                    <input
                      type="text"
                      defaultValue="홍길동"
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-background text-foreground"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      프로필 사진
                    </label>
                    <div className="flex items-center space-x-4">
                      <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center text-2xl text-muted-foreground">
                        👤
                      </div>
                      <button className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors">
                        사진 변경
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <button className="px-4 py-2 text-red-600 hover:bg-red-500/10 rounded-lg transition-colors">
                      계정 삭제
                    </button>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="mt-8 pt-6 border-t border-border flex justify-end gap-3">
                <button className="px-6 py-2 border border-border text-foreground rounded-lg hover:bg-muted transition-colors">
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