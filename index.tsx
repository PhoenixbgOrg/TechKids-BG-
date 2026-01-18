
import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Activity, Terminal, 
  ChevronRight, Skull, ShieldCheck, 
  Info, Gavel, Euro,
  Microscope, Gauge, Binary, Rocket, AlertTriangle, Zap, Crown, Ghost
} from 'lucide-react';

import { TIER1_QUESTIONS } from './tier1';
import { TIER2_QUESTIONS } from './tier2';
import { TIER3_QUESTIONS } from './tier3';
import { TIER0_QUESTIONS } from './tier0';

const shuffleArray = (array: any[]) => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

const INSULTS = [
  "HEADSHOT! Връщай се на Правец 8Ц, нищо не разбираш!",
  "MELTDOWN! Твоето ниво е Тетрис на батерии. Пробвай пак.",
  "LGA пиновете ти са по-изкривени от логиката ти! Слаб 2.",
  "SCRUB DETECTED! Отивай да редиш пасианс на Windows 95.",
  "CRITICAL ERROR! Дори захранване за 10 лв. е по-стабилно от теб.",
  "BURNED! Процесорът ти прегря от 2 въпроса. Марш в 1-ви клас.",
  "SYSTEM PURGED! С твоите знания само калкулатори можеш да пипаш.",
  "ID10T ERROR! Проблемът е в задклавишния механизъм. Чао!",
  "BSOD! Син екран за твоя интелект. Рестартирай живота си."
];

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
  const pool = DATA_MAP[tierId] || [];
  // Разбъркваме само ако не сме в Сингулярност (тя трябва да е в фиксиран ред за психологическия край)
  return { ...current, questions: tierId === 0 ? pool : shuffleArray(pool) };
};

const App = () => {
  const [view, setView] = useState('home');
  const [activeMission, setActiveMission] = useState<any>(null);
  const [qIndex, setQIndex] = useState(0);
  const [status, setStatus] = useState<'playing' | 'explaining' | 'bonus' | 'failed' | 'glitch'>('playing');
  const [timer, setTimer] = useState(120);
  const [bonusQuestion, setBonusQuestion] = useState<any>(null);
  const [currentInsult, setCurrentInsult] = useState("");
  const [perfectRunCount, setPerfectRunCount] = useState(0); 
  const timerRef = useRef<any>(null);

  const triggerFailure = () => {
    const randomInsult = INSULTS[Math.floor(Math.random() * INSULTS.length)];
    setCurrentInsult(randomInsult);
    setStatus('failed');
    setPerfectRunCount(0);
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeout(() => {
      setQIndex(0);
      setActiveMission(null);
      setStatus('playing');
      setView('home');
    }, 4500);
  };

  const handleCorrect = () => {
    setStatus('explaining');
    setTimer(120);
    // Ако завършим мисия перфектно, вдигаме брояча
    if (qIndex + 1 === activeMission.questions.length) {
       setPerfectRunCount(prev => prev + 1);
    }
  };

  useEffect(() => {
    // Ако си минал 3 нива без грешка, автоматично отключваме Сингулярността
    if (perfectRunCount >= 3 && view !== 'quiz' && activeMission?.id !== 0) {
      setStatus('glitch');
      setTimeout(() => {
        setActiveMission(getMissionByTier(0));
        setQIndex(0);
        setView('quiz');
        setStatus('playing');
      }, 3000);
    }
  }, [perfectRunCount]);

  const startBonus = () => {
    const nextTier = activeMission.id < 3 ? activeMission.id + 1 : 3;
    const pool = DATA_MAP[nextTier];
    setBonusQuestion(pool[Math.floor(Math.random() * pool.length)]);
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
      setView('home');
      setActiveMission(null);
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
        <button onClick={() => setView('selector')} className="z-10 px-16 py-8 aorus-gradient text-black font-orbitron font-black text-2xl italic skew-box hover:scale-105 transition-all shadow-[0_0_80px_rgba(255,107,0,0.3)] group">
          <span className="unskew uppercase tracking-widest flex items-center gap-4">ИНИЦИИРАЙ <ChevronRight size={32} /></span>
        </button>
      </div>
    );
  }

  if (view === 'selector') {
    return (
      <div className="min-h-screen p-6 md:p-16 bg-[#050505] fade-in overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 border-b border-white/10 pb-10">
             <div className="flex items-center gap-6">
               <Terminal className="text-[#ff6b00]" size={48} />
               <h2 className="font-orbitron text-3xl md:text-5xl font-black italic text-white uppercase tracking-tighter">Спецификация</h2>
             </div>
             <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Избери своята каста</p>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((tier) => {
              const m = getMissionByTier(tier);
              return (
                <div key={tier} onClick={() => { setActiveMission(m); setQIndex(0); setView('quiz'); }} className="group bg-[#08080a] p-10 border-b-8 transition-all hover:bg-[#0c0c0e] hover:-translate-y-1 cursor-pointer relative overflow-hidden flex flex-col shadow-xl min-h-[420px]" style={{ borderColor: m.color }}>
                  <m.icon size={80} style={{ color: m.color }} className="mb-10 group-hover:rotate-6 transition-transform opacity-70" />
                  <h3 className="font-orbitron text-2xl md:text-3xl font-black text-white mb-4 italic uppercase tracking-tighter">{m.title}</h3>
                  <p className="text-slate-400 font-bold text-sm uppercase tracking-widest leading-relaxed flex-1 opacity-70">{m.subtitle}</p>
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

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${status === 'failed' ? 'emergency-reset' : activeMission.id === 0 ? 'bg-black border-4 border-[#ffd700]/20' : 'bg-[#050505]'}`}>
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
        <div className="hidden md:flex items-center gap-4 font-orbitron text-[10px] text-slate-700 tracking-[0.4em] uppercase">
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
            <div className="text-center px-4 animate-glitch">
               <Skull size={150} className="mx-auto text-white mb-10 animate-bounce" />
               <h2 className="font-orbitron text-[clamp(2rem,8vw,5rem)] font-black italic text-white mb-4 uppercase tracking-tighter leading-none">{currentInsult.split('!')[0]}!</h2>
               <p className="text-red-500 text-[clamp(1rem,3vw,2rem)] font-black uppercase tracking-tight italic">{currentInsult.split('!')[1]}</p>
            </div>
          ) : (
            <div>
               <h2 className="text-[clamp(1.4rem,4vw,2.8rem)] font-orbitron font-black text-white italic mb-16 leading-[1.2] uppercase tracking-tighter select-none">
                 {currentQ.text}
               </h2>
               <div className="grid gap-6">
                 {currentQ.options.map((opt, i) => (
                   <button key={i} onClick={() => i === currentQ.correct ? (status === 'bonus' ? proceed() : handleCorrect()) : triggerFailure()} className="w-full text-left p-8 bg-[#0a0a0c] border border-white/5 font-black text-slate-500 hover:text-white transition-all flex items-center justify-between group skew-box hover:bg-white/5 shadow-lg">
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
