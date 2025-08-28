// 사용자 프로필 관리 타입 정의
import { SajuBirthInfo } from './saju';

export interface UserProfile {
  id: string;                    // UUID로 고유 식별
  name: string;                  // 사용자 이름
  birthInfo: SajuBirthInfo;      // 생년월일시 정보
  createdAt: string;             // 생성일시 (ISO string)
  lastAccessed: string;          // 마지막 접근일시 (ISO string)
  analysisHistory: string[];     // 분석 히스토리 (분석 타입들)
  memo?: string;                 // 상담 메모 (선택사항)
}

export interface UserStorage {
  profiles: UserProfile[];       // 모든 사용자 프로필
  currentUserId: string | null;  // 현재 선택된 사용자 ID
  lastUpdated: string;           // 마지막 업데이트 시간
}

// 분석 타입 열거
export enum AnalysisType {
  FORTUNE = 'fortune',           // 오늘의 운세
  SIX_AREA = 'six_area',         // 6대 영역
  SEVENTEEN = 'seventeen',       // 17대 운세
  PERSONALITY = 'personality'    // 7대 성향
}

// 사용자 관리 액션 타입
export interface UserAction {
  type: 'ADD_USER' | 'UPDATE_USER' | 'DELETE_USER' | 'SELECT_USER' | 'ADD_ANALYSIS';
  payload?: any;
}