import { Router, Request, Response, NextFunction } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { getPool } from '../database/connection'
import { validateEvent } from '../validators/eventValidator'
import logger from '../utils/logger'

const router = Router()

// Temporary user ID (should come from auth middleware in production)
const TEMP_USER_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'

// GET /api/calendar/events - Get all events
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { start, end } = req.query
    const pool = getPool()
    
    let query = `
      SELECT * FROM calendar_events 
      WHERE user_id = $1
    `
    const params: any[] = [TEMP_USER_ID]
    
    if (start && end) {
      query += ` AND (
        (start_datetime >= $2 AND start_datetime <= $3) OR
        (end_datetime >= $2 AND end_datetime <= $3) OR
        (start_datetime <= $2 AND end_datetime >= $3)
      )`
      params.push(start, end)
    }
    
    query += ' ORDER BY start_datetime ASC'
    
    const result = await pool.query(query, params)
    
    res.json({
      status: 'success',
      data: result.rows,
      count: result.rowCount
    })
  } catch (error) {
    logger.error('Error fetching events:', error)
    next(error)
  }
})

// GET /api/calendar/events/:id - Get single event
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const pool = getPool()
    
    const result = await pool.query(
      'SELECT * FROM calendar_events WHERE id = $1 AND user_id = $2',
      [id, TEMP_USER_ID]
    )
    
    if (result.rowCount === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Event not found'
      })
    }
    
    res.json({
      status: 'success',
      data: result.rows[0]
    })
  } catch (error) {
    logger.error('Error fetching event:', error)
    next(error)
  }
})

// POST /api/calendar/events - Create new event
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validation = validateEvent(req.body)
    
    if (validation.error) {
      return res.status(400).json({
        status: 'error',
        message: validation.error.message
      })
    }
    
    const {
      title,
      description,
      start_datetime,
      end_datetime,
      is_all_day,
      color,
      category,
      location,
      recurrence_rule,
      reminders,
      attendees,
      diary_linked
    } = validation.value
    
    const pool = getPool()
    
    const query = `
      INSERT INTO calendar_events (
        user_id, title, description, start_datetime, end_datetime,
        is_all_day, color, category, location, recurrence_rule,
        reminders, attendees, diary_linked
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
      ) RETURNING *
    `
    
    const values = [
      TEMP_USER_ID,
      title,
      description || null,
      start_datetime,
      end_datetime,
      is_all_day || false,
      color || '#3B82F6',
      category || null,
      location || null,
      recurrence_rule ? JSON.stringify(recurrence_rule) : null,
      reminders ? JSON.stringify(reminders) : null,
      attendees || null,
      diary_linked || false
    ]
    
    const result = await pool.query(query, values)
    
    res.status(201).json({
      status: 'success',
      data: result.rows[0]
    })
  } catch (error) {
    logger.error('Error creating event:', error)
    next(error)
  }
})

// PUT /api/calendar/events/:id - Update event
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const validation = validateEvent(req.body, true) // true for partial validation
    
    if (validation.error) {
      return res.status(400).json({
        status: 'error',
        message: validation.error.message
      })
    }
    
    const pool = getPool()
    
    // Check if event exists
    const checkResult = await pool.query(
      'SELECT id FROM calendar_events WHERE id = $1 AND user_id = $2',
      [id, TEMP_USER_ID]
    )
    
    if (checkResult.rowCount === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Event not found'
      })
    }
    
    // Build dynamic update query
    const fields: string[] = []
    const values: any[] = []
    let paramCounter = 1
    
    Object.keys(validation.value).forEach(key => {
      if (validation.value[key] !== undefined) {
        fields.push(`${key} = $${paramCounter}`)
        if (key === 'recurrence_rule' || key === 'reminders') {
          values.push(JSON.stringify(validation.value[key]))
        } else {
          values.push(validation.value[key])
        }
        paramCounter++
      }
    })
    
    fields.push(`updated_at = $${paramCounter}`)
    values.push(new Date())
    paramCounter++
    
    values.push(id)
    values.push(TEMP_USER_ID)
    
    const updateQuery = `
      UPDATE calendar_events
      SET ${fields.join(', ')}
      WHERE id = $${paramCounter} AND user_id = $${paramCounter + 1}
      RETURNING *
    `
    
    const result = await pool.query(updateQuery, values)
    
    res.json({
      status: 'success',
      data: result.rows[0]
    })
  } catch (error) {
    logger.error('Error updating event:', error)
    next(error)
  }
})

// DELETE /api/calendar/events/:id - Delete event
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const pool = getPool()
    
    const result = await pool.query(
      'DELETE FROM calendar_events WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, TEMP_USER_ID]
    )
    
    if (result.rowCount === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Event not found'
      })
    }
    
    res.json({
      status: 'success',
      message: 'Event deleted successfully'
    })
  } catch (error) {
    logger.error('Error deleting event:', error)
    next(error)
  }
})

export default router