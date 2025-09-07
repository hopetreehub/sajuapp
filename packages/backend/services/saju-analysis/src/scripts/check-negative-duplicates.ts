import sqlite3 from 'sqlite3'
import path from 'path'

const dbPath = path.join(__dirname, '../../../data/saju.db')
const db = new sqlite3.Database(dbPath)

console.log('🔍 주흉 카테고리 소항목 중복 검사 시작...\n')

db.serialize(() => {
  // 주흉 카테고리별 소항목 중복 현황 조회
  const query = `
    SELECT 
      mid.name as middle_category,
      min.name as item_name,
      COUNT(*) as duplicate_count,
      GROUP_CONCAT(min.id) as duplicate_ids
    FROM major_categories mc
    JOIN middle_categories mid ON mc.id = mid.major_id
    JOIN minor_categories min ON mid.id = min.middle_id
    WHERE mc.type = 'negative'
    GROUP BY mid.name, min.name
    ORDER BY mid.name, duplicate_count DESC, min.name
  `

  db.all(query, (err, rows: any[]) => {
    if (err) {
      console.error('❌ 쿼리 실행 실패:', err)
      db.close()
      return
    }

    const categoryStats: { [key: string]: { total: number, unique: number, duplicates: any[] } } = {}
    
    rows.forEach(row => {
      if (!categoryStats[row.middle_category]) {
        categoryStats[row.middle_category] = { total: 0, unique: 0, duplicates: [] }
      }
      
      categoryStats[row.middle_category].total += row.duplicate_count
      categoryStats[row.middle_category].unique += 1
      
      if (row.duplicate_count > 1) {
        categoryStats[row.middle_category].duplicates.push({
          name: row.item_name,
          count: row.duplicate_count,
          ids: row.duplicate_ids
        })
      }
    })

    console.log('📊 주흉 카테고리별 소항목 현황:\n')
    console.log('=' .repeat(60))
    
    Object.entries(categoryStats).forEach(([category, stats]) => {
      console.log(`\n📁 ${category}:`)
      console.log(`   - 전체 소항목 수: ${stats.total}개`)
      console.log(`   - 고유 소항목 수: ${stats.unique}개`)
      console.log(`   - 중복된 항목 수: ${stats.duplicates.length}개`)
      
      if (stats.duplicates.length > 0) {
        console.log(`   - 중복 상세:`)
        stats.duplicates.forEach(dup => {
          console.log(`     • "${dup.name}": ${dup.count}번 중복 (IDs: ${dup.ids})`)
        })
      }
    })
    
    console.log('\n' + '=' .repeat(60))
    
    // 전체 통계
    const totalItems = Object.values(categoryStats).reduce((sum, stat) => sum + stat.total, 0)
    const uniqueItems = Object.values(categoryStats).reduce((sum, stat) => sum + stat.unique, 0)
    const totalDuplicates = Object.values(categoryStats).reduce((sum, stat) => 
      stat.duplicates.reduce((s, d) => s + (d.count - 1), 0), 0)
    
    console.log('\n📈 주흉 전체 통계:')
    console.log(`   - 전체 소항목 수: ${totalItems}개`)
    console.log(`   - 고유 소항목 수: ${uniqueItems}개`)
    console.log(`   - 제거 가능한 중복: ${totalDuplicates}개`)
    console.log(`   - 중복 제거 후 예상: ${totalItems - totalDuplicates}개`)
    
    db.close()
  })
})