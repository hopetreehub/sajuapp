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
INSERT INTO customers (name, birth_date, birth_time, phone, gender, lunar_solar, memo, saju_data) VALUES
('박준수', '1990-05-15', '14:30:00', '010-1234-5678', 'male', 'solar', '사주 상담 고객',
'{"birthInfo":{"year":1990,"month":5,"day":15,"hour":14,"minute":30,"isLunar":false},"fourPillars":{"year":{"heavenly":"경","earthly":"오"},"month":{"heavenly":"신","earthly":"사"},"day":{"heavenly":"갑","earthly":"자"},"hour":{"heavenly":"신","earthly":"미"}},"sixAreas":{"foundation":75,"thinking":65,"relationship":70,"action":80,"luck":60,"environment":68},"fiveElements":{"wood":20,"fire":25,"earth":15,"metal":30,"water":10},"tenGods":{"bijeon":10,"geopjae":15,"siksin":20,"sanggwan":8,"jeongjae":12,"pyeonjae":18,"jeonggwan":7,"pyeongwan":5,"jeongin":3,"pyeongin":2},"totalScore":418,"averageScore":69.67,"dayMaster":"갑"}'),
('이정미', '1988-11-22', '09:15:00', '010-9876-5432', 'female', 'lunar', '궁합 상담 고객',
'{"birthInfo":{"year":1988,"month":11,"day":22,"hour":9,"minute":15,"isLunar":true},"fourPillars":{"year":{"heavenly":"무","earthly":"진"},"month":{"heavenly":"계","earthly":"해"},"day":{"heavenly":"을","earthly":"사"},"hour":{"heavenly":"신","earthly":"사"}},"sixAreas":{"foundation":68,"thinking":72,"relationship":78,"action":65,"luck":70,"environment":62},"fiveElements":{"wood":18,"fire":22,"earth":20,"metal":25,"water":15},"tenGods":{"bijeon":12,"geopjae":18,"siksin":15,"sanggwan":10,"jeongjae":14,"pyeonjae":16,"jeonggwan":9,"pyeongwan":4,"jeongin":1,"pyeongin":1},"totalScore":400,"averageScore":66.67,"dayMaster":"을"}'),
('최민호', '1985-03-10', '16:45:00', '010-5555-1234', 'male', 'solar', '귀문둔갑 상담',
'{"birthInfo":{"year":1985,"month":3,"day":10,"hour":16,"minute":45,"isLunar":false},"fourPillars":{"year":{"heavenly":"을","earthly":"축"},"month":{"heavenly":"기","earthly":"묘"},"day":{"heavenly":"병","earthly":"신"},"hour":{"heavenly":"병","earthly":"신"}},"sixAreas":{"foundation":82,"thinking":70,"relationship":65,"action":75,"luck":68,"environment":72},"fiveElements":{"wood":22,"fire":28,"earth":12,"metal":28,"water":10},"tenGods":{"bijeon":14,"geopjae":16,"siksin":18,"sanggwan":12,"jeongjae":10,"pyeonjae":20,"jeonggwan":5,"pyeongwan":3,"jeongin":1,"pyeongin":1},"totalScore":432,"averageScore":72.00,"dayMaster":"병"}')
ON CONFLICT DO NOTHING;

-- ==================================================
-- 추가 테이블 (events, diaries, tags)
-- ==================================================

-- ==================== events 테이블 (캘린더 이벤트) ====================
CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(100) DEFAULT 'default-user',
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  all_day BOOLEAN DEFAULT FALSE,
  location VARCHAR(255),
  type VARCHAR(50) DEFAULT 'event',
  color VARCHAR(20) DEFAULT '#3B82F6',
  reminder_minutes INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time);
CREATE INDEX IF NOT EXISTS idx_events_end_time ON events(end_time);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

INSERT INTO events (title, description, start_time, end_time, all_day, location, type, color, reminder_minutes) VALUES
('운명나침반 데모 이벤트', 'Vercel Functions로 구현된 첫 번째 이벤트', '2025-01-01 09:00:00+00', '2025-01-01 10:00:00+00', FALSE, '온라인', 'meeting', '#3B82F6', 15),
('사주 상담', '개인 사주 운세 상담', '2025-01-02 14:00:00+00', '2025-01-02 15:00:00+00', FALSE, '상담실', 'consultation', '#10B981', 30)
ON CONFLICT DO NOTHING;

-- ==================== diaries 테이블 ====================
CREATE TABLE IF NOT EXISTS diaries (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(100) DEFAULT 'default-user',
  date DATE NOT NULL,
  content TEXT NOT NULL,
  mood VARCHAR(10),
  weather VARCHAR(10),
  tags TEXT[],
  images TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_diaries_user_id ON diaries(user_id);
CREATE INDEX IF NOT EXISTS idx_diaries_date ON diaries(date);
CREATE INDEX IF NOT EXISTS idx_diaries_tags ON diaries USING GIN(tags);

CREATE TRIGGER update_diaries_updated_at
  BEFORE UPDATE ON diaries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

INSERT INTO diaries (user_id, date, content, mood, weather, tags) VALUES
('default-user', '2024-12-30', '오늘은 새로운 프로젝트를 시작했다. 기대가 된다.', '😊', '☀️', ARRAY['프로젝트', '시작']),
('default-user', '2024-12-29', '친구들과 즐거운 시간을 보냈다.', '😄', '⛅', ARRAY['친구', '즐거움'])
ON CONFLICT DO NOTHING;

-- ==================== tags 테이블 ====================
CREATE TABLE IF NOT EXISTS tags (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(100) DEFAULT 'default-user',
  name VARCHAR(100) NOT NULL,
  color VARCHAR(20) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

CREATE INDEX IF NOT EXISTS idx_tags_user_id ON tags(user_id);
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);

CREATE TRIGGER update_tags_updated_at
  BEFORE UPDATE ON tags
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

INSERT INTO tags (user_id, name, color) VALUES
('default-user', '업무', '#FF6B6B'),
('default-user', '개인', '#4ECDC4'),
('default-user', '운동', '#45B7D1')
ON CONFLICT DO NOTHING;

-- ==================== event_tags 관계 테이블 ====================
CREATE TABLE IF NOT EXISTS event_tags (
  event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
  tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (event_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_event_tags_event_id ON event_tags(event_id);
CREATE INDEX IF NOT EXISTS idx_event_tags_tag_id ON event_tags(tag_id);
