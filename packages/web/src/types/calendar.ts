export type ViewMode = 'year' | 'month' | 'week' | 'day'

export interface CalendarEvent {
  id?: string
  title: string
  description?: string
  start_time: string
  end_time: string
  all_day: boolean
  color?: string
  type?: 'personal' | 'work' | 'holiday' | 'other'
  location?: string
  reminder_minutes?: number
  created_at?: string
  updated_at?: string
}

export interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  interval: number
  endDate?: Date
  daysOfWeek?: number[]
  dayOfMonth?: number
  count?: number
}

export interface Reminder {
  type: 'notification' | 'email'
  minutesBefore: number
}

export type EventCategory = 
  | 'personal' 
  | 'work' 
  | 'family' 
  | 'health' 
  | 'fortune' 
  | 'anniversary' 
  | 'holiday'
  | 'other'

export interface CalendarDate {
  year: number
  month: number
  date: number
  day: number // 0-6 (Sunday to Saturday)
  isToday: boolean
  isCurrentMonth: boolean
  isWeekend: boolean
  lunarDate?: LunarDate
  events: CalendarEvent[]
}

export interface LunarDate {
  year: number
  month: number
  date: number
  isLeapMonth: boolean
  zodiac: string
  ganzi: {
    year: string
    month: string
    day: string
  }
}

export interface DiaryEntry {
  id: string
  date: string // YYYY-MM-DD
  content: string
  mood?: 1 | 2 | 3 | 4 | 5
  weather?: string
  tags?: string[]
  linkedEvents?: string[]
  fortuneData?: any
  createdAt: Date
  updatedAt: Date
}

export interface UserSettings {
  timezone: string
  weekStartsOn: 0 | 1 // 0: Sunday, 1: Monday
  defaultView: ViewMode
  showLunarCalendar: boolean
  showFortune: boolean
  theme: 'light' | 'dark' | 'system'
  language: 'ko' | 'en'
}