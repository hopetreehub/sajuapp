import sqlite3 from 'sqlite3'
import path from 'path'

const dbPath = path.join(__dirname, '../../../data/saju.db')
const db = new sqlite3.Database(dbPath)

console.log('📊 사주 점수 시스템 데이터베이스 스키마 업데이트 시작...\n')

db.serialize(() => {
  // 트랜잭션 시작
  db.run('BEGIN TRANSACTION', (err) => {
    if (err) {
      console.error('❌ 트랜잭션 시작 실패:', err)
      db.close()
      return
    }

    console.log('1️⃣ saju_scores 테이블 생성...')
    
    // 사주 점수 저장 테이블 생성
    db.run(`
      CREATE TABLE IF NOT EXISTS saju_scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        category_type TEXT CHECK(category_type IN ('positive', 'negative')) NOT NULL,
        category_name TEXT NOT NULL,
        
        -- 시점별 점수
        base_score INTEGER DEFAULT 50,
        daily_score INTEGER,
        monthly_score INTEGER,
        yearly_score INTEGER,
        
        -- 메타데이터
        calculated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        saju_data JSON,
        
        -- 복합 유니크 키
        UNIQUE(user_id, category_type, category_name)
      )
    `, (err) => {
      if (err) {
        console.error('❌ saju_scores 테이블 생성 실패:', err)
      } else {
        console.log('✅ saju_scores 테이블 생성 완료')
      }
    })

    // 인덱스 생성
    console.log('2️⃣ 인덱스 생성...')
    
    db.run(`
      CREATE INDEX IF NOT EXISTS idx_user_scores 
      ON saju_scores(user_id, category_type)
    `, (err) => {
      if (err) {
        console.error('❌ idx_user_scores 인덱스 생성 실패:', err)
      } else {
        console.log('✅ idx_user_scores 인덱스 생성 완료')
      }
    })

    db.run(`
      CREATE INDEX IF NOT EXISTS idx_calculated_date 
      ON saju_scores(calculated_at)
    `, (err) => {
      if (err) {
        console.error('❌ idx_calculated_date 인덱스 생성 실패:', err)
      } else {
        console.log('✅ idx_calculated_date 인덱스 생성 완료')
      }
    })

    console.log('3️⃣ minor_categories 테이블 컬럼 추가...')
    
    // 카테고리 가중치 컬럼 추가 (이미 있으면 무시)
    db.run(`
      ALTER TABLE minor_categories 
      ADD COLUMN base_weight REAL DEFAULT 1.0
    `, (err) => {
      if (err && !err.message.includes('duplicate column')) {
        console.error('⚠️ base_weight 컬럼 추가 실패 (이미 존재할 수 있음):', err.message)
      } else {
        console.log('✅ base_weight 컬럼 추가/확인 완료')
      }
    })

    db.run(`
      ALTER TABLE minor_categories 
      ADD COLUMN temporal_weight JSON
    `, (err) => {
      if (err && !err.message.includes('duplicate column')) {
        console.error('⚠️ temporal_weight 컬럼 추가 실패 (이미 존재할 수 있음):', err.message)
      } else {
        console.log('✅ temporal_weight 컬럼 추가/확인 완료')
      }
    })

    console.log('4️⃣ 점수 캐시 테이블 생성...')
    
    // 점수 캐시 테이블 (빠른 조회용)
    db.run(`
      CREATE TABLE IF NOT EXISTS score_cache (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        cache_key TEXT NOT NULL,
        cache_value JSON NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        
        UNIQUE(user_id, cache_key)
      )
    `, (err) => {
      if (err) {
        console.error('❌ score_cache 테이블 생성 실패:', err)
      } else {
        console.log('✅ score_cache 테이블 생성 완료')
      }
    })

    // 모든 작업 완료 후 커밋
    setTimeout(() => {
      db.run('COMMIT', (err) => {
        if (err) {
          console.error('❌ 커밋 실패:', err)
          db.run('ROLLBACK')
        } else {
          console.log('\n' + '='.repeat(60))
          console.log('✨ 데이터베이스 스키마 업데이트 완료!')
          console.log('='.repeat(60))
          
          // 테이블 정보 출력
          db.all(`
            SELECT name FROM sqlite_master 
            WHERE type='table' 
            ORDER BY name
          `, (err, tables: any[]) => {
            if (!err) {
              console.log('\n📋 현재 테이블 목록:')
              tables.forEach(t => console.log(`   - ${t.name}`))
            }
            db.close()
          })
        }
      })
    }, 1000)
  })
})