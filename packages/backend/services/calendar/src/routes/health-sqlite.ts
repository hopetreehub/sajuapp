import { Router, Request, Response } from 'express'
import { getDb } from '../database/sqlite-connection'
import logger from '../utils/logger'

const router = Router()

router.get('/', async (req: Request, res: Response) => {
  try {
    // Check database connection
    const db = getDb()
    const result = await db.get('SELECT 1 as test')
    
    res.json({
      status: 'healthy',
      service: 'calendar-service',
      timestamp: new Date().toISOString(),
      database: result ? 'connected' : 'disconnected',
      uptime: process.uptime()
    })
  } catch (error) {
    logger.error('Health check failed:', error)
    res.status(503).json({
      status: 'unhealthy',
      service: 'calendar-service',
      timestamp: new Date().toISOString(),
      database: 'disconnected'
    })
  }
})

export default router