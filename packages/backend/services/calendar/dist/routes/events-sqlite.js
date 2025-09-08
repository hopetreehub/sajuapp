"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uuid_1 = require("uuid");
const sqlite_connection_1 = require("../database/sqlite-connection");
const eventValidator_1 = require("../validators/eventValidator");
const logger_1 = __importDefault(require("../utils/logger"));
const router = (0, express_1.Router)();
// Temporary user ID (should come from auth middleware in production)
const TEMP_USER_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
// GET /api/calendar/events - Get all events
router.get('/', async (req, res, next) => {
    try {
        const { start, end } = req.query;
        const db = (0, sqlite_connection_1.getDb)();
        let query = `
      SELECT * FROM calendar_events 
      WHERE user_id = ?
    `;
        const params = [TEMP_USER_ID];
        if (start && end) {
            query += ` AND (
        (start_datetime >= ? AND start_datetime <= ?) OR
        (end_datetime >= ? AND end_datetime <= ?) OR
        (start_datetime <= ? AND end_datetime >= ?)
      )`;
            params.push(start, end, start, end, start, end);
        }
        query += ' ORDER BY start_datetime ASC';
        const events = await db.all(query, params);
        // Parse JSON fields and rename to match frontend expectations
        const parsedEvents = events.map((event) => ({
            id: event.id,
            title: event.title,
            description: event.description,
            start_time: event.start_datetime,
            end_time: event.end_datetime,
            all_day: event.is_all_day === 1,
            location: event.location,
            type: event.category,
            color: event.color,
            reminder_minutes: event.reminders ? JSON.parse(event.reminders)[0]?.minutesBefore : null,
            created_at: event.created_at,
            updated_at: event.updated_at
        }));
        res.json({
            status: 'success',
            data: parsedEvents,
            count: parsedEvents.length
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
        const db = (0, sqlite_connection_1.getDb)();
        const event = await db.get('SELECT * FROM calendar_events WHERE id = ? AND user_id = ?', [id, TEMP_USER_ID]);
        if (!event) {
            return res.status(404).json({
                status: 'error',
                message: 'Event not found'
            });
        }
        // Parse JSON fields and rename to match frontend expectations
        const parsedEvent = {
            id: event.id,
            title: event.title,
            description: event.description,
            start_time: event.start_datetime,
            end_time: event.end_datetime,
            all_day: event.is_all_day === 1,
            location: event.location,
            type: event.category,
            color: event.color,
            reminder_minutes: event.reminders ? JSON.parse(event.reminders)[0]?.minutesBefore : null,
            created_at: event.created_at,
            updated_at: event.updated_at
        };
        res.json({
            status: 'success',
            data: parsedEvent
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
        // Transform frontend field names to backend field names
        const transformedBody = {
            title: req.body.title,
            description: req.body.description,
            start_datetime: req.body.start_time,
            end_datetime: req.body.end_time,
            is_all_day: req.body.all_day,
            color: req.body.color,
            category: req.body.type || 'personal',
            location: req.body.location,
            reminders: req.body.reminder_minutes > 0 ? [{ type: 'notification', minutesBefore: req.body.reminder_minutes }] : []
        };
        const validation = (0, eventValidator_1.validateEvent)(transformedBody);
        if (validation.error) {
            return res.status(400).json({
                status: 'error',
                message: validation.error.message
            });
        }
        const { title, description, start_datetime, end_datetime, is_all_day, color, category, location, recurrence_rule, reminders, attendees, diary_linked } = validation.value;
        const db = (0, sqlite_connection_1.getDb)();
        const eventId = (0, uuid_1.v4)();
        const now = new Date().toISOString();
        const query = `
      INSERT INTO calendar_events (
        id, user_id, title, description, start_datetime, end_datetime,
        is_all_day, color, category, location, recurrence_rule,
        reminders, attendees, diary_linked, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `;
        const values = [
            eventId,
            TEMP_USER_ID,
            title,
            description || null,
            start_datetime,
            end_datetime,
            is_all_day ? 1 : 0,
            color || '#3B82F6',
            category || null,
            location || null,
            recurrence_rule ? JSON.stringify(recurrence_rule) : null,
            reminders ? JSON.stringify(reminders) : null,
            attendees ? JSON.stringify(attendees) : null,
            diary_linked ? 1 : 0,
            now,
            now
        ];
        await db.run(query, values);
        const newEvent = await db.get('SELECT * FROM calendar_events WHERE id = ?', eventId);
        res.status(201).json({
            status: 'success',
            data: {
                id: newEvent.id,
                title: newEvent.title,
                description: newEvent.description,
                start_time: newEvent.start_datetime,
                end_time: newEvent.end_datetime,
                all_day: newEvent.is_all_day === 1,
                location: newEvent.location,
                type: newEvent.category,
                color: newEvent.color,
                reminder_minutes: newEvent.reminders ? JSON.parse(newEvent.reminders)[0]?.minutesBefore : null,
                created_at: newEvent.created_at,
                updated_at: newEvent.updated_at
            }
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
        // Transform frontend field names to backend field names
        const transformedBody = {};
        if (req.body.title !== undefined)
            transformedBody.title = req.body.title;
        if (req.body.description !== undefined)
            transformedBody.description = req.body.description;
        if (req.body.start_time !== undefined)
            transformedBody.start_datetime = req.body.start_time;
        if (req.body.end_time !== undefined)
            transformedBody.end_datetime = req.body.end_time;
        if (req.body.all_day !== undefined)
            transformedBody.is_all_day = req.body.all_day;
        if (req.body.color !== undefined)
            transformedBody.color = req.body.color;
        if (req.body.type !== undefined)
            transformedBody.category = req.body.type;
        if (req.body.location !== undefined)
            transformedBody.location = req.body.location;
        if (req.body.reminder_minutes !== undefined) {
            transformedBody.reminders = req.body.reminder_minutes > 0 ? [{ type: 'notification', minutesBefore: req.body.reminder_minutes }] : [];
        }
        const validation = (0, eventValidator_1.validateEvent)(transformedBody, true); // true for partial validation
        if (validation.error) {
            return res.status(400).json({
                status: 'error',
                message: validation.error.message
            });
        }
        const db = (0, sqlite_connection_1.getDb)();
        // Check if event exists
        const existingEvent = await db.get('SELECT id FROM calendar_events WHERE id = ? AND user_id = ?', [id, TEMP_USER_ID]);
        if (!existingEvent) {
            return res.status(404).json({
                status: 'error',
                message: 'Event not found'
            });
        }
        // Build dynamic update query
        const fields = [];
        const values = [];
        Object.keys(validation.value).forEach(key => {
            if (validation.value[key] !== undefined) {
                fields.push(`${key} = ?`);
                if (key === 'recurrence_rule' || key === 'reminders' || key === 'attendees') {
                    values.push(JSON.stringify(validation.value[key]));
                }
                else if (key === 'is_all_day' || key === 'diary_linked') {
                    values.push(validation.value[key] ? 1 : 0);
                }
                else {
                    values.push(validation.value[key]);
                }
            }
        });
        fields.push('updated_at = ?');
        values.push(new Date().toISOString());
        values.push(id);
        values.push(TEMP_USER_ID);
        const updateQuery = `
      UPDATE calendar_events
      SET ${fields.join(', ')}
      WHERE id = ? AND user_id = ?
    `;
        await db.run(updateQuery, values);
        const updatedEvent = await db.get('SELECT * FROM calendar_events WHERE id = ?', id);
        res.json({
            status: 'success',
            data: {
                id: updatedEvent.id,
                title: updatedEvent.title,
                description: updatedEvent.description,
                start_time: updatedEvent.start_datetime,
                end_time: updatedEvent.end_datetime,
                all_day: updatedEvent.is_all_day === 1,
                location: updatedEvent.location,
                type: updatedEvent.category,
                color: updatedEvent.color,
                reminder_minutes: updatedEvent.reminders ? JSON.parse(updatedEvent.reminders)[0]?.minutesBefore : null,
                created_at: updatedEvent.created_at,
                updated_at: updatedEvent.updated_at
            }
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
        const db = (0, sqlite_connection_1.getDb)();
        const result = await db.run('DELETE FROM calendar_events WHERE id = ? AND user_id = ?', [id, TEMP_USER_ID]);
        if (result.changes === 0) {
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
//# sourceMappingURL=events-sqlite.js.map