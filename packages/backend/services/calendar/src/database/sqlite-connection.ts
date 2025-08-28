import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import path from 'path'
import logger from '../utils/logger'

let db: any = null

export const initDatabase = async (): Promise<void> => {
  try {
    const dbPath = path.join(__dirname, '../../', 'calendar.db')
    
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    })
    
    logger.info('SQLite database connection established successfully')
    
    // Enable foreign keys
    await db.exec('PRAGMA foreign_keys = ON')
    
    // Create tables
    await createTables()
  } catch (error) {
    logger.error('Failed to connect to database:', error)
    throw error
  }
}

export const getDb = () => {
  if (!db) {
    throw new Error('Database not initialized')
  }
  return db
}

const createTables = async (): Promise<void> => {
  const createUsersTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      username TEXT,
      password_hash TEXT,
      timezone TEXT DEFAULT 'Asia/Seoul',
      week_starts_on INTEGER DEFAULT 0,
      default_view TEXT DEFAULT 'month',
      show_lunar_calendar INTEGER DEFAULT 1,
      show_fortune INTEGER DEFAULT 1,
      theme TEXT DEFAULT 'light',
      language TEXT DEFAULT 'ko',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `

  const createEventsTableQuery = `
    CREATE TABLE IF NOT EXISTS calendar_events (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      start_datetime TEXT NOT NULL,
      end_datetime TEXT NOT NULL,
      is_all_day INTEGER DEFAULT 0,
      color TEXT DEFAULT '#3B82F6',
      category TEXT,
      location TEXT,
      recurrence_rule TEXT,
      reminders TEXT,
      attendees TEXT,
      diary_linked INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `

  const createDiaryTableQuery = `
    CREATE TABLE IF NOT EXISTS diary_entries (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      date TEXT NOT NULL,
      content TEXT,
      mood INTEGER CHECK (mood >= 1 AND mood <= 5),
      weather TEXT,
      tags TEXT,
      linked_events TEXT,
      fortune_data TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, date),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `

  const createIndexesQuery = `
    CREATE INDEX IF NOT EXISTS idx_events_user_date 
    ON calendar_events(user_id, start_datetime);
    
    CREATE INDEX IF NOT EXISTS idx_events_date_range
    ON calendar_events(start_datetime, end_datetime);
    
    CREATE INDEX IF NOT EXISTS idx_diary_user_date
    ON diary_entries(user_id, date);
    
    CREATE INDEX IF NOT EXISTS idx_users_email
    ON users(email);
  `

  try {
    await db.exec(createUsersTableQuery)
    await db.exec(createEventsTableQuery)
    await db.exec(createDiaryTableQuery)
    await db.exec(createIndexesQuery)
    
    // Insert a default user for testing
    const defaultUser = `
      INSERT OR IGNORE INTO users (id, email, username)
      VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'test@example.com', 'Test User')
    `
    await db.exec(defaultUser)
    
    logger.info('Database tables created/verified successfully')
  } catch (error) {
    logger.error('Failed to create tables:', error)
    throw error
  }
}

export const closeDatabase = async (): Promise<void> => {
  if (db) {
    await db.close()
    logger.info('Database connection closed')
  }
}