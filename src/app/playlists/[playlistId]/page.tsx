import { PageShell } from "@/components/layout/PageShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { mockPlaylists } from "@/data/mockPlaylists";
import { mockTracks } from "@/data/mockTracks";
import type { Playlist } from "@/types/music";

const difficultyLabels: Record<Playlist["difficulty"], string> = {
  easy: "Facile",
  medium: "Intermediaire",
  hard: "Difficile",
};

type PlaylistDetailPageProps = {
  params: Promise<{
    playlistId: string;
  }>;
};

function formatEstimatedDuration(trackCount: number) {
  const secondsPerRound = 30;
  const totalSeconds = trackCount * secondsPerRound;
  const minutes = Math.ceil(totalSeconds / 60);

  return minutes > 1 ? `${minutes} min` : "1 min";
}

export function generateStaticParams() {
  return mockPlaylists.map((playlist) => ({
    playlistId: playlist.id,
  }));
}

export default async function PlaylistDetailPage({
  params,
}: PlaylistDetailPageProps) {
  const { playlistId } = await params;
  const playlist = mockPlaylists.find((item) => item.id === playlistId);

  if (!playlist) {
    return (
      <PageShell>
        <Card
          as="section"
          className="flex max-w-2xl flex-col gap-6 border-fuchsia-300/20 bg-fuchsia-300/[0.045] lg:col-span-2"
        >
          <Badge>Theme introuvable</Badge>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
              Ce theme ne fait pas partie du signal.
            </h1>
            <p className="max-w-xl text-base leading-7 text-zinc-300">
              Il peut avoir ete deplace ou ne pas encore etre disponible.
            </p>
          </div>
          <Button className="w-full sm:w-fit" href="/playlists">
            Retour aux themes
          </Button>
        </Card>
      </PageShell>
    );
  }

  const fallbackTracks = playlist.trackIds
    .map((trackId) => mockTracks.find((track) => track.id === trackId))
    .filter((track) => track !== undefined);
  const questionCount = playlist.questionCount ?? fallbackTracks.length;
  const trackCountLabel =
    questionCount > 1 ? `${questionCount} questions` : `${questionCount} question`;
  const estimatedDuration = formatEstimatedDuration(questionCount);
  const categories =
    playlist.categories && playlist.categories.length > 0
      ? playlist.categories
      : Array.from(
          new Set(fallbackTracks.map((track) => track.category).filter(Boolean)),
        );

  return (
    <PageShell>
      <div className="flex max-w-3xl flex-col gap-6 lg:col-span-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Badge>Pre-jeu</Badge>
          <Button className="w-full sm:w-fit" href="/playlists" variant="ghost">
            Retour aux themes
          </Button>
        </div>

        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-200">
            {difficultyLabels[playlist.difficulty]}
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-white drop-shadow-[0_0_26px_rgba(34,211,238,0.18)] sm:text-5xl lg:text-6xl">
            {playlist.name}
          </h1>
          <p className="max-w-2xl text-base leading-7 text-zinc-300">
            {playlist.description}
          </p>
        </div>
      </div>

      <Card className="relative overflow-hidden border-cyan-300/20 bg-cyan-300/[0.045] lg:col-span-2">
        <div
          className="absolute inset-x-5 top-0 h-px"
          style={{ backgroundColor: playlist.accentColor ?? "#22d3ee" }}
        />
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div
            className="flex min-h-44 items-center justify-center rounded-3xl border border-white/10"
            style={{
              background: `linear-gradient(135deg, ${playlist.accentColor ?? "#22d3ee"}38, rgba(217,70,239,0.18), rgba(5,6,17,0.92))`,
              boxShadow: `0 0 48px ${playlist.accentColor ?? "#22d3ee"}1f`,
            }}
          >
            <div className="flex h-24 w-24 items-center justify-center rounded-full border border-cyan-200/20 bg-black/20 shadow-[0_0_42px_rgba(217,70,239,0.22),inset_0_0_22px_rgba(34,211,238,0.12)]">
              <div className="h-12 w-12 rounded-full border-[12px] border-cyan-100 border-r-fuchsia-300 shadow-[0_0_24px_rgba(34,211,238,0.22)]" />
            </div>
          </div>

          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-2">
              <SummaryItem label="Questions" value={trackCountLabel} />
              <SummaryItem label="Duree" value={estimatedDuration} />
              <SummaryItem label="Mode" value="Titre" />
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <span
                  className="rounded-full border border-cyan-300/15 bg-cyan-300/[0.06] px-3 py-1 text-xs font-semibold text-cyan-100"
                  key={category}
                >
                  {category}
                </span>
              ))}
            </div>

            <Button
              className="w-full sm:w-fit"
              href={`/game?playlistId=${playlist.id}`}
            >
              Preparer les extraits
            </Button>
          </div>
        </div>
      </Card>
    </PageShell>
  );
}

type SummaryItemProps = {
  label: string;
  value: string;
};

function SummaryItem({ label, value }: SummaryItemProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-zinc-500">
        {label}
      </p>
      <p className="mt-2 text-base font-semibold text-white">{value}</p>
    </div>
  );
}
