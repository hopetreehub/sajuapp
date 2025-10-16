/**
 * User Types & Interfaces
 * 사용자 관련 타입 정의
 */

export type UserRole = 'user' | 'admin' | 'super_admin';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'suspended';
export type LunarSolar = 'lunar' | 'solar';

/**
 * 데이터베이스 User 모델
 */
export interface User {
  id: number;
  email: string;
  username: string;
  password_hash: string;

  // 역할 및 승인
  role: UserRole;
  approval_status: ApprovalStatus;

  // 승인 관련
  approved_by: number | null;
  approved_at: string | null;
  rejection_reason: string | null;

  // 사용자 정보
  phone: string | null;
  birth_date: string | null;
  birth_time: string | null;
  lunar_solar: LunarSolar | null;

  // 추천 시스템
  referral_code: string | null;
  referred_by: number | null;

  // 타임스탬프
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
  deleted_at: string | null;
}

/**
 * 클라이언트에게 반환할 User 정보 (비밀번호 제외)
 */
export interface UserResponse {
  id: number;
  email: string;
  username: string;
  role: UserRole;
  approval_status: ApprovalStatus;
  phone: string | null;
  birth_date: string | null;
  birth_time: string | null;
  lunar_solar: LunarSolar | null;
  referral_code: string | null;
  created_at: string;
  last_login_at: string | null;
}

/**
 * 회원가입 요청 데이터
 */
export interface SignUpRequest {
  email: string;
  username: string;
  password: string;
  phone?: string;
  birth_date?: string;
  birth_time?: string;
  lunar_solar?: LunarSolar;
  referral_code?: string;
}

/**
 * 로그인 요청 데이터
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * 로그인 응답 데이터
 */
export interface LoginResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: UserResponse;
  approval_status?: ApprovalStatus;
}

/**
 * JWT 페이로드
 */
export interface JWTPayload {
  userId: number;
  email: string;
  role: UserRole;
  approval_status: ApprovalStatus;
  iat?: number;
  exp?: number;
}

/**
 * 관리자 승인/거부 요청
 */
export interface ApprovalRequest {
  userId: number;
  action: 'approve' | 'reject' | 'suspend';
  reason?: string;
}

/**
 * Audit Log
 */
export interface AuditLog {
  id: number;
  admin_id: number;
  target_user_id: number | null;
  action: string;
  details: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

/**
 * 사용자 목록 조회 필터
 */
export interface UserListFilter {
  approval_status?: ApprovalStatus;
  role?: UserRole;
  search?: string;
  limit?: number;
  offset?: number;
}

/**
 * User 객체에서 민감한 정보 제거
 */
export function sanitizeUser(user: User): UserResponse {
  const { password_hash, approved_by, rejection_reason, updated_at, deleted_at, referred_by, ...sanitized } = user;
  return sanitized as UserResponse;
}

/**
 * 여러 User 객체 sanitize
 */
export function sanitizeUsers(users: User[]): UserResponse[] {
  return users.map(sanitizeUser);
}
