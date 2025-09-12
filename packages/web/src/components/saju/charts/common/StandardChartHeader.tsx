import React from 'react';

interface StandardChartHeaderProps {
  title: string;
  description: string;
  birthDate?: string;
  icon?: string;
  className?: string;
}

const StandardChartHeader: React.FC<StandardChartHeaderProps> = ({
  title,
  description,
  birthDate,
  icon = '📊',
  className = '',
}) => {
  return (
    <div className={`mb-6 ${className}`}>
      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
        <span className="text-2xl">{icon}</span>
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
        {description}
      </p>
      {birthDate && (
        <p className="text-sm text-gray-500 dark:text-gray-500">
          📅 출생정보: {birthDate}
        </p>
      )}
    </div>
  );
};

export default StandardChartHeader;