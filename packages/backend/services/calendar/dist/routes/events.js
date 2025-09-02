"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const connection_1 = require("../database/connection");
const eventValidator_1 = require("../validators/eventValidator");
const logger_1 = __importDefault(require("../utils/logger"));
const router = (0, express_1.Router)();
// Temporary user ID (should come from auth middleware in production)
const TEMP_USER_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
// GET /api/calendar/events - Get all events
router.get('/', async (req, res, next) => {
    try {
        const { start, end } = req.query;
        const pool = (0, connection_1.getPool)();
        let query = `
      SELECT * FROM calendar_events 
      WHERE user_id = $1
    `;
        const params = [TEMP_USER_ID];
        if (start && end) {
            query += ` AND (
        (start_datetime >= $2 AND start_datetime <= $3) OR
        (end_datetime >= $2 AND end_datetime <= $3) OR
        (start_datetime <= $2 AND end_datetime >= $3)
      )`;
            params.push(start, end);
        }
        query += ' ORDER BY start_datetime ASC';
        const result = await pool.query(query, params);
        res.json({
            status: 'success',
            data: result.rows,
            count: result.rowCount
        });
    }
    catch (error) {
        logger_1.default.error('Error fetching events:', error);
        next(error);
    }
});
// GET /api/calendar/events/:id - Get single event
router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const pool = (0, connection_1.getPool)();
        const result = await pool.query('SELECT * FROM calendar_events WHERE id = $1 AND user_id = $2', [id, TEMP_USER_ID]);
        if (result.rowCount === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Event not found'
            });
        }
        res.json({
            status: 'success',
            data: result.rows[0]
        });
    }
    catch (error) {
        logger_1.default.error('Error fetching event:', error);
        next(error);
    }
});
// POST /api/calendar/events - Create new event
router.post('/', async (req, res, next) => {
    try {
        const validation = (0, eventValidator_1.validateEvent)(req.body);
        if (validation.error) {
            return res.status(400).json({
                status: 'error',
                message: validation.error.message
            });
        }
        const { title, description, start_datetime, end_datetime, is_all_day, color, category, location, recurrence_rule, reminders, attendees, diary_linked } = validation.value;
        const pool = (0, connection_1.getPool)();
        const query = `
      INSERT INTO calendar_events (
        user_id, title, description, start_datetime, end_datetime,
        is_all_day, color, category, location, recurrence_rule,
        reminders, attendees, diary_linked
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
      ) RETURNING *
    `;
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
        ];
        const result = await pool.query(query, values);
        res.status(201).json({
            status: 'success',
            data: result.rows[0]
        });
    }
    catch (error) {
        logger_1.default.error('Error creating event:', error);
        next(error);
    }
});
// PUT /api/calendar/events/:id - Update event
router.put('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const validation = (0, eventValidator_1.validateEvent)(req.body, true); // true for partial validation
        if (validation.error) {
            return res.status(400).json({
                status: 'error',
                message: validation.error.message
            });
        }
        const pool = (0, connection_1.getPool)();
        // Check if event exists
        const checkResult = await pool.query('SELECT id FROM calendar_events WHERE id = $1 AND user_id = $2', [id, TEMP_USER_ID]);
        if (checkResult.rowCount === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Event not found'
            });
        }
        // Build dynamic update query
        const fields = [];
        const values = [];
        let paramCounter = 1;
        Object.keys(validation.value).forEach(key => {
            if (validation.value[key] !== undefined) {
                fields.push(`${key} = $${paramCounter}`);
                if (key === 'recurrence_rule' || key === 'reminders') {
                    values.push(JSON.stringify(validation.value[key]));
                }
                else {
                    values.push(validation.value[key]);
                }
                paramCounter++;
            }
        });
        fields.push(`updated_at = $${paramCounter}`);
        values.push(new Date());
        paramCounter++;
        values.push(id);
        values.push(TEMP_USER_ID);
        const updateQuery = `
      UPDATE calendar_events
      SET ${fields.join(', ')}
      WHERE id = $${paramCounter} AND user_id = $${paramCounter + 1}
      RETURNING *
    `;
        const result = await pool.query(updateQuery, values);
        res.json({
            status: 'success',
            data: result.rows[0]
        });
    }
    catch (error) {
        logger_1.default.error('Error updating event:', error);
        next(error);
    }
});
// DELETE /api/calendar/events/:id - Delete event
router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const pool = (0, connection_1.getPool)();
        const result = await pool.query('DELETE FROM calendar_events WHERE id = $1 AND user_id = $2 RETURNING id', [id, TEMP_USER_ID]);
        if (result.rowCount === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Event not found'
            });
        }
        res.json({
            status: 'success',
            message: 'Event deleted successfully'
        });
    }
    catch (error) {
        logger_1.default.error('Error deleting event:', error);
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=events.js.map