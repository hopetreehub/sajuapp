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
// 포트 4000 절대 정책 - 내부 전용 포트 5000 사용
const PORT = process.env.API_GATEWAY_PORT || 5000;
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
// Middleware
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:4000',
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
        uptime: process.uptime(),
        port: PORT,
        policy: 'PORT_4000_ABSOLUTE_POLICY - Internal Gateway'
    });
});
// Service routes - 내부 포트 5001-5010 사용
const services = {
    '/api/calendar': {
        target: process.env.CALENDAR_SERVICE_URL || 'http://localhost:5001',
        changeOrigin: true,
        pathRewrite: {
            '^/api/calendar': '/api/calendar'
        },
        onError: (err, req, res) => {
            console.error('Calendar service error:', err);
            res.status(503).json({
                error: 'Calendar service unavailable',
                message: 'Please try again later',
                service: 'calendar',
                target: process.env.CALENDAR_SERVICE_URL || 'http://localhost:5001'
            });
        }
    },
    '/api/diary': {
        target: process.env.DIARY_SERVICE_URL || 'http://localhost:5002',
        changeOrigin: true,
        pathRewrite: {
            '^/api/diary': '/api'
        },
        onError: (err, req, res) => {
            console.error('Diary service error:', err);
            res.status(503).json({
                error: 'Diary service unavailable',
                message: 'Please try again later',
                service: 'diary',
                target: process.env.DIARY_SERVICE_URL || 'http://localhost:5002'
            });
        }
    },
    '/api/diaries': {
        target: process.env.DIARY_SERVICE_URL || 'http://localhost:5002',
        changeOrigin: true,
        pathRewrite: {
            '^/api/diaries': '/api/diaries'
        },
        onError: (err, req, res) => {
            console.error('Diary service error (diaries):', err);
            res.status(503).json({
                error: 'Diary service unavailable',
                message: 'Please try again later',
                service: 'diary-diaries',
                target: process.env.DIARY_SERVICE_URL || 'http://localhost:5002'
            });
        }
    },
    '/api/saju': {
        target: process.env.SAJU_SERVICE_URL || 'http://localhost:5003',
        changeOrigin: true,
        pathRewrite: {
            '^/api/saju': '/api/saju'
        },
        onError: (err, req, res) => {
            console.error('Saju analysis service error:', err);
            res.status(503).json({
                error: 'Saju analysis service unavailable',
                message: 'Please try again later',
                service: 'saju-analysis',
                target: process.env.SAJU_SERVICE_URL || 'http://localhost:5003'
            });
        }
    },
    '/api/referral': {
        target: process.env.REFERRAL_SERVICE_URL || 'http://localhost:5005',
        changeOrigin: true,
        pathRewrite: {
            '^/api/referral': '/api'
        },
        onError: (err, req, res) => {
            console.error('Referral service error:', err);
            res.status(503).json({
                error: 'Referral service unavailable',
                message: 'Please try again later',
                service: 'referral',
                target: process.env.REFERRAL_SERVICE_URL || 'http://localhost:5005'
            });
        }
    },
    '/api/academy': {
        target: process.env.ACADEMY_SERVICE_URL || 'http://localhost:5006',
        changeOrigin: true,
        pathRewrite: {
            '^/api/academy': '/api'
        },
        onError: (err, req, res) => {
            console.error('Academy service error:', err);
            res.status(503).json({
                error: 'Academy service unavailable',
                message: 'Please try again later',
                service: 'academy',
                target: process.env.ACADEMY_SERVICE_URL || 'http://localhost:5006'
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
        availableEndpoints: Object.keys(services),
        policy: 'PORT_4000_ABSOLUTE_POLICY'
    });
});
// Error handler
app.use((err, req, res, next) => {
    console.error('Gateway error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
        service: 'api-gateway',
        port: PORT
    });
});
app.listen(PORT, () => {
    console.log(`🚀 API Gateway running on INTERNAL port ${PORT}`);
    console.log(`📋 CLAUDE.md Policy: PORT_4000_ABSOLUTE_POLICY compliance`);
    console.log(`🌐 External access: http://localhost:4000/api/*`);
    console.log(`🔧 Internal access: http://localhost:${PORT}/*`);
    console.log('🔀 Service routing configuration:');
    Object.entries(services).forEach(([path, config]) => {
        console.log(`   ${path} -> ${config.target}`);
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
