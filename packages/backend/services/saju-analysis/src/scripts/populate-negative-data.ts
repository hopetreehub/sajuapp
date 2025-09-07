import sqlite3 from 'sqlite3'
import path from 'path'

const dbPath = path.join(__dirname, '../../../data/saju.db')
const db = new sqlite3.Database(dbPath)

console.log('⚠️ 주흉 데이터베이스 채우기 시작...')

db.serialize(() => {
  console.log('1. 기존 주흉 소분류 데이터 정리 중...')
  
  // 기존 주흉 소분류 데이터 삭제 (중복 방지)
  db.run(`DELETE FROM minor_categories WHERE middle_id IN (
    SELECT mid.id FROM middle_categories mid 
    JOIN major_categories mc ON mid.major_id = mc.id 
    WHERE mc.type = 'negative'
  )`)
  
  console.log('2. 주흉 소분류 데이터 삽입 중...')
  
  // 교통사고 분야
  const trafficAccidentItems = [
    '고속도로사고', '교차로사고', '추돌사고', '차량전복', '차량화재', 
    '오토바이사고', '자전거사고', '보행자사고', '음주운전사고', '졸음운전사고',
    '빗길사고', '눈길사고', '안개사고', '터널사고', '교량사고',
    '주차장사고', '버스사고', '택시사고', '트럭사고', '승용차사고'
  ]
  trafficAccidentItems.forEach(item => {
    db.run(`INSERT INTO minor_categories (middle_id, name, saju_weight)
            SELECT id, ?, 2.0 FROM middle_categories WHERE name = '교통사고'`, [item])
  })
  
  // 사건 분야 (법적 분쟁, 갈등 관련)
  const incidentItems = [
    '소송', '재판', '분쟁', '갈등', '다툼',
    '계약위반', '사기', '횡령', '배임', '절도',
    '폭행', '상해', '협박', '명예훼손', '모독',
    '세무조사', '감사', '조사', '처벌', '벌금',
    '이혼', '상속분쟁', '재산분할', '양육권', '친권',
    '직장갈등', '동업자갈등', '이웃분쟁', '가족갈등', '친구갈등'
  ]
  incidentItems.forEach(item => {
    db.run(`INSERT INTO minor_categories (middle_id, name, saju_weight)
            SELECT id, ?, 1.8 FROM middle_categories WHERE name = '사건'`, [item])
  })
  
  // 사고 분야 (일반적인 사고)
  const accidentItems = [
    '낙상', '추락', '화재', '화상', '감전',
    '익사', '질식', '중독', '폭발', '붕괴',
    '기계사고', '작업장사고', '건설사고', '산업사고', '실험사고',
    '스포츠부상', '운동부상', '가정사고', '학교사고', '놀이사고',
    '여행사고', '등산사고', '수상사고', '스키사고', '자연재해',
    '동물사고', '곤충사고', '식중독', '의료사고', '수술사고'
  ]
  accidentItems.forEach(item => {
    db.run(`INSERT INTO minor_categories (middle_id, name, saju_weight)
            SELECT id, ?, 1.7 FROM middle_categories WHERE name = '사고'`, [item])
  })
  
  // 사고도로 분야 (도로 관련 위험)
  const roadHazardItems = [
    '도로공사', '도로파손', '싱크홀', '맨홀', '포트홀',
    '낙석', '산사태', '침수', '결빙', '폭설',
    '강풍', '태풍', '폭우', '지진', '땅꺼짐',
    '표지판낙하', '가로등파손', '신호등고장', '하수구개방', '도로균열',
    '교통체증', '도로막힘', '우회도로', '공사구간', '위험구간'
  ]
  roadHazardItems.forEach(item => {
    db.run(`INSERT INTO minor_categories (middle_id, name, saju_weight)
            SELECT id, ?, 1.9 FROM middle_categories WHERE name = '사고도로'`, [item])
  })
  
  console.log('✅ 주흉 데이터 입력 완료!')
  
  // 최종 확인
  db.all(`
    SELECT 
      mc.name as major_category,
      mid.name as middle_category,
      COUNT(min.id) as item_count
    FROM major_categories mc
    JOIN middle_categories mid ON mc.id = mid.major_id
    JOIN minor_categories min ON mid.id = min.middle_id
    WHERE mc.type = 'negative'
    GROUP BY mc.name, mid.name
    ORDER BY mid.name
  `, (err, rows) => {
    if (err) {
      console.error('조회 오류:', err)
    } else {
      console.log('\n📊 주흉 카테고리별 항목 수:')
      rows.forEach(row => {
        console.log(`  ${row.middle_category}: ${row.item_count}개`)
      })
      
      const totalItems = rows.reduce((sum, row) => sum + row.item_count, 0)
      console.log(`\n⚠️ 총 주흉 항목: ${totalItems}개`)
    }
    db.close()
  })
})