import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { YearlyMemo, MemoType } from '@/types/yearlyMemo';

interface YearlyMemoContextType {
  memos: YearlyMemo[];
  addMemo: (memo: Omit<YearlyMemo, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateMemo: (id: string, updates: Partial<YearlyMemo>) => void;
  deleteMemo: (id: string) => void;
  toggleComplete: (id: string) => void;
  getMemosByMonth: (year: number, month: number) => YearlyMemo[];
  getMonthStatistics: (year: number, month: number) => {
    total: number;
    byType: Record<MemoType, number>;
    completed: number;
  };
}

const YearlyMemoContext = createContext<YearlyMemoContextType | undefined>(undefined);

export const useYearlyMemo = () => {
  const context = useContext(YearlyMemoContext);
  if (!context) {
    throw new Error('useYearlyMemo must be used within a YearlyMemoProvider');
  }
  return context;
};

interface YearlyMemoProviderProps {
  children: ReactNode;
}

export const YearlyMemoProvider: React.FC<YearlyMemoProviderProps> = ({ children }) => {
  const [memos, setMemos] = useState<YearlyMemo[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const savedMemos = localStorage.getItem('yearlyMemos');
    if (savedMemos) {
      try {
        const parsed = JSON.parse(savedMemos);
        // Convert date strings back to Date objects
        const memosWithDates = parsed.map((memo: any) => ({
          ...memo,
          createdAt: new Date(memo.createdAt),
          updatedAt: new Date(memo.updatedAt),
        }));
        setMemos(memosWithDates);
      } catch (error) {
        console.error('Failed to load memos from localStorage:', error);
      }
    }
  }, []);

  // Save to localStorage whenever memos change
  useEffect(() => {
    if (memos.length > 0) {
      localStorage.setItem('yearlyMemos', JSON.stringify(memos));
    }
  }, [memos]);

  const addMemo = (memo: Omit<YearlyMemo, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newMemo: YearlyMemo = {
      ...memo,
      id: `memo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setMemos(prev => [...prev, newMemo]);
  };

  const updateMemo = (id: string, updates: Partial<YearlyMemo>) => {
    setMemos(prev => prev.map(memo => 
      memo.id === id 
        ? { ...memo, ...updates, updatedAt: new Date() }
        : memo,
    ));
  };

  const deleteMemo = (id: string) => {
    setMemos(prev => prev.filter(memo => memo.id !== id));
  };

  const toggleComplete = (id: string) => {
    setMemos(prev => prev.map(memo => 
      memo.id === id 
        ? { ...memo, completed: !memo.completed, updatedAt: new Date() }
        : memo,
    ));
  };

  const getMemosByMonth = (year: number, month: number) => {
    return memos.filter(memo => memo.year === year && memo.month === month)
      .sort((a, b) => (a.position || 0) - (b.position || 0));
  };

  const getMonthStatistics = (year: number, month: number) => {
    const monthMemos = getMemosByMonth(year, month);
    const byType = monthMemos.reduce((acc, memo) => {
      acc[memo.type] = (acc[memo.type] || 0) + 1;
      return acc;
    }, {} as Record<MemoType, number>);

    return {
      total: monthMemos.length,
      byType,
      completed: monthMemos.filter(m => m.completed).length,
    };
  };

  const value: YearlyMemoContextType = {
    memos,
    addMemo,
    updateMemo,
    deleteMemo,
    toggleComplete,
    getMemosByMonth,
    getMonthStatistics,
  };

  return (
    <YearlyMemoContext.Provider value={value}>
      {children}
    </YearlyMemoContext.Provider>
  );
};