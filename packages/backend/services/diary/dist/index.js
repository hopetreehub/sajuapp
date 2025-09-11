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
const diaries_1 = __importDefault(require("./routes/diaries"));
const connection_1 = require("./database/connection");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.DIARY_SERVICE_PORT || 4004;
// Middleware
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:4000',
    credentials: true
}));
// Increase payload size limit to 50MB for image uploads
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '50mb' }));
app.use(requestLogger_1.requestLogger);
// Routes
app.use('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'diary-service',
        timestamp: new Date().toISOString()
    });
});
app.use('/api/diaries', diaries_1.default);
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
        await (0, connection_1.initDatabase)();
        server.listen(PORT, () => {
            logger_1.default.info(`Diary Service is running on port ${PORT}`);
            logger_1.default.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
        });
    }
    catch (error) {
        logger_1.default.error('Failed to start server:', error);
        process.exit(1);
    }
};
// Handle graceful shutdown
process.on('SIGTERM', async () => {
    logger_1.default.info('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        logger_1.default.info('HTTP server closed');
        process.exit(0);
    });
});
startServer();
//# sourceMappingURL=index.js.map