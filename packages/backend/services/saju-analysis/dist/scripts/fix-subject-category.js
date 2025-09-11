"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sqlite3_1 = __importDefault(require("sqlite3"));
const path_1 = __importDefault(require("path"));
const dbPath = path_1.default.join(__dirname, '../../../data/saju.db');
const db = new sqlite3_1.default.Database(dbPath);
console.log('📚 주능 - 과목 카테고리 중복 정리 시작...\n');
db.serialize(() => {
    db.run('BEGIN TRANSACTION', (err) => {
        if (err) {
            console.error('❌ 트랜잭션 시작 실패:', err);
            db.close();
            return;
        }
        console.log('1️⃣ 과목 카테고리 중복 분석...');
        // 과목 카테고리의 중복 상황 파악
        db.all(`
      SELECT mc.name, mc.id, mc.middle_id, mdc.name as middle_name
      FROM minor_categories mc
      LEFT JOIN middle_categories mdc ON mc.middle_id = mdc.id
      WHERE mdc.name = '과목'
      ORDER BY mc.name, mc.id
    `, (err, subjects) => {
            if (err) {
                console.error('❌ 과목 항목 분석 실패:', err);
                db.run('ROLLBACK');
                db.close();
                return;
            }
            console.log(`📚 과목 카테고리 현재 상태: ${subjects.length}개 항목`);
            // 이름별로 그룹화
            const groups = {};
            subjects.forEach(item => {
                if (!groups[item.name])
                    groups[item.name] = [];
                groups[item.name].push(item);
            });
            console.log('📊 과목 카테고리 상세 분석:');
            let toDelete = [];
            let normalCount = 0;
            let duplicateCount = 0;
            Object.entries(groups).forEach(([name, items]) => {
                if (items.length > 1) {
                    console.log(`⚠️ "${name}": ${items.length}개`);
                    duplicateCount++;
                    // 가장 작은 ID만 남기고 나머지는 삭제 대상
                    const sorted = items.sort((a, b) => a.id - b.id);
                    const keepId = sorted[0].id;
                    const deleteIds = sorted.slice(1).map(item => item.id);
                    console.log(`   - 유지: ID ${keepId}`);
                    console.log(`   - 삭제: ID ${deleteIds.join(', ')}`);
                    toDelete.push(...deleteIds);
                }
                else {
                    console.log(`✅ "${name}": ${items.length}개`);
                    normalCount++;
                }
            });
            console.log(`\n📊 요약: 정상 ${normalCount}개, 중복 ${duplicateCount}개`);
            if (toDelete.length === 0) {
                console.log('\n✅ 과목 카테고리에 더 이상 삭제할 중복이 없습니다!');
                db.run('COMMIT', () => {
                    console.log('\n✨ 과목 카테고리 이미 정상 상태!');
                    db.close();
                });
                return;
            }
            console.log(`\n2️⃣ 과목 카테고리 ${toDelete.length}개 중복 항목 삭제 중...`);
            // 중복 항목들 삭제
            const placeholders = toDelete.map(() => '?').join(',');
            db.run(`
        DELETE FROM minor_categories 
        WHERE id IN (${placeholders})
      `, toDelete, (err) => {
                if (err) {
                    console.error('❌ 과목 중복 삭제 실패:', err);
                    db.run('ROLLBACK');
                    db.close();
                    return;
                }
                console.log('✅ 과목 중복 삭제 완료!');
                // 최종 확인
                console.log('\n3️⃣ 과목 카테고리 최종 검증...');
                db.all(`
          SELECT mc.name, COUNT(*) as count
          FROM minor_categories mc
          LEFT JOIN middle_categories mdc ON mc.middle_id = mdc.id
          WHERE mdc.name = '과목'
          GROUP BY mc.name
          HAVING count > 1
        `, (err, stillDuplicates) => {
                    if (err) {
                        console.error('❌ 최종 검증 실패:', err);
                        db.run('ROLLBACK');
                        db.close();
                        return;
                    }
                    if (stillDuplicates.length > 0) {
                        console.log('⚠️ 여전히 중복인 항목:');
                        stillDuplicates.forEach(dup => {
                            console.log(`   - "${dup.name}": ${dup.count}개`);
                        });
                    }
                    else {
                        console.log('✅ 과목 카테고리 중복 완전 제거 완료!');
                    }
                    // 전체 과목 항목 목록 표시
                    db.all(`
            SELECT mc.name
            FROM minor_categories mc
            LEFT JOIN middle_categories mdc ON mc.middle_id = mdc.id
            WHERE mdc.name = '과목'
            ORDER BY mc.name
          `, (err, finalItems) => {
                        if (err) {
                            console.error('❌ 최종 목록 조회 실패:', err);
                        }
                        else {
                            console.log('\n📚 최종 과목 카테고리 목록:');
                            finalItems.forEach((item, index) => {
                                console.log(`   ${index + 1}. ${item.name}`);
                            });
                        }
                        db.run('COMMIT', (err) => {
                            if (err) {
                                console.error('❌ 커밋 실패:', err);
                                db.run('ROLLBACK');
                            }
                            else {
                                console.log('\n' + '='.repeat(50));
                                console.log('✨ 과목 카테고리 중복 정리 완료!');
                                console.log(`🎯 결과: ${toDelete.length}개 중복 제거됨`);
                                console.log('='.repeat(50));
                            }
                            db.close();
                        });
                    });
                });
            });
        });
    });
});
//# sourceMappingURL=fix-subject-category.js.map