import { useState, useEffect, useRef } from 'react';
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
   EXAM TRACKER — Premium SaaS redesign (Yellow & Black Glassy Theme)
   ========================================================================== */

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap');

    .font-display { font-family: 'Sora', 'Inter', sans-serif; }
    .font-mono-stat { font-family: 'JetBrains Mono', monospace; }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes auroraMove {
      0%, 100% { transform: translate(0, 0) scale(1); }
      33% { transform: translate(4%, -6%) scale(1.08); }
      66% { transform: translate(-5%, 4%) scale(0.95); }
    }

    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-thumb { background: rgba(250,204,21,0.2); border-radius: 999px; }
    ::-webkit-scrollbar-track { background: transparent; }
  `}</style>
);

// --- Icons ---
const GithubIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current hover:text-yellow-400 transition-colors duration-300" aria-hidden="true">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const Icon = ({ path, className = 'w-4 h-4', viewBox = '0 0 24 24', strokeWidth = 2 }) => (
  <svg viewBox={viewBox} className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth}>
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);

const IconCheck = (p) => <Icon {...p} path="M5 13l4 4L19 7" />;
const IconX = (p) => <Icon {...p} path="M6 6l12 12M18 6L6 18" />;
const IconChevronLeft = (p) => <Icon {...p} path="M15 18l-6-6 6-6" />;
const IconChevronRight = (p) => <Icon {...p} path="M9 6l6 6-6 6" />;
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
const IconShield = (p) => <Icon {...p} path="M12 3l7 3v6c0 4.5-3 8-7 9-4-1-7-4.5-7-9V6l7-3z" />;
const IconBell = (p) => <Icon {...p} path="M15 17h5l-1.4-2.1A2 2 0 0118 13.6V11a6 6 0 10-12 0v2.6c0 .3-.1.6-.3.9L4.4 17H9m6 0a3 3 0 11-6 0m6 0H9" />;
const IconBookOpen = (p) => <Icon {...p} path="M12 6.5C10 5 6 4.5 3 5v13c3-.5 7 0 9 1.5 2-1.5 6-2 9-1.5V5c-3-.5-7 0-9 1.5z" />;
const IconTrash = (p) => <Icon {...p} path="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" />;
const IconSearch = (p) => <Icon {...p} path="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />;
const IconBroom = (p) => <Icon {...p} path="M12 2L12 10M12 10C12 10 8 10 6 13M12 10C12 10 16 10 18 13M6 13L8 22H16L18 13M6 13C6 13 9 15 12 15C15 15 18 13 18 13" />;

const TOAST_ICONS = { success: IconCheck, error: IconX, info: IconSparkle };

// --- Interactive Neuron Background (Yellow/Gold Version) ---
const NeuronBackground = ({ aurora = false, reduce = false }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];
    const numParticles = reduce ? 32 : 90;
    let mouse = { x: null, y: null, radius: 180 };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const handleMouseMove = (e) => { mouse.x = e.x; mouse.y = e.y; };
    const handleMouseOut = () => { mouse.x = null; mouse.y = null; };
    if (!reduce) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseout', handleMouseOut);
    }

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * (reduce ? 0.5 : 1.5);
        this.vy = (Math.random() - 0.5) * (reduce ? 0.5 : 1.5);
        this.radius = Math.random() * 2 + 1;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
        if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;
        if (mouse.x != null && mouse.y != null) {
          let dx = mouse.x - this.x;
          let dy = mouse.y - this.y;
          let distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < mouse.radius) {
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            const force = (mouse.radius - distance) / mouse.radius;
            this.x -= forceDirectionX * force * 3;
            this.y -= forceDirectionY * force * 3;
          }
        }
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(250, 204, 21, 0.6)'; // yellow-400
        ctx.fill();
      }
    }

    const init = () => {
      particles = [];
      for (let i = 0; i < numParticles; i++) particles.push(new Particle());
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
        for (let j = i; j < particles.length; j++) {
          let dx = particles[i].x - particles[j].x;
          let dy = particles[i].y - particles[j].y;
          let distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(250, 204, 21, ${1 - distance / 120})`;
            ctx.lineWidth = 1;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
        if (mouse.x != null && mouse.y != null) {
          let dx = particles[i].x - mouse.x;
          let dy = particles[i].y - mouse.y;
          let distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 160) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(253, 224, 71, ${1 - distance / 160})`;
            ctx.lineWidth = 1.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    init();
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseout', handleMouseOut);
    };
  }, [reduce]);

  return (
    <div className="fixed inset-0 z-[-1] bg-black overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.04] z-0"></div>
      {aurora && (
        <div className="absolute inset-0 z-[1] pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-yellow-500/10 rounded-full blur-[120px] motion-safe:animate-[auroraMove_22s_ease-in-out_infinite]" />
          <div className="absolute bottom-[-15%] right-[-10%] w-[55%] h-[55%] bg-amber-600/10 rounded-full blur-[130px] motion-safe:animate-[auroraMove_26s_ease-in-out_infinite_reverse]" />
          <div className="absolute top-[30%] right-[15%] w-[35%] h-[35%] bg-orange-500/5 rounded-full blur-[110px] motion-safe:animate-[auroraMove_30s_ease-in-out_infinite]" />
        </div>
      )}
      <canvas ref={canvasRef} className="absolute inset-0 z-10" />
    </div>
  );
};

// --- Progress Circle ---
const ProgressCircle = ({ progress, size = 60, strokeWidth = 5, color = 'stroke-yellow-400' }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;
  const isComplete = progress === 100;

  return (
    <div className={`relative flex items-center justify-center ${isComplete ? 'motion-safe:animate-pulse' : ''}`} style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle className="stroke-white/5" strokeWidth={strokeWidth} fill="transparent" r={radius} cx={size / 2} cy={size / 2} />
        <circle
          className={`${color} transition-all duration-1000 ease-out`}
          strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" fill="transparent" r={radius} cx={size / 2} cy={size / 2}
          style={{ filter: isComplete ? 'drop-shadow(0px 0px 12px rgba(250,204,21,0.8))' : 'drop-shadow(0px 0px 8px rgba(250, 204, 21, 0.4))' }}
        />
      </svg>
      <span className="absolute text-sm font-bold text-white drop-shadow-md font-mono-stat">{progress}%</span>
    </div>
  );
};

// --- Urgency Slider ---
const UrgencySlider = ({ dateString }) => {
  if (!dateString) return null;
  const examDate = new Date(dateString);
  const today = new Date();
  const timeDiff = examDate.getTime() - today.getTime();
  const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

  const maxDays = 15;
  const fillPercentage = Math.max(0, Math.min(100, (daysLeft / maxDays) * 100));

  let sliderColor = 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.6)]';
  let trackColor = 'bg-emerald-950/30 border-emerald-500/20';
  let textColor = 'text-emerald-400';
  let label = `${daysLeft} Days Left`;

  if (isNaN(daysLeft)) {
    return null;
  } else if (daysLeft <= 0) {
    sliderColor = 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)]'; trackColor = 'bg-red-950/30 border-red-500/20'; textColor = 'text-red-400 font-bold animate-pulse'; label = daysLeft === 0 ? 'EXAM TODAY' : 'EXAM PASSED';
  } else if (daysLeft <= 3) {
    sliderColor = 'bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.8)]'; trackColor = 'bg-orange-950/30 border-orange-500/20'; textColor = 'text-orange-400 font-bold animate-pulse';
  } else if (daysLeft <= 7) {
    sliderColor = 'bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.6)]'; trackColor = 'bg-yellow-950/30 border-yellow-500/20'; textColor = 'text-yellow-400';
  }

  return (
    <div className={`mt-4 mb-5 p-3 rounded-xl border ${trackColor} bg-white/5 backdrop-blur-sm transition-all duration-300`}>
      <div className="flex justify-between items-center text-[10px] uppercase tracking-widest mb-2">
        <span className="text-slate-400 font-semibold flex items-center gap-1.5">Timeline</span>
        <span className={`${textColor} font-bold font-mono-stat`}>{label}</span>
      </div>
      <div className="h-1.5 w-full bg-black/50 rounded-full overflow-hidden border border-white/5 shadow-inner">
        <div className={`h-full ${sliderColor} transition-all duration-1000 ease-out rounded-full`} style={{ width: `${daysLeft > 0 ? fillPercentage : 100}%` }} />
      </div>
    </div>
  );
};

// --- Tilt Hook ---
const useTilt = (reduce, strength = 8) => {
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 200, damping: 20 });
  const springY = useSpring(rotateY, { stiffness: 200, damping: 20 });

  const handleMove = (e) => {
    if (reduce) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    rotateY.set(px * strength);
    rotateX.set(-py * strength);
  };
  const reset = () => { rotateX.set(0); rotateY.set(0); };

  return { rotateX: springX, rotateY: springY, handleMove, reset };
};

// --- Animated Counter ---
const AnimatedCounter = ({ value, className = '' }) => {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) { setDisplay(value); prevRef.current = value; return; }
    const start = prevRef.current;
    const end = value;
    const duration = 800;
    const startTime = performance.now();
    let raf;

    const step = (now) => {
      const progress = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + (end - start) * eased));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    prevRef.current = value;
    return () => cancelAnimationFrame(raf);
  }, [value, reduce]);

  return <span className={className}>{display}</span>;
};

// --- Confetti (Yellow Theme) ---
const ConfettiLayer = ({ trigger }) => {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!trigger) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#facc15', '#eab308', '#ca8a04', '#ffffff', '#a1a1aa'];
    const count = 140;
    const particles = Array.from({ length: count }, () => ({
      x: canvas.width / 2 + (Math.random() - 0.5) * 260,
      y: canvas.height * 0.22,
      vx: (Math.random() - 0.5) * 13,
      vy: Math.random() * -11 - 4,
      size: Math.random() * 6 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      spin: (Math.random() - 0.5) * 16,
      gravity: 0.35 + Math.random() * 0.15,
    }));

    let frame = 0;
    const maxFrames = 110;

    const tick = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.spin;
        const life = Math.max(0, 1 - frame / maxFrames);
        ctx.save();
        ctx.globalAlpha = life;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      });
      if (frame < maxFrames) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    cancelAnimationFrame(rafRef.current);
    tick();

    return () => cancelAnimationFrame(rafRef.current);
  }, [trigger]);

  return <canvas ref={canvasRef} className="fixed inset-0 z-[100] pointer-events-none" />;
};

// --- Toast notifications ---
const ToastStack = ({ toasts, onDismiss }) => (
  <div className="fixed top-6 right-6 z-[90] flex flex-col gap-3 w-[calc(100%-3rem)] max-w-sm">
    <AnimatePresence>
      {toasts.map((t) => {
        const ToastIcon = TOAST_ICONS[t.type] || IconSparkle;
        const tone = t.type === 'error' ? 'border-red-500/30 text-red-400' : t.type === 'success' ? 'border-emerald-500/30 text-emerald-400' : 'border-yellow-500/30 text-yellow-400';
        return (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, x: 60, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.9, transition: { duration: 0.2 } }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className={`flex items-center gap-3 bg-black/90 backdrop-blur-xl border ${tone} rounded-2xl px-4 py-3.5 shadow-2xl cursor-pointer`}
            onClick={() => onDismiss(t.id)}
          >
            <ToastIcon className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium text-slate-100 leading-snug">{t.message}</p>
          </motion.div>
        );
      })}
    </AnimatePresence>
  </div>
);

// --- Floating Input ---
const FloatingInput = ({ label, type = 'text', value, onChange, icon: FieldIcon, required, name, autoComplete }) => {
  const [focused, setFocused] = useState(false);
  const active = focused || (value && value.length > 0);
  return (
    <div className={`relative rounded-xl border bg-black/40 transition-all duration-300 ${focused ? 'border-yellow-400/70 shadow-[0_0_0_3px_rgba(250,204,21,0.12)]' : 'border-white/10'}`}>
      {FieldIcon && <FieldIcon className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${focused ? 'text-yellow-400' : 'text-slate-500'}`} />}
      <input
        type={type} name={name} required={required} autoComplete={autoComplete}
        value={value} onChange={onChange}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        className={`peer w-full bg-transparent text-white outline-none pt-6 pb-2.5 ${FieldIcon ? 'pl-11' : 'pl-4'} pr-4 text-sm`}
      />
      <label className={`absolute pointer-events-none transition-all duration-200 text-slate-500 ${FieldIcon ? 'left-11' : 'left-4'} ${active ? 'top-2 text-[10px] uppercase tracking-wider text-yellow-400/90 font-semibold' : 'top-1/2 -translate-y-1/2 text-sm'}`}>
        {label}
      </label>
    </div>
  );
};

// --- Password Strength ---
const PasswordStrengthMeter = ({ validations, password }) => {
  if (!password) return null;
  const score = [validations.length, validations.upper, validations.lower, validations.number, validations.special].filter(Boolean).length;
  const pct = (score / 5) * 100;
  const labels = ['Too Short', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'];
  const barColor = score <= 1 ? 'bg-red-500' : score === 2 ? 'bg-orange-500' : score === 3 ? 'bg-yellow-500' : score === 4 ? 'bg-lime-400' : 'bg-emerald-400';
  const textColor = score <= 1 ? 'text-red-400' : score === 2 ? 'text-orange-400' : score === 3 ? 'text-yellow-400' : score === 4 ? 'text-lime-400' : 'text-emerald-400';
  return (
    <div className="mt-2.5">
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.4, ease: 'easeOut' }}
          className={`h-full rounded-full ${barColor} shadow-[0_0_8px_currentColor]`} />
      </div>
      <p className={`text-[11px] mt-1.5 font-bold tracking-wide ${textColor}`}>{labels[score]}</p>
    </div>
  );
};

// --- Ripple Button ---
const RippleButton = ({ children, className = '', onClick, type = 'button', disabled, ...rest }) => {
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
      {ripples.map((r) => (
        <motion.span
          key={r.id}
          initial={{ scale: 0, opacity: 0.5 }}
          animate={{ scale: 4, opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="absolute rounded-full bg-white/40 pointer-events-none"
          style={{ left: r.x - 10, top: r.y - 10, width: 20, height: 20 }}
        />
      ))}
    </button>
  );
};

const AuthSubmitButton = ({ isLoading, isSuccess, disabled, children }) => (
  <RippleButton
    type="submit"
    disabled={disabled || isLoading}
    className={`w-full mt-8 font-bold text-black py-4 rounded-xl transition-all duration-300 shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 ${
      disabled ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-50'
      : isSuccess ? 'bg-emerald-500 text-white'
      : 'bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-300 hover:to-yellow-500 hover:shadow-yellow-500/25'
    }`}
  >
    <AnimatePresence mode="wait" initial={false}>
      {isSuccess ? (
        <motion.span key="success" initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-center gap-2">
          <IconCheck className="w-5 h-5" /> Success
        </motion.span>
      ) : isLoading ? (
        <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
      ) : (
        <motion.span key="label" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{children}</motion.span>
      )}
    </AnimatePresence>
  </RippleButton>
);

const AnimatedCheckbox = ({ checked, onChange }) => {
  const reduce = useReducedMotion();
  return (
    <label className="relative flex items-center justify-center cursor-pointer mt-0.5 shrink-0">
      <input type="checkbox" checked={checked} onChange={onChange} className="peer sr-only" />
      <motion.div
        animate={{ scale: checked ? [1, 1.2, 1] : 1 }}
        transition={{ duration: reduce ? 0 : 0.35 }}
        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors duration-200 ${checked ? 'bg-yellow-500 border-yellow-500' : 'border-zinc-600'}`}
      >
        <svg viewBox="0 0 24 24" className="w-3 h-3">
          <motion.path
            d="M5 13l4 4L19 7" stroke="black" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" fill="none"
            initial={false}
            animate={{ pathLength: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
            transition={{ duration: reduce ? 0 : 0.3, ease: 'easeOut' }}
          />
        </svg>
      </motion.div>
    </label>
  );
};

const GlassDatePicker = ({ value, onChange, placeholder = 'Select date', compact = false }) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const selected = value ? new Date(value + 'T00:00:00') : null;
  const [viewDate, setViewDate] = useState(selected || new Date());
  const today = new Date();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const pick = (day) => {
    onChange(`${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
    setOpen(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button" onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2 bg-black/40 text-white border rounded-xl outline-none transition-all hover:border-yellow-400/50 ${open ? 'border-yellow-400/70' : 'border-white/10'} ${compact ? 'px-2.5 py-1 text-xs' : 'p-3.5 text-sm w-full'}`}
      >
        <IconCalendar className="w-4 h-4 text-yellow-400 shrink-0" />
        {value ? (
          new Date(value + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        ) : (
          <span className="text-slate-500">{placeholder}</span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.16 }}
            className="absolute z-40 mt-2 w-72 bg-zinc-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-2xl left-0"
          >
            <div className="flex items-center justify-between mb-3">
              <button type="button" onClick={() => setViewDate(new Date(year, month - 1, 1))} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-slate-300 transition-colors"><IconChevronLeft className="w-4 h-4" /></button>
              <p className="text-sm font-bold text-white font-display">{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][month]} {year}</p>
              <button type="button" onClick={() => setViewDate(new Date(year, month + 1, 1))} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-slate-300 transition-colors"><IconChevronRight className="w-4 h-4" /></button>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-1">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={i} className="text-center text-[10px] text-slate-500 font-bold py-1">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {cells.map((day, i) => {
                if (!day) return <div key={i} />;
                const cellDate = new Date(year, month, day);
                const isToday = cellDate.toDateString() === today.toDateString();
                const isSelected = selected && cellDate.toDateString() === selected.toDateString();
                return (
                  <button
                    type="button" key={i} onClick={() => pick(day)}
                    className={`relative h-8 rounded-lg text-xs font-semibold transition-all duration-150 ${
                      isSelected ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-black shadow-[0_0_12px_rgba(250,204,21,0.5)]'
                      : isToday ? 'text-yellow-400 border border-yellow-400/40 hover:bg-white/10'
                      : 'text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FEATURES = [
  { icon: IconChartBar, title: 'Progress Tracking', desc: 'Watch mastery climb topic by topic.' },
  { icon: IconLayers, title: 'Subject Management', desc: 'Every course, its own syllabus & timeline.' },
  { icon: IconCloud, title: 'Auto Save', desc: 'Every change syncs the moment you make it.' },
  { icon: IconClock, title: 'Deadline Countdown', desc: 'Live urgency indicators for every exam.' },
];

const FeatureCard = ({ icon: FeatureIcon, title, desc, index, reduce }) => (
  <motion.div
    initial={reduce ? false : { opacity: 0, y: 18 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: reduce ? 0 : 0.15 + index * 0.07, ease: 'easeOut' }}
    whileHover={reduce ? {} : { y: -4 }}
    className="group relative bg-white/[0.02] hover:bg-white/[0.06] border border-white/10 hover:border-yellow-400/30 rounded-2xl p-4 transition-colors duration-300 overflow-hidden"
  >
    <div className="absolute -inset-8 bg-yellow-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <div className="relative flex items-start gap-3">
      <div className="w-9 h-9 shrink-0 rounded-lg bg-gradient-to-br from-yellow-400/20 to-black border border-white/10 flex items-center justify-center text-yellow-400 group-hover:rotate-6 group-hover:scale-110 transition-transform duration-300">
        <FeatureIcon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{desc}</p>
      </div>
    </div>
  </motion.div>
);

const TiltLoginCard = ({ children, shakeSignal }) => {
  const reduce = useReducedMotion();
  const { rotateX, rotateY, handleMove, reset } = useTilt(reduce);
  const controls = useAnimation();

  useEffect(() => {
    if (shakeSignal && !reduce) {
      controls.start({ x: [0, -10, 10, -7, 7, -3, 3, 0], transition: { duration: 0.45 } });
    }
  }, [shakeSignal]);

  return (
    <motion.div
      onMouseMove={handleMove} onMouseLeave={reset}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      animate={controls}
      className="relative bg-white/[0.03] backdrop-blur-3xl border border-white/10 p-8 sm:p-10 rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.8)]"
    >
      <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-yellow-400/20 via-transparent to-transparent -z-10 blur-xl pointer-events-none" />
      {children}
    </motion.div>
  );
};

const EmptyState = ({ onAdd }) => (
  <div className="col-span-full text-center py-20 bg-white/[0.02] rounded-3xl border border-dashed border-white/10 relative overflow-hidden">
    <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} className="mx-auto mb-6 w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400/20 to-black border border-white/10 flex items-center justify-center text-yellow-400">
      <IconBookOpen className="w-8 h-8" />
    </motion.div>
    <p className="text-slate-300 font-display font-semibold text-lg mb-1">No subjects found</p>
    <p className="text-slate-500 text-sm mb-6">Start building your tracklist for finals.</p>
    <RippleButton onClick={onAdd} className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:shadow-lg hover:shadow-yellow-500/25 text-black text-sm font-bold py-2.5 px-6 rounded-xl transition-all active:scale-95">
      + Add New Subject
    </RippleButton>
  </div>
);

// --- Subject Card with New Features ---
const SubjectCard = ({ subject, index, reduceMotion, newTopicInput, onTopicInputChange, onAddTopic, onToggleTopic, onDateChange, onDelete, onClearCompleted }) => {
  const progress = subject.syllabus.length === 0 ? 0 : Math.round((subject.syllabus.filter((t) => t.completed).length / subject.syllabus.length) * 100);
  const { rotateX, rotateY, handleMove, reset } = useTilt(reduceMotion, 5);
  const hasCompleted = subject.syllabus.some(t => t.completed);

  return (
    <motion.div
      onMouseMove={handleMove} onMouseLeave={reset}
      style={{ rotateX, rotateY, transformPerspective: 1000 }}
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={reduceMotion ? {} : { y: -6 }}
      transition={{ duration: 0.45, delay: reduceMotion ? 0 : index * 0.06, ease: 'easeOut' }}
      className="group bg-white/[0.03] backdrop-blur-xl border border-white/5 rounded-3xl p-7 shadow-2xl hover:border-yellow-500/30 transition-colors duration-300 flex flex-col h-full relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      {/* Action Buttons */}
      <div className="absolute top-4 right-4 z-20 flex gap-2">
        {hasCompleted && (
           <button onClick={() => onClearCompleted(subject.id)} title="Clear Completed" className="p-1.5 bg-black/40 rounded-lg text-slate-400 hover:text-yellow-400 border border-white/5 hover:border-yellow-400/30 transition-all">
             <IconBroom className="w-3.5 h-3.5" />
           </button>
        )}
        <button onClick={() => onDelete(subject.id)} title="Delete Subject" className="p-1.5 bg-black/40 rounded-lg text-slate-400 hover:text-red-400 border border-white/5 hover:border-red-400/30 transition-all">
           <IconTrash className="w-3.5 h-3.5" />
        </button>
      </div>

      {progress === 100 && (
        <div className="absolute top-4 left-4 z-10 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1">
          <IconTrophy className="w-3 h-3" /> Mastered
        </div>
      )}

      <div className={`flex justify-between items-start mb-4 relative z-10 ${progress === 100 ? 'mt-8' : ''}`}>
        <div className="flex-1 pr-14">
          <h2 className="text-2xl font-bold text-white mb-3 tracking-tight truncate font-display">{subject.name}</h2>
          <div className="text-sm text-slate-400 space-y-2 font-medium">
            <GlassDatePicker compact value={subject.date} onChange={onDateChange} />
            {subject.time && (
              <p className="flex items-center gap-2"><IconClock className="w-4 h-4 text-yellow-400" /> {subject.time}</p>
            )}
          </div>
        </div>
        <ProgressCircle progress={progress} size={64} strokeWidth={5} color="stroke-yellow-400" />
      </div>

      <UrgencySlider dateString={subject.date} />

      <div className="space-y-2.5 mt-2 flex-1 overflow-y-auto pr-2 max-h-[280px] relative z-10">
        {subject.syllabus.map((topic) => (
          <label key={topic.id} className={`flex items-start gap-4 p-3.5 rounded-2xl cursor-pointer transition-all duration-200 border ${topic.completed ? 'bg-yellow-900/10 border-yellow-500/20' : 'bg-black/40 border-transparent hover:bg-black/60 hover:border-white/5'}`}>
            <AnimatedCheckbox checked={topic.completed} onChange={() => onToggleTopic(topic.id)} />
            <span className={`text-sm font-medium leading-relaxed transition-colors ${topic.completed ? 'text-slate-500 line-through' : 'text-slate-200'}`}>{topic.topic}</span>
          </label>
        ))}
        {subject.syllabus.length === 0 && <p className="text-xs text-slate-600 text-center py-4 italic">No topics added yet.</p>}
      </div>

      <div className="mt-5 pt-5 border-t border-white/5 flex gap-2 relative z-10">
        <input
          type="text" placeholder="Add syllabus topic..." value={newTopicInput}
          onChange={(e) => onTopicInputChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onAddTopic()}
          className="flex-1 bg-black/40 border border-white/5 rounded-xl p-3 text-sm text-white focus:border-yellow-400 focus:bg-black/60 outline-none transition-all placeholder:text-slate-600"
        />
        <RippleButton onClick={onAddTopic} className="bg-yellow-400 hover:bg-yellow-500 text-black border border-transparent px-4 py-2 rounded-xl text-lg font-black transition-all duration-300 active:scale-95">
          +
        </RippleButton>
      </div>
    </motion.div>
  );
};

export default function App() {
  const [user, setUser] = useState(null);
  const [authForm, setAuthForm] = useState({ email: '', password: '' });
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [shakeTrigger, setShakeTrigger] = useState(0);

  const [subjects, setSubjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState(''); // NEW FEATURE: Search
  const [autoSaveStatus, setAutoSaveStatus] = useState('SYNCED');
  const hasFetchedData = useRef(false);

  const [newTopicInputs, setNewTopicInputs] = useState({});
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [newSubject, setNewSubject] = useState({ name: '', date: '', time: '', venue: '' });

  const [toasts, setToasts] = useState([]);
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const prevSubjectProgress = useRef({});
  const milestoneRef = useRef(0);
  const prevAutoSaveStatus = useRef(autoSaveStatus);

  const [scrolled, setScrolled] = useState(false);
  const reduceMotion = useReducedMotion();

  const pushToast = (type, message) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3800);
  };
  const dismissToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const pwd = authForm.password;
  const validations = {
    length: pwd.length >= 8,
    upper: /[A-Z]/.test(pwd),
    lower: /[a-z]/.test(pwd),
    number: /[0-9]/.test(pwd),
    special: /[^A-Za-z0-9\s]/.test(pwd),
    noSpace: pwd.length > 0 && !/\s/.test(pwd),
  };
  const isPasswordValid = Object.values(validations).every(Boolean);

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');

    if (isSignUp && !isPasswordValid) {
      setAuthError('Please meet all password requirements.');
      setShakeTrigger((n) => n + 1);
      return;
    }

    setAuthLoading(true);
    try {
      let userCredential;
      if (isSignUp) {
        userCredential = await createUserWithEmailAndPassword(auth, authForm.email, authForm.password);
      } else {
        userCredential = await signInWithEmailAndPassword(auth, authForm.email, authForm.password);
      }

      const loggedInUser = userCredential.user;
      const docRef = doc(db, 'users', loggedInUser.uid);
      const docSnap = await getDoc(docRef);

      setAuthSuccess(true);
      pushToast('success', isSignUp ? 'Account created — welcome!' : 'Login successful, welcome back.');

      setTimeout(() => {
        setUser({ uid: loggedInUser.uid, email: loggedInUser.email });
        if (docSnap.exists() && docSnap.data().subjects) {
          setSubjects(docSnap.data().subjects);
        } else {
          setSubjects([]);
        }
        hasFetchedData.current = true;
      }, 650);
    } catch (error) {
      const message = error.message.replace('Firebase: ', '');
      setAuthError(message);
      pushToast('error', message);
      setShakeTrigger((n) => n + 1);
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    if (!user || !hasFetchedData.current) return;

    setAutoSaveStatus('SAVING...');
    const timer = setTimeout(async () => {
      try {
        await setDoc(doc(db, 'users', user.uid), { subjects });
        setAutoSaveStatus('SYNCED');
      } catch (error) {
        setAutoSaveStatus('ERROR');
        console.error('Error saving data:', error);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [subjects, user]);

  useEffect(() => {
    if (autoSaveStatus === 'ERROR' && prevAutoSaveStatus.current !== 'ERROR') {
      pushToast('error', 'Sync failed. Your changes are safe locally — check your connection.');
    }
    prevAutoSaveStatus.current = autoSaveStatus;
  }, [autoSaveStatus]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggleTopic = (subjectId, topicId) => {
    let completing = false;
    setSubjects((prev) => prev.map((sub) => {
      if (sub.id !== subjectId) return sub;
      return {
        ...sub,
        syllabus: sub.syllabus.map((topic) => {
          if (topic.id !== topicId) return topic;
          completing = !topic.completed;
          return { ...topic, completed: !topic.completed };
        }),
      };
    }));
    if (completing) pushToast('success', 'Topic completed.');
  };

  const updateSubjectDate = (subjectId, newDate) => {
    setSubjects((prev) => prev.map((sub) => (sub.id === subjectId ? { ...sub, date: newDate } : sub)));
  };

  const handleAddTopic = (subjectId) => {
    if (!newTopicInputs[subjectId]) return;
    const newTopic = { id: Date.now().toString(), topic: newTopicInputs[subjectId], completed: false };
    setSubjects((prev) => prev.map((sub) => (sub.id === subjectId ? { ...sub, syllabus: [...sub.syllabus, newTopic] } : sub)));
    setNewTopicInputs((prev) => ({ ...prev, [subjectId]: '' }));
  };

  const handleAddSubject = (e) => {
    e.preventDefault();
    const newSub = { ...newSubject, id: Date.now().toString(), syllabus: [] };
    setSubjects([...subjects, newSub]);
    pushToast('success', `${newSub.name} added to your tracker.`);
    setNewSubject({ name: '', date: '', time: '', venue: '' });
    setShowAddSubject(false);
  };

  // --- NEW FEATURE HANDLERS ---
  const handleDeleteSubject = (subjectId) => {
    if(window.confirm('Are you sure you want to delete this subject?')) {
       setSubjects((prev) => prev.filter(s => s.id !== subjectId));
       pushToast('info', 'Subject deleted.');
    }
  };

  const handleClearCompleted = (subjectId) => {
    setSubjects((prev) => prev.map(s => {
      if(s.id === subjectId) {
        return { ...s, syllabus: s.syllabus.filter(t => !t.completed) };
      }
      return s;
    }));
    pushToast('info', 'Completed topics cleared.');
  };

  const filteredSubjects = subjects.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const totalTopics = subjects.reduce((acc, curr) => acc + curr.syllabus.length, 0);
  const totalCompleted = subjects.reduce((acc, curr) => acc + curr.syllabus.filter((t) => t.completed).length, 0);
  const overallProgress = totalTopics === 0 ? 0 : Math.round((totalCompleted / totalTopics) * 100);

  useEffect(() => {
    subjects.forEach((sub) => {
      const total = sub.syllabus.length;
      const done = sub.syllabus.filter((t) => t.completed).length;
      const pct = total === 0 ? 0 : Math.round((done / total) * 100);
      const prevPct = prevSubjectProgress.current[sub.id];
      if (prevPct !== undefined && prevPct < 100 && pct === 100) {
        if (!reduceMotion) setConfettiTrigger((n) => n + 1);
        pushToast('success', `${sub.name} fully mastered! 🎉`);
      }
      prevSubjectProgress.current[sub.id] = pct;
    });

    if (totalTopics > 0) {
      const milestones = [25, 50, 75, 100];
      const crossed = milestones.filter((m) => overallProgress >= m && milestoneRef.current < m);
      if (crossed.length > 0) {
        const top = Math.max(...crossed);
        if (!reduceMotion) setConfettiTrigger((n) => n + 1);
        milestoneRef.current = top;
        pushToast('success', `Overall progress hit ${top}%!`);
      }
    }
  }, [subjects]);

  const loginView = (
    <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.02 }} transition={{ duration: 0.5 }} className="min-h-screen relative font-sans text-slate-200">
      <GlobalStyles />
      <NeuronBackground aurora reduce={reduceMotion} />
      <ToastStack toasts={toasts} onDismiss={dismissToast} />

      <div className="relative min-h-screen flex flex-col lg:flex-row items-center justify-center gap-12 px-6 py-14 lg:px-16 max-w-7xl mx-auto">
        <div className="flex-1 max-w-xl w-full">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-6 text-xs font-semibold text-yellow-400 tracking-wide">
            <IconSparkle className="w-3.5 h-3.5" /> Premium Glassy Edition
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.05 }} className="font-display text-4xl md:text-5xl font-extrabold text-white leading-tight tracking-tight mb-4">
            Track Every Exam.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">Master Every Subject.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="text-slate-400 text-base mb-8 leading-relaxed max-w-md">
            One calm, focused dashboard for your syllabus, your deadlines, and your progress — synced everywhere, the moment it changes.
          </motion.p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {FEATURES.map((f, i) => <FeatureCard key={f.title} {...f} index={i} reduce={reduceMotion} />)}
          </div>
        </div>

        <div className="w-full max-w-md shrink-0">
          <TiltLoginCard shakeSignal={shakeTrigger}>
            <div className="flex justify-center mb-7">
              <motion.div
                animate={{ boxShadow: ['0 0 20px rgba(250,204,21,0.25)', '0 0 34px rgba(250,204,21,0.4)', '0 0 20px rgba(250,204,21,0.25)'] }}
                transition={{ duration: 3, repeat: reduceMotion ? 0 : Infinity }}
                className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center"
              >
                <svg className="w-8 h-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </motion.div>
            </div>

            <h2 className="font-display text-2xl font-bold text-white mb-1.5 text-center tracking-tight">Exam Tracker</h2>
            <p className="text-center text-slate-400 mb-7 text-sm">{isSignUp ? 'Create your workspace' : 'Sign in to continue'}</p>

            <AnimatePresence>
              {authError && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-5 overflow-hidden">
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">{authError}</div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleAuth} className="space-y-4">
              <FloatingInput
                label="Email Address" type="email" name="email" autoComplete="email" required
                value={authForm.email} onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} icon={IconMail}
              />
              <div>
                <FloatingInput
                  label="Password" type="password" name="password" autoComplete="current-password" required
                  value={authForm.password} onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })} icon={IconLock}
                />
                {isSignUp && <PasswordStrengthMeter validations={validations} password={pwd} />}
                {isSignUp && pwd.length > 0 && (
                  <div className="mt-3 p-4 bg-black/40 rounded-xl border border-white/5 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                    {[
                      ['length', '8+ characters'], ['upper', 'Uppercase'], ['lower', 'Lowercase'],
                      ['number', 'Number'], ['special', 'Special char'], ['noSpace', 'No spaces'],
                    ].map(([key, text]) => (
                      <p key={key} className={`flex items-center gap-1.5 transition-colors duration-300 ${validations[key] ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {validations[key] ? <IconCheck className="w-3.5 h-3.5" /> : <IconX className="w-3.5 h-3.5" />}
                        {text}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              <AuthSubmitButton isLoading={authLoading} isSuccess={authSuccess} disabled={isSignUp && !isPasswordValid}>
                {isSignUp ? 'Create Account' : 'Access Dashboard'}
              </AuthSubmitButton>
            </form>

            <p
              className="text-center text-slate-400 text-sm mt-6 cursor-pointer hover:text-white transition-colors"
              onClick={() => { setIsSignUp(!isSignUp); setAuthError(''); setAuthSuccess(false); setAuthForm({ ...authForm, password: '' }); }}
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </p>
          </TiltLoginCard>
        </div>
      </div>
    </motion.div>
  );

  const dashboardView = (
    <motion.div key="dashboard" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="min-h-screen relative font-sans text-slate-200 pb-20 flex flex-col">
      <GlobalStyles />
      <NeuronBackground reduce={reduceMotion} />
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
      <ConfettiLayer trigger={confettiTrigger} />

      <nav className={`fixed top-0 w-full z-50 flex justify-between items-center transition-all duration-300 ${scrolled ? 'bg-black/80 backdrop-blur-3xl border-b border-white/10 px-6 py-3 shadow-2xl' : 'bg-black/40 backdrop-blur-xl border-b border-white/5 px-6 py-4'}`}>
        <div className="flex items-center gap-3 w-1/3">
          <motion.div whileHover={{ rotate: 8, scale: 1.05 }} className={`bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center shadow-lg transition-all duration-300 ${scrolled ? 'w-7 h-7' : 'w-8 h-8'}`}>
            <span className="text-black font-extrabold text-sm">ET</span>
          </motion.div>
          <span className="text-lg font-bold text-white tracking-wide font-display hidden sm:block">Exam Tracker</span>
        </div>

        {/* --- NEW FEATURE: Search Bar in Header --- */}
        <div className="flex-1 flex justify-center w-1/3">
           <div className="relative w-full max-w-sm">
             <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
             <input 
               type="text" 
               placeholder="Search subjects..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full bg-white/[0.05] border border-white/10 hover:border-white/20 rounded-full pl-10 pr-4 py-1.5 text-sm text-white focus:border-yellow-400 focus:bg-white/[0.1] outline-none transition-all placeholder:text-slate-500 shadow-inner"
             />
           </div>
        </div>

        <div className="flex items-center justify-end gap-4 w-1/3">
          <a href="https://github.com/uusaff" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-yellow-400 transition-colors">
            <GithubIcon />
          </a>
        </div>
      </nav>

      <div className="pt-28 px-6 md:px-10 max-w-7xl mx-auto flex-1 w-full animate-[fadeIn_0.5s_ease-out]">
        
        <div className="mb-10 flex flex-col md:flex-row items-start md:items-center justify-between bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden gap-6 group hover:border-yellow-500/30 transition-all duration-500">
          <div className="absolute top-0 left-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-yellow-500/20 transition-all duration-700"></div>

          <div className="z-10">
            <h1 className="font-display text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-yellow-100 tracking-tight mb-2">
              Finals Overview
            </h1>
            <p className="text-slate-400 font-medium">Keep your focus sharp. 🚀</p>
            <RippleButton onClick={() => setShowAddSubject(!showAddSubject)} className="mt-6 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-semibold py-2.5 px-6 rounded-xl transition-all duration-300 hover:shadow-[0_0_15px_rgba(250,204,21,0.15)] active:scale-95 flex items-center gap-2">
              {showAddSubject ? 'Close Panel' : '+ Add New Subject'}
            </RippleButton>
          </div>

          <div className="flex items-center gap-6 bg-black/60 p-6 rounded-2xl border border-white/5 z-10 w-full md:w-auto justify-between shadow-inner">
            <div className="text-right">
              <p className="text-[10px] text-yellow-400 uppercase tracking-widest font-bold mb-1">Total Mastery</p>
              <p className="font-mono-stat text-4xl font-black text-white">
                <AnimatedCounter value={totalCompleted} /> <span className="text-2xl text-slate-500 font-bold">/ <AnimatedCounter value={totalTopics} /></span>
              </p>
            </div>
            <ProgressCircle progress={overallProgress} size={100} strokeWidth={8} color="stroke-yellow-400" />
          </div>
        </div>

        <AnimatePresence>
          {showAddSubject && (
            <motion.form
              onSubmit={handleAddSubject}
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.35 }}
              className="mb-10 bg-white/[0.03] backdrop-blur-xl border border-yellow-600/30 p-8 rounded-3xl grid grid-cols-1 md:grid-cols-5 gap-5 shadow-2xl overflow-hidden"
            >
              <input
                type="text" placeholder="Subject Name" required value={newSubject.name}
                onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                className="bg-black/40 text-white border border-white/10 rounded-xl p-3.5 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 outline-none transition-all placeholder:text-slate-500 md:col-span-2"
              />
              <GlassDatePicker value={newSubject.date} onChange={(d) => setNewSubject({ ...newSubject, date: d })} placeholder="Exam date" />
              <input
                type="text" placeholder="Time (e.g. 10 AM)" value={newSubject.time}
                onChange={(e) => setNewSubject({ ...newSubject, time: e.target.value })}
                className="bg-black/40 text-white border border-white/10 rounded-xl p-3.5 focus:border-yellow-400 outline-none transition-all placeholder:text-slate-500"
              />
              <RippleButton type="submit" className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3.5 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(250,204,21,0.2)] hover:shadow-[0_0_25px_rgba(250,204,21,0.4)] active:scale-95">
                Save Subject
              </RippleButton>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredSubjects.length === 0 && !showAddSubject && <EmptyState onAdd={() => setShowAddSubject(true)} />}

          {filteredSubjects.map((subject, idx) => (
            <SubjectCard
              key={subject.id}
              subject={subject}
              index={idx}
              reduceMotion={reduceMotion}
              newTopicInput={newTopicInputs[subject.id] || ''}
              onTopicInputChange={(val) => setNewTopicInputs((prev) => ({ ...prev, [subject.id]: val }))}
              onAddTopic={() => handleAddTopic(subject.id)}
              onToggleTopic={(topicId) => toggleTopic(subject.id, topicId)}
              onDateChange={(d) => updateSubjectDate(subject.id, d)}
              onDelete={handleDeleteSubject}
              onClearCompleted={handleClearCompleted}
            />
          ))}
        </div>
      </div>

      {/* --- PREMIUM FOOTER --- */}
      <footer className="mt-20 py-8 border-t border-white/5 flex flex-col items-center justify-center gap-2 backdrop-blur-md bg-black/20">
        <p className="text-xs md:text-sm text-yellow-500/60 font-bold tracking-widest uppercase">
          &copy; {new Date().getFullYear()} Muhammad Yousaf Anwar. All Rights Reserved. &trade;
        </p>
      </footer>

      <div className="fixed bottom-6 right-6 bg-black/80 backdrop-blur-xl px-5 py-3 rounded-full border border-white/10 text-xs font-bold text-slate-400 flex items-center gap-3 shadow-2xl z-50">
        <div className={`w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor] ${autoSaveStatus === 'SYNCED' ? 'bg-emerald-500 text-emerald-500' : autoSaveStatus === 'ERROR' ? 'bg-red-500 text-red-500' : 'bg-yellow-400 text-yellow-400 animate-pulse'}`}></div>
        SERVER: {autoSaveStatus}
      </div>
    </motion.div>
  );

  return <AnimatePresence mode="wait">{!user ? loginView : dashboardView}</AnimatePresence>;
}