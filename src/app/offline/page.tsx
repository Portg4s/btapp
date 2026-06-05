import { PageShell } from "@/components/layout/PageShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function OfflinePage() {
  return (
    <PageShell>
      <Card
        as="section"
        className="flex max-w-2xl flex-col gap-6 border-cyan-300/20 bg-cyan-300/[0.045] lg:col-span-2"
      >
        <Badge>Hors ligne</Badge>
        <div className="space-y-4">
          <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
            BT est en mode offline.
          </h1>
          <p className="max-w-xl text-base leading-7 text-zinc-300">
            La navigation de base reste disponible, mais les extraits musicaux
            et la recherche iTunes necessitent une connexion internet.
          </p>
        </div>
        <Button className="w-full sm:w-fit" href="/">
          Retour accueil
        </Button>
      </Card>
    </PageShell>
  );
}
