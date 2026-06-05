import type { MusicTrack, PlaylistDifficulty } from "@/types/music";

const HARD_BLOCKED_TERMS = ["remix", "cover", "karaoke", "fanmade", "unofficial"];
const MEDIUM_BLOCKED_TERMS = [
  ...HARD_BLOCKED_TERMS,
  "instrumental",
  "sped up",
  "slowed",
  "nightcore",
  "tribute",
  "lullaby",
  "piano",
  "live",
  "version",
  "edit",
  "rework",
  "remake",
];
const EASY_HARD_BLOCKED_TERMS = [
  "cumbia",
  "salsa",
  "bachata",
  "merengue",
  "espanol",
  "spanish",
  "latino",
  "latin",
  "fan made",
  "unofficial",
  "lofi",
  "lo-fi",
  "nightcore",
  "slowed",
  "sped up",
  "karaoke",
  "cover",
  "remix",
  "fanmade",
];
const EASY_BLOCKED_TERMS = [
  ...MEDIUM_BLOCKED_TERMS,
  ...EASY_HARD_BLOCKED_TERMS,
  "versh",
  "tribute",
  "tribute to",
  "opening mix",
  "vibes",
  "vibe",
  "mix",
  "tabata",
  "workout",
  "fitness",
  "score",
  "original score",
  "chill",
  "ambient",
  "inspired by",
  "amalee",
  "caleb hyles",
  "dj jo",
  "geek music",
  "jonathan young",
  "kamex",
  "miura jam",
  "movie sounds unlimited",
  "natewantstobattle",
  "niyari",
  "pellek",
  "power music workout",
  "rap ar anime",
  "shiro neko",
  "soundtrack wonder band",
  "studio yuraki",
  "the hit crew",
  "the theme system",
  "tv theme players",
];
const EASY_POSITIVE_TERMS = [
  "single",
  "album",
  "original",
  "movie",
  "from",
  "feat",
];
const EASY_ALTERNATIVE_SOURCE_TERMS = [
  "8 bit",
  "8-bit",
  "acoustic",
  "arrange",
  "arranged",
  "edit",
  "extended",
  "full band",
  "guitar",
  "metal",
  "orchestra",
  "orchestral",
  "synthwave",
  "trap",
  "ukulele",
];
const FAMILY_ALIAS_TERMS = [
  ["demon slayer", "kimetsu no yaiba"],
  ["attack on titan", "shingeki no kyojin"],
  ["dragon ball z", "dbz"],
  ["pokemon"],
  ["the legend of zelda", "zelda"],
  ["pirates caribbean", "pirates of the caribbean"],
  ["la reine des neiges", "frozen"],
  ["le roi lion", "lion king"],
  ["la petite sirene", "little mermaid"],
  ["le seigneur des anneaux", "lord of the rings"],
];
const OPENING_NUMBER_TERMS: Record<string, string> = {
  first: "1",
  second: "2",
  third: "3",
  fourth: "4",
  fifth: "5",
  op: "opening",
};

export type CandidateTrack = MusicTrack & {
  familyKey?: string;
  providerRank?: number;
  seedKey?: string;
};

type ScoredTrack = CandidateTrack & {
  selectionScore: number;
};

type SelectPartyTracksOptions = {
  difficulty: PlaylistDifficulty;
  limit: number;
  recentTrackKeys?: string[];
  tracks: CandidateTrack[];
};

export function normalizeSelectionValue(value?: string) {
  return (value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function getSearchableTrackText(track: MusicTrack) {
  return normalizeSelectionValue(
    [
      track.title,
      track.artist,
      track.album,
      track.answerTitle,
      track.category,
      track.sourceTitle,
      ...(track.searchTags ?? []),
      ...(track.genres ?? []),
    ].join(" "),
  );
}

function getBlockedTerms(difficulty: PlaylistDifficulty) {
  if (difficulty === "easy") {
    return EASY_BLOCKED_TERMS;
  }

  if (difficulty === "hard") {
    return HARD_BLOCKED_TERMS;
  }

  return MEDIUM_BLOCKED_TERMS;
}

function hasBlockedTerm(track: MusicTrack, difficulty: PlaylistDifficulty) {
  const searchableText = getSearchableTrackText(track);

  return getBlockedTerms(difficulty).some((term) =>
    searchableText.includes(normalizeSelectionValue(term)),
  );
}

function hasEasyHardBlockedTerm(track: MusicTrack) {
  const searchableText = getSearchableTrackText(track);

  return EASY_HARD_BLOCKED_TERMS.some((term) =>
    searchableText.includes(normalizeSelectionValue(term)),
  );
}

function hasEasyAlternativeSourceSignal(track: MusicTrack) {
  const searchableText = getSearchableTrackText(track);

  return EASY_ALTERNATIVE_SOURCE_TERMS.some((term) =>
    searchableText.includes(normalizeSelectionValue(term)),
  );
}

export function getTrackHistoryKey(track: MusicTrack) {
  return (
    track.audioPreviewUrl ||
    `${normalizeSelectionValue(track.title)}-${normalizeSelectionValue(
      track.artist,
    )}`
  );
}

function getFamilyKey(track: CandidateTrack) {
  return getNormalizedFamilyKey(track);
}

function normalizeFamilyText(value?: string) {
  let normalizedValue = normalizeSelectionValue(value);

  FAMILY_ALIAS_TERMS.forEach(([canonicalTerm, ...aliases]) => {
    aliases.forEach((alias) => {
      normalizedValue = normalizedValue.replace(
        new RegExp(`\\b${normalizeSelectionValue(alias)}\\b`, "g"),
        canonicalTerm,
      );
    });
  });

  Object.entries(OPENING_NUMBER_TERMS).forEach(([term, replacement]) => {
    normalizedValue = normalizedValue.replace(
      new RegExp(`\\b${term}\\b`, "g"),
      replacement,
    );
  });

  return normalizedValue
    .replace(/\b(opening|theme|song|ost|op|original|soundtrack)\b/g, " ")
    .replace(/\b(season|saison|part|cour)\s+\d+\b/g, " ")
    .replace(/\b\d+(st|nd|rd|th)?\b/g, " ")
    .replace(/\b(tv|anime|movie|film|series|serie|version|full)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function getNormalizedFamilyKey(track: CandidateTrack) {
  const seedFamily = normalizeFamilyText(track.familyKey ?? track.seedKey);

  if (seedFamily) {
    return seedFamily;
  }

  const candidateFamily = normalizeFamilyText(
    [
      track.answerTitle,
      track.sourceTitle,
      track.album,
      track.title,
    ].join(" "),
  );

  return candidateFamily || normalizeSelectionValue(track.title);
}

export function filterTracksByDifficulty(
  tracks: CandidateTrack[],
  difficulty: PlaylistDifficulty,
) {
  return tracks.filter(
    (track) =>
      track.audioPreviewUrl &&
      track.title &&
      track.artist &&
      !hasBlockedTerm(track, difficulty) &&
      (difficulty !== "easy" || !hasEasyAlternativeSourceSignal(track)),
  );
}

function filterEasyRelaxedTracks(tracks: CandidateTrack[]) {
  return tracks.filter(
    (track) =>
      track.audioPreviewUrl &&
      track.title &&
      track.artist &&
      !hasEasyHardBlockedTerm(track),
  );
}

export function scoreCandidateTrack(
  track: CandidateTrack,
  difficulty: PlaylistDifficulty,
  recentTrackKeys: string[] = [],
) {
  const searchableText = getSearchableTrackText(track);
  const historyKey = getTrackHistoryKey(track);
  let score = 100;

  if (track.providerRank !== undefined) {
    score -= Math.min(track.providerRank, 25);
  }

  if (recentTrackKeys.includes(historyKey)) {
    score -= 45;
  }

  if (track.answerTitle && track.answerTitle !== track.title) {
    score += difficulty === "easy" ? 16 : 8;
  }

  if (track.artworkUrl) {
    score += 4;
  }

  if (track.sourceTitle) {
    score += 4;
  }

  if (difficulty === "easy") {
    score += EASY_POSITIVE_TERMS.some((term) =>
      searchableText.includes(normalizeSelectionValue(term)),
    )
      ? 8
      : 0;

    if (hasEasyAlternativeSourceSignal(track)) {
      score -= 80;
    }

    if (track.providerRank !== undefined && track.providerRank > 10) {
      score -= 12;
    }

    if (track.answerTitle && track.title) {
      const normalizedAnswer = normalizeSelectionValue(track.answerTitle);
      const normalizedTitle = normalizeSelectionValue(track.title);

      if (
        normalizedAnswer &&
        normalizedTitle &&
        (normalizedTitle.includes(normalizedAnswer) ||
          normalizedAnswer.includes(normalizedTitle))
      ) {
        score += 10;
      }
    }
  }

  return score + Math.random() * 20;
}

export function dedupeTracks<TTrack extends CandidateTrack>(tracks: TTrack[]) {
  const seenTracks = new Set<string>();

  return tracks.filter((track) => {
    const trackKey = getTrackHistoryKey(track);

    if (seenTracks.has(trackKey)) {
      return false;
    }

    seenTracks.add(trackKey);
    return true;
  });
}

export function dedupeByFamily(tracks: ScoredTrack[]) {
  const bestTracksByFamily = new Map<string, ScoredTrack>();

  tracks.forEach((track) => {
    const familyKey = getFamilyKey(track);
    const currentTrack = bestTracksByFamily.get(familyKey);

    if (!currentTrack || track.selectionScore > currentTrack.selectionScore) {
      bestTracksByFamily.set(familyKey, track);
    }
  });

  return Array.from(bestTracksByFamily.values());
}

function shuffleItems<T>(items: T[]) {
  const shuffledItems = [...items];

  for (let index = shuffledItems.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const currentItem = shuffledItems[index];
    shuffledItems[index] = shuffledItems[swapIndex];
    shuffledItems[swapIndex] = currentItem;
  }

  return shuffledItems;
}

export function balanceTracksByCategory(tracks: ScoredTrack[], limit: number) {
  const tracksByCategory = tracks.reduce<Record<string, ScoredTrack[]>>(
    (groups, track) => {
      const category = track.category ?? "Blindtest";

      groups[category] = [...(groups[category] ?? []), track];
      return groups;
    },
    {},
  );
  const categories = shuffleItems(Object.keys(tracksByCategory));
  const selectedTracks: ScoredTrack[] = [];
  let categoryIndex = 0;

  Object.keys(tracksByCategory).forEach((category) => {
    tracksByCategory[category] = tracksByCategory[category].sort(
      (trackA, trackB) => trackB.selectionScore - trackA.selectionScore,
    );
  });

  while (selectedTracks.length < limit && categories.length > 0) {
    const normalizedIndex = categoryIndex % categories.length;
    const category = categories[normalizedIndex];
    const nextTrack = category ? tracksByCategory[category]?.shift() : undefined;

    if (!nextTrack) {
      categories.splice(normalizedIndex, 1);
      continue;
    }

    selectedTracks.push(nextTrack);
    categoryIndex += 1;
  }

  return shuffleItems(selectedTracks).slice(0, limit);
}

export function selectPartyTracks({
  difficulty,
  limit,
  recentTrackKeys = [],
  tracks,
}: SelectPartyTracksOptions) {
  const dedupedTracks = dedupeTracks(filterTracksByDifficulty(tracks, difficulty));
  const scoredTracks = dedupedTracks
    .map((track) => ({
      ...track,
      selectionScore: scoreCandidateTrack(track, difficulty, recentTrackKeys),
    }))
    .sort((trackA, trackB) => trackB.selectionScore - trackA.selectionScore);
  const freshTracks = scoredTracks.filter(
    (track) => !recentTrackKeys.includes(getTrackHistoryKey(track)),
  );
  const preferredTracks =
    freshTracks.length >= limit ? freshTracks : [...freshTracks, ...scoredTracks];
  const familyDedupedTracks = dedupeByFamily(preferredTracks);

  if (difficulty === "easy") {
    if (familyDedupedTracks.length >= limit) {
      return balanceTracksByCategory(dedupeTracks(familyDedupedTracks), limit);
    }

    const relaxedScoredTracks = dedupeTracks(filterEasyRelaxedTracks(tracks))
      .map((track) => ({
        ...track,
        selectionScore:
          scoreCandidateTrack(track, difficulty, recentTrackKeys) - 35,
      }))
      .sort((trackA, trackB) => trackB.selectionScore - trackA.selectionScore);
    const strictHistoryKeys = new Set(
      familyDedupedTracks.map((track) => getTrackHistoryKey(track)),
    );
    const fallbackTracks = relaxedScoredTracks.filter(
      (track) => !strictHistoryKeys.has(getTrackHistoryKey(track)),
    );

    return balanceTracksByCategory(
      dedupeTracks([...familyDedupedTracks, ...fallbackTracks]),
      limit,
    );
  }

  const selectionPool =
    familyDedupedTracks.length >= limit
      ? familyDedupedTracks
      : [...familyDedupedTracks, ...preferredTracks];

  return balanceTracksByCategory(dedupeTracks(selectionPool), limit);
}
