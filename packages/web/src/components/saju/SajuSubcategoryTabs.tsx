import React from 'react';
import { SajuSubcategory } from '@/types/sajuRadar';

interface SajuSubcategoryTabsProps {
  subcategories: SajuSubcategory[]
  selectedSubcategory: string
  onSubcategoryChange: (subcategoryId: string) => void
}

export default function SajuSubcategoryTabs({
  subcategories,
  selectedSubcategory,
  onSubcategoryChange,
}: SajuSubcategoryTabsProps) {
  return (
    <div className="mb-6">
      <div className="flex overflow-x-auto gap-2 pb-2">
        {subcategories.map(sub => (
          <button
            key={sub.id}
            onClick={() => onSubcategoryChange(sub.id)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors duration-200 font-medium ${
              selectedSubcategory === sub.id
                ? 'bg-purple-500 text-white shadow-md'
                : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
            }`}
          >
            {sub.name}
            <span className="ml-2 text-xs opacity-75">
              ({sub.items.length})
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}