import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQimenShare, type ShareData } from '@/services/qimenShareApi';
import QimenChart3x3 from '@/components/qimen/QimenChart';
import PalaceDetail from '@/components/qimen/PalaceDetail';
import type { Palace } from '@/types/qimen';

/**
 * 공개 귀문둔갑 공유 페이지
 */
export default function QimenSharePage() {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();

  const [shareData, setShareData] = useState<ShareData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPalace, setSelectedPalace] = useState<Palace | null>(null);

  useEffect(() => {
    if (!uuid) {
      setError('공유 ID가 없습니다.');
      setLoading(false);
      return;
    }

    async function fetchShare() {
      try {
        setLoading(true);
        const data = await getQimenShare(uuid!);
        setShareData(data);
        setError(null);
      } catch (err) {
        console.error('Failed to load share:', err);
        setError('공유 링크를 불러올 수 없습니다. 링크가 만료되었거나 삭제되었을 수 있습니다.');
      } finally {
        setLoading(false);
      }
    }

    fetchShare();
  }, [uuid]);

  // SEO 메타 태그 설정
  useEffect(() => {
    if (shareData) {
      const chart = shareData.chart_data;
      const title = `귀문둔갑 ${chart.yinYang === 'yang' ? '양둔' : '음둔'} ${chart.ju}국 - 운명나침반`;
      const description = `${chart.solarTerm.name} | 점수: ${chart.overallFortune.score}점 | ${chart.overallFortune.summary}`;

      document.title = title;

      // OG 태그
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) {
        ogTitle.setAttribute('content', title);
      }

      const ogDescription = document.querySelector('meta[property="og:description"]');
      if (ogDescription) {
        ogDescription.setAttribute('content', description);
      }

      const ogUrl = document.querySelector('meta[property="og:url"]');
      if (ogUrl) {
        ogUrl.setAttribute('content', window.location.href);
      }
    }
  }, [shareData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">공유 링크 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !shareData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              공유 링크를 찾을 수 없습니다
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error || '링크가 만료되었거나 삭제되었을 수 있습니다.'}
            </p>
            <button
              onClick={() => navigate('/qimen')}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
            >
              귀문둔갑 페이지로 이동
            </button>
          </div>
        </div>
      </div>
    );
  }

  const chart = shareData.chart_data;
  const dateTime = new Date(shareData.date_time);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <header className="text-center mb-8">
          <div className="flex justify-center items-center gap-4 mb-2">
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 dark:from-purple-400 dark:via-pink-400 dark:to-blue-400">
              ⚡ 귀문둔갑 공유
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg mb-2">
            奇門遁甲 - 시간과 방위의 길흉 판단
          </p>

          {/* 공유 정보 */}
          <div className="max-w-2xl mx-auto mb-6">
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
              <div className="text-sm space-y-1 text-purple-700 dark:text-purple-300">
                <p>📅 분석 시간: {dateTime.toLocaleString('ko-KR')}</p>
                {shareData.customer_name && (
                  <p>👤 고객: {shareData.customer_name}</p>
                )}
                {shareData.note && (
                  <p>📝 메모: {shareData.note}</p>
                )}
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">
                  👁️ 조회수: {shareData.view_count}회
                </p>
              </div>
            </div>
          </div>

          {/* 국 정보 */}
          <div className="mt-4 flex justify-center gap-4 flex-wrap">
            <div className="px-4 py-2 bg-white/80 dark:bg-gray-800/80 rounded-lg backdrop-blur-sm shadow-md">
              <span className="text-sm text-gray-500 dark:text-gray-400">국(局)</span>
              <span className="ml-2 font-bold text-purple-600 dark:text-purple-400">
                {chart.yinYang === 'yang' ? '양둔' : '음둔'} {chart.ju}국
              </span>
            </div>
            <div className="px-4 py-2 bg-white/80 dark:bg-gray-800/80 rounded-lg backdrop-blur-sm shadow-md">
              <span className="text-sm text-gray-500 dark:text-gray-400">절기</span>
              <span className="ml-2 font-bold text-blue-600 dark:text-blue-400">
                {chart.solarTerm.name}
              </span>
            </div>
            <div className="px-4 py-2 bg-white/80 dark:bg-gray-800/80 rounded-lg backdrop-blur-sm shadow-md">
              <span className="text-sm text-gray-500 dark:text-gray-400">시간 간지</span>
              <span className="ml-2 font-bold text-pink-600 dark:text-pink-400">
                {chart.hourGanZhi.gan}{chart.hourGanZhi.zhi}
              </span>
            </div>
          </div>
        </header>

        {/* 구궁 차트 */}
        <div className="my-8">
          <QimenChart3x3
            chart={chart}
            selectedPalace={selectedPalace}
            onPalaceSelect={setSelectedPalace}
          />
        </div>

        {/* 전체 길흉 요약 */}
        <div className="mb-8 p-6 bg-white/80 dark:bg-gray-800/80 rounded-xl backdrop-blur-sm shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">
            📊 전체 운세
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className={`text-6xl font-bold ${
                  chart.overallFortune.score >= 80 ? 'text-green-500' :
                  chart.overallFortune.score >= 60 ? 'text-blue-500' :
                  chart.overallFortune.score >= 40 ? 'text-yellow-500' :
                  chart.overallFortune.score >= 20 ? 'text-orange-500' :
                  'text-red-500'
                }`}>
                  {chart.overallFortune.score}
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">종합 점수</div>
                  <div className="text-lg font-bold text-gray-700 dark:text-gray-200">
                    {chart.overallFortune.level === 'excellent' ? '대길 🌟' :
                     chart.overallFortune.level === 'good' ? '길 ✨' :
                     chart.overallFortune.level === 'neutral' ? '평 ⚖️' :
                     chart.overallFortune.level === 'bad' ? '흉 ⚠️' :
                     '대흉 ❌'}
                  </div>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {chart.overallFortune.summary}
              </p>
            </div>

            <div>
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-green-600 dark:text-green-400 mb-2">
                  ✅ 길한 방위
                </h3>
                <div className="flex gap-2 flex-wrap">
                  {chart.overallFortune.bestPalaces.map((p) => (
                    <button
                      key={p}
                      onClick={() => setSelectedPalace(p)}
                      className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                    >
                      {p}궁 ({chart.palaces[p].direction})
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2">
                  ⚠️ 불리한 방위
                </h3>
                <div className="flex gap-2 flex-wrap">
                  {chart.overallFortune.worstPalaces.map((p) => (
                    <button
                      key={p}
                      onClick={() => setSelectedPalace(p)}
                      className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-sm font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                    >
                      {p}궁 ({chart.palaces[p].direction})
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 운명나침반 링크 */}
        <div className="text-center mb-8">
          <button
            onClick={() => navigate('/qimen')}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl text-lg"
          >
            🔮 나도 귀문둔갑 분석하기
          </button>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            운명나침반에서 무료로 귀문둔갑 분석을 받아보세요
          </p>
        </div>

        {/* 선택한 궁 상세 정보 - 모달로 표시 */}
        {selectedPalace && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
            <div className="max-w-4xl w-full my-8">
              <PalaceDetail
                palace={chart.palaces[selectedPalace]}
                onClose={() => setSelectedPalace(null)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
