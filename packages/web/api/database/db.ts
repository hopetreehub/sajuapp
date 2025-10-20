/**
 * Vercel Postgres 데이터베이스 연결
 *
 * @see https://vercel.com/docs/storage/vercel-postgres
 * @author Claude Code
 * @version 1.0.0
 */

import { sql } from '@vercel/postgres';

/**
 * Customer 타입 정의
 */
export interface Customer {
  id: number;
  name: string;
  birth_date: string; // YYYY-MM-DD
  birth_time: string; // HH:MM:SS
  phone: string;
  gender: 'male' | 'female';
  lunar_solar: 'lunar' | 'solar';
  memo?: string;
  saju_data?: unknown; // JSONB
  created_at: string;
  updated_at: string;
}

/**
 * 모든 고객 조회
 */
export async function getAllCustomers(): Promise<Customer[]> {
  const { rows } = await sql<Customer>`
    SELECT * FROM customers
    ORDER BY created_at DESC
  `;
  return rows;
}

/**
 * 특정 고객 조회
 */
export async function getCustomerById(id: number): Promise<Customer | null> {
  const { rows } = await sql<Customer>`
    SELECT * FROM customers
    WHERE id = ${id}
  `;
  return rows[0] || null;
}

/**
 * 고객 생성
 */
export async function createCustomer(
  data: Omit<Customer, 'id' | 'created_at' | 'updated_at'>
): Promise<Customer> {
  const { rows } = await sql<Customer>`
    INSERT INTO customers (name, birth_date, birth_time, phone, gender, lunar_solar, memo, saju_data)
    VALUES (
      ${data.name},
      ${data.birth_date},
      ${data.birth_time},
      ${data.phone || ''},
      ${data.gender},
      ${data.lunar_solar},
      ${data.memo || ''},
      ${data.saju_data ? JSON.stringify(data.saju_data) : null}::jsonb
    )
    RETURNING *
  `;
  return rows[0];
}

/**
 * 고객 정보 업데이트
 */
export async function updateCustomer(
  id: number,
  data: Partial<Omit<Customer, 'id' | 'created_at' | 'updated_at'>>
): Promise<Customer | null> {
  const updates: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  // 동적으로 UPDATE 쿼리 생성
  if (data.name !== undefined) {
    updates.push(`name = $${paramIndex++}`);
    values.push(data.name);
  }
  if (data.birth_date !== undefined) {
    updates.push(`birth_date = $${paramIndex++}`);
    values.push(data.birth_date);
  }
  if (data.birth_time !== undefined) {
    updates.push(`birth_time = $${paramIndex++}`);
    values.push(data.birth_time);
  }
  if (data.phone !== undefined) {
    updates.push(`phone = $${paramIndex++}`);
    values.push(data.phone);
  }
  if (data.gender !== undefined) {
    updates.push(`gender = $${paramIndex++}`);
    values.push(data.gender);
  }
  if (data.lunar_solar !== undefined) {
    updates.push(`lunar_solar = $${paramIndex++}`);
    values.push(data.lunar_solar);
  }
  if (data.memo !== undefined) {
    updates.push(`memo = $${paramIndex++}`);
    values.push(data.memo);
  }
  if (data.saju_data !== undefined) {
    updates.push(`saju_data = $${paramIndex++}::jsonb`);
    values.push(JSON.stringify(data.saju_data));
  }

  if (updates.length === 0) {
    return getCustomerById(id);
  }

  updates.push(`updated_at = NOW()`);
  values.push(id);

  const query = `
    UPDATE customers
    SET ${updates.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING *
  `;

  const { rows } = await sql.query<Customer>(query, values);
  return rows[0] || null;
}

/**
 * 고객 삭제 (하드 삭제)
 */
export async function deleteCustomer(id: number): Promise<Customer | null> {
  const { rows } = await sql<Customer>`
    DELETE FROM customers
    WHERE id = ${id}
    RETURNING *
  `;
  return rows[0] || null;
}

/**
 * 이름으로 고객 검색
 */
export async function searchCustomersByName(name: string): Promise<Customer[]> {
  const { rows } = await sql<Customer>`
    SELECT * FROM customers
    WHERE name ILIKE ${'%' + name + '%'}
    ORDER BY created_at DESC
  `;
  return rows;
}

/**
 * 데이터베이스 연결 테스트
 */
export async function testConnection(): Promise<boolean> {
  try {
    await sql`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
}
