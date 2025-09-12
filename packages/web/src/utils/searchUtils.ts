import { useState, useEffect } from 'react';

/**
 * 디바운싱 훅 - 값이 변경된 후 일정 시간 동안 변경이 없을 때만 업데이트
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
}

/**
 * 검색 결과를 타입별로 그룹화
 */
export function groupResultsByType<T extends { type: string }>(
  results: T[],
): Map<string, T[]> {
  const grouped = new Map<string, T[]>();
  
  results.forEach(result => {
    const type = result.type;
    if (!grouped.has(type)) {
      grouped.set(type, []);
    }
    grouped.get(type)!.push(result);
  });
  
  return grouped;
}

/**
 * 카테고리 라벨 한글 변환
 */
export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    all: '전체',
    events: '일정',
    todos: '할일',
    diaries: '일기',
    tags: '태그',
  };
  return labels[category] || category;
}

/**
 * 타입 라벨 한글 변환
 */
export function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    event: '일정',
    todo: '할일',
    diary: '일기',
    tag: '태그',
  };
  return labels[type] || type;
}

/**
 * HTML 태그 제거
 */
export function stripHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
}

/**
 * 텍스트 자르기
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)  }...`;
}

/**
 * 검색어 정규식 이스케이프
 */
export function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}