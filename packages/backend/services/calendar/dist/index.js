"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = require("http");
const logger_1 = __importDefault(require("./utils/logger"));
const errorHandler_1 = require("./middleware/errorHandler");
const requestLogger_1 = require("./middleware/requestLogger");
const events_sqlite_1 = __importDefault(require("./routes/events-sqlite"));
const health_sqlite_1 = __importDefault(require("./routes/health-sqlite"));
const tags_1 = __importDefault(require("./routes/tags"));
const customers_1 = __importDefault(require("./routes/customers"));
const sqlite_connection_1 = require("./database/sqlite-connection");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = 4012; // 고정 포트 사용
// Middleware
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:4000',
    credentials: true
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(requestLogger_1.requestLogger);
// Routes
app.use('/health', health_sqlite_1.default);
app.use('/api/calendar/events', events_sqlite_1.default);
app.use('/api/calendar/tags', tags_1.default);
app.use('/api/calendar/customers', customers_1.default);
// Error handling
app.use(errorHandler_1.errorHandler);
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Cannot ${req.method} ${req.url}`
    });
});
const server = (0, http_1.createServer)(app);
const startServer = async () => {
    try {
        // Initialize database connection
        await (0, sqlite_connection_1.initDatabase)();
        server.listen(PORT, () => {
            logger_1.default.info(`Calendar Service is running on port ${PORT}`);
            logger_1.default.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
        });
    }
    catch (error) {
        logger_1.default.error('Failed to start server:', error);
        process.exit(1);
    }
};
// Graceful shutdown
process.on('SIGTERM', () => {
    logger_1.default.info('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        logger_1.default.info('HTTP server closed');
        process.exit(0);
    });
});
process.on('SIGINT', () => {
    logger_1.default.info('SIGINT signal received: closing HTTP server');
    server.close(() => {
        logger_1.default.info('HTTP server closed');
        process.exit(0);
    });
});
startServer();
//# sourceMappingURL=index.js.map