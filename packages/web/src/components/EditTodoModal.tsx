import { useState, useEffect } from 'react';
import { useCalendar } from '@/contexts/CalendarContext';
import { Todo } from '@/contexts/CalendarContext';

interface EditTodoModalProps {
  isOpen: boolean
  onClose: () => void
  todo: Todo | null
}

export default function EditTodoModal({ isOpen, onClose, todo }: EditTodoModalProps) {
  const { updateTodo } = useCalendar();
  const [text, setText] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [hasTime, setHasTime] = useState(false);
  const [startTime, setStartTime] = useState('');

  useEffect(() => {
    if (todo) {
      setText(todo.text);
      setPriority(todo.priority);
      setHasTime(todo.hasTime || false);
      setStartTime(todo.startTime || '');
    }
  }, [todo]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!todo || !text.trim()) return;

    updateTodo(todo.id, {
      text: text.trim(),
      priority,
      hasTime,
      startTime: hasTime ? startTime : undefined,
    });

    onClose();
  };

  if (!isOpen || !todo) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        {/* 백드롭 */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* 모달 콘텐츠 */}
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
          <h2 className="text-xl font-bold mb-4">할일 수정</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 할일 내용 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                할일 내용
              </label>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                placeholder="할일을 입력하세요"
                required
              />
            </div>

            {/* 우선순위 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                우선순위
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPriority('high')}
                  className={`flex-1 py-2 px-3 rounded-md ${
                    priority === 'high'
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  🔴 높음
                </button>
                <button
                  type="button"
                  onClick={() => setPriority('medium')}
                  className={`flex-1 py-2 px-3 rounded-md ${
                    priority === 'medium'
                      ? 'bg-yellow-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  🟡 보통
                </button>
                <button
                  type="button"
                  onClick={() => setPriority('low')}
                  className={`flex-1 py-2 px-3 rounded-md ${
                    priority === 'low'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  🟢 낮음
                </button>
              </div>
            </div>

            {/* 시간 설정 */}
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={hasTime}
                  onChange={(e) => setHasTime(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm font-medium">시간 지정</span>
              </label>
              {hasTime && (
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="mt-2 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                />
              )}
            </div>

            {/* 버튼 그룹 */}
            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                className="flex-1 py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                수정
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 px-4 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                취소
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}