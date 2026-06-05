import { PageShell } from "@/components/layout/PageShell";
import { PlaylistCard } from "@/components/playlist/PlaylistCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { mockPlaylists } from "@/data/mockPlaylists";

export default function PlaylistsPage() {
  return (
    <PageShell>
      <div className="flex max-w-3xl flex-col gap-7 lg:col-span-2">
        <Badge>Selection V1</Badge>

        <div className="space-y-5">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-200">
            Playlists
          </p>
          <h1 className="max-w-2xl text-4xl font-semibold leading-tight text-white drop-shadow-[0_0_26px_rgba(217,70,239,0.16)] sm:text-5xl lg:text-6xl">
            Choisis ton terrain de jeu musical.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-zinc-300 sm:text-lg">
            Les playlists ci-dessous utilisent les premieres donnees mockees de
            BT. Elles preparent le futur lancement de partie sans encore
            demarrer de moteur de jeu.
          </p>
        </div>

        <Button className="w-full sm:w-fit" href="/" variant="ghost">
          Retour vers BT
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
        {mockPlaylists.map((playlist) => (
          <PlaylistCard key={playlist.id} playlist={playlist} />
        ))}
      </div>
    </PageShell>
  );
}
