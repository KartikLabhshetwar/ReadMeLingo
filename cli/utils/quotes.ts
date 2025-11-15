const QUOTES = [
  { text: "The limits of my language mean the limits of my world.", author: "Ludwig Wittgenstein" },
  { text: "Language is the road map of a culture. It tells you where its people come from and where they are going.", author: "Rita Mae Brown" },
  { text: "To have another language is to possess a second soul.", author: "Charlemagne" },
  { text: "One language sets you in a corridor for life. Two languages open every door along the way.", author: "Frank Smith" },
  { text: "Language is the blood of the soul into which thoughts run and out of which they grow.", author: "Oliver Wendell Holmes" },
  { text: "The beautiful thing about learning is that no one can take it away from you.", author: "B.B. King" },
  { text: "Learning another language is not only learning different words for the same things, but learning another way to think about things.", author: "Flora Lewis" },
  { text: "A different language is a different vision of life.", author: "Federico Fellini" },
  { text: "If you talk to a man in a language he understands, that goes to his head. If you talk to him in his language, that goes to his heart.", author: "Nelson Mandela" },
  { text: "Language is power, life and the instrument of culture, the instrument of domination and liberation.", author: "Angela Carter" },
  { text: "The more languages you know, the more you are human.", author: "Tomáš Garrigue Masaryk" },
  { text: "Knowledge of languages is the doorway to wisdom.", author: "Roger Bacon" },
  { text: "Language shapes the way we think, and determines what we can think about.", author: "Benjamin Lee Whorf" },
  { text: "Every language is a temple, in which the soul of those who speak it is enshrined.", author: "Oliver Wendell Holmes" },
  { text: "Translation is not a matter of words only: it is a matter of making intelligible a whole culture.", author: "Anthony Burgess" },
  { text: "The art of communication is the language of leadership.", author: "James Humes" },
  { text: "Language is the dress of thought.", author: "Samuel Johnson" },
  { text: "Words are, of course, the most powerful drug used by mankind.", author: "Rudyard Kipling" },
  { text: "The way we communicate with others and with ourselves ultimately determines the quality of our lives.", author: "Tony Robbins" },
  { text: "Language is the most massive and inclusive art we know, a mountainous and anonymous work of unconscious generations.", author: "Edward Sapir" },
  { text: "The translation of one language to another is like the viewing of a painting through different colored glasses.", author: "Unknown" },
  { text: "In the end, we will remember not the words of our enemies, but the silence of our friends.", author: "Martin Luther King Jr." },
  { text: "Words have no power to impress the mind without the exquisite horror of their reality.", author: "Edgar Allan Poe" },
  { text: "The single biggest problem in communication is the illusion that it has taken place.", author: "George Bernard Shaw" },
  { text: "Language is the means of getting an idea from my brain into yours without surgery.", author: "Mark Amidon" },
];

export function getRandomQuote(): { text: string; author: string } {
  return QUOTES[Math.floor(Math.random() * QUOTES.length)];
}

export function formatQuote(quote: { text: string; author: string }): string {
  return `"${quote.text}"\n   — ${quote.author}`;
}

