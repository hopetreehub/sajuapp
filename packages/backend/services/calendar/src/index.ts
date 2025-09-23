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
import { initDatabase } from './database/sqlite-connection'

dotenv.config()

const app: Application = express()
const PORT = 4012 // 고정 포트 사용

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:4000',
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(requestLogger)

// Routes
app.use('/health', healthRouter)
app.use('/api/calendar/events', eventsRouter)
app.use('/api/calendar/tags', tagsRouter)
app.use('/api/calendar/customers', customersRouter)

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