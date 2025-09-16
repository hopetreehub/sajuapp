import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  ClockIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import SearchBar from '@/components/SearchBar';
import SearchResultItem from '@/components/SearchResultItem';
import { SearchResult, searchService } from '@/services/searchService';
import { useCalendar } from '@/contexts/CalendarContext';
import { groupResultsByType, getCategoryLabel } from '@/utils/searchUtils';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

const SearchPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { todos, setCurrentDate, setViewMode, setSelectedDate } = useCalendar();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['all']);
  const [sortBy, setSortBy] = useState<'relevance' | 'date'>('relevance');
  const [dateRange, setDateRange] = useState<{ start?: string; end?: string }>({});
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // URL 상태에서 초기 검색 결과 가져오기
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const urlQuery = urlParams.get('q');
    const stateResults = location.state?.results;

    if (urlQuery) {
      setQuery(urlQuery);
      performSearch(urlQuery);
    } else if (stateResults) {
      setResults(stateResults);
    }
  }, [location]);

  // 최근 검색어 로드
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // 검색 실행
  const performSearch = async (searchQuery?: string) => {
    const currentQuery = searchQuery || query;
    if (currentQuery.length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const searchResults = await searchService.searchAll({
        query: currentQuery,
        categories: selectedCategories.includes('all')
          ? ['events', 'todos', 'diaries']
          : selectedCategories as ('events' | 'todos' | 'diaries')[],
        startDate: dateRange.start,
        endDate: dateRange.end,
        sortBy,
        limit: 50,
      }, todos);

      setResults(searchResults);

      // 최근 검색어에 추가
      const newRecentSearches = [
        currentQuery,
        ...recentSearches.filter(s => s !== currentQuery)
      ].slice(0, 10);
      setRecentSearches(newRecentSearches);
      localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches));

      // URL 업데이트
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('q', currentQuery);
      window.history.replaceState({}, '', newUrl.toString());

    } catch (err) {
      console.error('Search failed:', err);
      setError('검색 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 검색 결과 클릭 처리
  const handleResultClick = (result: SearchResult) => {
    switch (result.type) {
      case 'event':
        if (result.date) {
          const eventDate = parseISO(result.date);
          setCurrentDate(eventDate);
          setSelectedDate(eventDate);
          setViewMode('day');
          navigate('/calendar');
        }
        break;
      case 'todo':
        if (result.date) {
          const todoDate = parseISO(result.date);
          setCurrentDate(todoDate);
          setSelectedDate(todoDate);
          setViewMode('day');
          navigate('/calendar');
        }
        break;
      case 'diary':
        if (result.date) {
          navigate(`/diary/${result.date}`);
        }
        break;
    }
  };

  // 카테고리 토글
  const toggleCategory = (category: string) => {
    if (category === 'all') {
      setSelectedCategories(['all']);
    } else {
      const newCategories = selectedCategories.includes('all')
        ? [category]
        : selectedCategories.includes(category)
          ? selectedCategories.filter(c => c !== category)
          : [...selectedCategories.filter(c => c !== 'all'), category];

      setSelectedCategories(newCategories.length === 0 ? ['all'] : newCategories);
    }
  };

  // 최근 검색어 클릭
  const handleRecentSearchClick = (recentQuery: string) => {
    setQuery(recentQuery);
    performSearch(recentQuery);
  };

  // 검색 결과 그룹화
  const groupedResults = groupResultsByType(results);
  const totalResults = results.length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 헤더 */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* 페이지 제목 */}
            <div className="flex items-center gap-3">
              <MagnifyingGlassIcon className="h-8 w-8 text-purple-600" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                검색
              </h1>
            </div>

            {/* 검색바 */}
            <div className="flex-1 max-w-2xl">
              <SearchBar
                placeholder="일정, 할일, 일기 검색..."
                className="w-full"
                showCategories={false}
                onSearch={(searchResults) => {
                  setResults(searchResults);
                }}
              />
            </div>

            {/* 필터 버튼 */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <AdjustmentsHorizontalIcon className="h-5 w-5" />
              필터
            </button>
          </div>

          {/* 검색 통계 */}
          {query && (
            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              '<span className="font-medium text-gray-700 dark:text-gray-300">{query}</span>' 검색 결과 {totalResults}개
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* 사이드바 - 필터 */}
          <div className={`lg:w-64 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                필터
              </h3>

              {/* 카테고리 필터 */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  카테고리
                </h4>
                <div className="space-y-2">
                  {['all', 'events', 'todos', 'diaries'].map(category => (
                    <label key={category} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category)}
                        onChange={() => toggleCategory(category)}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        {getCategoryLabel(category)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 정렬 옵션 */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  정렬
                </h4>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'relevance' | 'date')}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm"
                >
                  <option value="relevance">관련도순</option>
                  <option value="date">날짜순</option>
                </select>
              </div>

              {/* 날짜 범위 */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  날짜 범위
                </h4>
                <div className="space-y-2">
                  <input
                    type="date"
                    value={dateRange.start || ''}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm"
                    placeholder="시작 날짜"
                  />
                  <input
                    type="date"
                    value={dateRange.end || ''}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm"
                    placeholder="종료 날짜"
                  />
                </div>
              </div>

              {/* 검색 버튼 */}
              <button
                onClick={() => performSearch()}
                disabled={isLoading}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                {isLoading ? '검색 중...' : '다시 검색'}
              </button>
            </div>

            {/* 최근 검색어 */}
            {recentSearches.length > 0 && (
              <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  최근 검색어
                </h3>
                <div className="space-y-1">
                  {recentSearches.slice(0, 5).map((recentQuery, index) => (
                    <button
                      key={index}
                      onClick={() => handleRecentSearchClick(recentQuery)}
                      className="w-full text-left px-2 py-1 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      <ClockIcon className="inline h-3 w-3 mr-2" />
                      {recentQuery}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 메인 컨텐츠 - 검색 결과 */}
          <div className="flex-1">
            {/* 에러 메시지 */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                <p className="text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* 로딩 상태 */}
            {isLoading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <span className="ml-3 text-gray-600 dark:text-gray-400">검색 중...</span>
              </div>
            )}

            {/* 검색 결과 없음 */}
            {!isLoading && query && results.length === 0 && !error && (
              <div className="text-center py-12">
                <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
                  검색 결과가 없습니다
                </h3>
                <p className="mt-2 text-gray-500 dark:text-gray-400">
                  다른 키워드로 검색해보세요.
                </p>
              </div>
            )}

            {/* 검색 결과 */}
            {!isLoading && results.length > 0 && (
              <div className="space-y-6">
                {Array.from(groupedResults.entries()).map(([type, items]) => (
                  <div key={type} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {getCategoryLabel(type)} ({items.length})
                      </h2>
                    </div>
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                      {items.map(item => (
                        <SearchResultItem
                          key={`${item.type}-${item.id}`}
                          item={item}
                          onClick={handleResultClick}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 초기 상태 (검색어 없음) */}
            {!query && !isLoading && (
              <div className="text-center py-12">
                <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
                  검색을 시작해보세요
                </h3>
                <p className="mt-2 text-gray-500 dark:text-gray-400">
                  일정, 할일, 일기를 검색할 수 있습니다.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;