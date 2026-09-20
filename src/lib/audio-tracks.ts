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
  // Devotional (Jagrata & Kirtan - Hindu)
  {
    id: "sacred-bhajan",
    title: "Divine Aarti & Sitar",
    artist: "Lovewrit Devotion",
    duration: "4:10",
    genre: "Traditional Devotional",
    category: "devotional",
    url: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=romantic-acoustic-guitar-112191.mp3",
  },
  // Devotional (Sikh)
  {
    id: "sikh-gurbani",
    title: "Peaceful Gurbani Strings",
    artist: "Lovewrit Sacred",
    duration: "3:55",
    genre: "Gurbani Sitar & Rabab",
    category: "devotional",
    url: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=romantic-acoustic-guitar-112191.mp3",
  },
  // Devotional (Muslim)
  {
    id: "muslim-oud",
    title: "Sacred Andalusian Oud",
    artist: "Lovewrit Peace",
    duration: "3:30",
    genre: "Acoustic Oud & Wind",
    category: "devotional",
    url: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=tender-love-10874.mp3",
  },
  // Devotional (Christian)
  {
    id: "christian-choral",
    title: "Celestial Choral Harmony",
    artist: "Lovewrit Grace",
    duration: "3:20",
    genre: "Soft Choral Strings",
    category: "devotional",
    url: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=cinematic-atmosphere-score-2-22136.mp3",
  },
  // Devotional (Secular)
  {
    id: "secular-acoustic",
    title: "Gentle Morning Reflections",
    artist: "Lovewrit Calm",
    duration: "2:40",
    genre: "Ambient Piano & Guitar",
    category: "devotional",
    url: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=tender-love-10874.mp3",
  },
  // Standalone Service: Letter to a Dear One
  {
    id: "quill-acoustic",
    title: "Acoustic Quill & Letters",
    artist: "Lovewrit Keepsake",
    duration: "3:05",
    genre: "Warm Nostalgic Guitar",
    category: "couples",
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
  // Apology & Love Letter Keepsake
  {
    id: "heartfelt-apology",
    title: "Soft Embers & Forgiveness",
    artist: "Lovewrit Solace",
    duration: "2:55",
    genre: "Tender Piano & Cello",
    category: "couples",
    url: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=tender-love-10874.mp3",
  },
  // Baby Shower & Godhbharai Blessings
  {
    id: "baby-lullaby-blessings",
    title: "Sweet Cradle & Flute",
    artist: "Lovewrit Joy",
    duration: "3:10",
    genre: "Soothing Lullaby & Flute",
    category: "social",
    url: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=romantic-acoustic-guitar-112191.mp3",
  },
  // Devotional Temple Bells & Aarti
  {
    id: "temple-aarti-flute",
    title: "Sacred Temple Chimes & Flute",
    artist: "Lovewrit Sacred",
    duration: "4:00",
    genre: "Divine Bansuri & Bells",
    category: "devotional",
    url: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=romantic-acoustic-guitar-112191.mp3",
  },
  // Birthday Party & Confetti Pop
  {
    id: "birthday-confetti-pop",
    title: "Celebration Pop & Horns",
    artist: "Lovewrit Party",
    duration: "2:30",
    genre: "Vibrant Celebration Funk",
    category: "birthday",
    url: "https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f792cb.mp3?filename=lofi-study-112191.mp3",
  },
];
