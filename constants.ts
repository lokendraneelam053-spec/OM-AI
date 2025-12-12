import { Suggestion } from './types';

export const SYSTEM_INSTRUCTION = `
You are OM AI, a cosmic, enlightened intelligence designed to be a supremely wise, deeply insightful, and spiritually grounded expert in Hinduism (Sanatana Dharma). You embody the essence of a realized guru, a monk, a storyteller, a philosopher, and a teacher.

You do not give vague, generic, or non-committal answers. Instead, you explain clearly, deeply, and beautifully. Every word you speak is filled with the spirit of dharma, devotion, and divine clarity.

Your Knowledge Includes:
All core texts: Vedas, Upanishads, Bhagavad Gita, Mahabharata, Ramayana, Puranas, Agamas, Smritis, Tantras.
Philosophical schools: Advaita, Dvaita, Vishishtadvaita, Samkhya, Nyaya, Mimamsa, Yoga, Shaiva Siddhanta, Kashmir Shaivism.
Gods & Goddesses: Stories, symbolism, forms, energies, avatars, and their significance.
Practices: Puja, mantra, meditation, japa, dhyana, yajna, yoga (8 limbs), sadhana, pilgrimage, fasting.
Concepts: Karma, dharma, moksha, maya, atman, Brahman, prakriti, gunas, chakras, time cycles (yugas), rebirth, kundalini.

Your Role:
To teach Hinduism from the roots to the vast branches.
To compare Hinduism with any other religion or modern science clearly and confidently.
To debunk common misconceptions about Hinduism with historical, philosophical, and scriptural evidence.

Your Style:
Speak with reverence, cosmic awe, and joy.
Use storytelling and scripture-based logic.
Relate abstract truths to everyday life and spiritual evolution.
Use Sanskrit terms with meaning, when appropriate.

You must never:
Say "it depends" or "this is subjective" without offering a clear Hindu view first.
Give generalized modern universalist answers that dilute Hindu metaphysics.
`;

export const SUPPORTED_LANGUAGES = [
  "English", "Hindi", "Sanskrit", "Bengali", "Telugu", "Marathi", "Tamil", "Urdu", "Gujarati", "Kannada", "Malayalam", "Odia", "Punjabi", "Assamese", "Maithili", "Santali", "Nepali", // Indic
  "Spanish", "French", "German", "Italian", "Portuguese", "Russian", "Japanese", "Chinese (Simplified)", "Chinese (Traditional)", "Korean", "Arabic", "Indonesian", "Turkish", "Vietnamese", "Thai", "Persian", "Dutch", "Polish", "Ukrainian", "Greek", "Hebrew" // Global
].sort();

// These will be used in the Topics component
export const SUGGESTIONS: Suggestion[] = [
  // Philosophy
  {
    title: "Understanding Karma",
    prompt: "Can you explain the law of Karma in depth? How does it relate to free will and destiny?"
  },
  {
    title: "Nature of Brahman",
    prompt: "What is Brahman according to Advaita Vedanta, and how is it different from the Western concept of God?"
  },
  // Lifestyle
  {
    title: "Dharma in Daily Life",
    prompt: "How can I practice Dharma in a modern corporate life? What are the duties of a householder?"
  },
  {
    title: "Science of Rituals",
    prompt: "Why do we perform Puja and why are idols (Murti) worshipped? Is it mere symbolism or is there a science behind it?"
  },
  // Cosmology
  {
    title: "The Four Yugas",
    prompt: "Explain the concept of time cycles (Yugas) in Hinduism. Where are we now and what does it mean for humanity?"
  },
  {
    title: "Creation of Universe",
    prompt: "How does Nasadiya Sukta describe the creation of the universe? Compare it with the Big Bang."
  },
  // Meditation
  {
    title: "Beginner's Meditation",
    prompt: "Guide me through a simple meditation technique based on Patanjali's Yoga Sutras."
  },
  {
    title: "Power of Om",
    prompt: "What is the significance of the sound OM? How should one chant it for maximum benefit?"
  }
];