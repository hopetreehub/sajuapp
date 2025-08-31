"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiInterpretationModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ai_interpretation_service_1 = require("./ai-interpretation.service");
const ai_interpretation_controller_1 = require("./ai-interpretation.controller");
const prisma_module_1 = require("../prisma/prisma.module");
let AiInterpretationModule = class AiInterpretationModule {
};
exports.AiInterpretationModule = AiInterpretationModule;
exports.AiInterpretationModule = AiInterpretationModule = __decorate([
    (0, common_1.Module)({
        imports: [config_1.ConfigModule, prisma_module_1.PrismaModule],
        controllers: [ai_interpretation_controller_1.AiInterpretationController],
        providers: [ai_interpretation_service_1.AiInterpretationService],
        exports: [ai_interpretation_service_1.AiInterpretationService],
    })
], AiInterpretationModule);
//# sourceMappingURL=ai-interpretation.module.js.map