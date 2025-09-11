"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sqlite3_1 = __importDefault(require("sqlite3"));
const path_1 = __importDefault(require("path"));
const dbPath = path_1.default.join(__dirname, '../../../data/saju.db');
const db = new sqlite3_1.default.Database(dbPath);
console.log('🧹 주능 카테고리 소항목 중복 제거 시작...\n');
db.serialize(() => {
    // 트랜잭션 시작
    db.run('BEGIN TRANSACTION', (err) => {
        if (err) {
            console.error('❌ 트랜잭션 시작 실패:', err);
            db.close();
            return;
        }
        // 중복된 항목들 조회 (각 그룹에서 첫 번째 ID만 유지)
        const findDuplicatesQuery = `
      SELECT 
        mid.name as middle_category,
        min.name as item_name,
        MIN(min.id) as keep_id,
        GROUP_CONCAT(min.id) as all_ids,
        COUNT(*) as duplicate_count
      FROM major_categories mc
      JOIN middle_categories mid ON mc.id = mid.major_id
      JOIN minor_categories min ON mid.id = min.middle_id
      WHERE mc.type = 'positive'
      GROUP BY mid.name, min.name
      HAVING COUNT(*) > 1
      ORDER BY mid.name, min.name
    `;
        db.all(findDuplicatesQuery, (err, duplicates) => {
            if (err) {
                console.error('❌ 중복 조회 실패:', err);
                db.run('ROLLBACK');
                db.close();
                return;
            }
            let totalRemoved = 0;
            let processedCategories = new Set();
            console.log(`📋 ${duplicates.length}개의 중복 그룹 발견\n`);
            console.log('중복 제거 진행 중...\n');
            // 각 중복 그룹에 대해 처리
            duplicates.forEach((dup, index) => {
                const idsToDelete = dup.all_ids.split(',')
                    .map((id) => parseInt(id))
                    .filter((id) => id !== dup.keep_id);
                if (!processedCategories.has(dup.middle_category)) {
                    console.log(`\n📁 ${dup.middle_category}:`);
                    processedCategories.add(dup.middle_category);
                }
                console.log(`   - "${dup.item_name}": ${dup.duplicate_count}개 → 1개 (ID ${dup.keep_id} 유지)`);
                // 중복 항목 삭제
                const deleteQuery = `DELETE FROM minor_categories WHERE id IN (${idsToDelete.join(',')})`;
                db.run(deleteQuery, function (err) {
                    if (err) {
                        console.error(`   ❌ 삭제 실패 (${dup.item_name}):`, err);
                    }
                    else {
                        totalRemoved += this.changes;
                    }
                });
            });
            // 모든 삭제 작업이 완료된 후 통계 출력
            setTimeout(() => {
                // 삭제 후 통계 조회
                const statsQuery = `
          SELECT 
            mid.name as middle_category,
            COUNT(DISTINCT min.name) as unique_count,
            COUNT(min.id) as total_count
          FROM major_categories mc
          JOIN middle_categories mid ON mc.id = mid.major_id
          JOIN minor_categories min ON mid.id = min.middle_id
          WHERE mc.type = 'positive'
          GROUP BY mid.name
          ORDER BY mid.name
        `;
                db.all(statsQuery, (err, stats) => {
                    if (err) {
                        console.error('❌ 통계 조회 실패:', err);
                        db.run('ROLLBACK');
                    }
                    else {
                        console.log('\n' + '='.repeat(60));
                        console.log('\n✅ 중복 제거 완료!\n');
                        console.log('📊 최종 결과:\n');
                        stats.forEach(stat => {
                            console.log(`   ${stat.middle_category}: ${stat.unique_count}개`);
                        });
                        const totalItems = stats.reduce((sum, stat) => sum + stat.unique_count, 0);
                        console.log('\n' + '='.repeat(60));
                        console.log(`\n🎯 요약:`);
                        console.log(`   - 제거된 중복 항목: ${totalRemoved}개`);
                        console.log(`   - 최종 고유 항목 수: ${totalItems}개`);
                        console.log(`   - 카테고리 수: ${stats.length}개`);
                        // 트랜잭션 커밋
                        db.run('COMMIT', (err) => {
                            if (err) {
                                console.error('❌ 커밋 실패:', err);
                                db.run('ROLLBACK');
                            }
                            else {
                                console.log('\n✨ 데이터베이스 업데이트 완료!');
                            }
                            db.close();
                        });
                    }
                });
            }, 1000);
        });
    });
});
//# sourceMappingURL=remove-duplicates.js.map