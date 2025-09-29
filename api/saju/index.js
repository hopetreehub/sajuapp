// Saju Analysis Service Serverless Function for Vercel
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Parse the URL path
  const path = req.url.replace('/api/saju', '');

  // Route handlers
  if (req.method === 'GET' && path === '') {
    return res.json({
      success: true,
      message: 'Saju Analysis API is running',
      version: '1.0.0'
    });
  }

  // Get categories
  if (req.method === 'GET' && path === '/categories') {
    return res.json({
      success: true,
      message: '사주 카테고리 데이터',
      data: {
        positive: {
          "기본 능력": {
            icon: "💪",
            items: [
              { name: "리더십", weight: 85, confidence: 0.9 },
              { name: "창의력", weight: 78, confidence: 0.85 },
              { name: "소통 능력", weight: 82, confidence: 0.88 }
            ]
          },
          "재능": {
            icon: "⭐",
            items: [
              { name: "예술적 감각", weight: 75, confidence: 0.8 },
              { name: "분석력", weight: 88, confidence: 0.92 },
              { name: "직관력", weight: 79, confidence: 0.83 }
            ]
          }
        },
        negative: {
          "주의사항": {
            icon: "⚠️",
            items: [
              { name: "성급함", weight: 65, confidence: 0.7 },
              { name: "고집", weight: 70, confidence: 0.75 },
              { name: "걱정", weight: 60, confidence: 0.65 }
            ]
          }
        }
      }
    });
  }

  // Get comprehensive scores
  if (req.method === 'POST' && path === '/scores/comprehensive') {
    const { birth_date, birth_time, is_lunar } = req.body;

    return res.json({
      success: true,
      message: '종합 점수 분석 결과',
      data: {
        positive_scores: {
          "기본 능력": {
            category_name: "기본 능력",
            category_type: "positive",
            base_score: 82,
            daily_score: 85,
            monthly_score: 80,
            yearly_score: 83,
            items: [
              { name: "리더십", score: 85, confidence: 0.9 },
              { name: "창의력", score: 78, confidence: 0.85 },
              { name: "소통 능력", score: 82, confidence: 0.88 }
            ]
          }
        },
        negative_scores: {
          "주의사항": {
            category_name: "주의사항",
            category_type: "negative",
            base_score: 65,
            daily_score: 60,
            monthly_score: 70,
            yearly_score: 68,
            items: [
              { name: "성급함", score: 65, confidence: 0.7 },
              { name: "고집", score: 70, confidence: 0.75 }
            ]
          }
        },
        summary: {
          overall_fortune: 75,
          trend: "상승",
          recommendations: [
            "오늘은 새로운 도전을 시작하기 좋은 날입니다.",
            "대인관계에서 긍정적인 에너지가 흐르고 있습니다.",
            "재물운이 상승하고 있으니 투자를 고려해보세요."
          ]
        }
      }
    });
  }

  // Default 404
  return res.status(404).json({
    success: false,
    error: 'Not found'
  });
}