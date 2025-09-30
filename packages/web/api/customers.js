// Mock customer data for Vercel deployment
const mockCustomers = [
  {
    id: 1,
    name: "홍길동",
    birth_date: "1990-01-01",
    birth_time: "12:00",
    phone: "010-1234-5678",
    lunar_solar: "solar",
    gender: "male",
    memo: "테스트 고객",
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    name: "김철수",
    birth_date: "1985-05-15",
    birth_time: "14:30",
    phone: "010-9876-5432",
    lunar_solar: "solar",
    gender: "male",
    memo: "샘플 데이터",
    created_at: new Date().toISOString()
  }
];

export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { method, query, body } = req;
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathSegments = url.pathname.split('/').filter(Boolean);

  // GET /api/customers - List all customers
  if (method === 'GET' && pathSegments.length === 2) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 20;
    const search = query.search || '';

    let filteredCustomers = mockCustomers;
    if (search) {
      filteredCustomers = mockCustomers.filter(c =>
        c.name.includes(search) || c.phone.includes(search)
      );
    }

    return res.status(200).json({
      success: true,
      data: filteredCustomers,
      total: filteredCustomers.length,
      page: page,
      totalPages: Math.ceil(filteredCustomers.length / limit)
    });
  }

  // GET /api/customers/:id - Get customer by ID
  if (method === 'GET' && pathSegments.length === 3) {
    const id = parseInt(pathSegments[2]);
    const customer = mockCustomers.find(c => c.id === id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: customer
    });
  }

  // POST /api/customers - Create new customer
  if (method === 'POST' && pathSegments.length === 2) {
    const newCustomer = {
      ...body,
      id: mockCustomers.length + 1,
      created_at: new Date().toISOString()
    };

    mockCustomers.push(newCustomer);

    return res.status(201).json({
      success: true,
      data: newCustomer
    });
  }

  // PUT /api/customers/:id - Update customer
  if (method === 'PUT' && pathSegments.length === 3) {
    const id = parseInt(pathSegments[2]);
    const index = mockCustomers.findIndex(c => c.id === id);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }

    mockCustomers[index] = {
      ...mockCustomers[index],
      ...body,
      id: id
    };

    return res.status(200).json({
      success: true,
      data: mockCustomers[index]
    });
  }

  // DELETE /api/customers/:id - Delete customer
  if (method === 'DELETE' && pathSegments.length === 3) {
    const id = parseInt(pathSegments[2]);
    const index = mockCustomers.findIndex(c => c.id === id);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }

    mockCustomers.splice(index, 1);

    return res.status(200).json({
      success: true,
      message: 'Customer deleted successfully'
    });
  }

  // GET /api/customers/search - Search customers
  if (method === 'GET' && pathSegments[2] === 'search') {
    const q = query.q || '';
    const results = mockCustomers.filter(c =>
      c.name.includes(q) || c.phone.includes(q)
    );

    return res.status(200).json({
      success: true,
      data: results
    });
  }

  return res.status(404).json({
    success: false,
    error: 'API endpoint not found'
  });
}