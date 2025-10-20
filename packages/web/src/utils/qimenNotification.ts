import { calculateQimenChart } from './qimenCalculator';
import type { QimenChart, Fortune } from '@/types/qimen';
import type { QimenNotificationSettings } from '@/stores/qimenNotificationStore';

/**
 * 브라우저 알림 권한 확인
 */
export function hasNotificationPermission(): boolean {
  if (!('Notification' in window)) {
    return false;
  }
  return Notification.permission === 'granted';
}

/**
 * 브라우저 알림 권한 요청
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  }

  return false;
}

/**
 * Fortune 레벨을 한글로 변환
 */
function getFortuneLabel(fortune: Fortune): string {
  const labels: Record<Fortune, string> = {
    excellent: '대길 (大吉)',
    good: '길 (吉)',
    neutral: '평 (平)',
    bad: '흉 (凶)',
    terrible: '대흉 (大凶)',
  };
  return labels[fortune];
}

/**
 * Fortune 레벨에 따른 이모지 아이콘
 */
function getFortuneEmoji(fortune: Fortune): string {
  const emojis: Record<Fortune, string> = {
    excellent: '🌟',
    good: '✨',
    neutral: '⚖️',
    bad: '⚠️',
    terrible: '❌',
  };
  return emojis[fortune];
}

/**
 * 브라우저 알림 발송
 */
export function sendNotification(options: {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  data?: any;
  onClick?: () => void;
}): Notification | null {
  if (!hasNotificationPermission()) {
    console.warn('Notification permission not granted');
    return null;
  }

  try {
    const notification = new Notification(options.title, {
      body: options.body,
      icon: options.icon || '/logo192.png',
      tag: options.tag || 'qimen-notification',
      badge: '/logo192.png',
      data: options.data,
      requireInteraction: false, // 자동으로 사라짐
      silent: false, // 소리 있음
    });

    // 클릭 이벤트
    if (options.onClick) {
      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        notification.close();
        options.onClick!();
      };
    } else {
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }

    // 자동 닫기 (5초 후)
    setTimeout(() => {
      notification.close();
    }, 5000);

    return notification;
  } catch (error) {
    console.error('Failed to send notification:', error);
    return null;
  }
}

/**
 * 현재 시간의 귀문둔갑 점수 확인 및 알림 발송
 */
export function checkAndNotify(settings: QimenNotificationSettings): {
  notified: boolean;
  chart: QimenChart | null;
  reason?: string;
} {
  // 알림이 비활성화되어 있으면 리턴
  if (!settings.enabled) {
    return { notified: false, chart: null, reason: 'Notifications disabled' };
  }

  // 브라우저 알림 권한이 없으면 리턴
  if (!hasNotificationPermission()) {
    return { notified: false, chart: null, reason: 'No notification permission' };
  }

  // 현재 시간 가져오기
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;

  // 시간대 체크
  const [startHour, startMinute] = settings.timeRange.start.split(':').map(Number);
  const [endHour, endMinute] = settings.timeRange.end.split(':').map(Number);

  const startTime = startHour * 60 + startMinute;
  const endTime = endHour * 60 + endMinute;
  const currentTime = currentHour * 60 + currentMinute;

  if (currentTime < startTime || currentTime > endTime) {
    return { notified: false, chart: null, reason: 'Outside time range' };
  }

  // 현재 시간의 귀문둔갑 차트 계산
  const chart = calculateQimenChart({ dateTime: now });

  // 점수 체크
  if (chart.overallFortune.score < settings.minScore) {
    return { notified: false, chart, reason: `Score too low (${chart.overallFortune.score} < ${settings.minScore})` };
  }

  // 목적 필터링 (contexts가 비어있으면 모든 목적에 대해 알림)
  // 현재는 목적별 점수가 없으므로 전체 점수만 사용

  // 알림 발송
  const fortuneEmoji = getFortuneEmoji(chart.overallFortune.level);
  const fortuneLabel = getFortuneLabel(chart.overallFortune.level);

  sendNotification({
    title: `${fortuneEmoji} 귀문둔갑 알림`,
    body: `지금이 ${fortuneLabel} 시간대입니다! (점수: ${chart.overallFortune.score}/100)\n${chart.overallFortune.summary}`,
    icon: '/logo192.png',
    tag: 'qimen-good-time',
    data: {
      chart,
      timestamp: now.toISOString(),
    },
    onClick: () => {
      // 귀문둔갑 페이지로 이동
      window.location.href = '/qimen';
    },
  });

  return { notified: true, chart };
}

/**
 * 주기적으로 귀문둔갑 점수 체크 (interval 기반)
 * @param settings 알림 설정
 * @param onCheck 체크 완료 콜백
 * @returns cleanup 함수
 */
export function startPeriodicCheck(
  settings: QimenNotificationSettings,
  onCheck?: (result: ReturnType<typeof checkAndNotify>) => void
): () => void {
  // 빈도에 따른 interval 시간 설정
  let intervalMs: number;

  switch (settings.frequency) {
    case 'realtime':
      intervalMs = 5 * 60 * 1000; // 5분마다
      break;
    case 'hourly':
      intervalMs = 60 * 60 * 1000; // 1시간마다
      break;
    case 'daily':
      intervalMs = 24 * 60 * 60 * 1000; // 24시간마다
      break;
    default:
      intervalMs = 60 * 60 * 1000; // 기본값: 1시간
  }

  // 즉시 한 번 체크
  const initialResult = checkAndNotify(settings);
  if (onCheck) {
    onCheck(initialResult);
  }

  // 주기적 체크 시작
  const intervalId = setInterval(() => {
    const result = checkAndNotify(settings);
    if (onCheck) {
      onCheck(result);
    }
  }, intervalMs);

  // cleanup 함수 반환
  return () => {
    clearInterval(intervalId);
  };
}

/**
 * 테스트 알림 발송
 */
export function sendTestNotification(): Notification | null {
  return sendNotification({
    title: '🔮 귀문둔갑 알림 테스트',
    body: '알림이 정상적으로 작동하고 있습니다!',
    icon: '/logo192.png',
    tag: 'qimen-test',
  });
}
