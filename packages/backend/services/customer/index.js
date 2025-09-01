import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { initDatabase, dbOperations } from './database.js';
import { calculateSaju, calculateDaeun, calculateSaeun } from './sajuCalculator.js';

const app = express();
const PORT = process.env.CUSTOMER_SERVICE_PORT || 4002;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize database
await initDatabase();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'customer-service' });
});

// Create customer
app.post('/api/customers', async (req, res) => {
  try {
    const { name, birth_date, birth_time, phone, lunar_solar, gender, memo } = req.body;
    
    // Validate required fields
    if (!name || !birth_date || !birth_time || !phone || !gender) {
      return res.status(400).json({ 
        error: '필수 항목을 모두 입력해주세요' 
      });
    }
    
    // Calculate saju
    const saju_data = calculateSaju(birth_date, birth_time, lunar_solar === 'lunar');
    
    // Create customer
    const customer = await dbOperations.createCustomer({
      name,
      birth_date,
      birth_time,
      phone,
      lunar_solar: lunar_solar || 'solar',
      gender,
      memo: memo || '',
      saju_data
    });
    
    res.status(201).json({
      success: true,
      data: customer
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(400).json({ 
      error: error.message || '고객 등록 중 오류가 발생했습니다' 
    });
  }
});

// Get all customers with pagination
app.get('/api/customers', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    
    const result = await dbOperations.getCustomers(page, limit, search);
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ 
      error: '고객 목록 조회 중 오류가 발생했습니다' 
    });
  }
});

// Get customer by ID
app.get('/api/customers/:id', async (req, res) => {
  try {
    const customer = await dbOperations.getCustomerById(req.params.id);
    
    // Add current daeun and saeun
    if (customer.saju_data) {
      const currentYear = new Date().getFullYear();
      customer.daeun = calculateDaeun(customer.saju_data, currentYear);
      customer.saeun = calculateSaeun(currentYear);
    }
    
    res.json({
      success: true,
      data: customer
    });
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(404).json({ 
      error: error.message || '고객을 찾을 수 없습니다' 
    });
  }
});

// Update customer
app.put('/api/customers/:id', async (req, res) => {
  try {
    const { name, birth_date, birth_time, phone, lunar_solar, gender, memo } = req.body;
    
    // Recalculate saju if birth info changed
    const saju_data = calculateSaju(birth_date, birth_time, lunar_solar === 'lunar');
    
    const customer = await dbOperations.updateCustomer(req.params.id, {
      name,
      birth_date,
      birth_time,
      phone,
      lunar_solar,
      gender,
      memo,
      saju_data
    });
    
    res.json({
      success: true,
      data: customer
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(400).json({ 
      error: error.message || '고객 정보 수정 중 오류가 발생했습니다' 
    });
  }
});

// Delete customer
app.delete('/api/customers/:id', async (req, res) => {
  try {
    const result = await dbOperations.deleteCustomer(req.params.id);
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(404).json({ 
      error: error.message || '고객 삭제 중 오류가 발생했습니다' 
    });
  }
});

// Search customers (for autocomplete)
app.get('/api/customers/search', async (req, res) => {
  try {
    const query = req.query.q || '';
    
    if (query.length < 2) {
      return res.json({
        success: true,
        data: []
      });
    }
    
    const customers = await dbOperations.searchCustomers(query);
    
    res.json({
      success: true,
      data: customers
    });
  } catch (error) {
    console.error('Error searching customers:', error);
    res.status(500).json({ 
      error: '고객 검색 중 오류가 발생했습니다' 
    });
  }
});

// Calculate saju for given birth info (without saving)
app.post('/api/saju/calculate', async (req, res) => {
  try {
    const { birth_date, birth_time, lunar_solar } = req.body;
    
    if (!birth_date || !birth_time) {
      return res.status(400).json({ 
        error: '생년월일과 시간을 입력해주세요' 
      });
    }
    
    const sajuData = calculateSaju(birth_date, birth_time, lunar_solar === 'lunar');
    const currentYear = new Date().getFullYear();
    
    res.json({
      success: true,
      data: {
        saju: sajuData,
        daeun: calculateDaeun(sajuData, currentYear),
        saeun: calculateSaeun(currentYear)
      }
    });
  } catch (error) {
    console.error('Error calculating saju:', error);
    res.status(500).json({ 
      error: '사주 계산 중 오류가 발생했습니다' 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Customer service is running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('  GET    /api/customers        - Get all customers');
  console.log('  POST   /api/customers        - Create customer');
  console.log('  GET    /api/customers/:id    - Get customer by ID');
  console.log('  PUT    /api/customers/:id    - Update customer');
  console.log('  DELETE /api/customers/:id    - Delete customer');
  console.log('  GET    /api/customers/search - Search customers');
  console.log('  POST   /api/saju/calculate   - Calculate saju');
});