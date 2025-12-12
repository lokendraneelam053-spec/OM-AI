import React from 'react';

export const InfinityLoader: React.FC<{ text?: string, className?: string }> = ({ text = "Connecting to the Cosmos...", className }) => (
  <div className={`flex flex-col items-center justify-center space-y-6 fade-in ${className}`}>
    <div className="relative w-40 h-20">
       <svg viewBox="0 0 130 60" className="w-full h-full drop-shadow-[0_0_15px_rgba(139,92,246,0.3)]">
         {/* Background Track - faint */}
         <path 
           d="M20,30 C20,5 50,5 65,30 C80,55 110,55 110,30 C110,5 80,5 65,30 C50,55 20,55 20,30" 
           fill="none" 
           stroke="rgba(139, 92, 246, 0.1)" 
           strokeWidth="4" 
           strokeLinecap="round"
         />
         {/* Animated Stroke */}
         <path 
           d="M20,30 C20,5 50,5 65,30 C80,55 110,55 110,30 C110,5 80,5 65,30 C50,55 20,55 20,30" 
           fill="none" 
           stroke="url(#infinityGradient)" 
           strokeWidth="4" 
           strokeLinecap="round"
           className="infinity-path"
         />
         <defs>
           <linearGradient id="infinityGradient" x1="0%" y1="0%" x2="100%" y2="0%">
             <stop offset="0%" stopColor="#8b5cf6" />
             <stop offset="50%" stopColor="#d946ef" />
             <stop offset="100%" stopColor="#06b6d4" />
           </linearGradient>
         </defs>
       </svg>
    </div>
    <p className="text-violet-200 font-cinzel text-lg animate-pulse tracking-widest text-center">{text}</p>
  </div>
);