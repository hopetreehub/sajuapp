"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthSimpleModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const config_1 = require("@nestjs/config");
const auth_simple_service_1 = require("./auth-simple.service");
const auth_simple_controller_1 = require("./auth-simple.controller");
const jwt_simple_strategy_1 = require("./strategies/jwt-simple.strategy");
const user_simple_entity_1 = require("../entities/user-simple.entity");
let AuthSimpleModule = class AuthSimpleModule {
};
exports.AuthSimpleModule = AuthSimpleModule;
exports.AuthSimpleModule = AuthSimpleModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([user_simple_entity_1.UserSimple]),
            passport_1.PassportModule,
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => ({
                    secret: configService.get('jwt.accessTokenSecret') ||
                        'dev-super-secret-access-token-key-for-sajuapp-development',
                    signOptions: {
                        expiresIn: configService.get('jwt.accessTokenExpiresIn') || '15m',
                    },
                }),
                inject: [config_1.ConfigService],
            }),
        ],
        controllers: [auth_simple_controller_1.AuthSimpleController],
        providers: [auth_simple_service_1.AuthSimpleService, jwt_simple_strategy_1.JwtSimpleStrategy],
        exports: [auth_simple_service_1.AuthSimpleService, jwt_1.JwtModule],
    })
], AuthSimpleModule);
//# sourceMappingURL=auth-simple.module.js.map