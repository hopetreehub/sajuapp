import { VercelRequest, VercelResponse } from '@vercel/node';

// 테스트용 임시 데이터
const mockCustomers = [
  {
    id: 1,
    name: '홍길동',
    birth_date: '1990-01-01',
    birth_time: '10:30',
    phone: '010-1234-5678',
    gender: 'male',
    lunar_solar: 'solar',
    memo: '테스트 고객 1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    name: '김영희',
    birth_date: '1992-05-15',
    birth_time: '14:20',
    phone: '010-9876-5432',
    gender: 'female',
    lunar_solar: 'lunar',
    memo: '테스트 고객 2',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        return await handleGetCustomers(req, res);
      case 'POST':
        return await handleCreateCustomer(req, res);
      case 'PUT':
        return await handleUpdateCustomer(req, res);
      case 'DELETE':
        return await handleDeleteCustomer(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return res.status(500).json({ error: errorMessage });
  }
}

async function handleGetCustomers(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;

  // 특정 고객 조회
  if (id) {
    const customerId = parseInt(id as string, 10);
    if (isNaN(customerId)) {
      return res.status(400).json({ error: 'Invalid customer ID' });
    }
    const customer = mockCustomers.find((c) => c.id === customerId);
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
    data: mockCustomers,
    total: mockCustomers.length,
  });
}

async function handleCreateCustomer(req: VercelRequest, res: VercelResponse) {
  const {
    name,
    birth_date,
    birth_time,
    phone,
    gender,
    lunar_solar,
    memo,
  } = req.body;

  // 필수 필드 체크
  if (!name || !birth_date || !birth_time || !gender || !lunar_solar) {
    return res.status(400).json({
      error: 'Name, birth_date, birth_time, gender, and lunar_solar are required',
    });
  }

  // Gender 검증
  if (!['male', 'female'].includes(gender)) {
    return res.status(400).json({ error: 'gender must be male or female' });
  }

  // Lunar/Solar 검증
  if (!['lunar', 'solar'].includes(lunar_solar)) {
    return res.status(400).json({ error: 'lunar_solar must be lunar or solar' });
  }

  const newCustomer = {
    id: mockCustomers.length + 1,
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

  mockCustomers.push(newCustomer);

  return res.status(201).json({
    success: true,
    data: newCustomer,
  });
}

async function handleUpdateCustomer(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;
  const updates = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Customer ID is required' });
  }

  const customerId = parseInt(id as string, 10);
  if (isNaN(customerId)) {
    return res.status(400).json({ error: 'Invalid customer ID' });
  }

  const customerIndex = mockCustomers.findIndex((c) => c.id === customerId);

  if (customerIndex === -1) {
    return res.status(404).json({ error: 'Customer not found' });
  }

  const updatedCustomer = {
    ...mockCustomers[customerIndex],
    ...updates,
    updated_at: new Date().toISOString(),
  };

  mockCustomers[customerIndex] = updatedCustomer;

  return res.status(200).json({
    success: true,
    data: updatedCustomer,
  });
}

async function handleDeleteCustomer(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Customer ID is required' });
  }

  const customerId = parseInt(id as string, 10);
  if (isNaN(customerId)) {
    return res.status(400).json({ error: 'Invalid customer ID' });
  }

  const customerIndex = mockCustomers.findIndex((c) => c.id === customerId);

  if (customerIndex === -1) {
    return res.status(404).json({ error: 'Customer not found' });
  }

  const deletedCustomer = mockCustomers[customerIndex];
  mockCustomers.splice(customerIndex, 1);

  return res.status(200).json({
    success: true,
    data: deletedCustomer,
  });
}
