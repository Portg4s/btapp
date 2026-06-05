import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { Playlist } from "@/types/music";

const difficultyLabels: Record<Playlist["difficulty"], string> = {
  easy: "Facile",
  medium: "Intermediaire",
  hard: "Difficile",
};

type PlaylistCardProps = {
  playlist: Playlist;
};

export function PlaylistCard({ playlist }: PlaylistCardProps) {
  const trackCountLabel =
    playlist.trackIds.length > 1
      ? `${playlist.trackIds.length} questions`
      : `${playlist.trackIds.length} question`;

  return (
    <Card className="relative flex h-full flex-col gap-4 overflow-hidden border-cyan-300/16 bg-cyan-300/[0.04]">
      <div
        className="absolute inset-x-5 top-0 h-px"
        style={{ backgroundColor: playlist.accentColor ?? "#2dd4bf" }}
      />
      <div
        className="flex h-16 items-center justify-between rounded-2xl border border-white/10 px-4 opacity-90"
        style={{
          background: `linear-gradient(135deg, ${playlist.accentColor ?? "#2dd4bf"}44, rgba(217,70,239,0.16), rgba(15,23,42,0.82))`,
          boxShadow: `0 0 32px ${playlist.accentColor ?? "#2dd4bf"}22`,
        }}
      >
        <span className="h-8 w-8 rounded-full border-[8px] border-cyan-100 border-r-fuchsia-300 shadow-[0_0_18px_rgba(34,211,238,0.22)]" />
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/75">
          Mini-jeu
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-200">
              {difficultyLabels[playlist.difficulty]}
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              {playlist.name}
            </h2>
          </div>
          <div className="rounded-full border border-fuchsia-300/20 bg-fuchsia-300/[0.08] px-3 py-1 text-sm font-semibold text-fuchsia-100">
            {trackCountLabel}
          </div>
        </div>

        <p className="text-sm leading-6 text-zinc-300">
          {playlist.description}
        </p>
      </div>

      <Button
        className="w-full"
        href={`/playlists/${playlist.id}`}
        variant="secondary"
      >
        Configurer
      </Button>
    </Card>
  );
}
