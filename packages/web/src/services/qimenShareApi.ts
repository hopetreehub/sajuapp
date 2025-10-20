import type { QimenChart } from '@/types/qimen';
import type { QimenContext } from '@/data/qimenContextWeights';

const API_BASE_URL = 'http://localhost:4020/api';

/**
 * 공유 응답 데이터
 */
export interface ShareResponse {
  id: number;
  uuid: string;
  share_url: string;
  short_url: string;
  created_at: string;
}

/**
 * 공유 데이터
 */
export interface ShareData {
  uuid: string;
  chart_data: QimenChart;
  date_time: string;
  customer_name?: string;
  customer_birth_date?: string;
  context: QimenContext;
  note?: string;
  tags?: string[];
  created_at: string;
  view_count: number;
}

/**
 * 귀문둔갑 차트 공유 생성
 */
export async function createQimenShare(data: {
  chart: QimenChart;
  dateTime: Date;
  customerName?: string;
  customerBirthDate?: string;
  context: QimenContext;
  note?: string;
  tags?: string[];
}): Promise<ShareResponse> {
  const response = await fetch(`${API_BASE_URL}/share`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chart_data: data.chart,
      date_time: data.dateTime.toISOString(),
      customer_name: data.customerName,
      customer_birth_date: data.customerBirthDate,
      context: data.context,
      note: data.note,
      tags: data.tags,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create share');
  }

  const result = await response.json();
  return result.data;
}

/**
 * 공유된 귀문둔갑 차트 조회
 */
export async function getQimenShare(uuid: string): Promise<ShareData> {
  const response = await fetch(`${API_BASE_URL}/share/${uuid}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to retrieve share');
  }

  const result = await response.json();
  return result.data;
}

/**
 * 공유 삭제
 */
export async function deleteQimenShare(uuid: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/share/${uuid}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete share');
  }
}

/**
 * 공유 통계 조회
 */
export async function getShareStats(): Promise<{
  total_shares: number;
  total_views: number;
  avg_views_per_share: number;
}> {
  const response = await fetch(`${API_BASE_URL}/shares/stats`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to retrieve stats');
  }

  const result = await response.json();
  return result.data;
}
