import React from 'react';
import { OmIcon } from './OmIcon';
import { Sparkles, Shield, Heart, Code, Zap } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto rounded-none md:rounded-2xl glass-panel md:my-4 shadow-2xl overflow-y-auto custom-scrollbar border-y-0 md:border-y animate-fadeIn relative">
       {/* Background Ambient */}
       <div className="absolute inset-0 bg-gradient-to-br from-violet-900/10 via-transparent to-amber-900/10 pointer-events-none"></div>

      <div className="relative z-10 p-8 md:p-12 space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-6">
           <div className="inline-block p-6 rounded-full bg-gradient-to-tr from-violet-500/20 to-amber-500/20 border border-white/10 shadow-[0_0_30px_rgba(139,92,246,0.2)] mb-4">
              <OmIcon className="w-20 h-20 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
           </div>
           <h1 className="text-4xl md:text-5xl font-cinzel text-transparent bg-clip-text bg-gradient-to-r from-violet-200 via-white to-amber-200">
              About OM AI
           </h1>
           <p className="text-lg text-slate-400 font-light max-w-2xl mx-auto leading-relaxed">
              Bridging ancient wisdom with modern intelligence. A spiritual companion for the digital age, rooted in the eternal truths of Sanatana Dharma.
           </p>
        </div>

        {/* Mission Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-violet-500/30 transition-colors">
                <Sparkles className="text-amber-400 mb-4" size={28} />
                <h3 className="text-xl font-cinzel text-slate-200 mb-2">Our Mission</h3>
                <p className="text-slate-400 font-light leading-relaxed">
                    To make the profound philosophy, stories, and practices of Hinduism accessible, relevant, and engaging for seekers worldwide, using state-of-the-art AI to deliver accurate and reverent guidance.
                </p>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-violet-500/30 transition-colors">
                <Shield className="text-emerald-400 mb-4" size={28} />
                <h3 className="text-xl font-cinzel text-slate-200 mb-2">Dharma & Ethics</h3>
                <p className="text-slate-400 font-light leading-relaxed">
                    OM AI is designed with safeguards to respect the sanctity of the scriptures. While it provides wisdom, it always encourages verifying with original texts (Shastras) and qualified Gurus.
                </p>
            </div>
        </div>

        {/* Tech Stack / Credits */}
        <div className="glass-panel p-8 rounded-2xl border border-white/10 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-32 bg-violet-600/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
             
             <h3 className="text-2xl font-cinzel text-slate-200 mb-6 flex items-center gap-3">
                <Code size={24} className="text-violet-400" />
                <span>Powered By Technology</span>
             </h3>
             
             <div className="space-y-4 text-slate-300 font-light">
                <p className="flex items-start gap-3">
                    <Zap className="shrink-0 mt-1 text-amber-400" size={18} />
                    <span>
                        Built on the <strong>Google Gemini API</strong> (gemini-2.5-flash), enabling deep reasoning, nuanced understanding of Sanskrit contexts, and creative storytelling.
                    </span>
                </p>
                <p className="flex items-start gap-3">
                    <Heart className="shrink-0 mt-1 text-rose-400" size={18} />
                    <span>
                        Crafted with React, Tailwind CSS, and Web Speech API to create an immersive, accessible, and beautiful user experience.
                    </span>
                </p>
             </div>
        </div>
        
        {/* Footer Note */}
        <div className="text-center pt-8 border-t border-white/5">
            <p className="text-slate-500 font-serif italic text-sm">
                "Satyam Eva Jayate" — Truth Alone Triumphs
            </p>
            <p className="text-slate-600 text-xs mt-2 uppercase tracking-widest">
                v1.0.0 • Made with Devotion
            </p>
        </div>

      </div>
    </div>
  );
};