"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const connection_1 = require("../database/connection");
const logger_1 = __importDefault(require("../utils/logger"));
const router = (0, express_1.Router)();
router.get('/', async (req, res) => {
    try {
        // Check database connection
        const pool = (0, connection_1.getPool)();
        const result = await pool.query('SELECT 1');
        res.json({
            status: 'healthy',
            service: 'calendar-service',
            timestamp: new Date().toISOString(),
            database: result.rowCount === 1 ? 'connected' : 'disconnected',
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
//# sourceMappingURL=health.js.map