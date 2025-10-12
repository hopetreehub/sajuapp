/**
 * 귀문둔갑 간단 요약
 *
 * 초보자를 위한 쉬운 해석 (전문 용어 없이)
 * @author Claude Code
 * @version 1.0.0
 */

import React from 'react';
import type { QimenChart } from '@/types/qimen';
import { analyzeBirthDate, type BirthYearAnalysis } from '@/utils/birthYearAnalysis';
import { calculatePersonalizedOverallScore } from '@/utils/qimenPersonalization';

interface SimpleSummaryProps {
  chart: QimenChart;
  customerName?: string;
  customerBirthDate?: string;
}

export default function SimpleSummary({
  chart,
  customerName,
  customerBirthDate,
}: SimpleSummaryProps) {
  // 가장 좋은 방위와 나쁜 방위
  const bestPalaces = chart.overallFortune.bestPalaces;
  const worstPalaces = chart.overallFortune.worstPalaces;

  // 생년 기반 개인화 분석
  const birthAnalysis: BirthYearAnalysis | null = customerBirthDate
    ? analyzeBirthDate(customerBirthDate)
    : null;

  // 개인화된 점수 계산
  const personalizedScore = calculatePersonalizedOverallScore(chart, birthAnalysis);

  // 상황별 조언 생성
  const getAdvice = () => {
    // 개인화된 점수가 있으면 사용, 없으면 기본 점수 사용
    const score = birthAnalysis ? personalizedScore.personalScore : chart.overallFortune.score;

    if (score >= 75) {
      return {
        icon: '🌟',
        title: '오늘은 매우 좋은 날입니다!',
        description: '중요한 일을 진행하기에 최적의 시간입니다.',
        color: 'green',
      };
    } else if (score >= 60) {
      return {
        icon: '✨',
        title: '오늘은 좋은 날입니다',
        description: '계획했던 일들을 추진하기 좋습니다.',
        color: 'blue',
      };
    } else if (score >= 40) {
      return {
        icon: '⚖️',
        title: '오늘은 평범한 날입니다',
        description: '무난하게 하루를 보내기 좋습니다.',
        color: 'gray',
      };
    } else if (score >= 25) {
      return {
        icon: '⚠️',
        title: '오늘은 주의가 필요합니다',
        description: '중요한 결정은 신중하게 하세요.',
        color: 'orange',
      };
    } else {
      return {
        icon: '❌',
        title: '오늘은 조심하세요',
        description: '중요한 일은 미루는 것이 좋습니다.',
        color: 'red',
      };
    }
  };

  const advice = getAdvice();

  // 색상 클래스
  const colorClasses = {
    green: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
      text: 'text-green-900 dark:text-green-300',
      textLight: 'text-green-700 dark:text-green-400',
    },
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-900 dark:text-blue-300',
      textLight: 'text-blue-700 dark:text-blue-400',
    },
    gray: {
      bg: 'bg-gray-50 dark:bg-gray-700',
      border: 'border-gray-200 dark:border-gray-600',
      text: 'text-gray-900 dark:text-gray-300',
      textLight: 'text-gray-700 dark:text-gray-400',
    },
    orange: {
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      border: 'border-orange-200 dark:border-orange-800',
      text: 'text-orange-900 dark:text-orange-300',
      textLight: 'text-orange-700 dark:text-orange-400',
    },
    red: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-900 dark:text-red-300',
      textLight: 'text-red-700 dark:text-red-400',
    },
  };

  const colors = colorClasses[advice.color as keyof typeof colorClasses];

  return (
    <div className="mb-6 space-y-4">
      {/* 고객 정보 표시 (고객이 선택된 경우) */}
      {customerName && customerBirthDate && (
        <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-700 rounded-xl">
          <div className="flex items-center justify-center gap-2 text-purple-700 dark:text-purple-300">
            <span className="text-xl">👤</span>
            <span className="font-bold">{customerName}</span>
            <span className="text-sm">({customerBirthDate})</span>
            <span className="ml-2 text-sm">님 맞춤 분석</span>
          </div>
        </div>
      )}

      {/* 개인 오행 분석 카드 (고객이 선택된 경우) */}
      {birthAnalysis && (
        <div className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 border border-indigo-200 dark:border-indigo-700 rounded-xl">
          <div className="flex items-start gap-3">
            <div className="text-4xl">{birthAnalysis.characteristics.icon}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-300">
                  당신의 오행: {birthAnalysis.characteristics.element}
                  {' '}({birthAnalysis.characteristics.englishName})
                </h3>
                <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded text-xs font-medium">
                  {birthAnalysis.year}년생 {birthAnalysis.stem}
                </span>
              </div>
              <p className="text-sm text-indigo-700 dark:text-indigo-400 mb-2">
                {birthAnalysis.characteristics.personality}
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-white/50 dark:bg-gray-800/50 rounded">
                  <span className="font-semibold">유리한 방위:</span> {birthAnalysis.characteristics.favorableDirection}
                </div>
                <div className="p-2 bg-white/50 dark:bg-gray-800/50 rounded">
                  <span className="font-semibold">유리한 계절:</span> {birthAnalysis.characteristics.favorableSeason}
                </div>
              </div>
              <div className="mt-2 p-2 bg-indigo-100 dark:bg-indigo-900/40 rounded text-xs text-indigo-800 dark:text-indigo-300">
                💡 <strong>맞춤 조언:</strong> {birthAnalysis.characteristics.advice}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 오늘의 운세 */}
      <div className={`p-6 rounded-xl border ${colors.bg} ${colors.border}`}>
        <div className="flex items-start gap-4">
          <div className="text-5xl">{advice.icon}</div>
          <div className="flex-1">
            <h3 className={`text-2xl font-bold mb-2 ${colors.text}`}>
              {advice.title}
            </h3>
            <p className={`text-lg ${colors.textLight}`}>
              {advice.description}
            </p>
          </div>
        </div>
      </div>

      {/* 간단 안내 */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* 좋은 방향 */}
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
          <h4 className="font-bold text-green-900 dark:text-green-300 mb-3 flex items-center gap-2">
            <span className="text-2xl">👍</span>
            <span>오늘 좋은 방향</span>
          </h4>
          <div className="space-y-2">
            {bestPalaces.slice(0, 3).map((palace) => {
              const palaceInfo = chart.palaces[palace];
              return (
                <div key={palace} className="flex items-center gap-3 p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                  <div className="text-2xl">🧭</div>
                  <div>
                    <div className="font-bold text-green-900 dark:text-green-300">
                      {palaceInfo.direction} ({palace}궁)
                    </div>
                    <div className="text-xs text-green-700 dark:text-green-400">
                      {getSimpleDescription(palaceInfo.gate, palaceInfo.star)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 p-3 bg-green-100 dark:bg-green-900/40 rounded-lg">
            <p className="text-sm text-green-800 dark:text-green-300">
              💡 <strong>활용 팁:</strong> 중요한 약속이나 여행은 이 방향으로!
            </p>
          </div>
        </div>

        {/* 피해야 할 방향 */}
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
          <h4 className="font-bold text-red-900 dark:text-red-300 mb-3 flex items-center gap-2">
            <span className="text-2xl">⚠️</span>
            <span>주의할 방향</span>
          </h4>
          <div className="space-y-2">
            {worstPalaces.slice(0, 3).map((palace) => {
              const palaceInfo = chart.palaces[palace];
              return (
                <div key={palace} className="flex items-center gap-3 p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                  <div className="text-2xl">🚫</div>
                  <div>
                    <div className="font-bold text-red-900 dark:text-red-300">
                      {palaceInfo.direction} ({palace}궁)
                    </div>
                    <div className="text-xs text-red-700 dark:text-red-400">
                      {getSimpleWarning(palaceInfo.gate, palaceInfo.star)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 p-3 bg-red-100 dark:bg-red-900/40 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-300">
              💡 <strong>주의 사항:</strong> 가능하면 이 방향은 피하세요
            </p>
          </div>
        </div>
      </div>

      {/* 상황별 추천 */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
        <h4 className="font-bold text-blue-900 dark:text-blue-300 mb-3 flex items-center gap-2">
          <span className="text-xl">💼</span>
          <span>상황별 추천 방향</span>
        </h4>
        <div className="grid md:grid-cols-2 gap-3">
          {getSituationAdvice(chart, birthAnalysis).map((item, idx) => (
            <div key={idx} className="flex items-start gap-2 p-2 bg-white/50 dark:bg-gray-800/50 rounded">
              <span className="text-xl">{item.icon}</span>
              <div className="flex-1">
                <div className="font-semibold text-sm text-blue-900 dark:text-blue-300">{item.situation}</div>
                <div className="text-xs text-blue-700 dark:text-blue-400">{item.direction}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 간단한 설명 생성
function getSimpleDescription(gate: string, _star: string): string {
  const descriptions: Record<string, string> = {
    휴문: '휴식과 회복에 좋음',
    생문: '새로운 시작에 좋음',
    경문: '명예와 성공에 좋음',
    개문: '기회를 잡기 좋음',
    놀문: '변화와 도전',
    상문: '갈등 주의',
    두문: '막힘과 어려움',
    사문: '종결과 마무리',
  };
  return descriptions[gate] || '평범한 기운';
}

// 간단한 경고 생성
function getSimpleWarning(gate: string, _star: string): string {
  const warnings: Record<string, string> = {
    상문: '다툼이나 갈등 조심',
    두문: '일이 막힐 수 있음',
    사문: '중요한 일 미루기',
    놀문: '예상치 못한 변화',
    휴문: '지나친 안주 주의',
    생문: '무리한 확장 주의',
    경문: '허영심 주의',
    개문: '방어력 약화',
  };
  return warnings[gate] || '주의가 필요함';
}

// 상황별 조언
function getSituationAdvice(chart: QimenChart, birthAnalysis?: BirthYearAnalysis | null) {
  const bestPalace = chart.overallFortune.bestPalaces[0];
  const bestDirection = chart.palaces[bestPalace].direction;

  const baseAdvice = [
    { icon: '🚗', situation: '여행/출장', direction: `${bestDirection} 방향으로` },
    { icon: '💼', situation: '중요한 미팅', direction: `${bestDirection} 방향 장소 추천` },
    { icon: '💰', situation: '재물운', direction: `${bestDirection} 방향 투자처` },
    { icon: '👥', situation: '사람 만나기', direction: `${bestDirection} 방향에서` },
  ];

  // 개인화된 조언 추가 (오행 기반)
  if (birthAnalysis) {
    const favorableDir = birthAnalysis.characteristics.favorableDirection;
    baseAdvice.push({
      icon: birthAnalysis.characteristics.icon,
      situation: `${birthAnalysis.characteristics.element} 기운 활용`,
      direction: `${favorableDir} 방향이 특히 유리`,
    });
  }

  return baseAdvice;
}
