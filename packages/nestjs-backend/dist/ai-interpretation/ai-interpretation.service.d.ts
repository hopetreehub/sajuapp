import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
export interface SajuAnalysisData {
    name: string;
    birthInfo: {
        year: number;
        month: number;
        day: number;
        hour: number;
        minute: number;
        isLunar: boolean;
    };
    sajuPillars: {
        year: {
            heavenly: string;
            earthly: string;
        };
        month: {
            heavenly: string;
            earthly: string;
        };
        day: {
            heavenly: string;
            earthly: string;
        };
        hour: {
            heavenly: string;
            earthly: string;
        };
    };
    elements: {
        wood: number;
        fire: number;
        earth: number;
        metal: number;
        water: number;
    };
    balanceAnalysis: {
        dominantElements: string[];
        weakElements: string[];
        recommendation: string;
    };
}
export interface InterpretationResult {
    personalityAnalysis: {
        traits: string[];
        strengths: string[];
        weaknesses: string[];
        summary: string;
    };
    fortuneAnalysis: {
        career: {
            score: number;
            description: string;
            advice: string;
        };
        love: {
            score: number;
            description: string;
            advice: string;
        };
        wealth: {
            score: number;
            description: string;
            advice: string;
        };
        health: {
            score: number;
            description: string;
            advice: string;
        };
        family: {
            score: number;
            description: string;
            advice: string;
        };
        study: {
            score: number;
            description: string;
            advice: string;
        };
    };
    lifePhases: {
        youth: string;
        middleAge: string;
        oldAge: string;
    };
    luckyElements: {
        colors: string[];
        numbers: number[];
        directions: string[];
        seasons: string[];
    };
    monthlyForecast: Array<{
        month: number;
        overall: number;
        career: number;
        love: number;
        wealth: number;
        health: number;
    }>;
}
export declare class AiInterpretationService {
    private configService;
    private prisma;
    private readonly logger;
    private openai;
    constructor(configService: ConfigService, prisma: PrismaService);
    interpretSajuAnalysis(userId: string, sajuData: SajuAnalysisData): Promise<InterpretationResult>;
    private generatePersonalityAnalysis;
    private generateFortuneAnalysis;
    private generateLifePhaseAnalysis;
    private generateLuckyElements;
    private generateMonthlyForecast;
    private getMonthElement;
    private calculateElementCompatibility;
    private saveInterpretationResult;
    private getFallbackPersonalityAnalysis;
    private getFallbackFortuneAnalysis;
    private generateFallbackInterpretation;
}
