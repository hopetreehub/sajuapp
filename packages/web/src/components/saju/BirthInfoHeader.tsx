import React from 'react'
import { motion } from 'framer-motion'
import { SajuBirthInfo } from '@/types/saju'
import { FourPillarsResult } from '@/utils/sajuCalculator'

interface BirthInfoHeaderProps {
  birthInfo: SajuBirthInfo
  fourPillars?: FourPillarsResult
  userName?: string
  className?: string
  showEditButton?: boolean
  onEditClick?: () => void
}

export const BirthInfoHeader: React.FC<BirthInfoHeaderProps> = ({
  birthInfo,
  fourPillars,
  userName,
  className = '',
  showEditButton = true,
  onEditClick
}) => {
  const formatBirthDate = (info: SajuBirthInfo) => {
    const weekdays = ['일', '월', '화', '수', '목', '금', '토']
    const date = new Date(info.year, info.month - 1, info.day)
    const weekday = weekdays[date.getDay()]
    
    return `${info.year}년 ${info.month}월 ${info.day}일 ${info.hour}시 ${info.minute || 0}분 (${weekday}요일) ${info.isLunar ? '음력' : '양력'}`
  }

  const formatFourPillars = (pillars: FourPillarsResult) => {
    return `${pillars.year.heavenly}${pillars.year.earthly}년 ${pillars.month.heavenly}${pillars.month.earthly}월 ${pillars.day.heavenly}${pillars.day.earthly}일 ${pillars.hour.heavenly}${pillars.hour.earthly}시`
  }

  const getElementColor = (heavenly: string) => {
    const elementMap: Record<string, string> = {
      '갑': 'text-green-600 dark:text-green-400', '을': 'text-green-600 dark:text-green-400', // 목
      '병': 'text-red-600 dark:text-red-400', '정': 'text-red-600 dark:text-red-400', // 화  
      '무': 'text-yellow-600 dark:text-yellow-400', '기': 'text-yellow-600 dark:text-yellow-400', // 토
      '경': 'text-gray-600 dark:text-gray-400', '신': 'text-gray-600 dark:text-gray-400', // 금
      '임': 'text-blue-600 dark:text-blue-400', '계': 'text-blue-600 dark:text-blue-400' // 수
    }
    return elementMap[heavenly] || 'text-gray-600 dark:text-gray-400'
  }

  const getElementName = (heavenly: string) => {
    const elementMap: Record<string, string> = {
      '갑': '목', '을': '목',
      '병': '화', '정': '화',  
      '무': '토', '기': '토',
      '경': '금', '신': '금',
      '임': '수', '계': '수'
    }
    return elementMap[heavenly] || ''
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-r from-purple-50 to-blue-50 dark:from-gray-800 dark:to-purple-900/30 rounded-xl shadow-lg border border-purple-200 dark:border-purple-700/50 p-6 mb-8 ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">👤</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              {userName || birthInfo.name || '사주 분석 대상'}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              출생 정보 기반 분석
            </p>
          </div>
        </div>
        
        {showEditButton && onEditClick && (
          <button
            onClick={onEditClick}
            className="px-4 py-2 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-300 dark:border-gray-600 transition-colors text-sm font-medium"
            title="출생 정보 수정"
          >
            ⚙️ 수정
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 출생 정보 */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
            <span className="mr-2">🎂</span>
            출생 정보
          </h3>
          <div className="bg-white dark:bg-gray-700/50 rounded-lg p-4">
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">생년월일시:</span>
                <span className="ml-2 text-gray-800 dark:text-gray-200 font-medium">
                  {formatBirthDate(birthInfo)}
                </span>
              </div>
              {birthInfo.gender && (
                <div>
                  <span className="text-gray-600 dark:text-gray-400">성별:</span>
                  <span className="ml-2 text-gray-800 dark:text-gray-200 font-medium">
                    {birthInfo.gender === 'male' ? '남성' : '여성'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 사주 정보 */}
        {fourPillars && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
              <span className="mr-2">🔮</span>
              사주 (四柱)
            </h3>
            <div className="bg-white dark:bg-gray-700/50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-center p-2 bg-red-50 dark:bg-red-900/20 rounded">
                  <div className="font-semibold text-red-800 dark:text-red-200 mb-1">년주</div>
                  <div className={`text-lg font-bold ${getElementColor(fourPillars.year.heavenly)}`}>
                    {fourPillars.year.combined}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {getElementName(fourPillars.year.heavenly)}
                  </div>
                </div>
                
                <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
                  <div className="font-semibold text-green-800 dark:text-green-200 mb-1">월주</div>
                  <div className={`text-lg font-bold ${getElementColor(fourPillars.month.heavenly)}`}>
                    {fourPillars.month.combined}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {getElementName(fourPillars.month.heavenly)}
                  </div>
                </div>
                
                <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <div className="font-semibold text-blue-800 dark:text-blue-200 mb-1">일주</div>
                  <div className={`text-lg font-bold ${getElementColor(fourPillars.day.heavenly)}`}>
                    {fourPillars.day.combined}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {getElementName(fourPillars.day.heavenly)} (일간)
                  </div>
                </div>
                
                <div className="text-center p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                  <div className="font-semibold text-purple-800 dark:text-purple-200 mb-1">시주</div>
                  <div className={`text-lg font-bold ${getElementColor(fourPillars.hour.heavenly)}`}>
                    {fourPillars.hour.combined}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {getElementName(fourPillars.hour.heavenly)}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-600 rounded-lg text-center">
                <div className="font-bold text-gray-800 dark:text-gray-200">
                  {formatFourPillars(fourPillars)}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  완전한 사주 (四柱)
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}