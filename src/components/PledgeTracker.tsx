import React, { useState } from 'react';
import { DailyPromise, StickerStamp } from '../types';
import { Sparkles, CheckCircle2, RotateCcw, Award, Heart, MessageSquare, ThumbsUp, PartyPopper, Copy, Check, Printer } from 'lucide-react';
import { triggerConfetti } from '../utils/confetti';
import { sound } from '../utils/audio';

interface PledgeTrackerProps {
  stickerCount: number;
  setStickerCount: React.Dispatch<React.SetStateAction<number>>;
  promises: DailyPromise[];
  setPromises: React.Dispatch<React.SetStateAction<DailyPromise[]>>;
  stamps: StickerStamp[];
  setStamps: React.Dispatch<React.SetStateAction<StickerStamp[]>>;
  onResetData: () => void;
  onFillSampleData: () => void;
}

export const PledgeTracker: React.FC<PledgeTrackerProps> = ({
  stickerCount,
  setStickerCount,
  promises,
  setPromises,
  stamps,
  setStamps,
  onResetData,
  onFillSampleData,
}) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showNoteModal, setShowNoteModal] = useState<boolean>(false);
  const [selectedNoteType, setSelectedNoteType] = useState<'greeting' | 'apology' | 'kickboard'>('greeting');
  const [copiedNote, setCopiedNote] = useState<boolean>(false);

  const completedCount = promises.filter((p) => p.completed).length;
  const allCompleted = completedCount === promises.length && promises.length > 0;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Toggle promise item
  const togglePromise = (id: string) => {
    setPromises((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const nextVal = !p.completed;
          sound.playChime(nextVal);
          return { ...p, completed: nextVal };
        }
        return p;
      })
    );
  };

  // Stamp sticker button
  const handleStampAction = () => {
    if (stickerCount >= 10) {
      showToast('🎉 이미 스티커판 10개를 모두 완주하셨습니다! 대단해요!');
      triggerConfetti();
      sound.playFanfare();
      return;
    }

    const todayStr = new Date().toLocaleDateString('ko-KR', {
      month: 'long',
      day: 'numeric',
    });

    const newStamp: StickerStamp = {
      id: Date.now().toString(),
      date: todayStr,
      stampType: stickerCount % 4 === 0 ? 'crown' : stickerCount % 3 === 0 ? 'heart' : 'star',
      comment: `약속 ${completedCount}개 실천 완료!`,
    };

    setStamps((prev) => [...prev, newStamp]);
    setStickerCount((prev) => prev + 1);

    // Celebration
    triggerConfetti();
    sound.playFanfare();
    showToast(`🌟 칭찬 도장을 쾅 찍었습니다! (현재 ${stickerCount + 1}/10개)`);
  };

  // Copy door card text
  const copyDoorNote = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNote(true);
    sound.playChime(true);
    setTimeout(() => setCopiedNote(false), 2000);
  };

  const getNoteText = () => {
    if (selectedNoteType === 'greeting') {
      return `안녕하세요 402호 이웃 어르신! 502호 김민준(11세)입니다.\n평소에 엘리베이터에서 다정하게 인사해 주셔서 늘 감사드립니다. 저녁 8시 이후에는 꼭 슬리퍼를 신고 조용히 걷겠습니다. 건강하시고 좋은 하루 보내세요! ❤️`;
    }
    if (selectedNoteType === 'apology') {
      return `안녕하세요 아래층 이웃님! 502호 민준이네입니다.\n어제 친구들이 놀러와 조금 쿵쾅거려 죄송합니다. 앞으로는 4cm 두꺼운 매트 위에서만 놀고 밤 9시 이후에는 소음방지 슬리퍼를 꼭 착용하겠습니다. 너른 양해 감사드립니다. 🙏`;
    }
    return `안녕하세요 복도 이웃 여러분! 502호 민준이입니다.\n제가 복도에 킥보드를 두어 통행에 불편을 드리지 않도록, 오늘부터는 현관문 안쪽 신발장이나 1층 지정 보관대에 꼭 주차하겠습니다. 안전하고 깨끗한 복도를 함께 만들어요! 🛴✨`;
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs sm:text-sm font-semibold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-slate-700 animate-slide-up">
          <PartyPopper className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Intro Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 mb-1.5">
            <span>⭐ 이웃 배려 실천 챌린지</span>
            <span>지속 가능한 공동체</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            이웃 평화 약속 & 칭찬 스티커 보드
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            소음 줄이기와 복도 안전을 위한 6가지 약속을 체크하고, 매일 칭찬 도장을 모아 '우리 아파트 평화 마스터' 배지를 획득하세요!
          </p>
        </div>

        {/* Action Buttons: Sample Data & Reset */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowNoteModal(true)}
            className="px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
            <span>이웃 손편지 카드 쓰기</span>
          </button>

          <button
            onClick={onFillSampleData}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>샘플 채우기</span>
          </button>

          <button
            onClick={onResetData}
            className="p-1.5 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-rose-600 hover:bg-rose-50 text-xs transition-colors"
            title="기록 초기화"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid: Promises Checklist (Left) & Sticker Stamp Board (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Daily Promises Checkbox List (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>📋 오늘의 이웃 평화 실천 약속</span>
                <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-semibold">
                  {completedCount}/{promises.length} 달성
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                민준이가 오늘 직접 지킨 약속들을 체크해 보세요.
              </p>
            </div>

            {/* Stamp Button Trigger */}
            <button
              onClick={handleStampAction}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-200 hover:shadow-lg transition-all transform active:scale-95"
            >
              <Award className="w-4 h-4" />
              <span>칭찬 도장 찍기!</span>
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
            <div
              className="bg-linear-to-r from-indigo-500 to-emerald-500 h-full transition-all duration-300"
              style={{ width: `${(completedCount / Math.max(1, promises.length)) * 100}%` }}
            />
          </div>

          {/* Checkbox Items */}
          <div className="space-y-2.5">
            {promises.map((promise) => (
              <div
                key={promise.id}
                onClick={() => togglePromise(promise.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 select-none ${
                  promise.completed
                    ? 'border-emerald-300 bg-emerald-50/60 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-2xl shrink-0">{promise.icon}</span>
                  <div className="min-w-0">
                    <p
                      className={`text-xs sm:text-sm font-bold ${
                        promise.completed ? 'text-emerald-950 line-through opacity-80' : 'text-slate-900'
                      }`}
                    >
                      {promise.title}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">{promise.detail}</p>
                  </div>
                </div>

                <div
                  className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 ${
                    promise.completed
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {promise.completed && <Check className="w-4 h-4 stroke-[3]" />}
                </div>
              </div>
            ))}
          </div>

          {allCompleted && (
            <div className="bg-emerald-100/80 border border-emerald-300 text-emerald-900 rounded-xl p-3 text-xs flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" />
              <span className="font-semibold">
                대단해요! 오늘 6가지 약속을 모두 지켰습니다. 우측의 <strong>[칭찬 도장 찍기]</strong> 버튼을 눌러 스티커를 기록하세요!
              </span>
            </div>
          )}
        </div>

        {/* Right Column: 10-Slot Praise Sticker Board (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>🌟 칭찬 스티커판</span>
                <span className="text-xs bg-amber-100 text-amber-900 font-bold px-2.5 py-0.5 rounded-full">
                  {stickerCount} / 10개
                </span>
              </h3>
              <span className="text-[11px] text-slate-500">10개 모으면 마스터 트로피!</span>
            </div>

            {/* Sticker Badges Grid (10 Slots) */}
            <div className="grid grid-cols-5 gap-2.5 my-4">
              {Array.from({ length: 10 }).map((_, index) => {
                const isStamped = index < stickerCount;
                return (
                  <div
                    key={index}
                    className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center p-1 transition-all ${
                      isStamped
                        ? 'border-amber-400 bg-amber-50 shadow-md transform hover:scale-110'
                        : 'border-dashed border-slate-300 bg-slate-50/50'
                    }`}
                  >
                    {isStamped ? (
                      <>
                        <span className="text-2xl filter drop-shadow-xs">
                          {index === 9 ? '🏆' : index === 4 ? '🛡️' : index % 2 === 0 ? '⭐' : '❤️'}
                        </span>
                        <span className="text-[9px] font-bold text-amber-800 mt-0.5 font-mono">
                          #{index + 1}
                        </span>
                      </>
                    ) : (
                      <span className="text-xs text-slate-300 font-bold font-mono">#{index + 1}</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Achievement Milestones */}
            <div className="space-y-2 text-xs">
              <div
                className={`p-2.5 rounded-xl border flex items-center gap-2.5 ${
                  stickerCount >= 1
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-medium'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                <span className="text-base">🌱</span>
                <div>
                  <p className="font-bold">새싹 이웃 뱃지 (1개 달성)</p>
                  <p className="text-[10px] text-slate-500">첫 번째 약속 실천을 축하합니다!</p>
                </div>
              </div>

              <div
                className={`p-2.5 rounded-xl border flex items-center gap-2.5 ${
                  stickerCount >= 5
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-900 font-medium'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                <span className="text-base">🛡️</span>
                <div>
                  <p className="font-bold">복도 안전 주니어 보안관 (5개 달성)</p>
                  <p className="text-[10px] text-slate-500">이웃들의 안전한 보행을 지켜냈어요!</p>
                </div>
              </div>

              <div
                className={`p-2.5 rounded-xl border flex items-center gap-2.5 ${
                  stickerCount >= 10
                    ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                <span className="text-base">🏆</span>
                <div>
                  <p className="font-bold">우리 아파트 평화 마스터 (10개 완주)</p>
                  <p className="text-[10px] text-slate-500">모든 이웃이 칭찬하는 최고의 입주민!</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Stamps History */}
          <div className="pt-3 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-600 mb-2">최근 실천 기록 (타임라인)</p>
            {stamps.length === 0 ? (
              <p className="text-[11px] text-slate-400">아직 도장이 없습니다. 약속을 실천하고 도장을 찍어보세요!</p>
            ) : (
              <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                {stamps.slice(-3).reverse().map((stamp) => (
                  <div key={stamp.id} className="text-[11px] text-slate-600 flex items-center justify-between bg-slate-50 px-2 py-1 rounded">
                    <span>{stamp.date}</span>
                    <span className="text-emerald-700 font-semibold">{stamp.comment}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Neighbor Kindness Door Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">💌</span>
                <h3 className="text-lg font-bold text-slate-900">민준이의 이웃 사랑 손편지 생성기</h3>
              </div>
              <button
                onClick={() => setShowNoteModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              이웃에게 감사의 마음이나 사과의 말을 전하고 싶을 때 문 앞에 붙이거나 전달할 수 있는 예쁜 메모 카드입니다.
            </p>

            {/* Note Templates */}
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedNoteType('greeting')}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold border transition-colors ${
                  selectedNoteType === 'greeting'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                👵 감사 인사
              </button>
              <button
                onClick={() => setSelectedNoteType('apology')}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold border transition-colors ${
                  selectedNoteType === 'apology'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                🙏 소음 양해·사과
              </button>
              <button
                onClick={() => setSelectedNoteType('kickboard')}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold border transition-colors ${
                  selectedNoteType === 'kickboard'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                🛴 킥보드 주차 약속
              </button>
            </div>

            {/* Note Preview Box */}
            <div className="p-4 rounded-2xl bg-amber-50/80 border-2 border-dashed border-amber-300 font-sans text-xs leading-relaxed text-slate-800 whitespace-pre-line shadow-inner">
              {getNoteText()}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => copyDoorNote(getNoteText())}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
              >
                {copiedNote ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedNote ? '클립보드 복사 완료!' : '편지 내용 복사'}</span>
              </button>
              <button
                onClick={() => window.print()}
                className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>인쇄하기</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
