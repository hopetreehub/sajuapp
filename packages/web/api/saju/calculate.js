// Mock Saju calculation API for Vercel deployment
export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  const { birth_date, birth_time, lunar_solar } = req.body;

  // Mock saju calculation result
  const mockSaju = {
    year: { gan: "경", ji: "오" },
    month: { gan: "기", ji: "축" },
    day: { gan: "을", ji: "묘" },
    time: { gan: "계", ji: "미" },
    ohHaengBalance: {
      "목": 25,
      "화": 13,
      "토": 38,
      "금": 13,
      "수": 13
    },
    sajuText: {
      year: "경오년",
      month: "기축월",
      day: "을묘일",
      time: "계미시"
    },
    fullSaju: "경오 기축 을묘 계미"
  };

  return res.status(200).json({
    success: true,
    data: mockSaju
  });
}