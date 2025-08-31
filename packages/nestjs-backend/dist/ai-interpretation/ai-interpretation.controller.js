"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiInterpretationController = exports.InterpretSajuDto = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const ai_interpretation_service_1 = require("./ai-interpretation.service");
class InterpretSajuDto {
    name;
    birthInfo;
    sajuPillars;
    elements;
    balanceAnalysis;
}
exports.InterpretSajuDto = InterpretSajuDto;
let AiInterpretationController = class AiInterpretationController {
    aiInterpretationService;
    constructor(aiInterpretationService) {
        this.aiInterpretationService = aiInterpretationService;
    }
    async interpretSaju(req, sajuData) {
        try {
            const userId = req.user.userId;
            if (!sajuData.name || !sajuData.birthInfo || !sajuData.sajuPillars) {
                throw new common_1.HttpException('필수 사주 정보가 누락되었습니다.', common_1.HttpStatus.BAD_REQUEST);
            }
            const analysisData = {
                name: sajuData.name,
                birthInfo: sajuData.birthInfo,
                sajuPillars: sajuData.sajuPillars,
                elements: sajuData.elements,
                balanceAnalysis: sajuData.balanceAnalysis,
            };
            return await this.aiInterpretationService.interpretSajuAnalysis(userId, analysisData);
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException('AI 해석 생성 중 오류가 발생했습니다.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getQuickFortune(req, body) {
        try {
            const userId = req.user.userId;
            const today = new Date();
            const luckyScore = Math.floor(Math.random() * 40) + 60;
            const luckyColor = ['빨강', '파랑', '초록', '노랑', '보라'][Math.floor(Math.random() * 5)];
            const luckyNumber = Math.floor(Math.random() * 9) + 1;
            const fortuneMessages = [
                '오늘은 새로운 기회가 찾아올 날입니다.',
                '인간관계에서 좋은 소식이 있을 것 같습니다.',
                '창의적인 아이디어가 떠오르는 하루가 될 것입니다.',
                '건강관리에 특별히 신경 쓰세요.',
                '재운이 상승하는 기운이 느껴집니다.',
            ];
            const message = fortuneMessages[Math.floor(Math.random() * fortuneMessages.length)];
            return {
                date: today.toISOString().split('T')[0],
                luckyScore,
                luckyColor,
                luckyNumber,
                message,
                advice: '긍정적인 마음가짐을 유지하세요.',
            };
        }
        catch (error) {
            throw new common_1.HttpException('운세 정보를 가져오는 중 오류가 발생했습니다.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.AiInterpretationController = AiInterpretationController;
__decorate([
    (0, common_1.Post)('interpret'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '사주 AI 해석 생성' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'AI 해석 결과 반환',
        type: Object,
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: '인증 실패' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '잘못된 요청' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, InterpretSajuDto]),
    __metadata("design:returntype", Promise)
], AiInterpretationController.prototype, "interpretSaju", null);
__decorate([
    (0, common_1.Post)('quick-fortune'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '간단한 오늘의 운세' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '오늘의 운세 반환',
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AiInterpretationController.prototype, "getQuickFortune", null);
exports.AiInterpretationController = AiInterpretationController = __decorate([
    (0, swagger_1.ApiTags)('AI 해석'),
    (0, common_1.Controller)('ai-interpretation'),
    __metadata("design:paramtypes", [ai_interpretation_service_1.AiInterpretationService])
], AiInterpretationController);
//# sourceMappingURL=ai-interpretation.controller.js.map