import { diaryService, eventService } from './api';
import { Todo } from '@/types/todo';
import { calculateKoreanScore, matchChosung, highlightKoreanText } from '@/utils/koreanSearch';

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
const _highlightText = (text: string, query: string): string => {
  if (!text || !query) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
};

// 관련도 점수 계산 (한국어 검색 지원)
const calculateScore = (item: any, query: string): number => {
  let score = 0;
  const lowerQuery = query.toLowerCase();

  // 제목 매치 (높은 점수)
  const title = item.title || '';
  if (title.toLowerCase().includes(lowerQuery)) {
    score += 100; // 완전 일치
  } else {
    score += calculateKoreanScore(title, query) * 0.8; // 한국어 검색 점수
  }

  // 내용 매치 (중간 점수)
  const content = item.content || item.description || '';
  if (content.toLowerCase().includes(lowerQuery)) {
    score += 50;
  } else {
    score += calculateKoreanScore(content, query) * 0.5;
  }

  // 태그 매치 (낮은 점수)
  if (Array.isArray(item.tags)) {
    item.tags.forEach((tag: any) => {
      const tagName = typeof tag === 'string' ? tag : tag.name;
      if (tagName) {
        if (tagName.toLowerCase().includes(lowerQuery)) {
          score += 30;
        } else {
          score += calculateKoreanScore(tagName, query) * 0.3;
        }
      }
    });
  }

  // 초성 매칭 보너스
  if (matchChosung(title, query)) {
    score += 20;
  }
  if (matchChosung(content, query)) {
    score += 10;
  }

  return Math.round(score);
};

// 이벤트 검색 (타임아웃 및 에러 처리 강화)
const searchEvents = async (options: SearchOptions): Promise<SearchResult[]> => {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Events search timeout')), 5000);
  });

  try {
    const eventsPromise = eventService.getEvents({
      start_date: options.startDate,
      end_date: options.endDate,
    });

    const events = await Promise.race([eventsPromise, timeoutPromise]);
    
    return events
      .filter(event => {
        const query = options.query.toLowerCase();
        const title = event.title || '';
        const description = event.description || '';

        // 기본 텍스트 매칭
        const basicMatch = title.toLowerCase().includes(query) ||
                          description.toLowerCase().includes(query);

        // 한국어 검색 매칭
        const koreanMatch = matchChosung(title, options.query) ||
                           matchChosung(description, options.query) ||
                           calculateKoreanScore(title, options.query) > 10 ||
                           calculateKoreanScore(description, options.query) > 10;

        return basicMatch || koreanMatch;
      })
      .map(event => ({
        type: 'event' as const,
        id: event.id || '',
        title: event.title,
        content: event.description,
        date: event.start_time,
        highlight: highlightKoreanText(event.title, options.query),
        score: calculateScore(event, options.query),
        data: event,
      }))
      .slice(0, options.limit || 10);
  } catch (error) {
    if (error instanceof Error && error.message === 'Events search timeout') {
      console.warn('Events search timed out');
    } else {
      console.error('Failed to search events:', error);
    }
    return [];
  }
};

// 할일 검색 (로컬 스토리지)
const searchTodos = (todos: Todo[], options: SearchOptions): SearchResult[] => {
  const query = options.query.toLowerCase();
  
  return todos
    .filter(todo => {
      const title = todo.title || todo.text || '';
      const description = todo.description || '';

      // 기본 텍스트 매칭
      const basicMatch = title.toLowerCase().includes(query) ||
                        description.toLowerCase().includes(query);

      // 한국어 검색 매칭
      const koreanMatch = matchChosung(title, options.query) ||
                         matchChosung(description, options.query) ||
                         calculateKoreanScore(title, options.query) > 10 ||
                         calculateKoreanScore(description, options.query) > 10;

      const matchesQuery = basicMatch || koreanMatch;

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
        highlight: highlightKoreanText(title, options.query),
      score: calculateScore(todo, options.query),
      data: todo,
    };
  })
    .slice(0, options.limit || 10);
};

// 일기 검색 (타임아웃 및 에러 처리 강화)
const searchDiaries = async (options: SearchOptions): Promise<SearchResult[]> => {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Diaries search timeout')), 5000);
  });

  try {
    const diariesPromise = diaryService.searchDiaries({
      q: options.query,
      startDate: options.startDate,
      endDate: options.endDate,
    });

    const response = await Promise.race([diariesPromise, timeoutPromise]);
    
    return response
      .map(diary => ({
        type: 'diary' as const,
        id: diary.id || '',
        title: `${diary.date} 일기`,
        content: diary.content,
        date: diary.date,
        highlight: highlightKoreanText(diary.content.substring(0, 100), options.query),
        score: calculateScore(diary, options.query),
        data: diary,
      }))
      .slice(0, options.limit || 10);
  } catch (error) {
    if (error instanceof Error && error.message === 'Diaries search timeout') {
      console.warn('Diaries search timed out');
    } else {
      console.error('Failed to search diaries:', error);
    }
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
  // 통합 검색 (성능 최적화 및 에러 처리 강화)
  searchAll: async (options: SearchOptions, todos: Todo[] = []): Promise<SearchResult[]> => {
    const startTime = performance.now();

    try {
      // 입력 검증
      if (!options.query || options.query.trim().length < 1) {
        return [];
      }

      // 너무 긴 검색어 제한 (성능상 이유)
      if (options.query.length > 100) {
        throw new Error('검색어가 너무 깁니다. 100자 이하로 입력해주세요.');
      }

      const categories = options.categories || ['events', 'todos', 'diaries'];
      const results: SearchResult[] = [];

      // 병렬 검색 (Promise.allSettled로 에러 처리 강화)
      const promises: Promise<SearchResult[]>[] = [];

      if (categories.includes('events')) {
        promises.push(searchEvents(options));
      }

      if (categories.includes('diaries')) {
        promises.push(searchDiaries(options));
      }

      // Promise.allSettled로 일부 실패해도 다른 결과는 받을 수 있도록
      const asyncResults = await Promise.allSettled(promises);

      asyncResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(...result.value);
        } else {
          console.warn(`Search failed for category ${index}:`, result.reason);
        }
      });

      // 할일은 동기적으로 처리 (try-catch로 감싸기)
      if (categories.includes('todos')) {
        try {
          const todoResults = searchTodos(todos, options);
          results.push(...todoResults);
        } catch (error) {
          console.warn('Todo search failed:', error);
        }
      }

      const finalResults = mergeAndSortResults(results, options);

      // 성능 로깅 (개발 모드에서만)
      if (process.env.NODE_ENV === 'development') {
        const endTime = performance.now();
        console.log(`Search completed in ${(endTime - startTime).toFixed(2)}ms for query: "${options.query}"`);
        console.log(`Found ${finalResults.length} results`);
      }

      return finalResults;

    } catch (error) {
      console.error('Search service error:', error);
      throw new Error('검색 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
  },
  
  // 개별 검색 메서드
  searchEvents,
  searchTodos,
  searchDiaries,
};

export default searchService;