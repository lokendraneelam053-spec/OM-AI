import React from 'react';
import { Sparkles, Book, Compass, Moon } from 'lucide-react';
import { SUGGESTIONS } from '../constants';
import { Suggestion } from '../types';

interface TopicsProps {
  onSelectTopic: (prompt: string) => void;
}

export const Topics: React.FC<TopicsProps> = ({ onSelectTopic }) => {
  const categories = [
    {
      title: "Philosophy & Metaphysics",
      icon: <Book className="text-violet-400" size={24} />,
      items: SUGGESTIONS.filter((_, i) => [0, 1, 5].includes(i))
    },
    {
      title: "Sadhana & Practice",
      icon: <Moon className="text-cyan-400" size={24} />,
      items: SUGGESTIONS.filter((_, i) => [6, 7].includes(i))
    },
    {
      title: "Culture & Living",
      icon: <Compass className="text-amber-400" size={24} />,
      items: SUGGESTIONS.filter((_, i) => [2, 3, 4].includes(i))
    }
  ];

  return (
    <div className="flex flex-col h-full max-w-6xl mx-auto overflow-y-auto custom-scrollbar p-6 md:p-10">
      
      <div className="text-center mb-12 fade-in">
        <h2 className="text-4xl md:text-5xl font-cinzel text-transparent bg-clip-text bg-gradient-to-r from-violet-200 via-fuchsia-200 to-amber-200 drop-shadow-[0_0_15px_rgba(139,92,246,0.5)] mb-4">
          Explore the Cosmos of Dharma
        </h2>
        <p className="text-lg text-slate-400 font-light max-w-2xl mx-auto">
          Delve into the eternal questions of existence, duty, and divinity. Select a path below to begin your dialogue with the ancient wisdom.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-20">
        {categories.map((cat, idx) => (
          <div key={idx} className="space-y-4 fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
            <div className="flex items-center space-x-3 mb-2 px-2">
              {cat.icon}
              <h3 className="text-xl font-serif text-slate-200 border-b border-white/10 pb-1 w-full">
                {cat.title}
              </h3>
            </div>
            <div className="space-y-3">
              {cat.items.map((item, i) => (
                <button
                  key={i}
                  onClick={() => onSelectTopic(item.prompt)}
                  className="w-full text-left p-4 rounded-xl glass-panel hover:bg-white/5 transition-all duration-300 group border border-white/5 hover:border-violet-500/30 hover:shadow-[0_0_20px_rgba(139,92,246,0.15)]"
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-slate-200 group-hover:text-violet-300 transition-colors mb-1 font-serif">
                      {item.title}
                    </h4>
                    <Sparkles size={14} className="text-white/20 group-hover:text-amber-400 transition-colors mt-1 opacity-0 group-hover:opacity-100" />
                  </div>
                  <p className="text-xs text-slate-500 group-hover:text-slate-400 line-clamp-2">
                    {item.prompt}
                  </p>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};