// 사용자 프로필 저장 및 관리 유틸리티
import { UserProfile, UserStorage, AnalysisType } from '@/types/user';
import { SajuBirthInfo } from '@/types/saju';

const USER_STORAGE_KEY = 'sajuapp-user-storage';

// LocalStorage에서 사용자 데이터 로드
export const loadUserStorage = (): UserStorage => {
  try {
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('사용자 데이터 로드 실패:', error);
  }

  return {
    profiles: [],
    currentUserId: null,
    lastUpdated: new Date().toISOString(),
  };
};

// LocalStorage에 사용자 데이터 저장
export const saveUserStorage = (storage: UserStorage): void => {
  try {
    storage.lastUpdated = new Date().toISOString();
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(storage));
  } catch (error) {
    console.error('사용자 데이터 저장 실패:', error);
  }
};

// 새 사용자 프로필 생성
export const createUserProfile = (name: string, birthInfo: SajuBirthInfo): UserProfile => {
  return {
    id: generateUUID(),
    name: name.trim(),
    birthInfo,
    createdAt: new Date().toISOString(),
    lastAccessed: new Date().toISOString(),
    analysisHistory: [],
    memo: undefined,
  };
};

// 사용자 프로필 추가
export const addUserProfile = (name: string, birthInfo: SajuBirthInfo): UserProfile => {
  const storage = loadUserStorage();
  const newProfile = createUserProfile(name, birthInfo);
  
  storage.profiles.push(newProfile);
  storage.currentUserId = newProfile.id;
  saveUserStorage(storage);
  
  return newProfile;
};

// 사용자 프로필 업데이트
export const updateUserProfile = (userId: string, updates: Partial<UserProfile>): UserProfile | null => {
  const storage = loadUserStorage();
  const profileIndex = storage.profiles.findIndex(p => p.id === userId);
  
  if (profileIndex === -1) return null;
  
  storage.profiles[profileIndex] = {
    ...storage.profiles[profileIndex],
    ...updates,
    lastAccessed: new Date().toISOString(),
  };
  
  saveUserStorage(storage);
  return storage.profiles[profileIndex];
};

// 사용자 프로필 삭제
export const deleteUserProfile = (userId: string): boolean => {
  const storage = loadUserStorage();
  const initialLength = storage.profiles.length;
  
  storage.profiles = storage.profiles.filter(p => p.id !== userId);
  
  if (storage.currentUserId === userId) {
    storage.currentUserId = storage.profiles.length > 0 ? storage.profiles[0].id : null;
  }
  
  if (storage.profiles.length !== initialLength) {
    saveUserStorage(storage);
    return true;
  }
  
  return false;
};

// 현재 사용자 선택
export const setCurrentUser = (userId: string): UserProfile | null => {
  const storage = loadUserStorage();
  const profile = storage.profiles.find(p => p.id === userId);
  
  if (profile) {
    storage.currentUserId = userId;
    updateUserProfile(userId, { lastAccessed: new Date().toISOString() });
    return profile;
  }
  
  return null;
};

// 현재 사용자 가져오기
export const getCurrentUser = (): UserProfile | null => {
  const storage = loadUserStorage();
  
  if (!storage.currentUserId) return null;
  
  return storage.profiles.find(p => p.id === storage.currentUserId) || null;
};

// 모든 사용자 프로필 가져오기
export const getAllUserProfiles = (): UserProfile[] => {
  const storage = loadUserStorage();
  return storage.profiles.sort((a, b) => 
    new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime(),
  );
};

// 분석 히스토리 추가
export const addAnalysisHistory = (userId: string, analysisType: AnalysisType): boolean => {
  const storage = loadUserStorage();
  const profile = storage.profiles.find(p => p.id === userId);
  
  if (profile) {
    if (!profile.analysisHistory.includes(analysisType)) {
      profile.analysisHistory.push(analysisType);
      profile.lastAccessed = new Date().toISOString();
      saveUserStorage(storage);
      return true;
    }
  }
  
  return false;
};

// 사용자 이름으로 검색
export const findUsersByName = (nameQuery: string): UserProfile[] => {
  const storage = loadUserStorage();
  const query = nameQuery.trim().toLowerCase();
  
  if (!query) return storage.profiles;
  
  return storage.profiles.filter(profile => 
    profile.name.toLowerCase().includes(query),
  );
};

// UUID 생성 함수
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// 생년월일 형식화 함수
export const formatBirthDate = (birthInfo: SajuBirthInfo): string => {
  const { year, month, day, hour } = birthInfo;
  return `${year}년 ${month}월 ${day}일 ${hour}시`;
};

// 날짜 형식화 함수
export const formatDate = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};