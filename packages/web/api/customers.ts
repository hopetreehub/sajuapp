import { VercelRequest, VercelResponse } from '@vercel/node';
import {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  type Customer,
} from './database/db';

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
    const customer = await getCustomerById(customerId);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    return res.status(200).json({
      success: true,
      data: customer,
    });
  }

  // 모든 고객 조회
  const customers = await getAllCustomers();
  return res.status(200).json({
    success: true,
    data: customers,
    total: customers.length,
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
    saju_data,
  } = req.body;

  if (!name || !birth_date || !birth_time || !gender || !lunar_solar) {
    return res.status(400).json({
      error: 'Name, birth_date, birth_time, gender, and lunar_solar are required',
    });
  }

  const newCustomer = await createCustomer({
    name,
    birth_date,
    birth_time,
    phone: phone || '',
    gender,
    lunar_solar,
    memo,
    saju_data,
  });

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

  const updatedCustomer = await updateCustomer(customerId, updates);

  if (!updatedCustomer) {
    return res.status(404).json({ error: 'Customer not found' });
  }

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

  const deletedCustomer = await deleteCustomer(customerId);

  if (!deletedCustomer) {
    return res.status(404).json({ error: 'Customer not found' });
  }

  return res.status(200).json({
    success: true,
    data: deletedCustomer,
  });
}