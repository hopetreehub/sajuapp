import { VercelRequest, VercelResponse } from '@vercel/node';
import {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from './database/db';
import { applySecurity, validateInput } from '../lib/security';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 보안 미들웨어 적용 (CORS, Security Headers, Rate Limiting)
  if (!applySecurity(req, res)) {
    return; // 이미 응답이 전송됨
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

  // 필수 필드 체크
  if (!name || !birth_date || !birth_time || !gender || !lunar_solar) {
    return res.status(400).json({
      error: 'Name, birth_date, birth_time, gender, and lunar_solar are required',
    });
  }

  // 입력 검증
  const nameValidation = validateInput(name, 'name');
  if (!nameValidation.valid) {
    return res.status(400).json({ error: nameValidation.error });
  }

  const birthDateValidation = validateInput(birth_date, 'birth_date');
  if (!birthDateValidation.valid) {
    return res.status(400).json({ error: birthDateValidation.error });
  }

  const birthTimeValidation = validateInput(birth_time, 'birth_time');
  if (!birthTimeValidation.valid) {
    return res.status(400).json({ error: birthTimeValidation.error });
  }

  // Gender 검증
  if (!['male', 'female'].includes(gender)) {
    return res.status(400).json({ error: 'gender must be male or female' });
  }

  // Lunar/Solar 검증
  if (!['lunar', 'solar'].includes(lunar_solar)) {
    return res.status(400).json({ error: 'lunar_solar must be lunar or solar' });
  }

  const newCustomer = await createCustomer({
    name: nameValidation.sanitized || name,
    birth_date: birthDateValidation.sanitized || birth_date,
    birth_time: birthTimeValidation.sanitized || birth_time,
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