export interface DiaryEntry {
    id: string;
    user_id: string;
    date: string;
    content: string;
    mood: string;
    weather?: string;
    tags?: string[];
    images?: string[];
    created_at: string;
    updated_at: string;
}
export declare const createDiaryTable = "\n  CREATE TABLE IF NOT EXISTS diary_entries (\n    id TEXT PRIMARY KEY,\n    user_id TEXT NOT NULL,\n    date TEXT NOT NULL,\n    content TEXT NOT NULL,\n    mood TEXT,\n    weather TEXT,\n    tags TEXT, -- JSON array stored as text\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    UNIQUE(user_id, date)\n  )\n";
export declare const createDiaryIndexes = "\n  CREATE INDEX IF NOT EXISTS idx_diary_user_date \n  ON diary_entries(user_id, date);\n  \n  CREATE INDEX IF NOT EXISTS idx_diary_date \n  ON diary_entries(date);\n  \n  CREATE INDEX IF NOT EXISTS idx_diary_user \n  ON diary_entries(user_id);\n";
//# sourceMappingURL=diary.model.d.ts.map