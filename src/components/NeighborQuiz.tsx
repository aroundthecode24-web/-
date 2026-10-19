import React, { useState } from 'react';
import { HelpCircle, CheckCircle, XCircle, RotateCcw, Award, Lightbulb, Sparkles } from 'lucide-react';
import { sound } from '../utils/audio';
import { triggerConfetti } from '../utils/confetti';

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  tip: string;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: '아파트 복도에 어린이 킥보드나 자전거를 세워두는 것은 소방법상 어떨까요?',
    options: [
      '문 바로 앞 벽에 붙여두면 괜찮다.',
      '소방법 제16조 위반으로 피난 장애물에 해당하여 과태료 대상이다.',
      '이웃이 지나갈 틈만 있으면 전혀 문제없다.',
      '아파트 관리사무소 허락만 받으면 복도 전체에 두어도 된다.',
    ],
    correctIndex: 1,
    explanation: '소방시설 설치 및 관리에 관한 법률 제16조에 따라 피난시설(복도, 계단, 출입구)에 물건을 쌓아두거나 장애물을 설치하는 행위는 엄격히 금지되며 최대 300만 원 이하의 과태료가 부과될 수 있습니다.',
    tip: '킥보드는 반드시 집 안 현관 신발장이나 1층 지정 보관대에 주차해 주세요!',
  },
  {
    id: 2,
    question: '두께 4cm의 EVA 층간소음 놀이매트와 소음방지 슬리퍼는 소음을 약 얼마나 줄여줄까요?',
    options: [
      '전혀 줄어들지 않는다 (0 dB)',
      '약 5 dB 정도만 줄어든다.',
      '약 15 ~ 20 dB 이상의 충격음을 효과적으로 흡수한다.',
      '100 dB 완전히 소음이 사라진다.',
    ],
    correctIndex: 2,
    explanation: '실제 음향 실험 결과, 소음방지 슬리퍼(-15dB)와 4cm 고탄성 EVA 매트(-20dB)는 발뒤꿈치가 바닥 슬래브에 직접 가하는 중량 충격음을 획기적으로 줄여줍니다.',
    tip: '실내에서 슬리퍼 착용만 습관화해도 층간소음 갈등의 80% 이상이 예방됩니다.',
  },
  {
    id: 3,
    question: '화재 발생 시 119 구급대 들것(폭 약 60cm)과 주민들이 안전하게 대피하기 위한 복도 최소 권장 너비는?',
    options: [
      '50cm 이상',
      '120cm 이상 (건축법 피난·방화규칙 표준)',
      '30cm 이상',
      '10cm 이상',
    ],
    correctIndex: 1,
    explanation: '건축물의 피난·방화구조 등의 기준에 관한 규칙에 따라 공동주택 계단식 단면복도는 최소 120cm, 복도식 양면복도는 최소 150cm 이상의 유효 너비를 확보해야 응급 들것과 휠체어 통행이 가능합니다.',
    tip: '택배 상자나 유모차가 복도에 놓이면 통행 폭이 90cm 이하로 좁아져 응급 환자 이송이 지체됩니다.',
  },
  {
    id: 4,
    question: '아파트에서 층간소음 갈등을 가장 지혜롭게 해결하는 방법은 무엇일까요?',
    options: [
      '화가 나면 천장을 빗자루나 막대기로 세게 두드린다.',
      '아래층에 찾아가 문을 쾅쾅 두드리고 언성을 높인다.',
      '사전에 슬리퍼·매트를 갖추고, 엘리베이터에서 먼저 밝게 인사하며 다정한 손편지로 소통한다.',
      '밤 11시에 청소기를 돌리고 줄넘기를 한다.',
    ],
    correctIndex: 2,
    explanation: '직접적인 감정적 항의나 보복 소음은 법적 갈등과 보복으로 번지기 쉽습니다. 평소 다정한 인사와 예방 용품(슬리퍼/매트), 따뜻한 소통 메모가 평화로운 공동체를 만듭니다.',
    tip: '민준이처럼 [이웃 사랑 손편지]로 먼저 배려의 마음을 전해보세요!',
  },
];

export const NeighborQuiz: React.FC = () => {
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [showResult, setShowResult] = useState<boolean>(false);

  const question = QUIZ_QUESTIONS[currentIdx];
  const isAnswered = selectedAnswers[question.id] !== undefined;
  const isCorrect = isAnswered && selectedAnswers[question.id] === question.correctIndex;

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    const nextAnswers = { ...selectedAnswers, [question.id]: idx };
    setSelectedAnswers(nextAnswers);

    if (idx === question.correctIndex) {
      sound.playChime(true);
    } else {
      sound.playThud(0.6);
    }
  };

  const nextQuestion = () => {
    if (currentIdx < QUIZ_QUESTIONS.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setShowResult(true);
      triggerConfetti();
      sound.playFanfare();
    }
  };

  const restartQuiz = () => {
    setSelectedAnswers({});
    setCurrentIdx(0);
    setShowResult(false);
    sound.playChime(true);
  };

  const correctCount = Object.keys(selectedAnswers).filter(
    (key) => selectedAnswers[Number(key)] === QUIZ_QUESTIONS.find((q) => q.id === Number(key))?.correctIndex
  ).length;

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-1.5">
            <span>💡 쏙쏙 상식 퀴즈</span>
            <span>어린이 & 온가족 에티켓</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            우리 아파트 지킴이 에티켓 퀴즈
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            소방법과 층간소음 예방법에 대한 4가지 핵심 퀴즈를 풀고 만점에 도전해 보세요!
          </p>
        </div>

        <button
          onClick={restartQuiz}
          className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>퀴즈 다시 풀기</span>
        </button>
      </div>

      {!showResult ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs max-w-2xl mx-auto space-y-6">
          {/* Progress Header */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
              문제 {currentIdx + 1} / {QUIZ_QUESTIONS.length}
            </span>
            <span className="text-xs text-slate-400 font-medium">정답 수: {correctCount}개</span>
          </div>

          {/* Question Text */}
          <div className="space-y-2">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              Q{question.id}. {question.question}
            </h3>
          </div>

          {/* Options */}
          <div className="space-y-2.5">
            {question.options.map((opt, idx) => {
              const isSelected = selectedAnswers[question.id] === idx;
              const isOptionCorrect = idx === question.correctIndex;

              let btnClass = 'border-slate-200 hover:border-slate-300 bg-white';
              if (isAnswered) {
                if (isOptionCorrect) {
                  btnClass = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold';
                } else if (isSelected) {
                  btnClass = 'border-rose-400 bg-rose-50 text-rose-950';
                } else {
                  btnClass = 'border-slate-100 bg-slate-50 text-slate-400 opacity-60';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={isAnswered}
                  className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between gap-3 ${btnClass}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full border border-slate-300 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                      {idx + 1}
                    </span>
                    <span>{opt}</span>
                  </div>
                  {isAnswered && (
                    <div>
                      {isOptionCorrect && <CheckCircle className="w-5 h-5 text-emerald-600" />}
                      {!isOptionCorrect && isSelected && <XCircle className="w-5 h-5 text-rose-500" />}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation Box */}
          {isAnswered && (
            <div
              className={`p-4 rounded-2xl border text-xs leading-relaxed space-y-1.5 animate-fade-in ${
                isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}
            >
              <div className="font-bold flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 shrink-0 text-amber-600" />
                <span>{isCorrect ? '정답입니다! 👏' : '아쉬워요, 정답을 확인해보세요!'}</span>
              </div>
              <p>{question.explanation}</p>
              <p className="font-semibold text-indigo-900 pt-1 border-t border-amber-200/60">
                💡 실천 꿀팁: {question.tip}
              </p>
            </div>
          )}

          {/* Next Button */}
          {isAnswered && (
            <div className="flex justify-end">
              <button
                onClick={nextQuestion}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-200 transition-all"
              >
                {currentIdx < QUIZ_QUESTIONS.length - 1 ? '다음 문제 풀기 ➡️' : '최종 결과 확인하기 🏆'}
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Quiz Finished Result Screen */
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm max-w-lg mx-auto text-center space-y-5 animate-scale-up">
          <div className="w-20 h-20 bg-amber-100 rounded-3xl mx-auto flex items-center justify-center text-4xl shadow-inner border border-amber-200">
            🏆
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-900">퀴즈 완료! 축하합니다!</h3>
            <p className="text-sm text-slate-500 mt-1">
              총 {QUIZ_QUESTIONS.length}문제 중 <strong>{correctCount}개</strong>를 맞히셨습니다.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs text-left leading-relaxed">
            <p className="font-bold mb-1">🎉 11세 김민준 학생의 에티켓 마스터 증서</p>
            <p>
              "소방법상 복도 피난로의 중요성을 이해하고, 슬리퍼와 매트를 활용해 이웃의 평화로운 휴식을 지켜줄 준비가 되었습니다!"
            </p>
          </div>

          <button
            onClick={restartQuiz}
            className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>퀴즈 한 번 더 도전하기</span>
          </button>
        </div>
      )}
    </div>
  );
};
