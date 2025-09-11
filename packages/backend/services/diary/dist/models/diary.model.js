"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDiaryIndexes = exports.createDiaryTable = void 0;
exports.createDiaryTable = `
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
exports.createDiaryIndexes = `
  CREATE INDEX IF NOT EXISTS idx_diary_user_date 
  ON diary_entries(user_id, date);
  
  CREATE INDEX IF NOT EXISTS idx_diary_date 
  ON diary_entries(date);
  
  CREATE INDEX IF NOT EXISTS idx_diary_user 
  ON diary_entries(user_id);
`;
//# sourceMappingURL=diary.model.js.map