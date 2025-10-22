import React, { useState, useEffect } from 'react';
import { Tag, tagService } from '@/services/api';
import TagChip from './TagChip';

interface TagSelectorProps {
  selectedTags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
  placeholder?: string;
  allowCreate?: boolean;
}

const TagSelector: React.FC<TagSelectorProps> = ({
  selectedTags,
  onTagsChange,
  placeholder = '태그를 선택하세요',
  allowCreate = true,
}) => {
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#3B82F6');

  const predefinedColors = [
    '#3B82F6', // blue
    '#10B981', // green
    '#F59E0B', // yellow
    '#EF4444', // red
    '#8B5CF6', // purple
    '#EC4899', // pink
    '#6B7280', // gray
    '#F97316', // orange
  ];

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      setIsLoading(true);
      const tags = await tagService.getTags();
      setAvailableTags(Array.isArray(tags) ? tags : []);
    } catch (error) {
      console.error('Failed to load tags:', error);
      setAvailableTags([]); // 에러 시 빈 배열로 설정
    } finally {
      setIsLoading(false);
    }
  };

  const handleTagSelect = (tag: Tag) => {
    if (!selectedTags.find(t => t.id === tag.id)) {
      onTagsChange([...selectedTags, tag]);
    }
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleTagRemove = (tagId: string) => {
    onTagsChange(selectedTags.filter(t => t.id !== tagId));
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;

    try {
      setIsCreating(true);
      const newTag = await tagService.createTag({
        name: newTagName.trim(),
        color: newTagColor,
      });
      setAvailableTags([...availableTags, newTag]);
      handleTagSelect(newTag);
      setNewTagName('');
      setNewTagColor('#3B82F6');
    } catch (error) {
      console.error('Failed to create tag:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const filteredTags = (availableTags || []).filter(
    tag =>
      tag.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !selectedTags.find(t => t.id === tag.id),
  );

  return (
    <div className="relative">
      {/* Selected Tags */}
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedTags.map(tag => (
          <TagChip
            key={tag.id}
            tag={tag}
            size="small"
            deletable
            onDelete={() => handleTagRemove(tag.id)}
          />
        ))}
      </div>

      {/* Tag Selector */}
      <div className="relative">
        <button
          type="button"
          className="w-full px-3 py-2 text-left border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="text-gray-500 dark:text-gray-400">
            {selectedTags.length > 0 
              ? `${selectedTags.length}개 태그 선택됨`
              : placeholder
            }
          </span>
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
            {/* Search Input */}
            <div className="p-2 border-b border-gray-200 dark:border-gray-700">
              <input
                type="text"
                className="w-full px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="태그 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Tag List */}
            <div className="max-h-48 overflow-y-auto">
              {isLoading ? (
                <div className="p-3 text-center text-gray-500">로딩 중...</div>
              ) : filteredTags.length > 0 ? (
                filteredTags.map(tag => (
                  <button
                    key={tag.id}
                    type="button"
                    className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                    onClick={() => handleTagSelect(tag)}
                  >
                    <span
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="text-sm">{tag.name}</span>
                  </button>
                ))
              ) : (
                <div className="p-3 text-center text-gray-500 text-sm">
                  {searchTerm ? '일치하는 태그가 없습니다' : '사용 가능한 태그가 없습니다'}
                </div>
              )}
            </div>

            {/* Create New Tag */}
            {allowCreate && (
              <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="새 태그 이름"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex gap-1">
                    {predefinedColors.map(color => (
                      <button
                        key={color}
                        type="button"
                        className={`w-6 h-6 rounded-full border-2 ${
                          newTagColor === color 
                            ? 'border-gray-800 dark:border-gray-200' 
                            : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setNewTagColor(color)}
                      />
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  className="w-full px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleCreateTag}
                  disabled={!newTagName.trim() || isCreating}
                >
                  {isCreating ? '생성 중...' : '새 태그 만들기'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TagSelector;