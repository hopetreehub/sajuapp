import * as sqlite3 from 'sqlite3'
import * as fs from 'fs'
import * as path from 'path'

sqlite3.verbose()

export class AcademyDatabase {
  private db: sqlite3.Database
  private dbPath: string

  constructor(dbPath: string = './academy.db') {
    this.dbPath = dbPath
    this.db = new sqlite3.Database(dbPath)
  }

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const schemaPath = path.join(__dirname, 'schema.sql')
        const schema = fs.readFileSync(schemaPath, 'utf8')
        
        this.db.exec(schema, (err) => {
          if (err) {
            console.error('❌ 아카데미 데이터베이스 초기화 실패:', err)
            reject(err)
          } else {
            console.log('✅ 아카데미 데이터베이스 초기화 완료:', this.dbPath)
            resolve()
          }
        })
      } catch (error) {
        console.error('❌ 스키마 파일 읽기 실패:', error)
        reject(error)
      }
    })
  }

  async seedSampleData(): Promise<void> {
    return new Promise((resolve, reject) => {
      const sampleData = `
        -- 샘플 강사 데이터
        INSERT OR IGNORE INTO instructors (id, name, email, bio, expertise, is_verified) VALUES 
        ('instructor_1', '김사주', 'kim.saju@fortune.com', '30년 경력의 사주학 전문가', '["기초사주", "운세해석", "궁합분석"]', 1),
        ('instructor_2', '박운세', 'park.unse@fortune.com', '전통 역학 연구소 소장', '["고급사주", "택일", "풍수지리"]', 1);

        -- 샘플 강좌 데이터
        INSERT OR IGNORE INTO courses (
          id, title, description, level, category, instructor_id, price, 
          is_free, tags, learning_objectives, target_audience, status
        ) VALUES 
        (
          'course_basic_saju', 
          '기초 사주학 완전정복', 
          '사주학의 기본 원리부터 실전 해석까지 체계적으로 배우는 입문 과정입니다.',
          'beginner',
          'basic',
          'instructor_1',
          199000,
          0,
          '["사주학", "기초", "입문", "사주풀이"]',
          '["사주의 기본 구조 이해", "십성 해석 능력", "기본적인 운세 해석"]',
          '["사주학 입문자", "취미로 사주를 배우고 싶은 분", "전문가 과정 준비생"]',
          'published'
        ),
        (
          'course_compatibility', 
          '궁합과 인간관계 사주학', 
          '사주를 통한 궁합 분석과 인간관계 개선 방법을 배웁니다.',
          'intermediate',
          'compatibility',
          'instructor_1',
          299000,
          0,
          '["궁합", "인간관계", "사주궁합", "연애운"]',
          '["궁합 분석 방법", "관계 개선 조언", "결혼 적합성 판단"]',
          '["기초 사주학 이수자", "연애 상담가", "결혼 준비생"]',
          'published'
        );

        -- 샘플 모듈 데이터
        INSERT OR IGNORE INTO modules (id, course_id, title, description, order_index) VALUES
        ('module_basic_1', 'course_basic_saju', '사주학의 이해', '사주학의 역사와 기본 개념', 1),
        ('module_basic_2', 'course_basic_saju', '천간지지와 오행', '천간지지 시스템과 오행 이론', 2),
        ('module_basic_3', 'course_basic_saju', '십성과 신살', '십성의 의미와 신살 해석', 3);

        -- 샘플 레슨 데이터
        INSERT OR IGNORE INTO lessons (id, module_id, title, type, order_index, duration, is_preview) VALUES
        ('lesson_1_1', 'module_basic_1', '사주학이란 무엇인가?', 'video', 1, 45, 1),
        ('lesson_1_2', 'module_basic_1', '사주 구조의 이해', 'video', 2, 60, 0),
        ('lesson_2_1', 'module_basic_2', '천간의 특성과 의미', 'video', 1, 55, 0),
        ('lesson_2_2', 'module_basic_2', '지지의 특성과 의미', 'video', 2, 50, 0);
      `

      this.db.exec(sampleData, (err) => {
        if (err) {
          console.error('❌ 샘플 데이터 삽입 실패:', err)
          reject(err)
        } else {
          console.log('✅ 아카데미 샘플 데이터 삽입 완료')
          resolve()
        }
      })
    })
  }

  getDatabase(): sqlite3.Database {
    return this.db
  }

  async close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          reject(err)
        } else {
          console.log('✅ 아카데미 데이터베이스 연결 종료')
          resolve()
        }
      })
    })
  }
}

export default AcademyDatabase