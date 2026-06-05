import { getCategorySearchSeedEntries } from "@/data/categorySearchSeeds";
import {
  type CandidateTrack,
  normalizeSelectionValue,
  selectPartyTracks,
} from "@/features/music/trackSelection";
import type { PlaylistDifficulty } from "@/types/music";

const CANDIDATES_PER_SEED = 25;
const ANSWER_TITLE_BY_SEED_KEY: Record<string, string> = {
  aladdin: "Aladdin",
  "attack-on-titan": "Attack on Titan",
  "breaking-bad": "Breaking Bad",
  "death-note": "Death Note",
  "demon-slayer": "Demon Slayer",
  "dragon-ball-z": "Dragon Ball Z",
  encanto: "Encanto",
  "final-fantasy": "Final Fantasy",
  friends: "Friends",
  frozen: "La Reine des neiges",
  "game-of-thrones": "Game of Thrones",
  ghostbusters: "Ghostbusters",
  halo: "Halo",
  "harry-potter": "Harry Potter",
  "james-bond": "James Bond",
  "la-casa-de-papel": "La Casa de Papel",
  "lion-king": "Le Roi Lion",
  "little-mermaid": "La Petite Sirene",
  "lord-of-the-rings": "Le Seigneur des anneaux",
  mulan: "Mulan",
  naruto: "Naruto",
  "one-piece": "One Piece",
  "pirates-caribbean": "Pirates des Caraibes",
  pokemon: "Pokemon",
  rocky: "Rocky",
  "sailor-moon": "Sailor Moon",
  simpsons: "Les Simpson",
  skyrim: "Skyrim",
  sonic: "Sonic",
  "star-wars": "Star Wars",
  "stranger-things": "Stranger Things",
  "super-mario": "Super Mario",
  tetris: "Tetris",
  "the-office": "The Office",
  "toy-story": "Toy Story",
  "walking-dead": "The Walking Dead",
  zelda: "The Legend of Zelda",
};
const WORK_CATEGORY_ANSWER_CATEGORIES = [
  "Anime",
  "Disney",
  "Films",
  "Jeux video",
  "Jeux vidéo",
  "Series",
  "Séries",
];

type SearchItunesTracksOptions = {
  category: string;
  categories?: string[];
  difficulty?: PlaylistDifficulty;
  limit?: number;
  recentTrackKeys?: string[];
  term?: string;
};

type MusicProviderResult = {
  error?: string;
  tracks: CandidateTrack[];
};

type InternalMusicSearchResult = {
  artist?: string;
  artworkUrl?: string;
  audioPreviewUrl?: string;
  collectionName?: string;
  id?: number;
  primaryGenreName?: string;
  sourceTitle?: string;
  title?: string;
};

type InternalMusicSearchResponse = {
  error?: string;
  results?: InternalMusicSearchResult[];
};

type ItunesSeed = {
  category: string;
  key: string;
  query: string;
};

function isInternalMusicSearchResponse(
  value: unknown,
): value is InternalMusicSearchResponse {
  return typeof value === "object" && value !== null && "results" in value;
}

function shouldUseSeedAsAnswer(category: string) {
  const normalizedCategory = normalizeSelectionValue(category);

  return WORK_CATEGORY_ANSWER_CATEGORIES.some(
    (answerCategory) =>
      normalizeSelectionValue(answerCategory) === normalizedCategory,
  );
}

function getAnswerTitle({
  category,
  seedKey,
  track,
}: {
  category: string;
  seedKey: string;
  track: InternalMusicSearchResult;
}) {
  if (!shouldUseSeedAsAnswer(category)) {
    return track.title;
  }

  return ANSWER_TITLE_BY_SEED_KEY[seedKey] ?? track.collectionName ?? track.title;
}

async function fetchItunesTracks({
  category,
  limit,
  seedKey,
  term,
}: {
  category: string;
  limit: number;
  seedKey: string;
  term: string;
}): Promise<CandidateTrack[]> {
  const params = new URLSearchParams({
    country: "FR",
    limit: String(limit),
    term,
  });

  const response = await fetch(`/api/music/search?${params.toString()}`);

  if (!response.ok) {
    return [];
  }

  const data: unknown = await response.json();

  if (!isInternalMusicSearchResponse(data) || !Array.isArray(data.results)) {
    return [];
  }

  return data.results
    .filter((track) => track.audioPreviewUrl && track.title && track.artist)
    .map((track, index) => ({
      id: `itunes-${track.id ?? `${term}-${index}`}`,
      title: track.title ?? "Titre inconnu",
      artist: track.artist ?? "Artiste inconnu",
      answerTitle: getAnswerTitle({ category, seedKey, track }),
      audioPreviewUrl: track.audioPreviewUrl ?? "",
      artworkUrl: track.artworkUrl,
      category,
      familyKey: seedKey,
      genres: track.primaryGenreName ? [track.primaryGenreName] : undefined,
      providerRank: index,
      seedKey,
      sourceTitle: track.collectionName,
    }));
}

export async function searchItunesTracks({
  categories = [],
  category,
  difficulty = "easy",
  limit = 10,
  recentTrackKeys = [],
  term,
}: SearchItunesTracksOptions): Promise<MusicProviderResult> {
  const seededTerms = getCategorySearchSeedEntries(categories);
  const searchSeeds: ItunesSeed[] =
    seededTerms.length > 0
      ? seededTerms
      : term
        ? [{ category, key: normalizeSelectionValue(term), query: term }]
        : [];

  if (searchSeeds.length === 0) {
    return {
      error: "Aucune recherche iTunes disponible pour cette categorie.",
      tracks: [],
    };
  }

  try {
    const candidateTracks: CandidateTrack[] = [];
    const searchLimit = Math.max(
      CANDIDATES_PER_SEED,
      Math.ceil((limit * 5) / searchSeeds.length),
    );

    for (const seed of searchSeeds) {
      candidateTracks.push(
        ...(await fetchItunesTracks({
          category: seed.category,
          limit: searchLimit,
          seedKey: seed.key,
          term: seed.query,
        })),
      );
    }

    return {
      tracks: selectPartyTracks({
        difficulty,
        limit,
        recentTrackKeys,
        tracks: candidateTracks,
      }),
    };
  } catch {
    return {
      error:
        "Impossible de contacter le service de recherche musicale.",
      tracks: [],
    };
  }
}
