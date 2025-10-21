import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { format } from 'date-fns';
import { ViewMode, UserSettings } from '@/types/calendar';
import { Todo } from '@/types/todo';
import { CalendarEvent, todoService, Todo as ApiTodo } from '@/services/api';

// Todo 타입을 다시 export 하여 다른 컴포넌트에서 사용할 수 있도록 함
export type { Todo };

interface CalendarContextType {
  currentDate: Date
  viewMode: ViewMode
  events: CalendarEvent[]
  selectedDate: Date | null
  settings: UserSettings
  todos: Todo[]
  
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
  
  // 할일 관련 함수들
  addTodo: (todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateTodo: (id: string, updates: Partial<Todo>) => void
  deleteTodo: (id: string) => void
  toggleTodo: (id: string) => void
  getTodosForDate: (date: Date) => Todo[]
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export const useCalendar = () => {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
};

interface CalendarProviderProps {
  children: ReactNode
}

export const CalendarProvider: React.FC<CalendarProviderProps> = ({ children }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [_isLoadingTodos, _setIsLoadingTodos] = useState(false);

  const [settings] = useState<UserSettings>({
    timezone: 'Asia/Seoul',
    weekStartsOn: 0,
    defaultView: 'month',
    showLunarCalendar: true,
    showFortune: true,
    theme: 'light',
    language: 'ko',
  });

  // API Todo를 로컬 Todo 형식으로 변환
  const convertApiTodoToLocal = (apiTodo: ApiTodo): Todo => ({
    id: apiTodo.id,
    text: apiTodo.title,
    title: apiTodo.title,
    description: apiTodo.description,
    completed: apiTodo.completed === 1 || apiTodo.completed === true,
    priority: apiTodo.priority,
    date: apiTodo.date,
    createdAt: apiTodo.created_at,
    updatedAt: apiTodo.updated_at,
  });

  // 로컬 Todo를 API Todo 형식으로 변환
  const convertLocalTodoToApi = (todo: Partial<Todo>) => ({
    title: todo.text || todo.title || '',
    description: todo.description,
    date: todo.date || '',
    priority: todo.priority || 'medium',
    completed: todo.completed ? 1 : 0,
  });

  // 초기 할일 로드
  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    try {
      setIsLoadingTodos(true);
      const apiTodos = await todoService.getTodos();
      const localTodos = apiTodos.map(convertApiTodoToLocal);
      setTodos(localTodos);
    } catch (error) {
      console.error('Failed to load todos:', error);
    } finally {
      setIsLoadingTodos(false);
    }
  };

  const navigatePrevious = useCallback(() => {
    const newDate = new Date(currentDate);
    
    switch (viewMode) {
      case 'year':
        newDate.setFullYear(currentDate.getFullYear() - 1);
        break;
      case 'month':
        newDate.setMonth(currentDate.getMonth() - 1);
        break;
      case 'week':
        newDate.setDate(currentDate.getDate() - 7);
        break;
      case 'day':
        newDate.setDate(currentDate.getDate() - 1);
        break;
    }
    
    setCurrentDate(newDate);
  }, [currentDate, viewMode]);

  const navigateNext = useCallback(() => {
    const newDate = new Date(currentDate);
    
    switch (viewMode) {
      case 'year':
        newDate.setFullYear(currentDate.getFullYear() + 1);
        break;
      case 'month':
        newDate.setMonth(currentDate.getMonth() + 1);
        break;
      case 'week':
        newDate.setDate(currentDate.getDate() + 7);
        break;
      case 'day':
        newDate.setDate(currentDate.getDate() + 1);
        break;
    }
    
    setCurrentDate(newDate);
  }, [currentDate, viewMode]);

  const navigateToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const addEvent = useCallback((eventData: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'>) => {
    const newEvent: CalendarEvent = {
      ...eventData,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setEvents(prev => [...prev, newEvent]);
  }, []);

  const updateEvent = useCallback((id: string, eventData: Partial<CalendarEvent>) => {
    setEvents(prev => prev.map(event => 
      event.id === id 
        ? { ...event, ...eventData, updated_at: new Date().toISOString() }
        : event,
    ));
  }, []);

  const deleteEvent = useCallback((id: string) => {
    setEvents(prev => prev.filter(event => event.id !== id));
  }, []);

  const getEventsForDateRange = useCallback((start: Date, end: Date) => {
    return events.filter(event => {
      const eventStart = new Date(event.start_time);
      const eventEnd = new Date(event.end_time);
      return (
        (eventStart >= start && eventStart <= end) ||
        (eventEnd >= start && eventEnd <= end) ||
        (eventStart <= start && eventEnd >= end)
      );
    });
  }, [events]);

  const addTodo = useCallback(async (todoData: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const apiTodoData = convertLocalTodoToApi(todoData);
      const createdTodo = await todoService.createTodo(apiTodoData);
      const localTodo = convertApiTodoToLocal(createdTodo);
      setTodos(prev => [...prev, localTodo]);
      return localTodo;
    } catch (error) {
      console.error('Failed to add todo:', error);
      // 실패 시 로컬에만 추가 (fallback)
      const newTodo: Todo = {
        ...todoData,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setTodos(prev => [...prev, newTodo]);
      return newTodo;
    }
  }, []);

  const updateTodo = useCallback(async (id: string, updates: Partial<Todo>) => {
    try {
      const apiUpdates = convertLocalTodoToApi(updates);
      const updatedTodo = await todoService.updateTodo(id, apiUpdates);
      const localTodo = convertApiTodoToLocal(updatedTodo);
      setTodos(prev => prev.map(todo =>
        todo.id === id ? localTodo : todo,
      ));
    } catch (error) {
      console.error('Failed to update todo:', error);
      // 실패 시 로컬만 업데이트 (fallback)
      setTodos(prev => prev.map(todo =>
        todo.id === id
          ? { ...todo, ...updates, updatedAt: new Date() }
          : todo,
      ));
    }
  }, []);

  const deleteTodo = useCallback(async (id: string) => {
    try {
      await todoService.deleteTodo(id);
      setTodos(prev => prev.filter(todo => todo.id !== id));
    } catch (error) {
      console.error('Failed to delete todo:', error);
      // 실패 시에도 로컬에서 제거
      setTodos(prev => prev.filter(todo => todo.id !== id));
    }
  }, []);

  const toggleTodo = useCallback(async (id: string) => {
    try {
      const updatedTodo = await todoService.toggleTodo(id);
      const localTodo = convertApiTodoToLocal(updatedTodo);
      setTodos(prev => prev.map(todo =>
        todo.id === id ? localTodo : todo,
      ));
    } catch (error) {
      console.error('Failed to toggle todo:', error);
      // 실패 시 로컬만 토글 (fallback)
      setTodos(prev => prev.map(todo =>
        todo.id === id
          ? { ...todo, completed: !todo.completed, updatedAt: new Date() }
          : todo,
      ));
    }
  }, []);

  const getTodosForDate = useCallback((date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return todos.filter(todo => todo.date === dateStr);
  }, [todos]);

  const value = {
    currentDate,
    viewMode,
    events,
    selectedDate,
    settings,
    todos,
    setCurrentDate,
    setViewMode,
    setSelectedDate,
    navigatePrevious,
    navigateNext,
    navigateToday,
    addEvent,
    updateEvent,
    deleteEvent,
    getEventsForDateRange,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    getTodosForDate,
  };

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
};