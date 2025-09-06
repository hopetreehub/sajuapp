import * as sqlite3 from 'sqlite3'
import { v4 as uuidv4 } from 'uuid'

export interface Course {
  id: string
  title: string
  subtitle?: string
  description: string
  thumbnail?: string
  trailer?: string
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  category: 'basic' | 'fortune' | 'compatibility' | 'professional' | 'special'
  status: 'draft' | 'published' | 'archived' | 'coming_soon'
  instructor_id: string
  
  // 가격 정보
  price: number
  original_price?: number
  discount_percentage?: number
  is_free: boolean
  is_subscription_only: boolean
  
  // 통계 정보
  rating: number
  review_count: number
  enrollment_count: number
  total_duration: number
  total_lessons: number
  
  // 메타데이터
  tags: string[]
  prerequisites: string[]
  learning_objectives: string[]
  target_audience: string[]
  
  // 날짜
  published_at?: string
  created_at: string
  updated_at: string
}

export interface CourseFilters {
  status?: string[]
  category?: string[]
  level?: string[]
  instructor_id?: string
  search_query?: string
  price_range?: { min: number; max: number }
  rating?: { min: number; max: number }
  sort_by?: 'title' | 'created_at' | 'updated_at' | 'rating' | 'enrollment_count'
  sort_order?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

export class CourseModel {
  private db: sqlite3.Database

  constructor(database: sqlite3.Database) {
    this.db = database
  }

  async create(courseData: Omit<Course, 'id' | 'created_at' | 'updated_at' | 'rating' | 'review_count' | 'enrollment_count' | 'total_duration' | 'total_lessons'>): Promise<Course> {
    return new Promise((resolve, reject) => {
      const id = uuidv4()
      const now = new Date().toISOString()
      
      const query = `
        INSERT INTO courses (
          id, title, subtitle, description, thumbnail, trailer, level, category, 
          status, instructor_id, price, original_price, discount_percentage, 
          is_free, is_subscription_only, tags, prerequisites, learning_objectives, 
          target_audience, published_at, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `

      const params = [
        id, courseData.title, courseData.subtitle, courseData.description,
        courseData.thumbnail, courseData.trailer, courseData.level, courseData.category,
        courseData.status, courseData.instructor_id, courseData.price, 
        courseData.original_price, courseData.discount_percentage,
        courseData.is_free ? 1 : 0, courseData.is_subscription_only ? 1 : 0,
        JSON.stringify(courseData.tags), JSON.stringify(courseData.prerequisites),
        JSON.stringify(courseData.learning_objectives), JSON.stringify(courseData.target_audience),
        courseData.published_at, now, now
      ]

      this.db.run(query, params, function(err) {
        if (err) {
          reject(err)
        } else {
          resolve({
            ...courseData,
            id,
            rating: 0,
            review_count: 0,
            enrollment_count: 0,
            total_duration: 0,
            total_lessons: 0,
            created_at: now,
            updated_at: now
          })
        }
      })
    })
  }

  async findById(id: string): Promise<Course | null> {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT c.*, i.name as instructor_name
        FROM courses c
        LEFT JOIN instructors i ON c.instructor_id = i.id
        WHERE c.id = ?
      `

      this.db.get(query, [id], (err, row: any) => {
        if (err) {
          reject(err)
        } else if (!row) {
          resolve(null)
        } else {
          resolve(this.mapRowToCourse(row))
        }
      })
    })
  }

  async findAll(filters: CourseFilters = {}): Promise<{ courses: Course[]; total: number }> {
    return new Promise((resolve, reject) => {
      let whereClause = 'WHERE 1=1'
      const params: any[] = []

      if (filters.status?.length) {
        whereClause += ` AND c.status IN (${filters.status.map(() => '?').join(',')})`
        params.push(...filters.status)
      }

      if (filters.category?.length) {
        whereClause += ` AND c.category IN (${filters.category.map(() => '?').join(',')})`
        params.push(...filters.category)
      }

      if (filters.level?.length) {
        whereClause += ` AND c.level IN (${filters.level.map(() => '?').join(',')})`
        params.push(...filters.level)
      }

      if (filters.instructor_id) {
        whereClause += ' AND c.instructor_id = ?'
        params.push(filters.instructor_id)
      }

      if (filters.search_query) {
        whereClause += ' AND (c.title LIKE ? OR c.description LIKE ?)'
        const searchTerm = `%${filters.search_query}%`
        params.push(searchTerm, searchTerm)
      }

      if (filters.price_range) {
        whereClause += ' AND c.price BETWEEN ? AND ?'
        params.push(filters.price_range.min, filters.price_range.max)
      }

      if (filters.rating) {
        whereClause += ' AND c.rating BETWEEN ? AND ?'
        params.push(filters.rating.min, filters.rating.max)
      }

      const orderClause = filters.sort_by 
        ? `ORDER BY c.${filters.sort_by} ${filters.sort_order || 'ASC'}`
        : 'ORDER BY c.created_at DESC'

      const limitClause = filters.limit 
        ? `LIMIT ${filters.limit} OFFSET ${filters.offset || 0}`
        : ''

      const query = `
        SELECT c.*, i.name as instructor_name
        FROM courses c
        LEFT JOIN instructors i ON c.instructor_id = i.id
        ${whereClause}
        ${orderClause}
        ${limitClause}
      `

      const countQuery = `
        SELECT COUNT(*) as total
        FROM courses c
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
            const courses = rows.map(row => this.mapRowToCourse(row))
            resolve({
              courses,
              total: countRow.total
            })
          }
        })
      })
    })
  }

  async update(id: string, updateData: Partial<Course>): Promise<Course | null> {
    return new Promise((resolve, reject) => {
      const fields = Object.keys(updateData).filter(key => key !== 'id')
      const setClause = fields.map(field => `${field} = ?`).join(', ')
      const values = fields.map(field => {
        const value = (updateData as any)[field]
        if (Array.isArray(value)) {
          return JSON.stringify(value)
        }
        if (typeof value === 'boolean') {
          return value ? 1 : 0
        }
        return value
      })

      const query = `
        UPDATE courses 
        SET ${setClause}, updated_at = ?
        WHERE id = ?
      `

      values.push(new Date().toISOString(), id)

      this.db.run(query, values, function(err) {
        if (err) {
          reject(err)
        } else if (this.changes === 0) {
          resolve(null)
        } else {
          // 업데이트된 레코드 조회
          resolve(null) // 실제로는 findById 호출해야 함
        }
      })
    })
  }

  async delete(id: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM courses WHERE id = ?'

      this.db.run(query, [id], function(err) {
        if (err) {
          reject(err)
        } else {
          resolve(this.changes > 0)
        }
      })
    })
  }

  private mapRowToCourse(row: any): Course {
    return {
      id: row.id,
      title: row.title,
      subtitle: row.subtitle,
      description: row.description,
      thumbnail: row.thumbnail,
      trailer: row.trailer,
      level: row.level,
      category: row.category,
      status: row.status,
      instructor_id: row.instructor_id,
      price: row.price,
      original_price: row.original_price,
      discount_percentage: row.discount_percentage,
      is_free: Boolean(row.is_free),
      is_subscription_only: Boolean(row.is_subscription_only),
      rating: row.rating,
      review_count: row.review_count,
      enrollment_count: row.enrollment_count,
      total_duration: row.total_duration,
      total_lessons: row.total_lessons,
      tags: row.tags ? JSON.parse(row.tags) : [],
      prerequisites: row.prerequisites ? JSON.parse(row.prerequisites) : [],
      learning_objectives: row.learning_objectives ? JSON.parse(row.learning_objectives) : [],
      target_audience: row.target_audience ? JSON.parse(row.target_audience) : [],
      published_at: row.published_at,
      created_at: row.created_at,
      updated_at: row.updated_at
    }
  }
}