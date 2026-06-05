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
          <Badge>Playlist introuvable</Badge>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
              Cette playlist ne fait pas partie du signal.
            </h1>
            <p className="max-w-xl text-base leading-7 text-zinc-300">
              Elle peut avoir ete deplacee ou ne pas encore exister dans les
              donnees mockees de BT.
            </p>
          </div>
          <Button className="w-full sm:w-fit" href="/playlists">
            Retour aux playlists
          </Button>
        </Card>
      </PageShell>
    );
  }

  const tracks = playlist.trackIds
    .map((trackId) => mockTracks.find((track) => track.id === trackId))
    .filter((track) => track !== undefined);
  const previewTracks = tracks.slice(0, 5);
  const trackCountLabel =
    tracks.length > 1 ? `${tracks.length} titres` : `${tracks.length} titre`;
  const estimatedDuration = formatEstimatedDuration(tracks.length);

  return (
    <PageShell>
      <div className="flex max-w-3xl flex-col gap-7 lg:col-span-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Badge>Pré-jeu</Badge>
          <Button className="w-full sm:w-fit" href="/playlists" variant="ghost">
            Retour aux playlists
          </Button>
        </div>

        <div className="space-y-5">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-200">
            {difficultyLabels[playlist.difficulty]}
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-white drop-shadow-[0_0_26px_rgba(34,211,238,0.18)] sm:text-5xl lg:text-6xl">
            {playlist.name}
          </h1>
          <p className="max-w-2xl text-base leading-7 text-zinc-300 sm:text-lg">
            {playlist.description}
          </p>
        </div>
      </div>

      <Card className="relative overflow-hidden border-cyan-300/20 bg-cyan-300/[0.045]">
        <div
          className="absolute inset-x-5 top-0 h-px"
          style={{ backgroundColor: playlist.accentColor ?? "#22d3ee" }}
        />
        <div
          className="mb-6 flex aspect-square items-center justify-center rounded-3xl border border-white/10"
          style={{
            background: `linear-gradient(135deg, ${playlist.accentColor ?? "#22d3ee"}38, rgba(217,70,239,0.18), rgba(5,6,17,0.92))`,
            boxShadow: `0 0 48px ${playlist.accentColor ?? "#22d3ee"}1f`,
          }}
        >
          <div className="flex h-28 w-28 items-center justify-center rounded-full border border-cyan-200/20 bg-black/20 shadow-[0_0_42px_rgba(217,70,239,0.22),inset_0_0_22px_rgba(34,211,238,0.12)]">
            <div className="h-14 w-14 rounded-full border-[14px] border-cyan-100 border-r-fuchsia-300 shadow-[0_0_24px_rgba(34,211,238,0.22)]" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Titres
            </p>
            <p className="mt-2 text-lg font-semibold text-white">
              {trackCountLabel}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Durée
            </p>
            <p className="mt-2 text-lg font-semibold text-white">
              {estimatedDuration}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Mode
            </p>
            <p className="mt-2 text-lg font-semibold text-white">Solo</p>
          </div>
        </div>
      </Card>

      <Card
        as="section"
        className="flex flex-col gap-5 border-fuchsia-300/15 bg-fuchsia-300/[0.04] lg:col-span-2"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-fuchsia-200">
              Aperçu du signal
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              Quelques morceaux de la session
            </h2>
          </div>
          <Button
            className="w-full sm:w-fit"
            href={`/game?playlistId=${playlist.id}`}
          >
            Démarrer le blindtest
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {previewTracks.map((track, index) => (
            <div
              className="rounded-2xl border border-cyan-300/12 bg-cyan-300/[0.045] p-4"
              key={track.id}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
                Track {String(index + 1).padStart(2, "0")}
              </p>
              <p className="mt-3 text-base font-semibold text-white">
                {track.title}
              </p>
              <p className="mt-1 text-sm text-zinc-400">{track.artist}</p>
            </div>
          ))}
        </div>
      </Card>
    </PageShell>
  );
}
