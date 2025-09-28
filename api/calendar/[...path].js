// Vercel serverless function for calendar API
const express = require('express');
const cors = require('cors');
const path = require('path');
const Database = require('better-sqlite3');

const app = express();

// CORS 설정
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database initialization
let db;
try {
  const dbPath = path.join('/tmp', 'saju.db');
  db = new Database(dbPath);

  // Create customers table if not exists
  db.exec(`
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      birth_date TEXT NOT NULL,
      birth_time TEXT NOT NULL,
      phone TEXT NOT NULL,
      lunar_solar TEXT DEFAULT 'solar',
      gender TEXT DEFAULT 'male',
      memo TEXT,
      saju_data TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
} catch (error) {
  console.error('Database initialization error:', error);
}

// Health check
app.get('/api/calendar/health', (req, res) => {
  res.json({ status: 'ok', message: 'Calendar service is running on Vercel' });
});

// Get customers
app.get('/api/calendar/customers', (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM customers';
    let countQuery = 'SELECT COUNT(*) as total FROM customers';
    const params = [];

    if (search) {
      query += ' WHERE name LIKE ? OR phone LIKE ?';
      countQuery += ' WHERE name LIKE ? OR phone LIKE ?';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY id DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const customers = db.prepare(query).all(...params);
    const totalResult = db.prepare(countQuery).get(...(search ? [`%${search}%`, `%${search}%`] : []));
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
      error: 'Failed to fetch customers',
      message: error.message
    });
  }
});

// Create customer
app.post('/api/calendar/customers', (req, res) => {
  try {
    const {
      name,
      birth_date,
      birth_time,
      phone,
      lunar_solar = 'solar',
      gender = 'male',
      memo,
      saju_data
    } = req.body;

    const stmt = db.prepare(`
      INSERT INTO customers (name, birth_date, birth_time, phone, lunar_solar, gender, memo, saju_data)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      name,
      birth_date,
      birth_time,
      phone,
      lunar_solar,
      gender,
      memo,
      JSON.stringify(saju_data)
    );

    const newCustomer = db.prepare('SELECT * FROM customers WHERE id = ?').get(result.lastInsertRowid);

    res.json({
      success: true,
      data: newCustomer
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create customer',
      message: error.message
    });
  }
});

// Get customer by ID
app.get('/api/calendar/customers/:id', (req, res) => {
  try {
    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id);

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
      error: 'Failed to fetch customer',
      message: error.message
    });
  }
});

// Update customer
app.put('/api/calendar/customers/:id', (req, res) => {
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
      UPDATE customers
      SET name = ?, birth_date = ?, birth_time = ?, phone = ?,
          lunar_solar = ?, gender = ?, memo = ?, saju_data = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    const result = stmt.run(
      name,
      birth_date,
      birth_time,
      phone,
      lunar_solar,
      gender,
      memo,
      JSON.stringify(saju_data),
      req.params.id
    );

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }

    const updatedCustomer = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id);

    res.json({
      success: true,
      data: updatedCustomer
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update customer',
      message: error.message
    });
  }
});

// Delete customer
app.delete('/api/calendar/customers/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM customers WHERE id = ?').run(req.params.id);

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
      error: 'Failed to delete customer',
      message: error.message
    });
  }
});

module.exports = app;