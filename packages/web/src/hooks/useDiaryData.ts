import { useState, useEffect, useCallback } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns';
import { DiaryEntry, diaryService } from '@/services/api';

interface DiaryDataState {
  diaries: DiaryEntry[];
  diaryDates: Set<string>; // Set of dates (YYYY-MM-DD) that have diary entries
  loading: boolean;
  error: string | null;
}

interface UseDiaryDataOptions {
  viewMode: 'year' | 'month' | 'week' | 'day';
  currentDate: Date;
}

export const useDiaryData = ({ viewMode, currentDate }: UseDiaryDataOptions) => {
  const [state, setState] = useState<DiaryDataState>({
    diaries: [],
    diaryDates: new Set(),
    loading: false,
    error: null,
  });

  // Calculate date range based on view mode
  const getDateRange = useCallback(() => {
    let startDate: Date;
    let endDate: Date;

    switch (viewMode) {
      case 'year':
        startDate = new Date(currentDate.getFullYear(), 0, 1);
        endDate = new Date(currentDate.getFullYear(), 11, 31);
        break;
      case 'month':
        startDate = startOfMonth(currentDate);
        endDate = endOfMonth(currentDate);
        break;
      case 'week':
        startDate = startOfWeek(currentDate, { weekStartsOn: 0 });
        endDate = endOfWeek(currentDate, { weekStartsOn: 0 });
        break;
      case 'day':
        startDate = currentDate;
        endDate = currentDate;
        break;
      default:
        startDate = startOfMonth(currentDate);
        endDate = endOfMonth(currentDate);
    }

    return {
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd'),
    };
  }, [viewMode, currentDate]);

  // Load diary data for current view
  const loadDiaries = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const { startDate, endDate } = getDateRange();
      const diaries = await diaryService.getDiariesForDateRange(startDate, endDate);
      
      // Create a set of dates that have diary entries (only if content or images exist)
      const diaryDates = new Set<string>();
      diaries.forEach(diary => {
        if (diary.date && ((diary.content && diary.content.trim()) || (diary.images && diary.images.length > 0))) {
          diaryDates.add(diary.date);
        }
      });

      setState({
        diaries,
        diaryDates,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Failed to load diaries:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load diary entries',
      }));
    }
  }, [getDateRange]);

  // Check if a specific date has a diary entry
  const hasDiary = useCallback((date: Date | string): boolean => {
    const dateString = typeof date === 'string' ? date : format(date, 'yyyy-MM-dd');
    return state.diaryDates.has(dateString);
  }, [state.diaryDates]);

  // Get diary for a specific date
  const getDiaryForDate = useCallback((date: Date | string): DiaryEntry | undefined => {
    const dateString = typeof date === 'string' ? date : format(date, 'yyyy-MM-dd');
    return state.diaries.find(diary => diary.date === dateString);
  }, [state.diaries]);

  // Reload diaries when view mode or current date changes
  useEffect(() => {
    loadDiaries();
  }, [loadDiaries]);

  return {
    diaries: state.diaries,
    diaryDates: state.diaryDates,
    loading: state.loading,
    error: state.error,
    hasDiary,
    getDiaryForDate,
    reloadDiaries: loadDiaries,
  };
};