-- 운명나침반 아카데미 시스템 데이터베이스 스키마
-- 사주학 교육 플랫폼을 위한 포괄적 데이터 모델

-- 강사 정보 테이블
CREATE TABLE IF NOT EXISTS instructors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    avatar TEXT,
    bio TEXT NOT NULL,
    expertise TEXT NOT NULL, -- JSON 배열로 저장
    rating REAL DEFAULT 0.0,
    total_students INTEGER DEFAULT 0,
    total_courses INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    social_links TEXT, -- JSON 객체로 저장
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 강좌 테이블
CREATE TABLE IF NOT EXISTS courses (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT,
    description TEXT NOT NULL,
    thumbnail TEXT,
    trailer TEXT,
    level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced', 'expert')) NOT NULL,
    category TEXT CHECK (category IN ('basic', 'fortune', 'compatibility', 'professional', 'special')) NOT NULL,
    status TEXT CHECK (status IN ('draft', 'published', 'archived', 'coming_soon')) DEFAULT 'draft',
    instructor_id TEXT NOT NULL,
    
    -- 가격 정보
    price REAL NOT NULL DEFAULT 0,
    original_price REAL,
    discount_percentage INTEGER DEFAULT 0,
    is_free BOOLEAN DEFAULT FALSE,
    is_subscription_only BOOLEAN DEFAULT FALSE,
    
    -- 통계 정보
    rating REAL DEFAULT 0.0,
    review_count INTEGER DEFAULT 0,
    enrollment_count INTEGER DEFAULT 0,
    total_duration INTEGER DEFAULT 0, -- 분 단위
    total_lessons INTEGER DEFAULT 0,
    
    -- 메타데이터 (JSON 배열로 저장)
    tags TEXT, -- JSON 배열
    prerequisites TEXT, -- JSON 배열
    learning_objectives TEXT, -- JSON 배열
    target_audience TEXT, -- JSON 배열
    
    -- 날짜
    published_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    
    FOREIGN KEY (instructor_id) REFERENCES instructors(id)
);

-- 모듈 (챕터) 테이블
CREATE TABLE IF NOT EXISTS modules (
    id TEXT PRIMARY KEY,
    course_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    total_duration INTEGER DEFAULT 0, -- 분 단위
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- 리소스 (첨부파일) 테이블
CREATE TABLE IF NOT EXISTS resources (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('pdf', 'image', 'video', 'audio', 'document')) NOT NULL,
    url TEXT NOT NULL,
    size INTEGER NOT NULL, -- 바이트 단위
    downloadable BOOLEAN DEFAULT TRUE,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 퀴즈 테이블
CREATE TABLE IF NOT EXISTS quizzes (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    time_limit INTEGER, -- 분 단위
    passing_score INTEGER NOT NULL DEFAULT 70, -- 백분율
    max_attempts INTEGER DEFAULT 3,
    randomize_questions BOOLEAN DEFAULT FALSE,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 퀴즈 문제 테이블
CREATE TABLE IF NOT EXISTS quiz_questions (
    id TEXT PRIMARY KEY,
    quiz_id TEXT NOT NULL,
    question TEXT NOT NULL,
    type TEXT CHECK (type IN ('multiple_choice', 'true_false', 'short_answer', 'essay')) NOT NULL,
    options TEXT, -- JSON 배열 (객관식용)
    correct_answer TEXT, -- JSON 문자열 또는 배열
    explanation TEXT,
    points INTEGER DEFAULT 1,
    order_index INTEGER NOT NULL,
    
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

-- 강의 (레슨) 테이블
CREATE TABLE IF NOT EXISTS lessons (
    id TEXT PRIMARY KEY,
    module_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT CHECK (type IN ('video', 'text', 'practice', 'live', 'quiz', 'assignment')) NOT NULL,
    order_index INTEGER NOT NULL,
    duration INTEGER DEFAULT 0, -- 분 단위
    content TEXT, -- 텍스트 컨텐츠
    video_url TEXT,
    quiz_id TEXT,
    is_preview BOOLEAN DEFAULT FALSE,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
);

-- 레슨-리소스 연결 테이블
CREATE TABLE IF NOT EXISTS lesson_resources (
    lesson_id TEXT NOT NULL,
    resource_id TEXT NOT NULL,
    PRIMARY KEY (lesson_id, resource_id),
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE
);

-- 수강 등록 테이블
CREATE TABLE IF NOT EXISTS enrollments (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    course_id TEXT NOT NULL,
    status TEXT CHECK (status IN ('active', 'completed', 'paused', 'cancelled', 'expired')) DEFAULT 'active',
    progress REAL DEFAULT 0.0, -- 0-100 완료율
    current_module_id TEXT,
    current_lesson_id TEXT,
    
    -- 시간 추적
    total_watch_time INTEGER DEFAULT 0, -- 분 단위
    last_accessed_at TEXT,
    enrolled_at TEXT NOT NULL DEFAULT (datetime('now')),
    completed_at TEXT,
    expires_at TEXT,
    
    -- 점수 및 평가
    quiz_scores TEXT, -- JSON 객체 {quizId: score}
    overall_score REAL,
    
    -- 결제 정보
    payment_id TEXT,
    amount_paid REAL DEFAULT 0,
    
    UNIQUE(user_id, course_id),
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (current_module_id) REFERENCES modules(id),
    FOREIGN KEY (current_lesson_id) REFERENCES lessons(id)
);

-- 수료증 테이블
CREATE TABLE IF NOT EXISTS certificates (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    course_id TEXT NOT NULL,
    enrollment_id TEXT NOT NULL UNIQUE,
    student_name TEXT NOT NULL,
    course_name TEXT NOT NULL,
    instructor_name TEXT NOT NULL,
    completed_at TEXT NOT NULL,
    score REAL,
    certificate_number TEXT UNIQUE NOT NULL,
    verification_url TEXT NOT NULL,
    is_valid BOOLEAN DEFAULT TRUE,
    template_id TEXT DEFAULT 'default',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    
    FOREIGN KEY (enrollment_id) REFERENCES enrollments(id),
    FOREIGN KEY (course_id) REFERENCES courses(id)
);

-- 진도 추적 테이블
CREATE TABLE IF NOT EXISTS progress_tracking (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    course_id TEXT NOT NULL,
    module_id TEXT,
    lesson_id TEXT,
    type TEXT CHECK (type IN ('lesson_completed', 'quiz_completed', 'module_completed', 'course_completed')) NOT NULL,
    completed_at TEXT NOT NULL DEFAULT (datetime('now')),
    score REAL,
    time_spent INTEGER DEFAULT 0, -- 분 단위
    
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (module_id) REFERENCES modules(id),
    FOREIGN KEY (lesson_id) REFERENCES lessons(id)
);

-- 리뷰 & 평가 테이블
CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    course_id TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    title TEXT,
    comment TEXT,
    is_verified BOOLEAN DEFAULT FALSE, -- 수료 후 작성 여부
    helpful_count INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    
    UNIQUE(user_id, course_id),
    FOREIGN KEY (course_id) REFERENCES courses(id)
);

-- 질문 & 답변 테이블
CREATE TABLE IF NOT EXISTS questions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    course_id TEXT NOT NULL,
    lesson_id TEXT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_answered BOOLEAN DEFAULT FALSE,
    is_pinned BOOLEAN DEFAULT FALSE,
    upvotes INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (lesson_id) REFERENCES lessons(id)
);

-- 답변 테이블
CREATE TABLE IF NOT EXISTS answers (
    id TEXT PRIMARY KEY,
    question_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    content TEXT NOT NULL,
    is_instructor_answer BOOLEAN DEFAULT FALSE,
    is_accepted BOOLEAN DEFAULT FALSE,
    upvotes INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- 알림 테이블
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT CHECK (type IN ('enrollment', 'completion', 'certificate', 'new_content', 'announcement')) NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data TEXT, -- JSON 추가 데이터
    is_read BOOLEAN DEFAULT FALSE,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_courses_instructor ON courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);
CREATE INDEX IF NOT EXISTS idx_courses_level ON courses(level);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX IF NOT EXISTS idx_modules_course ON modules(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_module ON lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON enrollments(status);
CREATE INDEX IF NOT EXISTS idx_progress_user_course ON progress_tracking(user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_reviews_course ON reviews(course_id);
CREATE INDEX IF NOT EXISTS idx_questions_course ON questions(course_id);
CREATE INDEX IF NOT EXISTS idx_answers_question ON answers(question_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_user ON certificates(user_id);

-- 트리거 생성 (updated_at 자동 업데이트)
CREATE TRIGGER IF NOT EXISTS update_instructors_updated_at
    AFTER UPDATE ON instructors
    BEGIN
        UPDATE instructors SET updated_at = datetime('now') WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_courses_updated_at
    AFTER UPDATE ON courses
    BEGIN
        UPDATE courses SET updated_at = datetime('now') WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_modules_updated_at
    AFTER UPDATE ON modules
    BEGIN
        UPDATE modules SET updated_at = datetime('now') WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_lessons_updated_at
    AFTER UPDATE ON lessons
    BEGIN
        UPDATE lessons SET updated_at = datetime('now') WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_quizzes_updated_at
    AFTER UPDATE ON quizzes
    BEGIN
        UPDATE quizzes SET updated_at = datetime('now') WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_reviews_updated_at
    AFTER UPDATE ON reviews
    BEGIN
        UPDATE reviews SET updated_at = datetime('now') WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_questions_updated_at
    AFTER UPDATE ON questions
    BEGIN
        UPDATE questions SET updated_at = datetime('now') WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_answers_updated_at
    AFTER UPDATE ON answers
    BEGIN
        UPDATE answers SET updated_at = datetime('now') WHERE id = NEW.id;
    END;