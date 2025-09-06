import { Request, Response } from 'express'
import { CourseModel, Course, CourseFilters } from '../models/Course'
import { EnrollmentModel } from '../models/Enrollment'

export class CourseController {
  private courseModel: CourseModel
  private enrollmentModel: EnrollmentModel

  constructor(courseModel: CourseModel, enrollmentModel: EnrollmentModel) {
    this.courseModel = courseModel
    this.enrollmentModel = enrollmentModel
  }

  // 강좌 목록 조회 (필터링, 정렬, 페이징 지원)
  getCourses = async (req: Request, res: Response) => {
    try {
      const filters: CourseFilters = {
        status: req.query.status ? (req.query.status as string).split(',') : undefined,
        category: req.query.category ? (req.query.category as string).split(',') : undefined,
        level: req.query.level ? (req.query.level as string).split(',') : undefined,
        instructor_id: req.query.instructor_id as string,
        search_query: req.query.search as string,
        price_range: req.query.min_price && req.query.max_price 
          ? { min: Number(req.query.min_price), max: Number(req.query.max_price) }
          : undefined,
        rating: req.query.min_rating && req.query.max_rating
          ? { min: Number(req.query.min_rating), max: Number(req.query.max_rating) }
          : undefined,
        sort_by: req.query.sort_by as any,
        sort_order: req.query.sort_order as 'asc' | 'desc',
        limit: req.query.limit ? Number(req.query.limit) : 20,
        offset: req.query.offset ? Number(req.query.offset) : 0
      }

      const result = await this.courseModel.findAll(filters)
      
      res.json({
        success: true,
        data: {
          courses: result.courses,
          total: result.total,
          page: Math.floor((filters.offset || 0) / (filters.limit || 20)) + 1,
          limit: filters.limit || 20,
          totalPages: Math.ceil(result.total / (filters.limit || 20))
        }
      })
    } catch (error) {
      console.error('강좌 목록 조회 오류:', error)
      res.status(500).json({
        success: false,
        error: '강좌 목록을 불러오는 중 오류가 발생했습니다.'
      })
    }
  }

  // 특정 강좌 조회
  getCourse = async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const course = await this.courseModel.findById(id)
      
      if (!course) {
        return res.status(404).json({
          success: false,
          error: '강좌를 찾을 수 없습니다.'
        })
      }

      res.json({
        success: true,
        data: course
      })
    } catch (error) {
      console.error('강좌 조회 오류:', error)
      res.status(500).json({
        success: false,
        error: '강좌를 불러오는 중 오류가 발생했습니다.'
      })
    }
  }

  // 강좌 생성 (관리자용)
  createCourse = async (req: Request, res: Response) => {
    try {
      const courseData = req.body
      
      // 기본 유효성 검증
      if (!courseData.title || !courseData.description || !courseData.instructor_id) {
        return res.status(400).json({
          success: false,
          error: '필수 필드가 누락되었습니다. (title, description, instructor_id)'
        })
      }

      const course = await this.courseModel.create(courseData)
      
      res.status(201).json({
        success: true,
        data: course,
        message: '강좌가 성공적으로 생성되었습니다.'
      })
    } catch (error) {
      console.error('강좌 생성 오류:', error)
      res.status(500).json({
        success: false,
        error: '강좌 생성 중 오류가 발생했습니다.'
      })
    }
  }

  // 강좌 수정 (관리자/강사용)
  updateCourse = async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const updateData = req.body

      const updatedCourse = await this.courseModel.update(id, updateData)
      
      if (!updatedCourse) {
        return res.status(404).json({
          success: false,
          error: '강좌를 찾을 수 없습니다.'
        })
      }

      res.json({
        success: true,
        data: updatedCourse,
        message: '강좌가 성공적으로 수정되었습니다.'
      })
    } catch (error) {
      console.error('강좌 수정 오류:', error)
      res.status(500).json({
        success: false,
        error: '강좌 수정 중 오류가 발생했습니다.'
      })
    }
  }

  // 강좌 삭제 (관리자용)
  deleteCourse = async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      
      const deleted = await this.courseModel.delete(id)
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: '강좌를 찾을 수 없습니다.'
        })
      }

      res.json({
        success: true,
        message: '강좌가 성공적으로 삭제되었습니다.'
      })
    } catch (error) {
      console.error('강좌 삭제 오류:', error)
      res.status(500).json({
        success: false,
        error: '강좌 삭제 중 오류가 발생했습니다.'
      })
    }
  }

  // 강좌 수강신청
  enrollCourse = async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const { user_id, payment_id, amount_paid } = req.body

      if (!user_id) {
        return res.status(400).json({
          success: false,
          error: '사용자 ID가 필요합니다.'
        })
      }

      // 강좌 존재 여부 확인
      const course = await this.courseModel.findById(id)
      if (!course) {
        return res.status(404).json({
          success: false,
          error: '강좌를 찾을 수 없습니다.'
        })
      }

      // 이미 수강신청한 강좌인지 확인
      const existingEnrollment = await this.enrollmentModel.findByUserAndCourse(user_id, id)
      if (existingEnrollment) {
        return res.status(400).json({
          success: false,
          error: '이미 수강신청한 강좌입니다.'
        })
      }

      const enrollment = await this.enrollmentModel.create({
        user_id,
        course_id: id,
        status: 'active',
        payment_id,
        amount_paid: amount_paid || course.price
      })

      res.status(201).json({
        success: true,
        data: enrollment,
        message: '강좌 수강신청이 완료되었습니다.'
      })
    } catch (error) {
      console.error('강좌 수강신청 오류:', error)
      res.status(500).json({
        success: false,
        error: '강좌 수강신청 중 오류가 발생했습니다.'
      })
    }
  }

  // 강좌 통계 조회 (관리자용)
  getCourseStats = async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      
      // 강좌별 수강신청 통계
      const enrollmentStats = await this.enrollmentModel.findAll({ 
        course_id: id 
      })

      const stats = {
        totalEnrollments: enrollmentStats.total,
        activeEnrollments: enrollmentStats.enrollments.filter(e => e.status === 'active').length,
        completedEnrollments: enrollmentStats.enrollments.filter(e => e.status === 'completed').length,
        averageProgress: enrollmentStats.enrollments.reduce((sum, e) => sum + e.progress, 0) / Math.max(enrollmentStats.total, 1),
        totalRevenue: enrollmentStats.enrollments.reduce((sum, e) => sum + e.amount_paid, 0),
        averageWatchTime: enrollmentStats.enrollments.reduce((sum, e) => sum + e.total_watch_time, 0) / Math.max(enrollmentStats.total, 1)
      }

      res.json({
        success: true,
        data: stats
      })
    } catch (error) {
      console.error('강좌 통계 조회 오류:', error)
      res.status(500).json({
        success: false,
        error: '강좌 통계를 불러오는 중 오류가 발생했습니다.'
      })
    }
  }

  // 인기 강좌 조회
  getPopularCourses = async (req: Request, res: Response) => {
    try {
      const limit = Number(req.query.limit) || 10
      
      const result = await this.courseModel.findAll({
        status: ['published'],
        sort_by: 'enrollment_count',
        sort_order: 'desc',
        limit
      })

      res.json({
        success: true,
        data: result.courses
      })
    } catch (error) {
      console.error('인기 강좌 조회 오류:', error)
      res.status(500).json({
        success: false,
        error: '인기 강좌를 불러오는 중 오류가 발생했습니다.'
      })
    }
  }

  // 카테고리별 강좌 통계
  getCategoryStats = async (req: Request, res: Response) => {
    try {
      const categories = ['basic', 'fortune', 'compatibility', 'professional', 'special']
      const stats = []

      for (const category of categories) {
        const result = await this.courseModel.findAll({ 
          category: [category],
          status: ['published']
        })
        
        const enrollmentStats = await Promise.all(
          result.courses.map(course => 
            this.enrollmentModel.findAll({ course_id: course.id })
          )
        )

        const totalEnrollments = enrollmentStats.reduce((sum, stat) => sum + stat.total, 0)
        const totalRevenue = enrollmentStats.reduce((sum, stat) => 
          sum + stat.enrollments.reduce((rev, enrollment) => rev + enrollment.amount_paid, 0), 0
        )

        stats.push({
          category,
          courseCount: result.total,
          enrollmentCount: totalEnrollments,
          revenue: totalRevenue
        })
      }

      res.json({
        success: true,
        data: stats
      })
    } catch (error) {
      console.error('카테고리별 통계 조회 오류:', error)
      res.status(500).json({
        success: false,
        error: '카테고리별 통계를 불러오는 중 오류가 발생했습니다.'
      })
    }
  }
}