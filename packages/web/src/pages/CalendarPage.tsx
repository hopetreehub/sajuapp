import { useState, useEffect } from 'react'
import { useCalendar } from '@/contexts/CalendarContext'
import MonthView from '@/components/Calendar/MonthView'
import WeekView from '@/components/Calendar/WeekView'
import DayView from '@/components/Calendar/DayView'
import YearView from '@/components/Calendar/YearView'
import EventModal from '@/components/EventModal'
import { CalendarEvent, eventService } from '@/services/api'

export default function CalendarPage() {
  const { viewMode } = useCalendar()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      const data = await eventService.getEvents()
      setEvents(data)
    } catch (error) {
      console.error('Failed to load events:', error)
    }
  }

  const handleCreateEvent = (date?: Date) => {
    setSelectedDate(date || null)
    setSelectedEvent(null)
    setIsModalOpen(true)
  }

  const handleEditEvent = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setIsModalOpen(true)
  }

  const handleSaveEvent = (event: CalendarEvent) => {
    loadEvents()
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedEvent(null)
    setSelectedDate(null)
  }

  const renderView = () => {
    const viewProps = {
      events,
      onCreateEvent: handleCreateEvent,
      onEditEvent: handleEditEvent,
    }

    switch (viewMode) {
      case 'year':
        return <YearView {...viewProps} />
      case 'month':
        return <MonthView {...viewProps} />
      case 'week':
        return <WeekView {...viewProps} />
      case 'day':
        return <DayView {...viewProps} />
      default:
        return <MonthView {...viewProps} />
    }
  }

  return (
    <>
      <div className="h-[calc(100vh-4rem)] overflow-hidden">
        {renderView()}
      </div>
      <EventModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveEvent}
        event={selectedEvent}
        initialDate={selectedDate || undefined}
      />
    </>
  )
}