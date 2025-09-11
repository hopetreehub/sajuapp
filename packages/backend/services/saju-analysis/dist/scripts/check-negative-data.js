"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sqlite3_1 = __importDefault(require("sqlite3"));
const path_1 = __importDefault(require("path"));
const dbPath = path_1.default.join(__dirname, '../../../data/saju.db');
const db = new sqlite3_1.default.Database(dbPath);
console.log('🔍 주흉(부정) 데이터 현황 확인...');
db.serialize(() => {
    // 주흉 카테고리 현황 조회
    db.all(`
    SELECT 
      mc.name as major_category,
      mid.name as middle_category,
      COUNT(min.id) as item_count,
      GROUP_CONCAT(min.name) as items
    FROM major_categories mc
    JOIN middle_categories mid ON mc.id = mid.major_id
    LEFT JOIN minor_categories min ON mid.id = min.middle_id
    WHERE mc.type = 'negative'
    GROUP BY mc.name, mid.name
    ORDER BY mid.name
  `, (err, rows) => {
        if (err) {
            console.error('조회 오류:', err);
        }
        else {
            console.log('\n📊 현재 주흉 카테고리 현황:');
            rows.forEach(row => {
                console.log(`\n[${row.middle_category}] ${row.item_count}개 항목`);
                if (row.items) {
                    const itemList = row.items.split(',');
                    itemList.forEach((item, idx) => {
                        console.log(`  ${idx + 1}. ${item}`);
                    });
                }
            });
            const totalItems = rows.reduce((sum, row) => sum + row.item_count, 0);
            console.log(`\n✨ 총 주흉 항목: ${totalItems}개`);
            console.log(`📋 중항목 수: ${rows.length}개`);
        }
        // 모든 주흉 중항목 목록 확인
        db.all(`
      SELECT DISTINCT mid.name as middle_category
      FROM major_categories mc
      JOIN middle_categories mid ON mc.id = mid.major_id
      WHERE mc.type = 'negative'
      ORDER BY mid.name
    `, (err, categories) => {
            if (err) {
                console.error('중항목 조회 오류:', err);
            }
            else {
                console.log('\n🏷️ 현재 주흉 중항목 목록:');
                categories.forEach((cat, idx) => {
                    console.log(`  ${idx + 1}. ${cat.middle_category}`);
                });
            }
            db.close();
        });
    });
});
//# sourceMappingURL=check-negative-data.js.map