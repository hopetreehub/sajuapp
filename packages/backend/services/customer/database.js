import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'customers.db');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Initialize database schema
export function initDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create customers table
      db.run(`
        CREATE TABLE IF NOT EXISTS customers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          birth_date TEXT NOT NULL,
          birth_time TEXT NOT NULL,
          phone TEXT NOT NULL,
          lunar_solar TEXT CHECK(lunar_solar IN ('lunar', 'solar')) DEFAULT 'solar',
          gender TEXT CHECK(gender IN ('male', 'female')) NOT NULL,
          memo TEXT,
          saju_data TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(name, phone)
        )
      `, (err) => {
        if (err) {
          console.error('Error creating customers table:', err);
          reject(err);
        } else {
          console.log('Customers table ready');
        }
      });

      // Create indexes for better search performance
      db.run(`CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_customers_birth_date ON customers(birth_date)`);
      
      resolve();
    });
  });
}

// Database helper functions
export const dbOperations = {
  // Create customer
  createCustomer: (customer) => {
    return new Promise((resolve, reject) => {
      const { name, birth_date, birth_time, phone, lunar_solar, gender, memo, saju_data } = customer;
      const sql = `
        INSERT INTO customers (name, birth_date, birth_time, phone, lunar_solar, gender, memo, saju_data)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      db.run(sql, [name, birth_date, birth_time, phone, lunar_solar, gender, memo, JSON.stringify(saju_data)], 
        function(err) {
          if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
              reject(new Error('이미 등록된 고객입니다 (이름과 전화번호 중복)'));
            } else {
              reject(err);
            }
          } else {
            resolve({ id: this.lastID, ...customer });
          }
        }
      );
    });
  },

  // Get all customers with pagination
  getCustomers: (page = 1, limit = 20, search = '') => {
    return new Promise((resolve, reject) => {
      const offset = (page - 1) * limit;
      let sql = `
        SELECT id, name, birth_date, birth_time, phone, lunar_solar, gender, memo, created_at
        FROM customers
      `;
      let countSql = `SELECT COUNT(*) as total FROM customers`;
      let params = [];
      
      if (search) {
        const searchCondition = ` WHERE name LIKE ? OR phone LIKE ?`;
        sql += searchCondition;
        countSql += searchCondition;
        params = [`%${search}%`, `%${search}%`];
      }
      
      sql += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
      
      // Get total count
      db.get(countSql, params, (err, countResult) => {
        if (err) {
          reject(err);
          return;
        }
        
        // Get paginated data
        db.all(sql, [...params, limit, offset], (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve({
              data: rows,
              total: countResult.total,
              page,
              totalPages: Math.ceil(countResult.total / limit)
            });
          }
        });
      });
    });
  },

  // Get customer by ID
  getCustomerById: (id) => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT * FROM customers WHERE id = ?
      `;
      
      db.get(sql, [id], (err, row) => {
        if (err) {
          reject(err);
        } else if (!row) {
          reject(new Error('고객을 찾을 수 없습니다'));
        } else {
          // Parse saju_data from JSON string
          if (row.saju_data) {
            try {
              row.saju_data = JSON.parse(row.saju_data);
            } catch (e) {
              console.error('Error parsing saju_data:', e);
              row.saju_data = null;
            }
          }
          resolve(row);
        }
      });
    });
  },

  // Update customer
  updateCustomer: (id, customer) => {
    return new Promise((resolve, reject) => {
      const { name, birth_date, birth_time, phone, lunar_solar, gender, memo, saju_data } = customer;
      const sql = `
        UPDATE customers 
        SET name = ?, birth_date = ?, birth_time = ?, phone = ?, 
            lunar_solar = ?, gender = ?, memo = ?, saju_data = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      db.run(sql, 
        [name, birth_date, birth_time, phone, lunar_solar, gender, memo, 
         JSON.stringify(saju_data), id], 
        function(err) {
          if (err) {
            reject(err);
          } else if (this.changes === 0) {
            reject(new Error('고객을 찾을 수 없습니다'));
          } else {
            resolve({ id, ...customer });
          }
        }
      );
    });
  },

  // Delete customer
  deleteCustomer: (id) => {
    return new Promise((resolve, reject) => {
      const sql = `DELETE FROM customers WHERE id = ?`;
      
      db.run(sql, [id], function(err) {
        if (err) {
          reject(err);
        } else if (this.changes === 0) {
          reject(new Error('고객을 찾을 수 없습니다'));
        } else {
          resolve({ message: '고객이 삭제되었습니다' });
        }
      });
    });
  },

  // Search customers
  searchCustomers: (query) => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT id, name, birth_date, phone, gender
        FROM customers
        WHERE name LIKE ? OR phone LIKE ?
        ORDER BY name
        LIMIT 10
      `;
      
      db.all(sql, [`%${query}%`, `%${query}%`], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }
};

export default db;