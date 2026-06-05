"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { PlaylistDifficulty } from "@/types/music";

type PartySetupClientProps = {
  categories: string[];
};

const TRACK_COUNT_OPTIONS = [10, 25, 50];
const GUESS_DURATION_OPTIONS = [10, 15, 20];
const REVEAL_DURATION_OPTIONS = [3, 5];
const DIFFICULTY_OPTIONS: Array<{
  label: string;
  value: PlaylistDifficulty;
}> = [
  { label: "Facile", value: "easy" },
  { label: "Moyen", value: "medium" },
  { label: "Difficile", value: "hard" },
];
const HIDDEN_SETUP_CATEGORIES = ["API Test", "Rap FR"];

export function PartySetupClient({ categories }: PartySetupClientProps) {
  const visibleCategories = categories.filter(
    (category) => !HIDDEN_SETUP_CATEGORIES.includes(category),
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [trackCount, setTrackCount] = useState(50);
  const [guessDuration, setGuessDuration] = useState(15);
  const [revealDuration, setRevealDuration] = useState(3);
  const [difficulty, setDifficulty] = useState<PlaylistDifficulty>("easy");
  const partyHref = useMemo(() => {
    const params = new URLSearchParams();
    params.set("categories", selectedCategories.join(","));
    params.set("count", String(trackCount));
    params.set("difficulty", difficulty);
    params.set("guess", String(guessDuration));
    params.set("reveal", String(revealDuration));

    return `/party?${params.toString()}`;
  }, [difficulty, guessDuration, revealDuration, selectedCategories, trackCount]);

  function toggleCategory(category: string) {
    setSelectedCategories((currentCategories) =>
      currentCategories.includes(category)
        ? currentCategories.filter((item) => item !== category)
        : [...currentCategories, category],
    );
  }

  return (
    <>
      <div className="flex max-w-3xl flex-col gap-5 lg:col-span-2">
        <div className="flex items-center justify-between gap-3">
          <Button className="px-4 py-2 text-sm sm:w-fit" href="/" variant="ghost">
            Accueil
          </Button>
          <Badge>Mode soiree</Badge>
        </div>
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
            Categories
          </p>
          <h1 className="max-w-2xl text-4xl font-semibold leading-tight text-white drop-shadow-[0_0_26px_rgba(217,70,239,0.16)] sm:text-5xl">
            Compose ton blindtest entre amis.
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-zinc-300 sm:text-base">
            Choisis tes themes, ajuste le rythme et lance la partie.
          </p>
        </div>
        {selectedCategories.length > 0 ? (
          <Button className="w-full sm:w-fit" href={partyHref}>
            Lancer le blindtest
          </Button>
        ) : (
          <Button className="w-full sm:w-fit" disabled>
            Lancer le blindtest
          </Button>
        )}
      </div>

      <Card
        as="section"
        className="flex flex-col gap-4 border-cyan-300/15 bg-cyan-300/[0.04] lg:col-span-2"
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
            Reglages
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            Format de la partie
          </h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-4">
          <SettingGroup
            label="Nombre d extraits"
            options={TRACK_COUNT_OPTIONS}
            selectedValue={trackCount}
            suffix=""
            onSelect={setTrackCount}
          />
          <SettingGroup
            label="Duree pour deviner"
            options={GUESS_DURATION_OPTIONS}
            selectedValue={guessDuration}
            suffix="s"
            onSelect={setGuessDuration}
          />
          <SettingGroup
            label="Duree du reveal"
            options={REVEAL_DURATION_OPTIONS}
            selectedValue={revealDuration}
            suffix="s"
            onSelect={setRevealDuration}
          />
          <DifficultySettingGroup
            selectedValue={difficulty}
            onSelect={setDifficulty}
          />
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:col-span-2">
        {visibleCategories.map((category) => {
          const isSelected = selectedCategories.includes(category);

          return (
            <button
              className={`rounded-2xl border p-3 text-left transition active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-cyan-300 ${
                isSelected
                  ? "border-cyan-200/60 bg-cyan-300/[0.14] shadow-[0_0_28px_rgba(34,211,238,0.18)]"
                  : "border-cyan-300/15 bg-slate-950/55 hover:border-fuchsia-300/35 hover:bg-fuchsia-300/[0.07]"
              }`}
              key={category}
              onClick={() => toggleCategory(category)}
              type="button"
            >
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-cyan-200">
                Theme
              </p>
              <h2 className="mt-2 text-base font-semibold leading-tight text-white sm:text-xl">
                {category}
              </h2>
              <p className="mt-2 text-xs font-medium text-zinc-400">
                {isSelected ? "Selectionne" : "Ajouter"}
              </p>
            </button>
          );
        })}
      </div>

      <Card
        as="section"
        className="border-fuchsia-300/15 bg-fuchsia-300/[0.04] py-4 lg:col-span-2"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-fuchsia-200">
          Selection actuelle
        </p>
        <p className="mt-2 text-sm leading-6 text-zinc-300">
          {selectedCategories.length > 0
            ? `${selectedCategories.join(" + ")} · ${trackCount} extraits · ${guessDuration}s · reveal ${revealDuration}s`
            : "Choisis au moins une categorie pour lancer la partie."}
        </p>
      </Card>
    </>
  );
}

type DifficultySettingGroupProps = {
  selectedValue: PlaylistDifficulty;
  onSelect: (value: PlaylistDifficulty) => void;
};

function DifficultySettingGroup({
  onSelect,
  selectedValue,
}: DifficultySettingGroupProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-zinc-300">Difficulte</p>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-1">
        {DIFFICULTY_OPTIONS.map((option) => {
          const isSelected = option.value === selectedValue;

          return (
            <button
              className={`rounded-2xl border px-3 py-2.5 text-sm font-semibold transition active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-cyan-300 ${
                isSelected
                  ? "border-cyan-200/60 bg-cyan-300/[0.14] text-white shadow-[0_0_22px_rgba(34,211,238,0.14)]"
                  : "border-cyan-300/15 bg-slate-950/55 text-zinc-300 hover:border-fuchsia-300/35 hover:bg-fuchsia-300/[0.07]"
              }`}
              key={option.value}
              onClick={() => onSelect(option.value)}
              type="button"
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

type SettingGroupProps = {
  label: string;
  options: number[];
  selectedValue: number;
  suffix: string;
  onSelect: (value: number) => void;
};

function SettingGroup({
  label,
  onSelect,
  options,
  selectedValue,
  suffix,
}: SettingGroupProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-zinc-300">{label}</p>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-1">
        {options.map((option) => {
          const isSelected = option === selectedValue;

          return (
            <button
              className={`rounded-2xl border px-3 py-2.5 text-sm font-semibold transition active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-cyan-300 ${
                isSelected
                  ? "border-cyan-200/60 bg-cyan-300/[0.14] text-white shadow-[0_0_22px_rgba(34,211,238,0.14)]"
                  : "border-cyan-300/15 bg-slate-950/55 text-zinc-300 hover:border-fuchsia-300/35 hover:bg-fuchsia-300/[0.07]"
              }`}
              key={option}
              onClick={() => onSelect(option)}
              type="button"
            >
              {option}
              {suffix}
            </button>
          );
        })}
      </div>
    </div>
  );
}
