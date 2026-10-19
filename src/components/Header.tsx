import React, { useState } from 'react';
import { Volume2, VolumeX, ShieldCheck, Heart, Sparkles, Building2, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { sound } from '../utils/audio';

interface HeaderProps {
  activeTab: 'hallway' | 'noise' | 'pledge' | 'quiz';
  setActiveTab: (tab: 'hallway' | 'noise' | 'pledge' | 'quiz') => void;
  stickerCount: number;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, stickerCount }) => {
  const [soundOn, setSoundOn] = useState(true);
  const [showPrivacyNotice, setShowPrivacyNotice] = useState(false);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    sound.enabled = next;
    if (next) sound.playChime(true);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* Top Banner: Privacy & Child Protection reassurance */}
      <div className="bg-linear-to-r from-emerald-600 to-teal-700 text-white text-xs py-1.5 px-4 transition-all">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 overflow-hidden">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-200" />
            <span className="font-medium truncate">
              [안심 프라이버시] 본 서비스는 외부 서버로 개인정보를 전송하지 않으며, 오직 브라우저 내부(LocalStorage)에서만 안전하게 동작합니다.
            </span>
          </div>
          <button
            onClick={() => setShowPrivacyNotice(!showPrivacyNotice)}
            className="shrink-0 text-emerald-100 hover:text-white underline text-[11px] flex items-center gap-0.5"
          >
            안내 {showPrivacyNotice ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {showPrivacyNotice && (
          <div className="max-w-6xl mx-auto mt-2 p-3 bg-emerald-900/60 rounded-lg text-emerald-100 text-xs border border-emerald-500/30">
            <p className="font-semibold text-white mb-1">🛡️ 안심 보호 및 데이터 처리 안내</p>
            <p>
              1. 별도의 회원가입이나 로그인 없이 즉시 시뮬레이션 및 스티커판을 이용할 수 있습니다.<br />
              2. 동·호수 및 체크리스트는 사용자 기기의 로컬 저장소에만 보관되며, 언제든지 [데이터 초기화]를 누르면 완전히 삭제됩니다.<br />
              3. 어린이(11세 김민준 학생)와 가족, 이웃 주민 모두가 즐겁게 상호 배려 문화를 배우도록 설계되었습니다.
            </p>
          </div>
        )}
      </div>

      {/* Main Header Container */}
      <div className="max-w-6xl mx-auto px-4 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Logo & Persona Badge */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-linear-to-br from-indigo-500 via-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-200 shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  우리 아파트 평화 지킴이
                </h1>
                <span className="bg-indigo-50 text-indigo-700 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-indigo-200">
                  Apartment Harmony
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                <span>꿈마을 104동 502호</span>
                <span className="text-slate-300">•</span>
                <span className="font-medium text-slate-700">11세 김민준 학생 & 이웃 협력 프로젝트</span>
              </p>
            </div>
          </div>

          {/* Quick Stats & Controls */}
          <div className="flex items-center gap-2 self-end sm:self-center">
            {/* Sticker Count Pill */}
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-900 px-3 py-1.5 rounded-full text-xs font-semibold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>평화 스티커</span>
              <span className="bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded-full font-bold">
                {stickerCount}개
              </span>
            </div>

            {/* Sound FX Toggle */}
            <button
              onClick={toggleSound}
              title={soundOn ? '효과음 끄기' : '효과음 켜기'}
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors shadow-xs"
              aria-label="Toggle Sound Effects"
            >
              {soundOn ? <Volume2 className="w-4 h-4 text-indigo-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="mt-3 sm:mt-4 flex gap-1.5 overflow-x-auto pb-1 scrollbar-none border-t border-slate-100 pt-2.5">
          <button
            onClick={() => {
              setActiveTab('hallway');
              sound.playChime(true);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === 'hallway'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>🛴</span>
            <span>복도 안전 & 통행지수</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('noise');
              sound.playChime(true);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === 'noise'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>🎧</span>
            <span>층간소음 쿵쾅지수 시뮬레이터</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('pledge');
              sound.playChime(true);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === 'pledge'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>⭐</span>
            <span>이웃 평화 약속 & 스티커판</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('quiz');
              sound.playChime(true);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === 'quiz'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>💡</span>
            <span>이웃 에티켓 퀴즈 & 편지함</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
