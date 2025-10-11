/**
 * 귀문둔갑 궁(宮) 상세 정보
 *
 * 선택한 궁의 팔문/구성/팔신 해석 및 조언 표시
 * @author Claude Code
 * @version 1.0.0
 */

import React from 'react';
import type { PalaceInfo } from '@/types/qimen';
import { getGateData, getStarData, getSpiritData } from '@/data/qimenDunjiaData';

interface PalaceDetailProps {
  palace: PalaceInfo;
  onClose: () => void;
}

export default function PalaceDetail({ palace, onClose }: PalaceDetailProps) {
  const gateData = getGateData(palace.gate);
  const starData = getStarData(palace.star);
  const spiritData = palace.spirit ? getSpiritData(palace.spirit) : null;

  // 길흉에 따른 배경 그라디언트
  const getBackgroundGradient = () => {
    switch (palace.fortune) {
      case 'excellent':
        return 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20';
      case 'good':
        return 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20';
      case 'neutral':
        return 'from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20';
      case 'bad':
        return 'from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20';
      case 'terrible':
        return 'from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20';
      default:
        return 'from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20';
    }
  };

  // 길흉 텍스트
  const getFortuneText = () => {
    switch (palace.fortune) {
      case 'excellent':
        return { text: '대길 🌟', color: 'text-green-600 dark:text-green-400' };
      case 'good':
        return { text: '길 ✨', color: 'text-blue-600 dark:text-blue-400' };
      case 'neutral':
        return { text: '평 ⚖️', color: 'text-gray-600 dark:text-gray-400' };
      case 'bad':
        return { text: '흉 ⚠️', color: 'text-orange-600 dark:text-orange-400' };
      case 'terrible':
        return { text: '대흉 ❌', color: 'text-red-600 dark:text-red-400' };
      default:
        return { text: '평 ⚖️', color: 'text-gray-600 dark:text-gray-400' };
    }
  };

  const fortuneInfo = getFortuneText();

  return (
    <div className={`p-6 rounded-xl bg-gradient-to-br ${getBackgroundGradient()} backdrop-blur-sm shadow-xl border border-gray-200 dark:border-gray-700`}>
      {/* 헤더 */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            {palace.palace}궁 - {palace.direction}
          </h2>
          <div className="flex items-center gap-3">
            <span className={`text-2xl font-bold ${fortuneInfo.color}`}>
              {fortuneInfo.text}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {palace.tianGan}{palace.diZhi} · {palace.wuXing}
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
          aria-label="닫기"
        >
          <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* 종합 해석 */}
      <div className="mb-6 p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">
          📖 종합 해석
        </h3>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          {palace.interpretation}
        </p>
      </div>

      {/* 팔문 상세 */}
      <div className="mb-4 p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">
          🚪 팔문 - {gateData.name}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          {gateData.meaning}
        </p>
        <div className="flex gap-2 flex-wrap mb-2">
          {gateData.effects.positive.map((effect, idx) => (
            <span key={idx} className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-xs">
              ✅ {effect}
            </span>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          {gateData.effects.negative.map((effect, idx) => (
            <span key={idx} className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded text-xs">
              ⚠️ {effect}
            </span>
          ))}
        </div>
      </div>

      {/* 구성 상세 */}
      <div className="mb-4 p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">
          ⭐ 구성 - {starData.name}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          {starData.meaning} ({starData.planet}, {starData.element})
        </p>
        <div className="flex gap-2 flex-wrap">
          {starData.influences.map((influence, idx) => (
            <span key={idx} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs">
              {influence}
            </span>
          ))}
        </div>
      </div>

      {/* 팔신 상세 */}
      {spiritData && (
        <div className="mb-6 p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">
            🛡️ 팔신 - {spiritData.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {spiritData.meaning}
          </p>
          <div className="flex gap-2 flex-wrap">
            {spiritData.characteristics.map((char, idx) => (
              <span key={idx} className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-xs">
                {char}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 추천 행동 */}
      {palace.recommendations.length > 0 && (
        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <h3 className="text-lg font-bold text-green-800 dark:text-green-300 mb-2">
            ✅ 추천 행동
          </h3>
          <ul className="space-y-1">
            {palace.recommendations.map((rec, idx) => (
              <li key={idx} className="text-sm text-green-700 dark:text-green-400 flex items-start">
                <span className="mr-2">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 주의사항 */}
      {palace.warnings.length > 0 && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <h3 className="text-lg font-bold text-red-800 dark:text-red-300 mb-2">
            ⚠️ 주의사항
          </h3>
          <ul className="space-y-1">
            {palace.warnings.map((warning, idx) => (
              <li key={idx} className="text-sm text-red-700 dark:text-red-400 flex items-start">
                <span className="mr-2">•</span>
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
