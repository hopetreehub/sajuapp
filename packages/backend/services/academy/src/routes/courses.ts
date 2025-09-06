import { Router } from 'express'
import { CourseController } from '../controllers/CourseController'
import { CourseModel } from '../models/Course'
import { EnrollmentModel } from '../models/Enrollment'
import * as sqlite3 from 'sqlite3'

export function createCoursesRouter(database: sqlite3.Database): Router {
  const router = Router()
  const courseModel = new CourseModel(database)
  const enrollmentModel = new EnrollmentModel(database)
  const courseController = new CourseController(courseModel, enrollmentModel)

  // 강좌 관련 라우트
  router.get('/', courseController.getCourses)
  router.get('/popular', courseController.getPopularCourses)
  router.get('/stats/categories', courseController.getCategoryStats)
  router.get('/:id', courseController.getCourse)
  router.post('/', courseController.createCourse)
  router.put('/:id', courseController.updateCourse)
  router.delete('/:id', courseController.deleteCourse)
  
  // 수강신청 관련
  router.post('/:id/enroll', courseController.enrollCourse)
  router.get('/:id/stats', courseController.getCourseStats)

  return router
}