
import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Activity, Terminal, 
  ChevronRight, Skull, ShieldCheck, 
  Info, Gavel, Euro,
  Microscope, Gauge, Binary, Rocket, AlertTriangle, Zap, Crown, Ghost, Volume2, Heart, HeartCrack, User, FileWarning, Lock, CheckCircle2, Siren, ArrowRight, Mail
} from 'lucide-react';

import { TIER1_QUESTIONS } from './tier1';
import { TIER2_QUESTIONS } from './tier2';
import { TIER3_QUESTIONS } from './tier3';
import { TIER0_QUESTIONS } from './tier0';

// --- MATRIX BACKGROUND COMPONENT ---
const MatrixBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const chars = 'БГДЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЬЮЯ0123456789<>[]{}*&^%$#!'.split('');
    const fontSize = 16;
    const columns = Math.floor(width / fontSize);
    const drops: number[] = new Array(columns).fill(1);

    let lastTime = 0;
    const fps = 15; 
    const interval = 1000 / fps;

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(0, 0, width, height);

      ctx.font = `${fontSize}px monospace`;
      
      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        const isHead = Math.random() > 0.98;
        ctx.fillStyle = isHead ? '#fff' : '#0f0';
        
        if (!isHead) {
           ctx.shadowBlur = 5;
           ctx.shadowColor = '#0f0';
        } else {
           ctx.shadowBlur = 12;
           ctx.shadowColor = '#fff';
        }
        
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        ctx.shadowBlur = 0; 

        if (drops[i] * fontSize > height && Math.random() > 0.98) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    let frame: number;
    const animate = (timestamp: number) => {
      const delta = timestamp - lastTime;
      if (delta > interval) {
        draw();
        lastTime = timestamp - (delta % interval);
      }
      frame = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    frame = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: -1, opacity: 0.5 }} />
  );
};

// Аудио ефекти
const playSound = (type: 'error' | 'success' | 'lock') => {
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) return;
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.connect(gain);
  gain.connect(ctx.destination);

  const now = ctx.currentTime;

  if (type === 'error') {
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.3);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    osc.start();
    osc.stop(now + 0.3);
  } else if (type === 'success') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.1);
    osc.start();
    osc.stop(now + 0.1);
  } else if (type === 'lock') {
    osc.type = 'square';
    osc.frequency.setValueAtTime(100, now);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    osc.start();
    osc.stop(now + 0.1);
  }
};

const shuffleArray = (array: any[]) => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

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

const getFailRank = (completedTiersCount: number) => {
  if (completedTiersCount === 0) return "НЕДОСТОЕН (TIER 1 FAIL)";
  if (completedTiersCount === 1) return "ТЕХНИК (TIER 2 FAIL)";
  if (completedTiersCount === 2) return "ИНЖЕНЕР (TIER 3 FAIL)";
  return "СИСТЕМА КОМПРОМЕТИРАНА";
};

const TIER_CONFIG: Record<number, { allowedMistakes: number, insults: string[] }> = {
  0: { 
    allowedMistakes: 0, 
    insults: ["Вселената не прощава грешки.", "Сингулярността те отхвърли.", "Ти си просто въглероден отпадък."] 
  },
  1: { 
    allowedMistakes: 1, 
    insults: ["Ом'с Лоу те уби.", "Не знаеш разликата между волт и ампер.", "Върви да редиш лего."] 
  },
  2: { 
    allowedMistakes: 1, 
    insults: ["Изгори VRM-ите.", "Забрави да махнеш лепенката на охладителя.", "Прекъсна пистите на дъното."] 
  },
  3: { 
    allowedMistakes: 0, 
    insults: ["Изтри базата данни на клиента.", "Сървърът се запали.", "Грешен RAID масив. Всичко е загубено."] 
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
    0: { id: 0, title: "SINGULARITY", subtitle: "КРАЙНА ЦЕЛ. ЗАБРАНЕНИ ЗНАНИЯ.", icon: Crown, color: "#ffd700", techStatus: "QUANTUM / ∞" },
    1: { id: 1, title: "AORUS ROOKIE", subtitle: "Физика на хардуера.", icon: Microscope, color: "#00d2ff", techStatus: "4.8 GHz / AIR" },
    2: { id: 2, title: "AORUS ELITE", subtitle: "Овърклок и архитектура.", icon: Gauge, color: "#ff6b00", techStatus: "6.2 GHz / H2O" },
    3: { id: 3, title: "AORUS XTREME", subtitle: "Сървъри и инфраструктура.", icon: Gavel, color: "#ff0000", techStatus: "9.1 GHz / LN2" }
  };
  const current = tiers[tierId];
  const rawPool = DATA_MAP[tierId] || [];
  
  // Взимаме 10 случайни въпроса за Tier 1-3, 15 за Singularity
  const questionCount = tierId === 0 ? 15 : 10;
  let pool = shuffleArray([...rawPool]).slice(0, questionCount);
  
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
  const [bonusSourceTier, setBonusSourceTier] = useState<number>(0); // New state to track bonus origin
  const [currentInsult, setCurrentInsult] = useState("");
  const [mistakes, setMistakes] = useState(0);
  
  // State for progression
  const [unlockedTiers, setUnlockedTiers] = useState<number[]>([1]);
  const [finishedTiers, setFinishedTiers] = useState<number[]>([]);
  
  const timerRef = useRef<any>(null);
  const explanationScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === 'failed') playSound('error');
  }, [status]);

  const handleFail = (tierId: number) => {
    const config = TIER_CONFIG[tierId] || TIER_CONFIG[1];
    setCurrentInsult(config.insults[Math.floor(Math.random() * config.insults.length)]);
    setStatus('failed');
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleRetry = () => {
    setUnlockedTiers([1]);
    setFinishedTiers([]);
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
        // OVERCLOCK SUCCEEDED: Instant skip
        playSound('success');
        setTimer(0);
        setStatus('explaining');
        if (explanationScrollRef.current) explanationScrollRef.current.scrollTop = 0;
      } else {
        // MAIN QUESTION SUCCEEDED
        playSound('success');
        setStatus('explaining');
        setTimer(120); 
        if (explanationScrollRef.current) explanationScrollRef.current.scrollTop = 0;
      }
    } else {
      playSound('error');
      
      if (status === 'bonus') {
         setStatus('explaining');
      } else {
         const newMistakes = mistakes + 1;
         setMistakes(newMistakes);
         if (newMistakes > (TIER_CONFIG[activeMission.id]?.allowedMistakes || 0)) {
           handleFail(activeMission.id);
         }
      }
    }
  };

  // STRICT BONUS LOGIC
  const startBonus = () => {
    let sourceTierId = 1;

    // Explicit mapping to prevent Tier 0 leakage
    if (activeMission.id === 1) {
      sourceTierId = 2; // Rookie gets Elite questions
    } else if (activeMission.id === 2) {
      sourceTierId = 3; // Elite gets Xtreme questions
    } else if (activeMission.id === 3) {
      sourceTierId = 3; // Xtreme gets Xtreme questions (Hard cap, NO Tier 0)
    } else {
      // Fallback (should not happen for valid gameplay)
      sourceTierId = activeMission.id;
    }

    const pool = DATA_MAP[sourceTierId];
    // Safety check if pool exists
    if (!pool || pool.length === 0) {
        console.error("Missing pool for tier", sourceTierId);
        return;
    }

    const rawQ = pool[Math.floor(Math.random() * pool.length)];
    setBonusQuestion(randomizeQuestionOptions(rawQ));
    setBonusSourceTier(sourceTierId);
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
      const currentTierId = activeMission.id;
      if (!finishedTiers.includes(currentTierId)) {
        const newFinished = [...finishedTiers, currentTierId];
        setFinishedTiers(newFinished);
        
        let nextTierToUnlock = -1;
        if (currentTierId === 1) nextTierToUnlock = 2;
        if (currentTierId === 2) nextTierToUnlock = 3;
        if (currentTierId === 3) nextTierToUnlock = 0;

        if (nextTierToUnlock !== -1 && !unlockedTiers.includes(nextTierToUnlock)) {
           setUnlockedTiers([...unlockedTiers, nextTierToUnlock]);
        }
      }
      setView('selector');
      setActiveMission(null);
      setMistakes(0);
    }
  };

  const startGame = (mission: any) => {
    if (!unlockedTiers.includes(mission.id)) {
      playSound('lock');
      return;
    }

    if (mission.id === 0) {
       setStatus('glitch');
       setTimeout(() => {
         setActiveMission(mission);
         setQIndex(0);
         setView('quiz');
         setStatus('playing');
         setMistakes(0);
       }, 2000);
       return;
    }

    setActiveMission(mission); 
    setQIndex(0); 
    setView('quiz'); 
    setMistakes(0);
    setStatus('playing');
  };

  const submitName = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim()) setView('selector');
  };

  if (status === 'glitch') {
    return (
      <div className="min-h-screen bg-black/80 flex flex-col items-center justify-center animate-glitch relative">
        <MatrixBackground />
        <Ghost size={120} className="text-[#ffd700] mb-8 z-10" />
        <h2 className="z-10 font-orbitron text-4xl text-[#ffd700] font-black italic uppercase text-center px-6">СИНГУЛЯРНОСТ...</h2>
        <div className="z-10 mt-4 text-white/20 font-mono">CRITICAL_SYSTEM_OVERRIDE</div>
      </div>
    );
  }

  if (view === 'home') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-transparent overflow-hidden relative">
        <MatrixBackground />
        <div className="z-10 mb-8 flex gap-3"><div className="w-3 h-10 bg-[#ff6b00] shadow-[0_0_20px_#ff6b00]"></div><div className="w-3 h-10 bg-white/20"></div></div>
        <h1 className="z-10 font-orbitron text-[clamp(2.5rem,10vw,8rem)] font-black italic mb-4 text-white tracking-tighter leading-none select-none">AORUS <br/><span className="text-[#ff6b00]">ACADEMY</span></h1>
        <p className="z-10 text-slate-300 text-[clamp(0.9rem,2vw,1.2rem)] max-w-4xl mb-14 font-bold uppercase tracking-[0.4em] italic opacity-90 px-4 bg-black/40 py-2">Тук играят големите. Ако си готов — влизай. Ако не — чети и учи.</p>
        <button onClick={() => setView('name-entry')} className="z-10 px-16 py-8 aorus-gradient text-black font-orbitron font-black text-2xl italic hover:scale-105 transition-all shadow-[0_0_80px_rgba(255,107,0,0.3)] group"><span className="flex items-center gap-4">ИНИЦИИРАЙ <ChevronRight size={32} /></span></button>
      </div>
    );
  }

  if (view === 'name-entry') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent p-6 relative">
        <MatrixBackground />
        <div className="max-w-md w-full bg-black/80 backdrop-blur-xl p-10 border border-white/10 relative z-10 rounded-2xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#ff6b00] to-transparent"></div>
          <h2 className="font-orbitron text-2xl text-white font-black italic mb-8 uppercase text-center tracking-widest">Идентификация</h2>
          <form onSubmit={submitName} className="space-y-6">
            <div>
              <label className="block text-slate-400 text-xs font-black uppercase tracking-widest mb-2 px-1">Кодово име / Nickname</label>
              <input autoFocus value={playerName} onChange={(e) => setPlayerName(e.target.value)} className="w-full bg-black/60 border border-white/20 p-4 text-white font-orbitron text-xl focus:border-[#ff6b00] outline-none transition-colors uppercase" placeholder="ВЪВЕДИ ИМЕ..." />
            </div>
            <button disabled={!playerName.trim()} className="w-full bg-white text-black font-black font-orbitron py-4 px-6 hover:bg-[#ff6b00] disabled:opacity-50 transition-all uppercase tracking-widest rounded-lg">Потвърди достъп</button>
          </form>
        </div>
      </div>
    );
  }

  if (view === 'selector') {
    return (
      <div className="min-h-screen p-6 md:p-16 bg-transparent fade-in overflow-y-auto relative">
        <MatrixBackground />
        <header className="fixed top-0 left-0 w-full bg-black/80 backdrop-blur-md border-b border-white/5 px-8 py-4 flex justify-between items-center z-50">
           <div className="flex items-center gap-2 text-slate-400 font-orbitron text-xs tracking-widest"><User size={14} className="text-[#ff6b00]" />OPERATOR: <span className="text-white uppercase">{playerName}</span></div>
           
           <div className="hidden md:flex flex-col items-center justify-center gap-1 opacity-60 hover:opacity-100 transition-opacity">
              <div className="text-[#ff6b00] font-orbitron text-[10px] font-black tracking-[0.2em] uppercase">PhoenixOrg</div>
              <div className="flex items-center gap-2 text-slate-400 text-[9px] font-mono tracking-wider">
                <Mail size={10} />
                phoenixbg.org@gmail.com
              </div>
           </div>

           <div className="flex items-center gap-2 text-slate-400 font-orbitron text-xs tracking-widest"><ShieldCheck size={14} className="text-[#ff6b00]" />STATUS: <span className="text-white">ONLINE</span></div>
        </header>

        <div className="max-w-7xl mx-auto mt-16 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 border-b border-white/10 pb-10 bg-black/20 p-4 rounded-xl">
             <div className="flex items-center gap-6"><Terminal className="text-[#ff6b00]" size={48} /><h2 className="font-orbitron text-3xl md:text-5xl font-black italic text-white uppercase tracking-tighter">Спецификация</h2></div>
             <div className="flex items-center gap-3"><Volume2 size={16} className="text-slate-400" /><p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Audio Optimized</p></div>
          </div>
          <div className="grid lg:grid-cols-4 gap-6">
            {[1, 2, 3, 0].map((tier) => {
              const m = getMissionByTier(tier);
              const isUnlocked = unlockedTiers.includes(tier);
              const isFinished = finishedTiers.includes(tier);
              
              return (
                <div key={tier} onClick={() => startGame(m)} className={`group bg-black/60 backdrop-blur-md p-8 border-b-8 transition-all relative overflow-hidden flex flex-col shadow-2xl min-h-[460px] rounded-t-2xl border-white/10 hover:border-b-white transition-all ${!isUnlocked ? 'cursor-not-allowed opacity-50 grayscale' : 'cursor-pointer hover:bg-black/80 hover:-translate-y-1'}`} style={{ borderColor: !isUnlocked ? '#333' : m.color }}>
                  
                  {!isUnlocked && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-20 backdrop-blur-[2px]">
                       <Lock size={48} className="text-white/40 mb-4" />
                       <span className="font-orbitron text-[10px] text-white/40 tracking-[0.3em] uppercase">ЗАКЛЮЧЕНО НИВО</span>
                       <span className="text-[8px] text-red-500 font-bold mt-2 uppercase">ИЗИСКВА ПРЕДХОДНОТО</span>
                    </div>
                  )}

                  {isFinished && (
                    <div className="absolute top-4 right-4 z-20">
                      <CheckCircle2 className="text-green-500 w-8 h-8" />
                    </div>
                  )}

                  <m.icon size={64} style={{ color: !isUnlocked ? '#444' : m.color }} className={`mb-10 transition-transform ${isUnlocked && 'group-hover:rotate-6 opacity-80'}`} />
                  <h3 className="font-orbitron text-2xl font-black text-white mb-4 italic uppercase tracking-tighter">{m.title}</h3>
                  <p className="text-slate-300 font-bold text-xs uppercase tracking-widest leading-relaxed flex-1 opacity-90">{m.subtitle}</p>
                  
                  <div className="mb-6 flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest">
                    <ShieldCheck size={16} />
                    <span>{TIER_CONFIG[tier].allowedMistakes === 0 ? "0 ГРЕШКИ (SUDDEN DEATH)" : `${TIER_CONFIG[tier].allowedMistakes} ГРЕШКИ MAX`}</span>
                  </div>

                  <div className="mt-8 py-6 border-t border-white/10 flex flex-col">
                     <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{tier === 0 ? "Potential" : "System Status"}</span>
                     <span className="text-white font-black text-lg italic tracking-wide">{!isUnlocked ? "LOCKED" : m.techStatus}</span>
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
  const currentLives = (maxMistakes + 1) - mistakes;

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 relative ${activeMission.id === 0 ? 'bg-black/90' : 'bg-transparent'}`}>
      <MatrixBackground />
      <header className="h-20 bg-black/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-8 shrink-0 z-50">
        <div className="flex items-center gap-6">
          <activeMission.icon style={{ color: activeMission.color }} size={32} className="animate-pulse" />
          <div className="flex flex-col">
             <span className="font-orbitron text-white font-black italic tracking-widest uppercase text-xs md:text-lg">{activeMission.title}</span>
             <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest opacity-80" style={{ color: activeMission.color }}>{activeMission.id === 0 ? "СИНГУЛЯРНОСТ" : `МОДУЛ: ${activeMission.id}.${qIndex + 1}`}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
            {[...Array(maxMistakes + 1)].map((_, i) => (
                <div key={i}>{i < currentLives ? <Heart size={20} className="fill-[#ff6b00] text-[#ff6b00] drop-shadow-[0_0_10px_rgba(255,107,0,1)]" /> : <HeartCrack size={20} className="text-slate-800" />}</div>
            ))}
        </div>
        <div className="hidden md:flex items-center gap-4 font-orbitron text-[10px] text-slate-400 tracking-[0.4em] uppercase">
           <span className="text-white mr-2">{playerName}</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 overflow-hidden relative z-10">
        <div className="max-w-5xl w-full fade-in h-[calc(100vh-160px)] flex flex-col justify-center">
          {status === 'explaining' ? (
            <div className="bg-black/90 backdrop-blur-xl border-l-8 p-8 md:p-12 shadow-2xl relative rounded-r-2xl h-full flex flex-col" style={{ borderColor: activeMission.color }}>
               {/* Header Area */}
               <div className="flex-shrink-0 mb-6 border-b border-white/10 pb-6 flex justify-between items-center">
                  <h2 className="font-orbitron text-3xl font-black italic uppercase tracking-tighter" style={{ color: activeMission.color }}>АНАЛИЗ НА МОДУЛА</h2>
                  <div className="flex items-center gap-3">
                     <span className="text-slate-500 font-bold uppercase text-xs tracking-widest">ВРЕМЕ ЗА АСИМИЛИРАНЕ</span>
                     <div className={`font-mono text-xl ${timer > 0 ? 'text-white' : 'text-green-500'}`}>{timer}s</div>
                  </div>
               </div>

               {/* Scrollable Content Area */}
               <div ref={explanationScrollRef} className="flex-1 overflow-y-auto pr-4 scroll-custom space-y-8">
                   <div>
                       <h3 className="text-slate-500 font-bold uppercase text-xs tracking-widest mb-2">ТЕХНИЧЕСКО ОБЯСНЕНИЕ</h3>
                       <p className="text-lg md:text-xl text-white leading-relaxed font-medium">{currentQ.explanation}</p>
                   </div>
                   
                   <div className="bg-white/5 p-6 border border-white/10 rounded-lg flex gap-4">
                        <Info className="text-blue-400 shrink-0 mt-1" size={24} />
                        <div>
                            <h3 className="text-blue-400/50 font-bold uppercase text-[10px] tracking-widest mb-1">ДОПЪЛНИТЕЛНИ ДАННИ</h3>
                            <p className="text-slate-300 italic">{currentQ.fact}</p>
                        </div>
                   </div>
               </div>

               {/* Footer / Actions Area */}
               <div className="flex-shrink-0 pt-6 mt-6 border-t border-white/10">
                   <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden mb-6">
                      <div className="h-full transition-all duration-1000 ease-linear" style={{ width: `${(timer / 120) * 100}%`, backgroundColor: activeMission.color }}></div>
                   </div>

                   <div className="flex flex-col md:flex-row gap-4 h-16">
                      {activeMission.id !== 0 && timer > 0 && (
                        <button onClick={startBonus} className="flex-1 bg-red-900/20 border border-red-600/50 text-red-500 hover:bg-red-600 hover:text-white transition-all font-orbitron font-black text-sm uppercase italic tracking-widest flex items-center justify-center gap-2 group">
                          <Zap size={18} className="group-hover:scale-110 transition-transform" />
                          <span>Overclock (Skip Timer)</span>
                        </button>
                      )}
                      
                      <button 
                        disabled={timer > 0} 
                        onClick={proceed} 
                        className={`flex-1 transition-all font-orbitron font-black text-xl uppercase italic tracking-widest flex items-center justify-center gap-3 ${timer > 0 ? 'bg-white/5 text-slate-600 cursor-not-allowed border border-white/5' : 'bg-white text-black hover:scale-[1.02] shadow-[0_0_30px_rgba(255,255,255,0.2)]'}`}
                      >
                         {timer > 0 ? (
                             <span className="flex items-center gap-2 animate-pulse"><Binary size={16} /> ОБРАБОТКА...</span>
                         ) : (
                             <>
                                ПРОДЪЛЖИ <ArrowRight size={24} />
                             </>
                         )}
                      </button>
                   </div>
               </div>
            </div>
          ) : status === 'failed' ? (
            <div className="max-w-2xl mx-auto bg-black/90 backdrop-blur-2xl border border-red-900/50 p-1 relative overflow-hidden animate-glitch rounded-2xl">
               <div className="absolute top-0 left-0 w-full h-2 bg-red-600 animate-pulse"></div>
               <div className="p-10 border border-white/5">
                  <div className="flex justify-between items-start mb-8 border-b border-white/10 pb-6"><div><h2 className="text-4xl font-black font-orbitron text-red-600 italic uppercase tracking-tighter mb-2">MISSION FAILED</h2><p className="text-slate-400 text-xs font-mono uppercase tracking-[0.3em]">CRITICAL ERROR. SYSTEM RESET.</p></div><FileWarning size={48} className="text-red-600" /></div>
                  <div className="space-y-6 mb-10">
                     <div className="flex justify-between items-center"><span className="text-slate-400 font-bold uppercase text-xs tracking-widest">OPERATOR:</span><span className="text-white font-orbitron text-xl uppercase">{playerName}</span></div>
                     <div className="flex justify-between items-center"><span className="text-slate-400 font-bold uppercase text-xs tracking-widest">STATUS:</span><span className="text-red-500 font-black uppercase bg-red-900/20 px-3 py-1 rounded">PROGRESS WIPED</span></div>
                     <div className="border-t border-white/10 pt-4 mt-4"><span className="text-slate-400 font-bold uppercase text-xs tracking-widest block mb-2">RANK AT DEATH:</span><span className="text-[#ff6b00] font-black font-orbitron text-2xl uppercase italic tracking-wider block text-center py-4 border border-[#ff6b00]/30 bg-[#ff6b00]/10 rounded-xl">{getFailRank(finishedTiers.length)}</span></div>
                     <div className="bg-red-900/20 p-4 border-l-4 border-red-600 rounded-r-lg"><span className="text-red-400 font-bold uppercase text-[10px] tracking-widest block mb-1">CAUSE OF DEATH:</span><p className="text-white italic font-medium">"{currentInsult}"</p></div>
                  </div>
                  <button onClick={handleRetry} className="w-full bg-white text-black font-black font-orbitron py-5 hover:bg-red-500 hover:text-white transition-all uppercase tracking-widest text-lg rounded-lg"><span className="unskew">РЕСТАРТИРАЙ СИМУЛАЦИЯТА</span></button>
               </div>
            </div>
          ) : (
            <div className="bg-black/40 backdrop-blur-sm p-8 rounded-3xl h-full flex flex-col justify-center">
               {status === 'bonus' && (
                  <div className="mb-4 flex items-center justify-between">
                     <div className="flex items-center gap-2 text-red-500 font-black uppercase tracking-widest text-xs animate-pulse">
                        <Zap size={16} /> OVERCLOCK QUESTION (RISK FREE)
                     </div>
                     <div className="text-[10px] font-mono text-slate-500 uppercase">
                        ACCESSING TIER {bonusSourceTier} DATABASE...
                     </div>
                  </div>
               )}
               <div className="flex-1 flex items-center">
                  <h2 className="text-[clamp(1.4rem,4vw,2.8rem)] font-orbitron font-black text-white italic leading-[1.2] uppercase tracking-tighter select-none drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">{currentQ.text}</h2>
               </div>
               
               <div className="grid gap-4 mt-8">
                 {currentQ.options.map((opt: string, i: number) => (
                   <button key={i} onClick={() => handleAnswerClick(i)} className="w-full text-left p-6 bg-black/70 border border-white/10 font-black text-slate-300 hover:text-white transition-all flex items-center justify-between group skew-box hover:bg-white/10 shadow-xl active:scale-[0.98] rounded-lg">
                     <span className="font-orbitron text-base md:text-lg italic uppercase tracking-tighter unskew leading-tight pr-6">{opt}</span><ChevronRight size={24} className="opacity-0 group-hover:opacity-100 transition-all unskew shrink-0" style={{ color: activeMission.color }} />
                   </button>
                 ))}
               </div>
            </div>
          )}
        </div>
      </main>
      <footer className="h-16 bg-black/80 flex items-center justify-between px-8 border-t border-white/5 shrink-0 z-50">
        <p className="text-[9px] font-orbitron text-slate-500 tracking-[1.2em] uppercase">AORUS ACADEMY // COMPLETED MODULES: {finishedTiers.length}</p>
      </footer>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
