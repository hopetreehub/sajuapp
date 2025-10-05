import { apiClient } from './api';

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
      const response = await apiClient.get('/diary/entries');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch diary entries:', error);
      return [];
    }
  },

  async getEntry(date: string): Promise<DiaryEntry | null> {
    try {
      const response = await apiClient.get(`/diary/entries/${date}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch diary entry:', error);
      return null;
    }
  },

  async getDiaryByDate(date: string): Promise<DiaryEntry | null> {
    return this.getEntry(date);
  },

  async createEntry(entry: Omit<DiaryEntry, 'id' | 'created_at' | 'updated_at'>): Promise<DiaryEntry | null> {
    try {
      const response = await apiClient.post('/diary/entries', entry);
      return response.data;
    } catch (error) {
      console.error('Failed to create diary entry:', error);
      return null;
    }
  },

  async updateEntry(date: string, entry: Partial<DiaryEntry>): Promise<DiaryEntry | null> {
    try {
      const response = await apiClient.put(`/diary/entries/${date}`, entry);
      return response.data;
    } catch (error) {
      console.error('Failed to update diary entry:', error);
      return null;
    }
  },

  async deleteEntry(date: string): Promise<boolean> {
    try {
      await apiClient.delete(`/diary/entries/${date}`);
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