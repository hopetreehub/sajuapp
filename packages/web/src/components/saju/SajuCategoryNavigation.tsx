import React from 'react';
import { SajuRadarCategory } from '@/types/sajuRadar';

interface SajuCategoryNavigationProps {
  categories: SajuRadarCategory[]
  selectedCategory: string
  onCategoryChange: (categoryId: string) => void
}

export default function SajuCategoryNavigation({
  categories,
  selectedCategory,
  onCategoryChange,
}: SajuCategoryNavigationProps) {
  return (
    <div className="mb-8">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9 gap-4">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`p-4 rounded-xl border-2 transition-all duration-200 ${
              selectedCategory === category.id
                ? 'border-purple-500 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 shadow-lg'
                : 'border-gray-200 dark:border-gray-600 hover:border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/10 bg-white dark:bg-gray-700'
            }`}
          >
            <div className="text-center">
              <div className="text-3xl mb-2">{category.icon}</div>
              <h3 className="font-bold text-lg mb-1">{category.name}</h3>
              <p className={`text-sm mt-1 ${
                selectedCategory === category.id 
                  ? 'text-purple-600 dark:text-purple-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`}>
                {category.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}