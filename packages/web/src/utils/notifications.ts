/**
 * 브라우저 알림 시스템 유틸리티
 */

export interface NotificationOptions {
  title: string
  body: string
  icon?: string
  tag?: string
  badge?: string
  data?: any
  requireInteraction?: boolean
  silent?: boolean
}

export interface ScheduledNotification {
  id: string
  title: string
  body: string
  scheduledTime: Date
  type: 'event' | 'diary' | 'todo'
  data?: any
}

// 알림 권한 상태
export type NotificationPermission = 'default' | 'granted' | 'denied'

/**
 * 브라우저 알림 권한 요청
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications')
    return false
  }
  
  if (Notification.permission === 'granted') {
    return true
  }
  
  if (Notification.permission === 'denied') {
    return false
  }
  
  try {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  } catch (error) {
    console.error('Failed to request notification permission:', error)
    return false
  }
}

/**
 * 알림 권한 확인
 */
export const hasNotificationPermission = (): boolean => {
  return 'Notification' in window && Notification.permission === 'granted'
}

/**
 * 즉시 알림 표시
 */
export const showNotification = (options: NotificationOptions): Notification | null => {
  if (!hasNotificationPermission()) {
    console.warn('Notification permission not granted')
    return null
  }
  
  try {
    const notification = new Notification(options.title, {
      body: options.body,
      icon: options.icon || '/favicon.ico',
      tag: options.tag,
      badge: options.badge,
      data: options.data,
      requireInteraction: options.requireInteraction || false,
      silent: options.silent || false
    })
    
    // 자동 닫기 (5초 후)
    if (!options.requireInteraction) {
      setTimeout(() => {
        notification.close()
      }, 5000)
    }
    
    return notification
  } catch (error) {
    console.error('Failed to show notification:', error)
    return null
  }
}

/**
 * 예약된 알림 스케줄링
 */
export const scheduleNotification = (
  title: string, 
  body: string, 
  time: Date, 
  options?: Partial<NotificationOptions>
): number | null => {
  const now = Date.now()
  const targetTime = time.getTime()
  const delay = targetTime - now
  
  if (delay <= 0) {
    console.warn('Cannot schedule notification for past time')
    return null
  }
  
  // 최대 24시간 후까지만 스케줄링 (브라우저 제한)
  const maxDelay = 24 * 60 * 60 * 1000 // 24시간
  if (delay > maxDelay) {
    console.warn('Cannot schedule notification more than 24 hours in advance')
    return null
  }
  
  const timeoutId = window.setTimeout(() => {
    showNotification({
      title,
      body,
      icon: '/favicon.ico',
      requireInteraction: true,
      ...options
    })
  }, delay)
  
  console.log(`Notification scheduled for ${time.toLocaleString()}, delay: ${delay}ms`)
  return timeoutId
}

/**
 * 예약된 알림 취소
 */
export const cancelScheduledNotification = (timeoutId: number): void => {
  if (timeoutId) {
    clearTimeout(timeoutId)
    console.log(`Cancelled scheduled notification ${timeoutId}`)
  }
}

/**
 * 로컬 스토리지를 이용한 알림 설정 관리
 */
const NOTIFICATION_SETTINGS_KEY = 'notification-settings'

export interface NotificationSettings {
  enabled: boolean
  eventReminders: boolean
  diaryReminders: boolean
  todoDeadlines: boolean
  reminderMinutes: number // 몇 분 전에 알림
}

export const getNotificationSettings = (): NotificationSettings => {
  try {
    const saved = localStorage.getItem(NOTIFICATION_SETTINGS_KEY)
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (error) {
    console.error('Failed to load notification settings:', error)
  }
  
  // 기본값
  return {
    enabled: false,
    eventReminders: true,
    diaryReminders: true,
    todoDeadlines: true,
    reminderMinutes: 15
  }
}

export const saveNotificationSettings = (settings: NotificationSettings): void => {
  try {
    localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings))
  } catch (error) {
    console.error('Failed to save notification settings:', error)
  }
}

/**
 * 일정 알림 스케줄링
 */
export const scheduleEventReminder = (event: any): number | null => {
  const settings = getNotificationSettings()
  if (!settings.enabled || !settings.eventReminders) {
    return null
  }
  
  const eventTime = new Date(event.start_time)
  const reminderTime = new Date(eventTime.getTime() - settings.reminderMinutes * 60 * 1000)
  
  return scheduleNotification(
    `📅 ${event.title}`,
    `${settings.reminderMinutes}분 후에 시작됩니다`,
    reminderTime,
    {
      tag: `event-${event.id}`,
      data: { type: 'event', eventId: event.id }
    }
  )
}

/**
 * 일기 작성 리마인더 스케줄링
 */
export const scheduleDiaryReminder = (): number | null => {
  const settings = getNotificationSettings()
  if (!settings.enabled || !settings.diaryReminders) {
    return null
  }
  
  // 매일 저녁 9시에 일기 작성 리마인더
  const now = new Date()
  const reminderTime = new Date()
  reminderTime.setHours(21, 0, 0, 0) // 21:00
  
  // 이미 21시가 지났다면 다음날
  if (now.getHours() >= 21) {
    reminderTime.setDate(reminderTime.getDate() + 1)
  }
  
  return scheduleNotification(
    '📝 일기 작성 시간',
    '오늘 하루는 어떠셨나요? 일기를 작성해보세요.',
    reminderTime,
    {
      tag: 'diary-reminder',
      data: { type: 'diary' },
      requireInteraction: false
    }
  )
}

/**
 * 할일 마감 알림 스케줄링
 */
export const scheduleTodoDeadlineReminder = (todo: any): number | null => {
  const settings = getNotificationSettings()
  if (!settings.enabled || !settings.todoDeadlines) {
    return null
  }
  
  if (!todo.dueDate) return null
  
  const dueTime = new Date(todo.dueDate)
  const reminderTime = new Date(dueTime.getTime() - settings.reminderMinutes * 60 * 1000)
  
  const priorityEmoji = {
    high: '🔴',
    medium: '🟡',
    low: '🟢'
  }[todo.priority as keyof typeof priorityEmoji] || '📋'
  
  return scheduleNotification(
    `${priorityEmoji} ${todo.title}`,
    `${settings.reminderMinutes}분 후 마감됩니다`,
    reminderTime,
    {
      tag: `todo-${todo.id}`,
      data: { type: 'todo', todoId: todo.id }
    }
  )
}

/**
 * 모든 예약된 알림 초기화 (앱 시작 시)
 */
export const initializeNotifications = async (): Promise<void> => {
  const settings = getNotificationSettings()
  
  if (!settings.enabled) {
    return
  }
  
  // 권한 요청
  const hasPermission = await requestNotificationPermission()
  if (!hasPermission) {
    console.warn('Notification permission denied')
    return
  }
  
  // 일기 리마인더 스케줄링
  scheduleDiaryReminder()
  
  console.log('Notifications initialized')
}

/**
 * 테스트 알림 표시 (설정에서 사용)
 */
export const showTestNotification = (): void => {
  showNotification({
    title: '🧭 운명나침반',
    body: '알림이 정상적으로 작동합니다!',
    requireInteraction: false
  })
}