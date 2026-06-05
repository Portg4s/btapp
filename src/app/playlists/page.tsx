import { PageShell } from "@/components/layout/PageShell";
import { PlaylistCard } from "@/components/playlist/PlaylistCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { mockPlaylists } from "@/data/mockPlaylists";

export default function PlaylistsPage() {
  return (
    <PageShell>
      <div className="flex max-w-3xl flex-col gap-6 lg:col-span-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Badge>Themes jouables</Badge>
          <Button className="w-full sm:w-fit" href="/mini-games" variant="ghost">
            Retour aux mini-jeux
          </Button>
        </div>

        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-200">
            Devine le morceau
          </p>
          <h1 className="max-w-2xl text-4xl font-semibold leading-tight text-white drop-shadow-[0_0_26px_rgba(217,70,239,0.16)] sm:text-5xl lg:text-6xl">
            Choisis ton theme de mini-jeu.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-zinc-300">
            Chaque theme lance une session courte avec quatre choix par question.
            Les formats sont prets pour passer a 10 ou 25 extraits quand le
            mini-jeu exploitera le provider API.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
        {mockPlaylists.map((playlist) => (
          <PlaylistCard key={playlist.id} playlist={playlist} />
        ))}
      </div>
    </PageShell>
  );
}
