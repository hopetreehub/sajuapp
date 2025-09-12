import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { 
  CalendarIcon, 
  CheckCircleIcon, 
  BookOpenIcon, 
  TagIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { SearchResult } from '@/services/searchService';
import { truncateText, stripHtml } from '@/utils/searchUtils';

interface SearchResultItemProps {
  item: SearchResult
  onClick: (item: SearchResult) => void
}

export default function SearchResultItem({ item, onClick }: SearchResultItemProps) {
  // 타입별 아이콘
  const getIcon = () => {
    const iconClass = 'h-5 w-5 flex-shrink-0';
    
    switch (item.type) {
      case 'event':
        return <CalendarIcon className={`${iconClass} text-blue-500`} />;
      case 'todo':
        return <CheckCircleIcon className={`${iconClass} text-green-500`} />;
      case 'diary':
        return <BookOpenIcon className={`${iconClass} text-purple-500`} />;
      case 'tag':
        return <TagIcon className={`${iconClass} text-orange-500`} />;
      default:
        return <CalendarIcon className={`${iconClass} text-gray-500`} />;
    }
  };
  
  // 타입별 배경 색상
  const getTypeColor = () => {
    switch (item.type) {
      case 'event':
        return 'bg-blue-50 dark:bg-blue-900/20 border-l-blue-500';
      case 'todo':
        return 'bg-green-50 dark:bg-green-900/20 border-l-green-500';
      case 'diary':
        return 'bg-purple-50 dark:bg-purple-900/20 border-l-purple-500';
      case 'tag':
        return 'bg-orange-50 dark:bg-orange-900/20 border-l-orange-500';
      default:
        return 'bg-gray-50 dark:bg-gray-900/20 border-l-gray-500';
    }
  };
  
  // 날짜 포맷팅
  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    
    try {
      const date = new Date(dateString);
      return format(date, 'yyyy년 M월 d일', { locale: ko });
    } catch {
      return dateString;
    }
  };
  
  // 시간 포맷팅 (이벤트용)
  const formatTime = () => {
    if (item.type !== 'event' || !item.data) return null;
    
    try {
      const startTime = new Date(item.data.start_time);
      const endTime = new Date(item.data.end_time);
      
      if (item.data.all_day) {
        return '종일';
      }
      
      return `${format(startTime, 'HH:mm')} - ${format(endTime, 'HH:mm')}`;
    } catch {
      return null;
    }
  };
  
  // 우선순위 표시 (할일용)
  const getPriorityBadge = () => {
    if (item.type !== 'todo' || !item.data?.priority) return null;
    
    const priorityColors = {
      high: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      low: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    };
    
    const priorityLabels = {
      high: '높음',
      medium: '보통',
      low: '낮음',
    };
    
    const priority = item.data.priority as keyof typeof priorityColors;
    
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${priorityColors[priority] || priorityColors.low}`}>
        {priorityLabels[priority] || priority}
      </span>
    );
  };
  
  // 기분 이모지 (일기용)
  const getMoodEmoji = () => {
    if (item.type !== 'diary' || !item.data?.mood) return null;
    return (
      <span className="text-lg">{item.data.mood}</span>
    );
  };
  
  // 하이라이트된 텍스트 렌더링
  const renderHighlight = (text: string) => {
    if (!text) return null;
    return (
      <div 
        className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2"
        dangerouslySetInnerHTML={{ __html: text }}
      />
    );
  };
  
  return (
    <div 
      onClick={() => onClick(item)}
      className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer border-l-2 ${getTypeColor()} transition-colors`}
    >
      <div className="flex items-start gap-3">
        {/* 아이콘 */}
        <div className="mt-1">
          {getIcon()}
        </div>
        
        {/* 콘텐츠 */}
        <div className="flex-1 min-w-0">
          {/* 제목 */}
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
              {item.title}
            </h4>
            
            {/* 우선순위 배지 (할일) */}
            {getPriorityBadge()}
            
            {/* 기분 이모지 (일기) */}
            {getMoodEmoji()}
          </div>
          
          {/* 하이라이트된 내용 */}
          {item.highlight && renderHighlight(item.highlight)}
          
          {/* 일반 내용 (하이라이트가 없는 경우) */}
          {!item.highlight && item.content && (
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
              {truncateText(stripHtml(item.content), 100)}
            </div>
          )}
          
          {/* 메타 정보 */}
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
            {/* 날짜 */}
            {item.date && (
              <div className="flex items-center gap-1">
                <CalendarIcon className="h-3 w-3" />
                <span>{formatDate(item.date)}</span>
              </div>
            )}
            
            {/* 시간 (이벤트) */}
            {formatTime() && (
              <div className="flex items-center gap-1">
                <ClockIcon className="h-3 w-3" />
                <span>{formatTime()}</span>
              </div>
            )}
            
            {/* 관련도 점수 (개발 모드에서만) */}
            {process.env.NODE_ENV === 'development' && item.score && (
              <span className="bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded text-xs">
                점수: {item.score}
              </span>
            )}
          </div>
        </div>
        
        {/* 타입 라벨 */}
        <div className="text-xs text-gray-400 dark:text-gray-500 self-start">
          {item.type === 'event' && '일정'}
          {item.type === 'todo' && '할일'}
          {item.type === 'diary' && '일기'}
          {item.type === 'tag' && '태그'}
        </div>
      </div>
    </div>
  );
}