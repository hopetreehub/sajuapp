import { 
  BookOpenIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  StarIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';

interface AcademyStats {
  totalCourses: number
  totalStudents: number
  totalEnrollments: number
  activeEnrollments: number
  completedEnrollments: number
  totalRevenue: number
  averageRating: number
  completionRate: string
}

interface AcademyStatsCardsProps {
  stats: AcademyStats
}

export default function AcademyStatsCards({ stats }: AcademyStatsCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ko-KR').format(num);
  };

  const statsCards = [
    {
      title: '전체 강좌',
      value: formatNumber(stats.totalCourses),
      icon: BookOpenIcon,
      color: 'blue',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
      textColor: 'text-blue-600 dark:text-blue-400',
      description: '개설된 강좌 수',
    },
    {
      title: '전체 학생',
      value: formatNumber(stats.totalStudents),
      icon: UserGroupIcon,
      color: 'green',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      iconColor: 'text-green-600 dark:text-green-400',
      textColor: 'text-green-600 dark:text-green-400',
      description: '등록된 학생 수',
    },
    {
      title: '수강신청',
      value: formatNumber(stats.totalEnrollments),
      icon: AcademicCapIcon,
      color: 'purple',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      iconColor: 'text-purple-600 dark:text-purple-400',
      textColor: 'text-purple-600 dark:text-purple-400',
      description: '총 수강신청 건수',
      subStats: [
        { label: '진행중', value: stats.activeEnrollments },
        { label: '완료', value: stats.completedEnrollments },
      ],
    },
    {
      title: '총 수익',
      value: formatCurrency(stats.totalRevenue),
      icon: CurrencyDollarIcon,
      color: 'emerald',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      description: '전체 매출 현황',
    },
    {
      title: '평균 평점',
      value: stats.averageRating.toFixed(1),
      icon: StarIcon,
      color: 'yellow',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      textColor: 'text-yellow-600 dark:text-yellow-400',
      description: '강좌 평균 만족도',
      suffix: '/5.0',
    },
    {
      title: '완료율',
      value: `${stats.completionRate}%`,
      icon: CheckCircleIcon,
      color: 'indigo',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      textColor: 'text-indigo-600 dark:text-indigo-400',
      description: '수강 완료율',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statsCards.map((card, index) => (
        <div key={index} className={`${card.bgColor} rounded-xl p-6 border border-opacity-20`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 ${card.bgColor} rounded-lg`}>
              <card.icon className={`h-6 w-6 ${card.iconColor}`} />
            </div>
            {card.color === 'green' && stats.totalEnrollments > 0 && (
              <div className="flex items-center text-green-600 dark:text-green-400">
                <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                <span className="text-xs font-medium">+{Math.round((stats.activeEnrollments / stats.totalEnrollments) * 100)}%</span>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {card.title}
            </h3>
            <div className="flex items-baseline space-x-2">
              <p className={`text-2xl font-bold ${card.textColor}`}>
                {card.value}
              </p>
              {card.suffix && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {card.suffix}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {card.description}
            </p>
            
            {/* 서브 통계 (수강신청 카드용) */}
            {card.subStats && (
              <div className="flex space-x-4 mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                {card.subStats.map((subStat, subIndex) => (
                  <div key={subIndex} className="flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {subStat.label}
                    </p>
                    <p className={`text-sm font-semibold ${card.textColor}`}>
                      {formatNumber(subStat.value)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}