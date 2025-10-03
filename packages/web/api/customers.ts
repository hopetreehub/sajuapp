import { VercelRequest, VercelResponse } from '@vercel/node';

// Customer 인터페이스
interface Customer {
  id: string;
  name: string;
  birth_date: string;
  birth_time: string;
  gender: 'male' | 'female';
  lunar_solar: 'lunar' | 'solar';
  notes?: string;
  saju_data?: unknown;
  created_at: string;
  updated_at: string;
}

// 임시 고객 데이터 (메모리에 저장)
const customers: Customer[] = [
  {
    id: '1',
    name: '박준수',
    birth_date: '1990-05-15',
    birth_time: '14:30',
    gender: 'male',
    lunar_solar: 'solar',
    notes: '사주 상담 고객',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },,
  {
    id: '2',
    name: '이정미',
    birth_date: '1988-11-22',
    birth_time: '09:15',
    gender: 'female',
    lunar_solar: 'lunar',
    notes: '궁합 상담 고객',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export default function handler(req: VercelRequest, res: VercelResponse) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // OPTIONS 요청 처리 (CORS preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        return handleGetCustomers(req, res);
      case 'POST':
        return handleCreateCustomer(req, res);
      case 'PUT':
        return handleUpdateCustomer(req, res);
      case 'DELETE':
        return handleDeleteCustomer(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

function handleGetCustomers(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;

  // 특정 고객 조회
  if (id) {
    const customer = customers.find(c => c.id === id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    return res.status(200).json({
      success: true,
      data: customer,
    });
  }

  // 모든 고객 조회
  return res.status(200).json({
    success: true,
    data: customers,
    total: customers.length,
  });
}

function handleCreateCustomer(req: VercelRequest, res: VercelResponse) {
  const {
    name,
    birth_date,
    birth_time,
    gender,
    lunar_solar,
    notes,
  } = req.body;

  if (!name || !birth_date || !birth_time || !gender || !lunar_solar) {
    return res.status(400).json({
      error: 'Name, birth_date, birth_time, gender, and lunar_solar are required',
    });
  }

  const newCustomer: Customer = {
    id: Date.now().toString(),
    name,
    birth_date,
    birth_time,
    gender,
    lunar_solar,
    notes: notes || '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  customers.push(newCustomer);

  return res.status(201).json({
    success: true,
    data: newCustomer,
  });
}

function handleUpdateCustomer(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;
  const updates = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Customer ID is required' });
  }

  const customerIndex = customers.findIndex(customer => customer.id === id);

  if (customerIndex === -1) {
    return res.status(404).json({ error: 'Customer not found' });
  }

  customers[customerIndex] = {
    ...customers[customerIndex],
    ...updates,
    updated_at: new Date().toISOString(),
  };

  return res.status(200).json({
    success: true,
    data: customers[customerIndex],
  });
}

function handleDeleteCustomer(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Customer ID is required' });
  }

  const customerIndex = customers.findIndex(customer => customer.id === id);

  if (customerIndex === -1) {
    return res.status(404).json({ error: 'Customer not found' });
  }

  const deletedCustomer = customers.splice(customerIndex, 1)[0];

  return res.status(200).json({
    success: true,
    data: deletedCustomer,
  });
}