import { VercelRequest, VercelResponse } from '@vercel/node';

// Customer 인터페이스 (customers.ts와 동일)
interface Customer {
  id: number;
  name: string;
  birth_date: string;
  birth_time: string;
  phone: string;
  gender: 'male' | 'female';
  lunar_solar: 'lunar' | 'solar';
  memo?: string;
  saju_data?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// 임시 고객 데이터 (메모리에 저장) - customers.ts와 동일
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
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // OPTIONS 요청 처리 (CORS preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { method, query } = req;
  const id = parseInt(query.id as string, 10);

  if (!id || isNaN(id)) {
    return res.status(400).json({ error: 'Valid Customer ID is required' });
  }

  try {
    switch (method) {
      case 'GET':
        return handleGetCustomer(req, res, id);
      case 'PUT':
        return handleUpdateCustomer(req, res, id);
      case 'DELETE':
        return handleDeleteCustomer(req, res, id);
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('Customer API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

function handleGetCustomer(req: VercelRequest, res: VercelResponse, id: number) {
  const customer = customers.find(c => c.id === id);

  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }

  return res.status(200).json({
    success: true,
    data: customer,
  });
}

function handleUpdateCustomer(req: VercelRequest, res: VercelResponse, id: number) {
  const updates = req.body;
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

function handleDeleteCustomer(req: VercelRequest, res: VercelResponse, id: number) {
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