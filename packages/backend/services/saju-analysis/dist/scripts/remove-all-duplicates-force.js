"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sqlite3_1 = __importDefault(require("sqlite3"));
const path_1 = __importDefault(require("path"));
const dbPath = path_1.default.join(__dirname, '../../../data/saju.db');
const db = new sqlite3_1.default.Database(dbPath);
console.log('🔥 강제 중복 제거 - 완전 정리\n');
db.serialize(() => {
    db.run('BEGIN TRANSACTION', (err) => {
        if (err) {
            console.error('❌ 트랜잭션 시작 실패:', err);
            db.close();
            return;
        }
        console.log('1️⃣ 현재 상태 확인...');
        // 중복된 middle_id 확인
        db.all(`
      SELECT middle_id, COUNT(DISTINCT id) as duplicate_count
      FROM middle_categories
      GROUP BY middle_id
      HAVING COUNT(DISTINCT id) > 1
      ORDER BY duplicate_count DESC
    `, (err, duplicateMiddles) => {
            if (err) {
                console.error('오류:', err);
                db.run('ROLLBACK');
                db.close();
                return;
            }
            if (duplicateMiddles.length > 0) {
                console.log('⚠️ 중복된 middle_categories 발견!');
                console.log('   middle_categories 테이블에 중복이 있어서 minor_categories도 중복됩니다.');
            }
            // 강제로 모든 중복 제거 - 각 (middle_id, name) 조합에서 가장 작은 ID만 유지
            console.log('\n2️⃣ 모든 중복 강제 제거 시작...');
            db.run(`
        DELETE FROM minor_categories
        WHERE id NOT IN (
          SELECT MIN(id)
          FROM minor_categories
          GROUP BY middle_id, name
        )
      `, function (err) {
                if (err) {
                    console.error('❌ 중복 제거 실패:', err);
                    db.run('ROLLBACK');
                    db.close();
                    return;
                }
                const deleted = this.changes;
                console.log(`✅ ${deleted}개의 중복 항목 제거 완료!`);
                // 최종 검증
                db.get(`
          SELECT 
            COUNT(*) as total,
            COUNT(DISTINCT name || '-' || middle_id) as unique_combinations
          FROM minor_categories
        `, (err, result) => {
                    if (err) {
                        console.error('검증 실패:', err);
                        db.run('ROLLBACK');
                        db.close();
                        return;
                    }
                    console.log('\n📊 최종 결과:');
                    console.log(`   - 전체 항목: ${result.total}개`);
                    console.log(`   - 고유 조합: ${result.unique_combinations}개`);
                    if (result.total === result.unique_combinations) {
                        console.log('   ✅ 모든 중복이 성공적으로 제거되었습니다!');
                        // 카테고리별 통계
                        db.all(`
              SELECT 
                mc.name as major_name,
                mid.name as middle_name,
                COUNT(min.id) as item_count
              FROM major_categories mc
              JOIN middle_categories mid ON mc.id = mid.major_id
              JOIN minor_categories min ON mid.id = min.middle_id
              GROUP BY mc.name, mid.name
              ORDER BY mc.name, mid.name
            `, (err, stats) => {
                            if (err) {
                                console.error('통계 조회 실패:', err);
                            }
                            else {
                                console.log('\n📈 카테고리별 최종 통계:');
                                let currentMajor = '';
                                stats.forEach(stat => {
                                    if (stat.major_name !== currentMajor) {
                                        console.log(`\n[${stat.major_name}]`);
                                        currentMajor = stat.major_name;
                                    }
                                    console.log(`   ${stat.middle_name}: ${stat.item_count}개`);
                                });
                            }
                            db.run('COMMIT', (err) => {
                                if (err) {
                                    console.error('❌ 커밋 실패:', err);
                                    db.run('ROLLBACK');
                                }
                                else {
                                    console.log('\n✨ 데이터베이스 완전 정리 완료!');
                                }
                                db.close();
                            });
                        });
                    }
                    else {
                        console.log(`   ⚠️ 여전히 중복이 있습니다.`);
                        db.run('ROLLBACK');
                        db.close();
                    }
                });
            });
        });
    });
});
//# sourceMappingURL=remove-all-duplicates-force.js.map