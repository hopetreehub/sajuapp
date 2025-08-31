export declare enum UserStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    SUSPENDED = "suspended",
    PENDING_VERIFICATION = "pending_verification"
}
export declare class UserSimple {
    id: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    status: UserStatus;
    emailVerified: boolean;
    emailVerificationToken?: string;
    passwordResetToken?: string;
    twoFactorSecret?: string;
    twoFactorBackupCodes?: string;
    createdAt: Date;
    updatedAt: Date;
    get fullName(): string;
}
