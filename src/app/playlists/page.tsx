import { PageShell } from "@/components/layout/PageShell";
import { mockPlaylists } from "@/data/mockPlaylists";
import { MiniGameSetupClient } from "@/features/game/MiniGameSetupClient";
import type { MiniGameMode } from "@/types/game";

type PlaylistsPageProps = {
  searchParams: Promise<{
    mode?: string | string[];
  }>;
};

function getMiniGameMode(mode?: string | string[]): MiniGameMode {
  const normalizedMode = Array.isArray(mode) ? mode[0] : mode;

  return normalizedMode === "artist" ? "artist" : "track";
}

export default async function PlaylistsPage({
  searchParams,
}: PlaylistsPageProps) {
  const { mode } = await searchParams;

  return (
    <PageShell>
      <MiniGameSetupClient
        initialMode={getMiniGameMode(mode)}
        themes={mockPlaylists}
      />
    </PageShell>
  );
}
