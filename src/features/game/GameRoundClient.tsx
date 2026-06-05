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
          <Badge>Session terminee</Badge>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
              Score final : {score.totalPoints} pts
            </h1>
            <p className="max-w-xl text-base leading-7 text-zinc-300">
              {score.correctAnswers}/{score.totalRounds} bonnes reponses. La
              logique de jeu est active, sans audio ni timer reel pour
              l instant.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button className="w-full sm:w-fit" href="/playlists">
              Choisir une playlist
            </Button>
            <Button
              className="w-full sm:w-fit"
              onClick={handleReplay}
              variant="secondary"
            >
              Rejouer
            </Button>
          </div>
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="flex flex-col gap-5 lg:col-span-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button className="w-full sm:w-fit" href="/playlists" variant="ghost">
            Quitter la partie
          </Button>
          <Badge>{hasAnswered ? "Reponse verrouillee" : "Round en cours"}</Badge>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-200">
              {playlist.name}
            </p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight text-white drop-shadow-[0_0_26px_rgba(34,211,238,0.18)] sm:text-5xl">
              Devine le morceau.
            </h1>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:min-w-72">
            <div className="rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.05] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                Progression
              </p>
              <p className="mt-2 text-xl font-semibold text-white">
                Question {progress.currentRound}/{progress.totalRounds}
              </p>
            </div>
            <div className="rounded-2xl border border-fuchsia-300/15 bg-fuchsia-300/[0.06] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                Score
              </p>
              <p className="mt-2 text-xl font-semibold text-white">
                {score.totalPoints} pts
              </p>
            </div>
          </div>
        </div>
      </div>

      <Card className="relative overflow-hidden border-cyan-300/20 bg-cyan-300/[0.045]">
        <div className="absolute inset-x-5 top-0 h-px bg-[linear-gradient(90deg,transparent,#67e8f9,#f0abfc,transparent)]" />

        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200">
              Extrait audio
            </p>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              {audio.status === "error"
                ? "Extrait indisponible pour le moment."
                : audio.status === "playing"
                  ? "Lecture locale en cours."
                  : audio.status === "paused"
                    ? "Lecture en pause."
                    : "Pret a lancer l extrait local."}
            </p>
          </div>
          <div className="rounded-full border border-cyan-300/25 bg-cyan-300/[0.08] px-4 py-2 text-sm font-bold text-cyan-100">
            {audio.status === "playing" ? "PLAY" : "30s"}
          </div>
        </div>

        <div className="mb-6 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,#67e8f9,#c084fc,#f0abfc)] shadow-[0_0_22px_rgba(34,211,238,0.45)]"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>

        <div className="flex aspect-square items-center justify-center rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_center,rgba(217,70,239,0.22),transparent_34%),linear-gradient(145deg,rgba(34,211,238,0.16),rgba(15,23,42,0.94))] shadow-[inset_0_0_58px_rgba(34,211,238,0.08)]">
          <div className="relative flex h-44 w-44 items-center justify-center rounded-full border border-cyan-200/20 bg-black/30 shadow-[0_0_56px_rgba(217,70,239,0.22),inset_0_0_32px_rgba(34,211,238,0.12)]">
            <div className="absolute h-60 w-60 rounded-full border border-cyan-300/10" />
            <div className="absolute h-48 w-48 rounded-full border border-fuchsia-300/10" />
            <div className="h-24 w-24 rounded-full border-[18px] border-cyan-100 border-r-fuchsia-300 shadow-[0_0_32px_rgba(34,211,238,0.28)]" />
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <Button className="w-full" onClick={handleAudioToggle}>
            {audio.status === "playing"
              ? "Mettre en pause"
              : "Ecouter l extrait"}
          </Button>
          {audio.status === "error" ? (
            <p className="text-sm leading-6 text-fuchsia-200">
              Le fichier local {currentRound.track.audioPreviewUrl} n existe
              pas encore. C est normal a cette etape.
            </p>
          ) : null}
        </div>
      </Card>

      <Card
        as="section"
        className="flex flex-col gap-5 border-fuchsia-300/15 bg-fuchsia-300/[0.04]"
      >
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-fuchsia-200">
            Reponses
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            Choisis le titre correspondant
          </h2>
        </div>

        <div className="grid gap-3">
          {answerOptions.map((track, index) => {
            const isSelected = selectedTrackId === track.id;
            const isCorrectOption =
              hasAnswered && track.id === currentRound.track.id;
            const isWrongSelection =
              hasAnswered && isSelected && !isCorrectOption;

            return (
              <button
                className={`flex min-h-16 items-center justify-between rounded-2xl border px-4 py-3 text-left transition focus:outline-none focus:ring-2 focus:ring-cyan-300 disabled:cursor-default ${
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
                <span>
                  <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
                    Option {index + 1}
                  </span>
                  <span className="mt-1 block text-base font-semibold text-white">
                    {track.title}
                  </span>
                </span>
                <span className="text-sm text-zinc-500">{track.artist}</span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-4">
          <p className="text-sm leading-6 text-zinc-400">
            {hasAnswered
              ? isCorrect
                ? "Bonne reponse. Signal verrouille."
                : `Mauvaise reponse. Le bon titre etait ${currentRound.track.title}.`
              : "Selectionne une proposition pour verrouiller ta reponse."}
          </p>

          <Button
            className="w-full"
            disabled={!hasAnswered}
            onClick={handleNextRound}
          >
            {isLastRound ? "Voir le score" : "Question suivante"}
          </Button>
        </div>
      </Card>
    </PageShell>
  );
}
