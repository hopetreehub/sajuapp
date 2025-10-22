/**
 * 귀문둔갑 3D 구궁도 렌더러
 *
 * Three.js 기반 인터랙티브 3D 시각화
 * @author Claude Code
 * @version 1.0.0
 */

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Box } from '@react-three/drei';
import type { QimenChart, Palace as PalaceKey } from '@/types/qimen';
import { PALACE_GRID } from '@/data/qimenDunjiaData';
import * as THREE from 'three';

interface Qimen3DRendererProps {
  chart: QimenChart;
  selectedPalace: PalaceKey | null;
  onPalaceSelect?: (palace: PalaceKey) => void;
  autoRotate?: boolean;
}

// 3D 궁 큐브 컴포넌트
interface PalaceCubeProps {
  position: [number, number, number];
  palace: PalaceKey;
  palaceData: QimenChart['palaces'][PalaceKey];
  isSelected: boolean;
  onClick: () => void;
}

function PalaceCube({ position, palace, palaceData, isSelected, onClick }: PalaceCubeProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  // 궁의 길흉에 따른 색상
  const color = useMemo(() => {
    switch (palaceData.fortune) {
      case 'excellent':
        return '#10b981'; // 초록
      case 'good':
        return '#3b82f6'; // 파랑
      case 'neutral':
        return '#6b7280'; // 회색
      case 'bad':
        return '#f59e0b'; // 주황
      case 'terrible':
        return '#ef4444'; // 빨강
      default:
        return '#6b7280';
    }
  }, [palaceData.fortune]);

  // 선택된 궁은 펄스 애니메이션
  useFrame((state) => {
    if (meshRef.current && isSelected) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
      meshRef.current.scale.set(scale, scale, scale);
    } else if (meshRef.current) {
      meshRef.current.scale.set(1, 1, 1);
    }
  });

  return (
    <group position={position}>
      {/* 큐브 */}
      <Box
        ref={meshRef}
        args={[1.8, 0.3, 1.8]}
        onClick={onClick}
      >
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isSelected ? 0.5 : 0.1}
          roughness={0.5}
          metalness={0.3}
        />
      </Box>

      {/* 궁 번호 (위) */}
      <Text
        position={[0, 0.3, 0]}
        fontSize={0.4}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {palace}궁
      </Text>

      {/* 방위 (아래) */}
      <Text
        position={[0, -0.5, 0]}
        fontSize={0.25}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {palaceData.direction}
      </Text>

      {/* 9성 (앞) */}
      <Text
        position={[0, 0, 1]}
        fontSize={0.2}
        color="#ffff00"
        anchorX="center"
        anchorY="middle"
      >
        {palaceData.star}
      </Text>

      {/* 8문 (뒤) */}
      <Text
        position={[0, 0, -1]}
        fontSize={0.2}
        color="#00ffff"
        anchorX="center"
        anchorY="middle"
      >
        {palaceData.gate}
      </Text>

      {/* 8신 (왼쪽) */}
      <Text
        position={[-1, 0, 0]}
        fontSize={0.18}
        color="#ff00ff"
        anchorX="center"
        anchorY="middle"
        rotation={[0, Math.PI / 2, 0]}
      >
        {palaceData.god}
      </Text>

      {/* 테두리 (선택된 경우) */}
      {isSelected && (
        <Box args={[2, 0.4, 2]}>
          <meshBasicMaterial color="#ffffff" wireframe />
        </Box>
      )}
    </group>
  );
}

// 메인 3D 씬 컴포넌트
function Scene({
  chart,
  selectedPalace,
  onPalaceSelect,
  autoRotate,
}: Qimen3DRendererProps) {
  const groupRef = useRef<THREE.Group>(null);

  // 자동 회전
  useFrame(() => {
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y += 0.003;
    }
  });

  // 궁 위치 계산 (3x3 그리드)
  const palacePositions = useMemo(() => {
    const positions: Record<PalaceKey, [number, number, number]> = {} as Record<PalaceKey, [number, number, number]>;
    const spacing = 2.5;

    PALACE_GRID.forEach((row, rowIdx) => {
      row.forEach((palace, colIdx) => {
        // 중앙을 원점으로
        const x = (colIdx - 1) * spacing;
        const z = (rowIdx - 1) * spacing;
        positions[palace] = [x, 0, z];
      });
    });

    return positions;
  }, []);

  return (
    <group ref={groupRef}>
      {/* 조명 */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />

      {/* 궁 큐브들 */}
      {Object.entries(chart.palaces).map(([palace, palaceData]) => {
        const palaceKey = Number(palace) as PalaceKey;
        const position = palacePositions[palaceKey];

        return (
          <PalaceCube
            key={palace}
            position={position}
            palace={palaceKey}
            palaceData={palaceData}
            isSelected={selectedPalace === palaceKey}
            onClick={() => onPalaceSelect?.(palaceKey)}
          />
        );
      })}

      {/* 격자 바닥 */}
      <gridHelper args={[15, 15, '#444444', '#222222']} position={[0, -0.5, 0]} />
    </group>
  );
}

// 메인 컴포넌트
function Qimen3DRenderer({
  chart,
  selectedPalace,
  onPalaceSelect,
  autoRotate = true,
}: Qimen3DRendererProps) {
  return (
    <div className="w-full h-full min-h-[600px] bg-gradient-to-b from-gray-900 to-black rounded-xl overflow-hidden shadow-2xl">
      <Canvas
        camera={{
          position: [8, 8, 8],
          fov: 50,
        }}
        gl={{ antialias: true }}
      >
        <Scene
          chart={chart}
          selectedPalace={selectedPalace}
          onPalaceSelect={onPalaceSelect}
          autoRotate={autoRotate}
        />

        {/* 카메라 컨트롤 */}
        <OrbitControls
          enablePan
          enableZoom
          enableRotate
          minDistance={5}
          maxDistance={20}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>

      {/* 범례 */}
      <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm rounded-lg p-4 text-white text-sm">
        <h3 className="font-bold mb-2">색상 범례</h3>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>대길 (Excellent)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span>길 (Good)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-500 rounded"></div>
            <span>중립 (Neutral)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded"></div>
            <span>흉 (Bad)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span>대흉 (Terrible)</span>
          </div>
        </div>

        <h3 className="font-bold mt-4 mb-2">텍스트 색상</h3>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-yellow-400">●</span>
            <span>9성 (앞면)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-cyan-400">●</span>
            <span>8문 (뒷면)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-pink-400">●</span>
            <span>8신 (측면)</span>
          </div>
        </div>
      </div>

      {/* 조작 가이드 */}
      <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm rounded-lg p-4 text-white text-sm">
        <h3 className="font-bold mb-2">조작 방법</h3>
        <ul className="space-y-1">
          <li>🖱️ 드래그: 회전</li>
          <li>🔍 휠: 줌 인/아웃</li>
          <li>👆 클릭: 궁 선택</li>
          <li>🔄 자동 회전 중...</li>
        </ul>
      </div>
    </div>
  );
}

export default React.memo(Qimen3DRenderer);
