import { AiInterpretationService, InterpretationResult } from './ai-interpretation.service';
export declare class InterpretSajuDto {
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
export declare class AiInterpretationController {
    private aiInterpretationService;
    constructor(aiInterpretationService: AiInterpretationService);
    interpretSaju(req: any, sajuData: InterpretSajuDto): Promise<InterpretationResult>;
    getQuickFortune(req: any, body: {
        birthInfo: InterpretSajuDto['birthInfo'];
    }): Promise<{
        date: string;
        luckyScore: number;
        luckyColor: string;
        luckyNumber: number;
        message: string;
        advice: string;
    }>;
}
