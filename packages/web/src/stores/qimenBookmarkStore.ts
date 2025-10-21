import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { QimenChart } from '@/types/qimen';
import type { QimenContext } from '@/data/qimenContextWeights';

/**
 * 귀문둔갑 즐겨찾기 항목
 */
export interface QimenBookmark {
  /** 고유 ID */
  id: string;

  /** 귀문둔갑 차트 데이터 */
  chart: QimenChart;

  /** 분석 시간 */
  dateTime: Date;

  /** 고객 이름 (선택사항) */
  customerName?: string;

  /** 고객 생년월일 (선택사항) */
  customerBirthDate?: string;

  /** 분석 목적/맥락 */
  context: QimenContext;

  /** 사용자 메모 */
  note: string;

  /** 태그 (검색용) */
  tags: string[];

  /** 즐겨찾기 추가 시간 */
  createdAt: Date;

  /** 마지막 수정 시간 */
  updatedAt: Date;

  /** 공유 여부 */
  isShared: boolean;

  /** 공유 UUID (공유된 경우) */
  shareUuid?: string;
}

/**
 * 북마크 검색 옵션
 */
export interface BookmarkSearchOptions {
  /** 검색 키워드 (제목, 메모, 태그) */
  query?: string;

  /** 목적 필터 */
  context?: QimenContext;

  /** 고객 이름 필터 */
  customerName?: string;

  /** 날짜 범위 필터 */
  dateRange?: {
    start: Date;
    end: Date;
  };

  /** 태그 필터 */
  tags?: string[];

  /** 공유 여부 필터 */
  isShared?: boolean;
}

interface QimenBookmarkStore {
  /** 즐겨찾기 목록 */
  bookmarks: QimenBookmark[];

  /** 즐겨찾기 추가 */
  addBookmark: (bookmark: Omit<QimenBookmark, 'id' | 'createdAt' | 'updatedAt'>) => QimenBookmark;

  /** 즐겨찾기 제거 */
  removeBookmark: (id: string) => void;

  /** 즐겨찾기 업데이트 */
  updateBookmark: (id: string, data: Partial<Omit<QimenBookmark, 'id' | 'createdAt'>>) => void;

  /** 즐겨찾기 조회 */
  getBookmark: (id: string) => QimenBookmark | undefined;

  /** 즐겨찾기 검색 */
  searchBookmarks: (options: BookmarkSearchOptions) => QimenBookmark[];

  /** 모든 즐겨찾기 가져오기 (정렬: 최신순) */
  getAllBookmarks: () => QimenBookmark[];

  /** 태그 목록 가져오기 (중복 제거) */
  getAllTags: () => string[];

  /** 즐겨찾기 존재 여부 확인 (같은 시간/고객/목적) */
  hasBookmark: (dateTime: Date, customerName: string | undefined, context: QimenContext) => boolean;

  /** 공유 설정 */
  setShared: (id: string, shareUuid: string) => void;

  /** 공유 해제 */
  unsetShared: (id: string) => void;

  /** 모든 즐겨찾기 삭제 */
  clearAll: () => void;
}

export const useQimenBookmarkStore = create<QimenBookmarkStore>()(
  persist(
    (set, get) => ({
      bookmarks: [],

      addBookmark: (bookmarkData) => {
        const newBookmark: QimenBookmark = {
          ...bookmarkData,
          id: `qb-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date(),
          updatedAt: new Date(),
          isShared: false,
        };

        set((state) => ({
          bookmarks: [newBookmark, ...state.bookmarks],
        }));

        return newBookmark;
      },

      removeBookmark: (id) => {
        set((state) => ({
          bookmarks: state.bookmarks.filter((b) => b.id !== id),
        }));
      },

      updateBookmark: (id, data) => {
        set((state) => ({
          bookmarks: state.bookmarks.map((b) =>
            b.id === id
              ? {
                  ...b,
                  ...data,
                  updatedAt: new Date(),
                }
              : b,
          ),
        }));
      },

      getBookmark: (id) => {
        return get().bookmarks.find((b) => b.id === id);
      },

      searchBookmarks: (options) => {
        let results = get().bookmarks;

        // 키워드 검색
        if (options.query && options.query.trim()) {
          const query = options.query.toLowerCase();
          results = results.filter(
            (b) =>
              b.note.toLowerCase().includes(query) ||
              b.customerName?.toLowerCase().includes(query) ||
              b.tags.some((tag) => tag.toLowerCase().includes(query)),
          );
        }

        // 목적 필터
        if (options.context) {
          results = results.filter((b) => b.context === options.context);
        }

        // 고객 이름 필터
        if (options.customerName) {
          results = results.filter((b) => b.customerName === options.customerName);
        }

        // 날짜 범위 필터
        if (options.dateRange) {
          results = results.filter((b) => {
            const dt = new Date(b.dateTime);
            return dt >= options.dateRange!.start && dt <= options.dateRange!.end;
          });
        }

        // 태그 필터
        if (options.tags && options.tags.length > 0) {
          results = results.filter((b) =>
            options.tags!.some((tag) => b.tags.includes(tag)),
          );
        }

        // 공유 여부 필터
        if (options.isShared !== undefined) {
          results = results.filter((b) => b.isShared === options.isShared);
        }

        return results;
      },

      getAllBookmarks: () => {
        return [...get().bookmarks].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
      },

      getAllTags: () => {
        const allTags = get().bookmarks.flatMap((b) => b.tags);
        return Array.from(new Set(allTags)).sort();
      },

      hasBookmark: (dateTime, customerName, context) => {
        return get().bookmarks.some((b) => {
          const sameTime =
            new Date(b.dateTime).toISOString() === dateTime.toISOString();
          const sameCustomer = b.customerName === customerName;
          const sameContext = b.context === context;
          return sameTime && sameCustomer && sameContext;
        });
      },

      setShared: (id, shareUuid) => {
        set((state) => ({
          bookmarks: state.bookmarks.map((b) =>
            b.id === id
              ? {
                  ...b,
                  isShared: true,
                  shareUuid,
                  updatedAt: new Date(),
                }
              : b,
          ),
        }));
      },

      unsetShared: (id) => {
        set((state) => ({
          bookmarks: state.bookmarks.map((b) =>
            b.id === id
              ? {
                  ...b,
                  isShared: false,
                  shareUuid: undefined,
                  updatedAt: new Date(),
                }
              : b,
          ),
        }));
      },

      clearAll: () => {
        if (confirm('모든 즐겨찾기를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
          set({ bookmarks: [] });
        }
      },
    }),
    {
      name: 'qimen-bookmark-storage',
      version: 1,
    },
  ),
);
