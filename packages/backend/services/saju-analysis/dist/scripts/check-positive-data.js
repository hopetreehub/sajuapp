"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sqlite3_1 = __importDefault(require("sqlite3"));
const path_1 = __importDefault(require("path"));
const dbPath = path_1.default.join(__dirname, '../../../data/saju.db');
const db = new sqlite3_1.default.Database(dbPath);
console.log('🔍 주능(긍정) 데이터 현황 확인...');
db.serialize(() => {
    // 주능 카테고리 현황 조회
    db.all(`
    SELECT 
      mc.name as major_category,
      mid.name as middle_category,
      COUNT(min.id) as item_count,
      GROUP_CONCAT(min.name) as items
    FROM major_categories mc
    JOIN middle_categories mid ON mc.id = mid.major_id
    LEFT JOIN minor_categories min ON mid.id = min.middle_id
    WHERE mc.type = 'positive'
    GROUP BY mc.name, mid.name
    ORDER BY mid.name
  `, (err, rows) => {
        if (err) {
            console.error('조회 오류:', err);
        }
        else {
            console.log('\n📊 현재 주능 카테고리 현황:');
            rows.forEach(row => {
                console.log(`\n[${row.middle_category}] ${row.item_count}개 항목`);
                if (row.items) {
                    const itemList = row.items.split(',');
                    // 중복 제거 및 정렬
                    const uniqueItems = [...new Set(itemList)].sort();
                    uniqueItems.forEach((item, idx) => {
                        console.log(`  ${idx + 1}. ${item}`);
                    });
                    console.log(`  실제 고유 항목: ${uniqueItems.length}개 (중복 제거 후)`);
                }
            });
            const totalItems = rows.reduce((sum, row) => sum + row.item_count, 0);
            console.log(`\n✨ 총 주능 항목: ${totalItems}개`);
            console.log(`📋 중항목 수: ${rows.length}개`);
        }
        // 모든 주능 중항목 목록 확인
        db.all(`
      SELECT DISTINCT mid.name as middle_category
      FROM major_categories mc
      JOIN middle_categories mid ON mc.id = mid.major_id
      WHERE mc.type = 'positive'
      ORDER BY mid.name
    `, (err, categories) => {
            if (err) {
                console.error('중항목 조회 오류:', err);
            }
            else {
                console.log('\n🏷️ 현재 주능 중항목 목록:');
                categories.forEach((cat, idx) => {
                    console.log(`  ${idx + 1}. ${cat.middle_category}`);
                });
                console.log(`\n🎯 기대하는 주능 9개 중항목:`);
                console.log(`  1. 게임`);
                console.log(`  2. 과목`);
                console.log(`  3. 무용`);
                console.log(`  4. 문학`);
                console.log(`  5. 미술`);
                console.log(`  6. 연예`);
                console.log(`  7. 음악`);
                console.log(`  8. 전공`);
                console.log(`  9. 체능`);
            }
            db.close();
        });
    });
});
//# sourceMappingURL=check-positive-data.js.map