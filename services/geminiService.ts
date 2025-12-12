import { GoogleGenAI, Chat, Type } from "@google/genai";
import { SYSTEM_INSTRUCTION } from '../constants';
import { WisdomData, HoroscopeData, ScriptureContent, QuizQuestion, SanskritWord, PanchangamData } from '../types';

let client: GoogleGenAI | null = null;
let chatSession: Chat | null = null;

const getClient = (): GoogleGenAI => {
  if (!client) {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API_KEY environment variable is not set");
    }
    client = new GoogleGenAI({ apiKey });
  }
  return client;
};

export const initializeChat = async (): Promise<Chat> => {
  const ai = getClient();
  chatSession = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.7, 
    },
  });
  return chatSession;
};

export const sendMessageStream = async (
  message: string, 
  onChunk: (text: string) => void
): Promise<void> => {
  if (!chatSession) {
    await initializeChat();
  }

  if (!chatSession) {
     throw new Error("Failed to initialize chat session.");
  }

  try {
    const result = await chatSession.sendMessageStream({ message });
    
    for await (const chunk of result) {
        if (chunk.text) {
            onChunk(chunk.text);
        }
    }
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    throw error;
  }
};

export const getDailyWisdom = async (language: string = "English"): Promise<WisdomData> => {
  const ai = getClient();
  
  // Randomly select a chapter (1-18) to ensure variety and prevent the model 
  // from defaulting to the most famous verses (like 2.47) repeatedly.
  const randomChapter = Math.floor(Math.random() * 18) + 1;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Generate a random, profound verse from the Bhagavad Gita, specifically from Chapter ${randomChapter}. 
    Provide the Sanskrit text, English transliteration, Translation in ${language}, and a brief, deep spiritual insight in ${language} about its application to life.`,
    config: {
      temperature: 1, // Higher temperature for variety
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          sanskrit: { type: Type.STRING, description: "The original Sanskrit verse" },
          transliteration: { type: Type.STRING, description: "English transliteration of the Sanskrit" },
          translation: { type: Type.STRING, description: `Translation of the verse in ${language}` },
          insight: { type: Type.STRING, description: `A brief spiritual insight or commentary in ${language}` },
          chapter: { type: Type.INTEGER, description: "Chapter number" },
          verse: { type: Type.INTEGER, description: "Verse number" }
        },
        required: ["sanskrit", "translation", "insight"]
      }
    }
  });

  if (response.text) {
    return JSON.parse(response.text) as WisdomData;
  }
  
  throw new Error("Failed to generate wisdom");
};

export const getHoroscope = async (sign: string, period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'daily', language: string = "English"): Promise<HoroscopeData> => {
  const ai = getClient();
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  
  let timeContext = "";
  if (period === 'daily') timeContext = `today, ${dateStr}`;
  else if (period === 'weekly') timeContext = `this week (starting ${dateStr})`;
  else if (period === 'monthly') timeContext = `this month (${now.toLocaleString('default', { month: 'long', year: 'numeric' })})`;
  else if (period === 'yearly') timeContext = `this year (${now.getFullYear()})`;

  const prompt = `
    Act as an expert Vedic Astrologer (Jyotish). Generate a ${period} horoscope for ${sign} for ${timeContext}.
    Respond entirely in ${language}.
    
    Crucial Requirement: You must highlight that astrology indicates tendencies (Prarabdha), but Human Will/Action (Purushartha) is supreme. Do not make fatalistic predictions. Focus on spiritual growth, mindfulness, and dharma.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      temperature: 0.7,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          sign: { type: Type.STRING },
          date: { type: Type.STRING, description: "The specific date or period covered (e.g., 'March 2024' or 'Week of May 1st')" },
          prediction: { type: Type.STRING, description: `General forecast focusing on energy and mindset in ${language}.` },
          spiritualGuidance: { type: Type.STRING, description: `Actionable spiritual advice in ${language}.` },
          luckyColor: { type: Type.STRING, description: `Color name in ${language}` },
          mantra: { type: Type.STRING, description: "A short mantra relevant to the energy." },
          karmaPerspective: { type: Type.STRING, description: `A reminder that their actions (karma) define their reality more than the stars in ${language}.` }
        },
        required: ["sign", "prediction", "spiritualGuidance", "karmaPerspective"]
      }
    }
  });

  if (response.text) {
    return JSON.parse(response.text) as HoroscopeData;
  }
  
  throw new Error("Failed to generate horoscope");
};

export const getPanchangam = async (language: string = "English"): Promise<PanchangamData> => {
  const ai = getClient();
  const date = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  
  const prompt = `
    Act as an expert Vedic Priest. Generate the daily Panchangam (Hindu Calendar details) for today, ${date}.
    Respond entirely in ${language}.
    Provide the Tithi (Lunar Day), Nakshatra (Star), Yoga, and Karana.
    Also provide a "Cosmic Thought" - a single philosophical sentence reflecting the energy of today's Tithi/Nakshatra.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      temperature: 0.5,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          date: { type: Type.STRING },
          tithi: { type: Type.STRING, description: `Current Tithi in ${language}` },
          nakshatra: { type: Type.STRING, description: `Current Nakshatra in ${language}` },
          yoga: { type: Type.STRING, description: `Current Yoga in ${language}` },
          karana: { type: Type.STRING, description: `Current Karana in ${language}` },
          cosmicThought: { type: Type.STRING, description: `A short spiritual thought for the day in ${language}` }
        },
        required: ["date", "tithi", "nakshatra", "yoga", "karana", "cosmicThought"]
      }
    }
  });

  if (response.text) {
    return JSON.parse(response.text) as PanchangamData;
  }
  
  throw new Error("Failed to generate panchangam");
};

export const getSanskritWord = async (language: string = "English"): Promise<SanskritWord> => {
  const ai = getClient();
  
  // Use a random seed concept by including a random number in prompt to vary results
  const randomSeed = Math.floor(Math.random() * 1000);
  
  const prompt = `
    Generate a profound, single Sanskrit word related to spirituality, yoga, dharma, or vedanta. (Seed: ${randomSeed}).
    Respond entirely in ${language} for the meaning and insight.
    Output JSON.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      temperature: 1.0,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          word: { type: Type.STRING, description: "The word in Sanskrit Devanagari script" },
          transliteration: { type: Type.STRING, description: "English transliteration (e.g., Dharma)" },
          meaning: { type: Type.STRING, description: `Literal meaning in ${language}` },
          deepMeaning: { type: Type.STRING, description: `A brief (1-2 sentence) profound spiritual insight about this word in ${language}` }
        },
        required: ["word", "transliteration", "meaning", "deepMeaning"]
      }
    }
  });

  if (response.text) {
    return JSON.parse(response.text) as SanskritWord;
  }
  
  throw new Error("Failed to generate sanskrit word");
};

export const getScriptureContent = async (scriptureName: string, requestType: 'overview' | 'story' | 'teachings', language: string = "English"): Promise<ScriptureContent> => {
  const ai = getClient();
  
  let prompt = "";
  switch (requestType) {
    case 'overview':
      prompt = `Provide a comprehensive spiritual overview of the ${scriptureName}. Discuss its origin, structure (books/kandas/parvas), main characters, and central theme. Respond in ${language}.`;
      break;
    case 'story':
      prompt = `Tell a random, significant, and spiritually uplifting story from the ${scriptureName}. Be detailed and storytelling in nature. Respond in ${language}.`;
      break;
    case 'teachings':
      prompt = `List the core spiritual teachings and philosophy of the ${scriptureName}. Use bullet points and explain how they apply to a seeker's life. Respond in ${language}.`;
      break;
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.8, // Slightly higher for storytelling
    }
  });

  if (response.text) {
    return {
      title: scriptureName,
      type: requestType,
      content: response.text
    };
  }

  throw new Error("Failed to fetch scripture content");
};

export const getQuizQuestion = async (language: string = "English"): Promise<QuizQuestion> => {
  const ai = getClient();
  
  const prompt = `
    Generate a unique, interesting, and moderately difficult multiple-choice question about Hindu scriptures (Puranas, Vedas, Mahabharata, Ramayana, Upanishads), mythology, or philosophy.
    Provide 4 distinct options.
    Ensure the explanation is educational and references the source text if possible.
    The entire content (question, options, explanation) must be in ${language}.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      temperature: 0.9, // High variance for random questions
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
            question: { type: Type.STRING },
            options: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "Exactly 4 options"
            },
            correctAnswerIndex: { 
                type: Type.INTEGER, 
                description: "Index (0-3) of the correct answer"
            },
            explanation: { type: Type.STRING }
        },
        required: ["question", "options", "correctAnswerIndex", "explanation"]
      }
    }
  });

  if (response.text) {
    return JSON.parse(response.text) as QuizQuestion;
  }
  
  throw new Error("Failed to generate quiz question");
};