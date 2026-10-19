/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HallwaySimulator } from './components/HallwaySimulator';
import { NoiseSimulator } from './components/NoiseSimulator';
import { PledgeTracker } from './components/PledgeTracker';
import { NeighborQuiz } from './components/NeighborQuiz';
import { DailyPromise, StickerStamp } from './types';
import { ShieldCheck, Heart, Building2, HelpCircle } from 'lucide-react';
import { sound } from './utils/audio';

const INITIAL_PROMISES: DailyPromise[] = [
  {
    id: 'p1',
    title: '저녁 8시 이후에는 소음방지 슬리퍼 꼭 신기',
    detail: '발뒤꿈치 쿵쾅 충격음을 15dB 이상 줄여 아래층 이웃의 저녁 휴식을 지켜요.',
    category: 'noise',
    icon: '🩴',
    completed: true,
  },
  {
    id: 'p2',
    title: '집 안에서는 발뒤꿈치 들고 사뿐사뿐 걷기',
    detail: '소파에서 뛰지 않고 닌자처럼 조용조용 걷는 사뿐 걸음걸이를 실천해요.',
    category: 'noise',
    icon: '🤫',
    completed: true,
  },
  {
    id: 'p3',
    title: '킥보드와 자전거는 현관문 안쪽이나 지정 보관대에 주차하기',
    detail: '비상시 119 구급대 들것(60cm) 및 휠체어가 지체 없이 통과할 수 있도록 복도를 비워둬요.',
    category: 'hallway',
    icon: '🛴',
    completed: false,
  },
  {
    id: 'p4',
    title: '배송 택배 상자는 복도에 방치하지 않고 즉시 수거하기',
    detail: '가연물 화재 번짐 위험을 없애고 비상구 시야를 환하게 확보해요.',
    category: 'hallway',
    icon: '📦',
    completed: true,
  },
  {
    id: 'p5',
    title: '엘리베이터나 복도에서 이웃을 만나면 반갑게 인사하기',
    detail: '"안녕하세요!" 다정한 인사 한마디가 이웃 간의 스트레스와 갈등을 눈 녹듯 없애줍니다.',
    category: 'greeting',
    icon: '👋',
    completed: true,
  },
  {
    id: 'p6',
    title: '밤 10시 이후에는 청소기·세탁기 및 악기 연주 멈추기',
    detail: '이웃의 깊은 수면을 방해하지 않는 심야 에티켓 시간을 꼭 준수해요.',
    category: 'noise',
    icon: '🌙',
    completed: false,
  },
];

const INITIAL_STAMPS: StickerStamp[] = [
  {
    id: 'stamp-1',
    date: '10월 16일',
    stampType: 'star',
    comment: '슬리퍼 착용 실천 완료!',
  },
  {
    id: 'stamp-2',
    date: '10월 17일',
    stampType: 'heart',
    comment: '킥보드 신발장 안 주차 완료!',
  },
  {
    id: 'stamp-3',
    date: '10월 18일',
    stampType: 'star',
    comment: '아래층 할아버지께 인사드림!',
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'hallway' | 'noise' | 'pledge' | 'quiz'>('hallway');

  // LocalStorage state for Sticker Count
  const [stickerCount, setStickerCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('harmony_sticker_count');
      return saved !== null ? parseInt(saved, 10) : 3;
    } catch {
      return 3;
    }
  });

  // LocalStorage state for Daily Promises
  const [promises, setPromises] = useState<DailyPromise[]>(() => {
    try {
      const saved = localStorage.getItem('harmony_promises');
      return saved ? JSON.parse(saved) : INITIAL_PROMISES;
    } catch {
      return INITIAL_PROMISES;
    }
  });

  // LocalStorage state for Stamps History
  const [stamps, setStamps] = useState<StickerStamp[]>(() => {
    try {
      const saved = localStorage.getItem('harmony_stamps');
      return saved ? JSON.parse(saved) : INITIAL_STAMPS;
    } catch {
      return INITIAL_STAMPS;
    }
  });

  // Persist to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('harmony_sticker_count', stickerCount.toString());
    } catch {
      // storage quota or private mode
    }
  }, [stickerCount]);

  useEffect(() => {
    try {
      localStorage.setItem('harmony_promises', JSON.stringify(promises));
    } catch {
      // storage quota
    }
  }, [promises]);

  useEffect(() => {
    try {
      localStorage.setItem('harmony_stamps', JSON.stringify(stamps));
    } catch {
      // storage quota
    }
  }, [stamps]);

  // Reset Data handler
  const handleResetData = () => {
    if (window.confirm('정말로 모든 약속 체크와 스티커 도장 기록을 초기화하시겠습니까?')) {
      try {
        localStorage.removeItem('harmony_sticker_count');
        localStorage.removeItem('harmony_promises');
        localStorage.removeItem('harmony_stamps');
      } catch {
        // ignore
      }
      setStickerCount(0);
      setStamps([]);
      setPromises(INITIAL_PROMISES.map((p) => ({ ...p, completed: false })));
      sound.playChime(false);
    }
  };

  // Fill sample data
  const handleFillSampleData = () => {
    setStickerCount(5);
    setStamps(INITIAL_STAMPS);
    setPromises(INITIAL_PROMISES);
    sound.playChime(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans text-slate-800">
      <div>
        {/* Navigation Header */}
        <Header activeTab={activeTab} setActiveTab={setActiveTab} stickerCount={stickerCount} />

        {/* Main Content Area */}
        <main className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
          {activeTab === 'hallway' && <HallwaySimulator />}
          {activeTab === 'noise' && <NoiseSimulator />}
          {activeTab === 'pledge' && (
            <PledgeTracker
              stickerCount={stickerCount}
              setStickerCount={setStickerCount}
              promises={promises}
              setPromises={setPromises}
              stamps={stamps}
              setStamps={setStamps}
              onResetData={handleResetData}
              onFillSampleData={handleFillSampleData}
            />
          )}
          {activeTab === 'quiz' && <NeighborQuiz />}
        </main>
      </div>

      {/* Community Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-8 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-600" />
            <span className="font-bold text-slate-700">우리 아파트 평화 지킴이 (Apartment Harmony)</span>
            <span className="text-slate-300">|</span>
            <span>꿈마을 104동 502호 김민준(11세) & 이웃 커뮤니티</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>개인정보 100% 미수집 안심 앱</span>
            </span>
            <span>소방법 제16조 준수</span>
            <span>공동주택 층간소음 관리규칙 기반</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
