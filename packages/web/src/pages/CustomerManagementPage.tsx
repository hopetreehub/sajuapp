import { useState, useEffect } from 'react';
import { 
  getCustomers, 
  createCustomer, 
  updateCustomer, 
  deleteCustomer,
  Customer, 
} from '@/services/customerApi';

export default function CustomerManagementPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<Customer>({
    name: '',
    birth_date: '',
    birth_time: '',
    phone: '',
    lunar_solar: 'solar',
    gender: 'male',
    memo: '',
  });

  // Load customers
  useEffect(() => {
    loadCustomers();
  }, [currentPage, searchQuery]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const response = await getCustomers(currentPage, 20, searchQuery);
      setCustomers(response.data);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Error loading customers:', error);
      alert('고객 목록을 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingCustomer) {
        await updateCustomer(editingCustomer.id!, formData);
        alert('고객 정보가 수정되었습니다');
      } else {
        await createCustomer(formData);
        alert('고객이 등록되었습니다');
      }
      
      setIsFormOpen(false);
      setEditingCustomer(null);
      resetForm();
      loadCustomers();
    } catch (error: any) {
      alert(error.message || '저장 중 오류가 발생했습니다');
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      birth_date: customer.birth_date,
      birth_time: customer.birth_time,
      phone: customer.phone,
      lunar_solar: customer.lunar_solar,
      gender: customer.gender,
      memo: customer.memo || '',
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    
    try {
      await deleteCustomer(id);
      alert('고객이 삭제되었습니다');
      loadCustomers();
    } catch (error: any) {
      alert(error.message || '삭제 중 오류가 발생했습니다');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      birth_date: '',
      birth_time: '',
      phone: '',
      lunar_solar: 'solar',
      gender: 'male',
      memo: '',
    });
  };

  const openNewCustomerForm = () => {
    setEditingCustomer(null);
    resetForm();
    setIsFormOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              🗂️ 고객 관리
            </h1>
            <button
              onClick={openNewCustomerForm}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              ➕ 새 고객 등록
            </button>
          </div>

          {/* Search */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="🔍 이름 또는 전화번호로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Customer Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-gray-700 dark:text-gray-300">번호</th>
                  <th className="px-4 py-3 text-gray-700 dark:text-gray-300">이름</th>
                  <th className="px-4 py-3 text-gray-700 dark:text-gray-300">생년월일</th>
                  <th className="px-4 py-3 text-gray-700 dark:text-gray-300">생시</th>
                  <th className="px-4 py-3 text-gray-700 dark:text-gray-300">전화번호</th>
                  <th className="px-4 py-3 text-gray-700 dark:text-gray-300">음/양</th>
                  <th className="px-4 py-3 text-gray-700 dark:text-gray-300">성별</th>
                  <th className="px-4 py-3 text-gray-700 dark:text-gray-300">관리</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-500">
                      로딩 중...
                    </td>
                  </tr>
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-500">
                      등록된 고객이 없습니다
                    </td>
                  </tr>
                ) : (
                  customers.map((customer, index) => (
                    <tr key={customer.id} className="border-b dark:border-gray-700">
                      <td className="px-4 py-3 text-gray-900 dark:text-white">
                        {(currentPage - 1) * 20 + index + 1}
                      </td>
                      <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">
                        {customer.name}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                        {customer.birth_date}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                        {customer.birth_time}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                        {customer.phone}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                        {customer.lunar_solar === 'lunar' ? '음력' : '양력'}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                        {customer.gender === 'male' ? '남' : '여'}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleEdit(customer)}
                          className="text-blue-600 hover:text-blue-800 mr-3"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(customer.id!)}
                          className="text-red-600 hover:text-red-800"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6 space-x-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                ◀
              </button>
              
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 border rounded ${
                    currentPage === i + 1 
                      ? 'bg-blue-600 text-white' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                ▶
              </button>
            </div>
          )}
        </div>

        {/* Customer Form Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
                {editingCustomer ? '고객 정보 수정' : '새 고객 등록'}
              </h2>
              
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      이름 *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      생년월일 *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.birth_date}
                      onChange={(e) => setFormData({...formData, birth_date: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      생시 * (24시간 형식)
                    </label>
                    <input
                      type="time"
                      required
                      value={formData.birth_time}
                      onChange={(e) => setFormData({...formData, birth_time: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      전화번호 *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="010-1234-5678"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      음력/양력
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="solar"
                          checked={formData.lunar_solar === 'solar'}
                          onChange={(e) => setFormData({...formData, lunar_solar: 'solar'})}
                          className="mr-2"
                        />
                        양력
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="lunar"
                          checked={formData.lunar_solar === 'lunar'}
                          onChange={(e) => setFormData({...formData, lunar_solar: 'lunar'})}
                          className="mr-2"
                        />
                        음력
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      성별 *
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="male"
                          checked={formData.gender === 'male'}
                          onChange={(e) => setFormData({...formData, gender: 'male'})}
                          className="mr-2"
                        />
                        남
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="female"
                          checked={formData.gender === 'female'}
                          onChange={(e) => setFormData({...formData, gender: 'female'})}
                          className="mr-2"
                        />
                        여
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      메모
                    </label>
                    <textarea
                      value={formData.memo}
                      onChange={(e) => setFormData({...formData, memo: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setIsFormOpen(false);
                      setEditingCustomer(null);
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {editingCustomer ? '수정하기' : '등록하기'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}