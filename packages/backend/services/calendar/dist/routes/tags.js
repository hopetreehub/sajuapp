"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uuid_1 = require("uuid");
const sqlite_connection_1 = require("../database/sqlite-connection");
const logger_1 = __importDefault(require("../utils/logger"));
const router = (0, express_1.Router)();
// GET /api/tags - 태그 목록 조회
router.get('/', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'] || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
        const db = (0, sqlite_connection_1.getDb)();
        const tags = await db.all('SELECT * FROM tags WHERE user_id = ? ORDER BY name', [userId]);
        res.json(tags);
    }
    catch (error) {
        logger_1.default.error('Failed to fetch tags:', error);
        res.status(500).json({ error: 'Failed to fetch tags' });
    }
});
// GET /api/tags/:id - 특정 태그 조회
router.get('/:id', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'] || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
        const { id } = req.params;
        const db = (0, sqlite_connection_1.getDb)();
        const tag = await db.get('SELECT * FROM tags WHERE id = ? AND user_id = ?', [id, userId]);
        if (!tag) {
            return res.status(404).json({ error: 'Tag not found' });
        }
        res.json(tag);
    }
    catch (error) {
        logger_1.default.error('Failed to fetch tag:', error);
        res.status(500).json({ error: 'Failed to fetch tag' });
    }
});
// POST /api/tags - 태그 생성
router.post('/', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'] || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
        const { name, color } = req.body;
        if (!name || !color) {
            return res.status(400).json({ error: 'Name and color are required' });
        }
        const db = (0, sqlite_connection_1.getDb)();
        const id = (0, uuid_1.v4)();
        const now = new Date().toISOString();
        await db.run(`INSERT INTO tags (id, name, color, user_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`, [id, name, color, userId, now, now]);
        const newTag = await db.get('SELECT * FROM tags WHERE id = ?', [id]);
        res.status(201).json(newTag);
    }
    catch (error) {
        if (error.code === 'SQLITE_CONSTRAINT') {
            return res.status(409).json({ error: 'Tag with this name already exists' });
        }
        logger_1.default.error('Failed to create tag:', error);
        res.status(500).json({ error: 'Failed to create tag' });
    }
});
// PUT /api/tags/:id - 태그 수정
router.put('/:id', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'] || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
        const { id } = req.params;
        const { name, color } = req.body;
        const db = (0, sqlite_connection_1.getDb)();
        const now = new Date().toISOString();
        const result = await db.run(`UPDATE tags 
       SET name = COALESCE(?, name), 
           color = COALESCE(?, color),
           updated_at = ?
       WHERE id = ? AND user_id = ?`, [name, color, now, id, userId]);
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Tag not found' });
        }
        const updatedTag = await db.get('SELECT * FROM tags WHERE id = ?', [id]);
        res.json(updatedTag);
    }
    catch (error) {
        if (error.code === 'SQLITE_CONSTRAINT') {
            return res.status(409).json({ error: 'Tag with this name already exists' });
        }
        logger_1.default.error('Failed to update tag:', error);
        res.status(500).json({ error: 'Failed to update tag' });
    }
});
// DELETE /api/tags/:id - 태그 삭제
router.delete('/:id', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'] || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
        const { id } = req.params;
        const db = (0, sqlite_connection_1.getDb)();
        const result = await db.run('DELETE FROM tags WHERE id = ? AND user_id = ?', [id, userId]);
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Tag not found' });
        }
        res.status(204).send();
    }
    catch (error) {
        logger_1.default.error('Failed to delete tag:', error);
        res.status(500).json({ error: 'Failed to delete tag' });
    }
});
// POST /api/events/:eventId/tags - 이벤트에 태그 추가
router.post('/events/:eventId/tags', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'] || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
        const { eventId } = req.params;
        const { tagIds } = req.body;
        if (!Array.isArray(tagIds) || tagIds.length === 0) {
            return res.status(400).json({ error: 'tagIds array is required' });
        }
        const db = (0, sqlite_connection_1.getDb)();
        // 이벤트 존재 확인
        const event = await db.get('SELECT id FROM calendar_events WHERE id = ? AND user_id = ?', [eventId, userId]);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        // 기존 태그 연결 삭제
        await db.run('DELETE FROM event_tags WHERE event_id = ?', [eventId]);
        // 새 태그 연결 추가
        const now = new Date().toISOString();
        for (const tagId of tagIds) {
            await db.run('INSERT INTO event_tags (event_id, tag_id, created_at) VALUES (?, ?, ?)', [eventId, tagId, now]);
        }
        // 연결된 태그 목록 조회
        const tags = await db.all(`SELECT t.* FROM tags t
       INNER JOIN event_tags et ON t.id = et.tag_id
       WHERE et.event_id = ?`, [eventId]);
        res.json(tags);
    }
    catch (error) {
        logger_1.default.error('Failed to add tags to event:', error);
        res.status(500).json({ error: 'Failed to add tags to event' });
    }
});
// GET /api/events/:eventId/tags - 이벤트의 태그 목록 조회
router.get('/events/:eventId/tags', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'] || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
        const { eventId } = req.params;
        const db = (0, sqlite_connection_1.getDb)();
        // 이벤트 존재 확인
        const event = await db.get('SELECT id FROM calendar_events WHERE id = ? AND user_id = ?', [eventId, userId]);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        // 태그 목록 조회
        const tags = await db.all(`SELECT t.* FROM tags t
       INNER JOIN event_tags et ON t.id = et.tag_id
       WHERE et.event_id = ?`, [eventId]);
        res.json(tags);
    }
    catch (error) {
        logger_1.default.error('Failed to fetch event tags:', error);
        res.status(500).json({ error: 'Failed to fetch event tags' });
    }
});
// DELETE /api/events/:eventId/tags/:tagId - 이벤트에서 특정 태그 제거
router.delete('/events/:eventId/tags/:tagId', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'] || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
        const { eventId, tagId } = req.params;
        const db = (0, sqlite_connection_1.getDb)();
        // 이벤트 존재 확인
        const event = await db.get('SELECT id FROM calendar_events WHERE id = ? AND user_id = ?', [eventId, userId]);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        // 태그 연결 삭제
        const result = await db.run('DELETE FROM event_tags WHERE event_id = ? AND tag_id = ?', [eventId, tagId]);
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Tag not associated with this event' });
        }
        res.status(204).send();
    }
    catch (error) {
        logger_1.default.error('Failed to remove tag from event:', error);
        res.status(500).json({ error: 'Failed to remove tag from event' });
    }
});
exports.default = router;
//# sourceMappingURL=tags.js.map