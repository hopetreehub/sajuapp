import apiClient from './api';

export interface DiaryEntry {
  id?: string;
  date: string;
  content: string;
  mood?: string;
  tags?: string[];
  images?: string[];
  created_at?: string;
  updated_at?: string;
}

export const diaryService = {
  async getEntries(): Promise<DiaryEntry[]> {
    try {
      const response = await apiClient.get('/diaries');
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch diary entries:', error);
      return [];
    }
  },

  async getEntry(date: string): Promise<DiaryEntry | null> {
    try {
      const response = await apiClient.get(`/diaries`, {
        params: { date }
      });
      return response.data.data;
    } catch (error: any) {
      // 404는 정상 상황 (해당 날짜에 일기가 없음)
      if (error.response?.status === 404) {
        return null;
      }
      console.error('Failed to fetch diary entry:', error);
      return null;
    }
  },

  async getDiaryByDate(date: string): Promise<DiaryEntry | null> {
    return this.getEntry(date);
  },

  async createEntry(entry: Omit<DiaryEntry, 'id' | 'created_at' | 'updated_at'>): Promise<DiaryEntry> {
    try {
      const response = await apiClient.post('/diaries', entry);
      return response.data.data;
    } catch (error) {
      console.error('Failed to create diary entry:', error);
      throw error; // 에러를 다시 throw하여 호출자가 처리하도록 함
    }
  },

  async updateEntry(date: string, entry: Partial<DiaryEntry>): Promise<DiaryEntry> {
    try {
      // 날짜로 일기를 찾아서 ID를 가져옴
      const existingDiary = await this.getDiaryByDate(date);
      if (!existingDiary || !existingDiary.id) {
        throw new Error('Diary not found for date: ' + date);
      }

      const response = await apiClient.put(`/diaries`, entry, {
        params: { id: existingDiary.id }
      });
      return response.data.data;
    } catch (error) {
      console.error('Failed to update diary entry:', error);
      throw error; // 에러를 다시 throw하여 호출자가 처리하도록 함
    }
  },

  async deleteEntry(date: string): Promise<boolean> {
    try {
      // 날짜로 일기를 찾아서 ID를 가져옴
      const existingDiary = await this.getDiaryByDate(date);
      if (!existingDiary || !existingDiary.id) {
        return false;
      }

      await apiClient.delete(`/diaries`, {
        params: { id: existingDiary.id }
      });
      return true;
    } catch (error) {
      console.error('Failed to delete diary entry:', error);
      return false;
    }
  },

  async saveDiary(date: string, content: string, mood?: string): Promise<DiaryEntry | null> {
    const existingEntry = await this.getEntry(date);
    if (existingEntry) {
      return this.updateEntry(date, { content, mood });
    } else {
      return this.createEntry({ date, content, mood });
    }
  },
};