import { Router } from 'express'
import { EnrollmentModel } from '../models/Enrollment'
import * as sqlite3 from 'sqlite3'

export function createEnrollmentsRouter(database: sqlite3.Database): Router {
  const router = Router()
  const enrollmentModel = new EnrollmentModel(database)

  // 사용자별 수강신청 목록 조회
  router.get('/user/:userId', async (req, res) => {
    try {
      const { userId } = req.params
      const status = req.query.status ? (req.query.status as string).split(',') : undefined
      
      const result = await enrollmentModel.findAll({
        user_id: userId,
        status,
        sort_by: 'enrolled_at',
        sort_order: 'desc'
      })

      res.json({
        success: true,
        data: result.enrollments
      })
    } catch (error) {
      console.error('사용자 수강신청 조회 오류:', error)
      res.status(500).json({
        success: false,
        error: '수강신청 내역을 불러오는 중 오류가 발생했습니다.'
      })
    }
  })

  // 특정 수강신청 조회
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params
      const enrollment = await enrollmentModel.findById(id)
      
      if (!enrollment) {
        return res.status(404).json({
          success: false,
          error: '수강신청을 찾을 수 없습니다.'
        })
      }

      res.json({
        success: true,
        data: enrollment
      })
    } catch (error) {
      console.error('수강신청 조회 오류:', error)
      res.status(500).json({
        success: false,
        error: '수강신청을 불러오는 중 오류가 발생했습니다.'
      })
    }
  })

  // 학습 진도 업데이트
  router.put('/:id/progress', async (req, res) => {
    try {
      const { id } = req.params
      const { progress, currentModuleId, currentLessonId } = req.body

      if (progress < 0 || progress > 100) {
        return res.status(400).json({
          success: false,
          error: '진도율은 0-100 사이의 값이어야 합니다.'
        })
      }

      const updated = await enrollmentModel.updateProgress(
        id, 
        progress, 
        currentModuleId, 
        currentLessonId
      )
      
      if (!updated) {
        return res.status(404).json({
          success: false,
          error: '수강신청을 찾을 수 없습니다.'
        })
      }

      res.json({
        success: true,
        message: '학습 진도가 업데이트되었습니다.'
      })
    } catch (error) {
      console.error('진도 업데이트 오류:', error)
      res.status(500).json({
        success: false,
        error: '진도 업데이트 중 오류가 발생했습니다.'
      })
    }
  })

  // 시청 시간 업데이트
  router.put('/:id/watch-time', async (req, res) => {
    try {
      const { id } = req.params
      const { additionalMinutes } = req.body

      if (!additionalMinutes || additionalMinutes <= 0) {
        return res.status(400).json({
          success: false,
          error: '유효한 시청 시간을 입력해주세요.'
        })
      }

      const updated = await enrollmentModel.updateWatchTime(id, additionalMinutes)
      
      if (!updated) {
        return res.status(404).json({
          success: false,
          error: '수강신청을 찾을 수 없습니다.'
        })
      }

      res.json({
        success: true,
        message: '시청 시간이 업데이트되었습니다.'
      })
    } catch (error) {
      console.error('시청 시간 업데이트 오류:', error)
      res.status(500).json({
        success: false,
        error: '시청 시간 업데이트 중 오류가 발생했습니다.'
      })
    }
  })

  // 퀴즈 점수 업데이트
  router.put('/:id/quiz-score', async (req, res) => {
    try {
      const { id } = req.params
      const { quizId, score } = req.body

      if (!quizId || score < 0 || score > 100) {
        return res.status(400).json({
          success: false,
          error: '유효한 퀴즈 ID와 점수를 입력해주세요.'
        })
      }

      const updated = await enrollmentModel.updateQuizScore(id, quizId, score)
      
      if (!updated) {
        return res.status(404).json({
          success: false,
          error: '수강신청을 찾을 수 없습니다.'
        })
      }

      res.json({
        success: true,
        message: '퀴즈 점수가 업데이트되었습니다.'
      })
    } catch (error) {
      console.error('퀴즈 점수 업데이트 오류:', error)
      res.status(500).json({
        success: false,
        error: '퀴즈 점수 업데이트 중 오류가 발생했습니다.'
      })
    }
  })

  // 강좌 수료 처리
  router.put('/:id/complete', async (req, res) => {
    try {
      const { id } = req.params
      const { finalScore } = req.body

      const updated = await enrollmentModel.completeCourse(id, finalScore)
      
      if (!updated) {
        return res.status(404).json({
          success: false,
          error: '수강신청을 찾을 수 없습니다.'
        })
      }

      res.json({
        success: true,
        message: '강좌 수료가 완료되었습니다.'
      })
    } catch (error) {
      console.error('강좌 수료 처리 오류:', error)
      res.status(500).json({
        success: false,
        error: '강좌 수료 처리 중 오류가 발생했습니다.'
      })
    }
  })

  // 수강신청 통계 조회
  router.get('/stats/overview', async (req, res) => {
    try {
      const userId = req.query.userId as string
      const stats = await enrollmentModel.getEnrollmentStats(userId)

      res.json({
        success: true,
        data: stats
      })
    } catch (error) {
      console.error('수강신청 통계 조회 오류:', error)
      res.status(500).json({
        success: false,
        error: '통계를 불러오는 중 오류가 발생했습니다.'
      })
    }
  })

  // 관리자용 전체 수강신청 조회
  router.get('/', async (req, res) => {
    try {
      const filters = {
        course_id: req.query.courseId as string,
        status: req.query.status ? (req.query.status as string).split(',') : undefined,
        sort_by: (req.query.sortBy as any) || 'enrolled_at',
        sort_order: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
        limit: req.query.limit ? Number(req.query.limit) : 50,
        offset: req.query.offset ? Number(req.query.offset) : 0
      }

      const result = await enrollmentModel.findAll(filters)

      res.json({
        success: true,
        data: {
          enrollments: result.enrollments,
          total: result.total,
          page: Math.floor((filters.offset || 0) / (filters.limit || 50)) + 1,
          limit: filters.limit || 50,
          totalPages: Math.ceil(result.total / (filters.limit || 50))
        }
      })
    } catch (error) {
      console.error('수강신청 목록 조회 오류:', error)
      res.status(500).json({
        success: false,
        error: '수강신청 목록을 불러오는 중 오류가 발생했습니다.'
      })
    }
  })

  return router
}