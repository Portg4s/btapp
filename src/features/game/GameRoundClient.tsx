"use client";

import { useMemo, useState } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  calculateScore,
  createAnswerOptions,
  getCurrentRound,
  getGameProgress,
} from "@/features/game";
import { useAudioPreview } from "@/features/game/useAudioPreview";
import type { GameSession, UserAnswer } from "@/types/game";
import type { MusicTrack, Playlist } from "@/types/music";

type GameRoundClientProps = {
  initialSession: GameSession;
  playlist: Playlist;
  tracks: MusicTrack[];
};

function createAnsweredSession(
  initialSession: GameSession,
  answers: UserAnswer[],
  selectedTrackId: string | null,
  isFinished: boolean,
): GameSession {
  const nextRoundIndex =
    selectedTrackId === null ? answers.length : Math.max(answers.length - 1, 0);

  return {
    ...initialSession,
    answers,
    currentRoundIndex: nextRoundIndex,
    status: isFinished ? "finished" : "playing",
  };
}

export function GameRoundClient({
  initialSession,
  playlist,
  tracks,
}: GameRoundClientProps) {
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  const session = useMemo(
    () =>
      createAnsweredSession(
        initialSession,
        answers,
        selectedTrackId,
        isFinished,
      ),
    [answers, initialSession, isFinished, selectedTrackId],
  );
  const currentRound = getCurrentRound(session, tracks);
  const progress = getGameProgress(session);
  const score = calculateScore(session);
  const answerOptions = currentRound
    ? createAnswerOptions(currentRound.track, tracks)
    : [];
  const audio = useAudioPreview(currentRound?.track.audioPreviewUrl ?? "");
  const hasAnswered = selectedTrackId !== null;
  const isCorrect = selectedTrackId === currentRound?.track.id;
  const isLastRound = answers.length >= initialSession.trackIds.length;

  function handleAnswer(trackId: string) {
    if (!currentRound || hasAnswered || isFinished) {
      return;
    }

    setSelectedTrackId(trackId);
    setAnswers((currentAnswers) => {
      if (currentAnswers.some((answer) => answer.trackId === currentRound.track.id)) {
        return currentAnswers;
      }

      return [
        ...currentAnswers,
        {
          trackId: currentRound.track.id,
          selectedTrackId: trackId,
          isCorrect: trackId === currentRound.track.id,
          answeredAt: new Date().toISOString(),
          responseTimeMs: 0,
        },
      ];
    });
  }

  function handleNextRound() {
    if (!hasAnswered) {
      return;
    }

    if (isLastRound) {
      audio.reset();
      setIsFinished(true);
      setSelectedTrackId(null);
      return;
    }

    audio.reset();
    setSelectedTrackId(null);
  }

  function handleReplay() {
    audio.reset();
    setAnswers([]);
    setSelectedTrackId(null);
    setIsFinished(false);
  }

  function handleAudioToggle() {
    if (audio.status === "playing") {
      audio.pause();
      return;
    }

    void audio.play();
  }

  if (isFinished || !currentRound) {
    return (
      <PageShell>
        <Card
          as="section"
          className="flex max-w-2xl flex-col gap-6 border-cyan-300/20 bg-cyan-300/[0.045] lg:col-span-2"
        >
          <Badge>Mini-jeu termine</Badge>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
              Score final : {score.totalPoints} pts
            </h1>
            <p className="max-w-xl text-base leading-7 text-zinc-300">
              {score.correctAnswers}/{score.totalRounds} bonnes reponses sur le
              theme {playlist.name}.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button className="w-full sm:w-fit" onClick={handleReplay}>
              Rejouer
            </Button>
            <Button className="w-full sm:w-fit" href="/playlists" variant="secondary">
              Changer de theme
            </Button>
            <Button className="w-full sm:w-fit" href="/mini-games" variant="secondary">
              Mini-jeux
            </Button>
          </div>
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="flex flex-col gap-4 lg:col-span-2">
        <div className="flex items-center justify-between gap-3">
          <Button className="px-3 py-2 text-sm sm:w-fit" href="/mini-games" variant="ghost">
            Quitter
          </Button>
          <Badge>{hasAnswered ? "Reponse verrouillee" : "Round en cours"}</Badge>
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
              {playlist.name}
            </p>
            <h1 className="mt-2 text-3xl font-semibold leading-tight text-white drop-shadow-[0_0_26px_rgba(34,211,238,0.18)] sm:text-5xl">
              Devine le morceau
            </h1>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:min-w-72">
            <StatTile label="Progression" value={`${progress.currentRound}/${progress.totalRounds}`} />
            <StatTile label="Score" value={`${score.totalPoints} pts`} />
          </div>
        </div>
      </div>

      <Card className="relative flex flex-col gap-4 overflow-hidden border-cyan-300/20 bg-cyan-300/[0.045] lg:col-span-2">
        <div className="absolute inset-x-5 top-0 h-px bg-[linear-gradient(90deg,transparent,#67e8f9,#f0abfc,transparent)]" />

        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 rounded-3xl border border-white/10 bg-black/20 p-3">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/15 bg-[linear-gradient(145deg,rgba(34,211,238,0.16),rgba(217,70,239,0.12),rgba(15,23,42,0.92))] sm:h-28 sm:w-28">
                <div className="h-12 w-12 rounded-full border-[10px] border-cyan-100 border-r-fuchsia-300 shadow-[0_0_24px_rgba(34,211,238,0.24)] sm:h-16 sm:w-16 sm:border-[12px]" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
                  Extrait audio
                </p>
                <p className="mt-1 text-sm leading-6 text-zinc-400">
                  {audio.status === "error"
                    ? "Extrait indisponible."
                    : audio.status === "playing"
                      ? "Lecture en cours."
                      : audio.status === "paused"
                        ? "Lecture en pause."
                        : "Pret a lancer."}
                </p>
                <Button className="mt-3 min-h-11 w-full px-4 text-sm" onClick={handleAudioToggle}>
                  {audio.status === "playing" ? "Pause audio" : "Ecouter"}
                </Button>
              </div>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#67e8f9,#c084fc,#f0abfc)] shadow-[0_0_22px_rgba(34,211,238,0.45)]"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>

            {audio.status === "error" ? (
              <p className="text-sm leading-6 text-fuchsia-200">
                Cet extrait local est indisponible pour ce theme.
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-fuchsia-200">
                Reponses
              </p>
              <h2 className="mt-1 text-xl font-semibold text-white">
                Choisis le bon titre
              </h2>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              {answerOptions.map((track, index) => {
                const isSelected = selectedTrackId === track.id;
                const isCorrectOption =
                  hasAnswered && track.id === currentRound.track.id;
                const isWrongSelection =
                  hasAnswered && isSelected && !isCorrectOption;

                return (
                  <button
                    className={`flex min-h-16 items-center gap-3 rounded-2xl border px-3 py-2 text-left transition focus:outline-none focus:ring-2 focus:ring-cyan-300 disabled:cursor-default ${
                      isCorrectOption
                        ? "border-cyan-200/60 bg-cyan-300/[0.16] shadow-[0_0_24px_rgba(34,211,238,0.18)]"
                        : isWrongSelection
                          ? "border-fuchsia-300/55 bg-fuchsia-300/[0.14]"
                          : "border-cyan-300/12 bg-cyan-300/[0.045] hover:border-cyan-300/25 hover:bg-cyan-300/[0.08]"
                    }`}
                    disabled={hasAnswered}
                    key={track.id}
                    onClick={() => handleAnswer(track.id)}
                    type="button"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-cyan-300/20 bg-black/20 text-xs font-semibold text-cyan-100">
                      {index + 1}
                    </span>
                    <span className="min-w-0">
                      <span className="line-clamp-1 block text-sm font-semibold text-white">
                        {track.title}
                      </span>
                      <span className="line-clamp-1 block text-xs text-zinc-500">
                        {track.artist}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
              <p className="text-sm leading-6 text-zinc-400">
                {hasAnswered
                  ? isCorrect
                    ? "Bonne reponse. Signal verrouille."
                    : `Mauvaise reponse. Le bon titre etait ${currentRound.track.title}.`
                  : "Selectionne une proposition pour verrouiller ta reponse."}
              </p>

              <Button
                className="w-full sm:w-fit"
                disabled={!hasAnswered}
                onClick={handleNextRound}
              >
                {isLastRound ? "Voir le score" : "Suivant"}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </PageShell>
  );
}

type StatTileProps = {
  label: string;
  value: string;
};

function StatTile({ label, value }: StatTileProps) {
  return (
    <div className="rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.05] p-3">
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-zinc-500">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}
