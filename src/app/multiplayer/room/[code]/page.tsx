import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { RoomLobbyClient } from "@/features/multiplayer/RoomLobbyClient";

type MultiplayerRoomPageProps = {
  params: Promise<{
    code: string;
  }>;
};

export default async function MultiplayerRoomPage({
  params,
}: MultiplayerRoomPageProps) {
  const { code } = await params;

  return (
    <PageShell>
      <Card
        as="section"
        className="max-w-3xl border-cyan-300/20 bg-cyan-300/[0.045] lg:col-span-2"
      >
        <RoomLobbyClient code={code} />
      </Card>
    </PageShell>
  );
}
