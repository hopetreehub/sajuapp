/**
 * 타로 카드 기록 저장 유틸리티
 * 로컬스토리지를 사용하여 타로 리딩 기록 관리
 */

import type { TarotReading } from '@/types/tarot';

const STORAGE_KEY = 'tarot_readings';
const MAX_READINGS = 100; // 최대 저장 개수

/**
 * 모든 타로 기록 가져오기
 */
export function getTarotReadings(): TarotReading[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const readings: TarotReading[] = JSON.parse(stored);
    return readings.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  } catch (error) {
    console.error('[타로 기록] 로드 실패:', error);
    return [];
  }
}

/**
 * 타로 기록 저장
 */
export function saveTarotReading(reading: Omit<TarotReading, 'id' | 'createdAt'>): TarotReading {
  try {
    const readings = getTarotReadings();

    const newReading: TarotReading = {
      ...reading,
      id: `tarot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };

    // 최대 개수 제한
    const updatedReadings = [newReading, ...readings].slice(0, MAX_READINGS);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedReadings));

    console.log('[타로 기록] 저장 성공:', newReading.id);
    return newReading;
  } catch (error) {
    console.error('[타로 기록] 저장 실패:', error);
    throw error;
  }
}

/**
 * 특정 타로 기록 가져오기
 */
export function getTarotReading(id: string): TarotReading | null {
  const readings = getTarotReadings();
  return readings.find(r => r.id === id) || null;
}

/**
 * 타로 기록 삭제
 */
export function deleteTarotReading(id: string): boolean {
  try {
    const readings = getTarotReadings();
    const filtered = readings.filter(r => r.id !== id);

    if (filtered.length === readings.length) {
      console.warn('[타로 기록] 삭제 실패: ID를 찾을 수 없음', id);
      return false;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    console.log('[타로 기록] 삭제 성공:', id);
    return true;
  } catch (error) {
    console.error('[타로 기록] 삭제 실패:', error);
    return false;
  }
}

/**
 * 특정 사용자의 타로 기록 가져오기
 */
export function getUserTarotReadings(userId: number): TarotReading[] {
  const readings = getTarotReadings();
  return readings.filter(r => r.userId === userId);
}

/**
 * 날짜별 타로 기록 가져오기
 */
export function getTarotReadingsByDate(date: Date): TarotReading[] {
  const readings = getTarotReadings();
  const targetDate = date.toISOString().split('T')[0];

  return readings.filter(r => {
    const readingDate = new Date(r.createdAt).toISOString().split('T')[0];
    return readingDate === targetDate;
  });
}

/**
 * 타로 기록 통계
 */
export function getTarotStatistics(): {
  totalReadings: number;
  spreadsUsed: { [key: string]: number };
  recentReadings: TarotReading[];
} {
  const readings = getTarotReadings();

  const spreadsUsed: { [key: string]: number } = {};
  readings.forEach(r => {
    spreadsUsed[r.spreadName] = (spreadsUsed[r.spreadName] || 0) + 1;
  });

  return {
    totalReadings: readings.length,
    spreadsUsed,
    recentReadings: readings.slice(0, 10),
  };
}

/**
 * 모든 타로 기록 삭제 (주의!)
 */
export function clearAllTarotReadings(): boolean {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('[타로 기록] 전체 삭제 완료');
    return true;
  } catch (error) {
    console.error('[타로 기록] 전체 삭제 실패:', error);
    return false;
  }
}

/**
 * 타로 기록 내보내기 (JSON 파일)
 */
export function exportTarotReadings(): string {
  const readings = getTarotReadings();
  return JSON.stringify(readings, null, 2);
}

/**
 * 타로 기록 가져오기 (JSON 파일에서)
 */
export function importTarotReadings(jsonData: string): boolean {
  try {
    const imported: TarotReading[] = JSON.parse(jsonData);

    if (!Array.isArray(imported)) {
      throw new Error('Invalid data format');
    }

    const existing = getTarotReadings();
    const merged = [...imported, ...existing];

    // 중복 제거 (ID 기준)
    const unique = merged.filter((reading, index, self) =>
      index === self.findIndex(r => r.id === reading.id),
    );

    // 최대 개수 제한
    const limited = unique.slice(0, MAX_READINGS);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(limited));
    console.log('[타로 기록] 가져오기 성공:', limited.length);
    return true;
  } catch (error) {
    console.error('[타로 기록] 가져오기 실패:', error);
    return false;
  }
}
