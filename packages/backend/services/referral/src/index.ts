import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { MigrationRunner } from './database/migrations'
import referralRoutes from './routes/referrals'

const app = express()
const PORT = process.env.PORT || 4013

// === 미들웨어 설정 ===

// 보안 헤더 설정
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
}))

// CORS 설정 (운명나침반 프로젝트 도메인 허용)
app.use(cors({
  origin: [
    'http://localhost:4000',
    'http://localhost:3000',
    'http://127.0.0.1:4000',
    'http://127.0.0.1:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}))

// JSON 파싱 및 요청 로깅
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// HTTP 요청 로깅 (개발 환경)
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('combined'))
}

// === 라우트 설정 ===

// 추천인 시스템 라우트
app.use('/api/referral', referralRoutes)

// 루트 경로 - 서비스 정보
app.get('/', (req, res) => {
  res.json({
    service: '운명나침반 추천인 시스템',
    version: '1.0.0',
    description: '사주 캘린더 앱 추천인 코드 관리 마이크로서비스',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/referral/health',
      constants: '/api/referral/constants',
      codes: {
        generate: 'POST /api/referral/codes',
        validate: 'GET /api/referral/codes/validate/:code',
        my_codes: 'GET /api/referral/codes/my/:userId'
      },
      referrals: {
        apply: 'POST /api/referral/apply',
        dashboard: 'GET /api/referral/dashboard/:userId'
      },
      rewards: {
        list: 'GET /api/referral/rewards/:userId',
        claim: 'POST /api/referral/rewards/claim'
      }
    }
  })
})

// === 404 핸들러 ===
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: '요청하신 API 엔드포인트를 찾을 수 없습니다',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  })
})

// === 전역 에러 핸들러 ===
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('💥 서버 전역 오류:', error)
  
  // 개발 환경에서는 스택 트레이스 포함
  const isDevelopment = process.env.NODE_ENV !== 'production'
  
  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || '서버 내부 오류가 발생했습니다',
    ...(isDevelopment && { stack: error.stack }),
    timestamp: new Date().toISOString()
  })
})

// === 서버 시작 함수 ===
async function startServer() {
  try {
    console.log('🚀 추천인 시스템 서비스 초기화 중...')
    
    // 데이터베이스 마이그레이션 실행
    console.log('📊 데이터베이스 마이그레이션 실행 중...')
    await MigrationRunner.runMigrations()
    
    // 서버 시작
    app.listen(PORT, () => {
      console.log('')
      console.log('='.repeat(60))
      console.log('✅ 운명나침반 추천인 시스템 서비스 시작됨')
      console.log('='.repeat(60))
      console.log(`🌐 서버 주소: http://localhost:${PORT}`)
      console.log(`📊 상태 확인: http://localhost:${PORT}/api/referral/health`)
      console.log(`📖 API 문서: http://localhost:${PORT}`)
      console.log(`🔧 환경: ${process.env.NODE_ENV || 'development'}`)
      console.log(`⏰ 시작 시간: ${new Date().toLocaleString('ko-KR')}`)
      console.log('='.repeat(60))
      console.log('')
      console.log('🎯 주요 기능:')
      console.log('  • 추천 코드 생성 및 관리')
      console.log('  • 추천 관계 추적')
      console.log('  • 보상 시스템')
      console.log('  • 실시간 통계')
      console.log('  • 보안 검증')
      console.log('')
      console.log('📱 연동 서비스:')
      console.log('  • 프론트엔드 웹앱 (포트 4000)')
      console.log('  • 캘린더 서비스 (포트 4012)')
      console.log('  • 다이어리 서비스 (포트 4014)')
      console.log('')
      console.log('💡 개발팀 참고사항:')
      console.log('  • 추천 코드는 8자리 영숫자 조합')
      console.log('  • 운세 카테고리별 특화 코드 지원')
      console.log('  • 부정 사용 방지 시스템 내장')
      console.log('  • 실시간 보상 지급')
      console.log('='.repeat(60))
    })

    // 프로세스 종료 처리
    process.on('SIGTERM', gracefulShutdown)
    process.on('SIGINT', gracefulShutdown)
    
  } catch (error: any) {
    console.error('❌ 서버 시작 실패:', error)
    console.error('스택 트레이스:', error.stack)
    process.exit(1)
  }
}

// === 우아한 종료 처리 ===
async function gracefulShutdown(signal: string) {
  console.log(`\n⏹️  ${signal} 시그널 수신. 서버 종료 중...`)
  
  try {
    // 데이터베이스 연결 종료
    console.log('💾 데이터베이스 연결 종료 중...')
    // await DatabaseConnection.close() // 필요시 활성화
    
    console.log('✅ 추천인 시스템 서비스가 정상적으로 종료되었습니다')
    process.exit(0)
  } catch (error: any) {
    console.error('❌ 서버 종료 중 오류 발생:', error)
    process.exit(1)
  }
}

// 처리되지 않은 Promise 거부 처리
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  console.error('💥 처리되지 않은 Promise 거부:', reason)
  console.error('Promise:', promise)
  // 서버 종료하지 않고 로깅만 수행 (선택적)
})

// 처리되지 않은 예외 처리
process.on('uncaughtException', (error: Error) => {
  console.error('💥 처리되지 않은 예외:', error)
  console.error('스택 트레이스:', error.stack)
  // 심각한 오류이므로 서버 종료
  process.exit(1)
})

// === 서버 시작 ===
if (require.main === module) {
  startServer()
}

export { app, startServer }