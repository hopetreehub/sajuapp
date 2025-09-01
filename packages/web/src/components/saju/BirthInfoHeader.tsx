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

  // 천간 색상 (밝은 색상)
  const getHeavenlyColor = (heavenly: string) => {
    const colorMap: Record<string, string> = {
      '갑': 'text-emerald-600 dark:text-emerald-400', '을': 'text-green-600 dark:text-green-400', // 목
      '병': 'text-red-600 dark:text-red-400', '정': 'text-pink-600 dark:text-pink-400', // 화  
      '무': 'text-yellow-600 dark:text-yellow-400', '기': 'text-amber-600 dark:text-amber-400', // 토
      '경': 'text-slate-600 dark:text-slate-400', '신': 'text-gray-600 dark:text-gray-400', // 금
      '임': 'text-blue-600 dark:text-blue-400', '계': 'text-cyan-600 dark:text-cyan-400' // 수
    }
    return colorMap[heavenly] || 'text-gray-600 dark:text-gray-400'
  }

  // 지지 색상 (어두운 색상)
  const getEarthlyColor = (earthly: string) => {
    const colorMap: Record<string, string> = {
      '자': 'text-blue-800 dark:text-blue-300', '해': 'text-cyan-800 dark:text-cyan-300', // 수
      '축': 'text-yellow-800 dark:text-yellow-300', '진': 'text-amber-800 dark:text-amber-300', 
      '미': 'text-orange-800 dark:text-orange-300', '술': 'text-yellow-800 dark:text-yellow-300', // 토
      '인': 'text-green-800 dark:text-green-300', '묘': 'text-emerald-800 dark:text-emerald-300', // 목
      '사': 'text-red-800 dark:text-red-300', '오': 'text-rose-800 dark:text-rose-300', // 화
      '신': 'text-gray-800 dark:text-gray-300', '유': 'text-slate-800 dark:text-slate-300' // 금
    }
    return colorMap[earthly] || 'text-gray-800 dark:text-gray-300'
  }

  // 천간 오행 매핑
  const getHeavenlyElement = (heavenly: string) => {
    const elementMap: Record<string, string> = {
      '갑': '木(목)', '을': '木(목)',
      '병': '火(화)', '정': '火(화)',  
      '무': '土(토)', '기': '土(토)',
      '경': '金(금)', '신': '金(금)',
      '임': '水(수)', '계': '水(수)'
    }
    return elementMap[heavenly] || ''
  }

  // 지지 오행 매핑  
  const getEarthlyElement = (earthly: string) => {
    const elementMap: Record<string, string> = {
      '자': '水(수)', '해': '水(수)', // 수
      '축': '土(토)', '진': '土(토)', '미': '土(토)', '술': '土(토)', // 토
      '인': '木(목)', '묘': '木(목)', // 목
      '사': '火(화)', '오': '火(화)', // 화
      '신': '金(금)', '유': '金(금)' // 금
    }
    return elementMap[earthly] || ''
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
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                  <div className="font-semibold text-red-800 dark:text-red-200">년주 (年柱)</div>
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {fourPillars.year.combined}
                  </div>
                  <div className="text-xs flex items-center justify-between mt-1">
                    <span className={`font-medium ${getHeavenlyColor(fourPillars.year.heavenly)}`}>
                      {fourPillars.year.heavenly}({getHeavenlyElement(fourPillars.year.heavenly)})
                    </span>
                    <span className={`font-medium ${getEarthlyColor(fourPillars.year.earthly)}`}>
                      {fourPillars.year.earthly}({getEarthlyElement(fourPillars.year.earthly)})
                    </span>
                  </div>
                </div>
                
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                  <div className="font-semibold text-green-800 dark:text-green-200">월주 (月柱)</div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {fourPillars.month.combined}
                  </div>
                  <div className="text-xs flex items-center justify-between mt-1">
                    <span className={`font-medium ${getHeavenlyColor(fourPillars.month.heavenly)}`}>
                      {fourPillars.month.heavenly}({getHeavenlyElement(fourPillars.month.heavenly)})
                    </span>
                    <span className={`font-medium ${getEarthlyColor(fourPillars.month.earthly)}`}>
                      {fourPillars.month.earthly}({getEarthlyElement(fourPillars.month.earthly)})
                    </span>
                  </div>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                  <div className="font-semibold text-blue-800 dark:text-blue-200">일주 (日柱)</div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {fourPillars.day.combined}
                  </div>
                  <div className="text-xs flex items-center justify-between mt-1">
                    <span className={`font-medium ${getHeavenlyColor(fourPillars.day.heavenly)}`}>
                      {fourPillars.day.heavenly}({getHeavenlyElement(fourPillars.day.heavenly)}) (일간)
                    </span>
                    <span className={`font-medium ${getEarthlyColor(fourPillars.day.earthly)}`}>
                      {fourPillars.day.earthly}({getEarthlyElement(fourPillars.day.earthly)})
                    </span>
                  </div>
                </div>
                
                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                  <div className="font-semibold text-purple-800 dark:text-purple-200">시주 (時柱)</div>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {fourPillars.hour.combined}
                  </div>
                  <div className="text-xs flex items-center justify-between mt-1">
                    <span className={`font-medium ${getHeavenlyColor(fourPillars.hour.heavenly)}`}>
                      {fourPillars.hour.heavenly}({getHeavenlyElement(fourPillars.hour.heavenly)})
                    </span>
                    <span className={`font-medium ${getEarthlyColor(fourPillars.hour.earthly)}`}>
                      {fourPillars.hour.earthly}({getEarthlyElement(fourPillars.hour.earthly)})
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <div className="text-center">
                  <div className="font-bold text-lg text-gray-800 dark:text-gray-200">
                    {formatFourPillars(fourPillars)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    완전한 사주(四柱)
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-2 text-center font-medium">
                    🌟 오행(五行) 구성 안내
                  </div>
                  <div className="grid grid-cols-5 gap-2 text-xs">
                    <div className="text-center">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-1">
                        🌳
                      </div>
                      <div className="font-medium text-green-700 dark:text-green-300">木(목)</div>
                      <div className="text-gray-500 dark:text-gray-400">갑을인묘</div>
                    </div>
                    <div className="text-center">
                      <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-1">
                        🔥
                      </div>
                      <div className="font-medium text-red-700 dark:text-red-300">火(화)</div>
                      <div className="text-gray-500 dark:text-gray-400">병정사오</div>
                    </div>
                    <div className="text-center">
                      <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-1">
                        🏔️
                      </div>
                      <div className="font-medium text-yellow-700 dark:text-yellow-300">土(토)</div>
                      <div className="text-gray-500 dark:text-gray-400">무기진미축술</div>
                    </div>
                    <div className="text-center">
                      <div className="w-8 h-8 bg-gray-100 dark:bg-gray-900/30 rounded-full flex items-center justify-center mx-auto mb-1">
                        ⚔️
                      </div>
                      <div className="font-medium text-gray-700 dark:text-gray-300">金(금)</div>
                      <div className="text-gray-500 dark:text-gray-400">경신신유</div>
                    </div>
                    <div className="text-center">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-1">
                        💧
                      </div>
                      <div className="font-medium text-blue-700 dark:text-blue-300">水(수)</div>
                      <div className="text-gray-500 dark:text-gray-400">임계자해</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}