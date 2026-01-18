'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BG } from '@/lib/i18n';
import { Lock, CheckCircle, ArrowRight } from 'lucide-react';

type Props = {
  params: { lessonId: string };
};

export default function QuizPage({ params }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const childId = searchParams.get('childId');
  
  const [inviteCode, setInviteCode] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [inviteError, setInviteError] = useState(false);

  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);

  // In a real app, the invite code would come from the API/Lesson data
  const VALID_CODE = "TECH2024";

  useEffect(() => {
    if (!childId) return;
    fetchQuestions();
  }, [childId]);

  async function fetchQuestions() {
    try {
      const res = await fetch(`/api/quiz?lessonId=${params.lessonId}`);
      const data = await res.json();
      setQuestions(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function handleUnlock(e: React.FormEvent) {
    e.preventDefault();
    if (inviteCode.toUpperCase() === VALID_CODE) {
      setIsUnlocked(true);
      setInviteError(false);
    } else {
      setInviteError(true);
    }
  }

  async function submitQuiz() {
    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.correctIdx) correctCount++;
    });

    const finalScore = Math.round((correctCount / questions.length) * 100);
    setScore(finalScore);
    setFinished(true);

    await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        childId,
        lessonId: params.lessonId,
        score: finalScore,
        passed: finalScore >= 80
      })
    });
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-400 font-bold animate-pulse">Зареждане на теста...</div>;

  // STEP 1: INVITE CODE
  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-xl w-full max-w-md border border-slate-100 text-center">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600">
            <Lock className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black mb-2 text-slate-800">{BG.quiz_invite_title}</h2>
          <p className="text-slate-500 mb-8 text-sm leading-relaxed">{BG.quiz_invite_desc}</p>
          
          <form onSubmit={handleUnlock} className="space-y-4">
            <div className="text-left">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">
                {BG.quiz_invite_label}
              </label>
              <input 
                type="text"
                value={inviteCode}
                onChange={e => setInviteCode(e.target.value)}
                className={`w-full p-4 bg-slate-50 border-2 rounded-2xl text-center text-xl font-mono tracking-[0.5em] transition-all outline-none ${
                  inviteError ? 'border-red-200 bg-red-50 text-red-600' : 'border-slate-100 focus:border-blue-500'
                }`}
                placeholder="••••••••"
              />
              {inviteError && <p className="text-red-500 text-xs font-bold mt-2 text-center">{BG.quiz_invite_error}</p>}
            </div>
            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {BG.quiz_invite_btn} <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  // STEP 2: FINISHED SCREEN
  if (finished) {
    const passed = score >= 80;
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-xl w-full max-w-md text-center">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${passed ? 'bg-green-50 text-green-500' : 'bg-orange-50 text-orange-500'}`}>
            <CheckCircle className="w-12 h-12" />
          </div>
          <h2 className="text-2xl font-black mb-2 text-slate-800">{BG.quiz_result_title}</h2>
          <div className={`text-6xl font-black mb-6 ${passed ? 'text-green-500' : 'text-orange-500'}`}>
            {score}%
          </div>
          <p className="text-slate-500 mb-10 font-bold leading-relaxed px-4">
            {passed ? BG.quiz_pass_msg : BG.quiz_fail_msg}
          </p>
          
          <div className="space-y-3">
             <button 
                onClick={() => window.location.reload()}
                className="w-full py-4 bg-slate-100 text-slate-600 font-black rounded-2xl hover:bg-slate-200 transition-all"
             >
               {BG.quiz_btn_retry}
             </button>
             <button 
                onClick={() => router.push(`/dashboard/child/${childId}`)}
                className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all"
             >
               {BG.quiz_btn_back_dash}
             </button>
          </div>
        </div>
      </div>
    );
  }

  // STEP 3: QUIZ ENGINE
  const currentQ = questions[currentIdx];
  const isLast = currentIdx === questions.length - 1;

  return (
    <div className="min-h-screen bg-sky-50/50 p-4 md:p-12 flex flex-col items-center">
       <div className="w-full max-w-2xl">
         <div className="bg-white/50 backdrop-blur rounded-full h-3 mb-12 overflow-hidden border border-white">
            <div 
              className="bg-blue-500 h-full transition-all duration-700 ease-out"
              style={{ width: `${((currentIdx) / questions.length) * 100}%` }}
            />
         </div>

         <div className="bg-white rounded-[2.5rem] p-8 md:p-14 shadow-xl border-b-[12px] border-slate-100">
            <div className="flex justify-between items-center mb-10">
              <span className="text-xs font-black text-slate-300 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full">
                {BG.quiz_question_prefix} {currentIdx + 1} / {questions.length}
              </span>
            </div>
            
            <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-12 leading-tight">
              {currentQ.textBG}
            </h2>

            <div className="space-y-4">
              {JSON.parse(currentQ.optionsBG).map((opt: string, i: number) => {
                const isSelected = answers[currentIdx] === i;
                return (
                  <button
                    key={i}
                    onClick={() => setAnswers(prev => ({ ...prev, [currentIdx]: i }))}
                    className={`w-full text-left p-6 rounded-2xl font-bold border-2 transition-all transform active:scale-[0.98] ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50 text-blue-800 ring-4 ring-blue-500/10' 
                        : 'border-slate-100 hover:border-blue-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <span className="inline-block w-8 text-blue-300">{String.fromCharCode(65 + i)}.</span>
                    {opt}
                  </button>
                )
              })}
            </div>
         </div>

         <div className="mt-12 flex justify-end">
            {isLast ? (
               <button 
                 onClick={submitQuiz}
                 disabled={answers[currentIdx] === undefined}
                 className="bg-green-500 text-white font-black py-5 px-10 rounded-2xl shadow-xl shadow-green-100 hover:bg-green-600 disabled:opacity-30 disabled:shadow-none transition-all active:scale-95 text-lg"
               >
                 {BG.quiz_btn_submit}
               </button>
            ) : (
              <button 
                 onClick={() => setCurrentIdx(prev => prev + 1)}
                 disabled={answers[currentIdx] === undefined}
                 className="bg-blue-600 text-white font-black py-5 px-10 rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 disabled:opacity-30 disabled:shadow-none transition-all active:scale-95 text-lg flex items-center gap-2"
               >
                 {BG.quiz_btn_next} <ArrowRight className="w-5 h-5" />
               </button>
            )}
         </div>
       </div>
    </div>
  );
}
