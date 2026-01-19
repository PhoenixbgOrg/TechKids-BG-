
'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { BG } from '@/lib/i18n';
import { CheckCircle, ArrowRight, AlertTriangle, XCircle, Lightbulb } from 'lucide-react';

export default function QuizPage({ params }: { params: { lessonId: string } }) {
  const router = useRouter();
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  
  // State for current question interactions
  const [isAnswered, setIsAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Ref for auto-scrolling to feedback
  const feedbackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/quiz?lessonId=${params.lessonId}`)
      .then(res => res.json())
      .then(data => {
        setQuestions(data);
        setLoading(false);
      });
  }, [params.lessonId]);

  // Handle option selection
  const handleOptionClick = (idx: number) => {
    if (isAnswered) return; // Prevent changing answer

    setSelectedOption(idx);
    setIsAnswered(true);
    setAnswers(prev => ({ ...prev, [currentIdx]: idx }));
    
    // Auto scroll to feedback on mobile with a slight delay to allow render
    setTimeout(() => {
        if (feedbackRef.current) {
            const yOffset = -20; 
            const y = feedbackRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({top: y, behavior: 'smooth'});
        }
    }, 150);
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setIsAnswered(false);
      setSelectedOption(null);
      window.scrollTo(0, 0);
    } else {
      submitQuiz();
    }
  };

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
        lessonId: params.lessonId,
        score: finalScore,
        passed: finalScore >= 80
      })
    });
  }

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <div className="text-orange-500 font-mono animate-pulse uppercase tracking-widest font-bold">ЗАРЕЖДАНЕ...</div>
    </div>
  );

  if (finished) {
    const passed = score >= 80;
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 md:p-6">
        <div className="bg-slate-900 border border-slate-800 p-8 md:p-12 max-w-lg w-full text-center rounded-3xl shadow-2xl">
          <div className={`w-24 h-24 mx-auto mb-8 flex items-center justify-center rounded-full border-4 shadow-[0_0_30px_rgba(0,0,0,0.3)] ${passed ? 'border-green-500 text-green-500 bg-green-900/10' : 'border-red-500 text-red-500 bg-red-900/10'}`}>
             {passed ? <CheckCircle size={48} /> : <AlertTriangle size={48} />}
          </div>
          <h2 className={`text-4xl md:text-5xl font-black mb-4 italic uppercase tracking-tighter ${passed ? 'text-green-500' : 'text-red-500'}`}>
            {passed ? BG.quiz_pass : BG.quiz_fail}
          </h2>
          <div className="text-white font-mono text-2xl mb-10 bg-slate-800 py-4 rounded-xl border border-slate-700">
             РЕЗУЛТАТ: <span className={passed ? 'text-green-400' : 'text-red-400'}>{score}%</span>
          </div>
          
          <div className="space-y-4">
             <button onClick={() => window.location.reload()} className="w-full py-4 border-2 border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 font-bold uppercase tracking-widest transition-all rounded-xl active:scale-95 text-lg">
               {BG.quiz_retry}
             </button>
             <button onClick={() => router.push('/dashboard')} className="w-full py-5 bg-white text-black font-black uppercase tracking-widest hover:bg-slate-200 transition-all rounded-xl shadow-lg active:scale-95 text-lg">
               {BG.quiz_back}
             </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIdx];
  const isLast = currentIdx === questions.length - 1;
  const options = currentQ.optionsBG || [];
  const correctIdx = currentQ.correctIdx;
  const isCorrect = selectedOption === correctIdx;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col p-4 pb-32">
       <div className="w-full max-w-3xl mx-auto flex-1 flex flex-col">
         {/* Progress Bar */}
         <div className="mb-6 mt-2">
            <div className="flex justify-between items-end mb-2">
                <span className="text-slate-400 font-black text-xs uppercase tracking-widest">{BG.quiz_question} {currentIdx + 1} / {questions.length}</span>
                <span className="text-orange-500 font-mono text-xs font-bold">{Math.round(((currentIdx) / questions.length) * 100)}%</span>
            </div>
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
               <div className="h-full bg-gradient-to-r from-orange-600 to-red-600 transition-all duration-500 ease-out" style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }} />
            </div>
         </div>

         {/* Question Card */}
         <div className="bg-black border border-slate-800 p-6 md:p-10 mb-6 rounded-3xl relative shadow-xl flex-shrink-0">
            <h2 className="text-xl md:text-3xl font-bold text-white leading-snug">
              {currentQ.textBG}
            </h2>
         </div>

         {/* Options Grid */}
         <div className="grid gap-3 md:gap-4 mb-8">
              {options.map((opt: string, i: number) => {
                let statusClass = "border-slate-800 bg-slate-900 text-slate-300"; // Default
                
                if (isAnswered) {
                    if (i === correctIdx) {
                        statusClass = "border-green-500 bg-green-900/20 text-green-400"; // Correct answer (always highlight)
                    } else if (i === selectedOption) {
                        statusClass = "border-red-500 bg-red-900/20 text-red-400"; // Wrong selected
                    } else {
                        statusClass = "border-slate-800 bg-slate-900/50 text-slate-600 opacity-50"; // Others dimmed
                    }
                } else {
                    statusClass += " active:bg-slate-800 active:scale-[0.98]";
                }

                return (
                  <button
                    key={i}
                    onClick={() => handleOptionClick(i)}
                    disabled={isAnswered}
                    className={`w-full text-left p-5 md:p-6 font-bold border-2 rounded-2xl transition-all duration-200 flex items-start gap-4 ${statusClass}`}
                  >
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm flex-shrink-0 mt-0.5 ${
                        isAnswered && i === correctIdx ? 'border-green-500 bg-green-500 text-black' :
                        isAnswered && i === selectedOption ? 'border-red-500 bg-red-500 text-white' :
                        'border-slate-600 text-slate-500'
                    }`}>
                        {isAnswered && i === correctIdx ? <CheckCircle size={18} /> : 
                         isAnswered && i === selectedOption ? <XCircle size={18} /> : 
                         <span className="font-mono">{String.fromCharCode(65 + i)}</span>}
                    </div>
                    <span className="text-base md:text-lg leading-snug">{opt}</span>
                  </button>
                )
              })}
         </div>

         {/* Feedback Section (Visible only after answer) */}
         {isAnswered && (
             <div ref={feedbackRef} className={`rounded-3xl p-6 md:p-8 mb-24 border-l-8 animate-in slide-in-from-bottom-4 fade-in duration-300 ${isCorrect ? 'bg-green-900/10 border-green-500' : 'bg-red-900/10 border-red-500'}`}>
                <div className="flex items-center gap-3 mb-4">
                    {isCorrect ? <CheckCircle className="text-green-500" size={32} /> : <AlertTriangle className="text-red-500" size={32} />}
                    <h3 className={`text-3xl font-black italic uppercase ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                        {isCorrect ? BG.quiz_correct_msg : BG.quiz_wrong_msg}
                    </h3>
                </div>
                
                <div className="space-y-5">
                    <div className="text-slate-300">
                        <span className="text-slate-500 text-xs font-black uppercase tracking-widest block mb-2">{BG.quiz_explanation}</span>
                        <p className="text-lg leading-relaxed font-medium">{currentQ.explanationBG}</p>
                    </div>
                    
                    {currentQ.factBG && (
                        <div className="bg-slate-900/80 p-5 rounded-2xl border border-white/5 flex gap-4">
                            <Lightbulb className="text-yellow-500 shrink-0" size={24} />
                            <div>
                                <span className="text-yellow-500/50 text-[10px] font-black uppercase tracking-widest block mb-1">{BG.quiz_fact}</span>
                                <p className="text-slate-400 text-base italic leading-snug">"{currentQ.factBG}"</p>
                            </div>
                        </div>
                    )}
                </div>
             </div>
         )}
       </div>

       {/* Sticky Bottom Action Button */}
       {isAnswered && (
         <div className="fixed bottom-0 left-0 w-full p-4 md:p-6 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent z-50">
            <div className="max-w-3xl mx-auto">
                <button 
                    onClick={handleNext}
                    className={`w-full py-5 rounded-2xl font-black text-xl uppercase tracking-widest shadow-2xl flex items-center justify-center gap-3 transition-all transform active:scale-[0.98] ${
                        isLast ? 'bg-green-600 text-white shadow-green-900/40' : 'bg-orange-600 text-white shadow-orange-900/40'
                    }`}
                >
                    {isLast ? BG.quiz_finish : BG.quiz_continue} <ArrowRight size={28} />
                </button>
            </div>
         </div>
       )}
    </div>
  );
}
