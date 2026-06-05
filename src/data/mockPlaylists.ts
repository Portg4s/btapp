import type { Playlist } from "@/types/music";

export const mockPlaylists: Playlist[] = [
  {
    id: "playlist-hits-rapides",
    name: "Hits rapides",
    description: "Une selection courte pour lancer une partie sans reflechir.",
    difficulty: "easy",
    trackIds: ["track-01", "track-02", "track-03", "track-04"],
    accentColor: "#2dd4bf",
  },
  {
    id: "playlist-annees-2000",
    name: "Annees 2000",
    description: "Des titres fictifs inspires des sonorites pop du debut des annees 2000.",
    difficulty: "medium",
    trackIds: ["track-02", "track-03", "track-07", "track-10"],
    accentColor: "#f472b6",
  },
  {
    id: "playlist-rap-rnb",
    name: "Rap & RnB",
    description: "Un mix urbain pour tester les refrains, flows et ambiances.",
    difficulty: "medium",
    trackIds: ["track-04", "track-05", "track-09", "track-11"],
    accentColor: "#a78bfa",
  },
  {
    id: "playlist-pop-internationale",
    name: "Pop internationale",
    description: "Une playlist accessible avec des melodies pop et electro.",
    difficulty: "easy",
    trackIds: ["track-01", "track-02", "track-06", "track-08", "track-12"],
    accentColor: "#38bdf8",
  },
];
