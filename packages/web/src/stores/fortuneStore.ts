import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { calculateDailyFortune } from '@/utils/dailyFortuneCalculator';
import { DailyFortune, SajuBirthInfo } from '@/types/saju';

interface FortuneState {
  // 캐시된 운세 데이터
  dailyFortune: DailyFortune | null;
  // 마지막 계산 날짜
  lastCalculatedDate: string | null;
  // 마지막 계산에 사용된 생년월일 정보
  lastBirthInfo: SajuBirthInfo | null;

  // 운세 계산 함수
  calculateFortune: (birthInfo: SajuBirthInfo, date: Date) => DailyFortune | null;
  // 캐시 초기화
  clearCache: () => void;
}

const formatDateKey = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const isSameBirthInfo = (info1: SajuBirthInfo | null, info2: SajuBirthInfo | null): boolean => {
  if (!info1 || !info2) return false;
  return (
    info1.year === info2.year &&
    info1.month === info2.month &&
    info1.day === info2.day &&
    info1.hour === info2.hour &&
    info1.minute === info2.minute &&
    info1.isLunar === info2.isLunar &&
    info1.isMale === info2.isMale
  );
};

export const useFortuneStore = create<FortuneState>()(
  persist(
    (set, get) => ({
      dailyFortune: null,
      lastCalculatedDate: null,
      lastBirthInfo: null,

      calculateFortune: (birthInfo: SajuBirthInfo, date: Date) => {
        const state = get();
        const dateKey = formatDateKey(date);

        // 캐시 확인: 같은 날짜, 같은 생년월일 정보면 캐시된 데이터 반환
        if (
          state.lastCalculatedDate === dateKey &&
          isSameBirthInfo(state.lastBirthInfo, birthInfo) &&
          state.dailyFortune
        ) {
          console.log('[FortuneStore] 캐시된 운세 데이터 반환:', dateKey);
          return state.dailyFortune;
        }

        // 새로운 운세 계산
        try {
          console.log('[FortuneStore] 새로운 운세 계산:', { birthInfo, date: dateKey });
          const fortune = calculateDailyFortune(birthInfo, date);

          // 상태 업데이트
          set({
            dailyFortune: fortune,
            lastCalculatedDate: dateKey,
            lastBirthInfo: birthInfo,
          });

          console.log('[FortuneStore] 운세 계산 완료 및 저장:', fortune);
          return fortune;
        } catch (error) {
          console.error('[FortuneStore] 운세 계산 실패:', error);
          return null;
        }
      },

      clearCache: () => {
        console.log('[FortuneStore] 캐시 초기화');
        set({
          dailyFortune: null,
          lastCalculatedDate: null,
          lastBirthInfo: null,
        });
      },
    }),
    {
      name: 'fortune-storage',
      partialize: (state) => ({
        // localStorage에는 운세 데이터와 메타데이터만 저장
        dailyFortune: state.dailyFortune,
        lastCalculatedDate: state.lastCalculatedDate,
        lastBirthInfo: state.lastBirthInfo,
      }),
    }
  )
);