import { PageShell } from "@/components/layout/PageShell";
import { PartySetupClient } from "@/features/party/PartySetupClient";

const AVAILABLE_PARTY_CATEGORIES = [
  "Anime",
  "Années 2000",
  "Disney",
  "Films",
  "Jeux vidéo",
  "Séries",
];

export default function PartySetupPage() {
  return (
    <PageShell>
      <PartySetupClient categories={AVAILABLE_PARTY_CATEGORIES} />
    </PageShell>
  );
}
