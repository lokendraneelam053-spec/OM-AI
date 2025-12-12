import React, { useState, useEffect } from 'react';
import { Gamepad2, CheckCircle2, XCircle, ChevronRight, Trophy, RefreshCw } from 'lucide-react';
import { getQuizQuestion } from '../services/geminiService';
import { QuizQuestion } from '../types';
import { OmIcon } from './OmIcon';

interface CosmicPlayProps {
  language: string;
}

export const CosmicPlay: React.FC<CosmicPlayProps> = ({ language }) => {
  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setScoreStreak] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestion = async () => {
    setLoading(true);
    setError(null);
    setSelectedOption(null);
    try {
      const data = await getQuizQuestion(language);
      setQuestion(data);
    } catch (err) {
      setError("The cosmos is currently silent. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestion();
  }, [language]); // Refresh if language changes

  const handleOptionSelect = (index: number) => {
    if (selectedOption !== null || !question) return; // Prevent changing answer

    setSelectedOption(index);
    if (index === question.correctAnswerIndex) {
      setScore((prev) => prev + 1);
      setScoreStreak((prev) => prev + 1);
    } else {
      setScoreStreak(0);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto rounded-none md:rounded-2xl glass-panel md:my-4 shadow-2xl overflow-hidden border-y-0 md:border-y relative">
      
      {/* Background Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-900/10 to-emerald-900/10 z-0"></div>

      <div className="relative z-10 flex flex-col h-full p-6 md:p-10 overflow-y-auto custom-scrollbar">
        
        {/* Header / Scoreboard */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
          <div className="flex items-center space-x-3">
             <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
               <Gamepad2 size={24} />
             </div>
             <div>
                <h2 className="text-xl font-cinzel text-slate-100">Play with Cosmos</h2>
                <p className="text-xs text-slate-500 uppercase tracking-widest">Test your Dharma</p>
             </div>
          </div>
          
          <div className="flex items-center space-x-6">
             <div className="text-center">
                <p className="text-[10px] text-slate-500 uppercase font-bold">Score</p>
                <p className="text-2xl font-cinzel text-emerald-400">{score}</p>
             </div>
             <div className="text-center">
                <p className="text-[10px] text-slate-500 uppercase font-bold">Streak</p>
                <div className="flex items-center space-x-1">
                   <p className="text-2xl font-cinzel text-amber-400">{streak}</p>
                   {streak > 2 && <Trophy size={16} className="text-amber-400 animate-bounce" />}
                </div>
             </div>
          </div>
        </div>

        {/* Game Area */}
        <div className="flex-1 flex flex-col justify-center">
           {loading && !question && (
             <div className="flex flex-col items-center justify-center space-y-10">
                {/* Rotating Cosmic Web Visualization */}
                <div className="relative w-32 h-32 flex items-center justify-center">
                   {/* Outer Galaxy Ring */}
                   <div className="absolute inset-0 rounded-full border-[1px] border-dashed border-emerald-500/30 animate-[spin_10s_linear_infinite]"></div>
                   
                   {/* Middle Orbit Ring (Reverse) */}
                   <div className="absolute inset-6 rounded-full border-[1px] border-dotted border-cyan-400/40 animate-[spin_8s_linear_infinite_reverse]"></div>
                   
                   {/* Inner Energy Field */}
                   <div className="absolute inset-12 rounded-full border border-violet-500/60 animate-pulse shadow-[0_0_30px_rgba(139,92,246,0.3)]"></div>

                   {/* Core Singularity */}
                   <div className="absolute inset-[54px] rounded-full bg-white animate-pulse shadow-[0_0_20px_rgba(255,255,255,0.8)]"></div>
                   
                   {/* Orbiting Particle 1 */}
                   <div className="absolute inset-0 animate-[spin_3s_linear_infinite]">
                      <div className="absolute top-0 left-1/2 w-2 h-2 bg-emerald-300 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.8)] -translate-x-1/2 -translate-y-1/2"></div>
                   </div>

                   {/* Orbiting Particle 2 (Slower, Larger orbit implied by inset) */}
                   <div className="absolute inset-2 animate-[spin_5s_linear_infinite_reverse]">
                      <div className="absolute bottom-0 left-1/2 w-1.5 h-1.5 bg-violet-300 rounded-full shadow-[0_0_10px_rgba(167,139,250,0.8)] -translate-x-1/2 translate-y-1/2"></div>
                   </div>
                </div>
                
                <p className="text-emerald-200/70 font-cinzel text-xs tracking-[0.4em] uppercase animate-pulse">Scanning the Cosmic Web...</p>
             </div>
           )}

           {error && (
             <div className="text-center space-y-4 py-20">
               <p className="text-red-300 font-serif">{error}</p>
               <button 
                 onClick={fetchQuestion}
                 className="px-6 py-2 bg-white/5 hover:bg-white/10 text-emerald-300 rounded-full transition-colors border border-white/10"
               >
                 Try Again
               </button>
             </div>
           )}

           {question && !loading && (
             <div className="animate-fadeIn max-w-2xl mx-auto w-full">
                
                {/* Question Card */}
                <div className="bg-black/30 p-6 md:p-8 rounded-2xl border border-white/10 shadow-lg mb-8 relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-emerald-500 to-cyan-500"></div>
                   <h3 className="text-xl md:text-2xl font-serif text-slate-100 leading-relaxed">
                      {question.question}
                   </h3>
                </div>

                {/* Options Grid */}
                <div className="grid grid-cols-1 gap-4 mb-8">
                   {question.options.map((option, idx) => {
                      const isSelected = selectedOption === idx;
                      const isCorrect = idx === question.correctAnswerIndex;
                      const showResult = selectedOption !== null;
                      
                      let buttonStyle = "border-white/10 hover:bg-white/5 text-slate-300"; // Default
                      
                      if (showResult) {
                         if (isCorrect) {
                            buttonStyle = "bg-emerald-500/20 border-emerald-500/50 text-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.2)]";
                         } else if (isSelected && !isCorrect) {
                            buttonStyle = "bg-red-500/20 border-red-500/50 text-red-100";
                         } else {
                            buttonStyle = "opacity-50 border-transparent text-slate-500";
                         }
                      }

                      return (
                         <button
                           key={idx}
                           onClick={() => handleOptionSelect(idx)}
                           disabled={showResult}
                           className={`relative p-5 text-left rounded-xl border transition-all duration-300 flex items-center justify-between group ${buttonStyle}`}
                         >
                            <span className="font-serif text-lg">{option}</span>
                            {showResult && isCorrect && <CheckCircle2 className="text-emerald-400" size={24} />}
                            {showResult && isSelected && !isCorrect && <XCircle className="text-red-400" size={24} />}
                         </button>
                      );
                   })}
                </div>

                {/* Explanation & Next Button */}
                {selectedOption !== null && (
                   <div className="animate-fadeIn space-y-6">
                      <div className="p-5 rounded-xl bg-violet-900/20 border border-violet-500/20">
                         <p className="text-xs uppercase font-bold text-violet-400 mb-2 tracking-widest">Ancient Wisdom</p>
                         <p className="text-slate-200 font-light leading-relaxed">
                            {question.explanation}
                         </p>
                      </div>

                      <div className="flex justify-end">
                         <button
                           onClick={fetchQuestion}
                           className="flex items-center space-x-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-lg shadow-emerald-500/20 transition-all transform hover:scale-105 active:scale-95"
                         >
                            <span className="font-cinzel font-bold">Next Question</span>
                            <ChevronRight size={20} />
                         </button>
                      </div>
                   </div>
                )}
             </div>
           )}
        </div>
      </div>
    </div>
  );
};