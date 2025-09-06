import * as sqlite3 from 'sqlite3'
import { v4 as uuidv4 } from 'uuid'

export interface Enrollment {
  id: string
  user_id: string
  course_id: string
  status: 'active' | 'completed' | 'paused' | 'cancelled' | 'expired'
  progress: number // 0-100
  current_module_id?: string
  current_lesson_id?: string
  
  // 시간 추적
  total_watch_time: number // 분 단위
  last_accessed_at?: string
  enrolled_at: string
  completed_at?: string
  expires_at?: string
  
  // 점수 및 평가
  quiz_scores: { [quizId: string]: number }
  overall_score?: number
  
  // 결제 정보
  payment_id?: string
  amount_paid: number
}

export interface EnrollmentFilters {
  user_id?: string
  course_id?: string
  status?: string[]
  progress?: { min: number; max: number }
  sort_by?: 'enrolled_at' | 'last_accessed_at' | 'progress'
  sort_order?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

export class EnrollmentModel {
  private db: sqlite3.Database

  constructor(database: sqlite3.Database) {
    this.db = database
  }

  async create(enrollmentData: Omit<Enrollment, 'id' | 'enrolled_at' | 'progress' | 'total_watch_time' | 'quiz_scores'>): Promise<Enrollment> {
    return new Promise((resolve, reject) => {
      const id = uuidv4()
      const now = new Date().toISOString()
      
      const query = `
        INSERT INTO enrollments (
          id, user_id, course_id, status, current_module_id, current_lesson_id,
          last_accessed_at, enrolled_at, completed_at, expires_at,
          overall_score, payment_id, amount_paid
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `

      const params = [
        id, enrollmentData.user_id, enrollmentData.course_id, 
        enrollmentData.status || 'active',
        enrollmentData.current_module_id, enrollmentData.current_lesson_id,
        enrollmentData.last_accessed_at, now, enrollmentData.completed_at,
        enrollmentData.expires_at, enrollmentData.overall_score,
        enrollmentData.payment_id, enrollmentData.amount_paid || 0
      ]

      this.db.run(query, params, function(err) {
        if (err) {
          reject(err)
        } else {
          resolve({
            ...enrollmentData,
            id,
            status: enrollmentData.status || 'active',
            progress: 0,
            total_watch_time: 0,
            quiz_scores: {},
            enrolled_at: now,
            amount_paid: enrollmentData.amount_paid || 0
          })
        }
      })
    })
  }

  async findById(id: string): Promise<Enrollment | null> {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT e.*, c.title as course_title, c.instructor_id
        FROM enrollments e
        LEFT JOIN courses c ON e.course_id = c.id
        WHERE e.id = ?
      `

      this.db.get(query, [id], (err, row: any) => {
        if (err) {
          reject(err)
        } else if (!row) {
          resolve(null)
        } else {
          resolve(this.mapRowToEnrollment(row))
        }
      })
    })
  }

  async findByUserAndCourse(userId: string, courseId: string): Promise<Enrollment | null> {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT e.*, c.title as course_title
        FROM enrollments e
        LEFT JOIN courses c ON e.course_id = c.id
        WHERE e.user_id = ? AND e.course_id = ?
      `

      this.db.get(query, [userId, courseId], (err, row: any) => {
        if (err) {
          reject(err)
        } else if (!row) {
          resolve(null)
        } else {
          resolve(this.mapRowToEnrollment(row))
        }
      })
    })
  }

  async findAll(filters: EnrollmentFilters = {}): Promise<{ enrollments: Enrollment[]; total: number }> {
    return new Promise((resolve, reject) => {
      let whereClause = 'WHERE 1=1'
      const params: any[] = []

      if (filters.user_id) {
        whereClause += ' AND e.user_id = ?'
        params.push(filters.user_id)
      }

      if (filters.course_id) {
        whereClause += ' AND e.course_id = ?'
        params.push(filters.course_id)
      }

      if (filters.status?.length) {
        whereClause += ` AND e.status IN (${filters.status.map(() => '?').join(',')})`
        params.push(...filters.status)
      }

      if (filters.progress) {
        whereClause += ' AND e.progress BETWEEN ? AND ?'
        params.push(filters.progress.min, filters.progress.max)
      }

      const orderClause = filters.sort_by 
        ? `ORDER BY e.${filters.sort_by} ${filters.sort_order || 'ASC'}`
        : 'ORDER BY e.enrolled_at DESC'

      const limitClause = filters.limit 
        ? `LIMIT ${filters.limit} OFFSET ${filters.offset || 0}`
        : ''

      const query = `
        SELECT e.*, c.title as course_title, c.thumbnail as course_thumbnail
        FROM enrollments e
        LEFT JOIN courses c ON e.course_id = c.id
        ${whereClause}
        ${orderClause}
        ${limitClause}
      `

      const countQuery = `
        SELECT COUNT(*) as total
        FROM enrollments e
        ${whereClause}
      `

      this.db.get(countQuery, params, (err, countRow: any) => {
        if (err) {
          reject(err)
          return
        }

        this.db.all(query, params, (err, rows: any[]) => {
          if (err) {
            reject(err)
          } else {
            const enrollments = rows.map(row => this.mapRowToEnrollment(row))
            resolve({
              enrollments,
              total: countRow.total
            })
          }
        })
      })
    })
  }

  async updateProgress(id: string, progress: number, currentModuleId?: string, currentLessonId?: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE enrollments 
        SET progress = ?, current_module_id = ?, current_lesson_id = ?, last_accessed_at = ?
        WHERE id = ?
      `

      const params = [
        progress, currentModuleId, currentLessonId, 
        new Date().toISOString(), id
      ]

      this.db.run(query, params, function(err) {
        if (err) {
          reject(err)
        } else {
          resolve(this.changes > 0)
        }
      })
    })
  }

  async updateWatchTime(id: string, additionalMinutes: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE enrollments 
        SET total_watch_time = total_watch_time + ?, last_accessed_at = ?
        WHERE id = ?
      `

      const params = [additionalMinutes, new Date().toISOString(), id]

      this.db.run(query, params, function(err) {
        if (err) {
          reject(err)
        } else {
          resolve(this.changes > 0)
        }
      })
    })
  }

  async updateQuizScore(id: string, quizId: string, score: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      // 먼저 현재 quiz_scores 조회
      this.db.get('SELECT quiz_scores FROM enrollments WHERE id = ?', [id], (err, row: any) => {
        if (err) {
          reject(err)
          return
        }

        const currentScores = row?.quiz_scores ? JSON.parse(row.quiz_scores) : {}
        currentScores[quizId] = score

        const query = `
          UPDATE enrollments 
          SET quiz_scores = ?, last_accessed_at = ?
          WHERE id = ?
        `

        const params = [JSON.stringify(currentScores), new Date().toISOString(), id]

        this.db.run(query, params, function(err) {
          if (err) {
            reject(err)
          } else {
            resolve(this.changes > 0)
          }
        })
      })
    })
  }

  async completeCourse(id: string, finalScore?: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const now = new Date().toISOString()
      const query = `
        UPDATE enrollments 
        SET status = 'completed', progress = 100, overall_score = ?, completed_at = ?, last_accessed_at = ?
        WHERE id = ?
      `

      const params = [finalScore, now, now, id]

      this.db.run(query, params, function(err) {
        if (err) {
          reject(err)
        } else {
          resolve(this.changes > 0)
        }
      })
    })
  }

  async getEnrollmentStats(userId?: string): Promise<{
    total: number
    active: number
    completed: number
    paused: number
    totalWatchTime: number
  }> {
    return new Promise((resolve, reject) => {
      let whereClause = ''
      const params: any[] = []

      if (userId) {
        whereClause = 'WHERE user_id = ?'
        params.push(userId)
      }

      const query = `
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
          SUM(CASE WHEN status = 'paused' THEN 1 ELSE 0 END) as paused,
          SUM(total_watch_time) as totalWatchTime
        FROM enrollments
        ${whereClause}
      `

      this.db.get(query, params, (err, row: any) => {
        if (err) {
          reject(err)
        } else {
          resolve({
            total: row.total || 0,
            active: row.active || 0,
            completed: row.completed || 0,
            paused: row.paused || 0,
            totalWatchTime: row.totalWatchTime || 0
          })
        }
      })
    })
  }

  private mapRowToEnrollment(row: any): Enrollment {
    return {
      id: row.id,
      user_id: row.user_id,
      course_id: row.course_id,
      status: row.status,
      progress: row.progress || 0,
      current_module_id: row.current_module_id,
      current_lesson_id: row.current_lesson_id,
      total_watch_time: row.total_watch_time || 0,
      last_accessed_at: row.last_accessed_at,
      enrolled_at: row.enrolled_at,
      completed_at: row.completed_at,
      expires_at: row.expires_at,
      quiz_scores: row.quiz_scores ? JSON.parse(row.quiz_scores) : {},
      overall_score: row.overall_score,
      payment_id: row.payment_id,
      amount_paid: row.amount_paid || 0
    }
  }
}