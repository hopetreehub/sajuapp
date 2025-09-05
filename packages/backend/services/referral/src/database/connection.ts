import sqlite3 from 'sqlite3'
import { Database } from 'sqlite3'
import path from 'path'
import fs from 'fs'

class DatabaseConnection {
  private static instance: Database | null = null
  private static readonly DB_PATH = path.join(__dirname, '../../../data/referral.db')

  static async getInstance(): Promise<Database> {
    if (!this.instance) {
      // 데이터베이스 디렉토리 생성
      const dbDir = path.dirname(this.DB_PATH)
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true })
      }

      this.instance = new sqlite3.Database(this.DB_PATH)
      
      // 외래키 제약조건 활성화
      await this.query('PRAGMA foreign_keys = ON')
      
      console.log(`✅ 추천인 시스템 데이터베이스 연결 성공: ${this.DB_PATH}`)
    }
    
    return this.instance
  }

  static async query(sql: string, params: any[] = []): Promise<any[]> {
    const db = await this.getInstance()
    
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) {
          console.error('❌ 쿼리 실행 실패:', err.message)
          reject(err)
        } else {
          resolve(rows || [])
        }
      })
    })
  }

  static async run(sql: string, params: any[] = []): Promise<{ lastID: number; changes: number }> {
    const db = await this.getInstance()
    
    return new Promise((resolve, reject) => {
      db.run(sql, params, function(err) {
        if (err) {
          console.error('❌ 쿼리 실행 실패:', err.message)
          reject(err)
        } else {
          resolve({ 
            lastID: this.lastID, 
            changes: this.changes 
          })
        }
      })
    })
  }

  static async get(sql: string, params: any[] = []): Promise<any> {
    const db = await this.getInstance()
    
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) {
          console.error('❌ 쿼리 실행 실패:', err.message)
          reject(err)
        } else {
          resolve(row)
        }
      })
    })
  }

  static async close(): Promise<void> {
    if (this.instance) {
      return new Promise((resolve, reject) => {
        this.instance!.close((err) => {
          if (err) {
            console.error('❌ 데이터베이스 연결 종료 실패:', err.message)
            reject(err)
          } else {
            console.log('✅ 추천인 시스템 데이터베이스 연결 종료')
            this.instance = null
            resolve()
          }
        })
      })
    }
  }
}

export default DatabaseConnection