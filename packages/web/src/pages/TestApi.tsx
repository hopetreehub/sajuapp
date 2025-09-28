import React, { useState } from 'react';

const TestApi: React.FC = () => {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // API URL 확인
  const API_BASE_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? '/api/calendar'
    : 'https://calendar-j3vjlsr7q-johns-projects-bf5e60f3.vercel.app/api/calendar';

  const testHealthCheck = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(`Error: ${error}`);
    }
    setLoading(false);
  };

  const testGetCustomers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/customers?page=1&limit=10`);
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(`Error: ${error}`);
    }
    setLoading(false);
  };

  const testCreateCustomer = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: '테스트 고객',
          birth_date: '1990-01-01',
          birth_time: '12:00',
          phone: '010-1234-5678',
          lunar_solar: 'solar',
          gender: 'male',
          memo: 'API 테스트',
        }),
      });
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(`Error: ${error}`);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">API 테스트 페이지</h1>

      <div className="mb-4 p-4 bg-gray-800 rounded">
        <p className="text-sm text-gray-400 mb-2">현재 호스트: {window.location.hostname}</p>
        <p className="text-sm text-gray-400">API URL: {API_BASE_URL}</p>
      </div>

      <div className="space-y-4 mb-6">
        <button
          onClick={testHealthCheck}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-50"
        >
          Health Check 테스트
        </button>

        <button
          onClick={testGetCustomers}
          disabled={loading}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded disabled:opacity-50 ml-4"
        >
          고객 목록 조회
        </button>

        <button
          onClick={testCreateCustomer}
          disabled={loading}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded disabled:opacity-50 ml-4"
        >
          고객 생성 테스트
        </button>
      </div>

      <div className="bg-gray-800 p-4 rounded">
        <h2 className="text-xl font-semibold mb-2">결과:</h2>
        <pre className="text-sm text-gray-300 whitespace-pre-wrap">
          {loading ? '로딩 중...' : result || '버튼을 클릭하여 API를 테스트하세요.'}
        </pre>
      </div>
    </div>
  );
};

export default TestApi;