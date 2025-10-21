import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSajuSettingsStore } from '@/stores/sajuSettingsStore';
import { useAuthStore } from '@/stores/authStore';
import { useFortuneStore } from '@/stores/fortuneStore';
import { getFortuneInfo } from '@/utils/dailyFortuneCalculator';
import { DailyFortune } from '@/types/saju';

interface TodayFortuneSectionProps {
  currentDate: Date
  onDiaryClick?: (date: Date) => void
  hasDiary?: boolean
}

interface FortuneCardProps {
  label: string
  score: number
  icon: string
  description?: string
}

const FortuneCard: React.FC<FortuneCardProps> = ({ label, score, icon, description }) => {
  const fortuneInfo = getFortuneInfo(score);
  const percentage = Math.round(score);
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105 border border-border/50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{icon}</span>
          <h3 className="text-xl font-bold text-foreground">{label}</h3>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold" style={{ color: fortuneInfo.color }}>
            {percentage}%
          </div>
          <div className="text-sm font-medium" style={{ color: fortuneInfo.color }}>
            {fortuneInfo.label}
          </div>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ 
            width: `${percentage}%`, 
            backgroundColor: fortuneInfo.color,
            boxShadow: `0 0 10px ${fortuneInfo.color}40`,
          }}
        />
      </div>
      
      {description && (
        <p className="text-sm text-muted-foreground mt-3 italic">{description}</p>
      )}
    </div>
  );
};

const LoadingFortuneSection: React.FC = () => (
  <div className="h-full flex flex-col">
    <h2 className="text-3xl font-bold text-foreground mb-8 flex items-center gap-3">
      <span className="animate-pulse">✨</span>
      오늘의 운세
    </h2>
    <div className="grid grid-cols-1 gap-6 flex-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-muted rounded"></div>
              <div className="w-24 h-6 bg-muted rounded"></div>
            </div>
            <div className="w-16 h-8 bg-muted rounded"></div>
          </div>
          <div className="w-full h-4 bg-muted rounded-full"></div>
        </div>
      ))}
    </div>
  </div>
);

const NoSettingsSection: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  return (
  <div className="h-full flex flex-col items-center justify-center">
    <div className="max-w-md text-center">
      <div className="text-6xl mb-6">🔮</div>
      <h2 className="text-3xl font-bold text-foreground mb-4">
        운세를 확인하려면 설정이 필요합니다
      </h2>
      <p className="text-lg text-muted-foreground mb-8">
        생년월일시 정보를 입력하여 맞춤 운세를 받아보세요
      </p>
      <button
        onClick={() => {
          navigate('/settings');
        }}
        className="px-8 py-4 bg-primary-500 text-white text-lg font-semibold rounded-xl hover:bg-primary-600 transition-colors shadow-lg"
      >
        설정하러 가기
      </button>
      {user && (
        <div className="mt-4 text-sm text-muted-foreground">
          <p>로그인된 계정: {user.email}</p>
          <p className="text-xs mt-1">설정 페이지에서 생년월일시를 입력하면 자동으로 운세가 계산됩니다</p>
        </div>
      )}
    </div>
  </div>
  );
};

const fortuneDescriptions: { [key: string]: string } = {
  '총운': '하루 전반적인 운의 흐름을 나타냅니다',
  '연애운': '사랑과 인간관계의 조화를 보여줍니다',
  '재물운': '금전적 이득과 재산 증식의 기회를 알려줍니다',
  '건강운': '신체와 정신의 건강 상태를 나타냅니다',
  '직업운': '업무 성과와 경력 발전 가능성을 보여줍니다',
};

const TodayFortuneSection: React.FC<TodayFortuneSectionProps> = ({ currentDate, onDiaryClick: _onDiaryClick, hasDiary: _hasDiary }) => {
  const { birthInfo, setBirthInfo } = useSajuSettingsStore();
  const { user: _user } = useAuthStore();

  // localStorage에서 데이터 불러오기 및 Store 동기화
  React.useEffect(() => {
    if (!birthInfo) {

      const savedPersonalInfo = localStorage.getItem('sajuapp-personal-info');

      if (savedPersonalInfo) {
        try {
          const personalInfo = JSON.parse(savedPersonalInfo);

          // localStorage 데이터를 SajuBirthInfo 형식으로 변환
          if (personalInfo.birthDate && personalInfo.birthTime) {
            const birthDate = new Date(personalInfo.birthDate);
            const [hour, minute] = personalInfo.birthTime.split(':').map(Number);

            const sajuBirthInfo = {
              year: birthDate.getFullYear(),
              month: birthDate.getMonth() + 1,
              day: birthDate.getDate(),
              hour: hour || 0,
              minute: minute || 0,
              isLunar: personalInfo.calendarType === 'lunar',
              isMale: personalInfo.gender === 'male',
              name: personalInfo.gender === 'male' ? '사용자(남)' : '사용자(여)',
            };

            setBirthInfo(sajuBirthInfo);
          }
        } catch (error) {
          console.error('[TodayFortuneSection] localStorage 파싱 오류:', error);
        }
      }
      // birthInfo가 이미 있으면 아무것도 하지 않음
    }
  }, [birthInfo, setBirthInfo]);

  // 디버깅: Store 데이터 확인


  // fortuneStore를 사용한 운세 데이터 가져오기
  const { calculateFortune } = useFortuneStore();
  const dailyFortune: DailyFortune | null = useMemo(() => {
    if (!birthInfo) {

      return null;
    }

    return calculateFortune(birthInfo, currentDate);
  }, [birthInfo, currentDate, calculateFortune]);

  // 생년월일시 정보가 없는 경우
  if (!birthInfo) {
    return <NoSettingsSection />;
  }

  // 운세 계산 실패한 경우
  if (!dailyFortune) {
    return <LoadingFortuneSection />;
  }

  const fortuneItems = [
    { label: '총운', score: dailyFortune.totalLuck, icon: '🌟' },
    { label: '연애운', score: dailyFortune.loveLuck, icon: '💕' },
    { label: '재물운', score: dailyFortune.wealthLuck, icon: '💰' },
    { label: '건강운', score: dailyFortune.healthLuck, icon: '🏥' },
    { label: '직업운', score: dailyFortune.careerLuck, icon: '💼' },
  ];

  return (
    <div className="h-full flex flex-col p-2">
      {/* 헤더 */}
      <div className="mb-6">
        <h2 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
          <span className="text-yellow-500">✨</span>
          오늘의 운세
        </h2>
        <p className="text-lg text-muted-foreground">
          당신의 사주명리로 풀어보는 오늘 하루
        </p>
      </div>
      
      {/* 운세 카드 그리드 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6 flex-1">
        {/* 총운은 전체 너비로 */}
        <div className="lg:col-span-2">
          <FortuneCard
            label={fortuneItems[0].label}
            score={fortuneItems[0].score}
            icon={fortuneItems[0].icon}
            description={fortuneDescriptions[fortuneItems[0].label]}
          />
        </div>
        
        {/* 나머지 운세들 */}
        {fortuneItems.slice(1).map((item) => (
          <FortuneCard
            key={item.label}
            label={item.label}
            score={item.score}
            icon={item.icon}
            description={fortuneDescriptions[item.label]}
          />
        ))}
      </div>

      {/* 행운 정보 & 메시지 */}
      <div className="space-y-4">
        {/* 행운 아이템 */}
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-foreground mb-4">오늘의 행운 아이템</h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full shadow-lg flex items-center justify-center bg-white dark:bg-gray-800">
                <div 
                  className="w-12 h-12 rounded-full" 
                  style={{ backgroundColor: dailyFortune.luckyColor }}
                  title="행운의 색상"
                />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">행운의 색상</div>
                <div className="font-bold text-lg">{dailyFortune.luckyColor}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-full flex items-center justify-center text-2xl font-bold shadow-lg">
                {dailyFortune.luckyNumber}
              </div>
              <div>
                <div className="text-sm text-muted-foreground">행운의 숫자</div>
                <div className="font-bold text-lg">숫자 {dailyFortune.luckyNumber}</div>
              </div>
            </div>
          </div>
        </div>

        {/* 오늘의 메시지 */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
            <span>💌</span>
            오늘의 메시지
          </h3>
          <p className="text-lg text-foreground leading-relaxed mb-3">
            {dailyFortune.message}
          </p>
          {dailyFortune.advice && (
            <p className="text-sm text-muted-foreground italic border-t border-border/30 pt-3">
              💡 {dailyFortune.advice}
            </p>
          )}
        </div>

      </div>
    </div>
  );
};

export default TodayFortuneSection;