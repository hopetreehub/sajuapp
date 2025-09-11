"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sqlite3_1 = __importDefault(require("sqlite3"));
const path_1 = __importDefault(require("path"));
const dbPath = path_1.default.join(__dirname, '../../../data/saju.db');
const db = new sqlite3_1.default.Database(dbPath);
console.log('🚨 대량 중복 데이터 정리 시작...\n');
db.serialize(() => {
    // 트랜잭션 시작
    db.run('BEGIN TRANSACTION', (err) => {
        if (err) {
            console.error('❌ 트랜잭션 시작 실패:', err);
            db.close();
            return;
        }
        console.log('1️⃣ 현재 중복 상황 분석...');
        // 중복 항목 수 확인
        db.get(`
      SELECT COUNT(*) as total_items,
             COUNT(DISTINCT name) as unique_names
      FROM minor_categories
    `, (err, stats) => {
            if (err) {
                console.error('❌ 통계 조회 실패:', err);
                db.run('ROLLBACK');
                db.close();
                return;
            }
            console.log(`📊 현재 상태:`);
            console.log(`   - 전체 항목: ${stats.total_items}개`);
            console.log(`   - 고유 이름: ${stats.unique_names}개`);
            console.log(`   - 평균 중복: ${Math.round(stats.total_items / stats.unique_names)}배`);
            console.log('\n2️⃣ 중복 데이터 정리 중...');
            // 각 이름별로 가장 작은 ID만 남기고 나머지 삭제
            db.run(`
        DELETE FROM minor_categories 
        WHERE id NOT IN (
          SELECT MIN(id) 
          FROM minor_categories 
          GROUP BY name, middle_id
        )
      `, (err) => {
                if (err) {
                    console.error('❌ 중복 제거 실패:', err);
                    db.run('ROLLBACK');
                    db.close();
                    return;
                }
                console.log('✅ 중복 데이터 제거 완료!');
                // 정리 후 상황 확인
                db.get(`
          SELECT COUNT(*) as total_items,
                 COUNT(DISTINCT name) as unique_names
          FROM minor_categories
        `, (err, newStats) => {
                    if (err) {
                        console.error('❌ 정리 후 통계 조회 실패:', err);
                        db.run('ROLLBACK');
                        db.close();
                        return;
                    }
                    console.log('\n📊 정리 후 상태:');
                    console.log(`   - 전체 항목: ${newStats.total_items}개`);
                    console.log(`   - 고유 이름: ${newStats.unique_names}개`);
                    console.log(`   - 제거된 중복: ${stats.total_items - newStats.total_items}개`);
                    // 게임 카테고리 특별 확인
                    console.log('\n3️⃣ 게임 카테고리 검증...');
                    db.all(`
            SELECT mc.name, COUNT(*) as count
            FROM minor_categories mc
            LEFT JOIN middle_categories mdc ON mc.middle_id = mdc.id
            WHERE mdc.name = '게임'
            GROUP BY mc.name
            ORDER BY mc.name
          `, (err, gameResults) => {
                        if (err) {
                            console.error('❌ 게임 카테고리 확인 실패:', err);
                            db.run('ROLLBACK');
                            db.close();
                            return;
                        }
                        console.log('🎮 게임 카테고리 상태:');
                        gameResults.forEach(result => {
                            if (result.count > 1) {
                                console.log(`   ⚠️ "${result.name}": ${result.count}개 (여전히 중복!)`);
                            }
                            else {
                                console.log(`   ✅ "${result.name}": ${result.count}개`);
                            }
                        });
                        // 커밋
                        db.run('COMMIT', (err) => {
                            if (err) {
                                console.error('❌ 커밋 실패:', err);
                                db.run('ROLLBACK');
                            }
                            else {
                                console.log('\n' + '='.repeat(60));
                                console.log('✨ 대량 중복 데이터 정리 완료!');
                                console.log('='.repeat(60));
                                console.log(`🎯 결과: ${stats.total_items - newStats.total_items}개 중복 항목 제거됨`);
                            }
                            db.close();
                        });
                    });
                });
            });
        });
    });
});
//# sourceMappingURL=fix-massive-duplicates.js.map