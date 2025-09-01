import React from 'react';
import { Tag } from '@/services/api';

interface TagChipProps {
  tag: Tag;
  onDelete?: () => void;
  onClick?: () => void;
  size?: 'small' | 'medium' | 'large';
  deletable?: boolean;
}

const TagChip: React.FC<TagChipProps> = ({
  tag,
  onDelete,
  onClick,
  size = 'medium',
  deletable = false,
}) => {
  const sizeClasses = {
    small: 'text-xs px-2 py-0.5',
    medium: 'text-sm px-3 py-1',
    large: 'text-base px-4 py-2',
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.();
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1 rounded-full font-medium
        ${sizeClasses[size]}
        ${onClick ? 'cursor-pointer hover:opacity-80' : ''}
        transition-opacity
      `}
      style={{
        backgroundColor: `${tag.color}20`,
        color: tag.color,
        border: `1px solid ${tag.color}40`,
      }}
      onClick={onClick}
    >
      <span>{tag.name}</span>
      {deletable && onDelete && (
        <button
          className="ml-1 hover:opacity-60 focus:outline-none"
          onClick={handleDelete}
          aria-label={`Remove ${tag.name} tag`}
        >
          <svg
            className="w-3 h-3"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </span>
  );
};

export default TagChip;