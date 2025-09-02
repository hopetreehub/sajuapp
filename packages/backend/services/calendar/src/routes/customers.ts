import { Router, Request, Response } from 'express';
import path from 'path';
import Database from 'better-sqlite3';

const router = Router();

// Customer database path
const dbPath = path.join(__dirname, '../../../customer/customers.db');
const db = new Database(dbPath);

// Initialize database tables
db.exec(`
  CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    birth_date TEXT NOT NULL,
    birth_time TEXT NOT NULL,
    phone TEXT,
    lunar_solar TEXT DEFAULT 'solar',
    gender TEXT,
    memo TEXT,
    saju_data TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Get all customers
router.get('/', (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = (req.query.search as string) || '';
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM customers';
    let countQuery = 'SELECT COUNT(*) as total FROM customers';
    const params: any[] = [];

    if (search) {
      query += ' WHERE name LIKE ? OR phone LIKE ?';
      countQuery += ' WHERE name LIKE ? OR phone LIKE ?';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const customers = db.prepare(query).all(...params);
    const totalResult = db.prepare(countQuery).get(...(search ? [`%${search}%`, `%${search}%`] : [])) as any;
    const total = totalResult.total;

    res.json({
      success: true,
      data: customers,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch customers' 
    });
  }
});

// Get single customer
router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
    
    if (!customer) {
      return res.status(404).json({ 
        success: false, 
        error: 'Customer not found' 
      });
    }

    res.json({
      success: true,
      data: customer
    });
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch customer' 
    });
  }
});

// Create customer
router.post('/', (req: Request, res: Response) => {
  try {
    const {
      name,
      birth_date,
      birth_time,
      phone,
      lunar_solar,
      gender,
      memo,
      saju_data
    } = req.body;

    const stmt = db.prepare(`
      INSERT INTO customers (
        name, birth_date, birth_time, phone, 
        lunar_solar, gender, memo, saju_data
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      name,
      birth_date,
      birth_time,
      phone || null,
      lunar_solar || 'solar',
      gender || null,
      memo || null,
      saju_data ? JSON.stringify(saju_data) : null
    );

    const newCustomer = db.prepare('SELECT * FROM customers WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({
      success: true,
      data: newCustomer
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create customer' 
    });
  }
});

// Update customer
router.put('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      birth_date,
      birth_time,
      phone,
      lunar_solar,
      gender,
      memo,
      saju_data
    } = req.body;

    const stmt = db.prepare(`
      UPDATE customers SET
        name = ?,
        birth_date = ?,
        birth_time = ?,
        phone = ?,
        lunar_solar = ?,
        gender = ?,
        memo = ?,
        saju_data = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(
      name,
      birth_date,
      birth_time,
      phone || null,
      lunar_solar || 'solar',
      gender || null,
      memo || null,
      saju_data ? JSON.stringify(saju_data) : null,
      id
    );

    const updatedCustomer = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);

    res.json({
      success: true,
      data: updatedCustomer
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update customer' 
    });
  }
});

// Delete customer
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const stmt = db.prepare('DELETE FROM customers WHERE id = ?');
    const result = stmt.run(id);

    if (result.changes === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Customer not found' 
      });
    }

    res.json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete customer' 
    });
  }
});

export default router;