"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const sqlite3_1 = __importDefault(require("sqlite3"));
const path_1 = __importDefault(require("path"));
const SajuCalculator_1 = require("./services/SajuCalculator");
const AptitudeAnalyzer_1 = require("./services/AptitudeAnalyzer");
const SajuScoreEngine_1 = require("./services/SajuScoreEngine");
const EnhancedSajuScoreEngine_1 = require("./services/EnhancedSajuScoreEngine");
const LifetimeFortuneCalculator_1 = require("./services/LifetimeFortuneCalculator");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4015;
// 미들웨어 설정
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// SQLite 데이터베이스 연결
const dbPath = path_1.default.join(__dirname, '../../data/saju.db');
const db = new sqlite3_1.default.Database(dbPath);
console.log('🚀 운명나침반 사주 분석 서비스 초기화 중...');
// 데이터베이스 초기화
function initializeDatabase() {
    console.log('📊 사주 분석 데이터베이스 초기화 시작...');
    // 먼저 테이블이 존재하는지 확인
    db.get("SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name='minor_categories'", (err, row) => {
        if (err || !row || row.count === 0) {
            // 테이블이 없으면 전체 초기화
            console.log('   🔨 테이블 생성 및 초기 데이터 설정...');
            createTablesAndInitData();
        }
        else {
            // 테이블이 있으면 데이터 확인
            db.get("SELECT COUNT(*) as count FROM minor_categories", (err, row) => {
                if (err || !row || row.count === 0) {
                    console.log('   📝 빈 테이블에 데이터 추가...');
                    insertInitialData();
                }
                else {
                    console.log(`   ✅ 데이터베이스 이미 초기화됨 (${row.count}개 항목)`);
                }
            });
        }
    });
}
// 테이블 생성 및 초기 데이터 설정
function createTablesAndInitData() {
    // 모든 작업을 순차적으로 실행
    db.serialize(() => {
        // 1. 대분류 테이블 (주능/주흉)
        db.run(`
      CREATE TABLE IF NOT EXISTS major_categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        description TEXT,
        type TEXT CHECK(type IN ('positive', 'negative')) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
        // 2. 중분류 테이블 (게임, 연예, 교통사고 등)
        db.run(`
      CREATE TABLE IF NOT EXISTS middle_categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        major_id INTEGER,
        name TEXT NOT NULL,
        description TEXT,
        icon TEXT DEFAULT '⭐',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (major_id) REFERENCES major_categories (id)
      )
    `);
        // 3. 소분류 테이블 (개별 직업, 종목, 사고 등)
        db.run(`
      CREATE TABLE IF NOT EXISTS minor_categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        middle_id INTEGER,
        name TEXT NOT NULL,
        description TEXT,
        saju_weight REAL DEFAULT 1.0,
        confidence_factor REAL DEFAULT 1.0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (middle_id) REFERENCES middle_categories (id)
      )
    `);
        // 4. 사용자 사주 분석 결과 저장
        db.run(`
      CREATE TABLE IF NOT EXISTS user_saju_analysis (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        birth_date TEXT NOT NULL,
        birth_time TEXT NOT NULL,
        is_lunar BOOLEAN DEFAULT FALSE,
        gender TEXT CHECK(gender IN ('M', 'F')),
        saju_data TEXT, -- JSON: 천간지지 정보
        positive_aptitudes TEXT, -- JSON: 주능 결과
        negative_warnings TEXT, -- JSON: 주흉 결과
        confidence_score REAL,
        analysis_summary TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
        console.log('✅ 사주 분석 데이터베이스 테이블 생성 완료');
        // 5. 대분류 데이터 삽입
        db.run(`INSERT OR IGNORE INTO major_categories (name, description, type) VALUES (?, ?, ?)`, ['주능', '긍정적 적성 및 재능 분야', 'positive']);
        db.run(`INSERT OR IGNORE INTO major_categories (name, description, type) VALUES (?, ?, ?)`, ['주흉', '주의가 필요한 분야 및 위험 요소', 'negative']);
        console.log('✅ 대분류 데이터 삽입 완료');
        // 6. 중분류 데이터 삽입 (순차 처리)
        insertMiddleCategories();
    });
}
// 초기 데이터만 삽입 (테이블은 이미 존재)
function insertInitialData() {
    db.serialize(() => {
        // 대분류 데이터 삽입
        db.run(`INSERT OR IGNORE INTO major_categories (name, description, type) VALUES (?, ?, ?)`, ['주능', '긍정적 적성 및 재능 분야', 'positive']);
        db.run(`INSERT OR IGNORE INTO major_categories (name, description, type) VALUES (?, ?, ?)`, ['주흉', '주의가 필요한 분야 및 위험 요소', 'negative']);
        insertMiddleCategories();
    });
}
// 중분류 데이터 삽입
function insertMiddleCategories() {
    console.log('📋 중분류 데이터 삽입 시작...');
    // 주능 중분류 삽입
    const positiveCategories = [
        { name: '게임', icon: '🎮', desc: '게임 관련 분야' },
        { name: '과목', icon: '📚', desc: '학습 과목 분야' },
        { name: '무용', icon: '💃', desc: '무용 및 춤 분야' },
        { name: '문학', icon: '✍️', desc: '문학 및 글쓰기 분야' },
        { name: '미술', icon: '🎨', desc: '미술 및 예술 분야' },
        { name: '연예', icon: '🎭', desc: '연예 및 엔터테인먼트 분야' },
        { name: '음악', icon: '🎵', desc: '음악 관련 분야' },
        { name: '전공', icon: '🎓', desc: '대학 전공 계열' },
        { name: '체능', icon: '⚽', desc: '체육 및 스포츠 분야' }
    ];
    positiveCategories.forEach(category => {
        db.run(`
      INSERT OR IGNORE INTO middle_categories (major_id, name, description, icon)
      SELECT id, ?, ?, ? FROM major_categories WHERE name = '주능'
    `, [category.name, category.desc, category.icon]);
    });
    // 주흉 중분류 삽입
    const negativeCategories = [
        { name: '교통사고', icon: '🚗', desc: '교통사고 관련 위험' },
        { name: '사건', icon: '⚖️', desc: '법적 사건 관련 위험' },
        { name: '사고', icon: '⚠️', desc: '일반적인 사고 위험' },
        { name: '사고도로', icon: '🛣️', desc: '도로별 사고 위험' }
    ];
    negativeCategories.forEach(category => {
        db.run(`
      INSERT OR IGNORE INTO middle_categories (major_id, name, description, icon)
      SELECT id, ?, ?, ? FROM major_categories WHERE name = '주흉'
    `, [category.name, category.desc, category.icon]);
    });
    console.log('✅ 중분류 데이터 삽입 완료');
    // 소분류 데이터 삽입 시작
    insertDetailedCategories();
}
// 상세 카테고리 데이터 삽입
function insertDetailedCategories() {
    console.log('📝 상세 카테고리 데이터 삽입 중...');
    // 게임 분야
    const gameItems = ['FPS게임', '롤플레잉게임', '슈팅게임', '스포츠게임', '시뮬레이션게임', '액션게임', '어드벤쳐게임'];
    gameItems.forEach(item => {
        db.run(`
      INSERT OR IGNORE INTO minor_categories (middle_id, name, saju_weight)
      SELECT id, ?, 1.2 FROM middle_categories WHERE name = '게임'
    `, [item]);
    });
    // 과목 분야
    const subjectItems = ['기술', '미술', '음악', '과학', '국어', '도덕', '사회', '수학', '영어', '체육', '한국사', '한문'];
    subjectItems.forEach(item => {
        db.run(`
      INSERT OR IGNORE INTO minor_categories (middle_id, name, saju_weight)
      SELECT id, ?, 1.5 FROM middle_categories WHERE name = '과목'
    `, [item]);
    });
    // 무용 분야
    const danceItems = ['대중무용', '민속무용', '발레', '비보이', '스포츠댄스', '전통무용', '현대무용'];
    danceItems.forEach(item => {
        db.run(`
      INSERT OR IGNORE INTO minor_categories (middle_id, name, saju_weight)
      SELECT id, ?, 1.3 FROM middle_categories WHERE name = '무용'
    `, [item]);
    });
    // 문학 분야
    const literatureItems = ['라디오작가', '만화작가', '방송작가', '소설가', '시나리오작가', '시인', '애니메이션작가', '연극작가', '작사가'];
    literatureItems.forEach(item => {
        db.run(`
      INSERT OR IGNORE INTO minor_categories (middle_id, name, saju_weight)
      SELECT id, ?, 1.4 FROM middle_categories WHERE name = '문학'
    `, [item]);
    });
    // 미술 분야
    const artItems = ['디자인', '공예', '동양화', '디지털미디어', '무대장치', '사진', '산업디자인', '서양화', '시각디자인', '영상', '의상디자인', '인테리어', '조소', '판화'];
    artItems.forEach(item => {
        db.run(`
      INSERT OR IGNORE INTO minor_categories (middle_id, name, saju_weight)
      SELECT id, ?, 1.3 FROM middle_categories WHERE name = '미술'
    `, [item]);
    });
    // 연예 분야
    const entertainmentItems = ['가수', 'MC', '개그맨', '드라마배우', '뮤지컬배우', '스턴트맨', '엑스트라', '연극배우', '연기자', '영화배우'];
    entertainmentItems.forEach(item => {
        db.run(`
      INSERT OR IGNORE INTO minor_categories (middle_id, name, saju_weight)
      SELECT id, ?, 1.1 FROM middle_categories WHERE name = '연예'
    `, [item]);
    });
    // 음악 분야
    const musicItems = ['건반악기', '관악기', '대중음악', '보컬', '성악', '작곡', '타악기', '현악기'];
    musicItems.forEach(item => {
        db.run(`
      INSERT OR IGNORE INTO minor_categories (middle_id, name, saju_weight)
      SELECT id, ?, 1.4 FROM middle_categories WHERE name = '음악'
    `, [item]);
    });
    // 전공 분야
    const majorItems = ['공학계', '농생명과학계', '법정계', '사범계', '사회과학계', '생활과학계', '어문인문학계', '예체능계', '의치악계', '자연과학계'];
    majorItems.forEach(item => {
        db.run(`
      INSERT OR IGNORE INTO minor_categories (middle_id, name, saju_weight)
      SELECT id, ?, 1.6 FROM middle_categories WHERE name = '전공'
    `, [item]);
    });
    // 체능 분야
    const sportsItems = ['게임', '골프', '낚시', '농구', '다이빙', '당구', '등반', '라켓볼', '럭비', '마라톤', '모터사이클', '배구', '배드민턴', '보디빌딩', '볼링', '사격', '사이클', '소프트볼', '수상스키', '수영', '스노보드', '스케이트', '스쿼시', '스키', '야구', '요트', '윈드서핑', '육상', '정구', '조정', '체조', '축구', '탁구', '테니스', '하키', '핸드볼', '헬스'];
    sportsItems.forEach(item => {
        db.run(`
      INSERT OR IGNORE INTO minor_categories (middle_id, name, saju_weight)
      SELECT id, ?, 1.2 FROM middle_categories WHERE name = '체능'
    `, [item]);
    });
    // 주흉 - 교통사고
    const trafficItems = ['과속사고', '끼여들기', '돌발사고', '신호위반', '음주사고', '인명사고', '접촉사고', '정비불량', '졸음운전', '충돌사고', '측면사고', '후미사고'];
    trafficItems.forEach(item => {
        db.run(`
      INSERT OR IGNORE INTO minor_categories (middle_id, name, saju_weight)
      SELECT id, ?, 0.8 FROM middle_categories WHERE name = '교통사고'
    `, [item]);
    });
    // 주흉 - 사건
    const incidentItems = ['소송', '도난', '사기', '폭행', '내부거래', '뇌물', '도용', '명예훼손', '배임', '성추행', '성폭행', '알선수재', '위조', '탈세', '해킹', '횡령'];
    incidentItems.forEach(item => {
        db.run(`
      INSERT OR IGNORE INTO minor_categories (middle_id, name, saju_weight)
      SELECT id, ?, 0.9 FROM middle_categories WHERE name = '사건'
    `, [item]);
    });
    // 주흉 - 사고
    const accidentItems = ['언쟁', '분쟁', '분실', '단속', '망신', '위반', '위험', '손실', '파업'];
    accidentItems.forEach(item => {
        db.run(`
      INSERT OR IGNORE INTO minor_categories (middle_id, name, saju_weight)
      SELECT id, ?, 0.7 FROM middle_categories WHERE name = '사고'
    `, [item]);
    });
    // 주흉 - 사고도로
    const roadItems = ['건널목', '고가도로', '고속도로', '골목', '보호구역', '비보호', '사거리', '사차선', '이차선', '전용도로', '주차장'];
    roadItems.forEach(item => {
        db.run(`
      INSERT OR IGNORE INTO minor_categories (middle_id, name, saju_weight)
      SELECT id, ?, 0.6 FROM middle_categories WHERE name = '사고도로'
    `, [item]);
    });
    console.log('✅ 모든 카테고리 데이터 삽입 완료 (150+ 항목)');
}
// API 라우트들
// 전체 카테고리 조회
app.get('/api/saju/categories', (req, res) => {
    const query = `
    SELECT 
      mc.name as major_category,
      mc.type,
      mid.name as middle_category,
      mid.icon,
      min.name as minor_category,
      min.saju_weight,
      min.confidence_factor
    FROM major_categories mc
    JOIN middle_categories mid ON mc.id = mid.major_id
    JOIN minor_categories min ON mid.id = min.middle_id
    ORDER BY mc.type, mid.name, min.name
  `;
    db.all(query, (err, rows) => {
        if (err) {
            console.error('카테고리 조회 오류:', err);
            return res.status(500).json({ success: false, error: err.message });
        }
        // 데이터 구조화
        const result = {
            positive: {},
            negative: {}
        };
        rows.forEach(row => {
            const type = row.type === 'positive' ? 'positive' : 'negative';
            if (!result[type][row.middle_category]) {
                result[type][row.middle_category] = {
                    icon: row.icon,
                    items: []
                };
            }
            result[type][row.middle_category].items.push({
                name: row.minor_category,
                weight: row.saju_weight,
                confidence: row.confidence_factor
            });
        });
        res.json({ success: true, data: result });
    });
});
// 사주 분석 실행
app.post('/api/saju/analyze', async (req, res) => {
    const { user_id, birth_date, birth_time, is_lunar = false, gender = 'M' } = req.body;
    if (!user_id || !birth_date || !birth_time) {
        return res.status(400).json({
            success: false,
            error: '필수 정보가 누락되었습니다. (user_id, birth_date, birth_time)'
        });
    }
    try {
        console.log(`🔍 사주 분석 시작: ${user_id} (${birth_date} ${birth_time})`);
        // 사주 계산
        const calculator = new SajuCalculator_1.SajuCalculator();
        const sajuData = await calculator.calculateSaju(birth_date, birth_time, is_lunar);
        // 적성 분석
        const analyzer = new AptitudeAnalyzer_1.AptitudeAnalyzer(db);
        const analysisResult = await analyzer.analyzeAptitude(sajuData);
        // 결과 저장
        db.run(`
      INSERT OR REPLACE INTO user_saju_analysis 
      (user_id, birth_date, birth_time, is_lunar, gender, saju_data, positive_aptitudes, negative_warnings, confidence_score, analysis_summary, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `, [
            user_id,
            birth_date,
            birth_time,
            is_lunar,
            gender,
            JSON.stringify(sajuData),
            JSON.stringify(analysisResult.positive),
            JSON.stringify(analysisResult.negative),
            analysisResult.confidence,
            analysisResult.summary
        ], function (err) {
            if (err) {
                console.error('분석 결과 저장 오류:', err);
                return res.status(500).json({ success: false, error: err.message });
            }
            console.log(`✅ 사주 분석 완료: ${user_id}`);
            res.json({
                success: true,
                data: {
                    id: this.lastID,
                    saju_data: sajuData,
                    analysis_result: analysisResult
                }
            });
        });
    }
    catch (error) {
        console.error('사주 분석 오류:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});
// 저장된 분석 결과 조회
app.get('/api/saju/analysis/:userId', (req, res) => {
    const { userId } = req.params;
    db.get(`
    SELECT * FROM user_saju_analysis 
    WHERE user_id = ? 
    ORDER BY updated_at DESC 
    LIMIT 1
  `, [userId], (err, row) => {
        if (err) {
            console.error('분석 결과 조회 오류:', err);
            return res.status(500).json({ success: false, error: err.message });
        }
        if (!row) {
            return res.status(404).json({
                success: false,
                error: '저장된 분석 결과를 찾을 수 없습니다'
            });
        }
        // JSON 파싱
        const result = {
            ...row,
            saju_data: JSON.parse(row.saju_data || '{}'),
            positive_aptitudes: JSON.parse(row.positive_aptitudes || '{}'),
            negative_warnings: JSON.parse(row.negative_warnings || '{}')
        };
        res.json({ success: true, data: result });
    });
});
// ===== 시점별 사주분석 API =====
// 현재 시점 천간지지 조회
app.get('/api/saju/temporal/current-pillars', (req, res) => {
    const { date } = req.query;
    try {
        console.log(`🗓️ 현재 시점 천간지지 조회 요청: ${date || 'today'}`);
        const calculator = new SajuCalculator_1.SajuCalculator();
        const targetDate = date ? new Date(date) : undefined;
        const currentPillars = calculator.calculateCurrentTimePillars(targetDate);
        console.log(`✅ 천간지지 계산 완료:`, currentPillars);
        res.json({
            success: true,
            data: currentPillars
        });
    }
    catch (error) {
        console.error('현재 시점 천간지지 계산 오류:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
// 종합 시점별 사주분석
app.post('/api/saju/temporal/analyze', async (req, res) => {
    const { birth_date, birth_time, is_lunar = false, target_date } = req.body;
    if (!birth_date || !birth_time) {
        return res.status(400).json({
            success: false,
            error: '생년월일과 출생시간이 필요합니다. (birth_date, birth_time)'
        });
    }
    try {
        console.log(`🔮 시점별 사주분석 시작: ${birth_date} ${birth_time} (${is_lunar ? '음력' : '양력'})`);
        console.log(`   분석 대상 날짜: ${target_date || '오늘'}`);
        const calculator = new SajuCalculator_1.SajuCalculator();
        const targetDateObj = target_date ? new Date(target_date) : undefined;
        // 종합 시점별 분석 실행
        const temporalAnalysis = await calculator.analyzeTemporalSaju(birth_date, birth_time, is_lunar, targetDateObj);
        console.log(`✅ 시점별 사주분석 완료`);
        console.log(`   연운: ${temporalAnalysis.fortune_trends.current_year_fortune}`);
        console.log(`   월운: ${temporalAnalysis.fortune_trends.current_month_fortune}`);
        console.log(`   일운: ${temporalAnalysis.fortune_trends.current_day_fortune}`);
        console.log(`   전체 트렌드: ${temporalAnalysis.fortune_trends.overall_trend}`);
        res.json({
            success: true,
            data: temporalAnalysis
        });
    }
    catch (error) {
        console.error('시점별 사주분석 오류:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
// 간단한 현재 운세 조회
app.post('/api/saju/temporal/fortune', async (req, res) => {
    const { birth_date, birth_time, is_lunar = false, target_date } = req.body;
    if (!birth_date || !birth_time) {
        return res.status(400).json({
            success: false,
            error: '생년월일과 출생시간이 필요합니다.'
        });
    }
    try {
        console.log(`💫 현재 운세 조회: ${birth_date} ${birth_time}`);
        const calculator = new SajuCalculator_1.SajuCalculator();
        const targetDateObj = target_date ? new Date(target_date) : undefined;
        const temporalAnalysis = await calculator.analyzeTemporalSaju(birth_date, birth_time, is_lunar, targetDateObj);
        // 운세 정보만 추출
        const fortuneData = {
            current_date: temporalAnalysis.current_pillars.current_date,
            analysis_timestamp: temporalAnalysis.current_pillars.analysis_timestamp,
            fortune_trends: temporalAnalysis.fortune_trends,
            temporal_interactions: temporalAnalysis.temporal_interactions,
            current_pillars: {
                year: `${temporalAnalysis.current_pillars.current_year.heavenly}${temporalAnalysis.current_pillars.current_year.earthly}`,
                month: `${temporalAnalysis.current_pillars.current_month.heavenly}${temporalAnalysis.current_pillars.current_month.earthly}`,
                day: `${temporalAnalysis.current_pillars.current_day.heavenly}${temporalAnalysis.current_pillars.current_day.earthly}`
            }
        };
        console.log(`✅ 운세 조회 완료: 전체 트렌드 ${temporalAnalysis.fortune_trends.overall_trend}`);
        res.json({
            success: true,
            data: fortuneData
        });
    }
    catch (error) {
        console.error('현재 운세 조회 오류:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
// 🎯 통합 점수 조회 API (신규)
app.post('/api/saju/scores/comprehensive', async (req, res) => {
    const { user_id, birth_date, birth_time, is_lunar = false, time_scope = 'all' } = req.body;
    if (!user_id || !birth_date || !birth_time) {
        return res.status(400).json({
            success: false,
            error: '필수 정보가 누락되었습니다. (user_id, birth_date, birth_time)'
        });
    }
    try {
        console.log(`🎯 통합 점수 계산: ${user_id} - ${birth_date} ${birth_time}`);
        const calculator = new SajuCalculator_1.SajuCalculator();
        const scoreEngine = new SajuScoreEngine_1.SajuScoreEngine();
        // 사주 계산
        const userSaju = await calculator.calculateSaju(birth_date, birth_time, is_lunar);
        // 현재 시점 기둥 계산
        const currentPillars = await calculator.getCurrentTimePillars();
        // 종합 점수 계산
        const comprehensiveScores = await scoreEngine.calculateComprehensiveScores(userSaju, currentPillars, null, // categories는 DB에서 직접 로드
        db);
        // 점수 저장
        await saveScoresToDatabase(user_id, comprehensiveScores, db);
        // 응답 형식 변환
        const response = {
            success: true,
            data: {
                positive_scores: Object.fromEntries(comprehensiveScores.positive_scores),
                negative_scores: Object.fromEntries(comprehensiveScores.negative_scores),
                summary: comprehensiveScores.summary
            },
            timestamp: comprehensiveScores.timestamp,
            time_scope
        };
        res.json(response);
        console.log(`✅ 통합 점수 계산 완료 - 주능: ${comprehensiveScores.positive_scores.size}개, 주흉: ${comprehensiveScores.negative_scores.size}개`);
    }
    catch (error) {
        console.error('통합 점수 계산 오류:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
// 🌟 향상된 사주 기반 점수 계산 API (신규)
app.post('/api/saju/scores/enhanced', async (req, res) => {
    const { user_id, birth_date, birth_time, is_lunar = false, categories = 'all' } = req.body;
    if (!user_id || !birth_date || !birth_time) {
        return res.status(400).json({
            success: false,
            error: '필수 정보가 누락되었습니다. (user_id, birth_date, birth_time)'
        });
    }
    try {
        console.log(`🌟 향상된 사주 점수 계산: ${user_id} - ${birth_date} ${birth_time}`);
        const calculator = new SajuCalculator_1.SajuCalculator();
        const enhancedEngine = new EnhancedSajuScoreEngine_1.EnhancedSajuScoreEngine();
        // 사주 계산
        const userSaju = await calculator.calculateSaju(birth_date, birth_time, is_lunar);
        console.log(`📊 사주 계산 완료: 일주 ${userSaju.day_pillar.heavenly}${userSaju.day_pillar.earthly}`);
        // 현재 시점 기둥 계산
        const currentPillars = await calculator.getCurrentTimePillars();
        // 카테고리 데이터 로드
        const positiveCategories = await loadCategoriesFromDB(db, 'positive');
        const negativeCategories = await loadCategoriesFromDB(db, 'negative');
        const enhancedScores = {
            user_id,
            timestamp: new Date().toISOString(),
            positive_scores: new Map(),
            negative_scores: new Map(),
            saju_analysis: {
                day_master: `${userSaju.day_pillar.heavenly}${userSaju.day_pillar.earthly}`,
                dominant_element: getDominantElement(userSaju.five_elements),
                strength_level: userSaju.strength.day_master_strength > 6 ? 'strong' : 'weak',
                ten_gods: userSaju.ten_gods,
                season: userSaju.birth_info.season
            }
        };
        // 주능 점수 계산
        for (const [categoryName, items] of Object.entries(positiveCategories)) {
            const detailedScore = enhancedEngine.calculateEnhancedCategoryScore(userSaju, currentPillars, categoryName, items, 'positive');
            enhancedScores.positive_scores.set(categoryName, detailedScore);
        }
        // 주흉 점수 계산
        for (const [categoryName, items] of Object.entries(negativeCategories)) {
            const detailedScore = enhancedEngine.calculateEnhancedCategoryScore(userSaju, currentPillars, categoryName, items, 'negative');
            enhancedScores.negative_scores.set(categoryName, detailedScore);
        }
        // 상위 추천 생성
        const topPositive = Array.from(enhancedScores.positive_scores.entries())
            .sort((a, b) => b[1].base_score - a[1].base_score)
            .slice(0, 3);
        const topNegative = Array.from(enhancedScores.negative_scores.entries())
            .filter(([_, score]) => score.base_score > 60)
            .sort((a, b) => b[1].base_score - a[1].base_score)
            .slice(0, 3);
        const response = {
            success: true,
            data: {
                positive_scores: Object.fromEntries(enhancedScores.positive_scores),
                negative_scores: Object.fromEntries(enhancedScores.negative_scores),
                saju_analysis: enhancedScores.saju_analysis,
                recommendations: {
                    top_aptitudes: topPositive.map(([name, score]) => {
                        var _a;
                        return ({
                            category: name,
                            score: score.base_score,
                            confidence: score.confidence_level,
                            reason: ((_a = score.items[0]) === null || _a === void 0 ? void 0 : _a.affinity_reason) || '기본 적성'
                        });
                    }),
                    caution_areas: topNegative.map(([name, score]) => ({
                        category: name,
                        risk_level: score.base_score,
                        confidence: score.confidence_level
                    }))
                }
            },
            timestamp: enhancedScores.timestamp,
            version: 'enhanced_v1.0'
        };
        res.json(response);
        console.log(`✅ 향상된 점수 계산 완료`);
        console.log(`   주능 최고: ${topPositive[0] ? `${topPositive[0][0]}(${topPositive[0][1].base_score}점)` : '없음'}`);
        console.log(`   주흉 위험: ${topNegative[0] ? `${topNegative[0][0]}(${topNegative[0][1].base_score}점)` : '없음'}`);
    }
    catch (error) {
        console.error('향상된 점수 계산 오류:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
// 🔄 실시간 점수 업데이트 API
app.get('/api/saju/scores/realtime/:user_id', async (req, res) => {
    const { user_id } = req.params;
    try {
        console.log(`🔄 실시간 점수 조회: ${user_id}`);
        // 캐시에서 먼저 확인
        const cachedScore = await getCachedScore(user_id, db);
        if (cachedScore) {
            return res.json({
                success: true,
                data: cachedScore,
                from_cache: true
            });
        }
        // 캐시가 없으면 DB에서 조회
        const query = `
      SELECT * FROM saju_scores 
      WHERE user_id = ? 
      ORDER BY calculated_at DESC 
      LIMIT 20
    `;
        db.all(query, [user_id], (err, rows) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    error: err.message
                });
            }
            const currentScores = {
                timestamp: new Date().toISOString(),
                daily_change: calculateChange(rows, 'daily'),
                monthly_change: calculateChange(rows, 'monthly'),
                yearly_change: calculateChange(rows, 'yearly'),
                scores: rows
            };
            // 캐시에 저장
            setCachedScore(user_id, currentScores, db);
            res.json({
                success: true,
                data: currentScores,
                from_cache: false
            });
        });
    }
    catch (error) {
        console.error('실시간 점수 조회 오류:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
// 📊 카테고리별 상세 점수 API
app.get('/api/saju/scores/category/:user_id/:category_name', async (req, res) => {
    const { user_id, category_name } = req.params;
    try {
        console.log(`📊 카테고리별 점수 조회: ${user_id} - ${category_name}`);
        const query = `
      SELECT * FROM saju_scores 
      WHERE user_id = ? AND category_name = ?
      ORDER BY calculated_at DESC 
      LIMIT 1
    `;
        db.get(query, [user_id, category_name], async (err, row) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    error: err.message
                });
            }
            if (!row) {
                return res.status(404).json({
                    success: false,
                    error: '점수 데이터를 찾을 수 없습니다.'
                });
            }
            // 상세 분석 정보 추가
            const breakdown = {
                saju_influence: calculateInfluence(row, 'saju'),
                temporal_influence: calculateInfluence(row, 'temporal'),
                category_fitness: calculateInfluence(row, 'category'),
                total: row.base_score
            };
            res.json({
                success: true,
                data: {
                    category: row.category_name,
                    type: row.category_type,
                    scores: {
                        base: row.base_score,
                        daily: row.daily_score,
                        monthly: row.monthly_score,
                        yearly: row.yearly_score
                    },
                    breakdown,
                    calculated_at: row.calculated_at
                }
            });
        });
    }
    catch (error) {
        console.error('카테고리별 점수 조회 오류:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
// 헬퍼 함수들
async function loadCategoriesFromDB(db, type) {
    return new Promise((resolve, reject) => {
        const query = `
      SELECT 
        mid.name as category_name,
        min.name as item_name,
        min.saju_weight
      FROM major_categories mc
      JOIN middle_categories mid ON mc.id = mid.major_id
      JOIN minor_categories min ON mid.id = min.middle_id
      WHERE mc.type = ?
      ORDER BY mid.name, min.name
    `;
        db.all(query, [type], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            const categories = {};
            for (const row of rows) {
                if (!categories[row.category_name]) {
                    categories[row.category_name] = [];
                }
                categories[row.category_name].push({
                    name: row.item_name,
                    saju_weight: row.saju_weight || 1.0
                });
            }
            resolve(categories);
        });
    });
}
function getDominantElement(elements) {
    let maxElement = 'earth';
    let maxValue = 0;
    for (const [element, value] of Object.entries(elements)) {
        if (value > maxValue) {
            maxValue = value;
            maxElement = element;
        }
    }
    const elementMap = {
        'wood': '목', 'fire': '화', 'earth': '토', 'metal': '금', 'water': '수'
    };
    return elementMap[maxElement] || maxElement;
}
async function saveScoresToDatabase(user_id, scores, db) {
    const insertQuery = `
    INSERT OR REPLACE INTO saju_scores 
    (user_id, category_type, category_name, base_score, daily_score, monthly_score, yearly_score, saju_data)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
    // 주능 점수 저장
    for (const [categoryName, score] of scores.positive_scores) {
        db.run(insertQuery, [
            user_id,
            'positive',
            categoryName,
            score.base_score,
            score.daily_score,
            score.monthly_score,
            score.yearly_score,
            JSON.stringify(score.items)
        ]);
    }
    // 주흉 점수 저장
    for (const [categoryName, score] of scores.negative_scores) {
        db.run(insertQuery, [
            user_id,
            'negative',
            categoryName,
            score.base_score,
            score.daily_score,
            score.monthly_score,
            score.yearly_score,
            JSON.stringify(score.items)
        ]);
    }
}
async function getCachedScore(user_id, db) {
    return new Promise((resolve) => {
        const query = `
      SELECT cache_value FROM score_cache 
      WHERE user_id = ? AND cache_key = 'realtime' 
      AND expires_at > datetime('now')
    `;
        db.get(query, [user_id], (err, row) => {
            if (err || !row) {
                resolve(null);
            }
            else {
                resolve(JSON.parse(row.cache_value));
            }
        });
    });
}
async function setCachedScore(user_id, data, db) {
    const query = `
    INSERT OR REPLACE INTO score_cache 
    (user_id, cache_key, cache_value, expires_at)
    VALUES (?, 'realtime', ?, datetime('now', '+15 minutes'))
  `;
    db.run(query, [user_id, JSON.stringify(data)]);
}
function calculateChange(rows, period) {
    if (rows.length < 2)
        return 0;
    const latest = rows[0][`${period}_score`] || 0;
    const previous = rows[1][`${period}_score`] || 0;
    return latest - previous;
}
function calculateInfluence(row, type) {
    // 간단한 영향도 계산 로직
    switch (type) {
        case 'saju':
            return Math.round(row.base_score * 0.5);
        case 'temporal':
            return Math.round(((row.daily_score + row.monthly_score + row.yearly_score) / 3) * 0.3);
        case 'category':
            return Math.round(row.base_score * 0.2);
        default:
            return 0;
    }
}
// 🌟 강화된 시점별 주능/주흉 분석 (신규 API)
app.post('/api/saju/temporal/enhanced', async (req, res) => {
    const { birth_date, birth_time, is_lunar = false, target_date } = req.body;
    if (!birth_date || !birth_time) {
        return res.status(400).json({
            success: false,
            error: '생년월일과 출생시간이 필요합니다.'
        });
    }
    try {
        console.log(`🌟 강화된 시점별 분석: ${birth_date} ${birth_time}`);
        const calculator = new SajuCalculator_1.SajuCalculator();
        const targetDateObj = target_date ? new Date(target_date) : undefined;
        const enhancedAnalysis = await calculator.analyzeEnhancedTemporalSaju(birth_date, birth_time, is_lunar, targetDateObj, db // 데이터베이스 연결 전달
        );
        res.json({
            success: true,
            data: enhancedAnalysis,
            timestamp: new Date().toISOString(),
            version: '2.0.0' // 강화된 분석 버전
        });
        console.log(`✅ 강화된 분석 완료 - 주능: ${Object.keys(enhancedAnalysis.positive_categories).length}개, 주흉: ${Object.keys(enhancedAnalysis.negative_categories).length}개`);
    }
    catch (error) {
        console.error('강화된 시점별 분석 오류:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
// 서비스 상태 확인
app.get('/health', (req, res) => {
    res.json({
        service: 'saju-analysis-service',
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.1.0' // 시점별 분석 기능 추가로 버전 업
    });
});
// 🎯 100년 인생운세 API
app.post('/api/saju/lifetime-fortune', async (req, res) => {
    const { year, month, day, hour, isLunar = false, gender = 'male' } = req.body;
    try {
        console.log('📊 100년 인생운세 계산 시작');
        console.log(`   생년월일: ${year}년 ${month}월 ${day}일 ${hour}시`);
        console.log(`   음력여부: ${isLunar}, 성별: ${gender}`);
        const calculator = new LifetimeFortuneCalculator_1.LifetimeFortuneCalculator();
        const lifetimeFortune = calculator.calculateLifetimeFortune(year, month, day, hour, isLunar, gender);
        // 주요 전환점 분석
        const keyYears = lifetimeFortune.filter(year => [20, 30, 40, 50, 60, 70].includes(year.age));
        // 최고/최저 운세 년도
        const bestYear = lifetimeFortune.reduce((prev, curr) => prev.totalScore > curr.totalScore ? prev : curr);
        const worstYear = lifetimeFortune.reduce((prev, curr) => prev.totalScore < curr.totalScore ? prev : curr);
        res.json({
            success: true,
            data: {
                lifetimeFortune,
                analysis: {
                    keyYears,
                    bestYear: {
                        year: bestYear.year,
                        age: bestYear.age,
                        score: bestYear.totalScore
                    },
                    worstYear: {
                        year: worstYear.year,
                        age: worstYear.age,
                        score: worstYear.totalScore
                    },
                    averageScore: lifetimeFortune.reduce((sum, y) => sum + y.totalScore, 0) / lifetimeFortune.length
                }
            },
            timestamp: new Date().toISOString()
        });
        console.log('✅ 100년 인생운세 계산 완료');
        console.log(`   최고 운세: ${bestYear.age}세 (${bestYear.totalScore}점)`);
        console.log(`   최저 운세: ${worstYear.age}세 (${worstYear.totalScore}점)`);
    }
    catch (error) {
        console.error('100년 인생운세 계산 오류:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
// 서버 시작
app.listen(PORT, () => {
    console.log('\n============================================================');
    console.log('✅ 운명나침반 사주 분석 서비스 시작됨');
    console.log('============================================================');
    console.log(`🌐 서버 주소: http://localhost:${PORT}`);
    console.log(`📊 상태 확인: http://localhost:${PORT}/health`);
    console.log(`📖 API 문서: http://localhost:${PORT}`);
    console.log(`🔧 환경: ${process.env.NODE_ENV || 'development'}`);
    console.log(`⏰ 시작 시간: ${new Date().toLocaleString('ko-KR')}`);
    console.log('============================================================');
    console.log('');
    console.log('🎯 주요 기능:');
    console.log('  • 전통 사주 계산 엔진 (천간지지, 오행)');
    console.log('  • 150+ 카테고리 기반 적성 분석');
    console.log('  • 주능/주흉 종합 판정 시스템');
    console.log('  • 개인별 맞춤 분석 결과');
    console.log('  • 신뢰도 기반 추천 시스템');
    console.log('');
    console.log('📱 연동 서비스:');
    console.log('  • 프론트엔드 웹앱 (포트 4000)');
    console.log('  • 캘린더 서비스 (포트 4012)');
    console.log('  • 추천인 서비스 (포트 4013)');
    console.log('  • 아카데미 서비스 (포트 4014)');
    console.log('');
    console.log('💡 개발팀 참고사항:');
    console.log('  • 주능: 9개 중항목, 100+ 소항목');
    console.log('  • 주흉: 4개 중항목, 50+ 소항목');
    console.log('  • 사주 기반 가중치 시스템');
    console.log('  • 실시간 분석 및 저장');
    console.log('============================================================');
    initializeDatabase();
});
//# sourceMappingURL=index.js.map