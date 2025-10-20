import React, { useState, useEffect } from 'react';
import { useQimenNotificationStore } from '@/stores/qimenNotificationStore';
import {
  hasNotificationPermission,
  sendTestNotification,
  startPeriodicCheck,
} from '@/utils/qimenNotification';

interface NotificationSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    settings,
    history,
    updateSettings,
    toggleEnabled,
    requestPermission,
    clearHistory,
  } = useQimenNotificationStore();

  const [hasPermission, setHasPermission] = useState(hasNotificationPermission());

  useEffect(() => {
    setHasPermission(hasNotificationPermission());
  }, [settings.permissionGranted]);

  useEffect(() => {
    if (!settings.enabled) return;

    // 알림이 활성화되면 주기적 체크 시작
    const cleanup = startPeriodicCheck(settings, (result) => {
      console.log('Qimen notification check:', result);
      if (result.notified) {
        // 알림 히스토리에 추가하려면 여기서 처리
      }
    });

    return cleanup;
  }, [settings]);

  const handleRequestPermission = async () => {
    const granted = await requestPermission();
    setHasPermission(granted);

    if (granted) {
      alert('알림 권한이 허용되었습니다!');
    } else {
      alert('알림 권한이 거부되었습니다. 브라우저 설정에서 수동으로 허용해주세요.');
    }
  };

  const handleTestNotification = () => {
    if (!hasPermission) {
      alert('먼저 알림 권한을 허용해주세요.');
      return;
    }

    const notification = sendTestNotification();
    if (notification) {
      alert('테스트 알림이 발송되었습니다!');
    } else {
      alert('알림 발송에 실패했습니다.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-border shadow-2xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <span>🔔</span>
            귀문둔갑 알림 설정
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors text-2xl"
          >
            ×
          </button>
        </div>

        {/* 알림 권한 상태 */}
        {!hasPermission && (
          <div className="mb-6 p-4 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                  알림 권한이 필요합니다
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
                  길한 시간대 알림을 받으려면 브라우저 알림 권한을 허용해야 합니다.
                </p>
                <button
                  onClick={handleRequestPermission}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md text-sm font-medium transition-colors"
                >
                  알림 권한 허용하기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 알림 활성화 토글 */}
        <div className="mb-6 p-4 border border-border rounded-lg bg-muted/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground mb-1">알림 활성화</h3>
              <p className="text-sm text-muted-foreground">
                길한 시간대에 자동으로 알림을 받습니다
              </p>
            </div>
            <button
              onClick={toggleEnabled}
              disabled={!hasPermission}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                settings.enabled && hasPermission
                  ? 'bg-primary-500'
                  : 'bg-gray-300 dark:bg-gray-600'
              } ${!hasPermission ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  settings.enabled && hasPermission ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* 최소 점수 설정 */}
        <div className="mb-6">
          <h3 className="font-semibold text-foreground mb-3">최소 알림 점수</h3>
          <div className="space-y-3">
            <input
              type="range"
              min="0"
              max="100"
              step="10"
              value={settings.minScore}
              onChange={(e) =>
                updateSettings({ minScore: parseInt(e.target.value) })
              }
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary-500"
            />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">점수:</span>
              <span className="text-lg font-bold text-primary-500">
                {settings.minScore}점 이상
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {settings.minScore >= 80 && '🌟 대길 (大吉) 시간대에만 알림'}
              {settings.minScore >= 60 && settings.minScore < 80 && '✨ 길 (吉) 이상 시간대에 알림'}
              {settings.minScore >= 40 && settings.minScore < 60 && '⚖️ 평 (平) 이상 시간대에 알림'}
              {settings.minScore < 40 && '⚠️ 모든 시간대에 알림 (권장하지 않음)'}
            </p>
          </div>
        </div>

        {/* 시간 범위 설정 */}
        <div className="mb-6">
          <h3 className="font-semibold text-foreground mb-3">알림 받을 시간대</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-2">
                시작 시간
              </label>
              <input
                type="time"
                value={settings.timeRange.start}
                onChange={(e) =>
                  updateSettings({
                    timeRange: { ...settings.timeRange, start: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-2">
                종료 시간
              </label>
              <input
                type="time"
                value={settings.timeRange.end}
                onChange={(e) =>
                  updateSettings({
                    timeRange: { ...settings.timeRange, end: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {settings.timeRange.start} ~ {settings.timeRange.end} 사이에만 알림을 받습니다
          </p>
        </div>

        {/* 알림 빈도 설정 */}
        <div className="mb-6">
          <h3 className="font-semibold text-foreground mb-3">알림 빈도</h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'realtime', label: '실시간', desc: '5분마다' },
              { value: 'hourly', label: '시간마다', desc: '1시간마다' },
              { value: 'daily', label: '하루 1회', desc: '24시간마다' },
            ].map((freq) => (
              <button
                key={freq.value}
                onClick={() =>
                  updateSettings({ frequency: freq.value as any })
                }
                className={`p-3 border rounded-lg text-center transition-colors ${
                  settings.frequency === freq.value
                    ? 'border-primary-500 bg-primary-500/10 text-primary-600'
                    : 'border-border hover:border-primary-300 hover:bg-muted/50'
                }`}
              >
                <div className="font-semibold text-sm">{freq.label}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {freq.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 알림 히스토리 */}
        {history.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground">알림 기록</h3>
              <button
                onClick={clearHistory}
                className="text-sm text-red-500 hover:text-red-700 transition-colors"
              >
                기록 삭제
              </button>
            </div>
            <div className="max-h-40 overflow-y-auto space-y-2 border border-border rounded-lg p-3 bg-muted/10">
              {history.slice(0, 10).map((item) => (
                <div
                  key={item.id}
                  className="text-sm flex items-start gap-2 pb-2 border-b border-border last:border-b-0 last:pb-0"
                >
                  <span className="text-xs text-muted-foreground">
                    {new Date(item.createdAt).toLocaleString('ko-KR', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <span className="flex-1 text-foreground">{item.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="flex gap-3">
          <button
            onClick={handleTestNotification}
            disabled={!hasPermission}
            className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-md font-medium transition-colors"
          >
            테스트 알림
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-md font-medium transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
