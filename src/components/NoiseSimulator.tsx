import React, { useState } from 'react';
import { ActivityLevel, ActivityOption, MitigationItem, MitigationOption, TimeOfDay, TimeSlot } from '../types';
import { Volume2, VolumeX, Moon, Sun, Sunset, AlertCircle, ShieldCheck, HeartHandshake, Sparkles, Smile, Frown, Meh, Play } from 'lucide-react';
import { sound } from '../utils/audio';

const ACTIVITY_OPTIONS: ActivityOption[] = [
  {
    id: 'quiet',
    name: '사뿐사뿐 발끝 걸음',
    dbAdded: 5,
    icon: '🤫',
    description: '발뒤꿈치를 들고 조용히 걷는 닌자 걸음',
  },
  {
    id: 'walking',
    name: '일반 걷기 (발뒤꿈치 쿵쿵)',
    dbAdded: 10,
    icon: '🚶',
    description: '어른이나 아이의 자연스러운 뒤꿈치 충격 걸음',
  },
  {
    id: 'running',
    name: '방과 거실 뛰기 (우다다)',
    dbAdded: 30,
    icon: '🏃',
    description: '친구나 반려동물과 함께 신나게 달리기',
  },
  {
    id: 'jumping',
    name: '소파/침대에서 점프!',
    dbAdded: 45,
    icon: '🦘',
    description: '높은 곳에서 바닥으로 착지할 때의 강한 중량 충격음',
  },
  {
    id: 'ball',
    name: '실내 공 튀기기 (탱탱볼)',
    dbAdded: 40,
    icon: '🏀',
    description: '단단한 공이 연속해서 바닥을 내리치는 반복 충격음',
  },
];

const MITIGATION_OPTIONS: MitigationOption[] = [
  {
    id: 'slippers',
    name: '소음방지 슬리퍼 착용',
    dbReduced: 15,
    icon: '🩴',
    description: '푹신한 EVA 쿠션으로 발뒤꿈치 직접 충격 80% 흡수',
  },
  {
    id: 'mat',
    name: '4cm EVA 층간소음 놀이매트',
    dbReduced: 20,
    icon: '🟩',
    description: '고밀도 폼이 중량 및 경량 충격음 모두 대폭 분산',
  },
  {
    id: 'socks',
    name: '두꺼운 층간소음 덧신/양말',
    dbReduced: 5,
    icon: '🧦',
    description: '가벼운 마찰음과 미세 발소리 완화',
  },
  {
    id: 'pads',
    name: '의자/가구 소음방지 펠트 패드',
    dbReduced: 3,
    icon: '🪑',
    description: '의자 끄는 날카로운 고주파 소음 차단',
  },
];

const TIME_SLOTS: TimeSlot[] = [
  {
    id: 'day',
    name: '주간 활동 시간',
    hours: '08:00 ~ 20:00',
    legalThresholdDb: 39,
    color: 'amber',
    badge: '통상 생활 시간',
  },
  {
    id: 'evening',
    name: '저녁 안식 시간',
    hours: '20:00 ~ 22:00',
    legalThresholdDb: 36,
    color: 'indigo',
    badge: '휴식 및 독서 시간',
  },
  {
    id: 'night',
    name: '심야 취침 시간',
    hours: '22:00 ~ 07:00',
    legalThresholdDb: 34,
    color: 'purple',
    badge: '깊은 수면 시간 (극민감)',
  },
];

export const NoiseSimulator: React.FC = () => {
  const [selectedActivity, setSelectedActivity] = useState<ActivityLevel>('running');
  const [activeMitigations, setActiveMitigations] = useState<MitigationItem[]>(['slippers']);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeOfDay>('evening');
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  const baseDb = 50;
  const currentActivity = ACTIVITY_OPTIONS.find((a) => a.id === selectedActivity) || ACTIVITY_OPTIONS[1];
  const currentTime = TIME_SLOTS.find((t) => t.id === selectedTimeSlot) || TIME_SLOTS[1];

  // Calculate dB
  const totalDbReduced = activeMitigations.reduce((sum, item) => {
    const opt = MITIGATION_OPTIONS.find((m) => m.id === item);
    return sum + (opt ? opt.dbReduced : 0);
  }, 0);

  const peakDb = Math.max(25, baseDb + currentActivity.dbAdded - totalDbReduced);

  // Status according to user rules & legal guidelines
  // Green: Safe < 38dB
  // Yellow: Caution 38-43dB
  // Red: Conflict Risk > 43dB
  let noiseLevel: 'safe' | 'caution' | 'danger' = 'safe';
  if (peakDb > 43) {
    noiseLevel = 'danger';
  } else if (peakDb >= 38) {
    noiseLevel = 'caution';
  } else {
    noiseLevel = 'safe';
  }

  // If nighttime and dB is higher than 34, bump alert sensitivity
  const isNightStrictAlert = selectedTimeSlot === 'night' && peakDb >= 34;

  const toggleMitigation = (id: MitigationItem) => {
    setActiveMitigations((prev) => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter((item) => item !== id) : [...prev, id];
      sound.playChime(!exists);
      return next;
    });
  };

  const playSynthesizedNoise = () => {
    setIsPlayingAudio(true);
    // Intensity scaled by peakDb (range ~ 30 to 80)
    const normalizedIntensity = Math.min(1.0, Math.max(0.1, (peakDb - 25) / 55));
    sound.playThud(normalizedIntensity);

    // Repeated thud for rhythmic feel
    setTimeout(() => {
      sound.playThud(normalizedIntensity * 0.9);
    }, 280);
    setTimeout(() => {
      sound.playThud(normalizedIntensity * 0.85);
      setIsPlayingAudio(false);
    }, 560);
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 mb-1.5">
            <span>🎧 아래층 체감 시뮬레이션</span>
            <span>바닥 충격음 음향 물리학</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            층간소음 쿵쾅지수 시뮬레이터
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            민준이의 행동(뛰기·점프)과 방지 용품(슬리퍼·매트) 착용 여부에 따라, 아래층 402호 이웃 어르신 댁에 전달되는 데시벨(dB)과 심리적 스트레스를 시뮬레이션합니다.
          </p>
        </div>

        {/* Audio Test Trigger */}
        <button
          onClick={playSynthesizedNoise}
          disabled={isPlayingAudio}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-sm ${
            isPlayingAudio
              ? 'bg-indigo-300 text-white cursor-wait'
              : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'
          }`}
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{isPlayingAudio ? '🔊 아래층 소음 재생 중...' : '🔊 아래층 체감 소음 직접 듣기'}</span>
        </button>
      </div>

      {/* Main Grid: Left Controls, Right Gauge & Cross Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Activity & Mitigation Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Time Slot Filter */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <span>⏰ 시간대 선택 (법정 소음 기준 적용)</span>
              </label>
              <span className="text-[11px] text-slate-500">
                현재 기준: <strong className="text-indigo-600">{currentTime.legalThresholdDb} dB</strong> 이하 권장
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {TIME_SLOTS.map((slot) => {
                const isSelected = selectedTimeSlot === slot.id;
                return (
                  <button
                    key={slot.id}
                    onClick={() => {
                      setSelectedTimeSlot(slot.id);
                      sound.playChime(true);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      {slot.id === 'day' && <Sun className="w-4 h-4 text-amber-500" />}
                      {slot.id === 'evening' && <Sunset className="w-4 h-4 text-indigo-500" />}
                      {slot.id === 'night' && <Moon className="w-4 h-4 text-purple-600" />}
                      <span className="text-xs font-bold text-slate-800">{slot.name}</span>
                    </div>
                    <p className="text-[11px] font-mono text-slate-500">{slot.hours}</p>
                    <p className="text-[10px] text-indigo-600 font-semibold mt-1">{slot.badge}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Activity Level Selection */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                🏃 활동 강도 (Activity Level)
              </label>
              <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                +{currentActivity.dbAdded} dB 소음 발생
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ACTIVITY_OPTIONS.map((activity) => {
                const isSelected = selectedActivity === activity.id;
                return (
                  <button
                    key={activity.id}
                    onClick={() => {
                      setSelectedActivity(activity.id);
                      sound.playThud(activity.dbAdded / 45);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <span className="text-2xl shrink-0 mt-0.5">{activity.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-bold text-slate-900 truncate">{activity.name}</p>
                        <span className="text-[10px] font-bold text-rose-600 shrink-0">
                          +{activity.dbAdded}dB
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">{activity.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Noise Mitigation Equipment (Checkboxes) */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <span>🛡️ 소음 완화 장비 (중복 착용 가능)</span>
              </label>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                총 -{totalDbReduced} dB 소음 흡수 중
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {MITIGATION_OPTIONS.map((item) => {
                const isChecked = activeMitigations.includes(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleMitigation(item.id)}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between gap-3 ${
                      isChecked
                        ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-2xl">{item.icon}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{item.name}</p>
                        <p className="text-[10px] text-emerald-700 font-semibold">-{item.dbReduced} dB 감소 효과</p>
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center text-xs font-bold transition-colors shrink-0 ${
                        isChecked
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isChecked ? '✓' : ''}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Animated Gauge & 2-Floor Cutaway (5 cols) */}
        <div className="lg:col-span-5 space-y-4 flex flex-col">
          {/* Animated Gauge Card */}
          <div
            className={`rounded-2xl p-5 border shadow-xs transition-all ${
              noiseLevel === 'safe'
                ? 'bg-linear-to-b from-emerald-50 via-white to-emerald-50/30 border-emerald-200'
                : noiseLevel === 'caution'
                ? 'bg-linear-to-b from-amber-50 via-white to-amber-50/30 border-amber-200'
                : 'bg-linear-to-b from-rose-50 via-white to-rose-50/30 border-rose-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                체감 쿵쾅지수 (소음 게이지)
              </span>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full border shadow-xs ${
                  noiseLevel === 'safe'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : noiseLevel === 'caution'
                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                    : 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse'
                }`}
              >
                {noiseLevel === 'safe' && '안전 (Safe < 38dB)'}
                {noiseLevel === 'caution' && '주의 (Caution 38~43dB)'}
                {noiseLevel === 'danger' && '갈등 위험 (Conflict > 43dB)'}
              </span>
            </div>

            {/* Circular Gauge Representation */}
            <div className="flex flex-col items-center justify-center my-4 relative">
              <div className="relative w-44 h-24 flex items-end justify-center overflow-hidden">
                {/* Gauge Background Arc */}
                <svg className="w-44 h-44 absolute -top-0 left-0" viewBox="0 0 100 100">
                  <path
                    d="M 15 50 A 35 35 0 0 1 85 50"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="10"
                    strokeLinecap="round"
                  />
                  {/* Colored segments */}
                  <path
                    d="M 15 50 A 35 35 0 0 1 45 17"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="10"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 45 17 A 35 35 0 0 1 65 21"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="10"
                  />
                  <path
                    d="M 65 21 A 35 35 0 0 1 85 50"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="10"
                    strokeLinecap="round"
                  />
                </svg>

                {/* Animated Needle */}
                {/* Angle: 25dB -> -90deg, 65dB -> +90deg */}
                <div
                  className="w-1.5 h-16 bg-slate-900 rounded-full origin-bottom transition-transform duration-500 shadow-md"
                  style={{
                    transform: `rotate(${Math.min(90, Math.max(-90, ((peakDb - 25) / 45) * 180 - 90))}deg)`,
                  }}
                />
                <div className="w-5 h-5 rounded-full bg-slate-900 absolute bottom-0 z-10 border-2 border-white shadow-xs" />
              </div>

              {/* Peak dB Big Display */}
              <div className="text-center mt-2">
                <div className="flex items-baseline justify-center gap-1">
                  <span
                    className={`text-4xl font-black ${
                      noiseLevel === 'safe'
                        ? 'text-emerald-600'
                        : noiseLevel === 'caution'
                        ? 'text-amber-600'
                        : 'text-rose-600'
                    }`}
                  >
                    {peakDb}
                  </span>
                  <span className="text-sm font-bold text-slate-500">dB</span>
                </div>
                <p className="text-xs font-semibold text-slate-600 mt-0.5">
                  기본 50dB + ({currentActivity.dbAdded}dB) - ({totalDbReduced}dB)
                </p>
              </div>
            </div>

            {/* Context-Aware Advice Message based on Time & Level */}
            <div className="text-xs leading-relaxed rounded-xl p-3 bg-white/80 border border-slate-200">
              {noiseLevel === 'safe' && (
                <div className="text-emerald-900">
                  <p className="font-bold flex items-center gap-1.5">
                    <Smile className="w-4 h-4 text-emerald-600" />
                    <span>이웃을 배려하는 최고의 매너!</span>
                  </p>
                  <p className="mt-1 text-slate-600">
                    슬리퍼나 놀이매트 덕분에 충격음이 흡수되어 아래층 402호 이웃이 편안하게 휴식할 수 있습니다.
                  </p>
                </div>
              )}

              {noiseLevel === 'caution' && (
                <div className="text-amber-900">
                  <p className="font-bold flex items-center gap-1.5">
                    <Meh className="w-4 h-4 text-amber-600" />
                    <span>주의! 쿵쿵거림이 시작됩니다</span>
                  </p>
                  <p className="mt-1 text-slate-600">
                    발소리가 아래층 천장을 울려 신경 쓰이기 시작합니다. <strong>소음방지 슬리퍼</strong>를 신거나 매트 위에서 놀아주세요!
                  </p>
                </div>
              )}

              {noiseLevel === 'danger' && (
                <div className="text-rose-900">
                  <p className="font-bold flex items-center gap-1.5">
                    <Frown className="w-4 h-4 text-rose-600" />
                    <span>갈등 위험 경보! 아래층 전달 충격 심각</span>
                  </p>
                  <p className="mt-1 text-slate-600">
                    {selectedTimeSlot === 'night'
                      ? '⚠️ 심야 시간에는 작은 점프도 아파트 전체에 지진처럼 울립니다! 즉시 활동을 멈추고 정적인 놀이를 해주세요.'
                      : '점프와 달리기는 슬래브를 직접 때려 아래층 이웃에게 심한 두통과 스트레스를 줍니다.'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 2-Floor Cross Section Cutaway Graphic (Visualizing Upper/Lower Floors) */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex-1 flex flex-col justify-between">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>🏢 아파트 수직 단면도 (층간 충격음 전달)</span>
              <span className="text-[10px] text-slate-400">RC 슬래브 210mm 구조</span>
            </h4>

            <div className="flex-1 flex flex-col justify-between border-2 border-slate-200 rounded-xl overflow-hidden bg-slate-50 min-h-[220px]">
              {/* Upper Floor: Min-jun's room (502호) */}
              <div className="bg-indigo-50/60 p-3 border-b border-indigo-200 relative flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-indigo-900 bg-white px-2 py-0.5 rounded shadow-xs">
                    502호 민준이 방
                  </span>
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-700">
                    <span className="text-2xl">{currentActivity.icon}</span>
                    <div>
                      <p className="font-bold text-slate-900">{currentActivity.name}</p>
                      <p className="text-[10px] text-slate-500">
                        {activeMitigations.length > 0
                          ? `착용: ${activeMitigations.map((m) => MITIGATION_OPTIONS.find((o) => o.id === m)?.name).join(', ')}`
                          : '방어 용품 없음 (맨발 쿵쾅)'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Min-jun Animated Persona */}
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shadow-xs border ${
                    selectedActivity === 'jumping' || selectedActivity === 'running'
                      ? 'animate-bounce bg-amber-100 border-amber-300'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  👦
                </div>
              </div>

              {/* Concrete Slab (210mm) with dynamic sound waves */}
              <div className="h-10 bg-slate-600 relative flex items-center justify-center overflow-hidden border-y-2 border-slate-700">
                <span className="text-[10px] text-slate-300 font-mono tracking-wider z-10 font-bold">
                  콘크리트 바닥 슬래브 (210mm)
                </span>

                {/* Shockwave Rings */}
                {noiseLevel !== 'safe' && (
                  <div
                    className={`absolute inset-0 opacity-40 animate-pulse ${
                      noiseLevel === 'danger' ? 'bg-red-500' : 'bg-amber-400'
                    }`}
                  />
                )}
              </div>

              {/* Lower Floor: Neighbor's room (402호) */}
              <div
                className={`p-3 relative flex items-center justify-between transition-colors ${
                  noiseLevel === 'safe'
                    ? 'bg-emerald-50/70'
                    : noiseLevel === 'caution'
                    ? 'bg-amber-50/70'
                    : 'bg-rose-100/80 animate-pulse'
                }`}
              >
                <div>
                  <span className="text-[11px] font-bold text-slate-800 bg-white px-2 py-0.5 rounded shadow-xs">
                    402호 아래층 김할아버지 댁
                  </span>
                  <div className="mt-1 text-xs">
                    {noiseLevel === 'safe' && (
                      <p className="text-emerald-800 font-semibold flex items-center gap-1">
                        <span>☕ 조용해서 신문 읽으며 편안히 쉬고 계세요</span>
                      </p>
                    )}
                    {noiseLevel === 'caution' && (
                      <p className="text-amber-800 font-semibold flex items-center gap-1">
                        <span>🤨 "어디선가 쿵쿵 소리가 나네..." 고개를 갸우뚱</span>
                      </p>
                    )}
                    {noiseLevel === 'danger' && (
                      <p className="text-rose-800 font-bold flex items-center gap-1">
                        <span>😫 "천장이 무너질 것 같아요!" 귀를 막고 괴로워하심</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Neighbor Reaction Persona */}
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shadow-xs border ${
                    noiseLevel === 'safe'
                      ? 'bg-emerald-100 border-emerald-300'
                      : noiseLevel === 'caution'
                      ? 'bg-amber-100 border-amber-300'
                      : 'bg-rose-200 border-rose-400 animate-shake'
                  }`}
                >
                  {noiseLevel === 'safe' ? '👴' : noiseLevel === 'caution' ? '👴❓' : '👴⚡'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
