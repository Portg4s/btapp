"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { MiniGameMode } from "@/types/game";
import type { Playlist, PlaylistDifficulty } from "@/types/music";

const questionOptions = [10, 15, 25];
const difficultyOptions: Array<{
  label: string;
  value: PlaylistDifficulty;
}> = [
  { label: "Facile", value: "easy" },
  { label: "Moyen", value: "medium" },
  { label: "Difficile", value: "hard" },
];

const modeLabels: Record<MiniGameMode, string> = {
  artist: "Devine l'artiste",
  track: "Devine le morceau",
};

type MiniGameSetupClientProps = {
  initialMode: MiniGameMode;
  themes: Playlist[];
};

function getThemeCategory(theme: Playlist) {
  return theme.categories?.[0] ?? theme.name;
}

export function MiniGameSetupClient({
  initialMode,
  themes,
}: MiniGameSetupClientProps) {
  const [selectedThemeIds, setSelectedThemeIds] = useState(() =>
    themes.map((theme) => theme.id),
  );
  const [questionCount, setQuestionCount] = useState(10);
  const [difficulty, setDifficulty] = useState<PlaylistDifficulty>("easy");
  const selectedThemes = themes.filter((theme) =>
    selectedThemeIds.includes(theme.id),
  );
  const launchHref = useMemo(() => {
    const params = new URLSearchParams({
      count: String(questionCount),
      difficulty,
      mode: initialMode,
      themes: selectedThemeIds.join(","),
    });

    return `/game?${params.toString()}`;
  }, [difficulty, initialMode, questionCount, selectedThemeIds]);

  function toggleTheme(themeId: string) {
    setSelectedThemeIds((currentThemeIds) =>
      currentThemeIds.includes(themeId)
        ? currentThemeIds.filter((currentThemeId) => currentThemeId !== themeId)
        : [...currentThemeIds, themeId],
    );
  }

  return (
    <>
      <div className="flex max-w-3xl flex-col gap-6 lg:col-span-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Badge>Configuration</Badge>
          <Button className="w-full sm:w-fit" href="/mini-games" variant="ghost">
            Retour aux mini-jeux
          </Button>
        </div>

        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-200">
            Mode : {modeLabels[initialMode]}
          </p>
          <h1 className="max-w-2xl text-4xl font-semibold leading-tight text-white drop-shadow-[0_0_26px_rgba(217,70,239,0.16)] sm:text-5xl lg:text-6xl">
            Configure ton mini-jeu.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-zinc-300">
            Combine plusieurs themes, choisis la duree, puis lance une session
            avec de vrais extraits audio et quatre propositions par question.
          </p>
        </div>
      </div>

      <Card className="relative flex flex-col gap-5 overflow-hidden border-cyan-300/20 bg-cyan-300/[0.045] lg:col-span-2">
        <div className="absolute inset-x-5 top-0 h-px bg-[linear-gradient(90deg,transparent,#67e8f9,#f0abfc,transparent)]" />

        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-5">
            <ConfigGroup title="Mode">
              <div className="rounded-2xl border border-cyan-200/35 bg-cyan-300/[0.1] p-4">
                <p className="text-base font-semibold text-white">
                  {modeLabels[initialMode]}
                </p>
                <Button className="mt-3 w-full sm:w-fit" href="/mini-games" variant="ghost">
                  Changer de mode
                </Button>
              </div>
            </ConfigGroup>

            <ConfigGroup title="Questions">
              <div className="grid grid-cols-3 gap-2">
                {questionOptions.map((option) => (
                  <button
                    className={`bt-interactive-lift rounded-2xl border px-3 py-3 text-sm font-semibold ${
                      questionCount === option
                        ? "border-fuchsia-200/55 bg-fuchsia-300/[0.14] text-white"
                        : "border-fuchsia-300/12 bg-fuchsia-300/[0.045] text-zinc-300"
                    }`}
                    key={option}
                    onClick={() => setQuestionCount(option)}
                    type="button"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </ConfigGroup>

            <ConfigGroup title="Difficulte">
              <div className="grid grid-cols-3 gap-2">
                {difficultyOptions.map((option) => (
                  <button
                    className={`bt-interactive-lift rounded-2xl border px-2 py-3 text-sm font-semibold ${
                      difficulty === option.value
                        ? "border-cyan-200/55 bg-cyan-300/[0.14] text-white"
                        : "border-cyan-300/12 bg-cyan-300/[0.045] text-zinc-300"
                    }`}
                    key={option.value}
                    onClick={() => setDifficulty(option.value)}
                    type="button"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </ConfigGroup>
          </div>

          <div className="space-y-5">
            <ConfigGroup title="Themes">
              <div className="grid gap-2 sm:grid-cols-2">
                {themes.map((theme) => {
                  const isSelected = selectedThemeIds.includes(theme.id);

                  return (
                    <button
                      className={`bt-interactive-lift rounded-2xl border p-3 text-left ${
                        isSelected
                          ? "border-cyan-200/55 bg-cyan-300/[0.13]"
                          : "border-white/10 bg-black/20"
                      }`}
                      key={theme.id}
                      onClick={() => toggleTheme(theme.id)}
                      type="button"
                    >
                      <span className="block text-base font-semibold text-white">
                        {theme.name}
                      </span>
                      <span className="mt-1 block text-xs font-semibold uppercase tracking-[0.14em] text-cyan-200">
                        {getThemeCategory(theme)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </ConfigGroup>

            <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                Session
              </p>
              <p className="mt-2 text-lg font-semibold text-white">
                {questionCount} questions · {selectedThemes.length} theme
                {selectedThemes.length > 1 ? "s" : ""}
              </p>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Pour 25 questions, choisis plusieurs themes afin de garder un
                pool varie et eviter les doublons.
              </p>
            </div>

            {selectedThemeIds.length > 0 ? (
              <Button className="w-full" href={launchHref}>
                Lancer la session
              </Button>
            ) : (
              <button
                className="min-h-14 w-full rounded-full border border-white/10 bg-white/[0.03] px-6 text-base font-semibold text-zinc-500"
                disabled
                type="button"
              >
                Selectionne au moins un theme
              </button>
            )}
          </div>
        </div>
      </Card>
    </>
  );
}

type ConfigGroupProps = {
  children: ReactNode;
  title: string;
};

function ConfigGroup({ children, title }: ConfigGroupProps) {
  return (
    <section className="space-y-3">
      <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-fuchsia-200">
        {title}
      </h2>
      {children}
    </section>
  );
}
