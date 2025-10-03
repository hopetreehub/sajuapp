"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sqlite_connection_1 = require("../database/sqlite-connection");
const logger_1 = __importDefault(require("../utils/logger"));
const router = (0, express_1.Router)();
router.get('/', async (req, res) => {
    try {
        const db = (0, sqlite_connection_1.getDb)();
        const todos = await db.all(`
      SELECT * FROM todos
      WHERE customer_id = ?
      ORDER BY date DESC, created_at DESC
    `, [1]);
        res.json(todos);
    }
    catch (error) {
        logger_1.default.error('Failed to fetch todos:', error);
        res.status(500).json({ error: 'Failed to fetch todos' });
    }
});
router.get('/:date', async (req, res) => {
    try {
        const { date } = req.params;
        const db = (0, sqlite_connection_1.getDb)();
        const todos = await db.all(`
      SELECT * FROM todos
      WHERE customer_id = ? AND date = ?
      ORDER BY priority DESC, created_at ASC
    `, [1, date]);
        res.json(todos);
    }
    catch (error) {
        logger_1.default.error('Failed to fetch todos by date:', error);
        res.status(500).json({ error: 'Failed to fetch todos' });
    }
});
router.post('/', async (req, res) => {
    try {
        const { title, date, priority = 'medium', completed = false, description = '' } = req.body;
        if (!title || !date) {
            return res.status(400).json({ error: 'Title and date are required' });
        }
        const id = crypto.randomUUID();
        const now = new Date().toISOString();
        const db = (0, sqlite_connection_1.getDb)();
        await db.run(`
      INSERT INTO todos (
        id, customer_id, title, description, date,
        priority, completed, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, 1, title, description, date, priority, completed ? 1 : 0, now, now]);
        const todo = await db.get('SELECT * FROM todos WHERE id = ?', [id]);
        res.status(201).json(todo);
    }
    catch (error) {
        logger_1.default.error('Failed to create todo:', error);
        res.status(500).json({ error: 'Failed to create todo' });
    }
});
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const now = new Date().toISOString();
        const db = (0, sqlite_connection_1.getDb)();
        const fields = [];
        const values = [];
        if ('title' in updates) {
            fields.push('title = ?');
            values.push(updates.title);
        }
        if ('description' in updates) {
            fields.push('description = ?');
            values.push(updates.description);
        }
        if ('date' in updates) {
            fields.push('date = ?');
            values.push(updates.date);
        }
        if ('priority' in updates) {
            fields.push('priority = ?');
            values.push(updates.priority);
        }
        if ('completed' in updates) {
            fields.push('completed = ?');
            values.push(updates.completed ? 1 : 0);
        }
        if (fields.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }
        fields.push('updated_at = ?');
        values.push(now);
        values.push(id);
        values.push(1);
        const result = await db.run(`
      UPDATE todos
      SET ${fields.join(', ')}
      WHERE id = ? AND customer_id = ?
    `, values);
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Todo not found' });
        }
        const todo = await db.get('SELECT * FROM todos WHERE id = ?', [id]);
        res.json(todo);
    }
    catch (error) {
        logger_1.default.error('Failed to update todo:', error);
        res.status(500).json({ error: 'Failed to update todo' });
    }
});
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const db = (0, sqlite_connection_1.getDb)();
        const result = await db.run('DELETE FROM todos WHERE id = ? AND customer_id = ?', [id, 1]);
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Todo not found' });
        }
        res.status(204).send();
    }
    catch (error) {
        logger_1.default.error('Failed to delete todo:', error);
        res.status(500).json({ error: 'Failed to delete todo' });
    }
});
router.patch('/:id/toggle', async (req, res) => {
    try {
        const { id } = req.params;
        const now = new Date().toISOString();
        const db = (0, sqlite_connection_1.getDb)();
        await db.run(`
      UPDATE todos
      SET completed = NOT completed, updated_at = ?
      WHERE id = ? AND customer_id = ?
    `, [now, id, 1]);
        const todo = await db.get('SELECT * FROM todos WHERE id = ?', [id]);
        if (!todo) {
            return res.status(404).json({ error: 'Todo not found' });
        }
        res.json(todo);
    }
    catch (error) {
        logger_1.default.error('Failed to toggle todo:', error);
        res.status(500).json({ error: 'Failed to toggle todo' });
    }
});
exports.default = router;
//# sourceMappingURL=todos.js.map