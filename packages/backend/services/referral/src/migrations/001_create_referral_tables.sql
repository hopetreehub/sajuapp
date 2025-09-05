-- 추천인 시스템 데이터베이스 스키마
-- 운명나침반 앱 추천인 코드 시스템

-- 1. 추천인 코드 테이블
CREATE TABLE IF NOT EXISTS referral_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code VARCHAR(12) UNIQUE NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    max_uses INTEGER DEFAULT NULL,
    current_uses INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT 1,
    fortune_category VARCHAR(50),
    regional_bonus BOOLEAN DEFAULT 0
);

-- 2. 추천 관계 테이블  
CREATE TABLE IF NOT EXISTS referral_relationships (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    referrer_id VARCHAR(36) NOT NULL,
    referee_id VARCHAR(36) NOT NULL,
    referral_code VARCHAR(12) NOT NULL,
    referred_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    first_payment_at TIMESTAMP,
    total_referee_value DECIMAL(10,2) DEFAULT 0,
    referrer_reward_given DECIMAL(10,2) DEFAULT 0,
    relationship_type VARCHAR(20),
    shared_analysis_count INTEGER DEFAULT 0
);

-- 3. 추천 보상 테이블
CREATE TABLE IF NOT EXISTS referral_rewards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id VARCHAR(36) NOT NULL,
    reward_type VARCHAR(20) NOT NULL,
    reward_value DECIMAL(10,2) NOT NULL,
    earned_from_referral_id INTEGER,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    redeemed_at TIMESTAMP,
    expires_at TIMESTAMP,
    fortune_unlock VARCHAR(100),
    compatibility_bonus BOOLEAN DEFAULT 0
);

-- 4. 추천 이벤트 로그 테이블
CREATE TABLE IF NOT EXISTS referral_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type VARCHAR(50) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    referral_code VARCHAR(12),
    referral_relationship_id INTEGER,
    event_data TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON referral_codes(code);
CREATE INDEX IF NOT EXISTS idx_referral_codes_user_id ON referral_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_codes_active ON referral_codes(is_active, expires_at);
CREATE INDEX IF NOT EXISTS idx_referral_relationships_referrer ON referral_relationships(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_relationships_referee ON referral_relationships(referee_id);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_user ON referral_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_events_user ON referral_events(user_id, created_at);

-- 5. 통계 뷰 생성
CREATE VIEW IF NOT EXISTS referral_user_stats AS
SELECT 
    rc.user_id,
    rc.code as my_referral_code,
    COUNT(rr.id) as total_invitations,
    COUNT(CASE WHEN rr.first_payment_at IS NOT NULL THEN 1 END) as successful_referrals,
    SUM(rr.total_referee_value) as total_generated_value,
    SUM(rr.referrer_reward_given) as total_rewards_received,
    MAX(rr.referred_at) as last_referral_date
FROM referral_codes rc
LEFT JOIN referral_relationships rr ON rc.code = rr.referral_code
WHERE rc.is_active = 1
GROUP BY rc.user_id, rc.code;

-- 초기 데이터 설정 (관리자용 특별 추천 코드)
INSERT OR IGNORE INTO referral_codes (code, user_id, fortune_category, max_uses, is_active) 
VALUES 
    ('WELCOME2024', 'admin', '총운', 1000, 1),
    ('FORTUNE777', 'admin', '재물운', 500, 1),
    ('LOVE2024', 'admin', '연애운', 300, 1);