import { PageShell } from "@/components/layout/PageShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { mockPlaylists } from "@/data/mockPlaylists";
import { mockTracks } from "@/data/mockTracks";
import { GameRoundClient } from "@/features/game/GameRoundClient";
import { createGameSession, getCurrentRound } from "@/features/game";
import type { Playlist } from "@/types/music";

type GamePageProps = {
  searchParams: Promise<{
    playlistId?: string | string[];
  }>;
};

function getPlaylistId(playlistId?: string | string[]) {
  return Array.isArray(playlistId) ? playlistId[0] : playlistId;
}

function resolvePlaylist(playlistId?: string): Playlist | undefined {
  return (
    mockPlaylists.find((playlist) => playlist.id === playlistId) ??
    mockPlaylists[0]
  );
}

export default async function GamePage({ searchParams }: GamePageProps) {
  const { playlistId: playlistIdParam } = await searchParams;
  const playlist = resolvePlaylist(getPlaylistId(playlistIdParam));
  const session = createGameSession(playlist, mockTracks, {
    status: "playing",
  });

  if (!playlist || !session || !getCurrentRound(session, mockTracks)) {
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
              Aucune playlist jouable n est disponible dans les donnees mockees
              actuelles.
            </p>
          </div>
          <Button className="w-full sm:w-fit" href="/playlists">
            Retour aux playlists
          </Button>
        </Card>
      </PageShell>
    );
  }

  return (
    <GameRoundClient
      initialSession={session}
      playlist={playlist}
      tracks={mockTracks}
    />
  );
}
