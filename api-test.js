const https = require('http');

const postData = JSON.stringify({
  user_id: "test-score-user",
  birth_date: "1990-05-15", 
  birth_time: "14:30",
  is_lunar: false
});

const options = {
  hostname: 'localhost',
  port: 4015,
  path: '/api/saju/scores/comprehensive',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('🔍 API 응답 데이터 직접 분석 중...\n');

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      
      if (response.success) {
        console.log('✅ API 호출 성공\n');
        
        // 주능 카테고리 분석
        console.log('📊 주능 카테고리 중복 분석:');
        console.log('='.repeat(50));
        
        Object.entries(response.data.positive_scores).forEach(([category, scoreData]) => {
          console.log(`\n🎯 ${category} 카테고리:`);
          console.log(`   - 점수: 기본${scoreData.base_score} | 오늘${scoreData.daily_score} | 이달${scoreData.monthly_score} | 올해${scoreData.yearly_score}`);
          console.log(`   - 항목 수: ${scoreData.items.length}개`);
          
          // 항목 이름별 카운트
          const itemCounts = {};
          scoreData.items.forEach(item => {
            itemCounts[item.name] = (itemCounts[item.name] || 0) + 1;
          });
          
          console.log(`   - 고유 항목: ${Object.keys(itemCounts).length}개`);
          
          // 중복 항목 표시
          Object.entries(itemCounts).forEach(([name, count]) => {
            if (count > 1) {
              console.log(`   ⚠️  "${name}": ${count}번 중복!`);
            } else {
              console.log(`   ✅  "${name}": 정상`);
            }
          });
        });
        
        console.log('\n📊 주흉 카테고리 중복 분석:');
        console.log('='.repeat(50));
        
        Object.entries(response.data.negative_scores).forEach(([category, scoreData]) => {
          console.log(`\n⚠️ ${category} 카테고리:`);
          console.log(`   - 점수: 기본${scoreData.base_score} | 오늘${scoreData.daily_score} | 이달${scoreData.monthly_score} | 올해${scoreData.yearly_score}`);
          console.log(`   - 항목 수: ${scoreData.items.length}개`);
          
          // 항목 이름별 카운트
          const itemCounts = {};
          scoreData.items.forEach(item => {
            itemCounts[item.name] = (itemCounts[item.name] || 0) + 1;
          });
          
          console.log(`   - 고유 항목: ${Object.keys(itemCounts).length}개`);
          
          // 중복 항목 표시
          Object.entries(itemCounts).forEach(([name, count]) => {
            if (count > 1) {
              console.log(`   ⚠️  "${name}": ${count}번 중복!`);
            } else {
              console.log(`   ✅  "${name}": 정상`);
            }
          });
        });
        
        console.log('\n🎯 종합 분석:');
        console.log('='.repeat(50));
        console.log(`   - 전체 운세: ${response.data.summary.overall_fortune}점`);
        console.log(`   - 추세: ${response.data.summary.trend}`);
        console.log(`   - 추천사항: ${response.data.summary.recommendations.length}개`);
        
        response.data.summary.recommendations.forEach((rec, index) => {
          console.log(`     ${index + 1}. ${rec}`);
        });
        
      } else {
        console.log('❌ API 오류:', response.error);
      }
    } catch (error) {
      console.log('❌ JSON 파싱 오류:', error.message);
      console.log('원본 응답:', data);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ 요청 오류:', e.message);
});

req.write(postData);
req.end();