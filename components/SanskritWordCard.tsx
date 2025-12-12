import React, { useEffect, useState } from 'react';
import { Sparkles, RefreshCw, X } from 'lucide-react';
import { SanskritWord } from '../types';
import { getSanskritWord } from '../services/geminiService';
import { getLabel } from '../utils/translations';

interface SanskritWordCardProps {
  language: string;
}

export const SanskritWordCard: React.FC<SanskritWordCardProps> = ({ language }) => {
  const [wordData, setWordData] = useState<SanskritWord | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const fetchData = async (force: boolean = false) => {
    const today = new Date().toDateString();
    const cacheKey = `om_ai_sanskrit_word_${today}_${language}`;
    
    // Try cache first
    if (!force) {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            setWordData(JSON.parse(cached));
            return;
        }
    }

    setLoading(true);
    try {
      const data = await getSanskritWord(language);
      setWordData(data);
      localStorage.setItem(cacheKey, JSON.stringify(data));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [language]);

  // Modal View (Overlay)
  if (isOpen) {
      return (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
              {/* Click outside to close area */}
              <div className="absolute inset-0" onClick={() => setIsOpen(false)}></div>
              
              <div className="relative w-full max-w-lg p-8 rounded-2xl glass-panel border border-violet-500/20 shadow-[0_0_50px_rgba(139,92,246,0.15)] bg-slate-950/80 z-10" onClick={(e) => e.stopPropagation()}>
                  
                  {/* Close Button */}
                  <button 
                    onClick={() => setIsOpen(false)} 
                    className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white transition-colors rounded-full hover:bg-white/10"
                  >
                      <X size={20} />
                  </button>

                  {loading ? (
                      <div className="flex flex-col items-center justify-center py-12 space-y-4">
                         <div className="w-10 h-10 rounded-full border-2 border-violet-500/30 border-t-violet-400 animate-spin"></div>
                         <p className="text-xs text-slate-500 font-cinzel tracking-widest uppercase">Consulting the Scriptures...</p>
                      </div>
                  ) : wordData ? (
                      <div className="animate-fadeIn">
                           <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-3">
                                <span className="text-xs font-bold text-violet-400 uppercase tracking-widest flex items-center gap-2">
                                    <Sparkles size={14} /> {getLabel(language, 'wordOfTheDay')}
                                </span>
                                <button onClick={() => fetchData(true)} className="p-2 rounded-full hover:bg-white/5 text-slate-500 hover:text-white transition-colors mr-8" title="New Word">
                                    <RefreshCw size={14} />
                                </button>
                           </div>

                           <div className="text-center space-y-3 mb-8">
                               <h3 className="text-4xl md:text-6xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-200 to-slate-400 drop-shadow-sm pb-1">
                                   {wordData.word}
                               </h3>
                               <p className="text-slate-400 text-sm font-sans tracking-[0.2em] uppercase opacity-80">
                                   {wordData.transliteration}
                               </p>
                           </div>

                           <div className="space-y-6">
                               <div className="bg-white/5 rounded-xl p-5 border border-white/5">
                                    <p className="text-slate-200 text-center font-medium font-serif text-xl">
                                        {wordData.meaning}
                                    </p>
                               </div>
                               <div className="px-2">
                                    <p className="text-slate-300 text-sm font-light leading-relaxed text-center italic opacity-90">
                                            "{wordData.deepMeaning}"
                                    </p>
                               </div>
                           </div>
                      </div>
                  ) : (
                      <div className="text-center py-10 text-slate-500">
                          Unavailable. Please check connection.
                      </div>
                  )}
              </div>
          </div>
      );
  }

  // Trigger Button (Side Tab)
  return (
      <button 
        onClick={() => setIsOpen(true)}
        className="absolute right-0 top-24 z-30 flex flex-col items-center gap-3 py-4 px-1.5 bg-black/40 hover:bg-violet-900/40 backdrop-blur-md border-l border-t border-b border-violet-500/30 rounded-l-xl transition-all duration-300 shadow-lg group hover:pr-3 hover:translate-x-0 translate-x-1"
        title={getLabel(language, 'wordOfTheDay')}
      >
          <Sparkles size={18} className="text-violet-400 group-hover:text-amber-200 transition-colors animate-pulse" />
          <span className="text-[10px] font-cinzel font-bold text-violet-300 group-hover:text-white [writing-mode:vertical-rl] rotate-180 tracking-widest h-auto">
              Sanskrit Word
          </span>
      </button>
  );
};