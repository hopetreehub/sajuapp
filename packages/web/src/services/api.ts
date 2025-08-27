import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4012';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface CalendarEvent {
  id?: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  all_day: boolean;
  location?: string;
  type?: 'personal' | 'work' | 'holiday' | 'other';
  color?: string;
  reminder_minutes?: number;
  created_at?: string;
  updated_at?: string;
}

export const eventService = {
  // Get all events
  getEvents: async (params?: {
    start_date?: string;
    end_date?: string;
    type?: string;
  }): Promise<CalendarEvent[]> => {
    const response = await api.get('/api/calendar/events', { params });
    return response.data.data || [];
  },

  // Get single event
  getEvent: async (id: string): Promise<CalendarEvent> => {
    const response = await api.get(`/api/calendar/events/${id}`);
    return response.data.data;
  },

  // Create event
  createEvent: async (event: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'>): Promise<CalendarEvent> => {
    const response = await api.post('/api/calendar/events', event);
    return response.data.data;
  },

  // Update event
  updateEvent: async (id: string, event: Partial<CalendarEvent>): Promise<CalendarEvent> => {
    const response = await api.put(`/api/calendar/events/${id}`, event);
    return response.data.data;
  },

  // Delete event
  deleteEvent: async (id: string): Promise<void> => {
    await api.delete(`/api/calendar/events/${id}`);
  },
};

export default api;