import { PageShell } from "@/components/layout/PageShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function MultiplayerPage() {
  return (
    <PageShell>
      <div className="flex max-w-3xl flex-col gap-6 lg:col-span-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Badge>Multijoueur beta</Badge>
          <Button className="w-full sm:w-fit" href="/" variant="ghost">
            Retour accueil
          </Button>
        </div>

        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-200">
            Lobby BT
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-white drop-shadow-[0_0_26px_rgba(34,211,238,0.18)] sm:text-5xl lg:text-6xl">
            Cree une room, invite les joueurs.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-zinc-300">
            Cette premiere base prepare les sessions partagees : code de room,
            pseudos et lobby. La synchronisation du jeu arrivera ensuite.
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:col-span-2 lg:grid-cols-2">
        <Card className="bt-interactive-lift flex flex-col justify-between gap-5 border-cyan-300/20 bg-cyan-300/[0.045]">
          <div>
            <Badge>Host</Badge>
            <h2 className="mt-4 text-3xl font-semibold text-white">
              Creer une session
            </h2>
            <p className="mt-3 text-sm leading-6 text-zinc-300">
              Genere un code et ouvre un lobby pour accueillir les joueurs.
            </p>
          </div>
          <Button className="w-full sm:w-fit" href="/multiplayer/create">
            Creer
          </Button>
        </Card>

        <Card className="bt-interactive-lift flex flex-col justify-between gap-5 border-fuchsia-300/20 bg-fuchsia-300/[0.04]">
          <div>
            <Badge>Joueur</Badge>
            <h2 className="mt-4 text-3xl font-semibold text-white">
              Rejoindre une session
            </h2>
            <p className="mt-3 text-sm leading-6 text-zinc-300">
              Entre un code et ton pseudo pour rejoindre un lobby existant.
            </p>
          </div>
          <Button className="w-full sm:w-fit" href="/multiplayer/join" variant="secondary">
            Rejoindre
          </Button>
        </Card>
      </div>
    </PageShell>
  );
}
