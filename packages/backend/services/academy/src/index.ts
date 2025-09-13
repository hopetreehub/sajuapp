import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import AcademyDatabase from './database/init'
import { createCoursesRouter } from './routes/courses'
import { createEnrollmentsRouter } from './routes/enrollments'

const app = express()
const PORT = process.env.ACADEMY_SERVICE_PORT || 5006

// 미들웨어 설정
app.use(helmet({
  crossOriginEmbedderPolicy: false
}))

app.use(cors({
  origin: ['http://localhost:4000', 'http://127.0.0.1:4000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 1000, // 요청 제한
  message: {
    success: false,
    error: '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.'
  },
  standardHeaders: true,
  legacyHeaders: false
})

app.use(limiter)

// 로깅 미들웨어
app.use((req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}] ${req.method} ${req.path}`)
  next()
})

// 데이터베이스 초기화 및 서버 시작
async function startServer() {
  try {
    console.log('🚀 아카데미 서비스 시작 중...')
    
    // 데이터베이스 초기화
    const database = new AcademyDatabase('./academy.db')
    await database.initialize()
    await database.seedSampleData()
    
    const db = database.getDatabase()
    
    // 라우터 설정
    app.use('/api/courses', createCoursesRouter(db))
    app.use('/api/enrollments', createEnrollmentsRouter(db))
    
    // 기본 헬스 체크 엔드포인트
    app.get('/health', (req: Request, res: Response) => {
      res.json({
        success: true,
        service: 'Academy Service',
        status: 'healthy',
        timestamp: new Date().toISOString(),
        port: PORT
      })
    })
    
    // 아카데미 전체 통계 엔드포인트
    app.get('/api/stats/overview', async (req: Request, res: Response) => {
      try {
        // 기본 통계 쿼리들
        const queries = {
          totalCourses: 'SELECT COUNT(*) as count FROM courses WHERE status = "published"',
          totalEnrollments: 'SELECT COUNT(*) as count FROM enrollments',
          activeEnrollments: 'SELECT COUNT(*) as count FROM enrollments WHERE status = "active"',
          completedEnrollments: 'SELECT COUNT(*) as count FROM enrollments WHERE status = "completed"',
          totalRevenue: 'SELECT SUM(amount_paid) as total FROM enrollments',
          averageRating: 'SELECT AVG(rating) as avg FROM courses WHERE rating > 0'
        }
        
        const stats: any = {}
        
        for (const [key, query] of Object.entries(queries)) {
          await new Promise<void>((resolve, reject) => {
            db.get(query, [], (err: any, row: any) => {
              if (err) {
                reject(err)
              } else {
                stats[key] = row?.count || row?.total || row?.avg || 0
              }
              resolve()
            })
          })
        }
        
        res.json({
          success: true,
          data: {
            totalCourses: stats.totalCourses,
            totalStudents: stats.totalEnrollments, // 실제로는 unique user count
            totalEnrollments: stats.totalEnrollments,
            activeEnrollments: stats.activeEnrollments,
            completedEnrollments: stats.completedEnrollments,
            totalRevenue: stats.totalRevenue,
            averageRating: parseFloat(stats.averageRating?.toFixed(1) || '0'),
            completionRate: stats.totalEnrollments > 0 
              ? ((stats.completedEnrollments / stats.totalEnrollments) * 100).toFixed(1)
              : '0'
          }
        })
      } catch (error) {
        console.error('아카데미 통계 조회 오류:', error)
        res.status(500).json({
          success: false,
          error: '통계를 불러오는 중 오류가 발생했습니다.'
        })
      }
    })
    
    // 404 에러 핸들러
    app.use('*', (req: Request, res: Response) => {
      res.status(404).json({
        success: false,
        error: `경로 '${req.originalUrl}'를 찾을 수 없습니다.`
      })
    })
    
    // 전역 에러 핸들러
    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
      console.error('서버 오류:', err)
      res.status(500).json({
        success: false,
        error: '서버 내부 오류가 발생했습니다.'
      })
    })
    
    // 서버 시작
    app.listen(PORT, () => {
      console.log(`✅ 아카데미 서비스가 포트 ${PORT}에서 실행 중입니다.`)
      console.log(`📚 API 문서: http://localhost:${PORT}/health`)
      console.log('')
      console.log('📖 사용 가능한 엔드포인트:')
      console.log(`   GET  /health - 서비스 상태 확인`)
      console.log(`   GET  /api/stats/overview - 전체 통계`)
      console.log(`   GET  /api/courses - 강좌 목록`)
      console.log(`   GET  /api/courses/:id - 특정 강좌`)
      console.log(`   POST /api/courses - 강좌 생성`)
      console.log(`   GET  /api/enrollments/user/:userId - 사용자 수강신청`)
      console.log(`   POST /api/courses/:id/enroll - 수강신청`)
      console.log('')
    })
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n🛑 아카데미 서비스 종료 중...')
      await database.close()
      process.exit(0)
    })
    
    process.on('SIGTERM', async () => {
      console.log('\n🛑 아카데미 서비스 종료 중...')
      await database.close()
      process.exit(0)
    })
    
  } catch (error) {
    console.error('❌ 아카데미 서비스 시작 실패:', error)
    process.exit(1)
  }
}

// 서버 시작
startServer().catch((error) => {
  console.error('❌ 치명적 오류:', error)
  process.exit(1)
})

export default app