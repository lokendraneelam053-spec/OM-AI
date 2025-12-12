import React from 'react';

export interface UserProfile {
  name: string;
  email?: string;
  photoUrl?: string;
  isLinked: boolean;
  language: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  isStreaming?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

export interface Suggestion {
  title: string;
  prompt: string;
}

export interface TopicCategory {
  name: string;
  icon: React.ReactNode;
  suggestions: Suggestion[];
}

export interface WisdomData {
  chapter?: number;
  verse?: number;
  sanskrit: string;
  transliteration: string;
  translation: string;
  insight: string;
}

export interface HoroscopeData {
  sign: string;
  date: string;
  prediction: string;
  spiritualGuidance: string;
  luckyColor: string;
  mantra: string;
  karmaPerspective: string; // "highlight it is not the only life"
}

export interface PanchangamData {
  date: string;
  tithi: string;
  nakshatra: string;
  yoga: string;
  karana: string;
  cosmicThought: string;
}

export interface SanskritWord {
  word: string;
  transliteration: string;
  meaning: string;
  deepMeaning: string;
}

export interface ScriptureContent {
  title: string;
  content: string;
  type: 'overview' | 'story' | 'teachings';
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}