import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCustomers, Customer } from '@/services/customerApi';
import CustomerAddModal from './CustomerAddModal';

interface CustomerSelectorProps {
  onSelect: (customer: Customer | null) => void;
  selectedCustomer: Customer | null;
  showAddButton?: boolean;
}

export default function CustomerSelector({
  onSelect,
  selectedCustomer,
  showAddButton = true,
}: CustomerSelectorProps) {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showNoCustomersPrompt, setShowNoCustomersPrompt] = useState(false);

  const loadCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getCustomers(1, 100, searchQuery);
      setCustomers(response.data);
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  // 고객 데이터가 없을 때 프롬프트 표시
  useEffect(() => {
    if (!loading && customers.length === 0 && !selectedCustomer) {
      setShowNoCustomersPrompt(true);
    } else {
      setShowNoCustomersPrompt(false);
    }
  }, [loading, customers.length, selectedCustomer]);

  const handleSelect = (customer: Customer) => {
    // console.log('[CustomerSelector] 고객 선택됨:', customer);
    onSelect(customer);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClear = () => {
    onSelect(null);
    setSearchQuery('');
  };

  const handleCustomerAdded = (newCustomer: Customer) => {
    // console.log('[CustomerSelector] 새 고객 등록됨:', newCustomer);
    // 고객 목록 새로고침
    loadCustomers();
    // 새로 등록된 고객 자동 선택
    onSelect(newCustomer);
    // 모달 닫기
    setShowAddModal(false);
  };

  const handleAddButtonClick = () => {
    setShowAddModal(true);
    setIsOpen(false); // 드롭다운 닫기
  };

  // 고객이 없을 때 설정 페이지로 안내하는 UI
  if (showNoCustomersPrompt && !isOpen) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-700">
        <div className="text-center space-y-4">
          <div className="text-5xl mb-3">🔮</div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
            운세를 확인하려면 설정이 필요합니다
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            생년월일시 정보를 입력하여 맞춤 운세를 받아보세요
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
            <button
              onClick={() => navigate('/settings')}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg transition-all transform hover:scale-105 shadow-lg"
            >
              ⚙️ 설정하러 가기
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-purple-600 dark:text-purple-400 font-medium rounded-lg border-2 border-purple-300 dark:border-purple-600 transition-all"
            >
              ➕ 새 고객 등록
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          <div className="p-4 space-y-3">
            {/* 새고객 등록 버튼 */}
            {showAddButton && (
              <button
                onClick={handleAddButtonClick}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg
                         flex items-center justify-center gap-2 transition-colors"
              >
                ➕ 새 고객 등록
              </button>
            )}

            {/* 구분선 */}
            {showAddButton && (
              <div className="border-t border-gray-200 dark:border-gray-600"></div>
            )}

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

      {/* 새고객 등록 모달 */}
      <CustomerAddModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onCustomerAdded={handleCustomerAdded}
      />
    </div>
  );
}