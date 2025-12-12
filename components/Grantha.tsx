import React, { useState } from 'react';
import { Book, ChevronRight, BookOpen, Sparkles, Scroll, ArrowLeft, Library, FolderOpen } from 'lucide-react';
import { getScriptureContent } from '../services/geminiService';
import { ScriptureContent } from '../types';
import { OmIcon } from './OmIcon';
import { InfinityLoader } from './InfinityLoader';

interface Scripture {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  color: string; // Used for item card styling
}

interface ScriptureCategory {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  color: string; // Used for folder card styling
  items: Scripture[];
}

interface GranthaProps {
  language: string;
}

// Grouping scriptures into folders
const GRANTHA_COLLECTIONS: ScriptureCategory[] = [
  {
    id: 'vedas',
    title: 'The Vedas',
    subtitle: 'Sruti - That Which Is Heard',
    description: 'The most ancient and authoritative scriptures of Hinduism, containing hymns, philosophy, and rituals revealed to the Rishis.',
    color: 'from-amber-500/20 to-orange-600/20',
    items: [
      {
        id: 'rig-veda',
        title: 'Rig Veda',
        subtitle: 'The Knowledge of Verses',
        description: 'The oldest of the Vedas, containing over a thousand hymns dedicated to deities like Agni and Indra.',
        color: 'from-amber-500/10 to-orange-600/10'
      },
      {
        id: 'yajur-veda',
        title: 'Yajur Veda',
        subtitle: 'The Knowledge of Rituals',
        description: 'A compilation of ritual formulas, mantras, and prose intended for priests to perform yajnas.',
        color: 'from-orange-400/10 to-red-500/10'
      },
      {
        id: 'sama-veda',
        title: 'Sama Veda',
        subtitle: 'The Knowledge of Melodies',
        description: 'The Veda of songs and chants, serving as the roots of Indian classical music and devotional singing.',
        color: 'from-cyan-400/10 to-blue-500/10'
      },
      {
        id: 'atharva-veda',
        title: 'Atharva Veda',
        subtitle: 'The Knowledge of Daily Life',
        description: 'Contains hymns, charms, and spells for healing, protection, and the practical aspects of life.',
        color: 'from-emerald-400/10 to-green-600/10'
      }
    ]
  },
  {
    id: 'upanishads',
    title: 'The Upanishads',
    subtitle: 'Vedanta - End of Veda',
    description: 'Philosophical texts exploring the nature of Reality (Brahman), the Self (Atman), and the path to liberation.',
    color: 'from-violet-500/20 to-purple-600/20',
    items: [
      {
        id: 'isha-upanishad',
        title: 'Isha Upanishad',
        subtitle: 'The Divinity in All',
        description: 'A key text teaching that the Lord resides in everything and bridging the path of action and renunciation.',
        color: 'from-violet-500/10 to-purple-600/10'
      },
      {
        id: 'katha-upanishad',
        title: 'Katha Upanishad',
        subtitle: 'The Dialogue with Death',
        description: 'The famous dialogue between Nachiketa and Yama (Death) exploring the nature of the Self and immortality.',
        color: 'from-indigo-500/10 to-violet-600/10'
      },
      {
        id: 'chandogya-upanishad',
        title: 'Chandogya Upanishad',
        subtitle: 'Tat Tvam Asi',
        description: 'One of the oldest Upanishads, famous for the Mahavakya "That Thou Art" and the significance of OM.',
        color: 'from-sky-500/10 to-blue-600/10'
      },
      {
        id: 'brihadaranyaka-upanishad',
        title: 'Brihadaranyaka Upanishad',
        subtitle: 'The Great Forest',
        description: 'A vast philosophical text containing deep metaphysical dialogues, including "Aham Brahmasmi" (I am Brahman).',
        color: 'from-teal-500/10 to-emerald-600/10'
      },
      {
        id: 'mandukya-upanishad',
        title: 'Mandukya Upanishad',
        subtitle: 'The Sound of OM',
        description: 'A concise yet profound analysis of the syllable OM and the four states of consciousness (Turiya).',
        color: 'from-fuchsia-500/10 to-pink-600/10'
      }
    ]
  },
  {
    id: 'itihasas',
    title: 'Itihasas (Epics)',
    subtitle: 'History & Legend',
    description: 'Grand epics that convey Dharma through the lives of divine avatars and great heroes.',
    color: 'from-red-500/20 to-rose-600/20',
    items: [
      {
        id: 'bhagavad-gita',
        title: 'Bhagavad Gita',
        subtitle: 'The Song of God',
        description: 'The ultimate conversation between Krishna and Arjuna on duty, devotion, and the nature of the Self.',
        color: 'from-yellow-500/10 to-amber-600/10'
      },
      {
        id: 'ramayana',
        title: 'Ramayana',
        subtitle: 'The Path of Rama',
        description: 'The epic saga of Lord Rama, embodying Dharma, honor, and the triumph of good over evil.',
        color: 'from-sky-500/10 to-blue-600/10'
      },
      {
        id: 'mahabharata',
        title: 'Mahabharata',
        subtitle: 'The Great Epic of India',
        description: 'A colossal epic exploring the complexities of Dharma, politics, family, and war.',
        color: 'from-red-500/10 to-rose-600/10'
      }
    ]
  },
  {
    id: 'puranas',
    title: 'Puranas',
    subtitle: 'Ancient Lore',
    description: 'Vast collections of stories, cosmology, and genealogies of gods, sages, and kings.',
    color: 'from-teal-500/20 to-emerald-600/20',
    items: [
      {
        id: 'bhagavatham',
        title: 'Srimad Bhagavatam',
        subtitle: 'Bhagavata Purana',
        description: 'The crown jewel of Puranas, focusing on pure devotion (Bhakti) and the Lilas of Krishna.',
        color: 'from-teal-500/10 to-emerald-600/10'
      },
      {
        id: 'vishnu-purana',
        title: 'Vishnu Purana',
        subtitle: 'The Glory of the Preserver',
        description: 'Detailed cosmology, genealogies, and the stories of Lord Vishnu\'s avatars.',
        color: 'from-blue-500/10 to-indigo-600/10'
      },
      {
        id: 'shiva-purana',
        title: 'Shiva Purana',
        subtitle: 'The Greatness of Mahadeva',
        description: 'The legends, philosophy, and worship rituals associated with Lord Shiva.',
        color: 'from-violet-500/10 to-purple-600/10'
      },
      {
        id: 'garuda-purana',
        title: 'Garuda Purana',
        subtitle: 'The Dialogue on Afterlife',
        description: 'A conversation between Vishnu and Garuda concerning death, the afterlife, and liberation.',
        color: 'from-slate-500/10 to-zinc-600/10'
      },
      {
        id: 'kalki-purana',
        title: 'Kalki Purana',
        subtitle: 'The Prophecy of the Tenth Avatar',
        description: 'Details the future incarnation of Kalki, who will end the Kali Yuga and restore the Satya Yuga.',
        color: 'from-fuchsia-500/10 to-pink-600/10'
      }
    ]
  }
];

export const Grantha: React.FC<GranthaProps> = ({ language }) => {
  // Navigation State: Category -> Scripture -> Content
  const [selectedCategory, setSelectedCategory] = useState<ScriptureCategory | null>(null);
  const [selectedScripture, setSelectedScripture] = useState<Scripture | null>(null);
  
  const [content, setContent] = useState<ScriptureContent | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFetchContent = async (type: 'overview' | 'story' | 'teachings') => {
    if (!selectedScripture) return;
    setLoading(true);
    setContent(null);
    try {
      const data = await getScriptureContent(selectedScripture.title, type, language);
      setContent(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (selectedScripture) {
      setSelectedScripture(null);
      setContent(null);
    } else if (selectedCategory) {
      setSelectedCategory(null);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-6xl mx-auto rounded-none md:rounded-2xl glass-panel md:my-4 shadow-2xl overflow-hidden border-y-0 md:border-y relative">
      
      {/* 3. Detail View (Scripture Content) */}
      {selectedScripture ? (
        <div className="flex flex-col h-full animate-fadeIn">
          {/* Header */}
          <div className={`p-6 md:p-8 border-b border-white/10 bg-gradient-to-r ${selectedCategory?.color || 'from-slate-800 to-slate-900'} relative`}>
            <button 
                onClick={handleBack}
                className="absolute top-6 left-6 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
                title="Back to List"
            >
                <ArrowLeft size={20} />
            </button>
            <div className="flex flex-col items-center justify-center text-center mt-4">
                 <BookOpen className="w-12 h-12 text-white/80 mb-4 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]" />
                 <h2 className="text-3xl md:text-5xl font-cinzel text-white drop-shadow-md mb-2">{selectedScripture.title}</h2>
                 <p className="text-white/70 font-serif italic text-lg">{selectedScripture.subtitle}</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
             {/* Sidebar Actions */}
             <div className="w-full md:w-64 p-4 md:p-6 bg-black/20 border-b md:border-b-0 md:border-r border-white/5 space-y-3 shrink-0">
                <p className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-2 pl-2">Explore</p>
                <button 
                  onClick={() => handleFetchContent('overview')}
                  className={`w-full text-left p-3 rounded-lg flex items-center space-x-3 transition-all ${content?.type === 'overview' ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                >
                   <Book size={18} />
                   <span>Overview</span>
                </button>
                <button 
                  onClick={() => handleFetchContent('story')}
                  className={`w-full text-left p-3 rounded-lg flex items-center space-x-3 transition-all ${content?.type === 'story' ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                >
                   <Scroll size={18} />
                   <span>Random Story</span>
                </button>
                <button 
                  onClick={() => handleFetchContent('teachings')}
                  className={`w-full text-left p-3 rounded-lg flex items-center space-x-3 transition-all ${content?.type === 'teachings' ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                >
                   <Sparkles size={18} />
                   <span>Key Teachings</span>
                </button>
             </div>

             {/* Content Area */}
             <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar bg-black/10">
                {!content && !loading && (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center p-4">
                        <OmIcon className="w-24 h-24 text-slate-700/50 mb-6" />
                        <p className="text-lg font-serif italic max-w-md">
                            "The knowledge of the scriptures is the light that dispels the darkness of ignorance."
                        </p>
                        <p className="text-sm mt-4 text-slate-600 uppercase tracking-widest">Select an option from the menu</p>
                    </div>
                )}

                {loading && (
                    <div className="h-full flex flex-col items-center justify-center">
                         <InfinityLoader text="Retrieving ancient wisdom..." />
                    </div>
                )}

                {content && !loading && (
                    <div className="animate-fadeIn max-w-3xl mx-auto">
                         <div className="flex items-center space-x-2 mb-6 border-b border-white/10 pb-4">
                            <span className="p-2 rounded-lg bg-white/5 text-violet-300">
                                {content.type === 'overview' && <Book size={20} />}
                                {content.type === 'story' && <Scroll size={20} />}
                                {content.type === 'teachings' && <Sparkles size={20} />}
                            </span>
                            <h3 className="text-xl font-cinzel text-violet-100 capitalize">
                                {content.type === 'story' ? 'Divine Story' : content.type}
                            </h3>
                         </div>
                         <div className="prose prose-invert prose-lg prose-p:font-light prose-p:leading-relaxed prose-headings:font-cinzel prose-headings:text-amber-100">
                             <div className="whitespace-pre-wrap">{content.content}</div>
                         </div>
                    </div>
                )}
             </div>
          </div>
        </div>
      ) : selectedCategory ? (
        /* 2. Scripture List View (Inside Category) */
        <div className="h-full flex flex-col animate-fadeIn">
            <div className="p-6 md:p-10 pb-4">
                <button 
                     onClick={handleBack}
                     className="flex items-center space-x-2 text-sm text-slate-400 hover:text-white mb-6 transition-colors bg-white/5 hover:bg-white/10 w-fit px-3 py-2 rounded-lg"
                >
                     <ArrowLeft size={16} />
                     <span>All Collections</span>
                </button>
                <div className="flex items-center space-x-4 mb-2">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${selectedCategory.color}`}>
                        <FolderOpen className="text-white" size={24} />
                    </div>
                    <div>
                        <h2 className="text-3xl md:text-4xl font-cinzel text-white">{selectedCategory.title}</h2>
                        <p className="text-slate-400 text-sm font-serif italic">{selectedCategory.subtitle}</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
                    {selectedCategory.items.map((scripture, idx) => (
                        <div 
                            key={scripture.id}
                            className="group relative cursor-pointer fade-in"
                            style={{ animationDelay: `${idx * 50}ms` }}
                            onClick={() => setSelectedScripture(scripture)}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="relative glass-panel rounded-xl p-6 h-full border border-white/5 group-hover:border-white/20 transition-all duration-300 hover:-translate-y-1">
                                <div className={`absolute top-0 right-0 p-16 bg-gradient-to-br ${scripture.color} opacity-10 rounded-bl-[80px] rounded-tr-xl transition-opacity group-hover:opacity-20 pointer-events-none`}></div>
                                
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-2.5 rounded-lg bg-white/5 text-slate-300 group-hover:text-amber-200 transition-colors">
                                        <Book size={20} />
                                    </div>
                                    <ChevronRight className="text-slate-600 group-hover:text-white transition-colors" />
                                </div>
                                
                                <h3 className="text-xl font-cinzel text-slate-100 mb-1 group-hover:text-amber-100">{scripture.title}</h3>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">{scripture.subtitle}</p>
                                <p className="text-sm text-slate-400 font-light leading-relaxed line-clamp-3">
                                    {scripture.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      ) : (
        /* 1. Root View (Folders) */
        <div className="h-full overflow-y-auto custom-scrollbar p-6 md:p-10">
            <div className="text-center mb-12 fade-in">
                <h2 className="text-4xl md:text-5xl font-cinzel text-transparent bg-clip-text bg-gradient-to-r from-teal-200 via-emerald-200 to-cyan-200 drop-shadow-[0_0_15px_rgba(45,212,191,0.5)] mb-4">
                Sacred Grantha
                </h2>
                <p className="text-lg text-slate-400 font-light max-w-2xl mx-auto">
                Access the timeless library of Sanatana Dharma. Explore the Vedas, Upanishads, Epics, and Puranas.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-10">
                {GRANTHA_COLLECTIONS.map((category, idx) => (
                    <div 
                        key={category.id}
                        className="group relative cursor-pointer fade-in"
                        style={{ animationDelay: `${idx * 100}ms` }}
                        onClick={() => setSelectedCategory(category)}
                    >
                        <div className={`absolute inset-0 bg-gradient-to-br ${category.color} rounded-xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500`}></div>
                        <div className="relative glass-panel rounded-xl p-8 h-full border border-white/5 group-hover:border-white/20 transition-all duration-300 hover:scale-[1.01]">
                            
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center space-x-4">
                                    <div className={`p-4 rounded-xl bg-gradient-to-br ${category.color} text-white shadow-lg`}>
                                        <Library size={28} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-cinzel text-slate-100 group-hover:text-white transition-colors">{category.title}</h3>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{category.items.length} Scriptures</p>
                                    </div>
                                </div>
                                <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
                                    <ChevronRight className="text-slate-500 group-hover:text-white" />
                                </div>
                            </div>
                            
                            <p className="text-slate-400 font-light leading-relaxed text-lg mb-2">
                                {category.description}
                            </p>
                            <p className="text-sm font-serif italic text-slate-500">
                                {category.subtitle}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}
    </div>
  );
};