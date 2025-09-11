"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sqlite3_1 = __importDefault(require("sqlite3"));
const path_1 = __importDefault(require("path"));
const dbPath = path_1.default.join(__dirname, '../../../data/saju.db');
const db = new sqlite3_1.default.Database(dbPath);
console.log('⚠️ 주흉 - 모든 카테고리 중복 정리 시작...\n');
db.serialize(() => {
    db.run('BEGIN TRANSACTION', (err) => {
        if (err) {
            console.error('❌ 트랜잭션 시작 실패:', err);
            db.close();
            return;
        }
        console.log('1️⃣ 모든 주흉 카테고리 분석...');
        // 모든 주흉 카테고리 중복 상황 파악
        db.all(`
      SELECT mc.name, mc.id, mc.middle_id, mdc.name as middle_name, mjc.name as major_name
      FROM minor_categories mc
      LEFT JOIN middle_categories mdc ON mc.middle_id = mdc.id
      LEFT JOIN major_categories mjc ON mdc.major_id = mjc.id
      WHERE mjc.name = '주흉'
      ORDER BY mdc.name, mc.name, mc.id
    `, (err, allItems) => {
            if (err) {
                console.error('❌ 주흉 항목 분석 실패:', err);
                db.run('ROLLBACK');
                db.close();
                return;
            }
            console.log(`⚠️ 주흉 전체 현재 상태: ${allItems.length}개 항목`);
            // 카테고리별로 그룹화
            const categoryGroups = {};
            allItems.forEach(item => {
                if (!categoryGroups[item.middle_name])
                    categoryGroups[item.middle_name] = {};
                if (!categoryGroups[item.middle_name][item.name])
                    categoryGroups[item.middle_name][item.name] = [];
                categoryGroups[item.middle_name][item.name].push(item);
            });
            console.log('📊 주흉 카테고리별 상세 분석:');
            let totalToDelete = [];
            let totalDuplicates = 0;
            let totalCategories = 0;
            Object.entries(categoryGroups).forEach(([categoryName, nameGroups]) => {
                console.log(`\n⚠️ ${categoryName} 카테고리:`);
                let categoryDeletes = [];
                let categoryDuplicates = 0;
                let categoryNormal = 0;
                Object.entries(nameGroups).forEach(([name, items]) => {
                    if (items.length > 1) {
                        console.log(`   ⚠️ "${name}": ${items.length}개`);
                        categoryDuplicates++;
                        // 가장 작은 ID만 남기고 나머지는 삭제 대상
                        const sorted = items.sort((a, b) => a.id - b.id);
                        const keepId = sorted[0].id;
                        const deleteIds = sorted.slice(1).map(item => item.id);
                        console.log(`      - 유지: ID ${keepId}`);
                        console.log(`      - 삭제: ID ${deleteIds.join(', ')}`);
                        categoryDeletes.push(...deleteIds);
                    }
                    else {
                        console.log(`   ✅ "${name}": ${items.length}개`);
                        categoryNormal++;
                    }
                });
                console.log(`   📊 ${categoryName} 요약: 정상 ${categoryNormal}개, 중복 ${categoryDuplicates}개, 삭제 ${categoryDeletes.length}개`);
                totalToDelete.push(...categoryDeletes);
                totalDuplicates += categoryDuplicates;
                totalCategories++;
            });
            console.log(`\n📊 주흉 전체 요약:`);
            console.log(`   - 처리한 카테고리: ${totalCategories}개`);
            console.log(`   - 중복 항목명: ${totalDuplicates}개`);
            console.log(`   - 삭제할 레코드: ${totalToDelete.length}개`);
            if (totalToDelete.length === 0) {
                console.log('\n✅ 주흉에서 더 이상 삭제할 중복이 없습니다!');
                db.run('COMMIT', () => {
                    console.log('\n✨ 모든 주흉 카테고리가 이미 정상 상태!');
                    db.close();
                });
                return;
            }
            console.log(`\n2️⃣ 주흉 ${totalToDelete.length}개 중복 항목 삭제 중...`);
            // 중복 항목들 삭제
            const placeholders = totalToDelete.map(() => '?').join(',');
            db.run(`
        DELETE FROM minor_categories 
        WHERE id IN (${placeholders})
      `, totalToDelete, (err) => {
                if (err) {
                    console.error('❌ 주흉 중복 삭제 실패:', err);
                    db.run('ROLLBACK');
                    db.close();
                    return;
                }
                console.log('✅ 모든 주흉 중복 삭제 완료!');
                // 최종 검증
                console.log('\n3️⃣ 주흉 최종 검증 중...');
                db.all(`
          SELECT mdc.name as middle_name, mc.name, COUNT(*) as count
          FROM minor_categories mc
          LEFT JOIN middle_categories mdc ON mc.middle_id = mdc.id
          LEFT JOIN major_categories mjc ON mdc.major_id = mjc.id
          WHERE mjc.name = '주흉'
          GROUP BY mdc.name, mc.name
          HAVING count > 1
          ORDER BY mdc.name, count DESC
        `, (err, stillDuplicates) => {
                    if (err) {
                        console.error('❌ 주흉 최종 검증 실패:', err);
                        db.run('ROLLBACK');
                        db.close();
                        return;
                    }
                    if (stillDuplicates.length > 0) {
                        console.log('⚠️ 여전히 중복인 주흉 항목:');
                        stillDuplicates.forEach(dup => {
                            console.log(`   - ${dup.middle_name} > "${dup.name}": ${dup.count}개`);
                        });
                    }
                    else {
                        console.log('✅ 모든 주흉 카테고리 중복 완전 제거 완료!');
                    }
                    // 최종 통계
                    db.all(`
            SELECT mdc.name as middle_name, COUNT(*) as count
            FROM minor_categories mc
            LEFT JOIN middle_categories mdc ON mc.middle_id = mdc.id
            LEFT JOIN major_categories mjc ON mdc.major_id = mjc.id
            WHERE mjc.name = '주흉'
            GROUP BY mdc.name
            ORDER BY mdc.name
          `, (err, finalStats) => {
                        if (err) {
                            console.error('❌ 주흉 최종 통계 조회 실패:', err);
                        }
                        else {
                            console.log('\n⚠️ 최종 주흉 카테고리 통계:');
                            finalStats.forEach(stat => {
                                console.log(`   - ${stat.middle_name}: ${stat.count}개`);
                            });
                            console.log(`   - 총합: ${finalStats.reduce((sum, s) => sum + s.count, 0)}개`);
                        }
                        // 각 카테고리별 상세 목록 표시
                        db.all(`
              SELECT mdc.name as middle_name, mc.name
              FROM minor_categories mc
              LEFT JOIN middle_categories mdc ON mc.middle_id = mdc.id
              LEFT JOIN major_categories mjc ON mdc.major_id = mjc.id
              WHERE mjc.name = '주흉'
              ORDER BY mdc.name, mc.name
            `, (err, detailItems) => {
                            if (err) {
                                console.error('❌ 상세 목록 조회 실패:', err);
                            }
                            else {
                                console.log('\n⚠️ 최종 주흉 카테고리 상세 목록:');
                                let currentCategory = '';
                                let categoryIndex = 1;
                                detailItems.forEach((item, index) => {
                                    if (item.middle_name !== currentCategory) {
                                        console.log(`\n   ${categoryIndex}. ${item.middle_name}:`);
                                        currentCategory = item.middle_name;
                                        categoryIndex++;
                                    }
                                    console.log(`      - ${item.name}`);
                                });
                            }
                            db.run('COMMIT', (err) => {
                                if (err) {
                                    console.error('❌ 커밋 실패:', err);
                                    db.run('ROLLBACK');
                                }
                                else {
                                    console.log('\n' + '='.repeat(60));
                                    console.log('✨ 모든 주흉 카테고리 중복 정리 완료!');
                                    console.log(`⚠️ 총 제거된 중복: ${totalToDelete.length}개`);
                                    console.log('='.repeat(60));
                                }
                                db.close();
                            });
                        });
                    });
                });
            });
        });
    });
});
//# sourceMappingURL=fix-all-negative-categories.js.map