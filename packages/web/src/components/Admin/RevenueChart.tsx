import { ArrowTrendingUpIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

interface RevenueChartProps {
  totalRevenue: number
}

export default function RevenueChart({ totalRevenue }: RevenueChartProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // 임시 데이터 (실제로는 API에서 월별 데이터를 가져와야 함)
  const monthlyData = [
    { month: '1월', revenue: totalRevenue * 0.08 },
    { month: '2월', revenue: totalRevenue * 0.06 },
    { month: '3월', revenue: totalRevenue * 0.12 },
    { month: '4월', revenue: totalRevenue * 0.09 },
    { month: '5월', revenue: totalRevenue * 0.15 },
    { month: '6월', revenue: totalRevenue * 0.11 },
    { month: '7월', revenue: totalRevenue * 0.13 },
    { month: '8월', revenue: totalRevenue * 0.10 },
    { month: '9월', revenue: totalRevenue * 0.16 },
  ];

  const maxRevenue = Math.max(...monthlyData.map(d => d.revenue));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            월별 매출 현황
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            2024년 누적 매출
          </p>
        </div>
        <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
          <ArrowTrendingUpIcon className="h-4 w-4" />
          <span className="text-sm font-medium">+12.5%</span>
        </div>
      </div>

      {/* 총 매출 표시 */}
      <div className="mb-6">
        <div className="flex items-center space-x-2">
          <CurrencyDollarIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(totalRevenue)}
          </span>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          전체 매출 합계
        </p>
      </div>

      {/* 막대 차트 */}
      <div className="space-y-3">
        {monthlyData.map((data, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className="w-8 text-xs text-gray-500 dark:text-gray-400 text-right">
              {data.month}
            </div>
            <div className="flex-1">
              <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-6 relative overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-full rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${(data.revenue / maxRevenue) * 100}%`,
                  }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full"></div>
                </div>
              </div>
            </div>
            <div className="w-20 text-xs text-gray-600 dark:text-gray-300 text-right">
              {formatCurrency(data.revenue)}
            </div>
          </div>
        ))}
      </div>

      {/* 하단 요약 */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
        <div className="text-center">
          <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(monthlyData[monthlyData.length - 1].revenue)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            이번 달
          </div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
            {formatCurrency(totalRevenue / monthlyData.length)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            월 평균
          </div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
            +12.5%
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            전월 대비
          </div>
        </div>
      </div>
    </div>
  );
}