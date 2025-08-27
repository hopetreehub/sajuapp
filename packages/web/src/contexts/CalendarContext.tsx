import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { ViewMode, UserSettings } from '@/types/calendar'
import { CalendarEvent } from '@/services/api'
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns'

interface CalendarContextType {
  currentDate: Date
  viewMode: ViewMode
  events: CalendarEvent[]
  selectedDate: Date | null
  settings: UserSettings
  
  setCurrentDate: (date: Date) => void
  setViewMode: (mode: ViewMode) => void
  setSelectedDate: (date: Date | null) => void
  navigatePrevious: () => void
  navigateNext: () => void
  navigateToday: () => void
  addEvent: (event: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'>) => void
  updateEvent: (id: string, event: Partial<CalendarEvent>) => void
  deleteEvent: (id: string) => void
  getEventsForDateRange: (start: Date, end: Date) => CalendarEvent[]
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined)

export const useCalendar = () => {
  const context = useContext(CalendarContext)
  if (!context) {
    throw new Error('useCalendar must be used within a CalendarProvider')
  }
  return context
}

interface CalendarProviderProps {
  children: ReactNode
}

export const CalendarProvider: React.FC<CalendarProviderProps> = ({ children }) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [events, setEvents] = useState<CalendarEvent[]>([])
  
  const [settings] = useState<UserSettings>({
    timezone: 'Asia/Seoul',
    weekStartsOn: 0,
    defaultView: 'month',
    showLunarCalendar: true,
    showFortune: true,
    theme: 'light',
    language: 'ko'
  })

  const navigatePrevious = useCallback(() => {
    const newDate = new Date(currentDate)
    
    switch (viewMode) {
      case 'year':
        newDate.setFullYear(currentDate.getFullYear() - 1)
        break
      case 'month':
        newDate.setMonth(currentDate.getMonth() - 1)
        break
      case 'week':
        newDate.setDate(currentDate.getDate() - 7)
        break
      case 'day':
        newDate.setDate(currentDate.getDate() - 1)
        break
    }
    
    setCurrentDate(newDate)
  }, [currentDate, viewMode])

  const navigateNext = useCallback(() => {
    const newDate = new Date(currentDate)
    
    switch (viewMode) {
      case 'year':
        newDate.setFullYear(currentDate.getFullYear() + 1)
        break
      case 'month':
        newDate.setMonth(currentDate.getMonth() + 1)
        break
      case 'week':
        newDate.setDate(currentDate.getDate() + 7)
        break
      case 'day':
        newDate.setDate(currentDate.getDate() + 1)
        break
    }
    
    setCurrentDate(newDate)
  }, [currentDate, viewMode])

  const navigateToday = useCallback(() => {
    setCurrentDate(new Date())
  }, [])

  const addEvent = useCallback((eventData: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'>) => {
    const newEvent: CalendarEvent = {
      ...eventData,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    setEvents(prev => [...prev, newEvent])
  }, [])

  const updateEvent = useCallback((id: string, eventData: Partial<CalendarEvent>) => {
    setEvents(prev => prev.map(event => 
      event.id === id 
        ? { ...event, ...eventData, updated_at: new Date().toISOString() }
        : event
    ))
  }, [])

  const deleteEvent = useCallback((id: string) => {
    setEvents(prev => prev.filter(event => event.id !== id))
  }, [])

  const getEventsForDateRange = useCallback((start: Date, end: Date) => {
    return events.filter(event => {
      const eventStart = new Date(event.start_time)
      const eventEnd = new Date(event.end_time)
      return (
        (eventStart >= start && eventStart <= end) ||
        (eventEnd >= start && eventEnd <= end) ||
        (eventStart <= start && eventEnd >= end)
      )
    })
  }, [events])

  const value = {
    currentDate,
    viewMode,
    events,
    selectedDate,
    settings,
    setCurrentDate,
    setViewMode,
    setSelectedDate,
    navigatePrevious,
    navigateNext,
    navigateToday,
    addEvent,
    updateEvent,
    deleteEvent,
    getEventsForDateRange
  }

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  )
}