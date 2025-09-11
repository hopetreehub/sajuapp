"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uuid_1 = require("uuid");
const connection_1 = require("../database/connection");
const logger_1 = __importDefault(require("../utils/logger"));
const router = (0, express_1.Router)();
// GET /api/diaries/search - 일기 검색 (더 구체적인 경로를 먼저 정의)
router.get('/search', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'] || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
        const { q, mood, startDate, endDate } = req.query;
        const db = (0, connection_1.getDb)();
        let query = 'SELECT * FROM diary_entries WHERE user_id = ?';
        const params = [userId];
        if (q) {
            query += ' AND content LIKE ?';
            params.push(`%${q}%`);
        }
        if (mood) {
            query += ' AND mood = ?';
            params.push(mood);
        }
        if (startDate) {
            query += ' AND date >= ?';
            params.push(startDate);
        }
        if (endDate) {
            query += ' AND date <= ?';
            params.push(endDate);
        }
        query += ' ORDER BY date DESC';
        const diaries = await db.all(query, params);
        // Parse tags and images JSON
        const parsedDiaries = diaries.map((diary) => ({
            ...diary,
            tags: diary.tags ? JSON.parse(diary.tags) : [],
            images: diary.images ? JSON.parse(diary.images) : []
        }));
        res.json(parsedDiaries);
    }
    catch (error) {
        logger_1.default.error('Failed to search diaries:', error);
        res.status(500).json({ error: 'Failed to search diaries' });
    }
});
// GET /api/diaries - 일기 목록 조회 (페이지네이션)
router.get('/', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'] || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
        const { page = 1, limit = 20, month } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        const db = (0, connection_1.getDb)();
        let query = 'SELECT * FROM diary_entries WHERE user_id = ?';
        const params = [userId];
        if (month) {
            query += ' AND date LIKE ?';
            params.push(`${month}%`);
        }
        query += ' ORDER BY date DESC LIMIT ? OFFSET ?';
        params.push(Number(limit), offset);
        const diaries = await db.all(query, params);
        // Parse tags and images JSON
        const parsedDiaries = diaries.map((diary) => ({
            ...diary,
            tags: diary.tags ? JSON.parse(diary.tags) : [],
            images: diary.images ? JSON.parse(diary.images) : []
        }));
        res.json(parsedDiaries);
    }
    catch (error) {
        logger_1.default.error('Failed to fetch diaries:', error);
        res.status(500).json({ error: 'Failed to fetch diaries' });
    }
});
// GET /api/diaries/:date - 특정 날짜 일기 조회
router.get('/:date', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'] || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
        const { date } = req.params;
        const db = (0, connection_1.getDb)();
        const diary = await db.get('SELECT * FROM diary_entries WHERE user_id = ? AND date = ?', [userId, date]);
        if (!diary) {
            return res.status(404).json({ error: 'Diary entry not found' });
        }
        // Parse tags and images JSON
        diary.tags = diary.tags ? JSON.parse(diary.tags) : [];
        diary.images = diary.images ? JSON.parse(diary.images) : [];
        res.json(diary);
    }
    catch (error) {
        logger_1.default.error('Failed to fetch diary:', error);
        res.status(500).json({ error: 'Failed to fetch diary' });
    }
});
// POST /api/diaries - 일기 작성
router.post('/', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'] || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
        const { date, content, mood, weather, tags, images } = req.body;
        if (!date || !content) {
            return res.status(400).json({ error: 'Date and content are required' });
        }
        const db = (0, connection_1.getDb)();
        const id = (0, uuid_1.v4)();
        const now = new Date().toISOString();
        await db.run(`INSERT INTO diary_entries (id, user_id, date, content, mood, weather, tags, images, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [id, userId, date, content, mood || null, weather || null,
            tags ? JSON.stringify(tags) : null, images ? JSON.stringify(images) : null, now, now]);
        const newDiary = await db.get('SELECT * FROM diary_entries WHERE id = ?', [id]);
        newDiary.tags = newDiary.tags ? JSON.parse(newDiary.tags) : [];
        newDiary.images = newDiary.images ? JSON.parse(newDiary.images) : [];
        res.status(201).json(newDiary);
    }
    catch (error) {
        if (error.code === 'SQLITE_CONSTRAINT') {
            return res.status(409).json({ error: 'Diary entry for this date already exists' });
        }
        logger_1.default.error('Failed to create diary:', error);
        res.status(500).json({ error: 'Failed to create diary' });
    }
});
// PUT /api/diaries/:id - 일기 수정
router.put('/:id', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'] || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
        const { id } = req.params;
        const { content, mood, weather, tags, images } = req.body;
        const db = (0, connection_1.getDb)();
        const now = new Date().toISOString();
        const result = await db.run(`UPDATE diary_entries 
       SET content = COALESCE(?, content),
           mood = COALESCE(?, mood),
           weather = COALESCE(?, weather),
           tags = COALESCE(?, tags),
           images = COALESCE(?, images),
           updated_at = ?
       WHERE id = ? AND user_id = ?`, [content, mood, weather, tags ? JSON.stringify(tags) : null,
            images ? JSON.stringify(images) : null, now, id, userId]);
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Diary entry not found' });
        }
        const updatedDiary = await db.get('SELECT * FROM diary_entries WHERE id = ?', [id]);
        updatedDiary.tags = updatedDiary.tags ? JSON.parse(updatedDiary.tags) : [];
        updatedDiary.images = updatedDiary.images ? JSON.parse(updatedDiary.images) : [];
        res.json(updatedDiary);
    }
    catch (error) {
        logger_1.default.error('Failed to update diary:', error);
        res.status(500).json({ error: 'Failed to update diary' });
    }
});
// DELETE /api/diaries/:id - 일기 삭제
router.delete('/:id', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'] || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
        const { id } = req.params;
        const db = (0, connection_1.getDb)();
        const result = await db.run('DELETE FROM diary_entries WHERE id = ? AND user_id = ?', [id, userId]);
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Diary entry not found' });
        }
        res.status(204).send();
    }
    catch (error) {
        logger_1.default.error('Failed to delete diary:', error);
        res.status(500).json({ error: 'Failed to delete diary' });
    }
});
exports.default = router;
//# sourceMappingURL=diaries.js.map