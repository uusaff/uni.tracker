import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useMotionValue,
  useSpring,
  useAnimation,
} from 'framer-motion';
import { auth, db, signInWithEmailAndPassword, createUserWithEmailAndPassword, doc, getDoc, setDoc } from './firebase';

/* ==========================================================================
   EXAM TRACKER — Liquid Edition ✨ (VIBRANT AQUA / CYAN THEME)
   Palette Applied:
   #e0fbff (Light Text/Primary)
   #00f0ff (Accent/Active Cyan)
   #77c7d4 (Muted Text/Secondary)
   #205a6b (Borders/Dividers)
   #112031 (Cards/Blocks)
   #080f1a (Main Background)
   ========================================================================== */

const GlobalStyles = memo(() => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600;800&display=swap');

    body { 
      background: #080f1a; 
      margin: 0;
      color: #e0fbff;
      -webkit-font-smoothing: antialiased;
    }

    .font-display { font-family: 'Sora', 'Inter', sans-serif; }
    .font-mono-stat { font-family: 'JetBrains Mono', monospace; }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-thumb { background: rgba(0, 240, 255, 0.2); border-radius: 999px; }
    ::-webkit-scrollbar-track { background: transparent; }
  `}</style>
));

// --- Icons (Memoized) ---
const GithubIcon = memo(() => (
  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current hover:text-[#00f0ff] transition-colors duration-300" aria-hidden="true"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" /></svg>
));

const Icon = memo(({ path, className = 'w-4 h-4', viewBox = '0 0 24 24', strokeWidth = 2 }) => (
  <svg viewBox={viewBox} className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth}><path strokeLinecap="round" strokeLinejoin="round" d={path} /></svg>
));

const IconCheck = (p) => <Icon {...p} path="M5 13l4 4L19 7" />;
const IconX = (p) => <Icon {...p} path="M6 6l12 12M18 6L6 18" />;
const IconCalendar = (p) => <Icon {...p} path="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />;
const IconClock = (p) => <Icon {...p} path="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />;
const IconSparkle = (p) => <Icon {...p} path="M12 2l1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8L12 2z" />;
const IconMail = (p) => <Icon {...p} path="M3 8l9 6 9-6M5 6h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z" />;
const IconLock = (p) => <Icon {...p} path="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 10-8 0v4h8z" />;
const IconChartBar = (p) => <Icon {...p} path="M4 20V10M12 20V4M20 20v-7" />;
const IconLayers = (p) => <Icon {...p} path="M12 3L3 8l9 5 9-5-9-5zM3 12l9 5 9-5" />;
const IconCloud = (p) => <Icon {...p} path="M7 18a4 4 0 01-.6-7.96A5.5 5.5 0 0117 9a4.5 4.5 0 01-1 8.9H7z" />;
const IconBolt = (p) => <Icon {...p} path="M13 2L4.5 13H11l-1 9L19.5 11H13l1-9z" />;
const IconTrophy = (p) => <Icon {...p} path="M8 21h8M12 17v4M7 4h10v4a5 5 0 01-10 0V4zM7 4H4a3 3 0 003 3M17 4h3a3 3 0 01-3 3" />;
const IconBookOpen = (p) => <Icon {...p} path="M12 6.5C10 5 6 4.5 3 5v13c3-.5 7 0 9 1.5 2-1.5 6-2 9-1.5V5c-3-.5-7 0-9 1.5z" />;
const IconTrash = (p) => <Icon {...p} path="M4 7h16M10 11v6M14 11v6M5 7l1 12a2 2 0 002 2h8a2 2 0 002-2l1-12M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" />;
const IconPencil = (p) => <Icon {...p} path="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />;

const TOAST_ICONS = { success: IconCheck, error: IconX, info: IconSparkle };

const LiquidBackground = memo(() => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const reduce = useReducedMotion();

  const x = useSpring(mouseX, { damping: 40, stiffness: 100 });
  const y = useSpring(mouseY, { damping: 40, stiffness: 100 });

  useEffect(() => {
    if (reduce) return;
    const move = (e) => requestAnimationFrame(() => { mouseX.set(e.clientX); mouseY.set(e.clientY); });
    window.addEventListener("mousemove", move, { passive: true });
    return () => window.removeEventListener("mousemove", move);
  }, [reduce, mouseX, mouseY]);

  const particles = useRef(Array.from({ length: 30 }).map((_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    size: Math.random() * 3 + 1, duration: Math.random() * 15 + 15, delay: Math.random() * 10,
  }))).current;

  return (
    <div className="fixed inset-0 overflow-hidden -z-10 bg-[#080f1a] pointer-events-none" style={{ transform: 'translateZ(0)' }}>
      <svg className="absolute w-0 h-0">
        <filter id="goo">
          <feGaussianBlur in="SourceGraphic" stdDeviation="25" result="blur" />
          <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 35 -15" result="goo" />
          <feBlend in="SourceGraphic" in2="goo" />
        </filter>
      </svg>
      <div style={{ filter: "url(#goo)", width: "100%", height: "100%", position: "absolute", transform: 'translateZ(0)' }}>
        {!reduce && (
          <motion.div style={{ x, y, translateX: "-50%", translateY: "-50%", willChange: "transform" }} className="absolute w-[450px] h-[450px] rounded-full opacity-60 mix-blend-screen">
            <div className="w-full h-full rounded-full bg-[#00f0ff] blur-[100px]" />
          </motion.div>
        )}
        <motion.div animate={{ x: [0, 150, -100, 0], y: [0, -150, 120, 0], scale: [1, 1.15, 0.9, 1] }} transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }} className="absolute left-[15%] top-[15%] w-[450px] h-[450px] rounded-full blur-[110px] opacity-30 bg-[#00e5ff]" style={{ willChange: "transform" }} />
        <motion.div animate={{ x: [0, -180, 100, 0], y: [0, 180, -120, 0], scale: [1, 0.9, 1.2, 1] }} transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }} className="absolute right-[10%] bottom-[10%] w-[550px] h-[550px] rounded-full blur-[130px] opacity-30 bg-[#205a6b]" style={{ willChange: "transform" }} />
        <motion.div animate={{ x: [0, 80, -80, 0], y: [0, -100, 70, 0], scale: [1, 1.05, 0.95, 1] }} transition={{ duration: 32, repeat: Infinity, ease: "linear" }} className="absolute left-[50%] top-[50%] w-[600px] h-[600px] rounded-full blur-[140px] opacity-25 bg-[#00b8ff] -translate-x-1/2 -translate-y-1/2" style={{ willChange: "transform" }} />
      </div>
      <div className="absolute inset-0" style={{ transform: 'translateZ(0)' }}>
        {particles.map((p) => (
          <motion.div key={p.id} initial={{ y: `${p.y}vh`, x: `${p.x}vw`, opacity: 0 }} animate={{ y: [`${p.y}vh`, `${p.y - 15}vh`], opacity: [0, 0.6, 0] }} transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "linear" }} className="absolute rounded-full bg-[#e0fbff]" style={{ width: p.size, height: p.size, willChange: "transform, opacity" }} />
        ))}
      </div>
      <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  );
});

const ProgressCircle = memo(({ progress, size = 60, strokeWidth = 5, color = 'stroke-[#00f0ff]' }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;
  const isComplete = progress === 100;

  return (
    <div className={`relative flex items-center justify-center ${isComplete ? 'motion-safe:animate-pulse' : ''}`} style={{ width: size, height: size }}>
      <svg className="transform -rotate-90 overflow-visible" width={size} height={size}>
        <circle className="stroke-[#205a6b]/40" strokeWidth={strokeWidth} fill="transparent" r={radius} cx={size / 2} cy={size / 2} />
        <circle className={`${color} transition-all duration-1000 ease-out`} strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" fill="transparent" r={radius} cx={size / 2} cy={size / 2} style={{ filter: isComplete ? 'drop-shadow(0px 0px 12px rgba(0,240,255,0.8))' : 'drop-shadow(0px 0px 6px rgba(0,240,255,0.4))' }} />
      </svg>
      <span className="absolute text-sm font-bold text-[#e0fbff] drop-shadow-md font-mono-stat">{progress}%</span>
    </div>
  );
});

const UrgencySlider = memo(({ dateString }) => {
  if (!dateString) return null;
  const examDate = new Date(dateString);
  const timeDiff = examDate.getTime() - new Date().getTime();
  const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
  const fillPercentage = Math.max(0, Math.min(100, (daysLeft / 15) * 100));

  let sliderColor = 'bg-[#00f0ff] shadow-[0_0_12px_rgba(0,240,255,0.6)]';
  let trackColor = 'bg-[#080f1a] border-[#205a6b]';
  let textColor = 'text-[#00f0ff]';
  let label = `${daysLeft} Days Left`;

  if (isNaN(daysLeft)) return null;
  else if (daysLeft <= 0) { sliderColor = 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.6)]'; textColor = 'text-rose-400 font-bold animate-pulse'; label = daysLeft === 0 ? 'EXAM TODAY' : 'EXAM PASSED'; } 
  else if (daysLeft <= 3) { sliderColor = 'bg-orange-400 shadow-[0_0_12px_rgba(251,146,60,0.6)]'; textColor = 'text-orange-400 font-bold animate-pulse'; } 
  else if (daysLeft <= 7) { sliderColor = 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]'; textColor = 'text-amber-400'; }

  return (
    <div className={`mt-4 mb-5 p-3 rounded-xl border ${trackColor} bg-[#080f1a]/60 backdrop-blur-sm transition-all duration-300`} style={{ transform: 'translateZ(0)' }}>
      <div className="flex justify-between items-center text-[10px] uppercase tracking-widest mb-2">
        <span className="text-[#77c7d4] font-semibold flex items-center gap-1.5">Timeline</span>
        <span className={`${textColor} font-bold font-mono-stat`}>{label}</span>
      </div>
      <div className="h-1.5 w-full bg-[#080f1a] rounded-full overflow-hidden border border-[#205a6b]">
        <div className={`h-full ${sliderColor} transition-all duration-1000 ease-out rounded-full`} style={{ width: `${daysLeft > 0 ? fillPercentage : 100}%` }} />
      </div>
    </div>
  );
});

const useTilt = (reduce, strength = 8) => {
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 250, damping: 30 });
  const springY = useSpring(rotateY, { stiffness: 250, damping: 30 });

  const handleMove = useCallback((e) => {
    if (reduce) return;
    requestAnimationFrame(() => {
      const rect = e.currentTarget.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      rotateY.set(px * strength);
      rotateX.set(-py * strength);
    });
  }, [reduce, rotateX, rotateY, strength]);

  const reset = useCallback(() => { rotateX.set(0); rotateY.set(0); }, [rotateX, rotateY]);
  return { rotateX: springX, rotateY: springY, handleMove, reset };
};

const AnimatedCounter = memo(({ value, className = '' }) => {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) { setDisplay(value); prevRef.current = value; return; }
    const start = prevRef.current;
    const duration = 800;
    const startTime = performance.now();
    let raf;
    const step = (now) => {
      const progress = Math.min(1, (now - startTime) / duration);
      setDisplay(Math.round(start + (value - start) * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    prevRef.current = value;
    return () => cancelAnimationFrame(raf);
  }, [value, reduce]);

  return <span className={className}>{display}</span>;
});

const ConfettiLayer = memo(({ trigger }) => {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!trigger) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const colors = ['#e0fbff', '#00f0ff', '#77c7d4', '#205a6b'];
    const particles = Array.from({ length: 140 }, () => ({
      x: canvas.width / 2 + (Math.random() - 0.5) * 260, y: canvas.height * 0.22,
      vx: (Math.random() - 0.5) * 13, vy: Math.random() * -11 - 4,
      size: Math.random() * 6 + 4, color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360, spin: (Math.random() - 0.5) * 16, gravity: 0.35 + Math.random() * 0.15,
    }));

    let frame = 0;
    const tick = () => {
      frame++; ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.vy += p.gravity; p.x += p.vx; p.y += p.vy; p.rotation += p.spin;
        ctx.save(); ctx.globalAlpha = Math.max(0, 1 - frame / 110);
        ctx.translate(p.x, p.y); ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color; ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      });
      if (frame < 110) rafRef.current = requestAnimationFrame(tick);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
    cancelAnimationFrame(rafRef.current);
    tick();
    return () => cancelAnimationFrame(rafRef.current);
  }, [trigger]);

  return <canvas ref={canvasRef} className="fixed inset-0 z-[100] pointer-events-none" style={{ transform: 'translateZ(0)' }} />;
});

const ToastStack = memo(({ toasts, onDismiss }) => (
  <div className="fixed top-6 right-6 z-[90] flex flex-col gap-3 w-[calc(100%-3rem)] max-w-sm pointer-events-none">
    <AnimatePresence>
      {toasts.map((t) => {
        const ToastIcon = TOAST_ICONS[t.type] || IconSparkle;
        const tone = t.type === 'error' ? 'border-rose-500/50 text-rose-300' : t.type === 'success' ? 'border-emerald-500/50 text-emerald-300' : 'border-[#00f0ff]/50 text-[#e0fbff]';
        return (
          <motion.div key={t.id} layout initial={{ opacity: 0, x: 60, scale: 0.9 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: 60, scale: 0.9, transition: { duration: 0.2 } }} transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className={`flex items-center gap-3 bg-[#112031]/90 backdrop-blur-xl border ${tone} rounded-2xl px-4 py-3.5 shadow-2xl cursor-pointer pointer-events-auto`}
            style={{ transform: 'translateZ(0)' }} onClick={() => onDismiss(t.id)}>
            <ToastIcon className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium leading-snug">{t.message}</p>
          </motion.div>
        );
      })}
    </AnimatePresence>
  </div>
));

const FloatingInput = memo(({ label, type = 'text', value, onChange, icon: FieldIcon, required, name, autoComplete }) => {
  const [focused, setFocused] = useState(false);
  const active = focused || (value && value.length > 0);
  return (
    <div className={`relative rounded-xl border bg-[#080f1a]/60 backdrop-blur-sm transition-all duration-300 ${focused ? 'border-[#00f0ff] shadow-[0_0_0_3px_rgba(0,240,255,0.15)]' : 'border-[#205a6b]'}`}>
      {FieldIcon && <FieldIcon className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${focused ? 'text-[#00f0ff]' : 'text-[#77c7d4]'}`} />}
      <input type={type} name={name} required={required} autoComplete={autoComplete} value={value} onChange={onChange} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} className={`peer w-full bg-transparent text-[#e0fbff] outline-none pt-7 pb-2 ${FieldIcon ? 'pl-11' : 'pl-4'} pr-4 text-sm`} />
      <label className={`absolute pointer-events-none transition-all duration-200 ${FieldIcon ? 'left-11' : 'left-4'} ${active ? 'top-1.5 text-[10px] uppercase tracking-wider text-[#00f0ff] font-semibold' : 'top-1/2 -translate-y-1/2 text-sm text-[#77c7d4]'}`}>{label}</label>
    </div>
  );
});

const PasswordStrengthMeter = memo(({ validations, password }) => {
  if (!password) return null;
  const score = [validations.length, validations.upper, validations.lower, validations.number, validations.special].filter(Boolean).length;
  const pct = (score / 5) * 100;
  const labels = ['Too Short', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'];
  const barColor = score <= 1 ? 'bg-rose-500' : score === 2 ? 'bg-orange-400' : score === 3 ? 'bg-amber-400' : score === 4 ? 'bg-[#00f0ff]' : 'bg-[#e0fbff]';
  const textColor = score <= 1 ? 'text-rose-400' : score === 2 ? 'text-orange-400' : score === 3 ? 'text-amber-400' : score === 4 ? 'text-[#00f0ff]' : 'text-[#e0fbff]';
  return (
    <div className="mt-2.5">
      <div className="h-1.5 w-full bg-[#080f1a] rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.4, ease: 'easeOut' }} className={`h-full rounded-full ${barColor} shadow-[0_0_8px_currentColor]`} />
      </div>
      <p className={`text-[11px] mt-1.5 font-bold tracking-wide ${textColor}`}>{labels[score]}</p>
    </div>
  );
});

const RippleButton = memo(({ children, className = '', onClick, type = 'button', disabled, ...rest }) => {
  const [ripples, setRipples] = useState([]);
  const handleClick = (e) => {
    if (disabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const id = Date.now() + Math.random();
    setRipples((prev) => [...prev, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 650);
    onClick && onClick(e);
  };
  return (
    <button type={type} disabled={disabled} onClick={handleClick} className={`relative overflow-hidden ${className}`} {...rest}>
      {children}
      {ripples.map((r) => <motion.span key={r.id} initial={{ scale: 0, opacity: 0.5 }} animate={{ scale: 4, opacity: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }} className="absolute rounded-full bg-white/40 pointer-events-none" style={{ left: r.x - 10, top: r.y - 10, width: 20, height: 20 }} />)}
    </button>
  );
});

const AuthSubmitButton = memo(({ isLoading, isSuccess, disabled, children }) => (
  <RippleButton type="submit" disabled={disabled || isLoading} className={`w-full mt-8 font-bold text-[#080f1a] py-4 rounded-xl transition-all duration-300 shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 ${disabled ? 'bg-[#205a6b] cursor-not-allowed opacity-50' : isSuccess ? 'bg-[#e0fbff]' : 'bg-[#00f0ff] hover:bg-[#e0fbff] hover:shadow-[#00f0ff]/30'}`}>
    <AnimatePresence mode="wait" initial={false}>
      {isSuccess ? <motion.span key="success" initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-center gap-2"><IconCheck className="w-5 h-5" /> Success</motion.span>
      : isLoading ? <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-5 h-5 border-2 border-[#080f1a]/30 border-t-[#080f1a] rounded-full animate-spin" />
      : <motion.span key="label" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{children}</motion.span>}
    </AnimatePresence>
  </RippleButton>
));

const AnimatedCheckbox = memo(({ checked, onChange }) => {
  const reduce = useReducedMotion();
  return (
    <label className="relative flex items-center justify-center cursor-pointer mt-0.5 shrink-0">
      <input type="checkbox" checked={checked} onChange={onChange} className="peer sr-only" />
      <motion.div animate={{ scale: checked ? [1, 1.2, 1] : 1 }} transition={{ duration: reduce ? 0 : 0.35 }} className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors duration-200 ${checked ? 'bg-[#00f0ff] border-[#00f0ff]' : 'border-[#205a6b]'}`}>
        <svg viewBox="0 0 24 24" className="w-3 h-3">
          <motion.path d="M5 13l4 4L19 7" stroke="#080f1a" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" fill="none" initial={false} animate={{ pathLength: checked ? 1 : 0, opacity: checked ? 1 : 0 }} transition={{ duration: reduce ? 0 : 0.3, ease: 'easeOut' }} />
        </svg>
      </motion.div>
    </label>
  );
});

const NativeDatePicker = memo(({ value, onChange, placeholder = 'Select date', compact = false }) => {
  const displayValue = value ? new Date(value + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : placeholder;
  return (
    <div className={`relative flex items-center gap-2 bg-[#080f1a]/60 backdrop-blur-sm border border-[#205a6b] rounded-xl outline-none transition-all focus-within:border-[#00f0ff] hover:border-[#77c7d4] ${compact ? 'px-2.5 py-1.5 text-xs' : 'p-3 text-sm w-full'}`}>
      <IconCalendar className={`w-4 h-4 shrink-0 ${value ? 'text-[#00f0ff]' : 'text-[#77c7d4]'}`} />
      <input type="date" value={value || ''} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer" />
      <span className={`pointer-events-none ${value ? 'text-[#e0fbff]' : 'text-[#77c7d4]'}`}>{displayValue}</span>
    </div>
  );
});

// --- UPDATED CLOCK COMPONENT (Stretches to Align) ---
const ClockAndDateWidget = memo(() => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const dayName = time.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
  const dateNum = time.getDate();
  const monthName = time.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();

  return (
    <div className="flex flex-col gap-3 w-full max-w-[240px] ml-auto h-full">
      {/* Time Box (flex-1 to stretch vertically) */}
      <div className="flex-1 bg-[#112031]/70 backdrop-blur-xl border border-[#205a6b] rounded-3xl p-5 flex items-center justify-center shadow-2xl relative overflow-hidden w-full" style={{ transform: 'translateZ(0)' }}>
        <div className="flex flex-col text-[#e0fbff] font-mono-stat font-bold leading-none tracking-[0.2em] z-10 text-center" style={{ fontSize: '3rem' }}>
          <span className="opacity-90">{hours}</span>
          <span className="text-[#77c7d4] drop-shadow-md">{minutes}</span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-[#e0fbff]/5 to-transparent pointer-events-none" />
      </div>

      {/* Horizontal Date Box (fixed height at bottom) */}
      <div className="shrink-0 bg-[#112031]/50 backdrop-blur-md border border-[#205a6b] rounded-2xl py-3 px-4 flex justify-between items-center shadow-lg w-full" style={{ transform: 'translateZ(0)' }}>
        <span className="bg-rose-500 text-white text-[11px] font-black px-2.5 py-1 rounded-md tracking-widest shadow-sm uppercase">{dayName}</span>
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-[#00f0ff] text-xl">{dateNum}</span>
          <span className="text-[#77c7d4] text-sm font-medium uppercase">{monthName}</span>
        </div>
      </div>
    </div>
  );
});

// --- NEW EDITABLE TITLE COMPONENT ---
const EditableDashboardTitle = memo(({ title, onUpdateTitle }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [val, setVal] = useState(title);

  const handleSave = () => {
    if (val.trim() && val !== title) onUpdateTitle(val);
    else setVal(title);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <input 
        autoFocus value={val} onChange={e => setVal(e.target.value)} 
        onBlur={handleSave} onKeyDown={e => e.key === 'Enter' && handleSave()}
        className="font-display text-4xl font-extrabold text-[#e0fbff] tracking-tight mb-2 bg-transparent outline-none border-b-2 border-[#00f0ff] w-full"
      />
    );
  }

  return (
    <h1 className="group font-display text-4xl font-extrabold text-[#e0fbff] tracking-tight mb-2 flex items-center gap-3 cursor-text" onDoubleClick={() => setIsEditing(true)}>
      {title}
      <button onClick={() => setIsEditing(true)} className="opacity-0 group-hover:opacity-100 text-[#77c7d4] hover:text-[#00f0ff] transition-opacity">
        <IconPencil className="w-5 h-5" />
      </button>
    </h1>
  );
});

const FeatureCard = memo(({ icon: FeatureIcon, title, desc, index, reduce }) => (
  <motion.div initial={reduce ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: reduce ? 0 : 0.15 + index * 0.07, ease: 'easeOut' }} whileHover={reduce ? {} : { y: -4 }} className="group relative bg-[#112031]/70 backdrop-blur-md border border-[#205a6b] rounded-2xl p-4 transition-colors duration-300 overflow-hidden shadow-lg" style={{ transform: 'translateZ(0)' }}>
    <div className="absolute -inset-8 bg-[#00f0ff]/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <div className="relative flex items-start gap-3">
      <div className="w-9 h-9 shrink-0 rounded-lg bg-[#080f1a]/80 border border-[#205a6b] flex items-center justify-center text-[#00f0ff] group-hover:rotate-6 group-hover:scale-110 transition-transform duration-300"><FeatureIcon className="w-4 h-4" /></div>
      <div><p className="text-sm font-semibold text-[#e0fbff]">{title}</p><p className="text-xs text-[#77c7d4] mt-0.5 leading-relaxed">{desc}</p></div>
    </div>
  </motion.div>
));

const TiltContainer = memo(({ children, shakeSignal, className }) => {
  const reduce = useReducedMotion();
  const { rotateX, rotateY, handleMove, reset } = useTilt(reduce);
  const controls = useAnimation();
  useEffect(() => { if (shakeSignal && !reduce) controls.start({ x: [0, -10, 10, -7, 7, -3, 3, 0], transition: { duration: 0.45 } }); }, [shakeSignal, reduce, controls]);
  return <motion.div onMouseMove={handleMove} onMouseLeave={reset} style={{ rotateX, rotateY, transformPerspective: 800, transformStyle: "preserve-3d" }} animate={controls} className={className}>{children}</motion.div>;
});

// --- MICRO COMPONENT FOR TOPIC ROW ---
const TopicRow = memo(({ topic, subjectId, onToggle, onUpdateName, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localVal, setLocalVal] = useState(topic.topic);

  const handleSave = () => {
    if (localVal.trim() && localVal !== topic.topic) onUpdateName(subjectId, topic.id, localVal);
    else setLocalVal(topic.topic);
    setIsEditing(false);
  };

  return (
    <div className={`group flex items-center gap-3 p-3 rounded-2xl transition-all duration-200 border ${topic.completed ? 'bg-[#080f1a]/60 border-[#00f0ff]/20' : 'bg-[#080f1a]/30 border-transparent hover:bg-[#080f1a]/70 hover:border-[#205a6b]'}`}>
      <AnimatedCheckbox checked={topic.completed} onChange={() => onToggle(subjectId, topic.id)} />
      
      {isEditing ? (
        <input autoFocus value={localVal} onChange={e => setLocalVal(e.target.value)} onBlur={handleSave} onKeyDown={e => e.key === 'Enter' && handleSave()} className="flex-1 bg-transparent text-[#e0fbff] text-sm font-medium outline-none border-b border-[#00f0ff] pb-0.5" />
      ) : (
        <span onDoubleClick={() => setIsEditing(true)} className={`flex-1 text-sm font-medium leading-relaxed transition-colors cursor-text ${topic.completed ? 'text-[#77c7d4] line-through' : 'text-[#e0fbff]'}`}>
          {topic.topic}
        </span>
      )}

      {!isEditing && (
        <div className="flex items-center gap-1.5 transition-opacity">
          {/* ALWAYS VISIBLE BUTTONS */}
          <button onClick={() => setIsEditing(true)} className="text-[#77c7d4] hover:text-[#00f0ff] p-1 rounded-md hover:bg-[#00f0ff]/10 transition-colors"><IconPencil className="w-3.5 h-3.5" /></button>
          <button onClick={() => onDelete(subjectId, topic.id)} className="text-[#77c7d4] hover:text-rose-400 p-1 rounded-md hover:bg-rose-400/10 transition-colors"><IconTrash className="w-3.5 h-3.5" /></button>
        </div>
      )}
    </div>
  );
});

const SUBJECT_BG_COLORS = ['bg-[#112031]/80', 'bg-[#14263b]/80', 'bg-[#0c1826]/80', 'bg-[#182e45]/80', 'bg-[#0f1d2d]/80'];

const SubjectCard = memo(({ subject, index, onAddTopic, onToggleTopic, onDateChange, onDeleteSubject, onUpdateSubjectName, onUpdateTopicName, onDeleteTopic }) => {
  const reduceMotion = useReducedMotion();
  const [localInput, setLocalInput] = useState(""); 
  const [isEditingName, setIsEditingName] = useState(false);
  const [localName, setLocalName] = useState(subject.name);
  const { rotateX, rotateY, handleMove, reset } = useTilt(reduceMotion, 5);
  
  const progress = subject.syllabus.length === 0 ? 0 : Math.round((subject.syllabus.filter((t) => t.completed).length / subject.syllabus.length) * 100);
  const cardBgColor = SUBJECT_BG_COLORS[index % SUBJECT_BG_COLORS.length];

  const handleAdd = () => { if(localInput.trim()) { onAddTopic(subject.id, localInput); setLocalInput(""); } };
  const handleNameSave = () => {
    if (localName.trim() && localName !== subject.name) onUpdateSubjectName(subject.id, localName);
    else setLocalName(subject.name);
    setIsEditingName(false);
  };

  return (
    <motion.div onMouseMove={handleMove} onMouseLeave={reset} style={{ rotateX, rotateY, transformPerspective: 1000, transformStyle: "preserve-3d" }} initial={reduceMotion ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} whileHover={reduceMotion ? {} : { y: -6 }} transition={{ duration: 0.45, delay: reduceMotion ? 0 : index * 0.06, ease: 'easeOut' }} className={`group ${cardBgColor} backdrop-blur-xl border border-[#205a6b] rounded-3xl p-7 shadow-2xl hover:border-[#00f0ff] transition-colors duration-300 flex flex-col h-full relative overflow-hidden`}>
      <div className="absolute inset-0 bg-gradient-to-br from-[#00f0ff]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      {progress === 100 && <div className="absolute top-4 right-4 z-10 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1"><IconTrophy className="w-3 h-3" /> Mastered</div>}
      
      {/* ALWAYS VISIBLE DELETE SUBJECT BUTTON */}
      <button onClick={() => onDeleteSubject(subject.id)} className={`absolute top-4 right-4 z-20 text-[#77c7d4] hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-400/10 transition-all ${progress === 100 ? 'mt-8' : ''}`} title="Delete Subject"><IconTrash className="w-4 h-4" /></button>

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="flex-1 pr-6">
          <div className="flex items-center gap-2 mb-3">
            {isEditingName ? (
              <input autoFocus value={localName} onChange={e => setLocalName(e.target.value)} onBlur={handleNameSave} onKeyDown={e => e.key === 'Enter' && handleNameSave()} className="text-2xl font-bold text-[#e0fbff] tracking-tight font-display bg-transparent outline-none border-b-2 border-[#00f0ff] w-full" />
            ) : (
              <h2 onDoubleClick={() => setIsEditingName(true)} className="text-2xl font-bold text-[#e0fbff] tracking-tight truncate font-display flex items-center gap-2 cursor-text">
                {subject.name}
                {/* ALWAYS VISIBLE EDIT PENCIL */}
                <button onClick={() => setIsEditingName(true)} className="text-[#77c7d4] hover:text-[#00f0ff] transition-opacity"><IconPencil className="w-4 h-4" /></button>
              </h2>
            )}
          </div>
          <div className="text-sm text-[#77c7d4] space-y-2 font-medium">
            <NativeDatePicker compact value={subject.date} onChange={(d) => onDateChange(subject.id, d)} />
            {subject.time && <p className="flex items-center gap-2"><IconClock className="w-4 h-4 text-[#00f0ff]" /> {subject.time}</p>}
          </div>
        </div>
        <div className="mt-4 shrink-0"><ProgressCircle progress={progress} size={64} strokeWidth={5} /></div>
      </div>

      <UrgencySlider dateString={subject.date} />

      <div className="space-y-2.5 mt-2 flex-1 overflow-y-auto pr-2 max-h-[280px] relative z-10">
        {subject.syllabus.map((topic) => (
          <TopicRow key={topic.id} topic={topic} subjectId={subject.id} onToggle={onToggleTopic} onUpdateName={onUpdateTopicName} onDelete={onDeleteTopic} />
        ))}
        {subject.syllabus.length === 0 && <p className="text-xs text-[#77c7d4] text-center py-4 italic">No topics added yet.</p>}
      </div>

      <div className="mt-5 pt-5 border-t border-[#205a6b] flex gap-2 relative z-10">
        <input type="text" placeholder="Add syllabus topic..." value={localInput} onChange={(e) => setLocalInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAdd()} className="flex-1 bg-[#080f1a]/60 backdrop-blur-sm border border-[#205a6b] rounded-xl p-3 text-sm text-[#e0fbff] focus:border-[#00f0ff] outline-none transition-all placeholder:text-[#77c7d4]" />
        <RippleButton onClick={handleAdd} className="bg-[#205a6b] hover:bg-[#00f0ff] text-[#e0fbff] hover:text-[#080f1a] px-4 py-2 rounded-xl text-lg font-black transition-all duration-300 active:scale-95">+</RippleButton>
      </div>
    </motion.div>
  );
});

const TopNav = memo(() => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 flex justify-between items-center transition-all duration-300 ${scrolled ? 'bg-[#080f1a]/80 backdrop-blur-2xl border-b border-[#205a6b] px-6 py-3' : 'bg-[#080f1a]/40 backdrop-blur-xl border-b border-[#205a6b]/50 px-6 py-4'}`} style={{ transform: 'translateZ(0)' }}>
      <div className="flex items-center gap-3">
        <motion.div whileHover={{ rotate: 8, scale: 1.05 }} className={`bg-[#00f0ff] rounded-lg flex items-center justify-center shadow-lg transition-all duration-300 ${scrolled ? 'w-7 h-7' : 'w-8 h-8'}`}>
          <span className="text-[#080f1a] font-bold text-sm">ET</span>
        </motion.div>
        <span className="text-lg font-bold text-[#e0fbff] tracking-wide font-display">Exam Tracker</span>
      </div>
      <div className="flex items-center gap-4">
        <a href="https://github.com/uusaff" target="_blank" rel="noopener noreferrer" className="text-[#77c7d4] hover:text-[#e0fbff] transition-colors"><GithubIcon /></a>
      </div>
    </nav>
  );
});

const LoginView = memo(({ onLoginSuccess, pushToast }) => {
  const [authForm, setAuthForm] = useState({ email: '', password: '' });
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [shakeTrigger, setShakeTrigger] = useState(0);
  const reduceMotion = useReducedMotion();

  const pwd = authForm.password;
  const validations = { length: pwd.length >= 8, upper: /[A-Z]/.test(pwd), lower: /[a-z]/.test(pwd), number: /[0-9]/.test(pwd), special: /[^A-Za-z0-9\s]/.test(pwd), noSpace: pwd.length > 0 && !/\s/.test(pwd) };
  const isPasswordValid = Object.values(validations).every(Boolean);

  const handleAuth = async (e) => {
    e.preventDefault(); setAuthError('');
    if (isSignUp && !isPasswordValid) { setAuthError('Please meet all password requirements.'); setShakeTrigger((n) => n + 1); return; }
    setAuthLoading(true);
    try {
      let userCredential = isSignUp ? await createUserWithEmailAndPassword(auth, authForm.email, authForm.password) : await signInWithEmailAndPassword(auth, authForm.email, authForm.password);
      setAuthSuccess(true); pushToast('success', isSignUp ? 'Account created — welcome!' : 'Login successful, welcome back.');
      setTimeout(() => onLoginSuccess(userCredential.user), 650);
    } catch (error) {
      const message = error.message.replace('Firebase: ', ''); setAuthError(message); pushToast('error', message); setShakeTrigger((n) => n + 1);
    } finally { setAuthLoading(false); }
  };

  return (
    <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.02 }} transition={{ duration: 0.5 }} className="min-h-screen relative font-sans text-[#e0fbff]">
      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row items-center justify-center gap-12 px-6 py-14 lg:px-16 max-w-7xl mx-auto">
        <div className="flex-1 max-w-xl w-full">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="inline-flex items-center gap-2 bg-[#112031]/70 backdrop-blur-md border border-[#205a6b] rounded-full px-4 py-1.5 mb-6 text-xs font-semibold text-[#00f0ff] tracking-wide"><IconSparkle className="w-3.5 h-3.5" /> Built for finals season</motion.div>
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.05 }} className="font-display text-4xl md:text-5xl font-extrabold text-[#e0fbff] leading-tight tracking-tight mb-4">Track Every Exam.<br /><span className="text-[#00f0ff]">Master Every Subject.</span></motion.h1>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="text-[#77c7d4] text-base mb-8 leading-relaxed max-w-md">One calm, focused dashboard for your syllabus, your deadlines, and your progress — synced everywhere, the moment it changes.</motion.p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{[{ icon: IconChartBar, title: 'Progress Tracking', desc: 'Watch mastery climb topic by topic.' }, { icon: IconLayers, title: 'Subject Management', desc: 'Every course, its own syllabus & timeline.' }, { icon: IconCloud, title: 'Auto Save', desc: 'Every change syncs the moment you make it.' }, { icon: IconClock, title: 'Deadline Countdown', desc: 'Live urgency indicators for every exam.' }, { icon: IconBolt, title: 'Smart Dashboard', desc: 'Your entire semester in one glass panel.' }, { icon: IconTrophy, title: 'Completion Analytics', desc: 'Real numbers on how prepared you are.' }].map((f, i) => <FeatureCard key={f.title} {...f} index={i} reduce={reduceMotion} />)}</div>
        </div>
        <div className="w-full max-w-md shrink-0">
          <TiltContainer shakeSignal={shakeTrigger} className="relative bg-[#112031]/80 backdrop-blur-2xl border border-[#205a6b] p-8 sm:p-10 rounded-3xl shadow-[0_8px_40px_rgba(8,15,26,0.55)]">
            <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-[#00f0ff]/20 via-transparent to-[#205a6b]/20 -z-10 blur-xl pointer-events-none" />
            <div className="flex justify-center mb-7"><motion.div animate={{ boxShadow: ['0 0 20px rgba(0,240,255,0.25)', '0 0 34px rgba(119,199,212,0.35)', '0 0 20px rgba(0,240,255,0.25)'] }} transition={{ duration: 3, repeat: reduceMotion ? 0 : Infinity }} className="w-16 h-16 bg-[#080f1a] border border-[#205a6b] rounded-2xl flex items-center justify-center"><svg className="w-8 h-8 text-[#00f0ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></motion.div></div>
            <h2 className="font-display text-2xl font-bold text-[#e0fbff] mb-1.5 text-center tracking-tight">Exam Tracker</h2>
            <p className="text-center text-[#77c7d4] mb-7 text-sm">{isSignUp ? 'Create your workspace' : 'Sign in to continue'}</p>
            <AnimatePresence>{authError && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-5 overflow-hidden"><div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm text-center">{authError}</div></motion.div>}</AnimatePresence>
            <form onSubmit={handleAuth} className="space-y-4">
              <FloatingInput label="Email Address" type="email" name="email" autoComplete="email" required value={authForm.email} onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} icon={IconMail} />
              <div><FloatingInput label="Password" type="password" name="password" autoComplete="current-password" required value={authForm.password} onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })} icon={IconLock} />{isSignUp && <PasswordStrengthMeter validations={validations} password={pwd} />}</div>
              <AuthSubmitButton isLoading={authLoading} isSuccess={authSuccess} disabled={isSignUp && !isPasswordValid}>{isSignUp ? 'Create Account' : 'Access Dashboard'}</AuthSubmitButton>
            </form>
            <p className="text-center text-[#77c7d4] text-sm mt-6 cursor-pointer hover:text-[#e0fbff] transition-colors" onClick={() => { setIsSignUp(!isSignUp); setAuthError(''); setAuthSuccess(false); setAuthForm({ ...authForm, password: '' }); }}>{isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}</p>
          </TiltContainer>
        </div>
      </div>
    </motion.div>
  );
});

export default function App() {
  const [user, setUser] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [dashboardTitle, setDashboardTitle] = useState('Finals Overview'); // NEW SYNCED STATE
  const [autoSaveStatus, setAutoSaveStatus] = useState('SYNCED');
  const hasFetchedData = useRef(false);
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [newSubject, setNewSubject] = useState({ name: '', date: '', time: '', venue: '' });
  const [toasts, setToasts] = useState([]);
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const prevSubjectProgress = useRef({});
  const milestoneRef = useRef(0);
  const prevAutoSaveStatus = useRef(autoSaveStatus);
  const reduceMotion = useReducedMotion();

  const pushToast = useCallback((type, message) => { const id = Date.now() + Math.random(); setToasts((prev) => [...prev, { id, type, message }]); setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3800); }, []);
  const dismissToast = useCallback((id) => setToasts((prev) => prev.filter((t) => t.id !== id)), []);

  const handleLoginSuccess = useCallback(async (loggedInUser) => {
    const docRef = doc(db, 'users', loggedInUser.uid); const docSnap = await getDoc(docRef);
    setUser({ uid: loggedInUser.uid, email: loggedInUser.email });
    if (docSnap.exists()) {
      setSubjects(docSnap.data().subjects || []);
      setDashboardTitle(docSnap.data().dashboardTitle || 'Finals Overview');
    } else {
      setSubjects([]);
      setDashboardTitle('Finals Overview');
    }
    hasFetchedData.current = true;
  }, []);

  useEffect(() => {
    if (!user || !hasFetchedData.current) return;
    setAutoSaveStatus('SAVING...');
    const timer = setTimeout(async () => {
      try { await setDoc(doc(db, 'users', user.uid), { subjects, dashboardTitle }); setAutoSaveStatus('SYNCED'); } 
      catch (error) { setAutoSaveStatus('ERROR'); console.error('Error saving:', error); }
    }, 1500);
    return () => clearTimeout(timer);
  }, [subjects, dashboardTitle, user]);

  useEffect(() => {
    if (autoSaveStatus === 'ERROR' && prevAutoSaveStatus.current !== 'ERROR') pushToast('error', 'Sync failed. Your changes are safe locally — check your connection.');
    prevAutoSaveStatus.current = autoSaveStatus;
  }, [autoSaveStatus, pushToast]);

  const toggleTopic = useCallback((subjectId, topicId) => {
    let completing = false;
    setSubjects((prev) => prev.map((sub) => {
      if (sub.id !== subjectId) return sub;
      return {
        ...sub, syllabus: sub.syllabus.map((topic) => {
          if (topic.id !== topicId) return topic;
          completing = !topic.completed; return { ...topic, completed: !topic.completed };
        }),
      };
    }));
    if (completing) pushToast('success', 'Topic completed.');
  }, [pushToast]);

  const updateSubjectName = useCallback((subjectId, newName) => {
    setSubjects(prev => prev.map(s => s.id === subjectId ? { ...s, name: newName } : s));
    pushToast('info', 'Subject updated.');
  }, [pushToast]);

  const updateTopicName = useCallback((subjectId, topicId, newName) => {
    setSubjects(prev => prev.map(s => s.id === subjectId ? {
      ...s, syllabus: s.syllabus.map(t => t.id === topicId ? { ...t, topic: newName } : t)
    } : s));
  }, []);

  const deleteTopic = useCallback((subjectId, topicId) => {
    setSubjects(prev => prev.map(s => s.id === subjectId ? {
      ...s, syllabus: s.syllabus.filter(t => t.id !== topicId)
    } : s));
    pushToast('info', 'Topic removed.');
  }, [pushToast]);

  const updateSubjectDate = useCallback((subjectId, newDate) => setSubjects((prev) => prev.map((sub) => (sub.id === subjectId ? { ...sub, date: newDate } : sub))), []);
  const handleAddTopic = useCallback((subjectId, topicText) => setSubjects((prev) => prev.map((sub) => (sub.id === subjectId ? { ...sub, syllabus: [...sub.syllabus, { id: Date.now().toString(), topic: topicText, completed: false }] } : sub))), []);
  const handleDeleteSubject = useCallback((subjectId) => { if (window.confirm("Are you sure you want to delete this subject?")) { setSubjects(prev => prev.filter(sub => sub.id !== subjectId)); pushToast('info', 'Subject deleted.'); } }, [pushToast]);
  
  const handleAddSubject = (e) => {
    e.preventDefault(); const newSub = { ...newSubject, id: Date.now().toString(), syllabus: [] };
    setSubjects([...subjects, newSub]); pushToast('success', `${newSub.name} added to your tracker.`);
    setNewSubject({ name: '', date: '', time: '', venue: '' }); setShowAddSubject(false);
  };

  const totalTopics = subjects.reduce((acc, curr) => acc + curr.syllabus.length, 0);
  const totalCompleted = subjects.reduce((acc, curr) => acc + curr.syllabus.filter((t) => t.completed).length, 0);
  const overallProgress = totalTopics === 0 ? 0 : Math.round((totalCompleted / totalTopics) * 100);

  useEffect(() => {
    subjects.forEach((sub) => {
      const total = sub.syllabus.length; const done = sub.syllabus.filter((t) => t.completed).length;
      const pct = total === 0 ? 0 : Math.round((done / total) * 100); const prevPct = prevSubjectProgress.current[sub.id];
      if (prevPct !== undefined && prevPct < 100 && pct === 100) { if (!reduceMotion) setConfettiTrigger((n) => n + 1); pushToast('success', `${sub.name} fully mastered! 🎉`); }
      prevSubjectProgress.current[sub.id] = pct;
    });
    if (totalTopics > 0) {
      const crossed = [25, 50, 75, 100].filter((m) => overallProgress >= m && milestoneRef.current < m);
      if (crossed.length > 0) { const top = Math.max(...crossed); if (!reduceMotion) setConfettiTrigger((n) => n + 1); milestoneRef.current = top; pushToast('success', `Overall progress hit ${top}%!`); }
    }
  }, [subjects, reduceMotion, overallProgress, totalTopics, pushToast]);

  return (
    <>
      <GlobalStyles />
      <LiquidBackground />
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
      <ConfettiLayer trigger={confettiTrigger} />

      <AnimatePresence mode="wait">
        {!user ? (
          <LoginView key="login" onLoginSuccess={handleLoginSuccess} pushToast={pushToast} />
        ) : (
          <motion.div key="dashboard" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="min-h-screen relative font-sans text-[#e0fbff] pb-20">
            <TopNav />
            <div className="pt-28 px-6 md:px-10 max-w-7xl mx-auto animate-[fadeIn_0.5s_ease-out] relative z-10">
              
              {/* ALIGNED TOP ROW WIDGETS */}
              <div className="mb-10 flex flex-col md:flex-row items-stretch gap-6 w-full">
                
                {/* Left Side: Overview Box */}
                <div className="flex-1 flex flex-col items-start justify-between bg-[#112031]/70 backdrop-blur-xl border border-[#205a6b] rounded-3xl p-8 shadow-2xl relative overflow-hidden group hover:border-[#00f0ff] transition-all duration-500" style={{ transform: 'translateZ(0)' }}>
                  <div className="absolute top-0 left-0 w-64 h-64 bg-[#00f0ff]/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-[#00f0ff]/10 transition-all duration-700"></div>
                  
                  <div className="z-10 w-full flex flex-col md:flex-row md:items-center justify-between gap-6 h-full">
                    <div className="flex flex-col justify-center">
                      <EditableDashboardTitle title={dashboardTitle} onUpdateTitle={setDashboardTitle} />
                      <p className="text-[#77c7d4] font-medium">Keep your focus sharp. 🚀</p>
                      <RippleButton onClick={() => setShowAddSubject(!showAddSubject)} className="mt-6 bg-[#00f0ff] text-[#080f1a] hover:bg-[#e0fbff] text-sm font-semibold py-2.5 px-6 rounded-xl transition-all duration-300 shadow-md active:scale-95 flex items-center gap-2 max-w-fit">
                        {showAddSubject ? 'Close Panel' : '+ Add New Subject'}
                      </RippleButton>
                    </div>

                    <div className="flex items-center gap-6 bg-[#080f1a]/60 backdrop-blur-md p-6 rounded-2xl border border-[#205a6b] z-10 w-full md:w-auto justify-between shadow-inner">
                      <div className="text-right">
                        <p className="text-[10px] text-[#00f0ff] uppercase tracking-widest font-bold mb-1">Total Mastery</p>
                        <p className="font-mono-stat text-4xl font-black text-[#e0fbff]"><AnimatedCounter value={totalCompleted} /> <span className="text-2xl text-[#205a6b] font-bold">/ <AnimatedCounter value={totalTopics} /></span></p>
                      </div>
                      <ProgressCircle progress={overallProgress} size={100} strokeWidth={8} color="stroke-[#00f0ff]" />
                    </div>
                  </div>
                </div>

                {/* Right Side: Clock Component */}
                <ClockAndDateWidget />
              </div>

              <AnimatePresence>
                {showAddSubject && (
                  <motion.form onSubmit={handleAddSubject} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.35 }} className="mb-10 bg-[#112031]/80 backdrop-blur-xl border border-[#00f0ff] p-8 rounded-3xl grid grid-cols-1 md:grid-cols-5 gap-5 shadow-2xl overflow-hidden" style={{ transform: 'translateZ(0)' }}>
                    <input type="text" placeholder="Subject Name" required value={newSubject.name} onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })} className="bg-[#080f1a]/60 backdrop-blur-sm text-[#e0fbff] border border-[#205a6b] rounded-xl p-3.5 focus:border-[#00f0ff] outline-none transition-all placeholder:text-[#77c7d4] md:col-span-2" />
                    <NativeDatePicker value={newSubject.date} onChange={(d) => setNewSubject({ ...newSubject, date: d })} placeholder="Exam date" />
                    <input type="text" placeholder="Time (e.g. 10 AM)" value={newSubject.time} onChange={(e) => setNewSubject({ ...newSubject, time: e.target.value })} className="bg-[#080f1a]/60 backdrop-blur-sm text-[#e0fbff] border border-[#205a6b] rounded-xl p-3.5 focus:border-[#00f0ff] outline-none transition-all placeholder:text-[#77c7d4]" />
                    <RippleButton type="submit" className="bg-[#00f0ff] text-[#080f1a] hover:bg-[#e0fbff] font-bold py-3.5 rounded-xl transition-all duration-300 shadow-lg active:scale-95">Save Subject</RippleButton>
                  </motion.form>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {subjects.length === 0 && !showAddSubject && <div className="col-span-full text-center py-20 bg-[#112031]/70 backdrop-blur-xl rounded-3xl border border-dashed border-[#205a6b]"><motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} className="mx-auto mb-6 w-16 h-16 rounded-2xl bg-[#080f1a] border border-[#205a6b] flex items-center justify-center text-[#00f0ff]"><IconBookOpen className="w-8 h-8" /></motion.div><p className="text-[#e0fbff] font-display font-semibold text-lg mb-1">No subjects yet</p><p className="text-[#77c7d4] text-sm mb-6">Add your first subject to start tracking mastery.</p><RippleButton onClick={() => setShowAddSubject(true)} className="bg-[#00f0ff] text-[#080f1a] hover:bg-[#e0fbff] font-bold py-2.5 px-6 rounded-xl">+ Add Your First Subject</RippleButton></div>}
                
                {subjects.map((subject, idx) => (
                  <SubjectCard
                    key={subject.id} subject={subject} index={idx}
                    onAddTopic={handleAddTopic} onToggleTopic={toggleTopic}
                    onDateChange={updateSubjectDate} onDeleteSubject={handleDeleteSubject}
                    onUpdateSubjectName={updateSubjectName} onUpdateTopicName={updateTopicName} onDeleteTopic={deleteTopic}
                  />
                ))}
              </div>
            </div>

            <div className="fixed bottom-6 right-6 bg-[#080f1a]/80 backdrop-blur-xl px-5 py-3 rounded-full border border-[#205a6b] text-xs font-bold text-[#77c7d4] flex items-center gap-3 shadow-2xl z-50 pointer-events-none" style={{ transform: 'translateZ(0)' }}>
              <div className={`w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor] ${autoSaveStatus === 'SYNCED' ? 'bg-[#00f0ff] text-[#00f0ff]' : autoSaveStatus === 'ERROR' ? 'bg-rose-500 text-rose-500' : 'bg-[#e0fbff] text-[#e0fbff] animate-pulse'}`}></div>
              SERVER: {autoSaveStatus}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}