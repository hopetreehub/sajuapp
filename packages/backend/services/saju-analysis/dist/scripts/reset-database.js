"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sqlite3_1 = __importDefault(require("sqlite3"));
const path_1 = __importDefault(require("path"));
const dbPath = path_1.default.join(__dirname, '../../../data/saju.db');
const db = new sqlite3_1.default.Database(dbPath);
console.log('🔄 데이터베이스 완전 리셋 시작...');
db.serialize(() => {
    console.log('1. 모든 테이블 데이터 삭제 중...');
    // 모든 데이터 완전 삭제
    db.run('DELETE FROM minor_categories');
    db.run('DELETE FROM middle_categories');
    db.run('DELETE FROM major_categories');
    console.log('2. 대분류 (주능/주흉) 생성 중...');
    // 대분류 삽입
    db.run(`INSERT INTO major_categories (name, description, type) VALUES 
    ('주능', '긍정적 적성 및 재능 분야', 'positive'),
    ('주흉', '부정적 위험 요소 분야', 'negative')`);
    console.log('3. 중분류 삽입 중...');
    // 주능 중분류 삽입
    const positiveMiddleCategories = [
        { name: '게임', icon: '🎮' },
        { name: '과목', icon: '📚' },
        { name: '무용', icon: '💃' },
        { name: '문학', icon: '✍️' },
        { name: '미술', icon: '🎨' },
        { name: '연예', icon: '🎭' },
        { name: '음악', icon: '🎵' },
        { name: '전공', icon: '🎓' },
        { name: '체능', icon: '⚽' }
    ];
    positiveMiddleCategories.forEach(category => {
        db.run(`INSERT INTO middle_categories (major_id, name, icon)
            SELECT id, ?, ? FROM major_categories WHERE type = 'positive'`, [category.name, category.icon]);
    });
    // 주흉 중분류 삽입
    const negativeMiddleCategories = [
        { name: '교통사고', icon: '🚗' },
        { name: '사건', icon: '⚖️' },
        { name: '사고', icon: '⚠️' },
        { name: '사고도로', icon: '🛣️' }
    ];
    negativeMiddleCategories.forEach(category => {
        db.run(`INSERT INTO middle_categories (major_id, name, icon)
            SELECT id, ?, ? FROM major_categories WHERE type = 'negative'`, [category.name, category.icon]);
    });
    console.log('4. 주능 소분류 삽입 중...');
    // 지연을 주고 순차적으로 실행
    setTimeout(() => {
        // 게임 분야 (7개)
        const gameItems = ['FPS게임', '롤플레잉게임', '슈팅게임', '스포츠게임', '시뮬레이션게임', '액션게임', '어드벤쳐게임'];
        gameItems.forEach((item, index) => {
            setTimeout(() => {
                db.run(`INSERT INTO minor_categories (middle_id, name, saju_weight)
                SELECT id, ?, 1.2 FROM middle_categories WHERE name = '게임'`, [item]);
            }, index * 10);
        });
        setTimeout(() => {
            // 과목 분야 (12개)
            const subjectItems = ['기술', '미술', '음악', '과학', '국어', '도덕', '사회', '수학', '영어', '체육', '한국사', '한문'];
            subjectItems.forEach((item, index) => {
                setTimeout(() => {
                    db.run(`INSERT INTO minor_categories (middle_id, name, saju_weight)
                  SELECT id, ?, 1.5 FROM middle_categories WHERE name = '과목'`, [item]);
                }, index * 10);
            });
        }, 100);
        setTimeout(() => {
            // 무용 분야 (7개)
            const danceItems = ['대중무용', '민속무용', '발레', '비보이', '스포츠댄스', '전통무용', '현대무용'];
            danceItems.forEach((item, index) => {
                setTimeout(() => {
                    db.run(`INSERT INTO minor_categories (middle_id, name, saju_weight)
                  SELECT id, ?, 1.3 FROM middle_categories WHERE name = '무용'`, [item]);
                }, index * 10);
            });
        }, 200);
        setTimeout(() => {
            // 문학 분야 (9개)
            const literatureItems = ['라디오작가', '만화작가', '방송작가', '소설가', '시나리오작가', '시인', '애니메이션작가', '연극작가', '작사가'];
            literatureItems.forEach((item, index) => {
                setTimeout(() => {
                    db.run(`INSERT INTO minor_categories (middle_id, name, saju_weight)
                  SELECT id, ?, 1.4 FROM middle_categories WHERE name = '문학'`, [item]);
                }, index * 10);
            });
        }, 300);
        setTimeout(() => {
            // 미술 분야 (14개)
            const artItems = ['디자인', '공예', '동양화', '디지털미디어', '무대장치', '사진', '산업디자인', '서양화', '시각디자인', '영상', '의상디자인', '인테리어', '조소', '판화'];
            artItems.forEach((item, index) => {
                setTimeout(() => {
                    db.run(`INSERT INTO minor_categories (middle_id, name, saju_weight)
                  SELECT id, ?, 1.3 FROM middle_categories WHERE name = '미술'`, [item]);
                }, index * 10);
            });
        }, 400);
        setTimeout(() => {
            // 연예 분야 (10개)
            const entertainmentItems = ['가수', 'MC', '개그맨', '드라마배우', '뮤지컬배우', '스턴트맨', '엑스트라', '연극배우', '연기자', '영화배우'];
            entertainmentItems.forEach((item, index) => {
                setTimeout(() => {
                    db.run(`INSERT INTO minor_categories (middle_id, name, saju_weight)
                  SELECT id, ?, 1.1 FROM middle_categories WHERE name = '연예'`, [item]);
                }, index * 10);
            });
        }, 500);
        setTimeout(() => {
            // 음악 분야 (8개)
            const musicItems = ['건반악기', '관악기', '대중음악', '보컬', '성악', '작곡', '타악기', '현악기'];
            musicItems.forEach((item, index) => {
                setTimeout(() => {
                    db.run(`INSERT INTO minor_categories (middle_id, name, saju_weight)
                  SELECT id, ?, 1.4 FROM middle_categories WHERE name = '음악'`, [item]);
                }, index * 10);
            });
        }, 600);
        setTimeout(() => {
            // 전공 분야 (10개)
            const majorItems = ['공학계', '농생명과학계', '법정계', '사범계', '사회과학계', '생활과학계', '어문인문학계', '예체능계', '의치악계', '자연과학계'];
            majorItems.forEach((item, index) => {
                setTimeout(() => {
                    db.run(`INSERT INTO minor_categories (middle_id, name, saju_weight)
                  SELECT id, ?, 1.6 FROM middle_categories WHERE name = '전공'`, [item]);
                }, index * 10);
            });
        }, 700);
        setTimeout(() => {
            // 체능 분야 (37개)
            const sportsItems = ['게임', '골프', '낚시', '농구', '다이빙', '당구', '등반', '라켓볼', '럭비', '마라톤',
                '모터사이클', '배구', '배드민턴', '보디빌딩', '볼링', '사격', '사이클', '소프트볼', '수상스키', '수영',
                '스노보드', '스케이트', '스쿼시', '스키', '야구', '요트', '윈드서핑', '육상', '정구', '조정',
                '체조', '축구', '탁구', '테니스', '하키', '핸드볼', '헬스'];
            sportsItems.forEach((item, index) => {
                setTimeout(() => {
                    db.run(`INSERT INTO minor_categories (middle_id, name, saju_weight)
                  SELECT id, ?, 1.2 FROM middle_categories WHERE name = '체능'`, [item]);
                }, index * 10);
            });
        }, 800);
        // 최종 검증
        setTimeout(() => {
            console.log('5. 최종 검증 중...');
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
                    console.error('검증 오류:', err);
                }
                else {
                    console.log('\n✅ 주능 카테고리별 항목 수:');
                    rows.forEach(row => {
                        console.log(`  ${row.middle_category}: ${row.item_count}개`);
                    });
                    const totalItems = rows.reduce((sum, row) => sum + row.item_count, 0);
                    console.log(`\n🎯 총 주능 항목: ${totalItems}개`);
                    console.log(`✨ 데이터베이스 리셋 완료!`);
                }
                db.close();
            });
        }, 2000);
    }, 500);
});
//# sourceMappingURL=reset-database.js.map