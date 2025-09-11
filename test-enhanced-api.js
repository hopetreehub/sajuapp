const https = require('http');

const postData = JSON.stringify({
  user_id: "enhanced-test-user",
  birth_date: "1990-05-15", 
  birth_time: "14:30",
  is_lunar: false,
  categories: "all"
});

const options = {
  hostname: 'localhost',
  port: 4015,
  path: '/api/saju/scores/enhanced',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('🌟 향상된 사주 점수 API 테스트 시작...\n');

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      
      if (response.success) {
        console.log('✅ 향상된 API 호출 성공\n');
        
        // 사주 분석 정보
        console.log('📊 사주 분석 정보:');
        console.log('='.repeat(50));
        console.log(`   일주: ${response.data.saju_analysis.day_master}`);
        console.log(`   주도 오행: ${response.data.saju_analysis.dominant_element}`);
        console.log(`   강약: ${response.data.saju_analysis.strength_level}`);
        console.log(`   십성: ${response.data.saju_analysis.ten_gods.join(', ')}`);
        console.log(`   계절: ${response.data.saju_analysis.season}`);
        
        // 주능 상위 카테고리 분석
        console.log('\n🎯 주능 카테고리 상세 분석:');
        console.log('='.repeat(60));
        
        const positiveEntries = Object.entries(response.data.positive_scores)
          .sort((a, b) => b[1].base_score - a[1].base_score);
        
        positiveEntries.forEach(([category, scoreData]) => {
          console.log(`\n🎯 ${category} 카테고리:`);
          console.log(`   기본 점수: ${scoreData.base_score}점`);
          console.log(`   시점별 점수: 오늘${scoreData.daily_score} | 이달${scoreData.monthly_score} | 올해${scoreData.yearly_score}`);
          console.log(`   신뢰도: ${(scoreData.confidence_level * 100).toFixed(1)}%`);
          
          console.log(`   점수 구성:`);
          console.log(`     - 오행 친화도: ${scoreData.score_breakdown.element_affinity}점`);
          console.log(`     - 십성 조화도: ${scoreData.score_breakdown.ten_gods_harmony}점`);
          console.log(`     - 기둥 강도: ${scoreData.score_breakdown.pillar_strength}점`);
          console.log(`     - 계절 보너스: ${scoreData.score_breakdown.seasonal_bonus}점`);
          
          console.log(`   상위 적성 항목:`);
          scoreData.items.forEach((item, index) => {
            console.log(`     ${index + 1}. ${item.name}: ${item.individual_score}점 (${item.affinity_reason})`);
          });
        });
        
        // 주흉 위험 분석
        console.log('\n⚠️ 주흉 카테고리 위험도 분석:');
        console.log('='.repeat(60));
        
        const negativeEntries = Object.entries(response.data.negative_scores)
          .filter(([_, scoreData]) => scoreData.base_score > 40)
          .sort((a, b) => b[1].base_score - a[1].base_score);
        
        if (negativeEntries.length > 0) {
          negativeEntries.forEach(([category, scoreData]) => {
            console.log(`\n⚠️ ${category} 카테고리:`);
            console.log(`   위험도: ${scoreData.base_score}점`);
            console.log(`   시점별 위험도: 오늘${scoreData.daily_score} | 이달${scoreData.monthly_score} | 올해${scoreData.yearly_score}`);
            console.log(`   신뢰도: ${(scoreData.confidence_level * 100).toFixed(1)}%`);
            
            console.log(`   주요 위험 항목:`);
            scoreData.items.forEach((item, index) => {
              console.log(`     ${index + 1}. ${item.name}: 위험도 ${item.individual_score}점`);
            });
          });
        } else {
          console.log('   현재 특별한 위험 요소는 발견되지 않았습니다.');
        }
        
        // 추천사항
        console.log('\n💡 맞춤형 추천사항:');
        console.log('='.repeat(50));
        
        if (response.data.recommendations.top_aptitudes.length > 0) {
          console.log('   🎯 추천 적성 분야:');
          response.data.recommendations.top_aptitudes.forEach((apt, index) => {
            console.log(`     ${index + 1}. ${apt.category}: ${apt.score}점 (신뢰도 ${(apt.confidence * 100).toFixed(0)}%)`);
            console.log(`        └ 이유: ${apt.reason}`);
          });
        }
        
        if (response.data.recommendations.caution_areas.length > 0) {
          console.log('   ⚠️ 주의 필요 분야:');
          response.data.recommendations.caution_areas.forEach((caution, index) => {
            console.log(`     ${index + 1}. ${caution.category}: 위험도 ${caution.risk_level}점`);
          });
        } else {
          console.log('   ⚠️ 특별히 주의할 분야가 없습니다.');
        }
        
        console.log('\n📈 시스템 정보:');
        console.log('='.repeat(40));
        console.log(`   버전: ${response.version}`);
        console.log(`   분석 시각: ${new Date(response.timestamp).toLocaleString('ko-KR')}`);
        
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