import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';
import { logger } from '@/utils/logger.util';

const DB_PATH = process.env.DATABASE_PATH || './auth.db';
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');
const SEED_PATH = path.join(__dirname, 'seed.sql');

let db: sqlite3.Database | null = null;

/**
 * Database wrapper with promisified methods
 */
export class Database {
  private db: sqlite3.Database;

  constructor(dbInstance: sqlite3.Database) {
    this.db = dbInstance;
  }

  run(sql: string, params: any[] = []): Promise<{ lastID: number; changes: number }> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  }

  get<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row as T);
      });
    });
  }

  all<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows as T[]);
      });
    });
  }

  exec(sql: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.exec(sql, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  // 동기식 메서드 (better-sqlite3 호환)
  prepare(sql: string) {
    return {
      run: (...params: any[]) => this.run(sql, params),
      get: <T = any>(...params: any[]) => this.get<T>(sql, params),
      all: <T = any>(...params: any[]) => this.all<T>(sql, params),
    };
  }
}

/**
 * 데이터베이스 초기화
 */
export async function initializeDatabase(): Promise<Database> {
  return new Promise((resolve, reject) => {
    const dbInstance = new sqlite3.Database(DB_PATH, async (err) => {
      if (err) {
        logger.error('Failed to connect to database:', err);
        reject(err);
        return;
      }

      logger.info(`Database connected: ${DB_PATH}`);
      db = dbInstance;
      const database = new Database(dbInstance);

      try {
        // WAL 모드 활성화
        await database.run('PRAGMA journal_mode = WAL');
        await database.run('PRAGMA foreign_keys = ON');

        // 스키마 생성
        await createSchema(database);

        // 초기 관리자 계정 생성
        await createInitialAdmin(database);

        resolve(database);
      } catch (error) {
        logger.error('Database initialization failed:', error);
        reject(error);
      }
    });
  });
}

/**
 * 스키마 생성
 */
async function createSchema(database: Database): Promise<void> {
  try {
    const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');
    await database.exec(schema);
    logger.info('Database schema created successfully');
  } catch (error) {
    logger.error('Failed to create schema:', error);
    throw error;
  }
}

/**
 * 초기 관리자 계정 생성
 */
async function createInitialAdmin(database: Database): Promise<void> {
  try {
    const adminEmail = process.env.INITIAL_ADMIN_EMAIL || 'admin@sajuapp.com';
    const adminPassword = process.env.INITIAL_ADMIN_PASSWORD || 'Admin123!ChangeMeNow';

    // 이미 관리자가 있는지 확인
    const existingAdmin = await database.get(
      'SELECT id FROM users WHERE role = ?',
      ['super_admin']
    );

    if (existingAdmin) {
      logger.info('Super admin already exists, skipping initialization');
      return;
    }

    // 비밀번호 해시
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10');
    const passwordHash = await bcrypt.hash(adminPassword, saltRounds);

    // 관리자 계정 생성
    await database.run(
      `INSERT INTO users (
        email, username, password_hash, role, approval_status,
        approved_at, created_at
      ) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [adminEmail, 'Super Admin', passwordHash, 'super_admin', 'approved']
    );

    logger.info(`✅ Initial super admin created: ${adminEmail}`);
    logger.warn(`⚠️  Default password: ${adminPassword}`);
    logger.warn('⚠️  Please change this password immediately!');
  } catch (error) {
    logger.error('Failed to create initial admin:', error);
    throw error;
  }
}

/**
 * 데이터베이스 인스턴스 반환
 */
export function getDatabase(): Database {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return new Database(db);
}

/**
 * 데이터베이스 연결 종료
 */
export async function closeDatabase(): Promise<void> {
  if (db) {
    const database = new Database(db);
    await database.close();
    db = null;
    logger.info('Database connection closed');
  }
}

export default {
  initializeDatabase,
  getDatabase,
  closeDatabase,
};
