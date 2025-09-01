import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import logger from '../utils/logger';
import { createDiaryTable, createDiaryIndexes } from '../models/diary.model';

let db: any = null;

export const initDatabase = async (): Promise<void> => {
  try {
    const dbPath = path.join(__dirname, '../../', 'diary.db');
    
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    
    logger.info('SQLite database connection established successfully');
    
    // Enable foreign keys
    await db.exec('PRAGMA foreign_keys = ON');
    
    // Create tables
    await createTables();
  } catch (error) {
    logger.error('Failed to connect to database:', error);
    throw error;
  }
};

export const getDb = () => {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
};

const createTables = async (): Promise<void> => {
  try {
    // Create diary table
    await db.exec(createDiaryTable);
    
    // Create indexes
    await db.exec(createDiaryIndexes);
    
    // Create default user for testing
    const defaultUser = `
      INSERT OR IGNORE INTO diary_entries (id, user_id, date, content, mood)
      VALUES ('sample-1', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', date('now'), 
              '오늘은 날씨가 좋아서 기분이 좋았다. 새로운 프로젝트를 시작했다.', '😊')
    `;
    await db.exec(defaultUser);
    
    logger.info('Database tables created/verified successfully');
  } catch (error) {
    logger.error('Failed to create tables:', error);
    throw error;
  }
};

export const closeDatabase = async (): Promise<void> => {
  if (db) {
    await db.close();
    logger.info('Database connection closed');
  }
};