import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Clock, Target, Check, RefreshCw, Sun, Moon, Flame, BookOpen, Crown, Gem, Anchor, Sparkles } from 'lucide-react';

interface Deity {
  id: string;
  name: string;
  mantra: string;
  colors: string;
  ringColor: string;
  symbol: string;
}

const DEITIES: Deity[] = [
  { id: 'ganesha', name: 'Ganesha', mantra: 'Om Gam Ganapataye Namaha', colors: 'from-orange-500 to-red-600', ringColor: 'stroke-orange-500', symbol: '🐘' },
  { id: 'shiva', name: 'Shiva', mantra: 'Om Namah Shivaya', colors: 'from-indigo-400 to-violet-600', ringColor: 'stroke-indigo-400', symbol: '🔱' },
  { id: 'krishna', name: 'Krishna', mantra: 'Om Namo Bhagavate Vasudevaya', colors: 'from-sky-400 to-blue-600', ringColor: 'stroke-sky-400', symbol: '🪈' },
  { id: 'rama', name: 'Rama', mantra: 'Om Sri Ramaya Namaha', colors: 'from-amber-300 to-orange-500', ringColor: 'stroke-amber-400', symbol: '🏹' },
  { id: 'devi', name: 'Devi', mantra: 'Om Aim Hreem Kleem Chamundaye Vichche', colors: 'from-rose-500 to-pink-700', ringColor: 'stroke-rose-500', symbol: '🌺' },
  { id: 'hanuman', name: 'Hanuman', mantra: 'Om Hanumate Namaha', colors: 'from-red-500 to-orange-700', ringColor: 'stroke-red-500', symbol: '🕉️' },
  { id: 'guru', name: 'Guru', mantra: 'Om Gum Gurubhyo Namaha', colors: 'from-yellow-400 to-amber-600', ringColor: 'stroke-yellow-400', symbol: '🙏' },
];

const GRAHA_DATA = [
  { 
    id: 0, 
    name: 'Surya (Sun)', 
    deity: 'Lord Surya',
    day: 'Sunday',
    sloka: "Japa Kusuma Sankasham Kashyapeyam Mahadyutim |\nTamorim Sarva Papaghnam Pranato smi Divakaram ||",
    meaning: "I bow to the Sun, who is as red as the hibiscus flower, the son of Kashyapa, of great brilliance, the enemy of darkness, and the destroyer of all sins.",
    color: "from-orange-500 to-red-600",
    icon: <Sun size={48} className="text-orange-200" />
  },
  { 
    id: 1, 
    name: 'Chandra (Moon)', 
    deity: 'Lord Soma',
    day: 'Monday',
    sloka: "Dadhi Shankha Tusharabham Kshirodarnava Sambhavam |\nNamami Shashinam Somam Shambhor Mukuta Bhushanam ||",
    meaning: "I bow to the Moon, who is white like curds, conch, and snow, born from the Ocean of Milk, and who adorns the crest of Lord Shiva.",
    color: "from-slate-400 to-slate-200",
    icon: <Moon size={48} className="text-slate-100" />
  },
  { 
    id: 2, 
    name: 'Mangala (Mars)', 
    deity: 'Lord Angaraka',
    day: 'Tuesday',
    sloka: "Dharani Garbha Sambhutam Vidyut Kanti Samaprabham |\nKumaram Shakti Hastam Tam Mangalam Pranamamyaham ||",
    meaning: "I bow to Mars, born of the Earth, who shines with the brilliance of lightning, the youth who holds a spear in his hand.",
    color: "from-red-600 to-rose-700",
    icon: <Flame size={48} className="text-red-200" />
  },
  { 
    id: 3, 
    name: 'Budha (Mercury)', 
    deity: 'Lord Budha',
    day: 'Wednesday',
    sloka: "Priyangu Kalika Shyamam Rupena Pratimam Budham |\nSaumyam Saumya Gunopetam Tam Budham Pranamamyaham ||",
    meaning: "I bow to Mercury, dark like the bud of the Priyangu flower, of matchless beauty, gentle and endowed with gentle qualities.",
    color: "from-emerald-400 to-green-600",
    icon: <BookOpen size={48} className="text-emerald-200" />
  },
  { 
    id: 4, 
    name: 'Guru (Jupiter)', 
    deity: 'Lord Brihaspati',
    day: 'Thursday',
    sloka: "Devanam Cha Rishinam Cha Gurum Kanchana Sannibham |\nBuddhi Bhutam Trilokesham Tam Namami Brihaspatim ||",
    meaning: "I bow to Jupiter, the preceptor of gods and sages, shining like gold, the embodiment of intellect and lord of the three worlds.",
    color: "from-yellow-500 to-amber-600",
    icon: <Crown size={48} className="text-amber-200" />
  },
  { 
    id: 5, 
    name: 'Shukra (Venus)', 
    deity: 'Lord Shukra',
    day: 'Friday',
    sloka: "Hima Kunda Mrinalabham Daityanam Paramam Gurum |\nSarva Shastra Pravaktaram Bhargavam Pranamamyaham ||",
    meaning: "I bow to Venus, who shines like the snow, the jasmine, and the lotus stem, the supreme preceptor of demons and expounder of all scriptures.",
    color: "from-pink-400 to-fuchsia-500",
    icon: <Gem size={48} className="text-pink-200" />
  },
  { 
    id: 6, 
    name: 'Shani (Saturn)', 
    deity: 'Lord Shanaishchara',
    day: 'Saturday',
    sloka: "Nilanjana Samabhasam Raviputram Yamagrajam |\nChaya Martanda Sambhutam Tam Namami Shanaishcharam ||",
    meaning: "I bow to Saturn, who is blue like the collyrium, the son of the Sun and brother of Yama, born of Chaya and Martanda (Sun).",
    color: "from-indigo-800 to-slate-900",
    icon: <Anchor size={48} className="text-indigo-300" />
  }
];

export const Meditation: React.FC = () => {
  const [mode, setMode] = useState<'timer' | 'japamala' | 'graha'>('timer');
  
  // --- Timer State ---
  const DURATION = 11 * 60; // 11 minutes
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [isActive, setIsActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // --- Japamala State ---
  const [selectedDeity, setSelectedDeity] = useState<Deity>(DEITIES[0]);
  const [beadCount, setBeadCount] = useState(0);
  const [rounds, setRounds] = useState(0);
  const [lastInteraction, setLastInteraction] = useState(0);

  // --- Graha State ---
  const [selectedGrahaId, setSelectedGrahaId] = useState(new Date().getDay());

  // Timer Logic
  useEffect(() => {
    let interval: number;
    if (isActive && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      setIsCompleted(true);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => { setIsActive(false); setTimeLeft(DURATION); setIsCompleted(false); };
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Japamala Logic
  const handleBeadClick = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(15);
    }
    
    setLastInteraction(Date.now());
    
    if (beadCount >= 108) {
        // Round Complete
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate([50, 50, 50]);
        }
        setRounds(r => r + 1);
        setBeadCount(1); // Reset to 1 for next round immediately
    } else {
        setBeadCount(prev => prev + 1);
    }
  };

  const resetMala = () => {
      if (window.confirm("Reset your current round?")) {
          setBeadCount(0);
      }
  };

  const currentGraha = GRAHA_DATA.find(g => g.id === selectedGrahaId) || GRAHA_DATA[0];

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto rounded-none md:rounded-2xl glass-panel md:my-4 shadow-2xl overflow-hidden border-y-0 md:border-y relative">
       
       {/* Background ambient effect changes based on mode */}
       <div className={`absolute inset-0 bg-gradient-to-b transition-all duration-1000 ${
           mode === 'timer' 
           ? 'from-cyan-900/10 to-violet-900/10' 
           : mode === 'graha'
               ? `from-black/60 via-transparent to-black/80`
               : `from-black/40 to-black/80`
       }`}>
         {mode === 'japamala' && (
             <div className={`absolute inset-0 opacity-20 bg-gradient-to-br ${selectedDeity.colors} blur-3xl transition-all duration-700`}></div>
         )}
         {mode === 'graha' && (
             <div className={`absolute inset-0 opacity-20 bg-gradient-to-br ${currentGraha.color} blur-3xl transition-all duration-700`}></div>
         )}
       </div>

       {/* Top Controls: Mode Switcher */}
       <div className="relative z-20 flex justify-center pt-6 pb-2">
           <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 backdrop-blur-md overflow-x-auto no-scrollbar max-w-[95%]">
               <button 
                  onClick={() => setMode('timer')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all text-sm font-bold uppercase tracking-wider shrink-0 ${mode === 'timer' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
               >
                   <Clock size={16} />
                   <span>Dhyana</span>
               </button>
               <button 
                  onClick={() => setMode('japamala')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all text-sm font-bold uppercase tracking-wider shrink-0 ${mode === 'japamala' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
               >
                   <Target size={16} />
                   <span>Japamala</span>
               </button>
               <button 
                  onClick={() => setMode('graha')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all text-sm font-bold uppercase tracking-wider shrink-0 ${mode === 'graha' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
               >
                   <Sparkles size={16} />
                   <span>Graha</span>
               </button>
           </div>
       </div>

       {/* --- TIMER MODE --- */}
       {mode === 'timer' && (
           <div className="flex-1 flex flex-col items-center justify-center relative z-10 p-6 fade-in">
              {/* Main Visualization Circle */}
              <div className="relative w-72 h-72 md:w-96 md:h-96 flex items-center justify-center">
                
                {/* Animated Pulsing Rings */}
                {isActive && (
                    <>
                        <div className="absolute inset-0 rounded-full border border-cyan-500/20 animate-[ping_6s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                        <div className="absolute inset-0 rounded-full border border-violet-500/10 animate-[ping_6s_cubic-bezier(0,0,0.2,1)_infinite] delay-[3000ms]"></div>
                    </>
                )}
                
                {/* Progress Circle SVG */}
                <div className="absolute inset-0 w-full h-full">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" className="stroke-white/5 fill-transparent stroke-[3]" />
                        <circle
                            cx="50" cy="50" r="45"
                            className={`fill-transparent stroke-[3] transition-all duration-1000 ease-linear ${isCompleted ? 'stroke-green-400' : 'stroke-cyan-400'}`}
                            strokeLinecap="round"
                            pathLength="1"
                            strokeDasharray="1"
                            strokeDashoffset={1 - ((DURATION - timeLeft) / DURATION)}
                            style={{ filter: "drop-shadow(0 0 4px rgba(34, 211, 238, 0.5))" }}
                        />
                    </svg>
                </div>
                 
                 {/* Time Display */}
                 <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                     <span className={`text-6xl md:text-8xl font-light font-serif text-slate-100 tracking-wider tabular-nums transition-all duration-700 ${isActive ? 'scale-110 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]' : ''}`}>
                        {formatTime(timeLeft)}
                     </span>
                     <span className={`text-cyan-400/60 uppercase tracking-[0.3em] text-xs mt-6 transition-opacity duration-1000 ${isActive ? 'opacity-100 animate-pulse' : 'opacity-0'}`}>
                        Inhale ... Exhale
                     </span>
                 </div>
              </div>

              {/* Controls */}
              <div className="mt-12 flex items-center space-x-8">
                 <button 
                   onClick={toggleTimer}
                   className="p-5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-300 backdrop-blur-md border border-white/10 hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(139,92,246,0.2)] group"
                 >
                    {isActive ? (
                        <Pause size={36} fill="currentColor" className="opacity-90" />
                    ) : (
                        <Play size={36} fill="currentColor" className="pl-1 opacity-90 group-hover:text-cyan-300 transition-colors" />
                    )}
                 </button>
                 
                 <button 
                   onClick={resetTimer}
                   className="p-4 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all duration-300 backdrop-blur-md border border-white/5 hover:rotate-180"
                 >
                    <RotateCcw size={24} />
                 </button>
              </div>
           </div>
       )}

       {/* --- JAPAMALA MODE --- */}
       {mode === 'japamala' && (
           <div className="flex-1 flex flex-col relative z-10 fade-in overflow-hidden">
               
               {/* Deity Selector */}
               <div className="w-full px-6 py-4 overflow-x-auto no-scrollbar border-b border-white/5 bg-black/20">
                   <div className="flex space-x-4 min-w-max mx-auto justify-center md:justify-start">
                       {DEITIES.map(deity => (
                           <button
                                key={deity.id}
                                onClick={() => { setSelectedDeity(deity); setBeadCount(0); setRounds(0); }}
                                className={`flex flex-col items-center space-y-2 p-2 rounded-xl transition-all duration-300 ${selectedDeity.id === deity.id ? 'bg-white/10 scale-105' : 'opacity-60 hover:opacity-100 hover:bg-white/5'}`}
                           >
                               <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${deity.colors} flex items-center justify-center text-xl shadow-lg border-2 ${selectedDeity.id === deity.id ? 'border-white' : 'border-transparent'}`}>
                                   {deity.symbol}
                               </div>
                               <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">{deity.name}</span>
                           </button>
                       ))}
                   </div>
               </div>

               {/* Mantra Display */}
               <div className="text-center py-6 px-4">
                   <h3 className="text-2xl md:text-3xl font-cinzel text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300">
                       {selectedDeity.name}
                   </h3>
                   <p className="text-lg md:text-xl text-amber-200/90 font-serif italic mt-2 drop-shadow-md">
                       "{selectedDeity.mantra}"
                   </p>
               </div>

               {/* Interaction Area */}
               <div className="flex-1 flex flex-col items-center justify-center pb-8">
                   <div className="relative group">
                       {/* Ripple Effect Container */}
                       <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-white" style={{ animationDuration: '2s', display: Date.now() - lastInteraction < 300 ? 'block' : 'none' }}></div>

                       {/* Main Bead Button */}
                       <button
                           onClick={handleBeadClick}
                           className={`w-64 h-64 md:w-80 md:h-80 rounded-full bg-gradient-to-br ${selectedDeity.colors} shadow-[0_0_50px_rgba(0,0,0,0.5)] border-4 border-white/10 relative flex flex-col items-center justify-center transition-transform active:scale-95 cursor-pointer select-none overflow-hidden`}
                       >
                           {/* Bead Texture Overlay */}
                           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-20 mix-blend-overlay"></div>
                           <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>

                           <div className="relative z-10 text-center">
                                <span className="text-8xl md:text-9xl font-bold font-serif text-white drop-shadow-lg tabular-nums block">
                                    {beadCount}
                                </span>
                                <span className="text-white/60 text-sm uppercase tracking-[0.3em] mt-2 block">
                                    / 108
                                </span>
                           </div>
                           
                           {/* Progress Ring around the bead button */}
                           <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
                                <circle
                                    cx="50" cy="50" r="48"
                                    className="fill-transparent stroke-white/20 stroke-[2]"
                                />
                                <circle
                                    cx="50" cy="50" r="48"
                                    className={`fill-transparent stroke-[4] transition-all duration-200 ${selectedDeity.ringColor}`}
                                    strokeLinecap="round"
                                    pathLength="108"
                                    strokeDasharray="108"
                                    strokeDashoffset={108 - beadCount}
                                />
                           </svg>
                       </button>
                   </div>
                   
                   <p className="mt-8 text-slate-400 text-xs font-sans uppercase tracking-widest animate-pulse">
                       Tap the bead to chant
                   </p>
               </div>

               {/* Footer Stats */}
               <div className="absolute bottom-6 right-6 flex items-center space-x-6 bg-black/40 backdrop-blur-md px-6 py-3 rounded-full border border-white/10">
                   <div className="text-center">
                       <p className="text-[10px] text-slate-500 uppercase font-bold">Rounds</p>
                       <p className="text-xl font-cinzel text-white">{rounds}</p>
                   </div>
                   <div className="h-8 w-px bg-white/10"></div>
                   <button onClick={resetMala} className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full">
                       <RefreshCw size={18} />
                   </button>
               </div>

           </div>
       )}

       {/* --- GRAHA SLOKA MODE --- */}
       {mode === 'graha' && (
           <div className="flex-1 flex flex-col relative z-10 fade-in">
               
               {/* Day Selector */}
               <div className="w-full px-6 py-4 border-b border-white/5 bg-black/20 overflow-x-auto no-scrollbar">
                   <div className="flex space-x-3 min-w-max mx-auto justify-center md:justify-start">
                       {GRAHA_DATA.map((graha) => (
                           <button
                                key={graha.id}
                                onClick={() => setSelectedGrahaId(graha.id)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-all ${
                                    selectedGrahaId === graha.id 
                                    ? 'bg-white/10 text-white border border-white/20' 
                                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                                }`}
                           >
                               {graha.day.slice(0, 3)}
                           </button>
                       ))}
                   </div>
               </div>

               <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 flex flex-col items-center justify-center">
                   
                   <div className="relative group max-w-2xl w-full">
                        {/* Glow Effect */}
                        <div className={`absolute -inset-4 bg-gradient-to-r ${currentGraha.color} opacity-20 blur-2xl rounded-full group-hover:opacity-30 transition-opacity duration-1000`}></div>
                        
                        <div className="relative glass-panel rounded-2xl p-8 md:p-12 border border-white/10 text-center space-y-8">
                             
                             <div className="flex flex-col items-center space-y-4">
                                 <div className={`p-6 rounded-full bg-gradient-to-br ${currentGraha.color} shadow-lg mb-2`}>
                                     {currentGraha.icon}
                                 </div>
                                 <div>
                                     <h2 className="text-3xl md:text-5xl font-cinzel text-white drop-shadow-md">
                                         {currentGraha.name}
                                     </h2>
                                     <p className="text-slate-400 uppercase tracking-[0.2em] text-sm mt-2">
                                         {currentGraha.day} • {currentGraha.deity}
                                     </p>
                                 </div>
                             </div>

                             <div className="space-y-6">
                                 <div className="relative">
                                     <Sparkles className="absolute -top-4 -left-4 text-white/10 w-12 h-12" />
                                     <p className="text-xl md:text-2xl font-serif text-amber-100 leading-relaxed italic">
                                         {currentGraha.sloka.split('\n').map((line, i) => (
                                             <span key={i} className="block mb-2">{line}</span>
                                         ))}
                                     </p>
                                     <Sparkles className="absolute -bottom-4 -right-4 text-white/10 w-12 h-12" />
                                 </div>
                                 
                                 <div className="h-px w-24 bg-white/10 mx-auto"></div>

                                 <p className="text-slate-300 font-light leading-relaxed text-sm md:text-base">
                                     {currentGraha.meaning}
                                 </p>
                             </div>

                        </div>
                   </div>

                   <div className="mt-8 text-center text-slate-500 text-xs uppercase tracking-widest font-bold">
                        Chant this 3, 9, or 108 times for {currentGraha.day}'s blessings
                   </div>

               </div>
           </div>
       )}
    </div>
  );
};