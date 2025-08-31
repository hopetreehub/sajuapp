import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { UserSimple, UserStatus } from '../entities/user-simple.entity';
interface RegisterData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}
interface LoginData {
    email: string;
    password: string;
}
export declare class AuthSimpleService {
    private readonly userRepository;
    private readonly jwtService;
    private readonly configService;
    constructor(userRepository: Repository<UserSimple>, jwtService: JwtService, configService: ConfigService);
    register(data: RegisterData): Promise<{
        message: string;
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            status: UserStatus;
            emailVerified: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    login(data: LoginData): Promise<{
        accessToken: string;
        tokenType: string;
        expiresIn: number;
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            status: UserStatus;
            emailVerified: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    validateUser(email: string, password: string): Promise<UserSimple | null>;
    private sanitizeUser;
}
export {};
