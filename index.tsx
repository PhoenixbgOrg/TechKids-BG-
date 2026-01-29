
import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Activity, Terminal, ChevronRight, Skull, 
  Info, Gavel, Microscope, Gauge, Zap, Crown, 
  Heart, HeartCrack, User, Lock, Timer, AlertTriangle, RefreshCw, Trophy,
  Share2, Copy, Check, CheckSquare, Square
} from 'lucide-react';

// Инклудиране на съществуващите въпроси от файловете
import { TIER1_QUESTIONS } from './tier1';
import { TIER2_QUESTIONS } from './tier2';
import { TIER3_QUESTIONS } from './tier3';
import { TIER0_QUESTIONS } from './tier0';

// --- UTILS ---
const shuffle = <T,>(array: T[]): T[] => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

const processQuestion = (q: any) => {
  const originalOptions = [...(q.options || q.optionsBG || [])];
  const shuffledOptions = shuffle(originalOptions);

  // Ако correct е < 0, въпросът е „без верен отговор“ (нарочно).
  const rawCorrect = (q.correct ?? q.correctIdx ?? 0);
  const newCorrectIdx = (typeof rawCorrect === 'number' && rawCorrect < 0)
    ? -1
    : shuffledOptions.indexOf(originalOptions[rawCorrect] ?? originalOptions[0]);

  return {
    ...q,
    options: shuffledOptions,
    correct: newCorrectIdx,
    text: q.text || q.textBG,
    explanation: q.explanation || q.explanationBG,
    fact: q.fact || q.factBG
  };
};

const DATA_MAP: Record<number, any[]> = {
  1: TIER1_QUESTIONS,
  2: TIER2_QUESTIONS,
  3: TIER3_QUESTIONS,
  0: TIER0_QUESTIONS
};

const generateSessionPool = (tierId: number) => {
  const rawData = DATA_MAP[tierId] || [];
  let pool = rawData.map(processQuestion);
  
  // Ако няма достатъчно въпроси, запълваме с дубликати (за демото)
  if (pool.length < 50 && pool.length > 0) {
    const originalLength = pool.length;
    for (let i = 0; pool.length < 50; i++) {
      pool.push({ ...pool[i % originalLength], id: `extra-${tierId}-${i}` });
    }
  }
  
  // Tier 0: винаги слагаме финалния „квантов“ въпрос последен.
  if (tierId === 0) {
    const finalId = 't0-260-final';
    const finalQ = pool.find(q => q.id === finalId);
    if (finalQ) {
      const rest = pool.filter(q => q.id !== finalId);
      const picked = shuffle(rest).slice(0, 49);
      return [...picked, finalQ];
    }
  }

  return shuffle(pool).slice(0, 50);
};

// --- COMPONENT: MATRIX BACKGROUND ---
const MatrixBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    
    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;
    
    const chars = '0123456789ABCDEF'.split('');
    const fontSize = 16;
    const columns = Math.floor(w / fontSize);
    const drops = new Array(columns).fill(1);
    
    let lastTime = 0;
    const fps = 15; 
    const interval = 1000 / fps;

    const draw = (timestamp: number) => {
      const delta = timestamp - lastTime;
      if (delta > interval) {
        lastTime = timestamp - (delta % interval);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'; 
        ctx.fillRect(0, 0, w, h);
        ctx.font = `${fontSize}px monospace`;
        drops.forEach((y, i) => {
          const text = chars[Math.floor(Math.random() * chars.length)];
          ctx.fillStyle = Math.random() > 0.95 ? '#fff' : '#ff6b00';
          ctx.fillText(text, i * fontSize, y * fontSize);
          if (y * fontSize > h && Math.random() > 0.975) drops[i] = 0;
          drops[i]++;
        });
      }
      requestAnimationFrame(draw);
    };

    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    const animId = requestAnimationFrame(draw);
    return () => {
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-10 opacity-30 pointer-events-none" />;
};

const AorusButton = ({ children, onClick, variant = 'primary', className = '', disabled = false }: any) => {
  const base = `relative px-8 py-4 font-orbitron font-black italic uppercase transition-all transform skew-x-[-12deg] group overflow-hidden shadow-2xl select-none border-none outline-none inline-flex items-center justify-center text-center ${disabled ? 'opacity-50 cursor-not-allowed grayscale' : 'active:scale-95 cursor-pointer'}`;
  const styles = {
    primary: "bg-orange-600 text-white hover:bg-orange-500 shadow-orange-900/40",
    secondary: "bg-white text-black hover:bg-slate-200 shadow-white/10",
    danger: "bg-red-700 text-white hover:bg-red-600 shadow-red-900/40",
    outline: "bg-white/5 border border-white/10 text-white hover:border-orange-500 hover:bg-orange-500/10"
  };
  
  return (
    <button 
      type="button"
      disabled={disabled}
      onClick={(e) => {
        if (onClick && !disabled) onClick(e);
      }} 
      className={`${base} ${styles[variant as keyof typeof styles]} ${className}`}
    >
      <span className="relative z-10 unskew flex items-center justify-center gap-3">
        {children}
      </span>
      {!disabled && <div className="absolute top-0 -left-full w-full h-full bg-white/20 skew-x-[45deg] group-hover:left-full transition-all duration-500 ease-in-out"></div>}
    </button>
  );
};

// Firm but motivating failure comments (No shaming)
const FAILURE_COMMENTS: Record<number, string[]> = {
  1: ["Системата прегря. Охлади и опитай пак.", "Добър опит, но недостатъчен. Рестартирай.", "Грешките са част от процеса. Пробвай отново."],
  2: ["Трябва още практика. Не се отказвай!", "Близо си, но не достатъчно. Рестарт!", "Имаш потенциал. Опитай пак."],
  3: ["Високо напрежение! Внимавай повече.", "Критична грешка. Системата изисква рестарт.", "Почти го хвана. Следващият път ще успееш."],
  0: ["Сингулярността е близо, но не и днес.", "Квантова грешка. Опитай отново.", "Вселената ти дава втори шанс. Използвай го."]
};

const SUCCESS_PHRASES = [
  "БРАВО!", "ТОЧНО ТАКА.", "СИЛЕН ХОД.", "ОТЛИЧНА РАБОТА.",
  "ХАКЕРСКО ИЗПЪЛНЕНИЕ!", "СИСТЕМАТА ПОТВЪРЖДАВА.", "АБСОЛЮТНО ТОЧНО.",
  "ДОМИНАЦИЯ!", "ЧИСТА ПОБЕДА."
];

const ANALYSIS_HEADERS = [
  "Анализ на ситуацията",
  "Технически доклад",
  "Системен разбор",
  "Данни от черната кутия",
  "Инженерен статус"
];

// Reading time in seconds
const ANALYSIS_TIME = 3;

const App = () => {
  const [view, setView] = useState('home');
  const [playerName, setPlayerName] = useState("");
  const [activeTier, setActiveTier] = useState<number>(1);
  const [unlockedTiers, setUnlockedTiers] = useState<number[]>([1]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [lives, setLives] = useState(3);
  const [status, setStatus] = useState<'playing' | 'explaining' | 'failed' | 'overclock' | 'rebooting'>('playing');
  const [timer, setTimer] = useState(0);
  const [overclockQ, setOverclockQ] = useState<any>(null);
  const [failMsg, setFailMsg] = useState("");
  const [isFatalError, setIsFatalError] = useState(false);
  const [praiseMsg, setPraiseMsg] = useState("");
  const [copied, setCopied] = useState(false);
  
  // New States for Tasks A, B, D
  const [questionStats, setQuestionStats] = useState<Record<string, number>>({});
  const [readConfirmed, setReadConfirmed] = useState(false);

  // Load persistence
  useEffect(() => {
    const savedName = localStorage.getItem('aorus_player_name');
    if (savedName) setPlayerName(savedName);

    const savedStats = localStorage.getItem('aorus_q_stats');
    if (savedStats) {
      try {
        setQuestionStats(JSON.parse(savedStats));
      } catch (e) {
        console.error("Failed to load stats", e);
      }
    }
  }, []);

  // Save name on change
  useEffect(() => {
    if (playerName) localStorage.setItem('aorus_player_name', playerName);
  }, [playerName]);

  const skipExplanation = () => {
    const q = status === 'overclock' ? overclockQ : questions[qIndex];
    // Ако това е финалният „квантов“ въпрос в Tier 0 — награда и рестарт към Tier 1.
    if (activeTier === 0 && q?.id === 't0-260-final') {
      setCopied(false);
      setReadConfirmed(false);
      setActiveTier(1);
      setUnlockedTiers([1]);
      setQuestions([]);
      setQIndex(0);
      setLives(3);
      setTimer(0);
      setFailMsg('');
      setIsFatalError(false);
      setOverclockQ(null);
      setStatus('playing');
      setView('selector');
      return;
    }
    setCopied(false);
    setReadConfirmed(false);
    if (qIndex < 49) {
      setQIndex(prev => prev + 1);
      setStatus('playing');
    } else {
      const next = activeTier === 3 ? 0 : (activeTier === 0 ? 0 : activeTier + 1);
      setUnlockedTiers(prev => Array.from(new Set([...prev, next])));
      setView('selector');
    }
  };

  useEffect(() => {
    let t: any;
    if (status === 'explaining' && timer > 0) {
      t = setInterval(() => setTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(t);
  }, [status, timer]);

  const rebootSystem = () => {
    if (isFatalError) {
        // FULL SYSTEM RESET (Keep Name)
        // setPlayerName(""); // Removed per Task A
        setActiveTier(1);
        setUnlockedTiers([1]);
        setQuestions([]);
        setQIndex(0);
        setLives(3);
        setTimer(0);
        setFailMsg("");
        setIsFatalError(false);
        setOverclockQ(null);
        setStatus('playing'); 
        setView('home'); 
    } else {
        // Рестарт само на нивото
        startTier(activeTier);
    }
  };

  const startTier = (id: number) => {
    const pool = generateSessionPool(id);
    setQuestions(pool);
    setActiveTier(id);
    setQIndex(0);
    setLives(3);
    setStatus('playing');
    setView('quiz');
    setIsFatalError(false);
    setFailMsg("");
    setReadConfirmed(false);
  };

  const handleAnswer = (idx: number) => {
    const q = status === 'overclock' ? overclockQ : questions[qIndex];
    
    if (idx === q.correct) {
      // Update Stats (Task B)
      const qKey = q.text; 
      const newCount = (questionStats[qKey] || 0) + 1;
      const newStats = { ...questionStats, [qKey]: newCount };
      setQuestionStats(newStats);
      localStorage.setItem('aorus_q_stats', JSON.stringify(newStats));

      if (status === 'overclock') {
        if (qIndex >= 44) {
            const next = activeTier === 3 ? 0 : (activeTier === 0 ? 0 : activeTier + 1);
            setUnlockedTiers(prev => Array.from(new Set([...prev, next])));
            setView('selector');
        } else {
            setQIndex(prev => Math.min(prev + 5, 49));
            setStatus('playing');
            setTimer(0);
        }
      } else {
        // Set praise message
        if (qIndex === 49) {
          setPraiseMsg("НИВОТО ПОКРИТО! ТИ СИ МАШИНА.");
        } else {
          setPraiseMsg(SUCCESS_PHRASES[Math.floor(Math.random() * SUCCESS_PHRASES.length)]);
        }
        setStatus('explaining'); 
        setTimer(ANALYSIS_TIME);
        setReadConfirmed(false); // Reset mini-check
      }
    } else {
      if (status === 'overclock') {
          setFailMsg("КРИТИЧЕН ПРОВАЛ НА ОВЪРКЛОКА! СИСТЕМАТА Е УНИЩОЖЕНА.");
          setIsFatalError(true);
          setStatus('failed');
      } else {
          const nextLives = lives - 1;
          setLives(nextLives);
          if (nextLives <= 0) {
            const tierComments = FAILURE_COMMENTS[activeTier] || FAILURE_COMMENTS[1];
            setFailMsg(tierComments[Math.floor(Math.random() * tierComments.length)]);
            setIsFatalError(false);
            setStatus('failed');
          }
      }
    }
  };

  const triggerOverclock = () => {
    const nextTierId = activeTier === 3 ? 0 : (activeTier === 0 ? 0 : activeTier + 1);
    const pool = generateSessionPool(nextTierId);
    setOverclockQ(pool[Math.floor(Math.random() * pool.length)]);
    setStatus('overclock');
  };

  const handleShare = async () => {
    const q = questions[qIndex];
    if (!q) return;
    
    const text = `AORUS Academy: ${q.fact} #AORUS`;
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AORUS Academy',
          text: text,
          url: url
        });
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${text} ${url}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Clipboard failed");
      }
    }
  };

  const meta: Record<number, any> = {
    1: { title: "AORUS ROOKIE", color: "#00d2ff", icon: Microscope, status: "AIR COOLING" },
    2: { title: "AORUS ELITE", color: "#ff6b00", icon: Gauge, status: "WATER COOLING" },
    3: { title: "AORUS XTREME", color: "#ff0000", icon: Gavel, status: "LN2 OVERCLOCK" },
    0: { title: "SINGULARITY", color: "#ffd700", icon: Crown, status: "QUANTUM CORE" }
  };

  const canShowOverclock = ((qIndex + 1) % 5 === 0) && activeTier !== 0;
  
  // Logic for Analysis Text
  const currentQ = status === 'overclock' ? overclockQ : (questions[qIndex] || {text: "", options: []});
  const qCount = questionStats[currentQ?.text] || 0;
  
  // Rotate headers based on index/random
  const analysisHeader = ANALYSIS_HEADERS[qIndex % ANALYSIS_HEADERS.length];

  if (view === 'home') return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-black">
      <MatrixBackground />
      <h1 className="font-orbitron text-[clamp(4rem,15vw,12rem)] font-black italic text-white tracking-tighter leading-none mb-12 drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
        AORUS<br/><span className="text-orange-600">ACADEMY</span>
      </h1>
      <AorusButton onClick={() => setView('entry')} className="text-4xl px-24 py-10">
        ИНИЦИИРАЙ ЯДРОТО <ChevronRight size={48} />
      </AorusButton>
    </div>
  );

  if (view === 'entry') return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-black">
      <MatrixBackground />
      <div className="max-w-md w-full border border-white/10 p-12 bg-black/95 backdrop-blur-3xl rounded-[2rem] shadow-[0_0_150px_rgba(255,107,0,0.05)]">
        <Terminal className="text-orange-600 mx-auto mb-10" size={72} />
        <h2 className="font-orbitron text-2xl font-black text-center mb-12 tracking-[0.3em] uppercase text-white">Идентификация</h2>
        <input 
          autoFocus 
          value={playerName} 
          onChange={e => setPlayerName(e.target.value)} 
          className="w-full bg-transparent border-b-4 border-white/10 p-6 text-white font-orbitron text-center outline-none focus:border-orange-600 mb-16 uppercase text-3xl transition-all" 
          placeholder="КОДОВО ИМЕ..." 
        />
        <AorusButton onClick={() => playerName.trim() && setView('selector')} className="w-full text-2xl py-8">
          ВХОД В СИСТЕМАТА
        </AorusButton>
      </div>
    </div>
  );

  if (view === 'selector') return (
    <div className="min-h-screen p-10 flex flex-col bg-[#020202]">
      <MatrixBackground />
      <header className="flex justify-between items-center mb-20 border-b border-white/5 pb-10 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-6 text-sm font-black uppercase tracking-widest text-white italic">
          <User size={24} className="text-orange-600" /> ОПЕРАТОР: <span className="text-orange-600">{playerName}</span>
        </div>
        <div className="text-[10px] font-black uppercase text-orange-600 animate-pulse flex items-center gap-3 tracking-[0.5em]"><Activity size={18} /> СИСТЕМНА СТАБИЛНОСТ: 100%</div>
      </header>
      <div className="grid lg:grid-cols-4 gap-8 flex-1 max-w-7xl mx-auto w-full">
        {[1, 2, 3, 0].map(id => {
          const m = meta[id]; const unlocked = unlockedTiers.includes(id);
          return (
            <div key={id} onClick={() => unlocked && startTier(id)} className={`group p-12 flex flex-col transition-all border-b-[12px] shadow-2xl relative overflow-hidden backdrop-blur-sm ${unlocked ? 'cursor-pointer hover:bg-white/5 border-white/5 hover:scale-105' : 'opacity-20 grayscale cursor-not-allowed border-transparent'}`} style={{ borderBottomColor: unlocked ? m.color : '#111' }}>
              {!unlocked && <Lock className="absolute top-6 right-6 text-white/20" size={32} />}
              <m.icon size={80} style={{color: unlocked ? m.color : '#333'}} className="mb-10" />
              <h3 className="font-orbitron text-3xl font-black italic text-white mb-6 uppercase tracking-tighter">{m.title}</h3>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em] flex-1">50 Модула</p>
              <div className="mt-12 pt-8 border-t border-white/5"><span className="text-white font-black italic tracking-widest text-sm">{unlocked ? m.status : "LOCKED"}</span></div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const activeMeta = meta[activeTier];

  return (
    <div className="min-h-screen flex flex-col relative bg-black selection:bg-orange-600 selection:text-white overflow-x-hidden">
      <MatrixBackground />
      {status === 'failed' && <div className="fixed inset-0 bg-red-600/10 emergency-reset -z-5 pointer-events-none"></div>}
      <header className="h-28 border-b border-white/5 flex items-center justify-between px-16 bg-black/90 backdrop-blur-2xl z-50">
        <div className="flex items-center gap-8">
           <div className="p-2"><activeMeta.icon style={{color: activeMeta.color}} size={40} /></div>
           <div className="flex flex-col"><span className="font-orbitron italic font-black text-2xl text-white">{activeMeta.title}</span><span className="text-[10px] text-orange-600 font-black tracking-[1em] uppercase">Модул {qIndex+1} / 50</span></div>
        </div>
        <div className="flex gap-6">{Array.from({length: 3}).map((_, i) => (<div key={i}>{i < lives ? <Heart className="text-orange-600 fill-orange-600 shadow-[0_0_25px_#ff6b00]" size={36} /> : <HeartCrack className="text-white/10" size={36} />}</div>))}</div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-12 text-center max-w-7xl mx-auto w-full z-10">
        {status === 'failed' ? (
          <div className="flex flex-col items-center gap-12 fade-in relative z-50">
            <div className="p-16 md:p-24 border-l-[20px] border-red-600 bg-black/95 shadow-[0_0_250px_rgba(255,0,0,0.4)] animate-glitch">
                <Skull size={100} className="text-red-600 mb-8 mx-auto" />
                <h2 className="font-orbitron text-6xl md:text-9xl font-black italic text-red-600 mb-10 uppercase">SYSTEM PURGED</h2>
                <div className="bg-red-600/10 p-8 border border-red-600/20 mb-8 rounded-xl"><p className="text-white font-black text-3xl md:text-5xl italic leading-tight mb-4">"{failMsg}"</p></div>
                {isFatalError && <p className="text-orange-500 font-mono text-xl animate-pulse">Всички нива са заключени. Данните са изтрити.</p>}
            </div>
            <AorusButton variant="danger" onClick={rebootSystem} className="text-4xl px-24 py-10 shadow-[0_0_50px_rgba(185,28,28,0.4)]">
                <RefreshCw className="mr-4" /> {isFatalError ? "FULL SYSTEM RESET" : "RETRY TIER"}
            </AorusButton>
          </div>
        ) : status === 'explaining' ? (
          <div className="bg-black/95 p-6 sm:p-10 lg:p-20 border-l-[10px] sm:border-l-[16px] text-left shadow-2xl w-full border-orange-600 fade-in max-w-5xl backdrop-blur-3xl relative">
             <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-8 sm:mb-16">
                <div className="flex-1">
                    <h2 className="font-orbitron text-3xl sm:text-5xl font-black italic uppercase text-orange-600 mb-3 sm:mb-4">{praiseMsg}</h2>
	                {activeTier === 0 && currentQ?.id === 't0-260-final' ? (
	                  <div className="mb-4 sm:mb-6">
	                    <div className="text-white font-black italic text-xl sm:text-2xl leading-snug">КВАНТОВ ФИНАЛ — ДОСТИГНА КРАЯ.</div>
	                    <div className="text-slate-400 text-sm sm:text-base">Няма верен отговор. Това е умишлено. Получаваш уважение и рестарт (New Game+).</div>
	                  </div>
	                ) : null}
                    <div className="w-full sm:w-48 h-2 bg-white/10 overflow-hidden">
                        <div className="h-full bg-orange-600 transition-all duration-1000 linear" style={{width: `${((ANALYSIS_TIME - timer) / ANALYSIS_TIME) * 100}%`}}></div>
                    </div>
                </div>
                <button 
                  onClick={handleShare}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded border border-white/20 bg-white/5 hover:bg-white/10 text-white transition-all active:scale-95 group"
                >
                  {copied ? <Check size={20} className="text-green-500" /> : <Share2 size={20} className="text-slate-300 group-hover:text-white" />}
                  <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] sm:tracking-widest">{copied ? "COPIED" : "SHARE"}</span>
                </button>
             </div>
             
             <div className="space-y-6 sm:space-y-12 mb-8 sm:mb-16">
                <div className="pl-6 border-l-2 border-slate-700">
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-2 block">{analysisHeader}:</span>
                    {qCount > 1 ? (
                        <div>
                             <p className="text-lg sm:text-2xl text-white font-bold italic leading-snug sm:leading-tight opacity-90">"{currentQ.explanation.split('.')[0]}."</p>
                             <span className="text-[10px] sm:text-xs text-orange-600 mt-2 block uppercase tracking-[0.2em] sm:tracking-widest">* ПОВТОРЕН АНАЛИЗ (ВИДЯНО {qCount} ПЪТИ)</span>
                        </div>
                    ) : (
                        <p className="text-xl sm:text-3xl text-white font-black italic leading-snug sm:leading-tight">{currentQ.explanation}</p>
                    )}
                </div>

                <div className="bg-transparent p-4 sm:p-8 md:p-10 border border-dashed border-white/20 relative overflow-hidden rounded-xl">
                    <span className="text-orange-600/80 font-black text-[10px] sm:text-xs uppercase tracking-[0.25em] sm:tracking-[1.5em] block mb-3 sm:mb-4">Инженерни Данни:</span>
                    <p className="text-slate-400 italic text-base sm:text-xl">"{currentQ.fact}"</p>
                </div>
             </div>
             
             <div className="flex flex-col md:flex-row gap-8 items-center justify-between pt-8 border-t border-white/5">
                <div className="flex-1 w-full flex flex-col md:flex-row items-center gap-6">
                    <button 
                        onClick={() => setReadConfirmed(!readConfirmed)}
                        disabled={timer > 0}
                        className={`flex items-center gap-4 px-6 py-4 rounded-xl border-2 transition-all group ${
                            readConfirmed 
                            ? 'border-green-500 bg-green-900/10 text-green-400' 
                            : 'border-slate-700 hover:border-white text-slate-400 hover:text-white'
                        } ${timer > 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                        {readConfirmed ? <CheckSquare size={24} /> : <Square size={24} />}
                        <span className="font-black uppercase tracking-[0.12em] sm:tracking-widest text-xs sm:text-sm text-center leading-snug whitespace-normal">Потвърждавам, че прочетох</span>
                    </button>

                    <AorusButton 
                        variant="secondary" 
                        onClick={() => timer === 0 && readConfirmed && skipExplanation()} 
                        disabled={timer > 0 || !readConfirmed}
                        className="w-full md:w-auto text-base sm:text-xl py-4 sm:py-6"
                    >
                        {timer > 0 ? "ЗАРЕЖДАНЕ..." : "ПРОДЪЛЖИ"} <ChevronRight />
                    </AorusButton>
                </div>
                
                {canShowOverclock && (
                  <div className="flex flex-col items-center gap-4 fade-in animate-pulse">
                      <span className="text-red-500 font-black text-[10px] uppercase tracking-[0.4em]">
                        {qIndex >= 44 ? "ПРОПУСНИ ДО СЛЕДВАЩ ТИЪР" : "ПРЕСКОЧИ 5 ВЪПРОСА"}
                      </span>
                      <AorusButton disabled={timer > 0 || !readConfirmed} variant="danger" onClick={triggerOverclock} className="text-2xl py-8 min-w-[350px] shadow-[0_0_40px_rgba(220,38,38,0.5)]">
                        <Zap className="mr-3" /> {qIndex >= 44 ? "TIER SKIP OVERCLOCK" : "SPEEDRUN OVERCLOCK"}
                      </AorusButton>
                      <span className="text-slate-500 font-mono text-[9px] uppercase tracking-[0.2em]">*Грешка връща в 1-ви клас</span>
                  </div>
                )}
             </div>
          </div>
        ) : (
          <div className="w-full fade-in">
            {status === 'overclock' && (
              <div className="mb-24 flex flex-col items-center">
                <div className="border-4 border-red-600/50 text-red-500 px-12 py-4 text-lg font-black transform skew-x-[-15deg] mb-10 italic bg-black/50 backdrop-blur tracking-widest">
                  <span className="inline-block transform skew-x-[15deg] flex items-center gap-4"><Trophy size={24} /> {qIndex >= 44 ? "ФИНАЛЕН БОНУС: ПРЕСКОЧИ НИВОТО" : "БОНУС: ПРЕСКОЧИ 5 ВЪПРОСА"}</span>
                </div>
                <h3 className="text-red-600 font-black text-xs tracking-[2em] uppercase italic animate-glitch flex items-center gap-2">
                   <AlertTriangle size={24} /> WARNING: FATAL ERROR RESETS GAME <AlertTriangle size={24} />
                </h3>
              </div>
            )}
            <h2 className="text-5xl md:text-7xl font-orbitron font-black italic text-white mb-28 tracking-tighter leading-none max-w-6xl mx-auto uppercase drop-shadow-[0_0_30px_rgba(255,255,255,0.05)]">{currentQ.text}</h2>
            <div className="grid gap-8 max-w-5xl mx-auto">
              {currentQ.options.map((opt: string, i: number) => (
                <AorusButton key={i} variant="outline" onClick={() => handleAnswer(i)} className="w-full text-left py-10">
                   <span className="flex justify-between items-center w-full px-8"><span className="max-w-[85%] text-2xl md:text-3xl tracking-tight leading-snug">{opt}</span><ChevronRight className="opacity-0 group-hover:opacity-100 transition-all text-orange-500 group-hover:translate-x-8" size={56} /></span>
                </AorusButton>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="w-full bg-black border-t border-white/10 p-6 md:px-12 z-50 flex flex-col md:flex-row items-center justify-between gap-6 text-xs font-bold uppercase tracking-widest">
        <div className="flex items-center gap-3 text-slate-500">
            <Activity size={16} className="text-orange-600 animate-pulse" />
            <span>AORUS CORE v9.6 // ONLINE</span>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <span className="text-slate-400 italic">
                НИВО: <span style={{ color: activeMeta.color }} className="ml-2">{activeMeta.title}</span>
            </span>
            <div className="px-6 py-2 border border-orange-600/40 bg-orange-900/10 text-orange-500 rounded flex items-center gap-2 shadow-[0_0_15px_rgba(255,107,0,0.1)]">
                <span>ИНТЕГРИТЕТ:</span>
                <span className="text-white">{Math.round((qIndex/50)*100)}%</span>
            </div>
        </div>
      </footer>
    </div>
  );
};

createRoot(document.getElementById('root')!).render(<App />);
