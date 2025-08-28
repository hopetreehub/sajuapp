import { Router, Request, Response } from 'express'
import { getPool } from '../database/connection'
import logger from '../utils/logger'

const router = Router()

router.get('/', async (req: Request, res: Response) => {
  try {
    // Check database connection
    const pool = getPool()
    const result = await pool.query('SELECT 1')
    
    res.json({
      status: 'healthy',
      service: 'calendar-service',
      timestamp: new Date().toISOString(),
      database: result.rowCount === 1 ? 'connected' : 'disconnected',
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