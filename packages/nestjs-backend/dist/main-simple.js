"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_simple_module_1 = require("./app-simple.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_simple_module_1.AppSimpleModule);
    const logger = new common_1.Logger('Bootstrap');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.enableCors({
        origin: ['http://localhost:4000', 'http://localhost:3000'],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    });
    app.setGlobalPrefix('api');
    const config = new swagger_1.DocumentBuilder()
        .setTitle('운명나침반 API (Simple)')
        .setDescription('사주 운세 + 캘린더 + 다이어리 통합 웹 애플리케이션 API')
        .setVersion('1.0')
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
    }, 'JWT-auth')
        .addTag('Authentication', '사용자 인증 관련 API')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
        },
    });
    const port = process.env.BACKEND_PORT || 4000;
    await app.listen(port);
    logger.log(`🚀 운명나침반 Simple Backend Server is running on: http://localhost:${port}/api`);
    logger.log(`📚 API Documentation available at: http://localhost:${port}/api/docs`);
}
bootstrap().catch((error) => {
    console.error('❌ Error starting server:', error);
    process.exit(1);
});
//# sourceMappingURL=main-simple.js.map