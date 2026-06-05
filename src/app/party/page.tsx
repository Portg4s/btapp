import { PageShell } from "@/components/layout/PageShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getCategorySearchSeeds } from "@/data/categorySearchSeeds";
import { mockTracks } from "@/data/mockTracks";
import { PartyGameClient } from "@/features/party/PartyGameClient";
import type { PlaylistDifficulty } from "@/types/music";

type PartyPageProps = {
  searchParams: Promise<{
    categories?: string | string[];
    count?: string | string[];
    difficulty?: string | string[];
    guess?: string | string[];
    reveal?: string | string[];
  }>;
};

const DEFAULT_TRACK_COUNT = 50;
const DEFAULT_GUESS_DURATION_SECONDS = 15;
const DEFAULT_REVEAL_DURATION_SECONDS = 3;
const API_TEST_CATEGORY = "API Test";
const API_TEST_SEARCH_TERM = "anime opening";
const TRACK_COUNT_OPTIONS = [10, 25, 50];
const GUESS_DURATION_OPTIONS = [10, 15, 20];
const REVEAL_DURATION_OPTIONS = [3, 5];
const DIFFICULTY_OPTIONS: PlaylistDifficulty[] = ["easy", "medium", "hard"];

function getCategories(categories?: string | string[]) {
  const rawCategories = Array.isArray(categories) ? categories[0] : categories;

  return rawCategories
    ? rawCategories
        .split(",")
        .map((category) => category.trim())
        .filter(Boolean)
    : [];
}

function getSingleParam(param?: string | string[]) {
  return Array.isArray(param) ? param[0] : param;
}

function getAllowedNumber(
  param: string | string[] | undefined,
  allowedValues: number[],
  defaultValue: number,
) {
  const value = Number(getSingleParam(param));

  return allowedValues.includes(value) ? value : defaultValue;
}

function getAllowedDifficulty(
  param: string | string[] | undefined,
): PlaylistDifficulty {
  const value = getSingleParam(param);

  return DIFFICULTY_OPTIONS.includes(value as PlaylistDifficulty)
    ? (value as PlaylistDifficulty)
    : "easy";
}

export default async function PartyPage({ searchParams }: PartyPageProps) {
  const {
    categories: categoriesParam,
    count: countParam,
    difficulty: difficultyParam,
    guess: guessParam,
    reveal: revealParam,
  } = await searchParams;
  const selectedCategories = getCategories(categoriesParam);
  const trackCount = getAllowedNumber(
    countParam,
    TRACK_COUNT_OPTIONS,
    DEFAULT_TRACK_COUNT,
  );
  const guessDurationSeconds = getAllowedNumber(
    guessParam,
    GUESS_DURATION_OPTIONS,
    DEFAULT_GUESS_DURATION_SECONDS,
  );
  const revealDurationSeconds = getAllowedNumber(
    revealParam,
    REVEAL_DURATION_OPTIONS,
    DEFAULT_REVEAL_DURATION_SECONDS,
  );
  const difficulty = getAllowedDifficulty(difficultyParam);
  const usesApiTest = selectedCategories.includes(API_TEST_CATEGORY);
  const apiCategories = selectedCategories.filter(
    (category) => getCategorySearchSeeds([category]).length > 0,
  );
  const usesCategoryApi = apiCategories.length > 0;
  const usesApi = usesApiTest || usesCategoryApi;
  const localSelectedCategories = selectedCategories.filter(
    (category) =>
      category !== API_TEST_CATEGORY && !apiCategories.includes(category),
  );
  const playableTracks = mockTracks
    .filter((track) => {
      if (selectedCategories.length === 0) {
        return Boolean(track.category) && track.audioPreviewUrl.endsWith(".wav");
      }

      if (usesApi && localSelectedCategories.length === 0) {
        return false;
      }

      return track.category
        ? localSelectedCategories.includes(track.category) &&
            track.audioPreviewUrl.endsWith(".wav")
        : false;
    })
    .slice(0, trackCount);

  if (!usesApi && playableTracks.length === 0) {
    return (
      <PageShell>
        <Card
          as="section"
          className="flex max-w-2xl flex-col gap-6 border-fuchsia-300/20 bg-fuchsia-300/[0.045] lg:col-span-2"
        >
          <Badge>Aucun extrait</Badge>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
              Aucun theme jouable pour cette selection.
            </h1>
            <p className="max-w-xl text-base leading-7 text-zinc-300">
              Retourne au setup pour choisir au moins une categorie disponible.
            </p>
          </div>
          <Button className="w-full sm:w-fit" href="/party/setup">
            Choisir les themes
          </Button>
        </Card>
      </PageShell>
    );
  }

  return (
    <PartyGameClient
      apiCategories={apiCategories}
      apiCategory={
        usesCategoryApi
          ? apiCategories.join(" + ")
          : usesApiTest
            ? API_TEST_CATEGORY
            : undefined
      }
      apiSearchTerm={usesApiTest && !usesCategoryApi ? API_TEST_SEARCH_TERM : undefined}
      apiTrackLimit={trackCount}
      difficulty={difficulty}
      guessDurationSeconds={guessDurationSeconds}
      revealDurationSeconds={revealDurationSeconds}
      selectedCategories={
        selectedCategories.length > 0
          ? selectedCategories
          : Array.from(new Set(playableTracks.map((track) => track.category ?? "")))
      }
      tracks={playableTracks}
    />
  );
}
