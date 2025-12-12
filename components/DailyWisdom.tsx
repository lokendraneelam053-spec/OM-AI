import React, { useEffect, useState, useRef } from 'react';
import { RefreshCw, Quote, Sparkles } from 'lucide-react';
import { WisdomData } from '../types';
import { getDailyWisdom } from '../services/geminiService';
import { OmIcon } from './OmIcon';

interface DailyWisdomProps {
  language: string;
}

export const DailyWisdom: React.FC<DailyWisdomProps> = ({ language }) => {
  const [wisdom, setWisdom] = useState<WisdomData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Track the date of the last successful fetch to prevent stale "yesterday's" data
  const lastFetchDateRef = useRef<string>(new Date().toDateString());
  const lastLanguageRef = useRef<string>(language);

  const fetchWisdom = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDailyWisdom(language);
      setWisdom(data);
      lastFetchDateRef.current = new Date().toDateString();
      lastLanguageRef.current = language;
    } catch (err) {
      setError("Failed to commune with the divine wisdom. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // If language changed, refresh
    if (lastLanguageRef.current !== language) {
        fetchWisdom();
    } else if (!wisdom) {
        fetchWisdom();
    }

    // Auto-refresh if the app comes back to foreground on a different day
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const today = new Date().toDateString();
        if (lastFetchDateRef.current !== today) {
          console.log("New day detected, refreshing wisdom...");
          fetchWisdom();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [language]);

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto rounded-none md:rounded-2xl glass-panel md:my-4 shadow-2xl overflow-y-auto custom-scrollbar border-y-0 md:border-y">
      <div className="flex-1 p-6 md:p-12 flex flex-col items-center justify-center min-h-[500px]">
        
        {loading ? (
          <div className="flex flex-col items-center justify-center space-y-6">
             {/* Spinning and Glowing Container */}
             <div className="p-6 rounded-full bg-violet-500/10 border border-violet-500/30 animate-spin shadow-[0_0_50px_rgba(139,92,246,0.5)] backdrop-blur-sm">
                <OmIcon className="w-16 h-16 text-violet-200 drop-shadow-[0_0_15px_rgba(167,139,250,0.8)]" />
             </div>
             <p className="text-slate-400 font-cinzel text-sm tracking-widest animate-pulse">Consulting the Akasha...</p>
          </div>
        ) : error ? (
          <div className="text-center space-y-4">
            <p className="text-red-300 font-serif">{error}</p>
            <button 
              onClick={fetchWisdom}
              className="px-6 py-2 bg-white/5 hover:bg-white/10 text-violet-300 rounded-full transition-colors border border-white/10"
            >
              Try Again
            </button>
          </div>
        ) : wisdom ? (
          <div className="w-full max-w-3xl fade-in space-y-10 text-center relative z-10">
            <div className="absolute top-0 left-0 opacity-5 text-white transform -translate-x-8 -translate-y-8">
               <Quote size={120} />
            </div>

            <div className="space-y-3">
                <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-violet-300 to-cyan-200 font-cinzel text-sm md:text-lg tracking-[0.3em] uppercase font-bold">
                    Bhagavad Gita {wisdom.chapter && wisdom.verse ? `• Ch ${wisdom.chapter} : V ${wisdom.verse}` : ''}
                </h2>
                <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-violet-500 to-transparent mx-auto"></div>
            </div>

            <div className="space-y-8 py-2">
                <p className="text-2xl md:text-5xl font-cinzel text-white leading-relaxed drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                  {wisdom.sanskrit}
                </p>
                <p className="text-slate-400 text-lg md:text-xl font-serif italic font-light">
                  {wisdom.transliteration}
                </p>
            </div>

            <div className="glass-panel p-8 md:p-10 rounded-2xl border border-white/10 bg-black/40 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <p className="text-xl md:text-2xl text-slate-100 font-serif leading-relaxed relative z-10">
                  "{wisdom.translation}"
                </p>
            </div>

            <div className="flex items-start justify-center space-x-4 text-left max-w-2xl mx-auto pt-2">
                <Sparkles className="text-amber-400 shrink-0 mt-1 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" size={24} />
                <div className="space-y-1">
                    <span className="text-amber-400 font-bold uppercase text-xs tracking-widest block">Cosmic Insight</span>
                    <p className="text-slate-300 font-light leading-relaxed text-lg">
                    {wisdom.insight}
                    </p>
                </div>
            </div>

            <div className="pt-10">
                <button 
                    onClick={fetchWisdom}
                    className="group flex items-center space-x-3 mx-auto px-8 py-3 bg-white/5 hover:bg-white/10 text-violet-200 border border-white/10 rounded-full transition-all duration-300 hover:shadow-[0_0_20px_rgba(139,92,246,0.2)] hover:border-violet-500/40"
                >
                    <RefreshCw size={16} className="group-hover:rotate-180 transition-transform duration-700" />
                    <span className="font-cinzel tracking-wider text-sm">Next Verse</span>
                </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};