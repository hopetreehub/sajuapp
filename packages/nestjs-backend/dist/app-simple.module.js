"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppSimpleModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const core_1 = require("@nestjs/core");
const common_2 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const auth_simple_module_1 = require("./auth/auth-simple.module");
const ai_interpretation_module_1 = require("./ai-interpretation/ai-interpretation.module");
const calendar_module_1 = require("./calendar/calendar.module");
const jwt_simple_auth_guard_1 = require("./auth/guards/jwt-simple-auth.guard");
const jwt_config_1 = __importDefault(require("./config/jwt.config"));
const user_simple_entity_1 = require("./entities/user-simple.entity");
const calendar_event_entity_1 = require("./entities/calendar-event.entity");
let AppSimpleModule = class AppSimpleModule {
};
exports.AppSimpleModule = AppSimpleModule;
exports.AppSimpleModule = AppSimpleModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [jwt_config_1.default],
                envFilePath: ['.env'],
            }),
            typeorm_1.TypeOrmModule.forRoot({
                type: 'sqlite',
                database: 'sajuapp-simple.db',
                entities: [user_simple_entity_1.UserSimple, calendar_event_entity_1.CalendarEvent],
                synchronize: true,
                logging: true,
            }),
            auth_simple_module_1.AuthSimpleModule,
            ai_interpretation_module_1.AiInterpretationModule,
            calendar_module_1.CalendarModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            {
                provide: core_1.APP_GUARD,
                useClass: jwt_simple_auth_guard_1.JwtSimpleAuthGuard,
            },
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: common_2.ClassSerializerInterceptor,
            },
        ],
    })
], AppSimpleModule);
//# sourceMappingURL=app-simple.module.js.map