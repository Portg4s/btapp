import { Button } from "@/components/ui/Button";

const strengths = [
  "Categories modulables",
  "Extraits automatiques",
  "Reveal sans friction",
  "Difficulte ajustable",
];

const categoryChips = [
  "Anime",
  "Disney",
  "Films",
  "Rap FR",
  "Series",
  "Jeux video",
];

export default function Home() {
  return (
    <main className="min-h-dvh overflow-hidden bg-background text-foreground">
      <section className="relative isolate flex min-h-dvh items-center px-5 py-6 sm:px-8 lg:px-12">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_12%,rgba(34,211,238,0.22),transparent_28%),radial-gradient(circle_at_78%_24%,rgba(217,70,239,0.22),transparent_30%),linear-gradient(145deg,#050611_0%,#0a0d21_42%,#13071f_100%)]" />
        <div className="bt-ambient-grid absolute inset-0 -z-10 bg-[linear-gradient(rgba(34,211,238,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(217,70,239,0.06)_1px,transparent_1px)] bg-[size:34px_34px] opacity-45" />
        <div className="absolute left-1/2 top-1/2 -z-10 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/10 shadow-[0_0_120px_rgba(34,211,238,0.12)]" />

        <div className="bt-app-reveal mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div className="flex flex-col gap-7">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/[0.07] px-3 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100 shadow-[0_0_28px_rgba(34,211,238,0.12)]">
              <span className="h-2 w-2 rounded-full bg-fuchsia-300 shadow-[0_0_18px_rgba(240,171,252,0.75)]" />
              BT live room
            </div>

            <div className="space-y-5">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-fuchsia-200">
                Blindtest mobile
              </p>
              <h1 className="max-w-3xl text-5xl font-semibold leading-[0.92] text-white drop-shadow-[0_0_34px_rgba(34,211,238,0.2)] sm:text-7xl">
                La salle de jeu musicale qui tient dans ta poche.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-zinc-300 sm:text-lg">
                Compose un mix pop culture, lance les extraits, laisse la tension
                monter, puis revele la reponse au bon moment. Pense pour le
                telephone, calibre pour les soirees.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button className="w-full sm:w-auto" href="/party/setup">
                Lancer une partie
              </Button>
              <Button className="w-full sm:w-auto" href="/mini-games" variant="secondary">
                Mode mini-jeu
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {strengths.map((strength) => (
                <div
                  className="bt-interactive-lift rounded-2xl border border-cyan-300/15 bg-slate-950/55 px-3 py-3 text-sm font-semibold text-cyan-50 shadow-[inset_0_0_18px_rgba(34,211,238,0.06)]"
                  key={strength}
                >
                  {strength}
                </div>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute -inset-8 -z-10 rounded-full border border-fuchsia-300/10 bt-orbit-glow" />
            <div className="relative overflow-hidden rounded-[2rem] border border-cyan-300/20 bg-slate-950/70 p-4 shadow-[0_0_70px_rgba(34,211,238,0.16)] backdrop-blur-md">
              <div className="absolute inset-x-5 top-0 h-px bg-[linear-gradient(90deg,transparent,#67e8f9,#f0abfc,transparent)]" />
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
                    Round 04
                  </p>
                  <p className="mt-1 text-xl font-semibold text-white">
                    Pop culture mix
                  </p>
                </div>
                <div className="rounded-full bg-cyan-300 px-3 py-1 text-sm font-bold text-[#050611] shadow-[0_0_22px_rgba(34,211,238,0.45)]">
                  12s
                </div>
              </div>

              <div className="relative mb-4 flex aspect-square items-center justify-center rounded-[1.75rem] border border-white/10 bg-[radial-gradient(circle_at_center,rgba(217,70,239,0.24),transparent_34%),linear-gradient(145deg,rgba(34,211,238,0.2),rgba(15,23,42,0.94))]">
                <div className="bt-disc flex h-36 w-36 items-center justify-center rounded-full border border-cyan-200/20 bg-black/30 shadow-[0_0_56px_rgba(217,70,239,0.24),inset_0_0_32px_rgba(34,211,238,0.12)]">
                  <div className="h-20 w-20 rounded-full border-[16px] border-cyan-100 border-r-fuchsia-300 shadow-[0_0_28px_rgba(34,211,238,0.28)]" />
                </div>
                <div className="absolute bottom-5 flex h-9 items-end gap-1">
                  {[16, 28, 20, 34, 24, 30, 18].map((height, index) => (
                    <span
                      className="bt-eq-bar w-1.5 rounded-full bg-cyan-200 shadow-[0_0_12px_rgba(103,232,249,0.8)]"
                      key={`${height}-${index}`}
                      style={{ height, animationDelay: `${index * 90}ms` }}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {categoryChips.map((category) => (
                  <div
                    className="rounded-2xl border border-fuchsia-300/15 bg-fuchsia-300/[0.055] px-3 py-2 text-sm font-semibold text-zinc-100"
                    key={category}
                  >
                    {category}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
