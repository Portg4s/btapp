import { getTrackHistoryKey } from "@/features/music/trackSelection";
import type { MusicTrack } from "@/types/music";

const RECENT_TRACKS_STORAGE_KEY = "bt:party:recent-tracks";
const MAX_RECENT_TRACKS = 80;

function canUseLocalStorage() {
  try {
    return typeof window !== "undefined" && Boolean(window.localStorage);
  } catch {
    return false;
  }
}

function readRecentTrackKeys() {
  if (!canUseLocalStorage()) {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(RECENT_TRACKS_STORAGE_KEY);
    const parsedValue: unknown = rawValue ? JSON.parse(rawValue) : [];

    return Array.isArray(parsedValue)
      ? parsedValue.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

export function getRecentTrackKeys() {
  return readRecentTrackKeys();
}

export function saveRecentPartyTracks(tracks: MusicTrack[]) {
  if (!canUseLocalStorage()) {
    return;
  }

  try {
    const nextKeys = [
      ...tracks.map((track) => getTrackHistoryKey(track)),
      ...readRecentTrackKeys(),
    ];
    const dedupedKeys = Array.from(new Set(nextKeys)).slice(0, MAX_RECENT_TRACKS);

    window.localStorage.setItem(
      RECENT_TRACKS_STORAGE_KEY,
      JSON.stringify(dedupedKeys),
    );
  } catch {
    // localStorage can be unavailable in private mode; recent history is optional.
  }
}
