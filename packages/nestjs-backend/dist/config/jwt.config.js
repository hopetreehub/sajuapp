"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('jwt', () => ({
    accessTokenSecret: process.env.JWT_ACCESS_SECRET || 'access-token-secret-key-for-development',
    refreshTokenSecret: process.env.JWT_REFRESH_SECRET ||
        'refresh-token-secret-key-for-development',
    accessTokenExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshTokenExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    verificationTokenExpiresIn: '24h',
    resetPasswordTokenExpiresIn: '1h',
}));
//# sourceMappingURL=jwt.config.js.map