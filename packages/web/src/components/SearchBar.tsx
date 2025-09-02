import { useState, useEffect, useRef } from 'react'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { searchService, SearchResult, SearchOptions } from '@/services/searchService'
import { useCalendar } from '@/contexts/CalendarContext'
import { useDebounce, getCategoryLabel, groupResultsByType } from '@/utils/searchUtils'
import SearchResultItem from './SearchResultItem'
import { parseISO } from 'date-fns'

interface SearchBarProps {
  onSearch?: (results: SearchResult[]) => void
  placeholder?: string
  className?: string
  showCategories?: boolean
}

export default function SearchBar({ 
  onSearch, 
  placeholder = "일정, 할일, 일기 검색...", 
  className = "",
  showCategories = true 
}: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['all'])
  const [error, setError] = useState<string | null>(null)
  
  const { todos, setCurrentDate, setViewMode, setSelectedDate } = useCalendar()
  const debouncedQuery = useDebounce(query, 300)
  const searchRef = useRef<HTMLDivElement>(null)
  
  // 검색 실행
  const performSearch = async () => {
    if (debouncedQuery.length < 2) {
      setResults([])
      setShowDropdown(false)
      return
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      const options: SearchOptions = {
        query: debouncedQuery,
        categories: selectedCategories.includes('all') 
          ? ['events', 'todos', 'diaries'] 
          : selectedCategories as ('events' | 'todos' | 'diaries')[],
        limit: 15,
        sortBy: 'relevance'
      }
      
      const searchResults = await searchService.searchAll(options, todos)
      setResults(searchResults)
      setShowDropdown(true)
      
      if (onSearch) {
        onSearch(searchResults)
      }
    } catch (err) {
      console.error('Search failed:', err)
      setError('검색 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }
  
  // 디바운스된 쿼리 변경 시 검색
  useEffect(() => {
    performSearch()
  }, [debouncedQuery, selectedCategories])
  
  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  // 키보드 이벤트 처리
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowDropdown(false)
      setQuery('')
    }
  }
  
  // 카테고리 토글
  const toggleCategory = (category: string) => {
    if (category === 'all') {
      setSelectedCategories(['all'])
    } else {
      const newCategories = selectedCategories.includes('all')
        ? [category]
        : selectedCategories.includes(category)
          ? selectedCategories.filter(c => c !== category)
          : [...selectedCategories.filter(c => c !== 'all'), category]
      
      setSelectedCategories(newCategories.length === 0 ? ['all'] : newCategories)
    }
  }
  
  // 검색 결과 클릭 처리
  const handleResultClick = (result: SearchResult) => {
    setShowDropdown(false)
    setQuery('')
    
    // 결과에 따른 네비게이션 처리
    switch (result.type) {
      case 'event':
        // 이벤트 날짜로 이동하고 일간 뷰로 전환
        if (result.date) {
          const eventDate = parseISO(result.date)
          setCurrentDate(eventDate)
          setSelectedDate(eventDate)
          setViewMode('day')
        }
        break
      case 'todo':
        // 할일 날짜로 이동하고 일간 뷰로 전환
        if (result.date) {
          const todoDate = parseISO(result.date)
          setCurrentDate(todoDate)
          setSelectedDate(todoDate)
          setViewMode('day')
        }
        break
      case 'diary':
        // 일기 날짜로 이동하고 일간 뷰로 전환
        if (result.date) {
          const diaryDate = parseISO(result.date)
          setCurrentDate(diaryDate)
          setSelectedDate(diaryDate)
          setViewMode('dayEnhanced') // 일기는 향상된 일간 뷰로 이동
        }
        break
    }
  }
  
  // 검색 결과 그룹화
  const groupedResults = groupResultsByType(results)
  
  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* 검색 입력 */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && results.length > 0 && setShowDropdown(true)}
          placeholder={placeholder}
          className="w-full px-4 py-2 pl-10 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
        
        <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        
        {query && (
          <button
            onClick={() => {
              setQuery('')
              setResults([])
              setShowDropdown(false)
            }}
            className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon />
          </button>
        )}
        
        {isLoading && (
          <div className="absolute right-3 top-2.5">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
          </div>
        )}
      </div>
      
      {/* 카테고리 필터 */}
      {showCategories && (
        <div className="flex gap-2 mt-2">
          {['all', 'events', 'todos', 'diaries'].map(category => (
            <button
              key={category}
              onClick={() => toggleCategory(category)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedCategories.includes(category)
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {getCategoryLabel(category)}
            </button>
          ))}
        </div>
      )}
      
      {/* 검색 결과 드롭다운 */}
      {showDropdown && (
        <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg max-h-96 overflow-y-auto z-50 border border-gray-200 dark:border-gray-700">
          {error && (
            <div className="px-4 py-3 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}
          
          {!error && results.length === 0 && !isLoading && query.length >= 2 && (
            <div className="px-4 py-3 text-gray-500 dark:text-gray-400 text-sm">
              검색 결과가 없습니다.
            </div>
          )}
          
          {!error && results.length > 0 && (
            <div>
              {Array.from(groupedResults.entries()).map(([type, items]) => (
                <div key={type}>
                  <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700/50 font-semibold text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
                    {getCategoryLabel(type)} ({items.length})
                  </div>
                  {items.map(item => (
                    <SearchResultItem
                      key={`${item.type}-${item.id}`}
                      item={item}
                      onClick={handleResultClick}
                    />
                  ))}
                </div>
              ))}
              
              {results.length >= 15 && (
                <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 text-center border-t border-gray-200 dark:border-gray-600">
                  더 많은 결과가 있습니다. 검색어를 구체적으로 입력해보세요.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}