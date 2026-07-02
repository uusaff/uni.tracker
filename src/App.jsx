import { useState, useEffect, useRef } from 'react';
import { auth, db, signInWithEmailAndPassword, createUserWithEmailAndPassword, doc, getDoc, setDoc } from './firebase';

// --- Icons ---
const GithubIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current hover:text-cyan-400 transition-colors duration-300" aria-hidden="true">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

// --- Background Animated Blobs ---
// --- Interactive Neuron Background ---
const NeuronBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];
    const numParticles = 90; // Number of stars/neurons
    let mouse = { x: null, y: null, radius: 180 };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.x;
      mouse.y = e.y;
    });
    window.addEventListener('mouseout', () => {
      mouse.x = null;
      mouse.y = null;
    });

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 1.5;
        this.vy = (Math.random() - 0.5) * 1.5;
        this.radius = Math.random() * 2 + 1;
      }
      
      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off edges
        if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
        if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;

        // Mouse Scatter/Repel Effect
        if (mouse.x != null && mouse.y != null) {
          let dx = mouse.x - this.x;
          let dy = mouse.y - this.y;
          let distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < mouse.radius) {
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            const force = (mouse.radius - distance) / mouse.radius;
            const directionX = forceDirectionX * force * 3;
            const directionY = forceDirectionY * force * 3;
            this.x -= directionX;
            this.y -= directionY;
          }
        }
      }
      
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(34, 211, 238, 0.8)'; // Cyan stars
        ctx.fill();
      }
    }

    const init = () => {
      particles = [];
      for (let i = 0; i < numParticles; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
        
        // Connect neurons to each other
        for (let j = i; j < particles.length; j++) {
          let dx = particles[i].x - particles[j].x;
          let dy = particles[i].y - particles[j].y;
          let distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(147, 51, 234, ${1 - distance / 120})`; // Purple lines
            ctx.lineWidth = 1;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
        
        // Connect neurons directly to the mouse cursor
        if (mouse.x != null && mouse.y != null) {
          let dx = particles[i].x - mouse.x;
          let dy = particles[i].y - mouse.y;
          let distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 160) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(34, 211, 238, ${1 - distance / 160})`; // Cyan lines linking to mouse
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
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[-1] bg-slate-950 overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] z-0"></div>
      <canvas ref={canvasRef} className="absolute inset-0 z-10" />
    </div>
  );
};

// --- Progress Circle Component ---
const ProgressCircle = ({ progress, size = 60, strokeWidth = 5, color = "stroke-cyan-400" }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle className="stroke-white/10" strokeWidth={strokeWidth} fill="transparent" r={radius} cx={size / 2} cy={size / 2} />
        <circle
          className={`${color} transition-all duration-1000 ease-out`}
          strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" fill="transparent" r={radius} cx={size / 2} cy={size / 2}
          style={{ filter: "drop-shadow(0px 0px 8px rgba(34, 211, 238, 0.5))" }}
        />
      </svg>
      <span className="absolute text-sm font-bold text-white drop-shadow-md">{progress}%</span>
    </div>
  );
};

// --- Urgency Slider Component ---
const UrgencySlider = ({ dateString }) => {
  if (!dateString) return null;
  const examDate = new Date(dateString);
  const today = new Date();
  const timeDiff = examDate.getTime() - today.getTime();
  const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
  
  const maxDays = 15;
  const fillPercentage = Math.max(0, Math.min(100, (daysLeft / maxDays) * 100));

  let sliderColor = "bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.6)]"; 
  let trackColor = "bg-emerald-950/30 border-emerald-500/20";
  let textColor = "text-emerald-400";
  let label = `${daysLeft} Days Left`;

  if (isNaN(daysLeft)) {
    return null; 
  } else if (daysLeft <= 0) {
    sliderColor = "bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.8)]"; trackColor = "bg-rose-950/30 border-rose-500/20"; textColor = "text-rose-400 font-bold animate-pulse"; label = daysLeft === 0 ? "EXAM TODAY" : "EXAM PASSED";
  } else if (daysLeft <= 3) {
    sliderColor = "bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.8)]"; trackColor = "bg-orange-950/30 border-orange-500/20"; textColor = "text-orange-400 font-bold animate-pulse";
  } else if (daysLeft <= 7) {
    sliderColor = "bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.6)]"; trackColor = "bg-amber-950/30 border-amber-500/20"; textColor = "text-amber-400";
  }

  return (
    <div className={`mt-4 mb-5 p-3 rounded-xl border ${trackColor} bg-white/5 backdrop-blur-sm transition-all duration-300`}>
      <div className="flex justify-between items-center text-[10px] uppercase tracking-widest mb-2">
        <span className="text-slate-400 font-semibold flex items-center gap-1.5">Timeline</span>
        <span className={`${textColor} font-bold`}>{label}</span>
      </div>
      <div className="h-1.5 w-full bg-slate-900/50 rounded-full overflow-hidden border border-white/5 shadow-inner">
        <div className={`h-full ${sliderColor} transition-all duration-1000 ease-out rounded-full`} style={{ width: `${daysLeft > 0 ? fillPercentage : 100}%` }} />
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState(null);
  const [authForm, setAuthForm] = useState({ email: '', password: '' });
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState('');
  
  const [subjects, setSubjects] = useState([]);
  const [autoSaveStatus, setAutoSaveStatus] = useState('SYNCED');
  const hasFetchedData = useRef(false);
  
  const [editingDateId, setEditingDateId] = useState(null);
  const [newTopicInputs, setNewTopicInputs] = useState({});
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [newSubject, setNewSubject] = useState({ name: '', date: '', time: '', venue: '' });

  // --- Password Validation Logic ---
  const pwd = authForm.password;
  const validations = {
    length: pwd.length >= 8,
    upper: /[A-Z]/.test(pwd),
    lower: /[a-z]/.test(pwd),
    number: /[0-9]/.test(pwd),
    special: /[^A-Za-z0-9\s]/.test(pwd),
    noSpace: pwd.length > 0 && !/\s/.test(pwd)
  };
  const isPasswordValid = Object.values(validations).every(Boolean);

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    
    if (isSignUp && !isPasswordValid) {
      setAuthError('Please meet all password requirements.');
      return;
    }

    try {
      let userCredential;
      if (isSignUp) {
        userCredential = await createUserWithEmailAndPassword(auth, authForm.email, authForm.password);
      } else {
        userCredential = await signInWithEmailAndPassword(auth, authForm.email, authForm.password);
      }
      
      const loggedInUser = userCredential.user;
      setUser({ uid: loggedInUser.uid, email: loggedInUser.email });

      const docRef = doc(db, "users", loggedInUser.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists() && docSnap.data().subjects) {
        setSubjects(docSnap.data().subjects);
      } else {
        setSubjects([]); 
      }
      hasFetchedData.current = true; 
      
    } catch (error) {
      setAuthError(error.message.replace('Firebase: ', ''));
    }
  };

  useEffect(() => {
    if (!user || !hasFetchedData.current) return;
    
    setAutoSaveStatus('SAVING...');
    const timer = setTimeout(async () => {
      try {
        await setDoc(doc(db, "users", user.uid), { subjects });
        setAutoSaveStatus('SYNCED');
      } catch (error) {
        setAutoSaveStatus('ERROR');
        console.error("Error saving data:", error);
      }
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [subjects, user]);

  const toggleTopic = (subjectId, topicId) => {
    setSubjects(prev => prev.map(sub => sub.id === subjectId ? {
      ...sub, syllabus: sub.syllabus.map(topic => topic.id === topicId ? { ...topic, completed: !topic.completed } : topic)
    } : sub));
  };

  const updateSubjectDate = (subjectId, newDate) => {
    setSubjects(prev => prev.map(sub => sub.id === subjectId ? { ...sub, date: newDate } : sub));
    setEditingDateId(null);
  };

  const handleAddTopic = (subjectId) => {
    if (!newTopicInputs[subjectId]) return;
    const newTopic = { id: Date.now().toString(), topic: newTopicInputs[subjectId], completed: false };
    setSubjects(prev => prev.map(sub => sub.id === subjectId ? { ...sub, syllabus: [...sub.syllabus, newTopic] } : sub));
    setNewTopicInputs(prev => ({ ...prev, [subjectId]: '' }));
  };

  const handleAddSubject = (e) => {
    e.preventDefault();
    const newSub = { ...newSubject, id: Date.now().toString(), syllabus: [] };
    setSubjects([...subjects, newSub]);
    setNewSubject({ name: '', date: '', time: '', venue: '' });
    setShowAddSubject(false);
  };

  const totalTopics = subjects.reduce((acc, curr) => acc + curr.syllabus.length, 0);
  const totalCompleted = subjects.reduce((acc, curr) => acc + curr.syllabus.filter(t => t.completed).length, 0);
  const overallProgress = totalTopics === 0 ? 0 : Math.round((totalCompleted / totalTopics) * 100);

  // --- LOGIN UI ---
  if (!user) {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-6 font-sans text-slate-200">
        <NeuronBackground />
        
        <form onSubmit={handleAuth} className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-10 rounded-3xl w-full max-w-md shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all duration-500 animate-[fadeIn_0.5s_ease-out]">
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(34,211,238,0.3)]">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-2 text-center tracking-tight">Exam Tracker</h2>
          <p className="text-center text-slate-400 mb-8 text-sm">{isSignUp ? "Create your workspace" : "Sign in to continue"}</p>
          
          {authError && (
            <div className="mb-6 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm text-center animate-[pulse_2s_infinite]">
              {authError}
            </div>
          )}
          
          <div className="space-y-4">
            <input type="email" placeholder="Email Address" required value={authForm.email} onChange={e => setAuthForm({...authForm, email: e.target.value})} className="w-full bg-black/20 text-white border border-white/10 rounded-xl p-4 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition-all placeholder:text-slate-500" />
            
            <div>
              <input type="password" placeholder="Password" required value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} className="w-full bg-black/20 text-white border border-white/10 rounded-xl p-4 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition-all placeholder:text-slate-500" />
              
              {/* Real-time Password Validation for Sign Up */}
              {isSignUp && pwd.length > 0 && (
                <div className="mt-3 p-4 bg-black/30 rounded-xl border border-white/5 space-y-2 text-xs">
                  <p className={`flex items-center gap-2 ${validations.length ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {validations.length ? '✅' : '❌'} Minimum 8 characters
                  </p>
                  <p className={`flex items-center gap-2 ${validations.upper ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {validations.upper ? '✅' : '❌'} Uppercase letter
                  </p>
                  <p className={`flex items-center gap-2 ${validations.lower ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {validations.lower ? '✅' : '❌'} Lowercase letter
                  </p>
                  <p className={`flex items-center gap-2 ${validations.number ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {validations.number ? '✅' : '❌'} Number
                  </p>
                  <p className={`flex items-center gap-2 ${validations.special ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {validations.special ? '✅' : '❌'} Special character
                  </p>
                  <p className={`flex items-center gap-2 ${validations.noSpace ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {validations.noSpace ? '✅' : '❌'} No spaces
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <button type="submit" disabled={isSignUp && !isPasswordValid} className={`w-full mt-8 font-bold text-white py-4 rounded-xl transition-all duration-300 shadow-lg active:scale-[0.98] ${isSignUp && !isPasswordValid ? 'bg-slate-700 cursor-not-allowed opacity-50' : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 hover:shadow-cyan-500/25'}`}>
            {isSignUp ? "Create Account" : "Access Dashboard"}
          </button>

          <p className="text-center text-slate-400 text-sm mt-6 cursor-pointer hover:text-white transition-colors" onClick={() => { setIsSignUp(!isSignUp); setAuthError(''); setAuthForm({...authForm, password: ''}); }}>
            {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
          </p>
        </form>
      </div>
    );
  }

  // --- DASHBOARD UI ---
  return (
    <div className="min-h-screen relative font-sans text-slate-200 pb-20">
      <NeuronBackground />


      <nav className="fixed top-0 w-full bg-black/40 backdrop-blur-xl border-b border-white/5 z-50 px-6 py-4 flex justify-between items-center transition-all">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
             <span className="text-white font-bold text-sm">ET</span>
          </div>
          <span className="text-lg font-bold text-white tracking-wide">Exam Tracker</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="https://github.com/uusaff" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
            <GithubIcon />
          </a>
        </div>
      </nav>
      
      {/* Main Content padding-top offsets the fixed navbar */}
      <div className="pt-28 px-6 md:px-10 max-w-7xl mx-auto animate-[fadeIn_0.5s_ease-out]">
        
        {/* Header Stats */}
        <div className="mb-10 flex flex-col md:flex-row items-start md:items-center justify-between bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden gap-6 group hover:border-cyan-500/30 transition-all duration-500">
          <div className="absolute top-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-cyan-500/20 transition-all duration-700"></div>
          
          <div className="z-10">
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight mb-2">
              Finals Overview
            </h1>
            <p className="text-slate-400 font-medium">Keep your focus sharp. 🚀</p>
            <button onClick={() => setShowAddSubject(!showAddSubject)} className="mt-6 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-semibold py-2.5 px-6 rounded-xl transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,255,255,0.05)] active:scale-95 flex items-center gap-2">
              {showAddSubject ? 'Close Panel' : '+ Add New Subject'}
            </button>
          </div>
          
          <div className="flex items-center gap-6 bg-black/40 p-6 rounded-2xl border border-white/5 z-10 w-full md:w-auto justify-between shadow-inner">
            <div className="text-right">
              <p className="text-[10px] text-cyan-400 uppercase tracking-widest font-bold mb-1">Total Mastery</p>
              <p className="text-4xl font-black text-white">{totalCompleted} <span className="text-2xl text-slate-500 font-bold">/ {totalTopics}</span></p>
            </div>
            <ProgressCircle progress={overallProgress} size={100} strokeWidth={8} color="stroke-cyan-400" />
          </div>
        </div>

        {/* Add Subject Form */}
        {showAddSubject && (
          <form onSubmit={handleAddSubject} className="mb-10 bg-white/[0.03] backdrop-blur-xl border border-purple-500/20 p-8 rounded-3xl grid grid-cols-1 md:grid-cols-5 gap-5 shadow-2xl transition-all animate-[fadeIn_0.3s_ease-out]">
            <input type="text" placeholder="Subject Name" required value={newSubject.name} onChange={e => setNewSubject({...newSubject, name: e.target.value})} className="bg-black/20 text-white border border-white/10 rounded-xl p-3.5 focus:border-purple-400 focus:ring-1 focus:ring-purple-400 outline-none transition-all placeholder:text-slate-500 md:col-span-2" />
            <input type="date" required value={newSubject.date} onChange={e => setNewSubject({...newSubject, date: e.target.value})} className="bg-black/20 text-white border border-white/10 rounded-xl p-3.5 focus:border-purple-400 focus:ring-1 focus:ring-purple-400 outline-none transition-all color-scheme-dark [&::-webkit-calendar-picker-indicator]:filter-[invert(1)] [&::-webkit-calendar-picker-indicator]:opacity-50 hover:[&::-webkit-calendar-picker-indicator]:opacity-100 cursor-pointer" />
            <input type="text" placeholder="Time (e.g. 10 AM)" value={newSubject.time} onChange={e => setNewSubject({...newSubject, time: e.target.value})} className="bg-black/20 text-white border border-white/10 rounded-xl p-3.5 focus:border-purple-400 outline-none transition-all placeholder:text-slate-500" />
            <button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3.5 rounded-xl transition-all duration-300 shadow-lg hover:shadow-purple-500/25 active:scale-95">Save Subject</button>
          </form>
        )}

        {/* Subjects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {subjects.length === 0 && !showAddSubject && (
            <div className="col-span-full text-center py-20 bg-white/[0.01] rounded-3xl border border-dashed border-white/10">
               <p className="text-slate-500 mb-4">No subjects added yet.</p>
               <button onClick={() => setShowAddSubject(true)} className="text-cyan-400 hover:text-cyan-300 font-medium">Click here to add your first subject.</button>
            </div>
          )}

          {subjects.map(subject => {
            const progress = subject.syllabus.length === 0 ? 0 : Math.round((subject.syllabus.filter(t => t.completed).length / subject.syllabus.length) * 100);
            
            return (
              <div key={subject.id} className="group bg-white/[0.03] backdrop-blur-xl border border-white/5 rounded-3xl p-7 shadow-2xl hover:border-cyan-500/30 transition-all duration-300 hover:-translate-y-1.5 flex flex-col h-full relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="flex-1 pr-4">
                    <h2 className="text-2xl font-bold text-white mb-3 tracking-tight truncate">{subject.name}</h2>
                    <div className="text-sm text-slate-400 space-y-2 font-medium">
                      <p className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        {editingDateId === subject.id ? (
                          <input type="date" className="bg-black/40 text-white border border-cyan-400/50 rounded-lg px-2 py-1 outline-none text-xs color-scheme-dark" 
                                 onBlur={(e) => updateSubjectDate(subject.id, e.target.value)} 
                                 onKeyDown={(e) => e.key === 'Enter' && updateSubjectDate(subject.id, e.target.value)} autoFocus/>
                        ) : (
                          <span className="cursor-pointer border-b border-dashed border-transparent hover:border-cyan-400 hover:text-cyan-400 transition-colors" onClick={() => setEditingDateId(subject.id)}>
                            {new Date(subject.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} <span className="opacity-50 ml-1 text-xs">✏️</span>
                          </span>
                        )}
                      </p>
                      {subject.time && <p className="flex items-center gap-2"><svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> {subject.time}</p>}
                    </div>
                  </div>
                  <ProgressCircle progress={progress} size={64} strokeWidth={5} color="stroke-cyan-400" />
                </div>

                <UrgencySlider dateString={subject.date} />

                <div className="space-y-2.5 mt-2 flex-1 overflow-y-auto pr-2 max-h-[280px] scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent relative z-10">
                  {subject.syllabus.map(topic => (
                    <label key={topic.id} className={`flex items-start gap-4 p-3.5 rounded-2xl cursor-pointer transition-all duration-200 border ${topic.completed ? 'bg-cyan-900/10 border-cyan-500/20' : 'bg-black/20 border-transparent hover:bg-black/40 hover:border-white/5'}`}>
                      <div className="relative flex items-center justify-center mt-0.5">
                        <input type="checkbox" checked={topic.completed} onChange={() => toggleTopic(subject.id, topic.id)} className="peer appearance-none w-5 h-5 border-2 border-slate-600 rounded-md checked:bg-cyan-500 checked:border-cyan-500 transition-colors cursor-pointer" />
                        <svg className="absolute w-3 h-3 text-black opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <span className={`text-sm font-medium leading-relaxed transition-colors ${topic.completed ? 'text-slate-500 line-through' : 'text-slate-200'}`}>{topic.topic}</span>
                    </label>
                  ))}
                  {subject.syllabus.length === 0 && (
                    <p className="text-xs text-slate-600 text-center py-4 italic">No topics added yet.</p>
                  )}
                </div>

                <div className="mt-5 pt-5 border-t border-white/5 flex gap-2 relative z-10">
                  <input type="text" placeholder="Add syllabus topic..." value={newTopicInputs[subject.id] || ''} onChange={(e) => setNewTopicInputs(prev => ({...prev, [subject.id]: e.target.value}))} onKeyDown={(e) => e.key === 'Enter' && handleAddTopic(subject.id)} className="flex-1 bg-black/30 border border-white/5 rounded-xl p-3 text-sm text-white focus:border-cyan-400 focus:bg-black/50 outline-none transition-all placeholder:text-slate-600" />
                  <button onClick={() => handleAddTopic(subject.id)} className="bg-white/5 hover:bg-cyan-500 text-slate-300 hover:text-black border border-white/10 hover:border-cyan-500 px-4 py-2 rounded-xl text-lg font-black transition-all duration-300 active:scale-95">+</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Auto-Save Indicator */}
      <div className="fixed bottom-6 right-6 bg-black/60 backdrop-blur-xl px-5 py-3 rounded-full border border-white/10 text-xs font-bold text-slate-400 flex items-center gap-3 shadow-2xl z-50">
        <div className={`w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor] ${autoSaveStatus === 'SYNCED' ? 'bg-emerald-500 text-emerald-500' : autoSaveStatus === 'ERROR' ? 'bg-rose-500 text-rose-500' : 'bg-cyan-400 text-cyan-400 animate-pulse'}`}></div>
        SERVER: {autoSaveStatus}
      </div>
    </div>
  );
}