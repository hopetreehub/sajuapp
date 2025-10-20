-- ==================================================
-- 운명나침반 프로덕션 데이터베이스 스키마
-- Vercel Postgres용 PostgreSQL 14+ 호환
-- ==================================================

-- ==================== customers 테이블 ====================
-- 사주 상담 고객 정보 관리
CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  birth_date DATE NOT NULL,
  birth_time TIME NOT NULL,
  phone VARCHAR(20),
  gender VARCHAR(10) CHECK (gender IN ('male', 'female')) NOT NULL,
  lunar_solar VARCHAR(10) CHECK (lunar_solar IN ('lunar', 'solar')) NOT NULL,
  memo TEXT,
  saju_data JSONB, -- 사주 분석 결과 (JSON 형식)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);
CREATE INDEX IF NOT EXISTS idx_customers_birth_date ON customers(birth_date);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at);

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==================== 샘플 데이터 (개발용) ====================
-- 프로덕션에서는 주석 처리
INSERT INTO customers (name, birth_date, birth_time, phone, gender, lunar_solar, memo) VALUES
('박준수', '1990-05-15', '14:30:00', '010-1234-5678', 'male', 'solar', '사주 상담 고객'),
('이정미', '1988-11-22', '09:15:00', '010-9876-5432', 'female', 'lunar', '궁합 상담 고객'),
('최민호', '1985-03-10', '16:45:00', '010-5555-1234', 'male', 'solar', '귀문둔갑 상담')
ON CONFLICT DO NOTHING;

-- ==================================================
-- 향후 마이그레이션 예정 테이블
-- ==================================================

-- ==================== users 테이블 (auth) ====================
-- TODO: auth.db에서 마이그레이션 예정
-- CREATE TABLE IF NOT EXISTS users (
--   id SERIAL PRIMARY KEY,
--   email VARCHAR(255) UNIQUE NOT NULL,
--   username VARCHAR(100) NOT NULL,
--   password_hash VARCHAR(255) NOT NULL,
--   role VARCHAR(20) DEFAULT 'user' CHECK(role IN ('user', 'admin', 'super_admin')),
--   approval_status VARCHAR(20) DEFAULT 'pending',
--   referral_code VARCHAR(10) UNIQUE,
--   created_at TIMESTAMPTZ DEFAULT NOW(),
--   updated_at TIMESTAMPTZ DEFAULT NOW()
-- );

-- ==================== diaries 테이블 ====================
-- TODO: diary.db에서 마이그레이션 예정

-- ==================== events 테이블 (calendar) ====================
-- TODO: calendar.db에서 마이그레이션 예정
