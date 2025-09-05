import fs from 'fs'
import path from 'path'
import DatabaseConnection from './connection'

export class MigrationRunner {
  private static readonly MIGRATIONS_DIR = path.join(__dirname, '../migrations')

  static async runMigrations(): Promise<void> {
    try {
      console.log('🚀 추천인 시스템 데이터베이스 마이그레이션 시작...')

      // 마이그레이션 히스토리 테이블 생성
      await this.createMigrationTable()

      // 마이그레이션 파일 목록 가져오기
      const migrationFiles = fs.readdirSync(this.MIGRATIONS_DIR)
        .filter(file => file.endsWith('.sql'))
        .sort()

      for (const file of migrationFiles) {
        await this.runSingleMigration(file)
      }

      console.log('✅ 모든 마이그레이션이 완료되었습니다.')
    } catch (error) {
      console.error('❌ 마이그레이션 실패:', error)
      throw error
    }
  }

  private static async createMigrationTable(): Promise<void> {
    const sql = `
      CREATE TABLE IF NOT EXISTS migration_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        checksum VARCHAR(64)
      )
    `
    
    await DatabaseConnection.run(sql)
  }

  private static async runSingleMigration(filename: string): Promise<void> {
    // 이미 실행된 마이그레이션인지 확인
    const existing = await DatabaseConnection.get(
      'SELECT * FROM migration_history WHERE filename = ?',
      [filename]
    )

    if (existing) {
      console.log(`⏭️  마이그레이션 건너뛰기 (이미 실행됨): ${filename}`)
      return
    }

    console.log(`🔄 마이그레이션 실행 중: ${filename}`)

    // 마이그레이션 파일 읽기
    const filePath = path.join(this.MIGRATIONS_DIR, filename)
    const sql = fs.readFileSync(filePath, 'utf-8')

    // SQL 문을 세미콜론으로 분리하여 실행
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0)

    // 트랜잭션으로 실행
    await DatabaseConnection.run('BEGIN TRANSACTION')

    try {
      for (const statement of statements) {
        if (statement) {
          await DatabaseConnection.run(statement)
        }
      }

      // 마이그레이션 히스토리에 기록
      await DatabaseConnection.run(
        'INSERT INTO migration_history (filename) VALUES (?)',
        [filename]
      )

      await DatabaseConnection.run('COMMIT')
      console.log(`✅ 마이그레이션 완료: ${filename}`)
    } catch (error) {
      await DatabaseConnection.run('ROLLBACK')
      console.error(`❌ 마이그레이션 실패: ${filename}`, error)
      throw error
    }
  }

  static async rollbackLastMigration(): Promise<void> {
    console.log('🔄 마지막 마이그레이션 롤백 중...')
    
    // 구현은 나중에 필요시 추가
    // 현재는 단순 로그만 출력
    console.log('⚠️  롤백 기능은 아직 구현되지 않았습니다.')
  }
}

// 스크립트로 직접 실행 시
if (require.main === module) {
  MigrationRunner.runMigrations()
    .then(() => {
      console.log('✅ 마이그레이션 스크립트 완료')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ 마이그레이션 스크립트 실패:', error)
      process.exit(1)
    })
}