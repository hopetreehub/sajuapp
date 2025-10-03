"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeDatabase = exports.getDb = exports.initDatabase = void 0;
const sqlite3_1 = __importDefault(require("sqlite3"));
const sqlite_1 = require("sqlite");
const path_1 = __importDefault(require("path"));
const logger_1 = __importDefault(require("../utils/logger"));
const tag_model_1 = require("../models/tag.model");
let db = null;
const initDatabase = async () => {
    try {
        const dbPath = path_1.default.join(__dirname, '../../', 'calendar.db');
        db = await (0, sqlite_1.open)({
            filename: dbPath,
            driver: sqlite3_1.default.Database
        });
        logger_1.default.info('SQLite database connection established successfully');
        // Enable foreign keys
        await db.exec('PRAGMA foreign_keys = ON');
        // Create tables
        await createTables();
    }
    catch (error) {
        logger_1.default.error('Failed to connect to database:', error);
        throw error;
    }
};
exports.initDatabase = initDatabase;
const getDb = () => {
    if (!db) {
        throw new Error('Database not initialized');
    }
    return db;
};
exports.getDb = getDb;
const createTables = async () => {
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
  `;
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
  `;
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
  `;
    const createTodosTableQuery = `
    CREATE TABLE IF NOT EXISTS todos (
      id TEXT PRIMARY KEY,
      customer_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      date TEXT NOT NULL,
      priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
      completed INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `;
    const createIndexesQuery = `
    CREATE INDEX IF NOT EXISTS idx_events_user_date
    ON calendar_events(user_id, start_datetime);

    CREATE INDEX IF NOT EXISTS idx_events_date_range
    ON calendar_events(start_datetime, end_datetime);

    CREATE INDEX IF NOT EXISTS idx_diary_user_date
    ON diary_entries(user_id, date);

    CREATE INDEX IF NOT EXISTS idx_users_email
    ON users(email);

    CREATE INDEX IF NOT EXISTS idx_todos_customer_date
    ON todos(customer_id, date);

    CREATE INDEX IF NOT EXISTS idx_todos_completed
    ON todos(completed);
  `;
    try {
        await db.exec(createUsersTableQuery);
        await db.exec(createEventsTableQuery);
        await db.exec(createDiaryTableQuery);
        await db.exec(createTodosTableQuery);
        await db.exec(tag_model_1.createTagTable);
        await db.exec(tag_model_1.createEventTagTable);
        await db.exec(createIndexesQuery);
        // Insert a default user for testing
        const defaultUser = `
      INSERT OR IGNORE INTO users (id, email, username)
      VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'test@example.com', 'Test User')
    `;
        await db.exec(defaultUser);
        // Insert default tags for testing
        const defaultTags = `
      INSERT OR IGNORE INTO tags (id, name, color, user_id)
      VALUES 
        ('tag-1', '업무', '#3B82F6', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
        ('tag-2', '개인', '#10B981', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
        ('tag-3', '가족', '#F59E0B', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
        ('tag-4', '중요', '#EF4444', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
        ('tag-5', '건강', '#8B5CF6', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
    `;
        await db.exec(defaultTags);
        logger_1.default.info('Database tables created/verified successfully');
    }
    catch (error) {
        logger_1.default.error('Failed to create tables:', error);
        throw error;
    }
};
const closeDatabase = async () => {
    if (db) {
        await db.close();
        logger_1.default.info('Database connection closed');
    }
};
exports.closeDatabase = closeDatabase;
//# sourceMappingURL=sqlite-connection.js.map