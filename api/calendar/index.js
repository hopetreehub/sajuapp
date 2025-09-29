// Calendar Service Serverless Function for Vercel
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Simple in-memory storage for demo (use database in production)
  const events = [];

  // Parse the URL path
  const { query } = req;
  const path = req.url.replace('/api/calendar', '');

  // Route handlers
  if (req.method === 'GET' && path === '') {
    return res.json({
      success: true,
      message: 'Calendar API is running',
      version: '1.0.0'
    });
  }

  if (req.method === 'GET' && path === '/events') {
    return res.json({
      success: true,
      data: events
    });
  }

  if (req.method === 'POST' && path === '/events') {
    const event = {
      id: Date.now().toString(),
      ...req.body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    events.push(event);
    return res.json({
      success: true,
      data: event
    });
  }

  if (req.method === 'PUT' && path.startsWith('/events/')) {
    const id = path.split('/')[2];
    const index = events.findIndex(e => e.id === id);
    if (index !== -1) {
      events[index] = {
        ...events[index],
        ...req.body,
        updated_at: new Date().toISOString()
      };
      return res.json({
        success: true,
        data: events[index]
      });
    }
    return res.status(404).json({
      success: false,
      error: 'Event not found'
    });
  }

  if (req.method === 'DELETE' && path.startsWith('/events/')) {
    const id = path.split('/')[2];
    const index = events.findIndex(e => e.id === id);
    if (index !== -1) {
      events.splice(index, 1);
      return res.json({
        success: true
      });
    }
    return res.status(404).json({
      success: false,
      error: 'Event not found'
    });
  }

  // Default 404
  return res.status(404).json({
    success: false,
    error: 'Not found'
  });
}