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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var AiInterpretationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiInterpretationService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const openai_1 = __importDefault(require("openai"));
let AiInterpretationService = AiInterpretationService_1 = class AiInterpretationService {
    configService;
    prisma;
    logger = new common_1.Logger(AiInterpretationService_1.name);
    openai;
    constructor(configService, prisma) {
        this.configService = configService;
        this.prisma = prisma;
        const apiKey = this.configService.get('OPENAI_API_KEY');
        if (apiKey) {
            this.openai = new openai_1.default({ apiKey });
        }
        else {
            this.logger.warn('OpenAI API key not configured - AI interpretations disabled');
        }
    }
    async interpretSajuAnalysis(userId, sajuData) {
        this.logger.log(`Generating AI interpretation for user ${userId}`);
        try {
            const personalityAnalysis = await this.generatePersonalityAnalysis(sajuData);
            const fortuneAnalysis = await this.generateFortuneAnalysis(sajuData);
            const lifePhases = await this.generateLifePhaseAnalysis(sajuData);
            const luckyElements = await this.generateLuckyElements(sajuData);
            const monthlyForecast = await this.generateMonthlyForecast(sajuData);
            const result = {
                personalityAnalysis,
                fortuneAnalysis,
                lifePhases,
                luckyElements,
                monthlyForecast,
            };
            await this.saveInterpretationResult(userId, sajuData, result);
            return result;
        }
        catch (error) {
            this.logger.error('Failed to generate AI interpretation', error);
            return await this.generateFallbackInterpretation(sajuData);
        }
    }
    async generatePersonalityAnalysis(sajuData) {
        if (!this.openai) {
            return this.getFallbackPersonalityAnalysis(sajuData);
        }
        const prompt = `
사주명리학 전문가로서 다음 사주 정보를 분석해 성격을 해석해주세요:

이름: ${sajuData.name}
생년월일: ${sajuData.birthInfo.year}년 ${sajuData.birthInfo.month}월 ${sajuData.birthInfo.day}일 ${sajuData.birthInfo.hour}:${sajuData.birthInfo.minute}
사주: ${sajuData.sajuPillars.year.heavenly}${sajuData.sajuPillars.year.earthly}년 ${sajuData.sajuPillars.month.heavenly}${sajuData.sajuPillars.month.earthly}월 ${sajuData.sajuPillars.day.heavenly}${sajuData.sajuPillars.day.earthly}일 ${sajuData.sajuPillars.hour.heavenly}${sajuData.sajuPillars.hour.earthly}시

오행 분포:
- 목(木): ${sajuData.elements.wood}
- 화(火): ${sajuData.elements.fire}  
- 토(土): ${sajuData.elements.earth}
- 금(金): ${sajuData.elements.metal}
- 수(水): ${sajuData.elements.water}

다음 형식으로 응답해주세요:
{
  "traits": ["성격특성1", "성격특성2", "성격특성3"],
  "strengths": ["장점1", "장점2", "장점3"],
  "weaknesses": ["단점1", "단점2"],
  "summary": "전체적인 성격 요약 (2-3문장)"
}
`;
        try {
            const response = await this.openai.chat.completions.create({
                model: 'gpt-4',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7,
                max_tokens: 1000,
            });
            const content = response.choices[0]?.message?.content;
            if (content) {
                return JSON.parse(content);
            }
        }
        catch (error) {
            this.logger.error('GPT-4 personality analysis failed', error);
        }
        return this.getFallbackPersonalityAnalysis(sajuData);
    }
    async generateFortuneAnalysis(sajuData) {
        if (!this.openai) {
            return this.getFallbackFortuneAnalysis(sajuData);
        }
        const prompt = `
사주명리학 전문가로서 다음 사주의 6대 영역(직업운, 애정운, 재물운, 건강운, 가족운, 학업운) 운세를 분석해주세요:

사주: ${sajuData.sajuPillars.year.heavenly}${sajuData.sajuPillars.year.earthly} ${sajuData.sajuPillars.month.heavenly}${sajuData.sajuPillars.month.earthly} ${sajuData.sajuPillars.day.heavenly}${sajuData.sajuPillars.day.earthly} ${sajuData.sajuPillars.hour.heavenly}${sajuData.sajuPillars.hour.earthly}

오행균형: ${sajuData.balanceAnalysis.recommendation}

각 영역을 1-100점으로 점수를 매기고 설명과 조언을 제공해주세요.
JSON 형식으로 응답:
{
  "career": {"score": 점수, "description": "설명", "advice": "조언"},
  "love": {"score": 점수, "description": "설명", "advice": "조언"},
  "wealth": {"score": 점수, "description": "설명", "advice": "조언"},
  "health": {"score": 점수, "description": "설명", "advice": "조언"},
  "family": {"score": 점수, "description": "설명", "advice": "조언"},
  "study": {"score": 점수, "description": "설명", "advice": "조언"}
}
`;
        try {
            const response = await this.openai.chat.completions.create({
                model: 'gpt-4',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.6,
                max_tokens: 1500,
            });
            const content = response.choices[0]?.message?.content;
            if (content) {
                return JSON.parse(content);
            }
        }
        catch (error) {
            this.logger.error('GPT-4 fortune analysis failed', error);
        }
        return this.getFallbackFortuneAnalysis(sajuData);
    }
    async generateLifePhaseAnalysis(sajuData) {
        const currentYear = new Date().getFullYear();
        const age = currentYear - sajuData.birthInfo.year + 1;
        if (!this.openai) {
            return {
                youth: '젊은 시절에는 활기찬 에너지로 새로운 도전을 즐기게 됩니다.',
                middleAge: '중년기에는 안정적인 성장과 성취를 이루게 됩니다.',
                oldAge: '노년기에는 평온하고 지혜로운 삶을 영위하게 됩니다.',
            };
        }
        const prompt = `
현재 ${age}세인 사주 ${sajuData.sajuPillars.year.heavenly}${sajuData.sajuPillars.year.earthly} ${sajuData.sajuPillars.month.heavenly}${sajuData.sajuPillars.month.earthly} ${sajuData.sajuPillars.day.heavenly}${sajuData.sajuPillars.day.earthly} ${sajuData.sajuPillars.hour.heavenly}${sajuData.sajuPillars.hour.earthly}의 
인생 3단계별 운세를 분석해주세요:

JSON 형식:
{
  "youth": "청년기(20-35세) 운세 설명",
  "middleAge": "중년기(36-60세) 운세 설명", 
  "oldAge": "노년기(61세 이후) 운세 설명"
}
`;
        try {
            const response = await this.openai.chat.completions.create({
                model: 'gpt-4',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.6,
                max_tokens: 800,
            });
            const content = response.choices[0]?.message?.content;
            if (content) {
                return JSON.parse(content);
            }
        }
        catch (error) {
            this.logger.error('GPT-4 life phase analysis failed', error);
        }
        return {
            youth: '젊은 시절에는 활기찬 에너지로 새로운 도전을 즐기게 됩니다.',
            middleAge: '중년기에는 안정적인 성장과 성취를 이루게 됩니다.',
            oldAge: '노년기에는 평온하고 지혜로운 삶을 영위하게 됩니다.',
        };
    }
    async generateLuckyElements(sajuData) {
        const dominantElements = sajuData.balanceAnalysis.dominantElements;
        const elementColors = {
            wood: ['녹색', '청색'],
            fire: ['빨강색', '주황색'],
            earth: ['노랑색', '갈색'],
            metal: ['흰색', '금색'],
            water: ['검정색', '파랑색'],
        };
        const elementNumbers = {
            wood: [3, 8],
            fire: [2, 7],
            earth: [5, 10],
            metal: [4, 9],
            water: [1, 6],
        };
        const elementDirections = {
            wood: ['동쪽'],
            fire: ['남쪽'],
            earth: ['중앙'],
            metal: ['서쪽'],
            water: ['북쪽'],
        };
        const elementSeasons = {
            wood: ['봄'],
            fire: ['여름'],
            earth: ['늦여름'],
            metal: ['가을'],
            water: ['겨울'],
        };
        const weakElements = sajuData.balanceAnalysis.weakElements;
        const colors = [];
        const numbers = [];
        const directions = [];
        const seasons = [];
        weakElements.forEach((element) => {
            colors.push(...(elementColors[element] || []));
            numbers.push(...(elementNumbers[element] || []));
            directions.push(...(elementDirections[element] || []));
            seasons.push(...(elementSeasons[element] || []));
        });
        return {
            colors: [...new Set(colors)],
            numbers: [...new Set(numbers)],
            directions: [...new Set(directions)],
            seasons: [...new Set(seasons)],
        };
    }
    async generateMonthlyForecast(sajuData) {
        const currentYear = new Date().getFullYear();
        const forecast = [];
        for (let month = 1; month <= 12; month++) {
            const monthElement = this.getMonthElement(month);
            const compatibility = this.calculateElementCompatibility(sajuData.elements, monthElement);
            const baseScore = 50 + compatibility * 20;
            const variance = Math.random() * 20 - 10;
            const overall = Math.max(20, Math.min(95, Math.round(baseScore + variance)));
            forecast.push({
                month,
                overall,
                career: overall + Math.round(Math.random() * 10 - 5),
                love: overall + Math.round(Math.random() * 10 - 5),
                wealth: overall + Math.round(Math.random() * 10 - 5),
                health: overall + Math.round(Math.random() * 10 - 5),
            });
        }
        return forecast;
    }
    getMonthElement(month) {
        const monthElements = {
            1: 'earth',
            2: 'wood',
            3: 'wood',
            4: 'earth',
            5: 'fire',
            6: 'fire',
            7: 'earth',
            8: 'metal',
            9: 'metal',
            10: 'earth',
            11: 'water',
            12: 'water',
        };
        return monthElements[month];
    }
    calculateElementCompatibility(userElements, monthElement) {
        const userDominant = Object.entries(userElements).reduce((a, b) => userElements[a[0]] > userElements[b[0]] ? a : b)[0];
        const compatibility = {
            wood: { fire: 1, earth: -0.5, metal: -1, water: 0.5, wood: 0 },
            fire: { earth: 1, metal: -0.5, water: -1, wood: 0.5, fire: 0 },
            earth: { metal: 1, water: -0.5, wood: -1, fire: 0.5, earth: 0 },
            metal: { water: 1, wood: -0.5, fire: -1, earth: 0.5, metal: 0 },
            water: { wood: 1, fire: -0.5, earth: -1, metal: 0.5, water: 0 },
        };
        return (compatibility[userDominant]?.[monthElement] || 0);
    }
    async saveInterpretationResult(userId, sajuData, result) {
        try {
            await this.prisma.sajuAnalysis.create({
                data: {
                    userId,
                    fourPillars: JSON.stringify(sajuData.sajuPillars),
                    fiveElements: JSON.stringify(sajuData.elements),
                    tenGods: JSON.stringify({}),
                    sixAreas: JSON.stringify({}),
                    seventeenFortunes: JSON.stringify({}),
                    personalityTraits: JSON.stringify(result),
                },
            });
            this.logger.log(`Saved AI interpretation for user ${userId}`);
        }
        catch (error) {
            this.logger.error('Failed to save interpretation result', error);
        }
    }
    getFallbackPersonalityAnalysis(sajuData) {
        return {
            traits: ['균형잡힌 성격', '적응력이 뛰어남', '책임감이 강함'],
            strengths: ['꾸준함', '신뢰성', '창의성'],
            weaknesses: ['완벽주의', '걱정이 많음'],
            summary: '전체적으로 안정적이고 균형잡힌 성격을 가지고 있습니다.',
        };
    }
    getFallbackFortuneAnalysis(sajuData) {
        return {
            career: {
                score: 75,
                description: '꾸준한 발전이 예상됩니다',
                advice: '인내심을 가지고 꾸준히 노력하세요',
            },
            love: {
                score: 70,
                description: '따뜻한 인연을 만날 수 있습니다',
                advice: '진실한 마음으로 다가가세요',
            },
            wealth: {
                score: 65,
                description: '안정적인 재운을 가지고 있습니다',
                advice: '계획적인 투자가 필요합니다',
            },
            health: {
                score: 80,
                description: '전체적으로 건강한 편입니다',
                advice: '규칙적인 생활을 유지하세요',
            },
            family: {
                score: 85,
                description: '가족과의 관계가 원만합니다',
                advice: '소통을 더욱 늘려보세요',
            },
            study: {
                score: 70,
                description: '학습 능력이 뛰어납니다',
                advice: '꾸준한 노력이 중요합니다',
            },
        };
    }
    async generateFallbackInterpretation(sajuData) {
        return {
            personalityAnalysis: this.getFallbackPersonalityAnalysis(sajuData),
            fortuneAnalysis: this.getFallbackFortuneAnalysis(sajuData),
            lifePhases: {
                youth: '젊은 시절에는 활기찬 에너지로 새로운 도전을 즐기게 됩니다.',
                middleAge: '중년기에는 안정적인 성장과 성취를 이루게 됩니다.',
                oldAge: '노년기에는 평온하고 지혜로운 삶을 영위하게 됩니다.',
            },
            luckyElements: await this.generateLuckyElements(sajuData),
            monthlyForecast: await this.generateMonthlyForecast(sajuData),
        };
    }
};
exports.AiInterpretationService = AiInterpretationService;
exports.AiInterpretationService = AiInterpretationService = AiInterpretationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prisma_service_1.PrismaService])
], AiInterpretationService);
//# sourceMappingURL=ai-interpretation.service.js.map