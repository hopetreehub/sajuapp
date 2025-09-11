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
const diary_model_1 = require("../models/diary.model");
let db = null;
const initDatabase = async () => {
    try {
        const dbPath = path_1.default.join(__dirname, '../../', 'diary.db');
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
    try {
        // Create diary table
        await db.exec(diary_model_1.createDiaryTable);
        // Create indexes
        await db.exec(diary_model_1.createDiaryIndexes);
        // Add images column if it doesn't exist (migration)
        try {
            await db.exec(`ALTER TABLE diary_entries ADD COLUMN images TEXT`);
            logger_1.default.info('Added images column to diary_entries table');
        }
        catch (error) {
            // Column might already exist, which is fine
            if (!error.message.includes('duplicate column name')) {
                logger_1.default.debug('Images column already exists or other error:', error.message);
            }
        }
        // Create default user for testing
        const defaultUser = `
      INSERT OR IGNORE INTO diary_entries (id, user_id, date, content, mood)
      VALUES ('sample-1', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', date('now'), 
              '오늘은 날씨가 좋아서 기분이 좋았다. 새로운 프로젝트를 시작했다.', '😊')
    `;
        await db.exec(defaultUser);
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
//# sourceMappingURL=connection.js.map