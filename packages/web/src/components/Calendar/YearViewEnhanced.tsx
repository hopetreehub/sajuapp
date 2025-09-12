import React, { useState, useMemo } from 'react';
import { useCalendar } from '@/contexts/CalendarContext';
import { useYearlyMemo } from '@/contexts/YearlyMemoContext';
import { useDiaryData } from '@/hooks/useDiaryData';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { CalendarEvent } from '@/services/api';
import { 
  YearlyMemo, 
  MemoType, 
  ImportanceLevel,
  MEMO_TYPE_CONFIG,
  IMPORTANCE_CONFIG, 
} from '@/types/yearlyMemo';
import { Plus, X, Check, Edit2, Trash2, Filter, Search } from 'lucide-react';

interface YearViewEnhancedProps {
  events: CalendarEvent[];
  onCreateEvent: (date: Date) => void;
  onDateClick?: (date: Date, event: React.MouseEvent) => void;
  onEditEvent: (event: CalendarEvent) => void;
  highlightedEventId?: string | null;
}

const MONTHS = [
  '1월', '2월', '3월', '4월', '5월', '6월',
  '7월', '8월', '9월', '10월', '11월', '12월',
];

export default function YearViewEnhanced({ events, onDateClick, highlightedEventId }: YearViewEnhancedProps) {
  const { currentDate, setCurrentDate, setViewMode } = useCalendar();
  const { 
    getMemosByMonth, 
    addMemo, 
    updateMemo, 
    deleteMemo, 
    toggleComplete,
    getMonthStatistics, 
  } = useYearlyMemo();
  
  // 일기 데이터 가져오기
  const { diaries } = useDiaryData({ 
    viewMode: 'year', 
    currentDate, 
  });

  const currentYear = currentDate.getFullYear();
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [isAddingMemo, setIsAddingMemo] = useState<number | null>(null);
  const [editingMemo, setEditingMemo] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<MemoType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [newMemoTitle, setNewMemoTitle] = useState('');
  const [newMemoType, setNewMemoType] = useState<MemoType>('memo');
  const [newMemoImportance, setNewMemoImportance] = useState<ImportanceLevel>('medium');
  const [newMemoDescription, setNewMemoDescription] = useState('');

  // Get filtered memos for a month
  const getFilteredMemos = (month: number) => {
    let memos = getMemosByMonth(currentYear, month);
    
    if (filterType !== 'all') {
      memos = memos.filter(m => m.type === filterType);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      memos = memos.filter(m => 
        m.title.toLowerCase().includes(query) ||
        m.description?.toLowerCase().includes(query),
      );
    }
    
    return memos;
  };

  // Handle adding new memo
  const handleAddMemo = (month: number) => {
    if (!newMemoTitle.trim()) return;

    const typeConfig = MEMO_TYPE_CONFIG[newMemoType];
    
    addMemo({
      year: currentYear,
      month,
      type: newMemoType,
      title: newMemoTitle,
      description: newMemoDescription,
      color: typeConfig.color,
      importance: newMemoImportance,
      completed: false,
      position: 0,
    });

    // Reset form
    setNewMemoTitle('');
    setNewMemoDescription('');
    setNewMemoType('memo');
    setNewMemoImportance('medium');
    setIsAddingMemo(null);
  };

  // 월별 일기 개수 계산
  const getMonthlyDiaryCount = (month: number): number => {
    if (!diaries || diaries.length === 0) return 0;
    
    const monthStr = String(month).padStart(2, '0');
    const yearMonthStr = `${currentYear}-${monthStr}`;
    
    return diaries.filter(diary => 
      diary.date && diary.date.startsWith(yearMonthStr),
    ).length;
  };

  // Calculate year statistics
  const yearStatistics = useMemo(() => {
    let totalMemos = 0;
    let completedMemos = 0;
    const typeCount: Record<MemoType, number> = {
      goal: 0,
      event: 0,
      memo: 0,
      milestone: 0,
    };

    for (let month = 1; month <= 12; month++) {
      const stats = getMonthStatistics(currentYear, month);
      totalMemos += stats.total;
      completedMemos += stats.completed;
      
      Object.entries(stats.byType).forEach(([type, count]) => {
        typeCount[type as MemoType] += count;
      });
    }

    return { totalMemos, completedMemos, typeCount };
  }, [currentYear, getMemosByMonth]);

  return (
    <div className="h-full overflow-auto bg-background p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {currentYear}년 연간 계획
            </h1>
            
            <div className="flex gap-2">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                           focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Filter */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as MemoType | 'all')}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="all">모든 타입</option>
                {Object.entries(MEMO_TYPE_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.icon} {config.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Year Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {yearStatistics.totalMemos}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">전체</div>
            </div>
            
            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {yearStatistics.completedMemos}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">완료</div>
            </div>

            {Object.entries(MEMO_TYPE_CONFIG).map(([type, config]) => (
              <div key={type} className={`text-center p-3 rounded-lg ${config.bgColor}`}>
                <div className={`text-2xl font-bold ${config.textColor}`}>
                  {yearStatistics.typeCount[type as MemoType] || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {config.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {MONTHS.map((monthName, index) => {
            const month = index + 1;
            const memos = getFilteredMemos(month);
            const stats = getMonthStatistics(currentYear, month);
            const isAdding = isAddingMemo === month;

            return (
              <div
                key={month}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md 
                         transition-all duration-200 border border-gray-200 dark:border-gray-700"
              >
                {/* Month Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {monthName}
                    </h3>
                    <button
                      onClick={() => setIsAddingMemo(isAdding ? null : month)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Plus className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </button>
                  </div>
                  
                  {/* Month Stats */}
                  <div className="mt-2 flex gap-2 text-xs">
                    {stats.total > 0 && (
                      <>
                        <span className="text-gray-500 dark:text-gray-400">
                          {stats.total}개 항목
                        </span>
                        {stats.completed > 0 && (
                          <span className="text-green-600 dark:text-green-400">
                            {stats.completed}개 완료
                          </span>
                        )}
                      </>
                    )}
                    {/* 일기 개수 표시 - 숫자만 */}
                    {getMonthlyDiaryCount(month) > 0 && (
                      <span className="text-purple-600 dark:text-purple-400 font-medium">
                        📔 {getMonthlyDiaryCount(month)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Memo List */}
                <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
                  {/* Add Memo Form */}
                  {isAdding && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-2">
                      <input
                        type="text"
                        placeholder="제목 입력..."
                        value={newMemoTitle}
                        onChange={(e) => setNewMemoTitle(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddMemo(month)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 
                                 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        autoFocus
                      />
                      
                      <div className="flex gap-2">
                        <select
                          value={newMemoType}
                          onChange={(e) => setNewMemoType(e.target.value as MemoType)}
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 
                                   rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        >
                          {Object.entries(MEMO_TYPE_CONFIG).map(([key, config]) => (
                            <option key={key} value={key}>
                              {config.label}
                            </option>
                          ))}
                        </select>
                        
                        <select
                          value={newMemoImportance}
                          onChange={(e) => setNewMemoImportance(e.target.value as ImportanceLevel)}
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 
                                   rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        >
                          {Object.entries(IMPORTANCE_CONFIG).map(([key, config]) => (
                            <option key={key} value={key}>
                              {config.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex gap-1 justify-end">
                        <button
                          onClick={() => handleAddMemo(month)}
                          className="px-2 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700"
                        >
                          추가
                        </button>
                        <button
                          onClick={() => {
                            setIsAddingMemo(null);
                            setNewMemoTitle('');
                          }}
                          className="px-2 py-1 text-xs bg-gray-300 dark:bg-gray-600 text-gray-700 
                                   dark:text-gray-300 rounded hover:bg-gray-400 dark:hover:bg-gray-500"
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Memo Items */}
                  {memos.length === 0 && !isAdding ? (
                    <div className="text-center text-gray-400 dark:text-gray-500 text-sm py-4">
                      메모가 없습니다
                    </div>
                  ) : (
                    memos.slice(0, 5).map((memo) => {
                      const typeConfig = MEMO_TYPE_CONFIG[memo.type];
                      const isEditing = editingMemo === memo.id;

                      return (
                        <div
                          key={memo.id}
                          className={`p-2 rounded-lg border ${
                            memo.completed 
                              ? 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600' 
                              : `${typeConfig.bgColor} border-gray-200 dark:border-gray-600`
                          } group hover:shadow-sm transition-all`}
                        >
                          <div className="flex items-start gap-2">
                            <button
                              onClick={() => toggleComplete(memo.id)}
                              className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center
                                ${memo.completed 
                                  ? 'bg-green-500 border-green-500' 
                                  : 'border-gray-300 dark:border-gray-600 hover:border-purple-500'
                                }`}
                            >
                              {memo.completed && (
                                <Check className="w-3 h-3 text-white" />
                              )}
                            </button>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1">
                                <span className="text-sm">{typeConfig.icon}</span>
                                <span className={`text-sm font-medium ${
                                  memo.completed 
                                    ? 'line-through text-gray-500 dark:text-gray-400' 
                                    : 'text-gray-900 dark:text-gray-100'
                                }`}>
                                  {memo.title}
                                </span>
                              </div>
                              {memo.description && (
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                  {memo.description}
                                </p>
                              )}
                            </div>

                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => deleteMemo(memo.id)}
                                className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                              >
                                <Trash2 className="w-3 h-3 text-red-500" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}

                  {memos.length > 5 && (
                    <button
                      onClick={() => {
                        setCurrentDate(new Date(currentYear, index, 1));
                        setViewMode('month');
                      }}
                      className="w-full text-center text-xs text-purple-600 dark:text-purple-400 
                               hover:text-purple-700 dark:hover:text-purple-300 py-1"
                    >
                      +{memos.length - 5}개 더 보기
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}