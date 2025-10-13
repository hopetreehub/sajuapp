/**
 * 타로 카드 기록 타입 정의
 */

import type { TarotCard } from '@/data/tarotCards';

export interface TarotReading {
  id: string;
  userId: number;
  spreadId: string;
  spreadName: string;
  question: string;
  cards: TarotCardReading[];
  aiInterpretation: string;
  createdAt: string;
}

export interface TarotCardReading {
  card: TarotCard;
  position: number;
  positionName: string;
  positionMeaning: string;
  isReversed: boolean;
}

export interface TarotHistory {
  readings: TarotReading[];
  totalCount: number;
}
