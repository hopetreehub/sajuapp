import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

let db: Database | null = null;

/**
 * 데이터베이스 초기화
 */
export async function initDatabase(): Promise<Database> {
  if (db) {
    return db;
  }

  const dbPath = process.env.DB_PATH || path.join(__dirname, '../../qimen-shares.db');

  db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  // qimen_shares 테이블 생성
  await db.exec(`
    CREATE TABLE IF NOT EXISTS qimen_shares (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      uuid TEXT NOT NULL UNIQUE,
      chart_data TEXT NOT NULL,
      date_time TEXT NOT NULL,
      customer_name TEXT,
      customer_birth_date TEXT,
      context TEXT NOT NULL,
      note TEXT,
      tags TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      view_count INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT 1
    );

    CREATE INDEX IF NOT EXISTS idx_uuid ON qimen_shares(uuid);
    CREATE INDEX IF NOT EXISTS idx_created_at ON qimen_shares(created_at);
    CREATE INDEX IF NOT EXISTS idx_is_active ON qimen_shares(is_active);
  `);

  console.log('✅ Database initialized:', dbPath);

  return db;
}

/**
 * 데이터베이스 연결 가져오기
 */
export async function getDatabase(): Promise<Database> {
  if (!db) {
    return initDatabase();
  }
  return db;
}

/**
 * 데이터베이스 연결 종료
 */
export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.close();
    db = null;
    console.log('📪 Database connection closed');
  }
}
