import { Router } from 'express';
import { DiaryController } from '@/controllers/diary.controller';
import { rateLimitMiddleware } from '@/middleware/rate-limit.middleware';
import { validateApiKey } from '@/middleware/auth.middleware';
import { requestLogger } from '@/middleware/request-logger.middleware';

const router = Router();
const diaryController = new DiaryController();

// 미들웨어 적용
router.use(requestLogger);
router.use(validateApiKey);
router.use(rateLimitMiddleware);

// 다이어리 인사이트 라우트
router.post('/insights', diaryController.getDiaryInsights.bind(diaryController));
router.post('/advice', diaryController.getPersonalAdvice.bind(diaryController));

export default router;