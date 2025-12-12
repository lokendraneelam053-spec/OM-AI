import React, { useState, useEffect } from 'react';
import { Star, Sun, RefreshCw, AlertCircle, Sparkles, Moon, Calendar, ArrowLeft } from 'lucide-react';
import { HoroscopeData, PanchangamData } from '../types';
import { getHoroscope, getPanchangam } from '../services/geminiService';
import { InfinityLoader } from './InfinityLoader';
import { getLabel } from '../utils/translations';

interface DailyHoroscopeProps {
  language: string;
}

const ZODIAC_SIGNS = [
  { name: "Aries", sanskrit: "Mesha", dates: "Apr 14 - May 15" },
  { name: "Taurus", sanskrit: "Vrishabha", dates: "May 15 - Jun 15" },
  { name: "Gemini", sanskrit: "Mithuna", dates: "Jun 15 - Jul 16" },
  { name: "Cancer", sanskrit: "Karka", dates: "Jul 16 - Aug 17" },
  { name: "Leo", sanskrit: "Simha", dates: "Aug 17 - Sep 17" },
  { name: "Virgo", sanskrit: "Kanya", dates: "Sep 17 - Oct 17" },
  { name: "Libra", sanskrit: "Tula", dates: "Oct 17 - Nov 16" },
  { name: "Scorpio", sanskrit: "Vrishchika", dates: "Nov 16 - Dec 16" },
  { name: "Sagittarius", sanskrit: "Dhanu", dates: "Dec 16 - Jan 14" },
  { name: "Capricorn", sanskrit: "Makara", dates: "Jan 14 - Feb 13" },
  { name: "Aquarius", sanskrit: "Kumbha", dates: "Feb 13 - Mar 14" },
  { name: "Pisces", sanskrit: "Meena", dates: "Mar 14 - Apr 14" },
];

export const DailyHoroscope: React.FC<DailyHoroscopeProps> = ({ language }) => {
  const [selectedSign, setSelectedSign] = useState<string | null>(null);
  const [horoscope, setHoroscope] = useState<HoroscopeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
  const [panchangam, setPanchangam] = useState<PanchangamData | null>(null);
  const [panchangamLoading, setPanchangamLoading] = useState(false);

  const fetchHoroscope = async (sign: string, timePeriod: 'daily' | 'weekly' | 'monthly' | 'yearly') => {
    setLoading(true);
    setHoroscope(null);
    try {
      const data = await getHoroscope(sign, timePeriod, language);
      setHoroscope(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignSelect = (sign: string) => {
      setSelectedSign(sign);
      setPeriod('daily'); // Reset to daily when new sign selected
      fetchHoroscope(sign, 'daily');
  };

  const handlePeriodChange = (newPeriod: 'daily' | 'weekly' | 'monthly' | 'yearly') => {
      if (selectedSign) {
          setPeriod(newPeriod);
          fetchHoroscope(selectedSign, newPeriod);
      }
  };

  const fetchPanchangam = async (force: boolean = false) => {
      const today = new Date().toDateString();
      const cacheKey = `om_ai_panchangam_${today}_${language}`;
      
      if (!force) {
          const cached = localStorage.getItem(cacheKey);
          if (cached) {
              setPanchangam(JSON.parse(cached));
              return;
          }
      }

      setPanchangamLoading(true);
      try {
          const data = await getPanchangam(language);
          setPanchangam(data);
          localStorage.setItem(cacheKey, JSON.stringify(data));
      } catch (err) {
          console.error("Failed to fetch panchangam", err);
      } finally {
          setPanchangamLoading(false);
      }
  };

  useEffect(() => {
      fetchPanchangam();
  }, [language]);

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto rounded-none md:rounded-2xl glass-panel md:my-4 shadow-2xl overflow-y-auto custom-scrollbar border-y-0 md:border-y">
      
      {!selectedSign && !loading && (
        <div className="flex-1 p-6 md:p-10 flex flex-col items-center justify-start fade-in space-y-12">
          
          <div className="text-center">
            <h2 className="text-3xl md:text-5xl font-cinzel text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-200 drop-shadow-[0_0_15px_rgba(251,191,36,0.3)] mb-4">
              Vedic Horoscope
            </h2>
            <p className="text-slate-400 font-light max-w-xl mx-auto">
              Select your Moon Sign (Rashi) or Ascendant (Lagna) to receive guidance aligned with the cosmic rhythms.
            </p>
          </div>

          {/* New Feature: Cosmic Rhythm (Panchangam) */}
          <div className="w-full max-w-4xl glass-panel border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-32 bg-amber-500/5 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3"></div>
              
              <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-2">
                 <h3 className="text-lg font-cinzel text-amber-200 flex items-center gap-2">
                     <Calendar size={18} className="text-amber-400" />
                     {getLabel(language, 'dailyPanchangam')}
                 </h3>
                 <span className="text-xs text-slate-500 uppercase tracking-widest">{new Date().toLocaleDateString()}</span>
              </div>

              {panchangamLoading ? (
                  <div className="flex justify-center py-6">
                      <div className="w-6 h-6 border-2 border-amber-500/30 border-t-amber-400 rounded-full animate-spin"></div>
                  </div>
              ) : panchangam ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                          <div className="flex justify-between items-center bg-black/20 p-3 rounded-lg">
                              <span className="text-slate-400 text-sm uppercase tracking-wider flex items-center gap-2"><Moon size={14}/> {getLabel(language, 'tithi')}</span>
                              <span className="text-slate-200 font-serif font-bold">{panchangam.tithi}</span>
                          </div>
                          <div className="flex justify-between items-center bg-black/20 p-3 rounded-lg">
                              <span className="text-slate-400 text-sm uppercase tracking-wider flex items-center gap-2"><Star size={14}/> {getLabel(language, 'nakshatra')}</span>
                              <span className="text-slate-200 font-serif font-bold">{panchangam.nakshatra}</span>
                          </div>
                          <div className="flex justify-between items-center bg-black/20 p-3 rounded-lg">
                              <span className="text-slate-400 text-sm uppercase tracking-wider flex items-center gap-2"><Sun size={14}/> {getLabel(language, 'yoga')}</span>
                              <span className="text-slate-200 font-serif font-bold">{panchangam.yoga}</span>
                          </div>
                      </div>
                      <div className="flex flex-col justify-center space-y-2 bg-amber-900/10 p-4 rounded-xl border border-amber-500/10">
                          <span className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                              <Sparkles size={12} /> {getLabel(language, 'cosmicMessage')}
                          </span>
                          <p className="text-slate-200 font-light italic leading-relaxed">
                              "{panchangam.cosmicThought}"
                          </p>
                      </div>
                  </div>
              ) : (
                  <div className="text-center py-4 text-slate-500 text-sm">Cosmic data unavailable...</div>
              )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl">
            {ZODIAC_SIGNS.map((sign) => (
              <button
                key={sign.name}
                onClick={() => handleSignSelect(sign.name)}
                className="group relative p-4 rounded-xl glass-panel hover:bg-white/5 transition-all duration-300 border border-white/5 hover:border-amber-500/30 text-center"
              >
                 <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 rounded-xl transition-opacity"></div>
                 <h3 className="text-lg font-serif text-slate-200 group-hover:text-amber-400 font-bold">{sign.name}</h3>
                 <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">{sign.sanskrit}</p>
                 <p className="text-[10px] text-slate-600 mt-2">{sign.dates}</p>
              </button>
            ))}
          </div>
          
          <div className="text-center pt-4">
             <p className="text-xs text-slate-500 italic">(Dates based on Sidereal Zodiac)</p>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[500px]">
           <InfinityLoader text="Consulting the Stars..." />
        </div>
      )}

      {selectedSign && !loading && horoscope && (
        <div className="flex-1 p-6 md:p-10 fade-in flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
              <button 
                 onClick={() => { setSelectedSign(null); setHoroscope(null); }}
                 className="flex items-center space-x-2 text-sm text-slate-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-3 py-2 rounded-lg"
              >
                 <ArrowLeft size={16} />
                 <span>Back</span>
              </button>

              {/* Time Period Tabs */}
              <div className="flex bg-black/40 rounded-lg p-1 border border-white/10">
                  {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((p) => (
                      <button
                          key={p}
                          onClick={() => handlePeriodChange(p)}
                          className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${
                              period === p 
                              ? 'bg-amber-600 text-white shadow-lg' 
                              : 'text-slate-400 hover:text-white hover:bg-white/5'
                          }`}
                      >
                          {getLabel(language, p)}
                      </button>
                  ))}
              </div>
          </div>

          <div className="max-w-3xl mx-auto space-y-8 flex-1 overflow-y-auto custom-scrollbar pr-2">
            <div className="text-center space-y-2">
                <div className="inline-block p-3 rounded-full bg-amber-500/10 border border-amber-500/20 mb-2">
                    <Star className="text-amber-400 w-8 h-8" />
                </div>
                <h2 className="text-4xl font-cinzel text-amber-100">{horoscope.sign}</h2>
                <p className="text-slate-400 font-serif italic text-lg">{horoscope.date}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="glass-panel p-4 rounded-xl flex items-center justify-between border-amber-500/10">
                  <span className="text-slate-400 text-sm uppercase tracking-wider">Lucky Color</span>
                  <span className="text-amber-300 font-bold font-serif">{horoscope.luckyColor}</span>
               </div>
               <div className="glass-panel p-4 rounded-xl flex items-center justify-between border-amber-500/10">
                  <span className="text-slate-400 text-sm uppercase tracking-wider">Mantra</span>
                  <span className="text-amber-300 font-bold font-serif italic">{horoscope.mantra}</span>
               </div>
            </div>

            <div className="space-y-6">
               <div className="bg-black/20 p-6 rounded-2xl border border-white/5">
                  <h3 className="text-lg font-cinzel text-violet-200 mb-3 flex items-center gap-2">
                    <Sparkles size={18} /> {period === 'daily' ? 'Daily' : period === 'weekly' ? 'Weekly' : period === 'monthly' ? 'Monthly' : 'Annual'} Insight
                  </h3>
                  <p className="text-slate-300 leading-relaxed font-light text-lg">
                    {horoscope.prediction}
                  </p>
               </div>

               <div className="bg-black/20 p-6 rounded-2xl border border-white/5">
                  <h3 className="text-lg font-cinzel text-cyan-200 mb-3">Spiritual Focus</h3>
                  <p className="text-slate-300 leading-relaxed font-light">
                    {horoscope.spiritualGuidance}
                  </p>
               </div>
            </div>

            {/* Disclaimer / Karma Insight */}
            <div className="glass-panel bg-amber-900/10 border border-amber-500/20 p-6 rounded-xl mt-8 flex gap-4">
                <AlertCircle className="text-amber-500 shrink-0 mt-1" size={24} />
                <div>
                    <h4 className="text-amber-400 font-bold font-cinzel text-sm uppercase tracking-widest mb-2">
                        Karma Over Destiny
                    </h4>
                    <p className="text-slate-300 text-sm leading-relaxed">
                        {horoscope.karmaPerspective}
                    </p>
                </div>
            </div>
            
            <div className="h-8"></div> {/* Bottom Spacer */}
          </div>
        </div>
      )}
    </div>
  );
};