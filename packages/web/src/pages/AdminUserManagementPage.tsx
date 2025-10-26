import React, { useState, useEffect } from 'react';
import { useAuthStore, User } from '@/stores/authStore';
import { useNavigate } from 'react-router-dom';

interface UserListResponse {
  success: boolean;
  users: User[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

const AdminUserManagementPage: React.FC = () => {
  const { user: currentUser, token } = useAuthStore();
  const navigate = useNavigate();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'suspended'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  // 관리자 권한 체크
  useEffect(() => {
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'super_admin')) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  // 사용자 목록 로드
  const loadUsers = async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('approval_status', filter);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/adminUsers?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data: UserListResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.success ? '사용자 목록을 불러올 수 없습니다.' : '권한이 없습니다.');
      }

      setUsers(data.users);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, searchTerm, token]);

  // 사용자 승인
  const handleApprove = async (userId: number) => {
    if (!token || !confirm('이 사용자를 승인하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/adminUsers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'approve', userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '승인에 실패했습니다.');
      }

      alert('사용자가 승인되었습니다.');
      loadUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // 사용자 거부 모달 열기
  const openRejectModal = (user: User) => {
    setSelectedUser(user);
    setRejectReason('');
    setShowRejectModal(true);
  };

  // 사용자 거부
  const handleReject = async () => {
    if (!token || !selectedUser || !rejectReason.trim()) {
      alert('거부 사유를 입력해주세요.');
      return;
    }

    try {
      const response = await fetch(`/api/adminUsers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'reject', userId: selectedUser.id, reason: rejectReason }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '거부에 실패했습니다.');
      }

      alert('사용자가 거부되었습니다.');
      setShowRejectModal(false);
      setSelectedUser(null);
      loadUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // 사용자 정지
  const handleSuspend = async (userId: number) => {
    if (!token || !confirm('이 사용자를 정지하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/adminUsers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'suspend', userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '정지에 실패했습니다.');
      }

      alert('사용자가 정지되었습니다.');
      loadUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // 역할 변경
  const handleRoleChange = async (userId: number, newRole: 'user' | 'admin' | 'super_admin') => {
    if (!token || !confirm(`역할을 ${newRole}(으)로 변경하시겠습니까?`)) return;

    try {
      const response = await fetch(`/api/adminUsers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'change_role', userId, role: newRole }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '역할 변경에 실패했습니다.');
      }

      alert('역할이 변경되었습니다.');
      loadUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // 상태별 배지 색상
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'suspended':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 상태 한글 변환
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '승인 대기';
      case 'approved': return '승인됨';
      case 'rejected': return '거부됨';
      case 'suspended': return '정지됨';
      default: return status;
    }
  };


  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            사용자 관리
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            회원 승인, 거부, 정지 및 역할 관리
          </p>
        </div>

        {/* 필터 및 검색 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 상태 필터 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                상태 필터
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">전체</option>
                <option value="pending">승인 대기</option>
                <option value="approved">승인됨</option>
                <option value="rejected">거부됨</option>
                <option value="suspended">정지됨</option>
              </select>
            </div>

            {/* 검색 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                검색 (이메일/이름)
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="검색어 입력..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-6">
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* 사용자 목록 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    사용자
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    역할
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    가입일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    액션
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      사용자가 없습니다.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.username}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value as any)}
                          className="text-sm px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          disabled={user.id === currentUser?.id}
                        >
                          <option value="user">일반 사용자</option>
                          <option value="admin">관리자</option>
                          <option value="super_admin">슈퍼 관리자</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(user.approval_status)}`}>
                          {getStatusText(user.approval_status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {new Date(user.created_at).toLocaleDateString('ko-KR')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          {user.approval_status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(user.id)}
                                className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                              >
                                승인
                              </button>
                              <button
                                onClick={() => openRejectModal(user)}
                                className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                              >
                                거부
                              </button>
                            </>
                          )}
                          {user.approval_status === 'approved' && user.role !== 'admin' && user.role !== 'super_admin' && (
                            <button
                              onClick={() => handleSuspend(user.id)}
                              className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
                            >
                              정지
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 거부 모달 */}
      {showRejectModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              사용자 거부
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {selectedUser.username}({selectedUser.email})의 가입을 거부하는 이유를 입력해주세요.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="거부 사유를 입력하세요..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-4"
              rows={4}
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                취소
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                거부하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserManagementPage;
