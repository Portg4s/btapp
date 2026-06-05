"use client";

import { useEffect, useMemo, useState } from "react";
import { AudioEqualizer } from "@/components/audio/AudioEqualizer";
import { PageShell } from "@/components/layout/PageShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  calculateScore,
  createAnswerOptions,
  createGameSession,
  getCurrentRound,
  getGameProgress,
} from "@/features/game";
import { useAudioPreview } from "@/features/game/useAudioPreview";
import { searchItunesTracks } from "@/features/music/musicProvider";
import type { GameSession, MiniGameMode, UserAnswer } from "@/types/game";
import type { MusicTrack, Playlist } from "@/types/music";

type GameRoundClientProps = {
  mode: MiniGameMode;
  playlist: Playlist;
};

type ProviderStatus = "loading" | "ready" | "error";

const MIN_OPTION_COUNT = 4;
const DEFAULT_QUESTION_COUNT = 10;
const modeLabels: Record<MiniGameMode, string> = {
  artist: "Devine l'artiste",
  track: "Devine le morceau",
};

type AnswerOption = {
  detail?: string;
  id: string;
  label: string;
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

function getPlayableCategories(playlist: Playlist) {
  return playlist.categories && playlist.categories.length > 0
    ? playlist.categories
    : [playlist.name];
}

function getStableIndex(seed: string, length: number) {
  if (length <= 0) {
    return 0;
  }

  return (
    seed.split("").reduce((sum, character) => sum + character.charCodeAt(0), 0) %
    length
  );
}

function createTrackAnswerOptions(
  correctTrack: MusicTrack,
  tracks: MusicTrack[],
): AnswerOption[] {
  return createAnswerOptions(correctTrack, tracks).map((track) => ({
    detail: track.artist,
    id: track.id,
    label: track.title,
  }));
}

function createArtistAnswerOptions(
  correctTrack: MusicTrack,
  tracks: MusicTrack[],
): AnswerOption[] {
  const wrongArtists = Array.from(
    new Set(
      tracks
        .map((track) => track.artist)
        .filter((artist) => artist && artist !== correctTrack.artist),
    ),
  ).slice(0, MIN_OPTION_COUNT - 1);
  const options = [correctTrack.artist, ...wrongArtists].slice(
    0,
    MIN_OPTION_COUNT,
  );
  const correctArtistIndex = getStableIndex(correctTrack.id, options.length);

  return [
    ...options.slice(1, correctArtistIndex + 1),
    correctTrack.artist,
    ...options.slice(correctArtistIndex + 1),
  ].map((artist) => ({
    detail: "Artiste",
    id: artist,
    label: artist,
  }));
}

export function GameRoundClient({ mode, playlist }: GameRoundClientProps) {
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [providerStatus, setProviderStatus] =
    useState<ProviderStatus>("loading");
  const [providerError, setProviderError] = useState<string | null>(null);
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const questionCount = playlist.questionCount ?? DEFAULT_QUESTION_COUNT;

  useEffect(() => {
    let isCancelled = false;

    void searchItunesTracks({
      categories: getPlayableCategories(playlist),
      category: playlist.name,
      difficulty: playlist.difficulty,
      limit: questionCount,
    }).then((result) => {
      if (isCancelled) {
        return;
      }

      if (result.tracks.length < questionCount) {
        setProviderStatus("error");
        setProviderError(
          result.error ??
            "Impossible de charger assez d'extraits reels. Choisis plus de themes ou reduis le nombre de questions.",
        );
        return;
      }

      setTracks(result.tracks.slice(0, questionCount));
      setProviderStatus("ready");
    });

    return () => {
      isCancelled = true;
    };
  }, [playlist, questionCount]);

  const apiPlaylist = useMemo(
    () => ({
      ...playlist,
      trackIds: tracks.map((track) => track.id),
    }),
    [playlist, tracks],
  );
  const initialSession = useMemo(
    () =>
      createGameSession(apiPlaylist, tracks, {
        sessionId: `${playlist.id}-api`,
        status: "playing",
      }),
    [apiPlaylist, playlist.id, tracks],
  );
  const session = useMemo(() => {
    if (!initialSession) {
      return null;
    }

    return createAnsweredSession(
      initialSession,
      answers,
      selectedTrackId,
      isFinished,
    );
  }, [answers, initialSession, isFinished, selectedTrackId]);
  const currentRound = session ? getCurrentRound(session, tracks) : null;
  const progress = session
    ? getGameProgress(session)
    : { currentRound: 0, percentage: 0, totalRounds: questionCount };
  const score = session
    ? calculateScore(session)
    : {
        averageResponseTimeMs: 0,
        correctAnswers: 0,
        sessionId: playlist.id,
        totalPoints: 0,
        totalRounds: questionCount,
      };
  const answerOptions = currentRound
    ? mode === "artist"
      ? createArtistAnswerOptions(currentRound.track, tracks)
      : createTrackAnswerOptions(currentRound.track, tracks)
    : [];
  const audio = useAudioPreview(currentRound?.track.audioPreviewUrl ?? "");
  const hasAnswered = selectedTrackId !== null;
  const correctAnswerId =
    mode === "artist" ? currentRound?.track.artist : currentRound?.track.id;
  const isCorrect = selectedTrackId === correctAnswerId;
  const isLastRound = answers.length >= questionCount;
  const isAudioMotionActive = audio.status === "playing";

  function handleAnswer(answerId: string) {
    if (!currentRound || hasAnswered || isFinished) {
      return;
    }

    const nextIsCorrect =
      answerId ===
      (mode === "artist" ? currentRound.track.artist : currentRound.track.id);

    setSelectedTrackId(answerId);
    setAnswers((currentAnswers) => {
      if (currentAnswers.some((answer) => answer.trackId === currentRound.track.id)) {
        return currentAnswers;
      }

      return [
        ...currentAnswers,
        {
          trackId: currentRound.track.id,
          selectedTrackId: answerId,
          isCorrect: nextIsCorrect,
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

  if (providerStatus === "loading") {
    return (
      <PageShell>
        <Card
          as="section"
          className="flex max-w-2xl flex-col gap-5 border-cyan-300/20 bg-cyan-300/[0.045] lg:col-span-2"
        >
          <Badge>Preparation</Badge>
          <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
            Preparation des extraits.
          </h1>
          <p className="max-w-xl text-base leading-7 text-zinc-300">
            Recherche de {questionCount} previews audio pour le theme{" "}
            {playlist.name}.
          </p>
          <Button className="w-full sm:w-fit" href="/playlists" variant="ghost">
            Changer de theme
          </Button>
        </Card>
      </PageShell>
    );
  }

  if (
    providerStatus === "error" ||
    (!isFinished &&
      (!session ||
        !currentRound ||
        answerOptions.length < MIN_OPTION_COUNT))
  ) {
    return (
      <PageShell>
        <Card
          as="section"
          className="flex max-w-2xl flex-col gap-6 border-fuchsia-300/20 bg-fuchsia-300/[0.045] lg:col-span-2"
        >
          <Badge>Extraits indisponibles</Badge>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
              Impossible de lancer ce theme.
            </h1>
            <p className="max-w-xl text-base leading-7 text-zinc-300">
              {providerError ??
                "Ce reglage ne fournit pas assez de previews pour une session propre. Essaie plus de themes, moins de questions, ou une difficulte plus souple."}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button className="w-full sm:w-fit" href="/playlists">
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

  if (isFinished) {
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
              theme {playlist.name} en mode {modeLabels[mode]}.
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

  if (!currentRound) {
    return null;
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
              {modeLabels[mode]}
            </h1>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:min-w-72">
            <StatTile label="Progression" value={`${progress.currentRound}/${progress.totalRounds}`} />
            <StatTile label="Score" value={`${score.totalPoints} pts`} />
          </div>
        </div>
      </div>

      <Card className="relative flex flex-col gap-3 overflow-hidden border-cyan-300/20 bg-cyan-300/[0.045] lg:col-span-2">
        <div className="absolute inset-x-5 top-0 h-px bg-[linear-gradient(90deg,transparent,#67e8f9,#f0abfc,transparent)]" />

        <div className="grid gap-3 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 rounded-3xl border border-white/10 bg-black/20 p-2.5 sm:p-3">
              <div
                className="bt-audio-disc flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/15 bg-[linear-gradient(145deg,rgba(34,211,238,0.16),rgba(217,70,239,0.12),rgba(15,23,42,0.92))] sm:h-28 sm:w-28"
                data-state={isAudioMotionActive ? "playing" : "ready"}
              >
                <div className="bt-audio-disc-core h-11 w-11 rounded-full border-[9px] border-cyan-100 border-r-fuchsia-300 shadow-[0_0_24px_rgba(34,211,238,0.24)] sm:h-16 sm:w-16 sm:border-[12px]" />
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
                <div className="mt-2 flex items-end gap-3">
                  <Button className="min-h-10 flex-1 px-4 text-sm" onClick={handleAudioToggle}>
                  {audio.status === "playing" ? "Pause audio" : "Ecouter"}
                  </Button>
                  <div className="hidden rounded-full border border-cyan-300/10 bg-black/20 px-3 py-0.5 sm:block">
                    <AudioEqualizer
                      isActive={isAudioMotionActive}
                      size="compact"
                    />
                  </div>
                </div>
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
                Cette preview iTunes est indisponible pour le moment.
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2.5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-fuchsia-200">
                Reponses
              </p>
              <h2 className="mt-1 text-xl font-semibold text-white">
                {mode === "artist"
                  ? "Choisis le bon artiste"
                  : "Choisis le bon titre"}
              </h2>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              {answerOptions.map((option, index) => {
                const isSelected = selectedTrackId === option.id;
                const isCorrectOption =
                  hasAnswered && option.id === correctAnswerId;
                const isWrongSelection =
                  hasAnswered && isSelected && !isCorrectOption;

                return (
                  <button
                    className={`bt-interactive-lift flex min-h-14 items-center gap-2.5 rounded-2xl border px-3 py-2 text-left transition focus:outline-none focus:ring-2 focus:ring-cyan-300 disabled:cursor-default ${
                      isCorrectOption
                        ? "border-cyan-200/60 bg-cyan-300/[0.16] shadow-[0_0_24px_rgba(34,211,238,0.18)]"
                        : isWrongSelection
                          ? "border-fuchsia-300/55 bg-fuchsia-300/[0.14]"
                          : "border-cyan-300/12 bg-cyan-300/[0.045] hover:border-cyan-300/25 hover:bg-cyan-300/[0.08]"
                    }`}
                    disabled={hasAnswered}
                    key={option.id}
                    onClick={() => handleAnswer(option.id)}
                    type="button"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-cyan-300/20 bg-black/20 text-xs font-semibold text-cyan-100">
                      {index + 1}
                      </span>
                      <span className="min-w-0">
                        <span className="line-clamp-1 block text-sm font-semibold text-white">
                        {option.label}
                      </span>
                      <span className="line-clamp-1 block text-xs text-zinc-500">
                        {option.detail}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="sticky bottom-2 z-10 grid gap-3 rounded-2xl border border-white/10 bg-[#050611]/90 p-2 backdrop-blur-md sm:static sm:grid-cols-[1fr_auto] sm:items-center sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
              <p className="text-sm leading-6 text-zinc-400">
                {hasAnswered
                  ? isCorrect
                    ? "Bonne reponse. Signal verrouille."
                    : mode === "artist"
                      ? `Mauvaise reponse. Le bon artiste etait ${currentRound.track.artist}.`
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
