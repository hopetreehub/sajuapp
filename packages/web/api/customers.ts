import { VercelRequest, VercelResponse } from '@vercel/node';

// Customer 인터페이스 (프론트엔드와 일치)
interface Customer {
  id: number; // string -> number로 변경
  name: string;
  birth_date: string;
  birth_time: string;
  phone: string;
  gender: 'male' | 'female';
  lunar_solar: 'lunar' | 'solar';
  memo?: string; // notes -> memo로 변경
  saju_data?: unknown;
  created_at: string;
  updated_at: string;
}

// 임시 고객 데이터 (메모리에 저장)
// TODO: 추후 SQLite 데이터베이스로 전환
const customers: Customer[] = [
  {
    id: 1,
    name: '박준수',
    birth_date: '1990-05-15',
    birth_time: '14:30',
    phone: '010-1234-5678',
    gender: 'male',
    lunar_solar: 'solar',
    memo: '사주 상담 고객',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    name: '이정미',
    birth_date: '1988-11-22',
    birth_time: '09:15',
    phone: '010-9876-5432',
    gender: 'female',
    lunar_solar: 'lunar',
    memo: '궁합 상담 고객',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 3,
    name: '최민호',
    birth_date: '1985-03-10',
    birth_time: '16:45',
    phone: '010-5555-1234',
    gender: 'male',
    lunar_solar: 'solar',
    memo: '귀문둔갑 상담',
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
    const customerId = parseInt(id as string, 10);
    if (isNaN(customerId)) {
      return res.status(400).json({ error: 'Invalid customer ID' });
    }
    const customer = customers.find(c => c.id === customerId);
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
    phone,
    gender,
    lunar_solar,
    memo,
  } = req.body;

  if (!name || !birth_date || !birth_time || !gender || !lunar_solar) {
    return res.status(400).json({
      error: 'Name, birth_date, birth_time, gender, and lunar_solar are required',
    });
  }

  // 새 고객 ID 생성 (기존 최대 ID + 1)
  const maxId = customers.length > 0 ? Math.max(...customers.map(c => c.id)) : 0;
  const newCustomer: Customer = {
    id: maxId + 1,
    name,
    birth_date,
    birth_time,
    phone: phone || '',
    gender,
    lunar_solar,
    memo: memo || '',
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

  const customerId = parseInt(id as string, 10);
  if (isNaN(customerId)) {
    return res.status(400).json({ error: 'Invalid customer ID' });
  }

  const customerIndex = customers.findIndex(customer => customer.id === customerId);

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

  const customerId = parseInt(id as string, 10);
  if (isNaN(customerId)) {
    return res.status(400).json({ error: 'Invalid customer ID' });
  }

  const customerIndex = customers.findIndex(customer => customer.id === customerId);

  if (customerIndex === -1) {
    return res.status(404).json({ error: 'Customer not found' });
  }

  const deletedCustomer = customers.splice(customerIndex, 1)[0];

  return res.status(200).json({
    success: true,
    data: deletedCustomer,
  });
}