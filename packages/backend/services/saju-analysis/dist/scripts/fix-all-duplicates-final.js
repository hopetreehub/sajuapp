"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sqlite3_1 = __importDefault(require("sqlite3"));
const path_1 = __importDefault(require("path"));
const dbPath = path_1.default.join(__dirname, '../../../data/saju.db');
const db = new sqlite3_1.default.Database(dbPath);
console.log('🚨 모든 중복 제거 시작 - 최종 정리\n');
db.serialize(() => {
    db.run('BEGIN TRANSACTION', (err) => {
        if (err) {
            console.error('❌ 트랜잭션 시작 실패:', err);
            db.close();
            return;
        }
        console.log('1️⃣ 현재 중복 상태 분석...');
        // 전체 중복 상태 확인
        db.get(`
      SELECT 
        COUNT(DISTINCT name) as unique_count,
        COUNT(name) as total_count
      FROM minor_categories
    `, (err, stats) => {
            if (err) {
                console.error('❌ 상태 확인 실패:', err);
                db.run('ROLLBACK');
                db.close();
                return;
            }
            console.log(`📊 현재 상태:`);
            console.log(`   - 고유 항목: ${stats.unique_count}개`);
            console.log(`   - 전체 항목: ${stats.total_count}개`);
            console.log(`   - 중복 수: ${stats.total_count - stats.unique_count}개`);
            if (stats.unique_count === stats.total_count) {
                console.log('\n✅ 이미 중복이 제거된 상태입니다!');
                db.close();
                return;
            }
            console.log('\n2️⃣ 중복 제거 작업 시작...');
            // 각 중분류별로 중복 제거
            db.all(`
        SELECT DISTINCT mid.id as middle_id, mid.name as middle_name
        FROM middle_categories mid
        ORDER BY mid.name
      `, (err, categories) => {
                if (err) {
                    console.error('❌ 카테고리 조회 실패:', err);
                    db.run('ROLLBACK');
                    db.close();
                    return;
                }
                let processedCount = 0;
                let totalDeleted = 0;
                const processCategory = (index) => {
                    if (index >= categories.length) {
                        // 모든 카테고리 처리 완료
                        console.log('\n' + '='.repeat(60));
                        console.log(`✅ 모든 중복 제거 완료!`);
                        console.log(`   - 처리한 카테고리: ${processedCount}개`);
                        console.log(`   - 삭제한 중복: ${totalDeleted}개`);
                        console.log('='.repeat(60));
                        // 최종 검증
                        db.get(`
              SELECT 
                COUNT(DISTINCT name) as unique_count,
                COUNT(name) as total_count
              FROM minor_categories
            `, (err, finalStats) => {
                            if (err) {
                                console.error('❌ 최종 검증 실패:', err);
                                db.run('ROLLBACK');
                            }
                            else {
                                console.log('\n📊 최종 상태:');
                                console.log(`   - 고유 항목: ${finalStats.unique_count}개`);
                                console.log(`   - 전체 항목: ${finalStats.total_count}개`);
                                if (finalStats.unique_count === finalStats.total_count) {
                                    console.log(`   ✅ 모든 중복이 성공적으로 제거되었습니다!`);
                                    db.run('COMMIT', (err) => {
                                        if (err) {
                                            console.error('❌ 커밋 실패:', err);
                                            db.run('ROLLBACK');
                                        }
                                        else {
                                            console.log('\n✨ 데이터베이스 정리 완료!');
                                        }
                                        db.close();
                                    });
                                }
                                else {
                                    console.log(`   ⚠️ 아직 ${finalStats.total_count - finalStats.unique_count}개의 중복이 남아있습니다.`);
                                    db.run('ROLLBACK');
                                    db.close();
                                }
                            }
                        });
                        return;
                    }
                    const category = categories[index];
                    // 해당 카테고리의 중복 제거
                    db.run(`
            DELETE FROM minor_categories
            WHERE middle_id = ? 
            AND id NOT IN (
              SELECT MIN(id)
              FROM minor_categories
              WHERE middle_id = ?
              GROUP BY name
            )
          `, [category.middle_id, category.middle_id], function (err) {
                        if (err) {
                            console.error(`❌ ${category.middle_name} 카테고리 처리 실패:`, err);
                            db.run('ROLLBACK');
                            db.close();
                            return;
                        }
                        const deleted = this.changes;
                        if (deleted > 0) {
                            console.log(`   ✅ ${category.middle_name}: ${deleted}개 중복 제거`);
                            totalDeleted += deleted;
                        }
                        else {
                            console.log(`   ✔️ ${category.middle_name}: 중복 없음`);
                        }
                        processedCount++;
                        // 다음 카테고리 처리
                        processCategory(index + 1);
                    });
                };
                // 첫 번째 카테고리부터 처리 시작
                console.log('\n카테고리별 처리 상황:');
                processCategory(0);
            });
        });
    });
});
//# sourceMappingURL=fix-all-duplicates-final.js.map