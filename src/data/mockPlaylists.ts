import type { Playlist } from "@/types/music";

export const mockPlaylists: Playlist[] = [
  {
    id: "playlist-hits-rapides",
    name: "Mix demarrage",
    description: "Un theme court et nerveux pour tester Devine le morceau.",
    difficulty: "easy",
    trackIds: ["track-01", "track-02", "track-03", "track-04", "track-05", "track-06"],
    accentColor: "#2dd4bf",
  },
  {
    id: "playlist-pop-culture",
    name: "Pop culture",
    description: "Anime, films, series et jeux video dans un format compact.",
    difficulty: "medium",
    trackIds: ["track-01", "track-03", "track-05", "track-06", "track-02", "track-04"],
    accentColor: "#f472b6",
  },
  {
    id: "playlist-club-neon",
    name: "Club neon",
    description: "Un mix pop, dance et electro pour enchainer les reponses.",
    difficulty: "medium",
    trackIds: ["track-02", "track-04", "track-06", "track-01", "track-05", "track-03"],
    accentColor: "#a78bfa",
  },
  {
    id: "playlist-training",
    name: "Training 25",
    description: "Un format prepare pour des sessions plus longues quand les extraits API seront branches.",
    difficulty: "easy",
    trackIds: ["track-06", "track-05", "track-04", "track-03", "track-02", "track-01"],
    accentColor: "#38bdf8",
  },
];
