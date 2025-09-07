import express from 'express'
import cors from 'cors'
import sqlite3 from 'sqlite3'
import path from 'path'

const app = express()
const PORT = process.env.PORT || 4015

// 미들웨어 설정
app.use(cors())
app.use(express.json())

// SQLite 데이터베이스 연결
const dbPath = path.join(__dirname, '../../data/career.db')
const db = new sqlite3.Database(dbPath)

// 데이터베이스 초기화
function initializeDatabase() {
  console.log('🚀 진로/적성 서비스 데이터베이스 초기화 시작...')
  
  // 주능력 카테고리 테이블
  db.run(`
    CREATE TABLE IF NOT EXISTS occupation_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)
  
  // 개별 직업 테이블
  db.run(`
    CREATE TABLE IF NOT EXISTS occupations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER,
      name TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES occupation_categories (id)
    )
  `)
  
  // 전공 계열 테이블  
  db.run(`
    CREATE TABLE IF NOT EXISTS major_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)
  
  // 체능 종목 테이블
  db.run(`
    CREATE TABLE IF NOT EXISTS sports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      category TEXT DEFAULT 'general',
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)
  
  // 사용자 적성 테이블 (사주와 연결)
  db.run(`
    CREATE TABLE IF NOT EXISTS user_aptitudes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      birth_date TEXT,
      birth_time TEXT,
      recommended_occupations TEXT, -- JSON 배열
      recommended_majors TEXT,      -- JSON 배열  
      recommended_sports TEXT,      -- JSON 배열
      analysis_result TEXT,         -- JSON 상세 분석
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)
  
  console.log('✅ 진로/적성 데이터베이스 테이블 생성 완료')
  insertSampleData()
}

// 샘플 데이터 삽입
function insertSampleData() {
  console.log('📊 진로/적성 샘플 데이터 삽입 시작...')
  
  // 연예 직업 카테고리
  db.run(`INSERT OR IGNORE INTO occupation_categories (name, description) VALUES (?, ?)`,
    ['연예', '연예계 관련 직업군'])
  
  // 음악 직업 카테고리
  db.run(`INSERT OR IGNORE INTO occupation_categories (name, description) VALUES (?, ?)`,
    ['음악', '음악 관련 직업군'])
  
  // 연예 직업 데이터
  const entertainmentJobs = [
    '가수', 'MC', '개그맨', '드라마배우', '뮤지컬배우', 
    '스턴트맨', '엑스트라', '연극배우', '연기자', '영화배우'
  ]
  
  entertainmentJobs.forEach(job => {
    db.run(`INSERT OR IGNORE INTO occupations (category_id, name) 
            SELECT id, ? FROM occupation_categories WHERE name = '연예'`, [job])
  })
  
  // 음악 직업 데이터
  const musicJobs = [
    '건반악기', '관악기', '대중음악', '보컬', '성악', 
    '작곡', '타악기', '현악기'
  ]
  
  musicJobs.forEach(job => {
    db.run(`INSERT OR IGNORE INTO occupations (category_id, name)
            SELECT id, ? FROM occupation_categories WHERE name = '음악'`, [job])
  })
  
  // 전공 계열 데이터
  const majors = [
    '공학계', '농생명과학계', '법정계', '사범계', '사회과학계',
    '생활과학계', '어문인문학계', '예체능계', '의치악계', '자연과학계'
  ]
  
  majors.forEach(major => {
    db.run(`INSERT OR IGNORE INTO major_categories (name) VALUES (?)`, [major])
  })
  
  // 체능 종목 데이터
  const sports = [
    '게임', '골프', '낚시', '농구', '다이빙', '당구', '등반', '라켓볼', '럭비',
    '마라톤', '모터사이클', '배구', '배드민턴', '보디빌딩', '볼링', '사격',
    '사이클', '소프트볼', '수상스키', '수영', '스노보드', '스케이트', '스쿼시',
    '스키', '야구', '요트', '윈드서핑', '육상', '정구', '조정', '체조', 
    '축구', '탁구', '테니스', '하키', '핸드볼', '헬스'
  ]
  
  sports.forEach(sport => {
    db.run(`INSERT OR IGNORE INTO sports (name) VALUES (?)`, [sport])
  })
  
  console.log('✅ 진로/적성 샘플 데이터 삽입 완료')
}

// API 라우트들
// 직업 카테고리 목록 조회
app.get('/api/career/occupation-categories', (req, res) => {
  db.all(`SELECT * FROM occupation_categories ORDER BY name`, (err, rows) => {
    if (err) {
      console.error('직업 카테고리 조회 오류:', err)
      return res.status(500).json({ success: false, error: err.message })
    }
    res.json({ success: true, data: rows })
  })
})

// 특정 카테고리의 직업 목록 조회
app.get('/api/career/occupations/:categoryId', (req, res) => {
  const { categoryId } = req.params
  
  db.all(`
    SELECT o.*, oc.name as category_name 
    FROM occupations o 
    JOIN occupation_categories oc ON o.category_id = oc.id 
    WHERE o.category_id = ? 
    ORDER BY o.name
  `, [categoryId], (err, rows) => {
    if (err) {
      console.error('직업 목록 조회 오류:', err)
      return res.status(500).json({ success: false, error: err.message })
    }
    res.json({ success: true, data: rows })
  })
})

// 모든 직업 목록 조회
app.get('/api/career/occupations', (req, res) => {
  db.all(`
    SELECT o.*, oc.name as category_name 
    FROM occupations o 
    JOIN occupation_categories oc ON o.category_id = oc.id 
    ORDER BY oc.name, o.name
  `, (err, rows) => {
    if (err) {
      console.error('전체 직업 목록 조회 오류:', err)
      return res.status(500).json({ success: false, error: err.message })
    }
    res.json({ success: true, data: rows })
  })
})

// 전공 계열 목록 조회
app.get('/api/career/majors', (req, res) => {
  db.all(`SELECT * FROM major_categories ORDER BY name`, (err, rows) => {
    if (err) {
      console.error('전공 계열 조회 오류:', err)
      return res.status(500).json({ success: false, error: err.message })
    }
    res.json({ success: true, data: rows })
  })
})

// 체능 종목 목록 조회
app.get('/api/career/sports', (req, res) => {
  db.all(`SELECT * FROM sports ORDER BY name`, (err, rows) => {
    if (err) {
      console.error('체능 종목 조회 오류:', err)
      return res.status(500).json({ success: false, error: err.message })
    }
    res.json({ success: true, data: rows })
  })
})

// 사용자 적성 분석 저장
app.post('/api/career/aptitude', (req, res) => {
  const { 
    user_id, 
    birth_date, 
    birth_time, 
    recommended_occupations, 
    recommended_majors, 
    recommended_sports, 
    analysis_result 
  } = req.body
  
  db.run(`
    INSERT OR REPLACE INTO user_aptitudes 
    (user_id, birth_date, birth_time, recommended_occupations, recommended_majors, recommended_sports, analysis_result, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `, [
    user_id, 
    birth_date, 
    birth_time,
    JSON.stringify(recommended_occupations),
    JSON.stringify(recommended_majors),
    JSON.stringify(recommended_sports),
    JSON.stringify(analysis_result)
  ], function(err) {
    if (err) {
      console.error('적성 분석 저장 오류:', err)
      return res.status(500).json({ success: false, error: err.message })
    }
    
    console.log(`✅ 사용자 ${user_id} 적성 분석 저장 완료`)
    res.status(201).json({ 
      success: true, 
      data: { id: this.lastID }
    })
  })
})

// 사용자 적성 분석 조회
app.get('/api/career/aptitude/:userId', (req, res) => {
  const { userId } = req.params
  
  db.get(`
    SELECT * FROM user_aptitudes 
    WHERE user_id = ? 
    ORDER BY updated_at DESC 
    LIMIT 1
  `, [userId], (err, row) => {
    if (err) {
      console.error('적성 분석 조회 오류:', err)
      return res.status(500).json({ success: false, error: err.message })
    }
    
    if (!row) {
      return res.status(404).json({ success: false, error: '적성 분석 데이터를 찾을 수 없습니다' })
    }
    
    // JSON 문자열을 객체로 파싱
    const result = {
      ...row,
      recommended_occupations: JSON.parse(row.recommended_occupations || '[]'),
      recommended_majors: JSON.parse(row.recommended_majors || '[]'),
      recommended_sports: JSON.parse(row.recommended_sports || '[]'),
      analysis_result: JSON.parse(row.analysis_result || '{}')
    }
    
    res.json({ success: true, data: result })
  })
})

// 서비스 상태 확인
app.get('/health', (req, res) => {
  res.json({ 
    service: 'career-service', 
    status: 'healthy', 
    timestamp: new Date().toISOString() 
  })
})

// 서버 시작
app.listen(PORT, () => {
  console.log('\n============================================================')
  console.log('✅ 운명나침반 진로/적성 서비스 시작됨')
  console.log('============================================================')
  console.log(`🌐 서버 주소: http://localhost:${PORT}`)
  console.log(`📊 상태 확인: http://localhost:${PORT}/health`)
  console.log(`📖 API 문서: http://localhost:${PORT}`)
  console.log(`🔧 환경: ${process.env.NODE_ENV || 'development'}`)
  console.log(`⏰ 시작 시간: ${new Date().toLocaleString('ko-KR')}`)
  console.log('============================================================')
  console.log('')
  console.log('🎯 주요 기능:')
  console.log('  • 직업 카테고리 및 직종 관리')
  console.log('  • 전공 계열 데이터 제공')  
  console.log('  • 체능 종목 정보 관리')
  console.log('  • 사주 기반 적성 분석')
  console.log('  • 개인별 진로 추천 시스템')
  console.log('')
  console.log('📱 연동 서비스:')
  console.log('  • 프론트엔드 웹앱 (포트 4000)')
  console.log('  • 캘린더 서비스 (포트 4012)')
  console.log('  • 추천인 서비스 (포트 4013)')
  console.log('  • 아카데미 서비스 (포트 4014)')
  console.log('')
  console.log('💡 개발팀 참고사항:')
  console.log('  • 연예/음악 직업 분류 체계화')
  console.log('  • 10개 전공 계열 완전 지원')
  console.log('  • 40개 체능 종목 데이터베이스')
  console.log('  • 사주와 연동된 적성 분석')
  console.log('============================================================')
  
  initializeDatabase()
})