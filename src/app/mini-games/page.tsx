import { PageShell } from "@/components/layout/PageShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const upcomingMiniGames = [
  {
    name: "Devine l'artiste",
    description: "Un extrait, quatre artistes, zero temps mort.",
  },
  {
    name: "Devine l'oeuvre",
    description: "Retrouve le film, l'anime, la serie ou le jeu associe.",
  },
  {
    name: "Speed round",
    description: "Des manches tres courtes pour departager les meilleurs reflexes.",
  },
];

export default function MiniGamesPage() {
  return (
    <PageShell>
      <div className="flex max-w-3xl flex-col gap-6 lg:col-span-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Badge>Mini-jeux</Badge>
          <Button className="w-full sm:w-fit" href="/" variant="ghost">
            Retour accueil
          </Button>
        </div>

        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-200">
            Arcade musicale
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-white drop-shadow-[0_0_26px_rgba(34,211,238,0.18)] sm:text-5xl lg:text-6xl">
            Choisis ton format court.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-zinc-300">
            Des modes rapides pour jouer seul, s&apos;entrainer, ou tester un theme
            avant de lancer une vraie session soiree.
          </p>
        </div>
      </div>

      <Card className="relative overflow-hidden border-cyan-300/20 bg-cyan-300/[0.05] lg:col-span-2">
        <div className="absolute inset-x-5 top-0 h-px bg-[linear-gradient(90deg,transparent,#67e8f9,#f0abfc,transparent)]" />
        <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-end">
          <div className="space-y-4">
            <div className="inline-flex w-fit rounded-full border border-cyan-300/20 bg-cyan-300/[0.08] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">
              Disponible
            </div>
            <div>
              <h2 className="text-3xl font-semibold leading-tight text-white sm:text-4xl">
                Devine le morceau
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-300 sm:text-base">
                Lance un extrait, choisis le bon titre parmi quatre propositions,
                puis enchaine les questions dans un format mobile-first.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-semibold uppercase tracking-[0.12em] text-zinc-300">
              <span className="rounded-2xl border border-cyan-300/15 bg-black/20 px-2 py-2">
                Solo
              </span>
              <span className="rounded-2xl border border-fuchsia-300/15 bg-black/20 px-2 py-2">
                4 choix
              </span>
              <span className="rounded-2xl border border-cyan-300/15 bg-black/20 px-2 py-2">
                Audio
              </span>
            </div>
          </div>

          <Button className="w-full sm:w-fit" href="/playlists">
            Jouer
          </Button>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3 lg:col-span-2">
        {upcomingMiniGames.map((miniGame) => (
          <Card
            className="flex min-h-44 flex-col justify-between gap-5 border-fuchsia-300/14 bg-fuchsia-300/[0.035]"
            key={miniGame.name}
          >
            <div>
              <div className="mb-4 inline-flex rounded-full border border-fuchsia-300/20 bg-fuchsia-300/[0.08] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-fuchsia-100">
                Prochainement
              </div>
              <h2 className="text-xl font-semibold text-white">
                {miniGame.name}
              </h2>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                {miniGame.description}
              </p>
            </div>
            <button
              className="min-h-11 rounded-full border border-white/10 bg-white/[0.03] px-4 text-sm font-semibold text-zinc-500"
              disabled
              type="button"
            >
              Bientot
            </button>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}
