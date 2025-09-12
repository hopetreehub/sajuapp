import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function DiaryPage() {
  const { date } = useParams();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [todos, setTodos] = useState<Array<{ id: string; text: string; completed: boolean }>>([]);
  const [todoInput, setTodoInput] = useState('');

  useEffect(() => {
    if (date) {
      setSelectedDate(new Date(date));
    }
  }, [date]);

  const moodEmojis = {
    1: { emoji: '😢', label: '매우 나쁨', color: 'text-red-500' },
    2: { emoji: '😕', label: '나쁨', color: 'text-orange-500' },
    3: { emoji: '😐', label: '보통', color: 'text-yellow-500' },
    4: { emoji: '🙂', label: '좋음', color: 'text-green-500' },
    5: { emoji: '😄', label: '매우 좋음', color: 'text-blue-500' },
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleAddTodo = () => {
    if (todoInput.trim()) {
      setTodos([...todos, { 
        id: Date.now().toString(), 
        text: todoInput.trim(), 
        completed: false, 
      }]);
      setTodoInput('');
    }
  };

  const handleToggleTodo = (id: string) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo,
    ));
  };

  const handleRemoveTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const handleSave = () => {
    // Save diary entry
    console.log({
      date: selectedDate,
      content,
      mood,
      tags,
      todos,
    });
    // Show success message
    alert('다이어리가 저장되었습니다!');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="bg-background rounded-lg shadow-sm border border-border p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {format(selectedDate, 'yyyy년 M월 d일', { locale: ko })}
              </h1>
              <p className="text-muted-foreground">
                {format(selectedDate, 'EEEE', { locale: ko })}
              </p>
            </div>
            <input
              type="date"
              value={format(selectedDate, 'yyyy-MM-dd')}
              onChange={(e) => {
                const newDate = new Date(e.target.value);
                setSelectedDate(newDate);
                navigate(`/diary/${format(newDate, 'yyyy-MM-dd')}`);
              }}
              className="px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-background text-foreground"
            />
          </div>

          {/* Fortune Preview (Placeholder) */}
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-4 bg-muted">
            <h3 className="text-sm font-semibold text-foreground mb-2">오늘의 운세</h3>
            <p className="text-sm text-muted-foreground">
              오늘은 새로운 시작을 하기에 좋은 날입니다. 긍정적인 에너지가 충만한 하루가 될 것입니다.
            </p>
          </div>
        </div>

        {/* Mood Selector */}
        <div className="bg-background rounded-lg shadow-sm border border-border p-6 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">오늘의 기분</h2>
          <div className="flex justify-around">
            {([1, 2, 3, 4, 5] as const).map((moodValue) => {
              const moodData = moodEmojis[moodValue];
              return (
                <button
                  key={moodValue}
                  onClick={() => setMood(moodValue)}
                  className={`
                    flex flex-col items-center p-3 rounded-lg transition-all
                    ${mood === moodValue 
                      ? 'bg-muted ring-2 ring-primary-500' 
                      : 'hover:bg-muted/50'
                    }
                  `}
                >
                  <span className={`text-3xl mb-1 ${moodData.color}`}>
                    {moodData.emoji}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {moodData.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content Editor */}
        <div className="bg-background rounded-lg shadow-sm border border-border p-6 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">일기 내용</h2>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="오늘은 어떤 하루였나요?"
            className="w-full h-64 p-4 border border-border rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-background text-foreground"
          />
        </div>

        {/* Tags */}
        <div className="bg-background rounded-lg shadow-sm border border-border p-6 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">태그</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary/20 text-primary border border-primary/30"
              >
                #{tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-2 text-primary hover:text-primary/80"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              placeholder="태그 추가 (Enter로 추가)"
              className="flex-1 px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-background text-foreground"
            />
            <button
              onClick={handleAddTag}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              추가
            </button>
          </div>
        </div>

        {/* Todo List */}
        <div className="bg-background rounded-lg shadow-sm border border-border p-6 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">오늘의 할일</h2>
          <div className="space-y-3 mb-4">
            {todos.map((todo) => (
              <div key={todo.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => handleToggleTodo(todo.id)}
                  className="w-4 h-4 text-primary rounded border-border focus:ring-primary/50"
                />
                <span className={`flex-1 ${todo.completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                  {todo.text}
                </span>
                <button
                  onClick={() => handleRemoveTodo(todo.id)}
                  className="text-muted-foreground hover:text-red-500 transition-colors"
                >
                  ×
                </button>
              </div>
            ))}
            {todos.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                할일을 추가해보세요
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={todoInput}
              onChange={(e) => setTodoInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTodo()}
              placeholder="할일 추가 (Enter로 추가)"
              className="flex-1 px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-background text-foreground"
            />
            <button
              onClick={handleAddTodo}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              추가
            </button>
          </div>
          
          {/* Todo Progress */}
          {todos.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>완료율</span>
                <span>{todos.filter(t => t.completed).length}/{todos.length} ({Math.round((todos.filter(t => t.completed).length / todos.length) * 100)}%)</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300" 
                  style={{ 
                    width: `${todos.length ? (todos.filter(t => t.completed).length / todos.length) * 100 : 0}%`, 
                  }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Linked Events (Placeholder) */}
        <div className="bg-background rounded-lg shadow-sm border border-border p-6 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">연결된 일정</h2>
          <p className="text-sm text-muted-foreground">
            이 날짜에 등록된 캘린더 일정이 여기에 표시됩니다.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={() => navigate('/diary')}
            className="px-6 py-2 border border-border text-foreground rounded-lg hover:bg-muted transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}