import { useState, useEffect } from 'react';
import { BellIcon, BellSlashIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { 
  NotificationSettings as NotificationSettingsType,
  getNotificationSettings,
  saveNotificationSettings,
  requestNotificationPermission,
  hasNotificationPermission,
  showTestNotification,
} from '@/utils/notifications';

export default function NotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettingsType>(getNotificationSettings());
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  // 권한 상태 체크
  useEffect(() => {
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission as NotificationPermission);
    }
  }, []);
  
  // 설정 변경 처리
  const handleSettingChange = (key: keyof NotificationSettingsType, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    saveNotificationSettings(newSettings);
    
    // 성공 메시지 표시
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 2000);
  };
  
  // 권한 요청
  const handleRequestPermission = async () => {
    setIsRequestingPermission(true);
    try {
      const granted = await requestNotificationPermission();
      setPermissionStatus(granted ? 'granted' : 'denied');
      
      if (granted) {
        // 권한이 승인되면 알림 활성화
        handleSettingChange('enabled', true);
      }
    } catch (error) {
      console.error('Permission request failed:', error);
    } finally {
      setIsRequestingPermission(false);
    }
  };
  
  // 테스트 알림
  const handleTestNotification = () => {
    if (hasNotificationPermission()) {
      showTestNotification();
    } else {
      alert('알림 권한이 필요합니다.');
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <BellIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              알림 설정
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              일정, 할일, 일기 알림을 관리합니다
            </p>
          </div>
        </div>
        
        {/* 성공 메시지 */}
        {showSuccessMessage && (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400 animate-fade-in">
            <CheckCircleIcon className="h-5 w-5" />
            <span className="text-sm font-medium">저장됨</span>
          </div>
        )}
      </div>
      
      {/* 권한 상태 */}
      <div className="mb-6 p-4 rounded-lg border">
        {permissionStatus === 'granted' ? (
          <div className="flex items-center gap-3 text-green-600 dark:text-green-400">
            <BellIcon className="h-5 w-5" />
            <div>
              <p className="font-medium">알림 권한 승인됨</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                브라우저 알림을 받을 수 있습니다
              </p>
            </div>
          </div>
        ) : permissionStatus === 'denied' ? (
          <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
            <BellSlashIcon className="h-5 w-5" />
            <div>
              <p className="font-medium">알림 권한 거부됨</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                브라우저 설정에서 알림을 허용해주세요
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-yellow-600 dark:text-yellow-400">
              <BellIcon className="h-5 w-5" />
              <div>
                <p className="font-medium">알림 권한 필요</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  알림을 받으려면 권한을 허용해주세요
                </p>
              </div>
            </div>
            <button
              onClick={handleRequestPermission}
              disabled={isRequestingPermission}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 text-sm font-medium"
            >
              {isRequestingPermission ? '요청 중...' : '권한 요청'}
            </button>
          </div>
        )}
      </div>
      
      {/* 알림 설정 */}
      <div className="space-y-6">
        {/* 알림 전체 활성화 */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">알림 활성화</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              모든 알림을 활성화/비활성화합니다
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={(e) => handleSettingChange('enabled', e.target.checked)}
              disabled={permissionStatus !== 'granted'}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600 peer-disabled:opacity-50"></div>
          </label>
        </div>
        
        {/* 개별 알림 설정 */}
        {settings.enabled && (
          <>
            {/* 일정 알림 */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">일정 알림</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  예정된 일정 시작 전에 알림을 받습니다
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.eventReminders}
                  onChange={(e) => handleSettingChange('eventReminders', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
              </label>
            </div>
            
            {/* 할일 마감 알림 */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">할일 마감 알림</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  할일 마감 시간 전에 알림을 받습니다
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.todoDeadlines}
                  onChange={(e) => handleSettingChange('todoDeadlines', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
              </label>
            </div>
            
            {/* 일기 작성 리마인더 */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">일기 작성 리마인더</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  매일 저녁 9시에 일기 작성을 안내합니다
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.diaryReminders}
                  onChange={(e) => handleSettingChange('diaryReminders', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
              </label>
            </div>
            
            {/* 알림 시간 설정 */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">알림 시간</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  일정/할일 시작/마감 몇 분 전에 알림을 받을지 설정합니다
                </p>
              </div>
              <select
                value={settings.reminderMinutes}
                onChange={(e) => handleSettingChange('reminderMinutes', parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value={5}>5분 전</option>
                <option value={10}>10분 전</option>
                <option value={15}>15분 전</option>
                <option value={30}>30분 전</option>
                <option value={60}>1시간 전</option>
              </select>
            </div>
          </>
        )}
      </div>
      
      {/* 테스트 버튼 */}
      {settings.enabled && permissionStatus === 'granted' && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
          <button
            onClick={handleTestNotification}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium"
          >
            📱 테스트 알림 보내기
          </button>
        </div>
      )}
    </div>
  );
}