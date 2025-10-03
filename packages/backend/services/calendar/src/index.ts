import express, { Application } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { createServer } from 'http'
import logger from './utils/logger'
import { errorHandler } from './middleware/errorHandler'
import { requestLogger } from './middleware/requestLogger'
import eventsRouter from './routes/events-sqlite'
import healthRouter from './routes/health-sqlite'
import tagsRouter from './routes/tags'
import customersRouter from './routes/customers'
import todosRouter from './routes/todos'
import { initDatabase } from './database/sqlite-connection'

dotenv.config()

const app: Application = express()
const PORT = process.env.PORT || 4012 // Railway에서는 PORT 환경변수 사용

// CORS 설정 - 개발/프로덕션 환경 분기
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // 개발 환경 또는 허용된 origin
    const allowedOrigins = [
      'http://localhost:4000',
      'http://localhost:4001',
      'https://fortune-compass.pages.dev',
      'https://*.fortune-compass.pages.dev',
      process.env.FRONTEND_URL
    ].filter(Boolean)

    // origin이 없는 경우(예: Postman, 서버 간 통신) 허용
    if (!origin) {
      callback(null, true)
      return
    }

    // 패턴 매칭 체크
    const isAllowed = allowedOrigins.some(allowed => {
      if (!allowed) return false
      if (allowed.includes('*')) {
        const pattern = new RegExp(allowed.replace('*', '.*'))
        return pattern.test(origin)
      }
      return allowed === origin
    })

    if (isAllowed) {
      callback(null, true)
    } else {
      logger.warn(`CORS blocked origin: ${origin}`)
      callback(null, true) // 개발 편의를 위해 일단 허용
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}

// Middleware
app.use(cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(requestLogger)

// Routes
app.use('/health', healthRouter)
app.use('/api/calendar/events', eventsRouter)
app.use('/api/calendar/tags', tagsRouter)
app.use('/api/calendar/customers', customersRouter)
app.use('/api/calendar/todos', todosRouter)

// Error handling
app.use(errorHandler)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.url}`
  })
})

const server = createServer(app)

const startServer = async () => {
  try {
    // Initialize database connection
    await initDatabase()
    
    server.listen(PORT, () => {
      logger.info(`Calendar Service is running on port ${PORT}`)
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`)
    })
  } catch (error) {
    logger.error('Failed to start server:', error)
    process.exit(1)
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server')
  server.close(() => {
    logger.info('HTTP server closed')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server')
  server.close(() => {
    logger.info('HTTP server closed')
    process.exit(0)
  })
})

startServer()