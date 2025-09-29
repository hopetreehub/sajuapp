// Customer Service Serverless Function for Vercel
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Simple in-memory storage for demo
  const customers = [];

  // Parse the URL path
  const path = req.url.replace('/api/customers', '');

  // Route handlers
  if (req.method === 'GET' && path === '') {
    return res.json({
      success: true,
      message: 'Customer API is running',
      version: '1.0.0'
    });
  }

  if (req.method === 'GET' && path === '/customers') {
    return res.json({
      success: true,
      data: customers,
      total: customers.length,
      page: 1,
      totalPages: 1
    });
  }

  if (req.method === 'POST' && path === '/customers') {
    const customer = {
      id: Date.now(),
      ...req.body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    customers.push(customer);
    return res.json({
      success: true,
      data: customer
    });
  }

  if (req.method === 'PUT' && path.startsWith('/customers/')) {
    const id = parseInt(path.split('/')[2]);
    const index = customers.findIndex(c => c.id === id);
    if (index !== -1) {
      customers[index] = {
        ...customers[index],
        ...req.body,
        updated_at: new Date().toISOString()
      };
      return res.json({
        success: true,
        data: customers[index]
      });
    }
    return res.status(404).json({
      success: false,
      error: 'Customer not found'
    });
  }

  if (req.method === 'DELETE' && path.startsWith('/customers/')) {
    const id = parseInt(path.split('/')[2]);
    const index = customers.findIndex(c => c.id === id);
    if (index !== -1) {
      customers.splice(index, 1);
      return res.json({
        success: true,
        message: '고객이 삭제되었습니다.'
      });
    }
    return res.status(404).json({
      success: false,
      error: 'Customer not found'
    });
  }

  // Default 404
  return res.status(404).json({
    success: false,
    error: 'Not found'
  });
}