import { diaryService, eventService } from './api';
import { Todo } from '@/types/todo';

export interface SearchOptions {
  query: string
  categories?: ('events' | 'todos' | 'diaries' | 'tags')[]
  startDate?: string
  endDate?: string
  limit?: number
  sortBy?: 'relevance' | 'date'
}

export interface SearchResult {
  type: 'event' | 'todo' | 'diary' | 'tag'
  id: string
  title: string
  content?: string
  date?: string
  highlight?: string
  score?: number
  data?: any // 원본 데이터
}

// 검색어 하이라이팅
const highlightText = (text: string, query: string): string => {
  if (!text || !query) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
};

// 관련도 점수 계산
const calculateScore = (item: any, query: string): number => {
  let score = 0;
  const lowerQuery = query.toLowerCase();
  
  // 제목 매치 (높은 점수)
  if (item.title?.toLowerCase().includes(lowerQuery)) {
    score += 10;
  }
  
  // 내용 매치 (중간 점수)
  if (item.content?.toLowerCase().includes(lowerQuery) || 
      item.description?.toLowerCase().includes(lowerQuery)) {
    score += 5;
  }
  
  // 태그 매치 (낮은 점수)
  if (Array.isArray(item.tags)) {
    item.tags.forEach((tag: any) => {
      const tagName = typeof tag === 'string' ? tag : tag.name;
      if (tagName?.toLowerCase().includes(lowerQuery)) {
        score += 3;
      }
    });
  }
  
  return score;
};

// 이벤트 검색
const searchEvents = async (options: SearchOptions): Promise<SearchResult[]> => {
  try {
    const events = await eventService.getEvents({
      start_date: options.startDate,
      end_date: options.endDate,
    });
    
    return events
      .filter(event => {
        const query = options.query.toLowerCase();
        return event.title.toLowerCase().includes(query) ||
               event.description?.toLowerCase().includes(query);
      })
      .map(event => ({
        type: 'event' as const,
        id: event.id || '',
        title: event.title,
        content: event.description,
        date: event.start_time,
        highlight: highlightText(event.title, options.query),
        score: calculateScore(event, options.query),
        data: event,
      }))
      .slice(0, options.limit || 10);
  } catch (error) {
    console.error('Failed to search events:', error);
    return [];
  }
};

// 할일 검색 (로컬 스토리지)
const searchTodos = (todos: Todo[], options: SearchOptions): SearchResult[] => {
  const query = options.query.toLowerCase();
  
  return todos
    .filter(todo => {
      const title = todo.title || todo.text;
      const matchesQuery = title.toLowerCase().includes(query) ||
                          todo.description?.toLowerCase().includes(query);
      
      const matchesDate = (!options.startDate || new Date(todo.date) >= new Date(options.startDate)) &&
                         (!options.endDate || new Date(todo.date) <= new Date(options.endDate));
      
      return matchesQuery && matchesDate;
    })
    .map(todo => {
      const title = todo.title || todo.text;
      return {
        type: 'todo' as const,
        id: todo.id,
        title,
        content: todo.description,
        date: todo.date,
        highlight: highlightText(title, options.query),
      score: calculateScore(todo, options.query),
      data: todo,
    };
  })
    .slice(0, options.limit || 10);
};

// 일기 검색
const searchDiaries = async (options: SearchOptions): Promise<SearchResult[]> => {
  try {
    const response = await diaryService.searchDiaries({
      q: options.query,
      startDate: options.startDate,
      endDate: options.endDate,
    });
    
    return response
      .map(diary => ({
        type: 'diary' as const,
        id: diary.id || '',
        title: `${diary.date} 일기`,
        content: diary.content,
        date: diary.date,
        highlight: highlightText(diary.content.substring(0, 100), options.query),
        score: calculateScore(diary, options.query),
        data: diary,
      }))
      .slice(0, options.limit || 10);
  } catch (error) {
    console.error('Failed to search diaries:', error);
    return [];
  }
};

// 결과 병합 및 정렬
const mergeAndSortResults = (results: SearchResult[], options: SearchOptions): SearchResult[] => {
  // 정렬
  const sorted = [...results].sort((a, b) => {
    if (options.sortBy === 'date') {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA; // 최신순
    } else {
      // 관련도순
      return (b.score || 0) - (a.score || 0);
    }
  });
  
  // 제한
  return sorted.slice(0, options.limit || 20);
};

// 통합 검색 서비스
export const searchService = {
  // 통합 검색
  searchAll: async (options: SearchOptions, todos: Todo[] = []): Promise<SearchResult[]> => {
    const categories = options.categories || ['events', 'todos', 'diaries'];
    const results: SearchResult[] = [];
    
    // 병렬 검색
    const promises: Promise<SearchResult[]>[] = [];
    
    if (categories.includes('events')) {
      promises.push(searchEvents(options));
    }
    
    if (categories.includes('diaries')) {
      promises.push(searchDiaries(options));
    }
    
    const asyncResults = await Promise.all(promises);
    results.push(...asyncResults.flat());
    
    // 할일은 동기적으로 처리
    if (categories.includes('todos')) {
      results.push(...searchTodos(todos, options));
    }
    
    return mergeAndSortResults(results, options);
  },
  
  // 개별 검색 메서드
  searchEvents,
  searchTodos,
  searchDiaries,
};

export default searchService;