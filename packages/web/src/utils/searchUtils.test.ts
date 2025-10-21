import { describe, it, expect as _expect } from 'vitest';
import {
  groupResultsByType,
  getCategoryLabel,
  getTypeLabel,
  stripHtml,
  truncateText,
  escapeRegex,
} from './searchUtils';

describe('searchUtils', () => {
  describe('groupResultsByType', () => {
    it('빈 배열을 그룹화하면 빈 Map을 반환한다', () => {
      const result = groupResultsByType([]);
      expect(result.size).toBe(0);
    });

    it('단일 타입의 결과를 그룹화한다', () => {
      const items = [
        { id: 1, type: 'event', name: 'Event 1' },
        { id: 2, type: 'event', name: 'Event 2' },
      ];
      const result = groupResultsByType(items);

      expect(result.size).toBe(1);
      expect(result.get('event')).toHaveLength(2);
      expect(result.get('event')?.[0].name).toBe('Event 1');
    });

    it('여러 타입의 결과를 그룹화한다', () => {
      const items = [
        { id: 1, type: 'event', name: 'Event 1' },
        { id: 2, type: 'todo', name: 'Todo 1' },
        { id: 3, type: 'event', name: 'Event 2' },
        { id: 4, type: 'diary', name: 'Diary 1' },
      ];
      const result = groupResultsByType(items);

      expect(result.size).toBe(3);
      expect(result.get('event')).toHaveLength(2);
      expect(result.get('todo')).toHaveLength(1);
      expect(result.get('diary')).toHaveLength(1);
    });
  });

  describe('getCategoryLabel', () => {
    it('알려진 카테고리 키를 한글 라벨로 변환한다', () => {
      expect(getCategoryLabel('all')).toBe('전체');
      expect(getCategoryLabel('events')).toBe('일정');
      expect(getCategoryLabel('todos')).toBe('할일');
      expect(getCategoryLabel('diaries')).toBe('일기');
      expect(getCategoryLabel('tags')).toBe('태그');
    });

    it('알 수 없는 카테고리는 원본 값을 반환한다', () => {
      expect(getCategoryLabel('unknown')).toBe('unknown');
      expect(getCategoryLabel('custom')).toBe('custom');
    });
  });

  describe('getTypeLabel', () => {
    it('알려진 타입 키를 한글 라벨로 변환한다', () => {
      expect(getTypeLabel('event')).toBe('일정');
      expect(getTypeLabel('todo')).toBe('할일');
      expect(getTypeLabel('diary')).toBe('일기');
      expect(getTypeLabel('tag')).toBe('태그');
    });

    it('알 수 없는 타입은 원본 값을 반환한다', () => {
      expect(getTypeLabel('unknown')).toBe('unknown');
      expect(getTypeLabel('custom')).toBe('custom');
    });
  });

  describe('stripHtml', () => {
    it('HTML 태그를 제거한다', () => {
      expect(stripHtml('<p>Hello</p>')).toBe('Hello');
      expect(stripHtml('<div><span>Test</span></div>')).toBe('Test');
    });

    it('여러 태그가 섞인 경우 모두 제거한다', () => {
      const html = '<h1>Title</h1><p>Paragraph</p><span>Span</span>';
      expect(stripHtml(html)).toBe('TitleParagraphSpan');
    });

    it('빈 문자열을 처리한다', () => {
      expect(stripHtml('')).toBe('');
    });

    it('HTML 태그가 없는 일반 텍스트는 그대로 반환한다', () => {
      expect(stripHtml('Plain text')).toBe('Plain text');
    });
  });

  describe('truncateText', () => {
    it('최대 길이보다 짧은 텍스트는 그대로 반환한다', () => {
      expect(truncateText('Hello', 10)).toBe('Hello');
      expect(truncateText('Test', 4)).toBe('Test');
    });

    it('최대 길이보다 긴 텍스트는 자르고 ...을 추가한다', () => {
      expect(truncateText('Hello World', 5)).toBe('Hello...');
      expect(truncateText('Long text here', 8)).toBe('Long tex...');
    });

    it('정확히 최대 길이인 텍스트는 그대로 반환한다', () => {
      expect(truncateText('Hello', 5)).toBe('Hello');
    });

    it('빈 문자열을 처리한다', () => {
      expect(truncateText('', 10)).toBe('');
    });
  });

  describe('escapeRegex', () => {
    it('정규식 특수문자를 이스케이프한다', () => {
      expect(escapeRegex('.')).toBe('\\.');
      expect(escapeRegex('*')).toBe('\\*');
      expect(escapeRegex('+')).toBe('\\+');
      expect(escapeRegex('?')).toBe('\\?');
      expect(escapeRegex('^')).toBe('\\^');
      expect(escapeRegex('$')).toBe('\\$');
      expect(escapeRegex('{')).toBe('\\{');
      expect(escapeRegex('}')).toBe('\\}');
      expect(escapeRegex('(')).toBe('\\(');
      expect(escapeRegex(')')).toBe('\\)');
      expect(escapeRegex('|')).toBe('\\|');
      expect(escapeRegex('[')).toBe('\\[');
      expect(escapeRegex(']')).toBe('\\]');
      expect(escapeRegex('\\')).toBe('\\\\');
    });

    it('여러 특수문자를 포함한 문자열을 이스케이프한다', () => {
      expect(escapeRegex('test.*')).toBe('test\\.\\*');
      expect(escapeRegex('[a-z]+')).toBe('\\[a-z\\]\\+');
      expect(escapeRegex('(foo|bar)')).toBe('\\(foo\\|bar\\)');
    });

    it('특수문자가 없는 문자열은 그대로 반환한다', () => {
      expect(escapeRegex('hello')).toBe('hello');
      expect(escapeRegex('test123')).toBe('test123');
    });

    it('빈 문자열을 처리한다', () => {
      expect(escapeRegex('')).toBe('');
    });
  });
});
