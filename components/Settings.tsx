import React, { useState } from 'react';
import { Settings as SettingsIcon, User, Trash2, Save, Shield, AlertTriangle, Check, Cloud, LogOut, RefreshCw, Loader2, Globe } from 'lucide-react';
import { OmIcon } from './OmIcon';
import { UserProfile } from '../types';
import { SUPPORTED_LANGUAGES } from '../constants';
import { getLabel } from '../utils/translations';

interface SettingsProps {
  userProfile: UserProfile;
  setUserProfile: (profile: UserProfile) => void;
  onClearHistory: () => void;
}

// Google "G" Logo Component for authenticity
const GoogleLogo = () => (
  <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
  </svg>
);

export const Settings: React.FC<SettingsProps> = ({ userProfile, setUserProfile, onClearHistory }) => {
  const [tempName, setTempName] = useState(userProfile.name);
  const [isSaved, setIsSaved] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleSaveName = () => {
    setUserProfile({ ...userProfile, name: tempName });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setUserProfile({ ...userProfile, language: e.target.value });
  };

  const handleDelete = () => {
    onClearHistory();
    setShowDeleteConfirm(false);
  };

  const handleGoogleLogin = () => {
    setIsLoggingIn(true);
    // Simulate API call / OAuth flow
    setTimeout(() => {
        setUserProfile({
            ...userProfile,
            name: tempName || "Cosmic Traveler",
            email: `${(tempName || "devotee").toLowerCase().replace(/\s/g, '')}@gmail.com`,
            isLinked: true,
            photoUrl: "https://lh3.googleusercontent.com/a/default-user"
        });
        setIsLoggingIn(false);
    }, 2000);
  };

  const handleLogout = () => {
      setUserProfile({
          ...userProfile,
          name: '',
          email: undefined,
          isLinked: false,
          photoUrl: undefined
      });
      setTempName('');
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto rounded-none md:rounded-2xl glass-panel md:my-4 shadow-2xl overflow-y-auto custom-scrollbar border-y-0 md:border-y animate-fadeIn relative">
       {/* Background Ambient */}
       <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 via-transparent to-violet-900/10 pointer-events-none"></div>

      <div className="relative z-10 p-8 md:p-12 space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-6">
           <div className="inline-block p-4 rounded-full bg-white/5 border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.1)] mb-2">
              <SettingsIcon className="w-12 h-12 text-slate-300" />
           </div>
           <h1 className="text-3xl md:text-4xl font-cinzel text-transparent bg-clip-text bg-gradient-to-r from-slate-200 via-white to-slate-200">
              {getLabel(userProfile.language, 'cosmicConfig')}
           </h1>
           <p className="text-slate-400 font-light max-w-lg mx-auto">
              Align your experience and preserve your spiritual journey.
           </p>
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 gap-8 max-w-2xl mx-auto">
            
            {/* Language Selection Section */}
            <div className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden">
                <div className="flex items-center space-x-3 mb-6 border-b border-white/5 pb-4">
                    <Globe className="text-cyan-400" size={24} />
                    <h3 className="text-xl font-cinzel text-slate-200">{getLabel(userProfile.language, 'selectLanguage')}</h3>
                </div>
                
                <div className="space-y-4">
                    <label className="text-sm text-slate-400 font-sans uppercase tracking-wider block">Content Language</label>
                    <div className="relative">
                        <select 
                            value={userProfile.language}
                            onChange={handleLanguageChange}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all appearance-none cursor-pointer"
                        >
                            {SUPPORTED_LANGUAGES.map(lang => (
                                <option key={lang} value={lang} className="bg-slate-900 text-slate-200">
                                    {lang}
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                    </div>
                    <p className="text-xs text-slate-500 italic">
                        All wisdom, chats, and scriptures will be generated in {userProfile.language}.
                    </p>
                </div>
            </div>

            {/* Profile Edit Section */}
            <div className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden">
                <div className="flex items-center space-x-3 mb-6 border-b border-white/5 pb-4">
                    <User className="text-violet-400" size={24} />
                    <h3 className="text-xl font-cinzel text-slate-200">{getLabel(userProfile.language, 'devoteeDetails')}</h3>
                </div>
                
                <div className="space-y-4">
                    <label className="text-sm text-slate-400 font-sans uppercase tracking-wider block">{getLabel(userProfile.language, 'prefName')}</label>
                    <div className="flex gap-3">
                        <input 
                            type="text" 
                            value={tempName}
                            onChange={(e) => setTempName(e.target.value)}
                            placeholder="Enter your name..."
                            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-all placeholder-slate-600"
                        />
                        <button 
                            onClick={handleSaveName}
                            className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-xl transition-all font-bold flex items-center space-x-2 disabled:opacity-50"
                            disabled={tempName === userProfile.name && !isSaved}
                        >
                            {isSaved ? <Check size={20} /> : <Save size={20} />}
                            <span className="hidden md:inline">{isSaved ? getLabel(userProfile.language, 'saved') : getLabel(userProfile.language, 'save')}</span>
                        </button>
                    </div>
                    <p className="text-xs text-slate-500 italic">
                        The AI will address you by this name. {userProfile.isLinked && "Synced with your account."}
                    </p>
                </div>
            </div>

            {/* Account Management Section */}
            <div className={`glass-panel p-6 md:p-8 rounded-2xl border relative overflow-hidden transition-all duration-500 ${userProfile.isLinked ? 'border-emerald-500/30 bg-emerald-900/5' : 'border-white/10'}`}>
                <div className="flex items-center space-x-3 mb-6 border-b border-white/5 pb-4">
                    <Cloud className={`${userProfile.isLinked ? 'text-emerald-400' : 'text-slate-400'}`} size={24} />
                    <h3 className="text-xl font-cinzel text-slate-200">{getLabel(userProfile.language, 'accountSync')}</h3>
                    {userProfile.isLinked && (
                        <span className="ml-auto flex items-center space-x-1 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider">
                            <Check size={12} /> <span>{getLabel(userProfile.language, 'active')}</span>
                        </span>
                    )}
                </div>

                {!userProfile.isLinked ? (
                    <div className="space-y-6">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="space-y-2 text-center md:text-left">
                                <h4 className="text-slate-200 font-medium">{getLabel(userProfile.language, 'signIn')}</h4>
                                <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
                                    Connect your Google account to back up your conversations, settings, and insights to the cloud. Never lose your progress.
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex justify-center md:justify-start">
                            <button 
                                onClick={handleGoogleLogin}
                                disabled={isLoggingIn}
                                className="flex items-center bg-white hover:bg-slate-50 text-slate-800 px-6 py-3 rounded-full font-medium shadow-lg transition-all transform hover:scale-105 active:scale-95 disabled:opacity-70 disabled:scale-100"
                            >
                                {isLoggingIn ? (
                                    <>
                                        <Loader2 className="animate-spin mr-3 text-slate-600" size={20} />
                                        <span>{getLabel(userProfile.language, 'connecting')}</span>
                                    </>
                                ) : (
                                    <>
                                        <GoogleLogo />
                                        <span>{getLabel(userProfile.language, 'signIn')}</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-violet-500 to-fuchsia-500 p-[2px] shadow-lg">
                                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
                                     {userProfile.photoUrl ? (
                                         <span className="text-2xl font-cinzel text-white">{userProfile.name.charAt(0)}</span>
                                     ) : (
                                         <User size={32} className="text-white/80" />
                                     )}
                                </div>
                            </div>
                            <div className="flex-1">
                                <h4 className="text-lg text-white font-cinzel">{userProfile.name}</h4>
                                <p className="text-sm text-slate-400">{userProfile.email}</p>
                            </div>
                        </div>
                        
                        <div className="bg-black/20 rounded-xl p-4 border border-white/5 space-y-2">
                             <div className="flex items-center justify-between text-sm">
                                 <span className="text-slate-400">{getLabel(userProfile.language, 'syncStatus')}</span>
                                 <span className="text-emerald-400 flex items-center gap-1.5 font-medium"><RefreshCw size={12} className="animate-spin-slow" /> Synced just now</span>
                             </div>
                             <div className="flex items-center justify-between text-sm">
                                 <span className="text-slate-400">Storage Used</span>
                                 <span className="text-slate-200">1.2 MB / 15 GB</span>
                             </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <button 
                                onClick={handleLogout}
                                className="text-sm text-red-400 hover:text-red-300 flex items-center gap-2 px-4 py-2 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                                <LogOut size={16} />
                                <span>{getLabel(userProfile.language, 'signOut')}</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Data Management Section */}
            <div className="glass-panel p-6 rounded-2xl border border-red-500/10 relative overflow-hidden">
                <div className="flex items-center space-x-3 mb-6 border-b border-white/5 pb-4">
                    <Shield className="text-rose-400" size={24} />
                    <h3 className="text-xl font-cinzel text-slate-200">{getLabel(userProfile.language, 'dataSanctuary')}</h3>
                </div>
                
                <div className="space-y-6">
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <h4 className="text-slate-300 font-medium">Clear Local History</h4>
                            <p className="text-sm text-slate-500 max-w-xs">
                                Permanently remove all conversations stored on this device. {userProfile.isLinked ? "This will also clear your cloud backup." : ""}
                            </p>
                        </div>
                        
                        {!showDeleteConfirm ? (
                            <button 
                                onClick={() => setShowDeleteConfirm(true)}
                                className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg transition-all text-sm font-bold flex items-center space-x-2"
                            >
                                <Trash2 size={16} />
                                <span>{getLabel(userProfile.language, 'clearData')}</span>
                            </button>
                        ) : (
                            <div className="flex items-center space-x-2 animate-fadeIn">
                                <button 
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="px-3 py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleDelete}
                                    className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all shadow-[0_0_15px_rgba(220,38,38,0.4)] flex items-center space-x-1"
                                >
                                    <AlertTriangle size={12} />
                                    <span>Confirm</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </div>
        
        {/* Footer Note */}
        <div className="text-center pt-8 border-t border-white/5">
            <div className="flex justify-center mb-4">
               <OmIcon className="w-8 h-8 text-slate-700" />
            </div>
            <p className="text-slate-600 text-xs mt-2 uppercase tracking-widest">
                May your settings bring peace of mind.
            </p>
        </div>

      </div>
    </div>
  );
};