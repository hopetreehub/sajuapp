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
        // Check database connection
        const db = (0, sqlite_connection_1.getDb)();
        const result = await db.get('SELECT 1 as test');
        res.json({
            status: 'healthy',
            service: 'calendar-service',
            timestamp: new Date().toISOString(),
            database: result ? 'connected' : 'disconnected',
            uptime: process.uptime()
        });
    }
    catch (error) {
        logger_1.default.error('Health check failed:', error);
        res.status(503).json({
            status: 'unhealthy',
            service: 'calendar-service',
            timestamp: new Date().toISOString(),
            database: 'disconnected'
        });
    }
});
exports.default = router;
//# sourceMappingURL=health-sqlite.js.map