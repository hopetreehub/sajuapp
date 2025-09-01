import { useState, useEffect } from 'react';
import { getCustomers, Customer } from '@/services/customerApi';

interface CustomerSelectorProps {
  onSelect: (customer: Customer | null) => void;
  selectedCustomer: Customer | null;
}

export default function CustomerSelector({ onSelect, selectedCustomer }: CustomerSelectorProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, [searchQuery]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const response = await getCustomers(1, 100, searchQuery);
      setCustomers(response.data);
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (customer: Customer) => {
    onSelect(customer);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClear = () => {
    onSelect(null);
    setSearchQuery('');
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2 mb-4">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          고객 선택:
        </label>
        
        {selectedCustomer ? (
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
            <span className="text-blue-700 dark:text-blue-300">
              👤 {selectedCustomer.name} ({selectedCustomer.birth_date})
            </span>
            <button
              onClick={handleClear}
              className="text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                     rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            👤 고객 선택하기
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl 
                      border border-gray-200 dark:border-gray-700 z-50">
          <div className="p-4">
            <input
              type="text"
              placeholder="이름 또는 전화번호로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              autoFocus
            />
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">로딩 중...</div>
            ) : customers.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                등록된 고객이 없습니다
              </div>
            ) : (
              <div className="divide-y dark:divide-gray-700">
                {customers.map((customer) => (
                  <button
                    key={customer.id}
                    onClick={() => handleSelect(customer)}
                    className="w-full px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 
                             transition-colors text-left"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {customer.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {customer.birth_date} {customer.birth_time} · 
                          {customer.lunar_solar === 'lunar' ? '음력' : '양력'} · 
                          {customer.gender === 'male' ? '남' : '여'}
                        </div>
                      </div>
                      <div className="text-sm text-gray-400">
                        {customer.phone}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="p-2 border-t dark:border-gray-700">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full px-3 py-2 text-gray-600 dark:text-gray-400 
                       hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}