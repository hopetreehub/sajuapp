-- 사용자 통계 뷰 추가
-- 기존 마이그레이션에서 누락된 뷰를 추가합니다

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