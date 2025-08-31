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
exports.JwtSimpleStrategy = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const passport_1 = require("@nestjs/passport");
const passport_jwt_1 = require("passport-jwt");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const user_simple_entity_1 = require("../../entities/user-simple.entity");
let JwtSimpleStrategy = class JwtSimpleStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy, 'jwt-simple') {
    userRepository;
    configService;
    constructor(userRepository, configService) {
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get('jwt.accessTokenSecret') ||
                'dev-super-secret-access-token-key-for-sajuapp-development',
        });
        this.userRepository = userRepository;
        this.configService = configService;
    }
    async validate(payload) {
        const { sub: userId } = payload;
        const user = await this.userRepository.findOne({
            where: { id: userId },
            select: [
                'id',
                'email',
                'firstName',
                'lastName',
                'status',
                'emailVerified',
                'createdAt',
                'updatedAt',
            ],
        });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        if (user.status !== user_simple_entity_1.UserStatus.ACTIVE) {
            throw new common_1.UnauthorizedException('Account is not active');
        }
        return user;
    }
};
exports.JwtSimpleStrategy = JwtSimpleStrategy;
exports.JwtSimpleStrategy = JwtSimpleStrategy = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(user_simple_entity_1.UserSimple)),
    __metadata("design:paramtypes", [typeorm_1.Repository,
        config_1.ConfigService])
], JwtSimpleStrategy);
//# sourceMappingURL=jwt-simple.strategy.js.map