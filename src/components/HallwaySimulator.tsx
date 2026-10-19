import React, { useState } from 'react';
import { HallwayType, HallwayPreset, ObstacleItem } from '../types';
import { ShieldCheck, AlertTriangle, AlertOctagon, CheckCircle2, Flame, Bike, Box, Baby, Trash2, ArrowRight, User, Stethoscope, RefreshCw } from 'lucide-react';
import { sound } from '../utils/audio';

const HALLWAY_PRESETS: HallwayPreset[] = [
  {
    id: 'single',
    name: '단면 복도 (한쪽 세대)',
    widthCm: 140,
    description: '한쪽에만 현관문이 있는 표준 계단식 아파트 복도',
    legalMinWidthCm: 120, // 건축법상 단면복도 120cm 이상
  },
  {
    id: 'double',
    name: '양면 복도 (양쪽 세대)',
    widthCm: 180,
    description: '양쪽에 마주보는 세대가 있는 타워형/복도식 아파트 복도',
    legalMinWidthCm: 150, // 건축법상 양면복도 150cm 이상
  },
  {
    id: 'narrow',
    name: '구형 좁은 복도',
    widthCm: 120,
    description: '구축 아파트 또는 비상계단 연결 좁은 통로',
    legalMinWidthCm: 120,
  },
];

const AVAILABLE_OBSTACLES: ObstacleItem[] = [
  {
    id: 'kickboard',
    name: '어린이 킥보드 (씽씽이)',
    category: 'mobility',
    widthCm: 35,
    riskLevel: 'high',
    icon: '🛴',
    description: '손잡이와 바퀴가 튀어나와 야간 보행 시 발에 걸려 넘어지기 쉬움',
    fireCodeRisk: '어두운 화재 연기 속 피난민 전도 사고 1위 원인',
  },
  {
    id: 'bicycle',
    name: '어린이 자전거',
    category: 'mobility',
    widthCm: 50,
    riskLevel: 'high',
    icon: '🚲',
    description: '가로 폭이 넓고 페달이 뾰족해 통행 폭을 심각하게 잠식함',
    fireCodeRisk: '119 구급대 들것(60cm) 및 휠체어 진입 전면 차단',
  },
  {
    id: 'delivery_box',
    name: '대형 배송 택배박스',
    category: 'delivery',
    widthCm: 45,
    riskLevel: 'medium',
    icon: '📦',
    description: '문 앞에 쌓아두어 비상구 시야를 가리고 걸림돌 형성',
    fireCodeRisk: '화재 발생 시 불이 옮겨붙는 가연성 적재물 위험',
  },
  {
    id: 'stroller',
    name: '접이식 유모차',
    category: 'household',
    widthCm: 55,
    riskLevel: 'high',
    icon: '🚼',
    description: '부피가 매우 커서 복도 중앙까지 침범하기 쉬움',
    fireCodeRisk: '소방법 제16조 피난장애 금지 위반 대상',
  },
  {
    id: 'recycling',
    name: '분리수거 박스 / 화분',
    category: 'household',
    widthCm: 30,
    riskLevel: 'medium',
    icon: '🪴',
    description: '바닥에 방치되어 발 디딜 틈을 좁힘',
    fireCodeRisk: '비상 대피 시 미끄러짐 및 파손 파편 위험',
  },
];

export const HallwaySimulator: React.FC = () => {
  const [selectedFloor, setSelectedFloor] = useState<string>('5');
  const [selectedHallwayType, setSelectedHallwayType] = useState<HallwayType>('single');
  const [activeObstacleIds, setActiveObstacleIds] = useState<string[]>(['kickboard', 'delivery_box']);
  const [stretcherSimulationActive, setStretcherSimulationActive] = useState<boolean>(false);

  const currentPreset = HALLWAY_PRESETS.find((p) => p.id === selectedHallwayType) || HALLWAY_PRESETS[0];

  // Calculate widths
  const activeObstacles = AVAILABLE_OBSTACLES.filter((item) => activeObstacleIds.includes(item.id));
  const totalObstacleWidth = activeObstacles.reduce((sum, item) => sum + item.widthCm, 0);
  const netPassageWidth = Math.max(15, currentPreset.widthCm - totalObstacleWidth);
  const obstacleRatio = Math.min(100, Math.round((totalObstacleWidth / currentPreset.widthCm) * 100));

  // Safety level classification
  let safetyStatus: 'safe' | 'caution' | 'hazard' = 'safe';
  if (netPassageWidth < 90) {
    safetyStatus = 'hazard';
  } else if (netPassageWidth < currentPreset.legalMinWidthCm) {
    safetyStatus = 'caution';
  } else {
    safetyStatus = 'safe';
  }

  // Toggle obstacle selection
  const toggleObstacle = (id: string) => {
    setActiveObstacleIds((prev) => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter((item) => item !== id) : [...prev, id];
      sound.playChime(!exists);
      return next;
    });
  };

  const clearAllObstacles = () => {
    setActiveObstacleIds([]);
    sound.playChime(true);
  };

  const setHazardScenario = () => {
    setActiveObstacleIds(['kickboard', 'bicycle', 'stroller', 'delivery_box']);
    sound.playThud(0.8);
  };

  const triggerStretcherTest = () => {
    setStretcherSimulationActive(true);
    sound.playChime(safetyStatus === 'safe');
    setTimeout(() => {
      setStretcherSimulationActive(false);
    }, 4000);
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-1.5">
            <span>🛡️ 안전 제1구역</span>
            <span>공동현관 & 대피복도</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            복도 공간 안전 및 비상통행 지수
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            우리 집 앞 복도에 둔 킥보드나 자전거, 택배 박스가 화재 비상대피와 119 구급대 들것 이동에 미치는 영향을 실시간으로 계산합니다.
          </p>
        </div>

        {/* Quick Scenario Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={clearAllObstacles}
            className="px-3 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>장애물 전부 치우기 (클린 복도)</span>
          </button>
          <button
            onClick={setHazardScenario}
            className="px-3 py-1.5 rounded-xl border border-rose-300 bg-rose-50 text-rose-800 hover:bg-rose-100 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>위험 적치 상태 재현</span>
          </button>
        </div>
      </div>

      {/* Controls & Configuration Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Floor & Hallway Type Selection */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span>📍 위치 및 층수 선택</span>
            </label>
            <span className="text-xs text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-md">
              김민준 학생 댁은 5층!
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[
              { id: '1', label: '1층 로비' },
              { id: '3', label: '3층 저층' },
              { id: '5', label: '5층 (민준이네)' },
              { id: '10', label: '10층 고층' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  setSelectedFloor(f.id);
                  sound.playChime(true);
                }}
                className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all text-center ${
                  selectedFloor === f.id
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
              📐 복도 구조 타입
            </label>
            <div className="grid grid-cols-3 gap-2">
              {HALLWAY_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => {
                    setSelectedHallwayType(preset.id);
                    sound.playChime(true);
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    selectedHallwayType === preset.id
                      ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <p className="text-xs font-bold text-slate-800">{preset.name}</p>
                  <p className="text-[11px] text-indigo-600 font-semibold mt-0.5">기본 {preset.widthCm}cm</p>
                  <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">{preset.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Real-time Status Card */}
        <div
          className={`rounded-2xl p-5 border transition-all shadow-xs flex flex-col justify-between ${
            safetyStatus === 'safe'
              ? 'bg-linear-to-br from-emerald-50 via-teal-50 to-white border-emerald-300'
              : safetyStatus === 'caution'
              ? 'bg-linear-to-br from-amber-50 via-yellow-50 to-white border-amber-300'
              : 'bg-linear-to-br from-rose-50 via-red-50 to-white border-rose-300'
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                실시간 통행 안전 지수
              </span>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full border shadow-xs flex items-center gap-1 ${
                  safetyStatus === 'safe'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : safetyStatus === 'caution'
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-rose-100 text-rose-900 border-rose-300 animate-pulse'
                }`}
              >
                {safetyStatus === 'safe' && <CheckCircle2 className="w-3.5 h-3.5" />}
                {safetyStatus === 'caution' && <AlertTriangle className="w-3.5 h-3.5" />}
                {safetyStatus === 'hazard' && <AlertOctagon className="w-3.5 h-3.5" />}
                <span>
                  {safetyStatus === 'safe'
                    ? '안전 (Safe)'
                    : safetyStatus === 'caution'
                    ? '주의 (Caution)'
                    : '위험 (Hazard)'}
                </span>
              </span>
            </div>

            {/* Big Metrics Display */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-white/80 backdrop-blur-xs rounded-xl p-3 border border-slate-200">
                <span className="text-[11px] text-slate-500 font-medium">실제 통행 가능 유효 너비</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span
                    className={`text-2xl font-black ${
                      safetyStatus === 'safe'
                        ? 'text-emerald-700'
                        : safetyStatus === 'caution'
                        ? 'text-amber-700'
                        : 'text-rose-700'
                    }`}
                  >
                    {netPassageWidth}
                  </span>
                  <span className="text-xs font-bold text-slate-500">cm</span>
                  <span className="text-[11px] text-slate-400 ml-1">/ 원래 {currentPreset.widthCm}cm</span>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-xs rounded-xl p-3 border border-slate-200">
                <span className="text-[11px] text-slate-500 font-medium">장애물 복도 점유율</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span
                    className={`text-2xl font-black ${
                      obstacleRatio < 20
                        ? 'text-emerald-700'
                        : obstacleRatio < 40
                        ? 'text-amber-700'
                        : 'text-rose-700'
                    }`}
                  >
                    {obstacleRatio}
                  </span>
                  <span className="text-xs font-bold text-slate-500">%</span>
                  <span className="text-[11px] text-slate-400 ml-1">침범</span>
                </div>
              </div>
            </div>

            {/* Legal Standard Comparison Bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="text-slate-600">피난통로 법정 최소 규격 대비</span>
                <span className="text-indigo-600">법적 기준: {currentPreset.legalMinWidthCm}cm 이상</span>
              </div>
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden flex">
                <div
                  className={`h-full transition-all duration-300 ${
                    safetyStatus === 'safe'
                      ? 'bg-emerald-500'
                      : safetyStatus === 'caution'
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${Math.min(100, (netPassageWidth / currentPreset.widthCm) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Advice Message */}
          <div className="mt-3 text-xs leading-relaxed text-slate-700 bg-white/70 rounded-xl p-2.5 border border-slate-200/60">
            {safetyStatus === 'safe' && (
              <p className="flex items-start gap-1.5 text-emerald-900 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>통행 안전 기준 충족!</strong> 119 구급대 들것(폭 60cm)과 휠체어(폭 80cm)가 부드럽게 통과할 수 있으며 화재 비상대피로가 확보되어 있습니다.
                </span>
              </p>
            )}
            {safetyStatus === 'caution' && (
              <p className="flex items-start gap-1.5 text-amber-900 font-medium">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>비상 대피 지체 우려!</strong> 어른 1명은 지나갈 수 있지만 양손에 짐을 들거나 어린이·노약자 비상 대피 시 부딪힐 수 있습니다.
                </span>
              </p>
            )}
            {safetyStatus === 'hazard' && (
              <p className="flex items-start gap-1.5 text-rose-900 font-medium">
                <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>
                  <strong>소방법 위반 및 피난 불가!</strong> 유효 너비가 90cm 미만으로 119 구급대 들것 진입이 불가능하며 화재 연기 속에서 걸려 넘어질 위험이 매우 큽니다.
                </span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Hallway Visualizer (Top-Down Architectural View) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>🗺️ {selectedFloor}층 복도 실시간 조감도 & 시뮬레이션</span>
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-normal">
                상공에서 내려다본 투시도 (Top-down View)
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              장애물이 복도를 얼마나 막고 있는지 실제 비율로 시각화합니다.
            </p>
          </div>

          {/* Stretcher Test Button */}
          <button
            onClick={triggerStretcherTest}
            disabled={stretcherSimulationActive}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-xs ${
              stretcherSimulationActive
                ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                : 'bg-red-600 text-white hover:bg-red-700 shadow-red-200'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>{stretcherSimulationActive ? '🚑 들것 통과 테스트 진행 중...' : '🚑 119 구급 들것 통과 테스트'}</span>
          </button>
        </div>

        {/* The SVG/Canvas Hallway View */}
        <div className="relative w-full h-64 sm:h-72 bg-slate-100 rounded-2xl overflow-hidden border border-slate-300 p-2 select-none">
          {/* Hallway Floor Pattern */}
          <div
            className="w-full h-full relative rounded-xl overflow-hidden flex flex-col justify-between"
            style={{
              backgroundColor: '#e2e8f0',
              backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
              backgroundSize: '16px 16px',
            }}
          >
            {/* Top Wall with Doors */}
            <div className="h-14 bg-slate-700 text-white flex items-center justify-between px-6 border-b-4 border-slate-900 relative">
              <div className="flex items-center gap-6">
                <div className="bg-amber-600 px-3 py-1 rounded text-xs font-bold border border-amber-300 shadow-xs flex items-center gap-1">
                  <span>🚪</span>
                  <span>{selectedFloor}01호 이웃집</span>
                </div>
                <div className="bg-indigo-600 px-3 py-1 rounded text-xs font-bold border border-indigo-300 shadow-xs flex items-center gap-1 ring-2 ring-indigo-400">
                  <span>🏠</span>
                  <span>{selectedFloor}02호 민준이네</span>
                </div>
              </div>

              {/* Fire Extinguisher on wall */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-red-600 px-2 py-0.5 rounded text-[11px] font-bold text-white shadow-xs">
                  <Flame className="w-3.5 h-3.5 text-yellow-300" />
                  <span>비상소화전</span>
                </div>
                <div className="text-[11px] text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
                  엘리베이터 방향 ➡️
                </div>
              </div>
            </div>

            {/* Middle: Walking Corridor / Obstacle Zone */}
            <div className="flex-1 relative flex items-center px-4 overflow-hidden">
              {/* Emergency Evacuation Arrow Indicator on floor */}
              <div className="absolute inset-0 flex items-center justify-around pointer-events-none opacity-20">
                <ArrowRight className="w-12 h-12 text-slate-500" />
                <ArrowRight className="w-12 h-12 text-slate-500" />
                <ArrowRight className="w-12 h-12 text-slate-500" />
                <ArrowRight className="w-12 h-12 text-slate-500" />
              </div>

              {/* Min-jun avatar walking or blocked */}
              <div
                className={`absolute top-1/2 -translate-y-1/2 z-20 flex flex-col items-center transition-all duration-700 ${
                  stretcherSimulationActive ? 'left-[10%] opacity-40' : 'left-[18%]'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-md border-2 ${
                    safetyStatus === 'safe'
                      ? 'bg-emerald-500 text-white border-white'
                      : safetyStatus === 'caution'
                      ? 'bg-amber-500 text-white border-white animate-bounce'
                      : 'bg-rose-500 text-white border-white'
                  }`}
                >
                  👦
                </div>
                <span className="text-[10px] font-bold bg-white/90 text-slate-800 px-1.5 py-0.5 rounded shadow-xs mt-1 whitespace-nowrap">
                  민준이 (보행자)
                </span>
              </div>

              {/* Dynamic Obstacles Placed along the wall */}
              <div className="absolute right-[22%] top-1/2 -translate-y-1/2 flex items-center gap-3 z-10 flex-wrap max-w-[50%]">
                {activeObstacles.length === 0 ? (
                  <div className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-lg border border-emerald-300 shadow-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>장애물 없음! 100% 쾌적한 피난 통로</span>
                  </div>
                ) : (
                  activeObstacles.map((obs) => (
                    <div
                      key={obs.id}
                      className="bg-white/95 rounded-xl p-2 border-2 border-slate-400 shadow-md flex items-center gap-2 transform hover:scale-105 transition-transform"
                    >
                      <span className="text-xl">{obs.icon}</span>
                      <div className="text-left">
                        <p className="text-[11px] font-bold text-slate-800 leading-tight">{obs.name}</p>
                        <p className="text-[10px] font-semibold text-rose-600">폭 {obs.widthCm}cm 점유</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Dynamic Width Clearance Measurement Line */}
              <div className="absolute left-[35%] bottom-3 z-20 flex flex-col items-center">
                <div className="flex items-center gap-1 bg-slate-900/90 text-white text-[11px] font-mono px-2 py-0.5 rounded shadow-sm">
                  <span>남은 통로 폭:</span>
                  <span
                    className={`font-bold ${
                      safetyStatus === 'safe'
                        ? 'text-emerald-400'
                        : safetyStatus === 'caution'
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {netPassageWidth} cm
                  </span>
                </div>
                <div className="w-32 h-1 bg-indigo-500 rounded-full mt-1 relative flex justify-between items-center">
                  <div className="w-2 h-2 rounded-full bg-indigo-700 -ml-1" />
                  <div className="w-2 h-2 rounded-full bg-indigo-700 -mr-1" />
                </div>
              </div>

              {/* 119 Ambulance Stretcher Simulator Animation */}
              {stretcherSimulationActive && (
                <div
                  className={`absolute top-1/2 -translate-y-1/2 z-30 transition-all duration-3000 ease-in-out flex items-center gap-2 bg-white/95 rounded-xl p-2.5 shadow-2xl border-2 ${
                    safetyStatus === 'safe'
                      ? 'left-[70%] border-emerald-500 ring-4 ring-emerald-300'
                      : safetyStatus === 'caution'
                      ? 'left-[45%] border-amber-500 ring-4 ring-amber-300'
                      : 'left-[32%] border-rose-600 ring-4 ring-rose-400 animate-shake'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-sm">
                    🚑
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">119 구급대 들것 (폭 60cm)</p>
                    <p
                      className={`text-[10px] font-semibold ${
                        safetyStatus === 'safe'
                          ? 'text-emerald-600'
                          : safetyStatus === 'caution'
                          ? 'text-amber-600'
                          : 'text-rose-600'
                      }`}
                    >
                      {safetyStatus === 'safe'
                        ? '✅ 비상 환자 이송 통과 성공!'
                        : safetyStatus === 'caution'
                        ? '⚠️ 지체 통과 (위험)'
                        : '❌ 통과 불가! 들것 걸림'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Wall with Emergency Exit Gate */}
            <div className="h-10 bg-slate-700 text-white flex items-center justify-between px-6 border-t-4 border-slate-900 text-xs">
              <span className="text-slate-400 text-[11px]">단지 내 비상 대피 통로</span>
              <div className="flex items-center gap-1.5 bg-emerald-600 px-2 py-0.5 rounded text-[11px] font-bold">
                <span>🏃</span>
                <span>비상계단 피난구 🟢</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Obstacles Selection List (User Interactive Toggles) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>📦 복도 적치물 모의 배치 (클릭하여 켜고 끄기)</span>
            <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-semibold">
              {activeObstacleIds.length}개 적치 중
            </span>
          </h3>
          <span className="text-xs text-slate-500">클릭 시 실시간으로 복도 통행 폭이 감소합니다</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {AVAILABLE_OBSTACLES.map((obstacle) => {
            const isSelected = activeObstacleIds.includes(obstacle.id);
            return (
              <button
                key={obstacle.id}
                onClick={() => toggleObstacle(obstacle.id)}
                className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{obstacle.icon}</span>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">{obstacle.name}</h4>
                      <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                        통행 폭 -{obstacle.widthCm}cm 잠식
                      </span>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-md border flex items-center justify-center text-xs font-bold transition-colors ${
                      isSelected
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected ? '✓' : ''}
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-100 text-[11px] space-y-1">
                  <p className="text-slate-600 leading-tight">{obstacle.description}</p>
                  <p className="text-amber-800 font-medium flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 shrink-0 text-amber-600" />
                    <span>{obstacle.fireCodeRisk}</span>
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Korean Fire Safety & Community Law Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
          <Flame className="w-4 h-4" />
          <span>소방시설 설치 및 관리에 관한 법률 제16조 (피난시설의 유지·관리) 핵심 요약</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          1. <strong>피난시설·방화시설 주위 물건 적치 금지:</strong> 아파트 복도와 계단은 화재 발생 시 주민 전체가 탈출하는 생명선입니다. 자전거, 킥보드, 택배 상자, 분리수거함 등을 복도에 쌓아두는 행위는 과태료 부과 대상(최대 300만원)이 될 수 있습니다.
          <br />
          2. <strong>어린이 킥보드 올바른 주차법:</strong> 킥보드는 번거롭더라도 반드시 <strong>현관문 안쪽 신발장</strong>이나 <strong>아파트 1층 전용 자전거/킥보드 보관대</strong>에 주차해 이웃의 안전한 통행로를 지켜주세요!
        </p>
      </div>
    </div>
  );
};
