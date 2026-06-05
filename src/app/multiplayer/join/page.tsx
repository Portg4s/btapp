import { PageShell } from "@/components/layout/PageShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { JoinRoomClient } from "@/features/multiplayer/JoinRoomClient";

export default function JoinMultiplayerRoomPage() {
  return (
    <PageShell>
      <Card
        as="section"
        className="flex max-w-2xl flex-col gap-6 border-fuchsia-300/20 bg-fuchsia-300/[0.045] lg:col-span-2"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Badge>Rejoindre</Badge>
          <Button className="w-full sm:w-fit" href="/multiplayer" variant="ghost">
            Retour
          </Button>
        </div>
        <div className="space-y-3">
          <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
            Entre dans la room.
          </h1>
          <p className="text-base leading-7 text-zinc-300">
            Demande le code a l&apos;hote, ajoute ton pseudo, puis rejoins le lobby.
          </p>
        </div>
        <JoinRoomClient />
      </Card>
    </PageShell>
  );
}
