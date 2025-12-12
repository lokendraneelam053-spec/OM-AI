import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { Send, BookOpen, RefreshCw, Mic, MicOff, Plus, MessageSquare, Trash2, Sidebar, X, Volume2, StopCircle, Play, Pause, Info, AlignLeft, AlignJustify, Settings } from 'lucide-react';
import { Message, ChatSession } from '../types';
import { OmIcon } from './OmIcon';
import { getLabel } from '../utils/translations';
import { SanskritWordCard } from './SanskritWordCard';

interface ChatInterfaceProps {
  initialPrompt?: string | null;
  onClearInitialPrompt: () => void;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  onSendMessage: (text: string, mode: 'short' | 'detailed') => void;
  // Session Management Props
  sessions: ChatSession[];
  currentSessionId: string;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onDeleteChat: (e: React.MouseEvent, id: string) => void;
  onShowAbout: () => void;
  onShowSettings: () => void;
  language: string;
}

// Type definition for Web Speech API
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

// Helper to mask markdown symbols for speech while preserving length for index sync
const prepareTextForSpeech = (text: string) => {
    // Replace common markdown symbols with space to preserve index
    return text.replace(/[*#_`~>]/g, ' '); 
};

// --- Sub-components ---

interface MessageBubbleProps {
  message: Message;
  isSpeaking: boolean;
  speechIndex: number;
  onSpeak: (text: string, id: string) => void;
  onStop: () => void;
}

const MessageBubble = React.memo(({ message, isSpeaking, speechIndex, onSpeak, onStop }: MessageBubbleProps) => {
    
    // Memoize the tokenized words and basic markdown parsing
    const words = useMemo(() => {
        const result: { text: string, display: string, start: number, end: number, isBold: boolean }[] = [];
        const regex = /(\s+)/; // Split by whitespace, keeping delimiters
        const tokens = message.text.split(regex);
        
        // Find formatting ranges for Bold (**text**)
        const boldRanges: {start: number, end: number}[] = [];
        // Improved regex to handle newlines and nested asterisks correctly (lazy match)
        const boldRegex = /\*\*([\s\S]+?)\*\*/g;
        let match;
        while ((match = boldRegex.exec(message.text)) !== null) {
            boldRanges.push({start: match.index, end: match.index + match[0].length});
        }

        let charCount = 0;
        tokens.forEach(token => {
            const start = charCount;
            const end = charCount + token.length;
            
            // Determine if token falls within a bold range
            // We check if the token *overlaps* with any bold range
            const range = boldRanges.find(r => 
                (start >= r.start && start < r.end) || // Token starts in range
                (end > r.start && end <= r.end) ||     // Token ends in range
                (start <= r.start && end >= r.end)     // Token encompasses range
            );
            
            let display = token;
            let isBold = false;

            if (range) {
                isBold = true;
                // Clean formatting markers from display text
                display = display.replace(/\*\*/g, '');
            }

            result.push({
                text: token,
                display: display,
                start: start,
                end: end,
                isBold: isBold
            });
            charCount += token.length;
        });
        return result;
    }, [message.text]);

    // Calculate progress for the progress bar
    const progress = useMemo(() => {
        if (!isSpeaking || speechIndex === 0) return 0;
        return Math.min(100, (speechIndex / message.text.length) * 100);
    }, [isSpeaking, speechIndex, message.text.length]);

    return (
        <div className={`flex w-full ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
                className={`max-w-[85%] md:max-w-[75%] rounded-3xl p-5 md:p-7 backdrop-blur-xl shadow-xl border transition-all duration-300 relative overflow-hidden ${
                message.role === 'user'
                    ? 'bg-violet-600 text-white rounded-br-sm shadow-violet-900/20'
                    : `bg-slate-900/60 text-slate-100 rounded-bl-sm ${isSpeaking ? 'border-amber-500/50 shadow-[0_0_25px_rgba(245,158,11,0.2)]' : 'border-white/10'}`
                }`}
            >
                {/* Progress Bar for Active Speech */}
                {isSpeaking && (
                    <div className="absolute top-0 left-0 h-1.5 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-200 transition-all duration-300 ease-linear z-0 opacity-70" style={{ width: `${progress}%` }}></div>
                )}

                {message.role === 'model' && (
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5 relative z-10">
                        <div className="flex items-center space-x-2.5">
                            <BookOpen size={16} className={isSpeaking ? "text-amber-400" : "text-cyan-400"} />
                            <span className={`text-xs font-extrabold uppercase tracking-widest opacity-90 ${isSpeaking ? "text-amber-400" : "text-cyan-400"}`}>
                                {isSpeaking ? "Reading Aloud" : "OM AI"}
                            </span>
                        </div>
                    </div>
                )}
                
                <div className="relative z-10 text-lg md:text-xl font-normal font-sans whitespace-pre-wrap leading-loose tracking-wide text-gray-100">
                    {message.role === 'model' && !message.isStreaming ? (
                        /* Highlighted Text Rendering with Bold Support */
                        <span>
                            {words.map((token, idx) => {
                                const isActive = isSpeaking && speechIndex >= token.start && speechIndex < token.end;
                                const isWord = token.text.trim().length > 0;
                                
                                return (
                                    <span 
                                        key={idx} 
                                        className={`transition-colors duration-200 decoration-clone ${
                                            isActive && isWord
                                            ? 'bg-amber-500/30 text-white shadow-[0_0_12px_rgba(245,158,11,0.4)] rounded px-0.5' 
                                            : isActive 
                                                ? 'bg-amber-500/10' 
                                                : ''
                                        } ${token.isBold ? 'font-bold text-white' : ''}`}
                                    >
                                        {token.display}
                                    </span>
                                );
                            })}
                        </span>
                    ) : (
                         /* Standard Rendering (User / Streaming) */
                        <div className="prose prose-invert prose-lg max-w-none prose-p:leading-loose prose-strong:text-white prose-strong:font-bold">
                            {/* Improved bold parsing regex */}
                            {message.text.split(/(\*\*[\s\S]+?\*\*)/g).map((part, i) => {
                                if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
                                    return <strong key={i}>{part.slice(2, -2)}</strong>;
                                }
                                return part;
                            })}
                        </div>
                    )}
                </div>
                
                {message.isStreaming && (
                    <div className="flex space-x-1.5 mt-5 h-4 items-center opacity-70">
                        <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full typing-dot"></div>
                        <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full typing-dot"></div>
                        <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full typing-dot"></div>
                    </div>
                )}

                {/* Controls */}
                {message.role === 'model' && !message.isStreaming && (
                    <div className="flex justify-end mt-5 pt-3 border-t border-white/5 relative z-10">
                        {isSpeaking ? (
                             <button
                                onClick={onStop}
                                className="flex items-center space-x-2 px-4 py-2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition-all hover:scale-105"
                             >
                                <StopCircle size={18} />
                                <span className="text-xs font-bold uppercase tracking-wider">Stop</span>
                             </button>
                        ) : (
                            <button
                                onClick={() => onSpeak(message.text, message.id)}
                                className="flex items-center space-x-2 px-3 py-2 rounded-full text-slate-400 hover:text-cyan-300 hover:bg-white/5 transition-all opacity-80 hover:opacity-100"
                                title="Read Aloud"
                            >
                                <Volume2 size={18} />
                                <span className="text-xs font-bold uppercase tracking-wider">Read</span>
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
});


// --- Main Chat Component ---

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
    initialPrompt, 
    onClearInitialPrompt,
    messages,
    isLoading,
    error,
    onSendMessage,
    sessions,
    currentSessionId,
    onNewChat,
    onSelectChat,
    onDeleteChat,
    onShowAbout,
    onShowSettings,
    language
}) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [responseMode, setResponseMode] = useState<'short' | 'detailed'>('detailed');
  
  // Speech Synthesis State
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [currentSpeechIndex, setCurrentSpeechIndex] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasSentInitialRef = useRef(false);
  const recognitionRef = useRef<any>(null);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, speakingMessageId]); 

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setSpeechSupported(true);
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US'; // Could update based on language prop if desired

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript || interimTranscript) {
             setInputText((prev) => (prev + ' ' + finalTranscript + interimTranscript).trim());
        }
      };
      
      recognitionRef.current.onend = () => setIsListening(false);
      recognitionRef.current.onerror = (e: any) => {
          console.error("Speech Rec Error", e);
          setIsListening(false);
      };
    }
  }, []);

  // Ensure voices loaded
  useEffect(() => {
    const loadVoices = () => {
       if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          window.speechSynthesis.getVoices();
       }
    };
    loadVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    
    // Cleanup
    return () => {
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e) { console.error(e); }
    }
  };

  useEffect(() => {
    if (initialPrompt && !hasSentInitialRef.current && !isLoading) {
        onSendMessage(initialPrompt, responseMode);
        hasSentInitialRef.current = true;
        onClearInitialPrompt();
    }
  }, [initialPrompt]);

  const handleSendClick = () => {
    if (inputText.trim()) {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        }
        if ('speechSynthesis' in window) {
             window.speechSynthesis.cancel();
             setSpeakingMessageId(null);
             setCurrentSpeechIndex(0);
        }
        onSendMessage(inputText, responseMode);
        setInputText('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendClick();
    }
  };

  // --- Speech Logic ---
  const handleStopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
    setSpeakingMessageId(null);
    setCurrentSpeechIndex(0);
  }, []);

  const handleSpeak = useCallback((text: string, id: string) => {
    if (!('speechSynthesis' in window)) return;

    if (speakingMessageId === id) {
        handleStopSpeaking();
        return;
    }

    window.speechSynthesis.cancel();
    setCurrentSpeechIndex(0);

    const textToSpeak = prepareTextForSpeech(text);
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    
    speechUtteranceRef.current = utterance;

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.name.includes("Google US English")) || 
                           voices.find(v => v.lang === "en-US") || 
                           voices[0];
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onboundary = (event) => {
        if (event.name === 'word') {
            setCurrentSpeechIndex(event.charIndex);
        }
    };

    utterance.onend = () => {
        setSpeakingMessageId(null);
        setCurrentSpeechIndex(0);
        speechUtteranceRef.current = null;
    };

    utterance.onerror = (e) => {
        console.error("Speech synthesis error", e);
        setSpeakingMessageId(null);
        setCurrentSpeechIndex(0);
        speechUtteranceRef.current = null;
    };

    setSpeakingMessageId(id);
    window.speechSynthesis.speak(utterance);
  }, [speakingMessageId, handleStopSpeaking]);


  return (
    <div className="flex h-full max-w-6xl mx-auto rounded-none md:rounded-2xl overflow-hidden glass-panel border-y-0 md:border-y md:my-4 shadow-2xl relative">
      
      {/* Sidebar */}
      <div className={`absolute md:relative z-20 inset-y-0 left-0 w-80 bg-slate-950/95 md:bg-black/20 backdrop-blur-xl md:backdrop-blur-none border-r border-white/10 transform transition-transform duration-300 ease-in-out ${showSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="flex flex-col h-full p-5">
            {/* Primary Actions Group */}
            <div className="space-y-3 mb-6 shrink-0">
                <button 
                    onClick={() => { onNewChat(); setShowSidebar(false); }}
                    className="flex items-center justify-center space-x-2 w-full p-4 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl shadow-lg shadow-violet-500/20 transition-all active:scale-95 border border-violet-500/50"
                >
                    <Plus size={20} />
                    <span className="font-cinzel font-bold tracking-wide">{getLabel(language, 'newChat')}</span>
                </button>

                <button 
                    onClick={() => { onShowSettings(); setShowSidebar(false); }}
                    className="flex items-center justify-center space-x-2 w-full p-3 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl border border-white/10 transition-all active:scale-95"
                >
                    <Settings size={18} />
                    <span className="font-sans font-medium text-sm">{getLabel(language, 'settings')}</span>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 min-h-0">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 px-2">{getLabel(language, 'recentWisdom')}</p>
                {sessions.map((session) => (
                    <div 
                        key={session.id}
                        onClick={() => { onSelectChat(session.id); setShowSidebar(false); }}
                        className={`group flex items-center justify-between p-3.5 rounded-xl cursor-pointer transition-all border ${currentSessionId === session.id ? 'bg-white/10 border-violet-500/30 text-white' : 'hover:bg-white/5 border-transparent text-slate-400 hover:text-slate-200'}`}
                    >
                        <div className="flex items-center space-x-3 overflow-hidden">
                            <MessageSquare size={18} className={currentSessionId === session.id ? 'text-violet-400' : 'text-slate-600'} />
                            <span className="text-sm truncate font-sans font-medium">{session.title}</span>
                        </div>
                        <button 
                            onClick={(e) => onDeleteChat(e, session.id)}
                            className="opacity-0 group-hover:opacity-100 p-1.5 hover:text-red-400 transition-opacity rounded-md hover:bg-white/5"
                            title="Delete Chat"
                        >
                            <Trash2 size={15} />
                        </button>
                    </div>
                ))}
            </div>

            {/* About Button - Placed below chat history with shrink-0 to prevent compression */}
            <div className="mt-4 pt-4 border-t border-white/10 shrink-0">
                <button 
                    onClick={() => { onShowAbout(); setShowSidebar(false); }}
                    className="flex items-center space-x-3 w-full p-3 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-all group"
                >
                    <Info size={18} className="group-hover:text-cyan-400 transition-colors" />
                    <span className="font-sans font-medium text-sm">{getLabel(language, 'about')} OM AI</span>
                </button>
            </div>

            <button onClick={() => setShowSidebar(false)} className="md:hidden mt-4 p-2 text-slate-500 hover:text-white flex items-center justify-center shrink-0"><X size={24} /></button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full relative bg-black/10">
        
        {/* Persistent Sanskrit Word of the Day Button */}
        <SanskritWordCard language={language} />

        {showSidebar && <div className="absolute inset-0 bg-black/60 z-10 md:hidden backdrop-blur-sm" onClick={() => setShowSidebar(false)}></div>}
        <div className="md:hidden absolute top-4 left-4 z-10">
            <button onClick={() => setShowSidebar(true)} className="p-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-lg text-slate-300"><Sidebar size={20} /></button>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 pt-16 md:pt-8 custom-scrollbar">
            {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full space-y-6 fade-in px-4 py-8">
                <div className="p-10 rounded-full bg-gradient-to-tr from-violet-900/20 to-amber-900/20 border border-white/5 shadow-[0_0_50px_rgba(139,92,246,0.15)] animate-pulse-slow">
                    <OmIcon className="w-28 h-28 text-white/90 drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]" />
                </div>
                <div className="text-center max-w-lg space-y-4">
                    <h2 className="text-4xl md:text-5xl font-cinzel text-transparent bg-clip-text bg-gradient-to-r from-violet-200 to-amber-100">Awaken the Self</h2>
                    <p className="text-slate-400 font-light text-lg leading-relaxed font-sans">The cosmos is vast, but the Self is infinite. Ask your question, and let the ancient wisdom flow.</p>
                </div>
            </div>
            ) : (
                messages.map((msg) => (
                    <MessageBubble 
                        key={msg.id} 
                        message={msg} 
                        isSpeaking={speakingMessageId === msg.id}
                        speechIndex={currentSpeechIndex}
                        onSpeak={handleSpeak}
                        onStop={handleStopSpeaking}
                    />
                ))
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="glass-panel border-t border-white/10 p-4 md:p-8 bg-black/40 z-20">
            <div className="relative max-w-4xl mx-auto">
                {/* Response Mode Selector */}
                <div className="flex items-center space-x-2 mb-3 ml-1">
                    <div className="flex bg-black/40 rounded-lg p-0.5 border border-white/10">
                        <button
                            onClick={() => setResponseMode('short')}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center space-x-1.5 ${responseMode === 'short' ? 'bg-violet-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <AlignLeft size={14} />
                            <span>{getLabel(language, 'shortAnswer')}</span>
                        </button>
                        <button
                            onClick={() => setResponseMode('detailed')}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center space-x-1.5 ${responseMode === 'detailed' ? 'bg-violet-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <AlignJustify size={14} />
                            <span>{getLabel(language, 'detailedWisdom')}</span>
                        </button>
                    </div>
                </div>

                <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder={isListening ? getLabel(language, 'listening') : getLabel(language, 'inputPlaceholder')}
                    disabled={isLoading}
                    className={`w-full glass-input text-slate-100 placeholder-slate-500 rounded-2xl pl-6 pr-32 py-5 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 focus:outline-none resize-none shadow-inner h-20 max-h-40 transition-all font-sans text-lg ${isListening ? 'border-amber-500/50 ring-1 ring-amber-500/30 bg-amber-900/10' : ''}`}
                    rows={1}
                />
                <div className="absolute right-3 top-14 flex items-center space-x-2">
                    {speechSupported && (
                        <button
                            onClick={toggleListening}
                            disabled={isLoading}
                            className={`p-3.5 rounded-xl transition-all backdrop-blur-sm ${isListening ? 'bg-amber-600 hover:bg-amber-700 text-white animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white'}`}
                        >
                            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                        </button>
                    )}
                    <button
                        onClick={handleSendClick}
                        disabled={!inputText.trim() || isLoading}
                        className="p-3.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] backdrop-blur-sm"
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>
            
            <div className="flex justify-between items-center mt-4 px-2">
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-600 font-sans font-bold">{getLabel(language, 'aiDisclaimer')}</p>
                {messages.length > 0 && (
                    <button onClick={() => onNewChat()} className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-cyan-400 transition-colors md:hidden"><RefreshCw size={12} /><span>{getLabel(language, 'newChat')}</span></button>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};