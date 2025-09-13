import { Router } from 'express';
import { FortuneController } from '@/controllers/fortune.controller';
import { rateLimitMiddleware } from '@/middleware/rate-limit.middleware';
import { validateApiKey } from '@/middleware/auth.middleware';
import { requestLogger } from '@/middleware/request-logger.middleware';

const router = Router();
const fortuneController = new FortuneController();

// 미들웨어 적용
router.use(requestLogger);
router.use(validateApiKey);
router.use(rateLimitMiddleware);

// 운세 해석 라우트
router.post('/daily', fortuneController.getDailyFortune.bind(fortuneController));
router.post('/weekly', fortuneController.getWeeklyFortune.bind(fortuneController));
router.post('/monthly', fortuneController.getMonthlyFortune.bind(fortuneController));

export default router;