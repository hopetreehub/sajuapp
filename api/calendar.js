// Vercel serverless function - 통합 API
const cors = require('cors');

// CORS 미들웨어
const corsMiddleware = cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
});

// 간단한 인메모리 데이터베이스 (Vercel 임시 테스트용)
let customers = [];
let nextId = 1;

module.exports = (req, res) => {
  // CORS 적용
  corsMiddleware(req, res, () => {
    const { method, url } = req;

    console.log(`[API] ${method} ${url}`);

    // Health check
    if (url === '/api/calendar' || url === '/api/calendar/health') {
      return res.status(200).json({
        status: 'ok',
        message: 'Calendar service is running on Vercel Fullstack',
        timestamp: new Date().toISOString()
      });
    }

    // 고객 목록 조회
    if (url.startsWith('/api/calendar/customers') && method === 'GET') {
      // 특정 고객 조회
      const idMatch = url.match(/\/customers\/(\d+)/);
      if (idMatch) {
        const id = parseInt(idMatch[1]);
        const customer = customers.find(c => c.id === id);
        if (customer) {
          return res.status(200).json({
            success: true,
            data: customer
          });
        }
        return res.status(404).json({
          success: false,
          error: 'Customer not found'
        });
      }

      // 고객 목록
      const page = parseInt(req.query?.page) || 1;
      const limit = parseInt(req.query?.limit) || 20;
      const search = req.query?.search || '';

      let filteredCustomers = customers;
      if (search) {
        filteredCustomers = customers.filter(c =>
          c.name.includes(search) || c.phone.includes(search)
        );
      }

      const start = (page - 1) * limit;
      const end = start + limit;
      const paginatedCustomers = filteredCustomers.slice(start, end);

      return res.status(200).json({
        success: true,
        data: paginatedCustomers,
        total: filteredCustomers.length,
        page: page,
        totalPages: Math.ceil(filteredCustomers.length / limit)
      });
    }

    // 고객 생성
    if (url === '/api/calendar/customers' && method === 'POST') {
      const customer = {
        id: nextId++,
        ...req.body,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      customers.push(customer);

      return res.status(201).json({
        success: true,
        data: customer
      });
    }

    // 고객 수정
    if (url.match(/\/api\/calendar\/customers\/\d+/) && method === 'PUT') {
      const id = parseInt(url.split('/').pop());
      const index = customers.findIndex(c => c.id === id);

      if (index === -1) {
        return res.status(404).json({
          success: false,
          error: 'Customer not found'
        });
      }

      customers[index] = {
        ...customers[index],
        ...req.body,
        id: id,
        updated_at: new Date().toISOString()
      };

      return res.status(200).json({
        success: true,
        data: customers[index]
      });
    }

    // 고객 삭제
    if (url.match(/\/api\/calendar\/customers\/\d+/) && method === 'DELETE') {
      const id = parseInt(url.split('/').pop());
      const index = customers.findIndex(c => c.id === id);

      if (index === -1) {
        return res.status(404).json({
          success: false,
          error: 'Customer not found'
        });
      }

      customers.splice(index, 1);

      return res.status(200).json({
        success: true,
        message: 'Customer deleted successfully'
      });
    }

    // 404 처리
    return res.status(404).json({
      error: 'Not Found',
      message: `Cannot ${method} ${url}`,
      hint: 'Available endpoints: /api/calendar/health, /api/calendar/customers'
    });
  });
};