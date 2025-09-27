import React from 'react';

// 오행 원소 타입
export type WuxingElement = 'wood' | 'fire' | 'earth' | 'metal' | 'water';

// 음양 타입
export type YinyangType = 'yin' | 'yang';

interface WuxingIconProps {
  element: WuxingElement;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'filled' | 'outline' | 'gradient';
  className?: string;
}

interface YinyangIconProps {
  type?: YinyangType;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  className?: string;
}

// 오행 아이콘 컴포넌트
export function WuxingIcon({ element, size = 'md', variant = 'filled', className = '' }: WuxingIconProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const elementConfig = {
    wood: {
      icon: '🌲',
      symbol: '木',
      korean: '목',
      color: 'wuxing-wood',
      gradient: 'from-green-400 to-emerald-600',
    },
    fire: {
      icon: '🔥',
      symbol: '火',
      korean: '화',
      color: 'wuxing-fire',
      gradient: 'from-red-400 to-orange-600',
    },
    earth: {
      icon: '🏔️',
      symbol: '土',
      korean: '토',
      color: 'wuxing-earth',
      gradient: 'from-yellow-400 to-amber-600',
    },
    metal: {
      icon: '⚡',
      symbol: '金',
      korean: '금',
      color: 'wuxing-metal',
      gradient: 'from-gray-300 to-zinc-500',
    },
    water: {
      icon: '💧',
      symbol: '水',
      korean: '수',
      color: 'wuxing-water',
      gradient: 'from-blue-400 to-indigo-600',
    },
  };

  const config = elementConfig[element];

  const baseClasses = `
    ${sizeClasses[size]}
    inline-flex items-center justify-center rounded-full
    transition-all duration-300 hover:scale-110
    ${className}
  `;

  if (variant === 'gradient') {
    return (
      <div className={`${baseClasses} bg-gradient-to-br ${config.gradient} text-white shadow-lg`}>
        <span className="text-sm font-bold">{config.symbol}</span>
      </div>
    );
  }

  if (variant === 'outline') {
    return (
      <div className={`${baseClasses} border-2 border-${config.color} text-${config.color} bg-transparent hover:bg-${config.color}/10`}>
        <span className="text-sm font-bold">{config.symbol}</span>
      </div>
    );
  }

  // filled variant (default)
  return (
    <div className={`${baseClasses} bg-${config.color} text-white shadow-md`}>
      <span className="text-sm font-bold">{config.symbol}</span>
    </div>
  );
}

// 음양 아이콘 컴포넌트
export function YinyangIcon({ type, size = 'md', animated = false, className = '' }: YinyangIconProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const animationClass = animated ? 'animate-spin' : '';

  if (type === 'yin') {
    return (
      <div className={`${sizeClasses[size]} ${animationClass} ${className}`}>
        <div className="w-full h-full bg-yinyang-yin rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg">
          陰
        </div>
      </div>
    );
  }

  if (type === 'yang') {
    return (
      <div className={`${sizeClasses[size]} ${animationClass} ${className}`}>
        <div className="w-full h-full bg-yinyang-yang rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg">
          陽
        </div>
      </div>
    );
  }

  // 음양 통합 아이콘 (기본)
  return (
    <div className={`${sizeClasses[size]} ${animationClass} ${className} relative`}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* 음양 심볼 */}
        <circle cx="50" cy="50" r="48" fill="black" stroke="#666" strokeWidth="2"/>
        <path d="M50,2 A48,48 0 0,1 50,98 A24,24 0 0,1 50,50 A24,24 0 0,0 50,2 Z" fill="white"/>
        <circle cx="50" cy="25" r="8" fill="black"/>
        <circle cx="50" cy="75" r="8" fill="white"/>
      </svg>
    </div>
  );
}

// 오행 순환 다이어그램 컴포넌트
interface WuxingCycleProps {
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  highlightElement?: WuxingElement;
  className?: string;
}

export function WuxingCycle({ size = 'md', showLabels = true, highlightElement, className = '' }: WuxingCycleProps) {
  const sizeClasses = {
    sm: 'w-32 h-32',
    md: 'w-48 h-48',
    lg: 'w-64 h-64',
  };

  const elements: WuxingElement[] = ['wood', 'fire', 'earth', 'metal', 'water'];

  const positions = [
    { x: 50, y: 10 },   // wood (top)
    { x: 85, y: 35 },   // fire (top-right)
    { x: 70, y: 80 },   // earth (bottom-right)
    { x: 30, y: 80 },   // metal (bottom-left)
    { x: 15, y: 35 },   // water (top-left)
  ];

  return (
    <div className={`${sizeClasses[size]} ${className} relative`}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* 오행 순환 연결선 */}
        <path
          d="M50,10 L85,35 L70,80 L30,80 L15,35 Z"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="1"
          strokeDasharray="2,2"
        />

        {/* 오행 원소들 */}
        {elements.map((element, index) => {
          const position = positions[index];
          const isHighlighted = highlightElement === element;

          return (
            <g key={element}>
              <circle
                cx={position.x}
                cy={position.y}
                r={isHighlighted ? '8' : '6'}
                className={`fill-wuxing-${element} ${isHighlighted ? 'opacity-100' : 'opacity-70'} transition-all duration-300`}
              />
              {showLabels && (
                <text
                  x={position.x}
                  y={position.y + 15}
                  textAnchor="middle"
                  className="text-xs font-medium fill-gray-600 dark:fill-gray-400"
                >
                  {element === 'wood' && '木'}
                  {element === 'fire' && '火'}
                  {element === 'earth' && '土'}
                  {element === 'metal' && '金'}
                  {element === 'water' && '水'}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// 오행 호환성 인디케이터
interface WuxingCompatibilityProps {
  element1: WuxingElement;
  element2: WuxingElement;
  showDetails?: boolean;
  className?: string;
}

export function WuxingCompatibility({ element1, element2, showDetails = false, className = '' }: WuxingCompatibilityProps) {
  // 오행 상생/상극 관계
  const relationships = {
    wood: { generates: 'fire', destroys: 'earth' },
    fire: { generates: 'earth', destroys: 'metal' },
    earth: { generates: 'metal', destroys: 'water' },
    metal: { generates: 'water', destroys: 'wood' },
    water: { generates: 'wood', destroys: 'fire' },
  };

  const getRelationship = (elem1: WuxingElement, elem2: WuxingElement) => {
    if (elem1 === elem2) return 'same';
    if (relationships[elem1].generates === elem2) return 'generates';
    if (relationships[elem1].destroys === elem2) return 'destroys';
    if (relationships[elem2].generates === elem1) return 'generated';
    if (relationships[elem2].destroys === elem1) return 'destroyed';
    return 'neutral';
  };

  const relationship = getRelationship(element1, element2);

  const relationshipConfig = {
    same: { color: 'blue', symbol: '=', label: '동일', description: '같은 기운' },
    generates: { color: 'green', symbol: '→', label: '상생', description: '서로 도움' },
    generated: { color: 'green', symbol: '←', label: '상생', description: '서로 도움' },
    destroys: { color: 'red', symbol: '⚡', label: '상극', description: '서로 충돌' },
    destroyed: { color: 'red', symbol: '⚡', label: '상극', description: '서로 충돌' },
    neutral: { color: 'gray', symbol: '~', label: '중립', description: '보통 관계' },
  };

  const config = relationshipConfig[relationship];

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <WuxingIcon element={element1} size="sm" />
      <div className={`flex items-center space-x-1 text-${config.color}-600`}>
        <span className="text-sm font-bold">{config.symbol}</span>
        {showDetails && (
          <span className="text-xs">{config.label}</span>
        )}
      </div>
      <WuxingIcon element={element2} size="sm" />
      {showDetails && (
        <span className="text-xs text-gray-500 ml-2">({config.description})</span>
      )}
    </div>
  );
}

// 전통 패턴 배경 컴포넌트
interface TraditionalPatternProps {
  pattern?: 'clouds' | 'waves' | 'mountains' | 'bamboo';
  opacity?: number;
  className?: string;
}

export function TraditionalPattern({ pattern = 'clouds', opacity = 0.1, className = '' }: TraditionalPatternProps) {
  const patterns = {
    clouds: 'M10,20 Q15,10 20,20 Q25,10 30,20 Q35,10 40,20',
    waves: 'M0,15 Q5,5 10,15 Q15,25 20,15 Q25,5 30,15 Q35,25 40,15',
    mountains: 'M0,25 L5,15 L10,20 L15,10 L20,20 L25,15 L30,25 L35,10 L40,25',
    bamboo: 'M10,5 L10,25 M15,8 L15,25 M20,5 L20,25',
  };

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      <svg
        className="w-full h-full"
        style={{ opacity }}
        viewBox="0 0 40 30"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern id={pattern} x="0" y="0" width="40" height="30" patternUnits="userSpaceOnUse">
            <path
              d={patterns[pattern]}
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-gray-400 dark:text-gray-600"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${pattern})`} />
      </svg>
    </div>
  );
}