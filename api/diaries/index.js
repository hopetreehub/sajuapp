// Diary Service Serverless Function for Vercel
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Simple in-memory storage for demo
  const diaries = [];

  // Parse the URL path
  const path = req.url.replace('/api/diaries', '');

  // Route handlers
  if (req.method === 'GET' && path === '') {
    return res.json({
      success: true,
      message: 'Diary API is running',
      version: '1.0.0'
    });
  }

  if (req.method === 'GET' && path === '/diaries') {
    return res.json({
      success: true,
      data: diaries
    });
  }

  if (req.method === 'POST' && path === '/diaries') {
    const diary = {
      id: Date.now().toString(),
      ...req.body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    diaries.push(diary);
    return res.json({
      success: true,
      data: diary
    });
  }

  if (req.method === 'PUT' && path.startsWith('/diaries/')) {
    const id = path.split('/')[2];
    const index = diaries.findIndex(d => d.id === id);
    if (index !== -1) {
      diaries[index] = {
        ...diaries[index],
        ...req.body,
        updated_at: new Date().toISOString()
      };
      return res.json({
        success: true,
        data: diaries[index]
      });
    }
    return res.status(404).json({
      success: false,
      error: 'Diary not found'
    });
  }

  if (req.method === 'DELETE' && path.startsWith('/diaries/')) {
    const id = path.split('/')[2];
    const index = diaries.findIndex(d => d.id === id);
    if (index !== -1) {
      diaries.splice(index, 1);
      return res.json({
        success: true,
        message: '일기가 삭제되었습니다.'
      });
    }
    return res.status(404).json({
      success: false,
      error: 'Diary not found'
    });
  }

  // Get diary by date
  if (req.method === 'GET' && path.startsWith('/by-date/')) {
    const date = path.split('/')[2];
    const diary = diaries.find(d => d.date === date);
    if (diary) {
      return res.json({
        success: true,
        data: diary
      });
    }
    return res.status(404).json({
      success: false,
      error: 'No diary found for this date'
    });
  }

  // Default 404
  return res.status(404).json({
    success: false,
    error: 'Not found'
  });
}