"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sqlite3_1 = __importDefault(require("sqlite3"));
const path_1 = __importDefault(require("path"));
const dbPath = path_1.default.join(__dirname, '../../../data/saju.db');
const db = new sqlite3_1.default.Database(dbPath);
console.log('🧹 주능 데이터베이스 중복 정리 시작...');
db.serialize(() => {
    console.log('1. 기존 주능 소분류 데이터 삭제 중...');
    // 기존 주능 소분류 데이터 삭제
    db.run(`DELETE FROM minor_categories WHERE middle_id IN (
    SELECT mid.id FROM middle_categories mid 
    JOIN major_categories mc ON mid.major_id = mc.id 
    WHERE mc.type = 'positive'
  )`);
    console.log('2. 정확한 주능 데이터 삽입 중...');
    // 게임 분야 (7개)
    const gameItems = ['FPS게임', '롤플레잉게임', '슈팅게임', '스포츠게임', '시뮬레이션게임', '액션게임', '어드벤쳐게임'];
    gameItems.forEach(item => {
        db.run(`INSERT INTO minor_categories (middle_id, name, saju_weight)
            SELECT id, ?, 1.2 FROM middle_categories WHERE name = '게임'`, [item]);
    });
    // 과목 분야 (12개)
    const subjectItems = ['기술', '미술', '음악', '과학', '국어', '도덕', '사회', '수학', '영어', '체육', '한국사', '한문'];
    subjectItems.forEach(item => {
        db.run(`INSERT INTO minor_categories (middle_id, name, saju_weight)
            SELECT id, ?, 1.5 FROM middle_categories WHERE name = '과목'`, [item]);
    });
    // 무용 분야 (7개)
    const danceItems = ['대중무용', '민속무용', '발레', '비보이', '스포츠댄스', '전통무용', '현대무용'];
    danceItems.forEach(item => {
        db.run(`INSERT INTO minor_categories (middle_id, name, saju_weight)
            SELECT id, ?, 1.3 FROM middle_categories WHERE name = '무용'`, [item]);
    });
    // 문학 분야 (9개)
    const literatureItems = ['라디오작가', '만화작가', '방송작가', '소설가', '시나리오작가', '시인', '애니메이션작가', '연극작가', '작사가'];
    literatureItems.forEach(item => {
        db.run(`INSERT INTO minor_categories (middle_id, name, saju_weight)
            SELECT id, ?, 1.4 FROM middle_categories WHERE name = '문학'`, [item]);
    });
    // 미술 분야 (14개)
    const artItems = ['디자인', '공예', '동양화', '디지털미디어', '무대장치', '사진', '산업디자인', '서양화', '시각디자인', '영상', '의상디자인', '인테리어', '조소', '판화'];
    artItems.forEach(item => {
        db.run(`INSERT INTO minor_categories (middle_id, name, saju_weight)
            SELECT id, ?, 1.3 FROM middle_categories WHERE name = '미술'`, [item]);
    });
    // 연예 분야 (10개)
    const entertainmentItems = ['가수', 'MC', '개그맨', '드라마배우', '뮤지컬배우', '스턴트맨', '엑스트라', '연극배우', '연기자', '영화배우'];
    entertainmentItems.forEach(item => {
        db.run(`INSERT INTO minor_categories (middle_id, name, saju_weight)
            SELECT id, ?, 1.1 FROM middle_categories WHERE name = '연예'`, [item]);
    });
    // 음악 분야 (8개)
    const musicItems = ['건반악기', '관악기', '대중음악', '보컬', '성악', '작곡', '타악기', '현악기'];
    musicItems.forEach(item => {
        db.run(`INSERT INTO minor_categories (middle_id, name, saju_weight)
            SELECT id, ?, 1.4 FROM middle_categories WHERE name = '음악'`, [item]);
    });
    // 전공 분야 (10개)
    const majorItems = ['공학계', '농생명과학계', '법정계', '사범계', '사회과학계', '생활과학계', '어문인문학계', '예체능계', '의치악계', '자연과학계'];
    majorItems.forEach(item => {
        db.run(`INSERT INTO minor_categories (middle_id, name, saju_weight)
            SELECT id, ?, 1.6 FROM middle_categories WHERE name = '전공'`, [item]);
    });
    // 체능 분야 (37개)
    const sportsItems = ['게임', '골프', '낚시', '농구', '다이빙', '당구', '등반', '라켓볼', '럭비', '마라톤', '모터사이클', '배구', '배드민턴', '보디빌딩', '볼링', '사격', '사이클', '소프트볼', '수상스키', '수영', '스노보드', '스케이트', '스쿼시', '스키', '야구', '요트', '윈드서핑', '육상', '정구', '조정', '체조', '축구', '탁구', '테니스', '하키', '핸드볼', '헬스'];
    sportsItems.forEach(item => {
        db.run(`INSERT INTO minor_categories (middle_id, name, saju_weight)
            SELECT id, ?, 1.2 FROM middle_categories WHERE name = '체능'`, [item]);
    });
    console.log('✅ 주능 데이터 정리 완료!');
    // 최종 확인
    db.all(`
    SELECT 
      mc.name as major_category,
      mid.name as middle_category,
      COUNT(min.id) as item_count
    FROM major_categories mc
    JOIN middle_categories mid ON mc.id = mid.major_id
    JOIN minor_categories min ON mid.id = min.middle_id
    WHERE mc.type = 'positive'
    GROUP BY mc.name, mid.name
    ORDER BY mid.name
  `, (err, rows) => {
        if (err) {
            console.error('조회 오류:', err);
        }
        else {
            console.log('\n📊 주능 카테고리별 항목 수:');
            rows.forEach(row => {
                console.log(`  ${row.middle_category}: ${row.item_count}개`);
            });
            const totalItems = rows.reduce((sum, row) => sum + row.item_count, 0);
            console.log(`\n✨ 총 주능 항목: ${totalItems}개`);
            // 기대값과 비교
            const expectedCounts = {
                '게임': 7, '과목': 12, '무용': 7, '문학': 9, '미술': 14,
                '연예': 10, '음악': 8, '전공': 10, '체능': 37
            };
            const expectedTotal = Object.values(expectedCounts).reduce((sum, count) => sum + count, 0);
            console.log(`\n🎯 기대 총합: ${expectedTotal}개`);
            console.log(`${totalItems === expectedTotal ? '✅' : '❌'} 항목 수 일치 여부: ${totalItems === expectedTotal ? '정확' : '불일치'}`);
        }
        db.close();
    });
});
//# sourceMappingURL=fix-positive-data.js.map