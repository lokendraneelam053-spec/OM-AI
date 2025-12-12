import React, { useState, useEffect } from 'react';
import { ChatInterface } from './components/ChatInterface';
import { DailyWisdom } from './components/DailyWisdom';
import { Topics } from './components/Topics';
import { DailyHoroscope } from './components/DailyHoroscope';
import { Meditation } from './components/Meditation';
import { Grantha } from './components/Grantha';
import { CosmicPlay } from './components/CosmicPlay';
import { About } from './components/About';
import { Settings } from './components/Settings';
import { InfinityLoader } from './components/InfinityLoader';
import { OmIcon } from './components/OmIcon';
import { MessageSquare, Sparkles, LayoutGrid, Sun, Wind, BookOpen, Gamepad2, Info, Settings as SettingsIcon } from 'lucide-react';
import { ChatSession, Message, UserProfile } from './types';
import { sendMessageStream } from './services/geminiService';
import { getLabel } from './utils/translations';

type View = 'topics' | 'chat' | 'wisdom' | 'horoscope' | 'meditation' | 'grantha' | 'play' | 'about' | 'settings';

// Custom Hook for Online Status
const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};

const App: React.FC = () => {
  const isOnline = useOnlineStatus();
  const [currentView, setCurrentView] = useState<View>('chat');
  const [initialPrompt, setInitialPrompt] = useState<string | null>(null);

  // Splash Screen State
  const [showSplash, setShowSplash] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Start fade out animation after 2.5s
    const timer1 = setTimeout(() => setFadeOut(true), 2500);
    // Unmount splash screen after 3.5s
    const timer2 = setTimeout(() => setShowSplash(false), 3500);
    return () => { clearTimeout(timer1); clearTimeout(timer2); };
  }, []);

  // --- Persistence Keys ---
  const STORAGE_KEY_SESSIONS = 'om_ai_sessions_v1';
  const STORAGE_KEY_USER = 'om_ai_user_v1';

  // --- User State (Persisted) ---
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY_USER);
        return saved ? JSON.parse(saved) : { name: '', isLinked: false, language: 'English' };
    } catch (e) {
        return { name: '', isLinked: false, language: 'English' };
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(userProfile));
  }, [userProfile]);

  // --- Chat Session Management (Persisted) ---
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY_SESSIONS);
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (e) {
        console.warn("Failed to load sessions from storage");
    }
    // Default initialization
    return [{
        id: Date.now().toString(),
        title: 'New Chat',
        messages: [],
        createdAt: Date.now()
    }];
  });
  
  // Auto-save sessions whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
  }, [sessions]);

  const [currentSessionId, setCurrentSessionId] = useState<string>(sessions[0].id);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ensure current session ID is valid if sessions change drastically (e.g., deletion)
  useEffect(() => {
      if (!sessions.find(s => s.id === currentSessionId)) {
          setCurrentSessionId(sessions[0]?.id || Date.now().toString());
      }
  }, [sessions, currentSessionId]);

  const currentSession = sessions.find(s => s.id === currentSessionId) || sessions[0];

  const handleCreateNewChat = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      createdAt: Date.now(),
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setError(null);
    setIsLoading(false);
  };

  const handleDeleteChat = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newSessions = sessions.filter(s => s.id !== id);
    if (newSessions.length === 0) {
        // Always keep at least one session
        const freshSession = {
            id: Date.now().toString(),
            title: 'New Chat',
            messages: [],
            createdAt: Date.now(),
        };
        setSessions([freshSession]);
        setCurrentSessionId(freshSession.id);
    } else {
        setSessions(newSessions);
        if (currentSessionId === id) {
            setCurrentSessionId(newSessions[0].id);
        }
    }
  };
  
  const handleClearAllHistory = () => {
    const freshSession = {
        id: Date.now().toString(),
        title: 'New Chat',
        messages: [],
        createdAt: Date.now(),
    };
    setSessions([freshSession]);
    setCurrentSessionId(freshSession.id);
  };

  const handleSelectChat = (id: string) => {
    setCurrentSessionId(id);
    setError(null);
    setCurrentView('chat');
  };

  const handleShowAbout = () => {
    setCurrentView('about');
  };

  const handleSendMessage = async (text: string, mode: 'short' | 'detailed' = 'detailed') => {
    if (!text.trim() || isLoading) return;

    // Add User Message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: text,
    };

    // Update Session
    setSessions(prev => prev.map(session => {
        if (session.id === currentSessionId) {
            // Generate title if it's the first message and title is generic
            const newTitle = (session.messages.length === 0 && session.title === 'New Chat') 
                ? text.slice(0, 30) + (text.length > 30 ? '...' : '') 
                : session.title;
            
            return {
                ...session,
                title: newTitle,
                messages: [...session.messages, userMessage]
            };
        }
        return session;
    }));

    setIsLoading(true);
    setError(null);

    try {
      const assistantMessageId = (Date.now() + 1).toString();
      let accumulatedText = "";

      // Add Placeholder Model Message
      setSessions(prev => prev.map(session => {
        if (session.id === currentSessionId) {
            return {
                ...session,
                messages: [...session.messages, {
                    id: assistantMessageId,
                    role: 'model',
                    text: '',
                    isStreaming: true
                }]
            };
        }
        return session;
      }));
      
      // Construct the API prompt
      // Include User Name in context if available
      const contextPrefix = userProfile.name ? `(User's Name: ${userProfile.name}) ` : '';
      
      let apiMessage = `${contextPrefix}${text}`;
      
      if (mode === 'short') {
          apiMessage = `${apiMessage}\n\n(System Instruction: Please provide a concise, short answer to this inquiry. Summarize the key spiritual points briefly without the extensive elaboration typically expected. Respond in ${userProfile.language} language.)`;
      } else {
          apiMessage = `${apiMessage}\n\n(System Instruction: Please provide a detailed, comprehensive, and spiritually deep explanation. Respond in ${userProfile.language} language.)`;
      }

      await sendMessageStream(apiMessage, (chunk) => {
        accumulatedText += chunk;
        setSessions(prev => prev.map(session => {
            if (session.id === currentSessionId) {
                return {
                    ...session,
                    messages: session.messages.map(msg => 
                        msg.id === assistantMessageId 
                        ? { ...msg, text: accumulatedText }
                        : msg
                    )
                };
            }
            return session;
        }));
      });

      // Finalize Model Message
      setSessions(prev => prev.map(session => {
        if (session.id === currentSessionId) {
            return {
                ...session,
                messages: session.messages.map(msg => 
                    msg.id === assistantMessageId 
                    ? { ...msg, isStreaming: false }
                    : msg
                )
            };
        }
        return session;
      }));

    } catch (error) {
      setError("The connection to the cosmic wisdom was interrupted. Please try again.");
    } finally {
        setIsLoading(false);
    }
  };

  // Handle Topic Selection
  const handleTopicSelect = (prompt: string) => {
    handleCreateNewChat(); // Start fresh context
    setInitialPrompt(prompt); // Pass prompt to auto-send
    setCurrentView('chat');
  };

  const handleClearInitialPrompt = () => {
    setInitialPrompt(null);
  };

  // --- Offline Block Screen ---
  if (!isOnline) {
    return (
        <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
            <InfinityLoader text="Reconnecting to the Cosmic Web..." />
            <p className="text-slate-500 mt-6 font-serif italic max-w-md">
                "The connection is paused, but the Self is eternal. Please check your internet connection."
            </p>
        </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col overflow-hidden relative selection:bg-violet-500/30 selection:text-white">
      
      {/* Splash Screen */}
      {showSplash && (
        <div 
          className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#020617] transition-opacity duration-1000 ease-in-out ${fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        >
            <div className="relative animate-[pulse_3s_ease-in-out_infinite]">
                 <div className="absolute inset-0 bg-violet-500/30 blur-[60px] rounded-full"></div>
                 <OmIcon className="w-32 h-32 md:w-48 md:h-48 text-violet-100 drop-shadow-[0_0_30px_rgba(167,139,250,0.6)] relative z-10" />
            </div>
            <div className="mt-8 text-center space-y-3">
                <h1 className="text-4xl md:text-6xl font-cinzel font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-200 via-white to-amber-200 tracking-[0.2em] drop-shadow-2xl">
                    OM AI
                </h1>
                <p className="text-slate-500 font-cinzel text-xs md:text-sm tracking-[0.5em] uppercase">
                    Cosmic Dharma Wisdom
                </p>
            </div>
        </div>
      )}

      {/* Top Navigation Bar - Glass Effect */}
      <header className="sticky top-0 z-30 border-b border-white/10 glass-panel border-x-0 border-t-0 bg-black/20">
        <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentView('chat')}>
              <div className="text-violet-100 p-2 rounded-full border border-violet-500/30 bg-violet-500/10 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                 <OmIcon className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                  <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-200 via-fuchsia-200 to-white tracking-widest font-cinzel drop-shadow-sm">
                    OM AI
                  </h1>
              </div>
            </div>

            {/* Mobile Navigation (Icon only) / Desktop Navigation (Icon + Text) */}
            <nav className="flex items-center p-1 rounded-xl glass-panel bg-black/40 overflow-x-auto no-scrollbar">
                <button
                    onClick={() => setCurrentView('chat')}
                    className={`flex items-center space-x-2 px-3 md:px-4 py-2 rounded-lg transition-all duration-300 font-cinzel text-sm tracking-wide shrink-0 ${
                        currentView === 'chat' 
                        ? 'bg-white/10 text-white shadow-[0_0_10px_rgba(255,255,255,0.1)]' 
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                    <MessageSquare size={16} />
                    <span className="hidden md:inline">{getLabel(userProfile.language, 'chat')}</span>
                </button>
                <button
                    onClick={() => setCurrentView('grantha')}
                    className={`flex items-center space-x-2 px-3 md:px-4 py-2 rounded-lg transition-all duration-300 font-cinzel text-sm tracking-wide shrink-0 ${
                        currentView === 'grantha' 
                        ? 'bg-white/10 text-white shadow-[0_0_10px_rgba(255,255,255,0.1)]' 
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                    <BookOpen size={16} />
                    <span className="hidden md:inline">{getLabel(userProfile.language, 'grantha')}</span>
                </button>
                <button
                    onClick={() => setCurrentView('horoscope')}
                    className={`flex items-center space-x-2 px-3 md:px-4 py-2 rounded-lg transition-all duration-300 font-cinzel text-sm tracking-wide shrink-0 ${
                        currentView === 'horoscope' 
                        ? 'bg-white/10 text-white shadow-[0_0_10px_rgba(255,255,255,0.1)]' 
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                    <Sun size={16} />
                    <span className="hidden md:inline">{getLabel(userProfile.language, 'horoscope')}</span>
                </button>
                 <button
                    onClick={() => setCurrentView('meditation')}
                    className={`flex items-center space-x-2 px-3 md:px-4 py-2 rounded-lg transition-all duration-300 font-cinzel text-sm tracking-wide shrink-0 ${
                        currentView === 'meditation' 
                        ? 'bg-white/10 text-white shadow-[0_0_10px_rgba(255,255,255,0.1)]' 
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                    <Wind size={16} />
                    <span className="hidden md:inline">{getLabel(userProfile.language, 'meditation')}</span>
                </button>
                <button
                    onClick={() => setCurrentView('play')}
                    className={`flex items-center space-x-2 px-3 md:px-4 py-2 rounded-lg transition-all duration-300 font-cinzel text-sm tracking-wide shrink-0 ${
                        currentView === 'play' 
                        ? 'bg-white/10 text-white shadow-[0_0_10px_rgba(255,255,255,0.1)]' 
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                    <Gamepad2 size={16} />
                    <span className="hidden md:inline">{getLabel(userProfile.language, 'play')}</span>
                </button>
                <button
                    onClick={() => setCurrentView('topics')}
                    className={`flex items-center space-x-2 px-3 md:px-4 py-2 rounded-lg transition-all duration-300 font-cinzel text-sm tracking-wide shrink-0 ${
                        currentView === 'topics' 
                        ? 'bg-white/10 text-white shadow-[0_0_10px_rgba(255,255,255,0.1)]' 
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                    <LayoutGrid size={16} />
                    <span className="hidden md:inline">{getLabel(userProfile.language, 'topics')}</span>
                </button>
                <button
                    onClick={() => setCurrentView('wisdom')}
                    className={`flex items-center space-x-2 px-3 md:px-4 py-2 rounded-lg transition-all duration-300 font-cinzel text-sm tracking-wide shrink-0 ${
                        currentView === 'wisdom' 
                        ? 'bg-white/10 text-white shadow-[0_0_10px_rgba(255,255,255,0.1)]' 
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                    <Sparkles size={16} />
                    <span className="hidden md:inline">{getLabel(userProfile.language, 'wisdom')}</span>
                </button>
                <button
                    onClick={() => setCurrentView('about')}
                    className={`flex items-center space-x-2 px-3 md:px-4 py-2 rounded-lg transition-all duration-300 font-cinzel text-sm tracking-wide shrink-0 ${
                        currentView === 'about' 
                        ? 'bg-white/10 text-white shadow-[0_0_10px_rgba(255,255,255,0.1)]' 
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                    <Info size={16} />
                    <span className="hidden md:inline">{getLabel(userProfile.language, 'about')}</span>
                </button>
                 <button
                    onClick={() => setCurrentView('settings')}
                    className={`flex items-center space-x-2 px-3 md:px-4 py-2 rounded-lg transition-all duration-300 font-cinzel text-sm tracking-wide shrink-0 ${
                        currentView === 'settings' 
                        ? 'bg-white/10 text-white shadow-[0_0_10px_rgba(255,255,255,0.1)]' 
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                    <SettingsIcon size={16} />
                    <span className="hidden md:inline">{getLabel(userProfile.language, 'settings')}</span>
                </button>
            </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative max-w-6xl mx-auto w-full">
        {currentView === 'chat' && (
            <div className="absolute inset-0 z-10 animate-fadeIn">
                <ChatInterface 
                    initialPrompt={initialPrompt} 
                    onClearInitialPrompt={handleClearInitialPrompt}
                    messages={currentSession.messages}
                    isLoading={isLoading}
                    error={error}
                    onSendMessage={handleSendMessage}
                    sessions={sessions}
                    currentSessionId={currentSessionId}
                    onNewChat={handleCreateNewChat}
                    onSelectChat={handleSelectChat}
                    onDeleteChat={handleDeleteChat}
                    onShowAbout={handleShowAbout}
                    onShowSettings={() => setCurrentView('settings')}
                    language={userProfile.language}
                />
            </div>
        )}
        {currentView === 'grantha' && (
            <div className="absolute inset-0 z-10 animate-fadeIn">
                <Grantha language={userProfile.language} />
            </div>
        )}
        {currentView === 'horoscope' && (
            <div className="absolute inset-0 z-10 animate-fadeIn">
                <DailyHoroscope language={userProfile.language} />
            </div>
        )}
        {currentView === 'meditation' && (
            <div className="absolute inset-0 z-10 animate-fadeIn">
                <Meditation />
            </div>
        )}
         {currentView === 'play' && (
            <div className="absolute inset-0 z-10 animate-fadeIn">
                <CosmicPlay language={userProfile.language} />
            </div>
        )}
        {currentView === 'topics' && (
            <div className="absolute inset-0 z-10 animate-fadeIn">
                <Topics onSelectTopic={handleTopicSelect} />
            </div>
        )}
        {currentView === 'wisdom' && (
            <div className="absolute inset-0 z-10 animate-fadeIn">
                <DailyWisdom language={userProfile.language} />
            </div>
        )}
        {currentView === 'about' && (
            <div className="absolute inset-0 z-10 animate-fadeIn">
                <About />
            </div>
        )}
        {currentView === 'settings' && (
            <div className="absolute inset-0 z-10 animate-fadeIn">
                <Settings 
                    userProfile={userProfile}
                    setUserProfile={setUserProfile}
                    onClearHistory={handleClearAllHistory}
                />
            </div>
        )}
      </main>

      {/* Global Footer */}
      <footer className="w-full py-1.5 text-center bg-black/40 backdrop-blur-md border-t border-white/5 z-20">
          <p className="text-[9px] md:text-[10px] text-slate-500/50 font-cinzel tracking-[0.2em] uppercase">
            @Powered by INFINITELY UNANIMOUS Studios
          </p>
      </footer>

    </div>
  );
};

export default App;