import { AuthSimpleService } from './auth-simple.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserSimple } from '../entities/user-simple.entity';
export declare class AuthSimpleController {
    private readonly authService;
    constructor(authService: AuthSimpleService);
    register(registerDto: RegisterDto): Promise<{
        message: string;
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            status: import("../entities/user-simple.entity").UserStatus;
            emailVerified: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    login(loginDto: LoginDto): Promise<{
        accessToken: string;
        tokenType: string;
        expiresIn: number;
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            status: import("../entities/user-simple.entity").UserStatus;
            emailVerified: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    getProfile(user: UserSimple): Promise<{
        user: UserSimple;
    }>;
    checkAuth(user: UserSimple): Promise<{
        authenticated: boolean;
        user: UserSimple;
    }>;
}
