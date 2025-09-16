import { useState, useEffect } from 'react';
import { useCalendar } from '@/contexts/CalendarContext';
import NotificationSettings from '@/components/NotificationSettings';
import ReferralSection from '@/components/Auth/ReferralSection';
import CustomerManagementPage from './CustomerManagementPage';

interface PersonalInfo {
  birthDate: string
  birthTime: string
  calendarType: 'solar' | 'lunar'
  gender: 'male' | 'female' | ''
  birthPlace: string
}

export default function SettingsPage() {
  const { settings } = useCalendar();
  const [localSettings, setLocalSettings] = useState(settings);
  const [activeTab, setActiveTab] = useState<'general' | 'calendar' | 'diary' | 'notifications' | 'account' | 'customers'>('general');
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    birthDate: '',
    birthTime: '',
    calendarType: 'solar',
    gender: '',
    birthPlace: '',
  });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // localStorage에서 개인정보 불러오기
  useEffect(() => {
    const savedPersonalInfo = localStorage.getItem('sajuapp-personal-info');
    if (savedPersonalInfo) {
      try {
        const parsed = JSON.parse(savedPersonalInfo);
        setPersonalInfo(parsed);
      } catch (error) {
        console.error('Failed to parse saved personal info:', error);
      }
    }
  }, []);

  const tabs = [
    { id: 'general', label: '일반', icon: '⚙️' },
    { id: 'calendar', label: '캘린더', icon: '📅' },
    { id: 'diary', label: '다이어리', icon: '📝' },
    { id: 'notifications', label: '알림', icon: '🔔' },
    { id: 'account', label: '계정', icon: '👤' },
    { id: 'customers', label: '고객관리', icon: '👥' },
  ];

  const validatePersonalInfo = () => {
    if (!personalInfo.birthDate) {
      alert('생년월일을 입력해주세요.');
      return false;
    }
    if (!personalInfo.birthTime) {
      alert('출생시간을 입력해주세요.');
      return false;
    }
    if (!personalInfo.gender) {
      alert('성별을 선택해주세요.');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (activeTab === 'general' && !validatePersonalInfo()) {
      return;
    }

    setSaveStatus('saving');
    
    try {
      // 개인정보 저장
      if (activeTab === 'general') {
        localStorage.setItem('sajuapp-personal-info', JSON.stringify(personalInfo));
        
        // 사주 정보가 저장되었음을 다른 컴포넌트들에게 알림
        window.dispatchEvent(new CustomEvent('personalInfoUpdated', {
          detail: personalInfo,
        }));
      }
      
      // 기타 설정 저장 (향후 구현)
      localStorage.setItem('sajuapp-settings', JSON.stringify(localSettings));
      
      setSaveStatus('saved');
      
      // 2초 후 상태 초기화
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
      
      console.log('Settings saved successfully:', {
        personalInfo: activeTab === 'general' ? personalInfo : 'not updated',
        localSettings,
      });
      
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSaveStatus('error');
      alert('설정 저장에 실패했습니다. 다시 시도해주세요.');
    }
  };

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
                          value={personalInfo.birthDate}
                          onChange={(e) => setPersonalInfo({...personalInfo, birthDate: e.target.value})}
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
                          value={personalInfo.birthTime}
                          onChange={(e) => setPersonalInfo({...personalInfo, birthTime: e.target.value})}
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
                        <select 
                          value={personalInfo.calendarType}
                          onChange={(e) => setPersonalInfo({...personalInfo, calendarType: e.target.value as 'solar' | 'lunar'})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                        >
                          <option value="solar">양력</option>
                          <option value="lunar">음력</option>
                        </select>
                      </div>
                      
                      {/* 성별 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          성별 *
                        </label>
                        <select 
                          value={personalInfo.gender}
                          onChange={(e) => setPersonalInfo({...personalInfo, gender: e.target.value as 'male' | 'female' | ''})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                        >
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
                        value={personalInfo.birthPlace}
                        onChange={(e) => setPersonalInfo({...personalInfo, birthPlace: e.target.value})}
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

              {/* Notification Settings */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-foreground mb-4">알림 설정</h2>
                  <NotificationSettings />
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

                  {/* 추천인 섹션 */}
                  <div className="pt-4 border-t border-border">
                    <ReferralSection />
                  </div>

                  <div className="pt-4 border-t border-border">
                    <button className="px-4 py-2 text-red-600 hover:bg-red-500/10 rounded-lg transition-colors">
                      계정 삭제
                    </button>
                  </div>
                </div>
              )}

              {/* Customer Management Settings */}
              {activeTab === 'customers' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-foreground mb-4">고객관리</h2>

                  {/* 임베드된 고객관리 페이지 */}
                  <CustomerManagementPage embedded={true} />

                  {/* 추가 설정 섹션 */}
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">
                      <span className="mr-2">⚙️</span>
                      고객 데이터 설정
                    </h4>

                    <div className="space-y-3">
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="w-4 h-4 text-primary border-border rounded focus:ring-primary/50"
                        />
                        <span className="text-sm font-medium text-foreground">고객 정보 자동 백업</span>
                      </label>

                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="w-4 h-4 text-primary border-border rounded focus:ring-primary/50"
                        />
                        <span className="text-sm font-medium text-foreground">상담 알림 활성화</span>
                      </label>

                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-primary border-border rounded focus:ring-primary/50"
                        />
                        <span className="text-sm font-medium text-foreground">고객 생일 알림</span>
                      </label>
                    </div>
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
                  disabled={saveStatus === 'saving'}
                  className={`px-6 py-2 rounded-lg transition-colors ${
                    saveStatus === 'saving' 
                      ? 'bg-gray-400 cursor-not-allowed text-white'
                      : saveStatus === 'saved'
                      ? 'bg-green-500 hover:bg-green-600 text-white'
                      : 'bg-primary-500 hover:bg-primary-600 text-white'
                  }`}
                >
                  {saveStatus === 'saving' ? '저장 중...' : 
                   saveStatus === 'saved' ? '✓ 저장 완료' : 
                   '저장'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}