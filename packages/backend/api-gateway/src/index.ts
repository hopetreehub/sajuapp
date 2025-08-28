import express, { Application } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { createProxyMiddleware } from 'http-proxy-middleware'
import rateLimit from 'express-rate-limit'

dotenv.config()

const app: Application = express()
const PORT = process.env.API_GATEWAY_PORT || 4002

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
})

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:4010',
  credentials: true
}))
app.use(express.json())
app.use('/api', limiter)

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'api-gateway',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

// Service routes
const services = {
  '/api/calendar': {
    target: process.env.CALENDAR_SERVICE_URL || 'http://localhost:4003',
    changeOrigin: true,
    pathRewrite: {
      '^/api/calendar': '/api/calendar'
    },
    onError: (err: any, req: any, res: any) => {
      console.error('Calendar service error:', err)
      res.status(503).json({
        error: 'Calendar service unavailable',
        message: 'Please try again later'
      })
    }
  },
  '/api/auth': {
    target: process.env.AUTH_SERVICE_URL || 'http://localhost:4004',
    changeOrigin: true,
    pathRewrite: {
      '^/api/auth': '/api/auth'
    },
    onError: (err: any, req: any, res: any) => {
      console.error('Auth service error:', err)
      res.status(503).json({
        error: 'Auth service unavailable',
        message: 'Please try again later'
      })
    }
  },
  '/api/diary': {
    target: process.env.DIARY_SERVICE_URL || 'http://localhost:4005',
    changeOrigin: true,
    pathRewrite: {
      '^/api/diary': '/api/diary'
    },
    onError: (err: any, req: any, res: any) => {
      console.error('Diary service error:', err)
      res.status(503).json({
        error: 'Diary service unavailable',
        message: 'Please try again later'
      })
    }
  }
}

// Apply proxy middleware for each service
Object.keys(services).forEach(path => {
  app.use(path, createProxyMiddleware(services[path as keyof typeof services]))
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.url}`,
    availableEndpoints: Object.keys(services)
  })
})

// Error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Gateway error:', err)
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
})

app.listen(PORT, () => {
  console.log(`API Gateway is running on port ${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log('Routing configuration:')
  Object.entries(services).forEach(([path, config]) => {
    console.log(`  ${path} -> ${config.target}`)
  })
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server')
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server')
  process.exit(0)
})