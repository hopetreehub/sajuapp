import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * 귀문둔갑 알림 설정
 */
export interface QimenNotificationSettings {
  /** 알림 활성화 여부 */
  enabled: boolean;

  /** 알림 받을 목적 (비어있으면 모든 목적) */
  contexts: string[];  // 'general', 'business', 'love', etc.

  /** 최소 점수 (이 점수 이상만 알림) */
  minScore: number;

  /** 알림 받을 시간대 */
  timeRange: {
    start: string;  // "09:00"
    end: string;    // "18:00"
  };

  /** 알림 빈도 */
  frequency: 'realtime' | 'hourly' | 'daily';

  /** 브라우저 알림 권한 상태 */
  permissionGranted: boolean;

  /** 마지막 체크 시간 */
  lastCheckTime: Date | null;
}

/**
 * 알림 히스토리 항목
 */
export interface QimenNotificationHistory {
  id: string;
  dateTime: Date;
  score: number;
  context: string;
  message: string;
  clicked: boolean;
  createdAt: Date;
}

interface QimenNotificationStore {
  /** 알림 설정 */
  settings: QimenNotificationSettings;

  /** 알림 히스토리 (최대 100개) */
  history: QimenNotificationHistory[];

  /** 설정 업데이트 */
  updateSettings: (settings: Partial<QimenNotificationSettings>) => void;

  /** 알림 활성화/비활성화 토글 */
  toggleEnabled: () => void;

  /** 브라우저 알림 권한 요청 */
  requestPermission: () => Promise<boolean>;

  /** 알림 히스토리 추가 */
  addHistory: (item: Omit<QimenNotificationHistory, 'id' | 'createdAt' | 'clicked'>) => void;

  /** 알림 클릭 처리 */
  markAsClicked: (id: string) => void;

  /** 히스토리 초기화 */
  clearHistory: () => void;

  /** 마지막 체크 시간 업데이트 */
  updateLastCheckTime: () => void;

  /** 알림 설정 초기화 */
  resetSettings: () => void;
}

const defaultSettings: QimenNotificationSettings = {
  enabled: false,
  contexts: [], // 비어있으면 모든 목적
  minScore: 80,  // 대길 (excellent) 등급
  timeRange: {
    start: '09:00',
    end: '18:00',
  },
  frequency: 'hourly',
  permissionGranted: false,
  lastCheckTime: null,
};

export const useQimenNotificationStore = create<QimenNotificationStore>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      history: [],

      updateSettings: (newSettings) => {
        set((state) => ({
          settings: {
            ...state.settings,
            ...newSettings,
          },
        }));
      },

      toggleEnabled: () => {
        set((state) => ({
          settings: {
            ...state.settings,
            enabled: !state.settings.enabled,
          },
        }));
      },

      requestPermission: async () => {
        if (!('Notification' in window)) {
          console.warn('This browser does not support notifications');
          return false;
        }

        if (Notification.permission === 'granted') {
          set((state) => ({
            settings: {
              ...state.settings,
              permissionGranted: true,
            },
          }));
          return true;
        }

        if (Notification.permission !== 'denied') {
          try {
            const permission = await Notification.requestPermission();
            const granted = permission === 'granted';

            set((state) => ({
              settings: {
                ...state.settings,
                permissionGranted: granted,
              },
            }));

            return granted;
          } catch (error) {
            console.error('Failed to request notification permission:', error);
            return false;
          }
        }

        return false;
      },

      addHistory: (item) => {
        const newItem: QimenNotificationHistory = {
          ...item,
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          clicked: false,
          createdAt: new Date(),
        };

        set((state) => {
          const updatedHistory = [newItem, ...state.history].slice(0, 100); // 최대 100개
          return { history: updatedHistory };
        });
      },

      markAsClicked: (id) => {
        set((state) => ({
          history: state.history.map((item) =>
            item.id === id ? { ...item, clicked: true } : item
          ),
        }));
      },

      clearHistory: () => {
        set({ history: [] });
      },

      updateLastCheckTime: () => {
        set((state) => ({
          settings: {
            ...state.settings,
            lastCheckTime: new Date(),
          },
        }));
      },

      resetSettings: () => {
        set({
          settings: defaultSettings,
          history: [],
        });
      },
    }),
    {
      name: 'qimen-notification-storage',
      version: 1,
    }
  )
);
