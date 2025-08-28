import React, { useState, useEffect } from 'react';
import { UserProfile } from '@/types/user';
import { SajuBirthInfo } from '@/types/saju';
import { 
  getAllUserProfiles, 
  addUserProfile, 
  setCurrentUser, 
  deleteUserProfile,
  formatBirthDate,
  formatDate 
} from '@/utils/userStorage';

interface UserSelectionPanelProps {
  currentUser: UserProfile | null;
  onUserSelect: (user: UserProfile) => void;
  onUserChange: () => void;
  alwaysShowAddButton?: boolean;  // 항상 추가 버튼 표시
  maxUsers?: number;              // 최대 사용자 수 (기본: 무제한)
}

const UserSelectionPanel: React.FC<UserSelectionPanelProps> = ({
  currentUser,
  onUserSelect,
  onUserChange,
  alwaysShowAddButton = true,
  maxUsers = Infinity
}) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [continuousAddMode, setContinuousAddMode] = useState(true);
  const [newUserBirth, setNewUserBirth] = useState<SajuBirthInfo>({
    year: new Date().getFullYear() - 30,
    month: 1,
    day: 1,
    hour: 12,
    minute: 0,
    isLunar: false
  });

  // 사용자 목록 로드
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const allUsers = getAllUserProfiles();
    setUsers(allUsers);
  };

  const handleAddUser = () => {
    if (!newUserName.trim()) {
      alert('이름을 입력해주세요.');
      return;
    }

    try {
      const newUser = addUserProfile(newUserName, newUserBirth);
      setUsers(prev => [newUser, ...prev]);
      onUserSelect(newUser);
      onUserChange();
      
      // 폼 초기화
      setNewUserName('');
      setNewUserBirth({
        year: new Date().getFullYear() - 30,
        month: 1,
        day: 1,
        hour: 12,
        minute: 0,
        isLunar: false
      });
      
      // 연속 입력 모드가 아니면 폼 닫기
      if (!continuousAddMode) {
        setShowAddForm(false);
      }
    } catch (error) {
      alert('사용자 추가에 실패했습니다.');
    }
  };

  const handleSelectUser = (user: UserProfile) => {
    const selectedUser = setCurrentUser(user.id);
    if (selectedUser) {
      onUserSelect(selectedUser);
      onUserChange();
    }
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    if (confirm(`${userName}님의 정보를 삭제하시겠습니까?`)) {
      if (deleteUserProfile(userId)) {
        loadUsers();
        if (currentUser?.id === userId) {
          const remainingUsers = users.filter(u => u.id !== userId);
          if (remainingUsers.length > 0) {
            handleSelectUser(remainingUsers[0]);
          } else {
            onUserChange();
          }
        }
      }
    }
  };

  // 필터링된 사용자 목록
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    `${user.birthInfo.year}${user.birthInfo.month}${user.birthInfo.day}`.includes(searchQuery)
  );

  // 추가 가능 여부 확인
  const canAddMore = users.length < maxUsers;

  return (
    <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600">
      {/* 헤더 */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              👥 사주 데이터 관리
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              총 {users.length}명 저장됨
            </p>
          </div>
          {(alwaysShowAddButton || canAddMore) && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-md transition-colors"
            >
              {showAddForm ? '취소' : '+ 추가'}
            </button>
          )}
        </div>
      </div>

      {/* 검색 영역 */}
      {users.length > 0 && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-600">
          <input
            type="text"
            placeholder="이름 또는 생년월일로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-md bg-white dark:bg-gray-600 text-gray-900 dark:text-white text-sm"
          />
        </div>
      )}

      {/* 새 사용자 추가 폼 */}
      {showAddForm && (
        <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                이름
              </label>
              <input
                type="text"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-md bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                placeholder="이름을 입력하세요"
              />
            </div>

            {/* 연속 입력 모드 체크박스 */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="continuousAddMode"
                checked={continuousAddMode}
                onChange={(e) => setContinuousAddMode(e.target.checked)}
                className="w-4 h-4 text-purple-600 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-500 rounded focus:ring-purple-500 focus:ring-2"
              />
              <label htmlFor="continuousAddMode" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                연속 입력 모드 (여러 사람 계속 추가)
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  년도
                </label>
                <input
                  type="number"
                  value={newUserBirth.year}
                  onChange={(e) => setNewUserBirth(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                  className="w-full px-2 py-1 border border-gray-300 dark:border-gray-500 rounded-md bg-white dark:bg-gray-600 text-gray-900 dark:text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  월
                </label>
                <select
                  value={newUserBirth.month}
                  onChange={(e) => setNewUserBirth(prev => ({ ...prev, month: parseInt(e.target.value) }))}
                  className="w-full px-2 py-1 border border-gray-300 dark:border-gray-500 rounded-md bg-white dark:bg-gray-600 text-gray-900 dark:text-white text-sm"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}월</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  일
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={newUserBirth.day}
                  onChange={(e) => setNewUserBirth(prev => ({ ...prev, day: parseInt(e.target.value) }))}
                  className="w-full px-2 py-1 border border-gray-300 dark:border-gray-500 rounded-md bg-white dark:bg-gray-600 text-gray-900 dark:text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  시
                </label>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={newUserBirth.hour}
                  onChange={(e) => setNewUserBirth(prev => ({ ...prev, hour: parseInt(e.target.value) }))}
                  className="w-full px-2 py-1 border border-gray-300 dark:border-gray-500 rounded-md bg-white dark:bg-gray-600 text-gray-900 dark:text-white text-sm"
                />
              </div>
            </div>

            <button
              onClick={handleAddUser}
              className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition-colors"
            >
              사용자 추가
            </button>
          </div>
        </div>
      )}

      {/* 사용자 목록 */}
      <div className="max-h-80 overflow-y-auto">
        {users.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-2">👤</div>
            <p>등록된 사용자가 없습니다.</p>
            <p className="text-sm mt-1">새 사용자를 추가해보세요.</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-2">🔍</div>
            <p>검색 결과가 없습니다.</p>
            <p className="text-sm mt-1">다른 키워드로 검색해보세요.</p>
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                  currentUser?.id === user.id
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-sm'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
                onClick={() => handleSelectUser(user)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {user.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatBirthDate(user.birthInfo)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      마지막 접근: {formatDate(user.lastAccessed)}
                    </p>
                    {user.analysisHistory.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {user.analysisHistory.slice(0, 3).map((analysis) => (
                          <span
                            key={analysis}
                            className="px-2 py-0.5 bg-gray-200 dark:bg-gray-600 text-xs rounded text-gray-600 dark:text-gray-300"
                          >
                            {analysis === 'fortune' ? '운세' : 
                             analysis === 'six_area' ? '6대' : 
                             analysis === 'seventeen' ? '17대' : '7대'}
                          </span>
                        ))}
                        {user.analysisHistory.length > 3 && (
                          <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-600 text-xs rounded text-gray-600 dark:text-gray-300">
                            +{user.analysisHistory.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteUser(user.id, user.name);
                    }}
                    className="ml-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    title="사용자 삭제"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserSelectionPanel;