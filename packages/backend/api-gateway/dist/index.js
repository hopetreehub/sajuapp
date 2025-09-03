"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_proxy_middleware_1 = require("http-proxy-middleware");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.API_GATEWAY_PORT || 4002;
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
// Middleware
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:4010',
    credentials: true
}));
app.use(express_1.default.json());
app.use('/api', limiter);
// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'api-gateway',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});
// Service routes
const services = {
    '/api/calendar': {
        target: process.env.CALENDAR_SERVICE_URL || 'http://localhost:4001',
        changeOrigin: true,
        pathRewrite: {
            '^/api/calendar': '/api/calendar'
        },
        onError: (err, req, res) => {
            console.error('Calendar service error:', err);
            res.status(503).json({
                error: 'Calendar service unavailable',
                message: 'Please try again later'
            });
        }
    },
    '/api/auth': {
        target: process.env.AUTH_SERVICE_URL || 'http://localhost:4004',
        changeOrigin: true,
        pathRewrite: {
            '^/api/auth': '/api/auth'
        },
        onError: (err, req, res) => {
            console.error('Auth service error:', err);
            res.status(503).json({
                error: 'Auth service unavailable',
                message: 'Please try again later'
            });
        }
    },
    '/api/diary': {
        target: process.env.DIARY_SERVICE_URL || 'http://localhost:4005',
        changeOrigin: true,
        pathRewrite: {
            '^/api/diary': '/api/diary'
        },
        onError: (err, req, res) => {
            console.error('Diary service error:', err);
            res.status(503).json({
                error: 'Diary service unavailable',
                message: 'Please try again later'
            });
        }
    },
    '/api/interpretation': {
        target: process.env.SAJU_SERVICE_URL || 'http://localhost:4002',
        changeOrigin: true,
        pathRewrite: {
            '^/api/interpretation': '/api/interpretation'
        },
        onError: (err, req, res) => {
            console.error('Saju interpretation service error:', err);
            res.status(503).json({
                error: 'Saju interpretation service unavailable',
                message: 'Please try again later'
            });
        }
    }
};
// Apply proxy middleware for each service
Object.keys(services).forEach(path => {
    app.use(path, (0, http_proxy_middleware_1.createProxyMiddleware)(services[path]));
});
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Cannot ${req.method} ${req.url}`,
        availableEndpoints: Object.keys(services)
    });
});
// Error handler
app.use((err, req, res, next) => {
    console.error('Gateway error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});
app.listen(PORT, () => {
    console.log(`API Gateway is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('Routing configuration:');
    Object.entries(services).forEach(([path, config]) => {
        console.log(`  ${path} -> ${config.target}`);
    });
});
// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    process.exit(0);
});
process.on('SIGINT', () => {
    console.log('SIGINT signal received: closing HTTP server');
    process.exit(0);
});
