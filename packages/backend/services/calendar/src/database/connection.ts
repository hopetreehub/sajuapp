import { Pool } from 'pg'
import logger from '../utils/logger'

let pool: Pool | null = null

export const initDatabase = async (): Promise<void> => {
  try {
    pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '4006'),
      database: process.env.DB_NAME || 'fortune_calendar',
      user: process.env.DB_USER || 'admin',
      password: process.env.DB_PASSWORD || 'secure_password_change_me',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    })

    // Test the connection
    const client = await pool.connect()
    await client.query('SELECT NOW()')
    client.release()
    
    logger.info('Database connection established successfully')
    
    // Create tables if they don't exist
    await createTables()
  } catch (error) {
    logger.error('Failed to connect to database:', error)
    throw error
  }
}

export const getPool = (): Pool => {
  if (!pool) {
    throw new Error('Database pool not initialized')
  }
  return pool
}

const createTables = async (): Promise<void> => {
  const createEventsTableQuery = `
    CREATE TABLE IF NOT EXISTS calendar_events (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
      end_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
      is_all_day BOOLEAN DEFAULT FALSE,
      color VARCHAR(7) DEFAULT '#3B82F6',
      category VARCHAR(50),
      location VARCHAR(255),
      recurrence_rule JSONB,
      reminders JSONB,
      attendees TEXT[],
      diary_linked BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_events_user_date 
    ON calendar_events(user_id, start_datetime);
    
    CREATE INDEX IF NOT EXISTS idx_events_date_range
    ON calendar_events(start_datetime, end_datetime);
  `

  const createDiaryTableQuery = `
    CREATE TABLE IF NOT EXISTS diary_entries (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL,
      date DATE NOT NULL,
      content TEXT,
      mood INTEGER CHECK (mood >= 1 AND mood <= 5),
      weather VARCHAR(50),
      tags TEXT[],
      linked_events UUID[],
      fortune_data JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, date)
    );

    CREATE INDEX IF NOT EXISTS idx_diary_user_date
    ON diary_entries(user_id, date DESC);
  `

  const createUsersTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE NOT NULL,
      username VARCHAR(100),
      password_hash VARCHAR(255),
      timezone VARCHAR(50) DEFAULT 'Asia/Seoul',
      week_starts_on INTEGER DEFAULT 0,
      default_view VARCHAR(20) DEFAULT 'month',
      show_lunar_calendar BOOLEAN DEFAULT TRUE,
      show_fortune BOOLEAN DEFAULT TRUE,
      theme VARCHAR(20) DEFAULT 'light',
      language VARCHAR(10) DEFAULT 'ko',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_users_email
    ON users(email);
  `

  try {
    const client = await pool!.connect()
    
    await client.query(createUsersTableQuery)
    await client.query(createEventsTableQuery)
    await client.query(createDiaryTableQuery)
    
    client.release()
    logger.info('Database tables created/verified successfully')
  } catch (error) {
    logger.error('Failed to create tables:', error)
    throw error
  }
}

export const closeDatabase = async (): Promise<void> => {
  if (pool) {
    await pool.end()
    logger.info('Database connection closed')
  }
}