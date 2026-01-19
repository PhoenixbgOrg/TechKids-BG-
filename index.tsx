
import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Activity, Terminal, 
  ChevronRight, Skull, ShieldCheck, 
  Info, Gavel, Euro,
  Microscope, Gauge, Binary, Rocket, AlertTriangle, Zap, Crown, Ghost, Volume2, Heart, HeartCrack, User, FileWarning
} from 'lucide-react';

import { TIER1_QUESTIONS } from './tier1';
import { TIER2_QUESTIONS } from './tier2';
import { TIER3_QUESTIONS } from './tier3';
import { TIER0_QUESTIONS } from './tier0';

// Синтезиран звук за грешка (единичен импулс)
const playSingleErrorPulse = (ctx: AudioContext) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(120, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.4);

  gain.gain.setValueAtTime(0.2, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.4);

  // Глич шум
  const bufferSize = ctx.sampleRate * 0.2;
  const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.05, ctx.currentTime);
  noiseGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
  noise.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  noise.start();
};

const shuffleArray = (array: any[]) => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

// Helper function to shuffle options within a specific question
const randomizeQuestionOptions = (q: any) => {
  const correctOptionText = q.options[q.correct];
  const shuffledOptions = shuffleArray([...q.options]);
  const newCorrectIndex = shuffledOptions.indexOf(correctOptionText);

  return {
    ...q,
    options: shuffledOptions,
    correct: newCorrectIndex
  };
};

// Рангове при провал
const getFailRank = (score: number) => {
  if (score === 0) return "ЛАБОРАНТ С ТЕСЛА";
  if (score < 5) return "КАБЕЛЕН ТЕХНИК - СТАЖАНТ";
  if (score < 15) return "PC СГЛОБЯВАЧ ОТ КВАРТАЛА";
  if (score < 30) return "СИСТЕМЕН АДМИНИСТРАТОР (JUNIOR)";
  if (score < 45) return "ХАРДУЕРЕН ЕНТУСИАСТ";
  return "КИБЕР ИНЖЕНЕР";
};

// Конфигурация за нивата: Допустими грешки и специфични обиди
const TIER_CONFIG: Record<number, { allowedMistakes: number, insults: string[] }> = {
  0: { 
    allowedMistakes: 0, 
    insults: [
      "SYSTEM HALTED! Ти не си достоен за Сингулярността.",
      "ACCESS DENIED! Вселената те отхвърли."
    ] 
  },
  1: { 
    allowedMistakes: 1, 
    insults: [
      "Върви да пасеш патките на село! Хардуерът не е за теб.",
      "По-добре стани овчар, там няма LGA сокети.",
      "Марш на село да копаеш картофи, компютрите не са ти сила."
    ] 
  },
  2: { 
    allowedMistakes: 2, 
    insults: [
      "Вземи си един Тетрис с батерии, това е твоето ниво.",
      "Инсталирай си Snake на Nokia 3310 и не пипай сериозна техника.",
      "Отивай да редиш пасианс, тук се иска мисъл."
    ] 
  },
  3: { 
    allowedMistakes: 3, 
    insults: [
      "Зарежи компютрите, вземи си една гъдулка и свири по сватби!",
      "Купи си тъпан и ходи да блъскаш, инженерството изисква финес.",
      "Ставаш само за DJ на селски събор. Сбогом!"
    ] 
  }
};

const DATA_MAP: Record<number, any[]> = {
  0: TIER0_QUESTIONS,
  1: TIER1_QUESTIONS,
  2: TIER2_QUESTIONS,
  3: TIER3_QUESTIONS
};

const getMissionByTier = (tierId: number) => {
  const tiers: any = {
    0: { id: 0, title: "THE SINGULARITY", subtitle: "БОЖЕСТВЕНО НИВО.", icon: Crown, color: "#ffd700", priceRange: "INF €" },
    1: { id: 1, title: "AORUS ROOKIE", subtitle: "Физика на хардуера.", icon: Microscope, color: "#00d2ff", priceRange: "2 500€" },
    2: { id: 2, title: "AORUS ELITE", subtitle: "Системна архитектура.", icon: Gauge, color: "#ff6b00", priceRange: "15 000€" },
    3: { id: 3, title: "AORUS XTREME", subtitle: "Enterprise мащаб.", icon: Gavel, color: "#ff0000", priceRange: "150 000€" }
  };
  const current = tiers[tierId];
  const rawPool = DATA_MAP[tierId] || [];
  
  let pool = tierId === 0 ? [...rawPool] : shuffleArray([...rawPool]);
  pool = pool.map(randomizeQuestionOptions);

  return { ...current, questions: pool };
};

const App = () => {
  const [view, setView] = useState('home');
  const [playerName, setPlayerName] = useState("");
  const [activeMission, setActiveMission] = useState<any>(null);
  const [qIndex, setQIndex] = useState(0);
  const [status, setStatus] = useState<'playing' | 'explaining' | 'bonus' | 'failed' | 'glitch'>('playing');
  const [timer, setTimer] = useState(120);
  const [bonusQuestion, setBonusQuestion] = useState<any>(null);
  const [currentInsult, setCurrentInsult] = useState("");
  const [perfectRunCount, setPerfectRunCount] = useState(0); 
  
  const [mistakes, setMistakes] = useState(0);
  
  const timerRef = useRef<any>(null);
  const audioIntervalRef = useRef<any>(null);

  // Логика за повтарящ се звук при провал
  useEffect(() => {
    if (status === 'failed') {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContext();
      playSingleErrorPulse(ctx);
      // Спираме звука след 1 секунда, за да не дразни докато четат резултата
      setTimeout(() => {
        if (audioIntervalRef.current) {
           clearInterval(audioIntervalRef.current);
           audioIntervalRef.current = null;
        }
      }, 1000);
    } 
    return () => {
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    };
  }, [status]);

  const handleFail = (tierId: number) => {
    const config = TIER_CONFIG[tierId] || TIER_CONFIG[1];
    const insults = config.insults;
    const randomInsult = insults[Math.floor(Math.random() * insults.length)];
    
    setCurrentInsult(randomInsult);
    setStatus('failed');
    setPerfectRunCount(0);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleRetry = () => {
    setQIndex(0);
    setActiveMission(null);
    setStatus('playing');
    setView('selector');
    setMistakes(0);
  };

  const handleAnswerClick = (index: number) => {
    const currentQ = status === 'bonus' ? bonusQuestion : activeMission.questions[qIndex];
    
    if (index === currentQ.correct) {
      if (status === 'bonus') {
        proceed();
      } else {
        setStatus('explaining');
        setTimer(120);
        if (qIndex + 1 === activeMission.questions.length) {
           setPerfectRunCount(prev => prev + 1);
        }
      }
    } else {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContext();
      playSingleErrorPulse(ctx);

      const config = TIER_CONFIG[activeMission.id] || TIER_CONFIG[1];
      const maxAllowed = config.allowedMistakes;
      
      const newMistakes = mistakes + 1;
      setMistakes(newMistakes);

      if (newMistakes > maxAllowed) {
        handleFail(activeMission.id);
      }
    }
  };

  useEffect(() => {
    if (perfectRunCount >= 3 && view !== 'quiz' && activeMission?.id !== 0) {
      setStatus('glitch');
      setTimeout(() => {
        setActiveMission(getMissionByTier(0));
        setQIndex(0);
        setView('quiz');
        setStatus('playing');
        setMistakes(0);
      }, 3000);
    }
  }, [perfectRunCount]);

  const startBonus = () => {
    const nextTier = activeMission.id < 3 ? activeMission.id + 1 : 3;
    const pool = DATA_MAP[nextTier];
    const rawQuestion = pool[Math.floor(Math.random() * pool.length)];
    
    setBonusQuestion(randomizeQuestionOptions(rawQuestion));
    setStatus('bonus');
  };

  useEffect(() => {
    if (status === 'explaining' && timer > 0) {
      timerRef.current = setInterval(() => setTimer(prev => prev - 1), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [status, timer]);

  const proceed = () => {
    if (qIndex + 1 < activeMission.questions.length) {
      setQIndex(qIndex + 1);
      setStatus('playing');
    } else {
      setView('selector');
      setActiveMission(null);
      setMistakes(0);
    }
  };

  const startGame = (mission: any) => {
    setActiveMission(mission); 
    setQIndex(0); 
    setView('quiz'); 
    setMistakes(0);
    setStatus('playing');
  };

  const submitName = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim().length > 0) {
      setView('selector');
    }
  };

  if (status === 'glitch') {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center animate-glitch">
        <Ghost size={120} className="text-[#ffd700] mb-8" />
        <h2 className="font-orbitron text-4xl text-[#ffd700] font-black italic uppercase text-center px-6">ОТКЛЮЧВАНЕ НА ЗАБРАНЕНИ ЗНАНИЯ...</h2>
        <div className="mt-4 text-white/20 font-mono">CRITICAL_SUCCESS // OVERRIDE_SAFETY_PROTOCOLS</div>
      </div>
    );
  }

  if (view === 'home') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-black overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.aorus.com/assets/img/hero_bg.jpg')] bg-cover opacity-10 pointer-events-none"></div>
        <div className="z-10 mb-8 flex gap-3">
           <div className="w-3 h-10 bg-[#ff6b00] skew-box shadow-[0_0_20px_#ff6b00]"></div>
           <div className="w-3 h-10 bg-white/20 skew-box"></div>
        </div>
        <h1 className="z-10 font-orbitron text-[clamp(2.5rem,10vw,8rem)] font-black italic mb-4 text-white tracking-tighter leading-none select-none">
          AORUS <br/><span className="text-[#ff6b00]">ACADEMY</span>
        </h1>
        <p className="z-10 text-slate-400 text-[clamp(0.9rem,2vw,1.2rem)] max-w-4xl mb-14 font-bold uppercase tracking-[0.4em] italic opacity-80 px-4">
          ИНЖЕНЕРНА ЕКСПЕРТИЗА. ГРЕШКАТА Е ФАТАЛНА.
        </p>
        <button onClick={() => setView('name-entry')} className="z-10 px-16 py-8 aorus-gradient text-black font-orbitron font-black text-2xl italic skew-box hover:scale-105 transition-all shadow-[0_0_80px_rgba(255,107,0,0.3)] group">
          <span className="unskew uppercase tracking-widest flex items-center gap-4">ИНИЦИИРАЙ <ChevronRight size={32} /></span>
        </button>
      </div>
    );
  }

  if (view === 'name-entry') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-6">
        <div className="max-w-md w-full bg-[#0a0a0c] p-10 border border-white/10 relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#ff6b00] to-transparent"></div>
          <h2 className="font-orbitron text-2xl text-white font-black italic mb-8 uppercase text-center tracking-widest">
            Идентификация
          </h2>
          <form onSubmit={submitName} className="space-y-6">
            <div>
              <label className="block text-slate-500 text-xs font-black uppercase tracking-widest mb-2">Кодово име / Nickname</label>
              <input 
                autoFocus
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full bg-black border border-white/20 p-4 text-white font-orbitron text-xl focus:border-[#ff6b00] outline-none transition-colors uppercase"
                placeholder="ВЪВЕДИ ИМЕ..."
              />
            </div>
            <button disabled={!playerName.trim()} className="w-full bg-white text-black font-black font-orbitron py-4 px-6 hover:bg-[#ff6b00] disabled:opacity-50 transition-all uppercase tracking-widest">
              Потвърди достъп
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (view === 'selector') {
    return (
      <div className="min-h-screen p-6 md:p-16 bg-[#050505] fade-in overflow-y-auto">
        <header className="fixed top-0 left-0 w-full bg-black/90 backdrop-blur border-b border-white/5 px-8 py-4 flex justify-between items-center z-50">
           <div className="flex items-center gap-2 text-slate-400 font-orbitron text-xs tracking-widest">
             <User size={14} className="text-[#ff6b00]" />
             OPERATOR: <span className="text-white uppercase">{playerName}</span>
           </div>
           <div className="flex items-center gap-2 text-slate-400 font-orbitron text-xs tracking-widest">
             <ShieldCheck size={14} className="text-[#ff6b00]" />
             STATUS: <span className="text-green-500">ACTIVE</span>
           </div>
        </header>

        <div className="max-w-7xl mx-auto mt-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 border-b border-white/10 pb-10">
             <div className="flex items-center gap-6">
               <Terminal className="text-[#ff6b00]" size={48} />
               <h2 className="font-orbitron text-3xl md:text-5xl font-black italic text-white uppercase tracking-tighter">Спецификация</h2>
             </div>
             <div className="flex items-center gap-3">
               <Volume2 size={16} className="text-slate-600" />
               <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Audio Optimized</p>
             </div>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((tier) => {
              const m = getMissionByTier(tier);
              const config = TIER_CONFIG[tier];
              return (
                <div key={tier} onClick={() => startGame(m)} className="group bg-[#08080a] p-10 border-b-8 transition-all hover:bg-[#0c0c0e] hover:-translate-y-1 cursor-pointer relative overflow-hidden flex flex-col shadow-xl min-h-[420px]" style={{ borderColor: m.color }}>
                  <m.icon size={80} style={{ color: m.color }} className="mb-10 group-hover:rotate-6 transition-transform opacity-70" />
                  <h3 className="font-orbitron text-2xl md:text-3xl font-black text-white mb-4 italic uppercase tracking-tighter">{m.title}</h3>
                  <p className="text-slate-400 font-bold text-sm uppercase tracking-widest leading-relaxed flex-1 opacity-70">{m.subtitle}</p>
                  
                  <div className="mb-6 flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-widest">
                    <ShieldCheck size={16} />
                    <span>Tolerance: {config.allowedMistakes} Errors</span>
                  </div>

                  <div className="mt-8 py-6 border-t border-white/5 flex flex-col">
                     <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Risk Level</span>
                     <span className="text-white font-black text-xl italic">{m.priceRange}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const currentQ = status === 'bonus' ? bonusQuestion : activeMission.questions[qIndex];
  const maxMistakes = TIER_CONFIG[activeMission?.id]?.allowedMistakes || 0;
  const totalLives = maxMistakes + 1;
  const currentLives = totalLives - mistakes;

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${activeMission.id === 0 ? 'bg-black border-4 border-[#ffd700]/20' : 'bg-[#050505]'}`}>
      <header className="h-20 bg-black border-b border-white/5 flex items-center justify-between px-8 shrink-0">
        <div className="flex items-center gap-6">
          <activeMission.icon style={{ color: activeMission.color }} size={32} className="animate-pulse" />
          <div className="flex flex-col">
             <span className="font-orbitron text-white font-black italic tracking-widest uppercase text-xs md:text-lg">
                {activeMission.title}
             </span>
             <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest opacity-60" style={{ color: activeMission.color }}>
                {activeMission.id === 0 ? "СИСТЕМНО ПРОСВЕТЛЕНИЕ // THE END" : `МОДУЛ: ${activeMission.id}.${qIndex + 1}`}
             </span>
          </div>
        </div>

        {/* Lives Indicator */}
        <div className="flex items-center gap-2">
            {[...Array(totalLives)].map((_, i) => (
                <div key={i} className="transition-all duration-300">
                    {i < currentLives ? (
                         <Heart size={20} className="fill-[#ff6b00] text-[#ff6b00] drop-shadow-[0_0_5px_rgba(255,107,0,0.8)]" />
                    ) : (
                         <HeartCrack size={20} className="text-slate-800" />
                    )}
                </div>
            ))}
        </div>

        <div className="hidden md:flex items-center gap-4 font-orbitron text-[10px] text-slate-700 tracking-[0.4em] uppercase">
           <span className="text-white mr-2">{playerName}</span>
           <ShieldCheck size={18} /> STREAK: {perfectRunCount}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 overflow-y-auto">
        <div className="max-w-5xl w-full fade-in">
          {status === 'explaining' ? (
            <div className="bg-[#0a0a0c] border-l-8 p-10 md:p-16 shadow-2xl relative" style={{ borderColor: activeMission.color }}>
               <h2 className="font-orbitron text-2xl font-black italic uppercase tracking-tighter mb-8" style={{ color: activeMission.color }}>АНАЛИЗ НА ДАННИТЕ</h2>
               <p className="text-xl md:text-2xl text-slate-200 leading-tight font-black italic mb-10">{currentQ.explanation}</p>
               <div className="bg-white/5 p-8 border border-white/10 mb-10 flex items-start gap-6 skew-box">
                  <div className="unskew flex items-start gap-6 w-full">
                    <Info className="text-white shrink-0 opacity-40" size={32} />
                    <div>
                      <p className="text-white/30 font-black uppercase text-[10px] mb-2 tracking-widest">ФАКТ:</p>
                      <p className="text-white font-black italic text-lg leading-snug">{currentQ.fact}</p>
                    </div>
                  </div>
               </div>
               <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <div className="flex justify-between text-[10px] font-orbitron text-slate-600 mb-4 uppercase tracking-[0.4em]">
                       <span>СИНХРОНИЗАЦИЯ: {timer}S</span>
                    </div>
                    <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                       <div className="timer-fill" style={{ width: `${(timer / 120) * 100}%`, backgroundColor: activeMission.color }}></div>
                    </div>
                  </div>
                  {activeMission.id !== 0 && (
                    <button onClick={startBonus} className="bg-red-600/10 border border-red-600/20 text-red-500 font-orbitron font-black text-xs italic px-8 py-4 skew-box hover:bg-red-600 hover:text-white transition-all">
                      <span className="unskew flex items-center gap-2"><Zap size={16} /> OVERCLOCK</span>
                    </button>
                  )}
               </div>
               <button disabled={timer > 0} onClick={proceed} className={`w-full mt-10 py-8 font-orbitron font-black text-2xl italic skew-box transition-all ${timer > 0 ? 'bg-white/5 text-slate-800' : 'bg-white text-black hover:scale-[1.02]'}`}>
                 <span className="unskew uppercase tracking-widest">{timer > 0 ? `АНАЛИЗИРАНЕ...` : "ПОТВЪРДИ ЕКСПЕРТИЗА"}</span>
               </button>
            </div>
          ) : status === 'failed' ? (
            <div className="max-w-2xl mx-auto bg-[#0a0a0c] border border-red-900/50 p-1 relative overflow-hidden animate-glitch">
               <div className="absolute top-0 left-0 w-full h-2 bg-red-600 animate-pulse"></div>
               <div className="p-10 border border-white/5 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
                  <div className="flex justify-between items-start mb-8 border-b border-white/10 pb-6">
                     <div>
                        <h2 className="text-4xl font-black font-orbitron text-red-600 italic uppercase tracking-tighter mb-2">MISSION FAILED</h2>
                        <p className="text-slate-500 text-xs font-mono uppercase tracking-[0.3em]">INCIDENT REPORT #FD-2024</p>
                     </div>
                     <FileWarning size={48} className="text-red-600" />
                  </div>

                  <div className="space-y-6 mb-10">
                     <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-bold uppercase text-xs tracking-widest">OPERATOR:</span>
                        <span className="text-white font-orbitron text-xl uppercase">{playerName}</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-bold uppercase text-xs tracking-widest">STATUS:</span>
                        <span className="text-red-500 font-black uppercase bg-red-900/20 px-3 py-1">TERMINATED</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-bold uppercase text-xs tracking-widest">SCORE:</span>
                        <span className="text-white font-black uppercase">{qIndex} / {activeMission.questions.length}</span>
                     </div>
                     <div className="border-t border-white/10 pt-4 mt-4">
                        <span className="text-slate-500 font-bold uppercase text-xs tracking-widest block mb-2">ACHIEVED RANK:</span>
                        <span className="text-[#ff6b00] font-black font-orbitron text-2xl uppercase italic tracking-wider block text-center py-4 border border-[#ff6b00]/30 bg-[#ff6b00]/5">
                           {getFailRank(qIndex)}
                        </span>
                     </div>
                     <div className="bg-red-900/10 p-4 border-l-4 border-red-600">
                        <span className="text-red-400 font-bold uppercase text-[10px] tracking-widest block mb-1">CAUSE OF DEATH:</span>
                        <p className="text-white italic font-medium">"{currentInsult}"</p>
                     </div>
                  </div>

                  <button onClick={handleRetry} className="w-full bg-white text-black font-black font-orbitron py-5 hover:bg-red-500 hover:text-white transition-all uppercase tracking-widest text-lg skew-box">
                     <span className="unskew">РЕСТАРТИРАЙ СИСТЕМАТА</span>
                  </button>
               </div>
            </div>
          ) : (
            <div>
               <h2 className="text-[clamp(1.4rem,4vw,2.8rem)] font-orbitron font-black text-white italic mb-16 leading-[1.2] uppercase tracking-tighter select-none">
                 {currentQ.text}
               </h2>
               <div className="grid gap-6">
                 {currentQ.options.map((opt, i) => (
                   <button key={i} onClick={() => handleAnswerClick(i)} className="w-full text-left p-8 bg-[#0a0a0c] border border-white/5 font-black text-slate-500 hover:text-white transition-all flex items-center justify-between group skew-box hover:bg-white/5 shadow-lg active:scale-[0.98]">
                     <span className="font-orbitron text-lg md:text-xl italic uppercase tracking-tighter unskew leading-tight pr-6">{opt}</span>
                     <ChevronRight size={32} className="opacity-0 group-hover:opacity-100 transition-all unskew shrink-0" style={{ color: activeMission.color }} />
                   </button>
                 ))}
               </div>
            </div>
          )}
        </div>
      </main>

      <footer className="h-16 bg-black flex items-center justify-between px-8 border-t border-white/5 shrink-0">
        <p className="text-[9px] font-orbitron text-slate-800 tracking-[1.2em] uppercase">AORUS ACADEMY // STREAK: {perfectRunCount}</p>
      </footer>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
