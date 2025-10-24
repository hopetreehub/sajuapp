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
  data: Omit<Customer, 'id' | 'created_at' | 'updated_at'>,
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
  data: Partial<Omit<Customer, 'id' | 'created_at' | 'updated_at'>>,
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

  updates.push('updated_at = NOW()');
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
    WHERE name ILIKE ${'%'}${name}${'%'}
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

// ==================== Events (캘린더 이벤트) ====================

/**
 * Event 타입 정의
 */
export interface Event {
  id: number;
  user_id: string;
  title: string;
  description?: string;
  start_time: string; // ISO 8601
  end_time: string; // ISO 8601
  all_day: boolean;
  location?: string;
  type: string;
  color: string;
  reminder_minutes?: number;
  created_at: string;
  updated_at: string;
}

/**
 * 모든 이벤트 조회 (특정 사용자)
 */
export async function getAllEvents(userId: string = 'default-user'): Promise<Event[]> {
  const { rows } = await sql<Event>`
    SELECT * FROM events
    WHERE user_id = ${userId}
    ORDER BY start_time ASC
  `;
  return rows;
}

/**
 * 특정 이벤트 조회
 */
export async function getEventById(id: number): Promise<Event | null> {
  const { rows } = await sql<Event>`
    SELECT * FROM events
    WHERE id = ${id}
  `;
  return rows[0] || null;
}

/**
 * 날짜 범위로 이벤트 조회
 */
export async function getEventsByDateRange(
  startDate: string,
  endDate: string,
  userId: string = 'default-user',
): Promise<Event[]> {
  const { rows } = await sql<Event>`
    SELECT * FROM events
    WHERE user_id = ${userId}
      AND start_time >= ${startDate}
      AND start_time <= ${endDate}
    ORDER BY start_time ASC
  `;
  return rows;
}

/**
 * 이벤트 생성
 */
export async function createEvent(
  data: Omit<Event, 'id' | 'created_at' | 'updated_at'>,
): Promise<Event> {
  const { rows } = await sql<Event>`
    INSERT INTO events (
      user_id, title, description, start_time, end_time, all_day,
      location, type, color, reminder_minutes
    )
    VALUES (
      ${data.user_id || 'default-user'},
      ${data.title},
      ${data.description || null},
      ${data.start_time},
      ${data.end_time},
      ${data.all_day || false},
      ${data.location || null},
      ${data.type || 'event'},
      ${data.color || '#3B82F6'},
      ${data.reminder_minutes || null}
    )
    RETURNING *
  `;
  return rows[0];
}

/**
 * 이벤트 업데이트
 */
export async function updateEvent(
  id: number,
  data: Partial<Omit<Event, 'id' | 'created_at' | 'updated_at'>>,
): Promise<Event | null> {
  const updates: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (data.title !== undefined) {
    updates.push(`title = $${paramIndex++}`);
    values.push(data.title);
  }
  if (data.description !== undefined) {
    updates.push(`description = $${paramIndex++}`);
    values.push(data.description);
  }
  if (data.start_time !== undefined) {
    updates.push(`start_time = $${paramIndex++}`);
    values.push(data.start_time);
  }
  if (data.end_time !== undefined) {
    updates.push(`end_time = $${paramIndex++}`);
    values.push(data.end_time);
  }
  if (data.all_day !== undefined) {
    updates.push(`all_day = $${paramIndex++}`);
    values.push(data.all_day);
  }
  if (data.location !== undefined) {
    updates.push(`location = $${paramIndex++}`);
    values.push(data.location);
  }
  if (data.type !== undefined) {
    updates.push(`type = $${paramIndex++}`);
    values.push(data.type);
  }
  if (data.color !== undefined) {
    updates.push(`color = $${paramIndex++}`);
    values.push(data.color);
  }
  if (data.reminder_minutes !== undefined) {
    updates.push(`reminder_minutes = $${paramIndex++}`);
    values.push(data.reminder_minutes);
  }

  if (updates.length === 0) {
    return getEventById(id);
  }

  updates.push('updated_at = NOW()');
  values.push(id);

  const query = `
    UPDATE events
    SET ${updates.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING *
  `;

  const { rows } = await sql.query<Event>(query, values);
  return rows[0] || null;
}

/**
 * 이벤트 삭제
 */
export async function deleteEvent(id: number): Promise<Event | null> {
  const { rows } = await sql<Event>`
    DELETE FROM events
    WHERE id = ${id}
    RETURNING *
  `;
  return rows[0] || null;
}

// ==================== Diaries (일기) ====================

/**
 * Diary 타입 정의
 */
export interface Diary {
  id: number;
  user_id: string;
  date: string; // YYYY-MM-DD
  content: string;
  mood?: string;
  weather?: string;
  tags: string[]; // PostgreSQL array
  images: string[]; // PostgreSQL array
  created_at: string;
  updated_at: string;
}

/**
 * 모든 일기 조회 (특정 사용자)
 */
export async function getAllDiaries(userId: string = 'default-user'): Promise<Diary[]> {
  const { rows } = await sql<Diary>`
    SELECT * FROM diaries
    WHERE user_id = ${userId}
    ORDER BY date DESC
  `;
  return rows;
}

/**
 * 특정 일기 조회
 */
export async function getDiaryById(id: number): Promise<Diary | null> {
  const { rows } = await sql<Diary>`
    SELECT * FROM diaries
    WHERE id = ${id}
  `;
  return rows[0] || null;
}

/**
 * 날짜로 일기 조회 (하루에 하나만 존재)
 */
export async function getDiaryByDate(
  date: string,
  userId: string = 'default-user',
): Promise<Diary | null> {
  const { rows } = await sql<Diary>`
    SELECT * FROM diaries
    WHERE user_id = ${userId} AND date = ${date}
  `;
  return rows[0] || null;
}

/**
 * 태그로 일기 검색
 */
export async function getDiariesByTag(
  tag: string,
  userId: string = 'default-user',
): Promise<Diary[]> {
  const { rows } = await sql<Diary>`
    SELECT * FROM diaries
    WHERE user_id = ${userId}
      AND tags @> ARRAY[${tag}]::text[]
    ORDER BY date DESC
  `;
  return rows;
}

/**
 * 일기 생성
 */
export async function createDiary(
  data: Omit<Diary, 'id' | 'created_at' | 'updated_at'>,
): Promise<Diary> {
  // Convert arrays to PostgreSQL array format or null
  const tagsArray = data.tags && data.tags.length > 0 ? data.tags : null;
  const imagesArray = data.images && data.images.length > 0 ? data.images : null;

  const { rows } = await sql<Diary>`
    INSERT INTO diaries (
      user_id, date, content, mood, weather, tags, images
    )
    VALUES (
      ${data.user_id || 'default-user'},
      ${data.date},
      ${data.content},
      ${data.mood || null},
      ${data.weather || null},
      ${tagsArray},
      ${imagesArray}
    )
    RETURNING *
  `;
  return rows[0];
}

/**
 * 일기 업데이트
 */
export async function updateDiary(
  id: number,
  data: Partial<Omit<Diary, 'id' | 'user_id' | 'created_at' | 'updated_at'>>,
): Promise<Diary | null> {
  const updates: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (data.date !== undefined) {
    updates.push(`date = $${paramIndex++}`);
    values.push(data.date);
  }
  if (data.content !== undefined) {
    updates.push(`content = $${paramIndex++}`);
    values.push(data.content);
  }
  if (data.mood !== undefined) {
    updates.push(`mood = $${paramIndex++}`);
    values.push(data.mood);
  }
  if (data.weather !== undefined) {
    updates.push(`weather = $${paramIndex++}`);
    values.push(data.weather);
  }
  if (data.tags !== undefined) {
    updates.push(`tags = $${paramIndex++}::text[]`);
    values.push(data.tags);
  }
  if (data.images !== undefined) {
    updates.push(`images = $${paramIndex++}::text[]`);
    values.push(data.images);
  }

  if (updates.length === 0) {
    return getDiaryById(id);
  }

  updates.push('updated_at = NOW()');
  values.push(id);

  const query = `
    UPDATE diaries
    SET ${updates.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING *
  `;

  const { rows } = await sql.query<Diary>(query, values);
  return rows[0] || null;
}

/**
 * 일기 삭제
 */
export async function deleteDiary(id: number): Promise<Diary | null> {
  const { rows } = await sql<Diary>`
    DELETE FROM diaries
    WHERE id = ${id}
    RETURNING *
  `;
  return rows[0] || null;
}

// ==================== Tags (태그) ====================

/**
 * Tag 타입 정의
 */
export interface Tag {
  id: number;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
  updated_at: string;
}

/**
 * 모든 태그 조회 (특정 사용자)
 */
export async function getAllTags(userId: string = 'default-user'): Promise<Tag[]> {
  const { rows } = await sql<Tag>`
    SELECT * FROM tags
    WHERE user_id = ${userId}
    ORDER BY name ASC
  `;
  return rows;
}

/**
 * 특정 태그 조회
 */
export async function getTagById(id: number): Promise<Tag | null> {
  const { rows } = await sql<Tag>`
    SELECT * FROM tags
    WHERE id = ${id}
  `;
  return rows[0] || null;
}

/**
 * 태그 이름으로 조회
 */
export async function getTagByName(
  name: string,
  userId: string = 'default-user',
): Promise<Tag | null> {
  const { rows } = await sql<Tag>`
    SELECT * FROM tags
    WHERE user_id = ${userId} AND name = ${name}
  `;
  return rows[0] || null;
}

/**
 * 태그 생성 (중복 방지)
 */
export async function createTag(
  data: Omit<Tag, 'id' | 'created_at' | 'updated_at'>,
): Promise<Tag> {
  const { rows } = await sql<Tag>`
    INSERT INTO tags (user_id, name, color)
    VALUES (
      ${data.user_id || 'default-user'},
      ${data.name},
      ${data.color}
    )
    ON CONFLICT (user_id, name) DO UPDATE
    SET color = EXCLUDED.color
    RETURNING *
  `;
  return rows[0];
}

/**
 * 태그 업데이트
 */
export async function updateTag(
  id: number,
  data: Partial<Omit<Tag, 'id' | 'user_id' | 'created_at' | 'updated_at'>>,
): Promise<Tag | null> {
  const updates: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (data.name !== undefined) {
    updates.push(`name = $${paramIndex++}`);
    values.push(data.name);
  }
  if (data.color !== undefined) {
    updates.push(`color = $${paramIndex++}`);
    values.push(data.color);
  }

  if (updates.length === 0) {
    return getTagById(id);
  }

  updates.push('updated_at = NOW()');
  values.push(id);

  const query = `
    UPDATE tags
    SET ${updates.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING *
  `;

  const { rows } = await sql.query<Tag>(query, values);
  return rows[0] || null;
}

/**
 * 태그 삭제
 */
export async function deleteTag(id: number): Promise<Tag | null> {
  const { rows } = await sql<Tag>`
    DELETE FROM tags
    WHERE id = ${id}
    RETURNING *
  `;
  return rows[0] || null;
}

// ==================== Event-Tag Relationships ====================

/**
 * 이벤트에 태그 연결
 */
export async function addTagToEvent(eventId: number, tagId: number): Promise<void> {
  await sql`
    INSERT INTO event_tags (event_id, tag_id)
    VALUES (${eventId}, ${tagId})
    ON CONFLICT DO NOTHING
  `;
}

/**
 * 이벤트에서 태그 제거
 */
export async function removeTagFromEvent(eventId: number, tagId: number): Promise<void> {
  await sql`
    DELETE FROM event_tags
    WHERE event_id = ${eventId} AND tag_id = ${tagId}
  `;
}

/**
 * 이벤트의 모든 태그 조회
 */
export async function getTagsForEvent(eventId: number): Promise<Tag[]> {
  const { rows } = await sql<Tag>`
    SELECT t.*
    FROM tags t
    INNER JOIN event_tags et ON t.id = et.tag_id
    WHERE et.event_id = ${eventId}
    ORDER BY t.name ASC
  `;
  return rows;
}

/**
 * 태그가 있는 모든 이벤트 조회
 */
export async function getEventsForTag(tagId: number): Promise<Event[]> {
  const { rows } = await sql<Event>`
    SELECT e.*
    FROM events e
    INNER JOIN event_tags et ON e.id = et.event_id
    WHERE et.tag_id = ${tagId}
    ORDER BY e.start_time ASC
  `;
  return rows;
}
