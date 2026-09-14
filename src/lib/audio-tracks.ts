export interface AudioTrack {
  id: string;
  title: string;
  artist: string;
  duration: string;
  genre: string;
  url: string; // audio source path
}

export const BUILTIN_AUDIO_TRACKS: AudioTrack[] = [
  {
    id: "acoustic-romance",
    title: "Acoustic Romance",
    artist: "Memoir Studio",
    duration: "2:45",
    genre: "Warm Acoustic",
    url: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=romantic-acoustic-guitar-112191.mp3",
  },
  {
    id: "piano-waltz",
    title: "Forever Piano Waltz",
    artist: "Memoir Studio",
    duration: "3:12",
    genre: "Emotional Piano",
    url: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=tender-love-10874.mp3",
  },
  {
    id: "lofi-sunset",
    title: "Sunset Memories",
    artist: "Memoir Chill",
    duration: "2:30",
    genre: "Lo-Fi Romance",
    url: "https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f792cb.mp3?filename=lofi-study-112191.mp3",
  },
  {
    id: "dreamy-starlight",
    title: "Under The Stars",
    artist: "Memoir Ambient",
    duration: "3:05",
    genre: "Ambient Cinematic",
    url: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=cinematic-atmosphere-score-2-22136.mp3",
  },
];

