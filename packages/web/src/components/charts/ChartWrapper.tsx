import React from 'react'
import { motion } from 'framer-motion'

interface ChartWrapperProps {
  title: string
  subtitle?: string
  icon?: string
  children: React.ReactNode
  className?: string
  headerActions?: React.ReactNode
}

export const ChartWrapper: React.FC<ChartWrapperProps> = ({
  title,
  subtitle,
  icon = '📊',
  children,
  className = '',
  headerActions
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 ${className}`}
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
            <span className="mr-2">{icon}</span>
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>
        {headerActions && (
          <div className="flex items-center space-x-2">
            {headerActions}
          </div>
        )}
      </div>

      {/* 차트 내용 */}
      <div className="chart-content">
        {children}
      </div>
    </motion.div>
  )
}

export default ChartWrapper