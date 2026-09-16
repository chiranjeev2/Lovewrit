export interface AudioTrack {
  id: string;
  title: string;
  artist: string;
  duration: string;
  genre: string;
  category: "couples" | "birthday" | "memorial" | "devotional" | "social";
  url: string; // audio source path
}

export const BUILTIN_AUDIO_TRACKS: AudioTrack[] = [
  // Couples
  {
    id: "acoustic-romance",
    title: "Acoustic Romance",
    artist: "Lovewrit Studio",
    duration: "2:45",
    genre: "Warm Acoustic",
    category: "couples",
    url: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=romantic-acoustic-guitar-112191.mp3",
  },
  {
    id: "piano-waltz",
    title: "Forever Piano Waltz",
    artist: "Lovewrit Studio",
    duration: "3:12",
    genre: "Emotional Piano",
    category: "couples",
    url: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=tender-love-10874.mp3",
  },
  // Birthdays
  {
    id: "joyful-celebration",
    title: "Joyful Birthday Groove",
    artist: "Lovewrit Festive",
    duration: "2:15",
    genre: "Upbeat Pop",
    category: "birthday",
    url: "https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f792cb.mp3?filename=lofi-study-112191.mp3",
  },
  // Memorials
  {
    id: "serene-peace",
    title: "In Sacred Memory",
    artist: "Lovewrit Serenity",
    duration: "3:40",
    genre: "Tranquil Strings",
    category: "memorial",
    url: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=cinematic-atmosphere-score-2-22136.mp3",
  },
  // Devotional (Jagrata & Kirtan)
  {
    id: "sacred-bhajan",
    title: "Divine Aarti & Sitar",
    artist: "Lovewrit Devotion",
    duration: "4:10",
    genre: "Traditional Devotional",
    category: "devotional",
    url: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=romantic-acoustic-guitar-112191.mp3",
  },
  // Social & Invites
  {
    id: "chic-lounge",
    title: "High Tea Sunset Chill",
    artist: "Lovewrit Chill",
    duration: "2:50",
    genre: "Lounge Jazz",
    category: "social",
    url: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=tender-love-10874.mp3",
  },
];
