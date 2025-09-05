import React, { useMemo } from 'react'
import { useSajuSettingsStore } from '@/stores/sajuSettingsStore'
import { calculateDailyFortune, getFortuneInfo } from '@/utils/dailyFortuneCalculator'
import { DailyFortune } from '@/types/saju'

interface TodayFortuneSectionProps {
  currentDate: Date
}

interface FortuneItemProps {
  label: string
  score: number
  icon: string
}

const FortuneItem: React.FC<FortuneItemProps> = ({ label, score, icon }) => {
  const fortuneInfo = getFortuneInfo(score)
  const percentage = Math.round(score)
  
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <span className="font-medium text-foreground">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium" style={{ color: fortuneInfo.color }}>
            {fortuneInfo.label}
          </span>
          <span className="text-xs text-muted-foreground">({percentage}%)</span>
        </div>
        <div className="w-12 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-500"
            style={{ 
              width: `${percentage}%`, 
              backgroundColor: fortuneInfo.color 
            }}
          />
        </div>
      </div>
    </div>
  )
}

const LoadingFortuneSection: React.FC = () => (
  <div className="mb-6">
    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
      <span className="animate-pulse">✨</span>
      오늘의 운세
    </h3>
    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="p-3 rounded-lg bg-muted/30 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-muted rounded"></div>
              <div className="w-16 h-4 bg-muted rounded"></div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-12 h-4 bg-muted rounded"></div>
              <div className="w-12 h-2 bg-muted rounded-full"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
)

const NoSettingsSection: React.FC = () => (
  <div className="mb-6">
    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
      <span>✨</span>
      오늘의 운세
    </h3>
    <div className="p-6 text-center bg-muted/20 rounded-xl border-2 border-dashed border-muted">
      <div className="text-4xl mb-3">🔮</div>
      <div className="text-foreground font-medium mb-2">운세를 확인하려면 설정이 필요합니다</div>
      <div className="text-sm text-muted-foreground mb-4">
        생년월일시 정보를 입력하여 맞춤 운세를 받아보세요
      </div>
      <button 
        onClick={() => {
          // 설정 페이지로 이동하는 로직 (향후 구현)
          console.log('Navigate to settings')
        }}
        className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
      >
        설정하러 가기
      </button>
    </div>
  </div>
)

const TodayFortuneSection: React.FC<TodayFortuneSectionProps> = ({ currentDate }) => {
  const { birthInfo } = useSajuSettingsStore()

  const dailyFortune: DailyFortune | null = useMemo(() => {
    if (!birthInfo) return null
    
    try {
      return calculateDailyFortune(birthInfo, currentDate)
    } catch (error) {
      console.error('Failed to calculate daily fortune:', error)
      return null
    }
  }, [birthInfo, currentDate])

  // 생년월일시 정보가 없는 경우
  if (!birthInfo) {
    return <NoSettingsSection />
  }

  // 운세 계산 실패한 경우
  if (!dailyFortune) {
    return <LoadingFortuneSection />
  }

  const fortuneItems = [
    { label: '총운', score: dailyFortune.totalLuck, icon: '🌟' },
    { label: '연애운', score: dailyFortune.loveLuck, icon: '💕' },
    { label: '재물운', score: dailyFortune.wealthLuck, icon: '💰' },
    { label: '건강운', score: dailyFortune.healthLuck, icon: '🏥' },
    { label: '직업운', score: dailyFortune.careerLuck, icon: '💼' }
  ]

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <span>✨</span>
        오늘의 운세
      </h3>
      
      {/* 운세 항목들 */}
      <div className="space-y-3 mb-4">
        {fortuneItems.map((item) => (
          <FortuneItem
            key={item.label}
            label={item.label}
            score={item.score}
            icon={item.icon}
          />
        ))}
      </div>

      {/* 행운 정보 */}
      <div className="flex items-center gap-4 p-3 bg-muted/20 rounded-lg mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">행운의 색상</span>
          <div 
            className="w-6 h-6 rounded-full border-2 border-white shadow-sm" 
            style={{ backgroundColor: dailyFortune.luckyColor }}
            title="행운의 색상"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">행운의 숫자</span>
          <div className="w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
            {dailyFortune.luckyNumber}
          </div>
        </div>
      </div>

      {/* 오늘의 메시지 */}
      <div className="p-4 bg-gradient-to-r from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 rounded-xl">
        <div className="text-sm text-muted-foreground mb-1">오늘의 메시지</div>
        <div className="text-sm text-foreground leading-relaxed">
          {dailyFortune.message}
        </div>
        {dailyFortune.advice && (
          <div className="text-xs text-muted-foreground mt-2 opacity-75">
            {dailyFortune.advice}
          </div>
        )}
      </div>
    </div>
  )
}

export default TodayFortuneSection