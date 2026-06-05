export type PlaylistDifficulty = "easy" | "medium" | "hard";

export type MusicTrack = {
  id: string;
  title: string;
  artist: string;
  audioPreviewUrl: string;
  answerTitle?: string;
  category?: string;
  sourceTitle?: string;
  revealImageUrl?: string;
  artworkUrl?: string;
  album?: string;
  year?: number;
  genres?: string[];
  durationSeconds?: number;
};

export type Playlist = {
  id: string;
  name: string;
  description: string;
  difficulty: PlaylistDifficulty;
  trackIds: string[];
  coverUrl?: string;
  accentColor?: string;
};
