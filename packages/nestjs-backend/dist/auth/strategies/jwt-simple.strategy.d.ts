import { ConfigService } from '@nestjs/config';
import { Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { UserSimple } from '../../entities/user-simple.entity';
export interface JwtPayload {
    sub: string;
    email: string;
    iat?: number;
    exp?: number;
}
declare const JwtSimpleStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtSimpleStrategy extends JwtSimpleStrategy_base {
    private readonly userRepository;
    private readonly configService;
    constructor(userRepository: Repository<UserSimple>, configService: ConfigService);
    validate(payload: JwtPayload): Promise<UserSimple>;
}
export {};
