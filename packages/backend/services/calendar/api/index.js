// Vercel serverless function entry point
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
  res.json({ status: 'ok', message: 'Calendar service is running' });
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

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Calendar API is running on Vercel!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.url}`
  });
});

module.exports = app;