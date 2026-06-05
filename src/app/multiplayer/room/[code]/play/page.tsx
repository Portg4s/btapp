import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { MultiplayerGameClient } from "@/features/multiplayer/MultiplayerGameClient";

type MultiplayerPlayPageProps = {
  params: Promise<{
    code: string;
  }>;
  searchParams: Promise<{
    playerId?: string | string[];
  }>;
};

export default async function MultiplayerPlayPage({
  params,
  searchParams,
}: MultiplayerPlayPageProps) {
  const { code } = await params;
  const { playerId } = await searchParams;
  const initialPlayerId = Array.isArray(playerId) ? playerId[0] : playerId;

  return (
    <PageShell>
      <Card
        as="section"
        className="max-w-4xl border-cyan-300/20 bg-cyan-300/[0.045] lg:col-span-2"
      >
        <MultiplayerGameClient code={code} initialPlayerId={initialPlayerId} />
      </Card>
    </PageShell>
  );
}
