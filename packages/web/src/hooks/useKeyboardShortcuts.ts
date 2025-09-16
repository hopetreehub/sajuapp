import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

interface UseKeyboardShortcutsProps {
  onSearchFocus?: () => void;
}

export const useKeyboardShortcuts = ({ onSearchFocus }: UseKeyboardShortcutsProps = {}) => {
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+K 또는 Cmd+K (Mac)
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();

        // 검색 포커스 콜백이 있으면 실행
        if (onSearchFocus) {
          onSearchFocus();
        } else {
          // 검색 페이지로 이동
          navigate('/search');
        }
      }

      // Escape 키 - 검색 입력 클리어 또는 모달 닫기
      if (event.key === 'Escape') {
        // 현재 포커스된 검색 입력이 있으면 클리어
        const activeElement = document.activeElement as HTMLInputElement;
        if (activeElement && activeElement.type === 'text' && activeElement.placeholder?.includes('검색')) {
          activeElement.value = '';
          activeElement.blur();
        }
      }

      // / 키 - 빠른 검색 포커스 (Gmail 스타일)
      if (event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey) {
        // 현재 입력 필드에 포커스가 없을 때만
        const activeElement = document.activeElement;
        if (!(activeElement instanceof HTMLInputElement) &&
            !(activeElement instanceof HTMLTextAreaElement)) {
          event.preventDefault();

          if (onSearchFocus) {
            onSearchFocus();
          } else {
            navigate('/search');
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate, onSearchFocus]);

  return { searchInputRef };
};

export default useKeyboardShortcuts;