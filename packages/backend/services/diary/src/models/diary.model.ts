export interface DiaryEntry {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD format
  content: string;
  mood: string; // emoji or mood descriptor
  weather?: string;
  tags?: string[]; // Array of tag strings
  created_at: string;
  updated_at: string;
}

export const createDiaryTable = `
  CREATE TABLE IF NOT EXISTS diary_entries (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    date TEXT NOT NULL,
    content TEXT NOT NULL,
    mood TEXT,
    weather TEXT,
    tags TEXT, -- JSON array stored as text
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, date)
  )
`;

export const createDiaryIndexes = `
  CREATE INDEX IF NOT EXISTS idx_diary_user_date 
  ON diary_entries(user_id, date);
  
  CREATE INDEX IF NOT EXISTS idx_diary_date 
  ON diary_entries(date);
  
  CREATE INDEX IF NOT EXISTS idx_diary_user 
  ON diary_entries(user_id);
`;