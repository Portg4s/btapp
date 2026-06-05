import { PageShell } from "@/components/layout/PageShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { mockPlaylists } from "@/data/mockPlaylists";
import { GameRoundClient } from "@/features/game/GameRoundClient";
import type { MiniGameMode } from "@/types/game";
import type { Playlist, PlaylistDifficulty } from "@/types/music";

type GamePageProps = {
  searchParams: Promise<{
    count?: string | string[];
    difficulty?: string | string[];
    mode?: string | string[];
    playlistId?: string | string[];
    themes?: string | string[];
  }>;
};

const allowedQuestionCounts = [10, 15, 25];

function getSingleValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function getMiniGameMode(mode?: string | string[]): MiniGameMode {
  return getSingleValue(mode) === "artist" ? "artist" : "track";
}

function getDifficulty(difficulty?: string | string[]): PlaylistDifficulty {
  const normalizedDifficulty = getSingleValue(difficulty);

  if (
    normalizedDifficulty === "easy" ||
    normalizedDifficulty === "medium" ||
    normalizedDifficulty === "hard"
  ) {
    return normalizedDifficulty;
  }

  return "easy";
}

function getQuestionCount(count?: string | string[]) {
  const parsedCount = Number(getSingleValue(count));

  return allowedQuestionCounts.includes(parsedCount) ? parsedCount : 10;
}

function resolveSelectedThemes({
  playlistId,
  themes,
}: {
  playlistId?: string | string[];
  themes?: string | string[];
}) {
  const themeIds = (getSingleValue(themes) ?? "")
    .split(",")
    .map((themeId) => themeId.trim())
    .filter(Boolean);
  const selectedThemeIds =
    themeIds.length > 0 ? themeIds : [getSingleValue(playlistId)].filter(Boolean);
  const selectedThemes = mockPlaylists.filter((playlist) =>
    selectedThemeIds.includes(playlist.id),
  );

  if (selectedThemes.length > 0) {
    return selectedThemes;
  }

  const fallbackTheme = mockPlaylists[0];

  return fallbackTheme ? [fallbackTheme] : [];
}

function createSessionPlaylist({
  difficulty,
  questionCount,
  themes,
}: {
  difficulty: PlaylistDifficulty;
  questionCount: number;
  themes: Playlist[];
}): Playlist | undefined {
  if (themes.length === 0) {
    return undefined;
  }

  const categories = Array.from(
    new Set(themes.flatMap((theme) => theme.categories ?? [theme.name])),
  );
  const name =
    themes.length === 1
      ? themes[0]?.name ?? "Mini-jeu"
      : `${themes.length} themes`;

  return {
    accentColor: themes[0]?.accentColor,
    categories,
    description: "Session mini-jeu avec previews audio iTunes.",
    difficulty,
    id: `mini-${themes.map((theme) => theme.id).join("-")}`,
    name,
    questionCount,
    trackIds: [],
  };
}

export default async function GamePage({ searchParams }: GamePageProps) {
  const params = await searchParams;
  const selectedThemes = resolveSelectedThemes(params);
  const playlist = createSessionPlaylist({
    difficulty: getDifficulty(params.difficulty),
    questionCount: getQuestionCount(params.count),
    themes: selectedThemes,
  });
  const mode = getMiniGameMode(params.mode);

  if (!playlist) {
    return (
      <PageShell>
        <Card
          as="section"
          className="flex max-w-2xl flex-col gap-6 border-fuchsia-300/20 bg-fuchsia-300/[0.045] lg:col-span-2"
        >
          <Badge>Partie indisponible</Badge>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
              Impossible de preparer ce round.
            </h1>
            <p className="max-w-xl text-base leading-7 text-zinc-300">
              Aucun theme jouable n est disponible pour ce mini-jeu.
            </p>
          </div>
          <Button className="w-full sm:w-fit" href="/mini-games">
            Retour aux mini-jeux
          </Button>
        </Card>
      </PageShell>
    );
  }

  return (
    <GameRoundClient
      key={`${playlist.id}-${playlist.questionCount}-${playlist.difficulty}-${mode}`}
      mode={mode}
      playlist={playlist}
    />
  );
}
