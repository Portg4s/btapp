"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AudioEqualizer } from "@/components/audio/AudioEqualizer";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  advanceRoomRound,
  getRoomAnswers,
  getRoomByCode,
  getRoomPlayers,
  getRoomScoreboard,
  getRoomTracks,
  revealRoomRound,
  submitRoomAnswer,
} from "@/features/multiplayer/multiplayer.service";
import { useAudioPreview } from "@/features/game/useAudioPreview";
import type { MiniGameMode } from "@/types/game";
import type {
  MultiplayerGameSettings,
  Room,
  RoomAnswer,
  RoomPlayer,
  RoomTrack,
} from "@/types/multiplayer";
import type { MusicTrack } from "@/types/music";

type MultiplayerGameClientProps = {
  code: string;
  initialPlayerId?: string;
};

type AnswerOption = {
  detail?: string;
  id: string;
  label: string;
};

const MIN_OPTION_COUNT = 4;
const modeLabels: Record<MiniGameMode, string> = {
  artist: "Devine l'artiste",
  track: "Devine le morceau",
};

function getStoredPlayerId(code: string) {
  if (typeof window === "undefined") {
    return "";
  }

  return window.sessionStorage.getItem(`bt-room-player-${code}`) ?? "";
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

function createTrackOptions(correctTrack: MusicTrack, tracks: MusicTrack[]) {
  const wrongTracks = tracks
    .filter((track) => track.id !== correctTrack.id)
    .filter(
      (track, index, list) =>
        list.findIndex(
          (item) =>
            (item.answerTitle ?? item.title).toLowerCase() ===
            (track.answerTitle ?? track.title).toLowerCase(),
        ) === index,
    )
    .slice(0, MIN_OPTION_COUNT - 1);
  const options = [correctTrack, ...wrongTracks].slice(0, MIN_OPTION_COUNT);
  const correctIndex = getStableIndex(correctTrack.id, options.length);

  return [
    ...options.slice(1, correctIndex + 1),
    correctTrack,
    ...options.slice(correctIndex + 1),
  ].map((track) => ({
    detail: track.artist,
    id: track.id,
    label: track.answerTitle ?? track.title,
  }));
}

function createArtistOptions(correctTrack: MusicTrack, tracks: MusicTrack[]) {
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
  const correctIndex = getStableIndex(correctTrack.id, options.length);

  return [
    ...options.slice(1, correctIndex + 1),
    correctTrack.artist,
    ...options.slice(correctIndex + 1),
  ].map((artist) => ({
    detail: "Artiste",
    id: artist,
    label: artist,
  }));
}

function getOptions({
  mode,
  track,
  tracks,
}: {
  mode: MiniGameMode;
  track: MusicTrack;
  tracks: MusicTrack[];
}): AnswerOption[] {
  return mode === "artist"
    ? createArtistOptions(track, tracks)
    : createTrackOptions(track, tracks);
}

export function MultiplayerGameClient({
  code,
  initialPlayerId = "",
}: MultiplayerGameClientProps) {
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<RoomPlayer[]>([]);
  const [roomTracks, setRoomTracks] = useState<RoomTrack[]>([]);
  const [answers, setAnswers] = useState<RoomAnswer[]>([]);
  const [playerId, setPlayerId] = useState(initialPlayerId);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadGame = useCallback(
    async ({ silent = false }: { silent?: boolean } = {}) => {
      if (!silent) {
        setIsLoading(true);
      }
      setError(null);

      const roomResult = await getRoomByCode(code);

      if (roomResult.error || !roomResult.data) {
        setRoom(null);
        setError(roomResult.error);
        setIsLoading(false);
        return;
      }

      const [playersResult, tracksResult, answersResult] = await Promise.all([
        getRoomPlayers(roomResult.data.id),
        getRoomTracks(roomResult.data.id),
        getRoomAnswers(roomResult.data.id),
      ]);

      setRoom(roomResult.data);
      setPlayers(playersResult.data ?? []);
      setRoomTracks(tracksResult.data ?? []);
      setAnswers(answersResult.data ?? []);
      setError(playersResult.error ?? tracksResult.error ?? answersResult.error);
      setIsLoading(false);
    },
    [code],
  );

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setPlayerId((currentPlayerId) => currentPlayerId || getStoredPlayerId(code));
      void loadGame();
    }, 0);
    const interval = window.setInterval(() => {
      void loadGame({ silent: true });
    }, 3000);

    return () => {
      window.clearTimeout(timeout);
      window.clearInterval(interval);
    };
  }, [code, loadGame]);

  const settings = (room?.settings ?? {}) as Partial<MultiplayerGameSettings>;
  const mode: MiniGameMode = room?.gameMode === "artist" ? "artist" : "track";
  const tracks = roomTracks.map((roomTrack) => roomTrack.track);
  const currentRoomTrack = roomTracks.find(
    (roomTrack) => roomTrack.roundIndex === (room?.currentRoundIndex ?? 0),
  );
  const currentTrack = currentRoomTrack?.track;
  const currentPlayer = players.find((player) => player.id === playerId);
  const isHost = Boolean(currentPlayer?.isHost);
  const currentAnswer = answers.find(
    (answer) =>
      answer.playerId === playerId &&
      answer.roundIndex === (room?.currentRoundIndex ?? 0),
  );
  const scoreboard = useMemo(
    () => getRoomScoreboard({ answers, players }),
    [answers, players],
  );
  const answerOptions = currentTrack
    ? getOptions({ mode, track: currentTrack, tracks })
    : [];
  const correctAnswerId =
    mode === "artist" ? currentTrack?.artist : currentTrack?.id;
  const audio = useAudioPreview(currentTrack?.audioPreviewUrl ?? "");
  const isAudioMotionActive = audio.status === "playing";
  const totalRounds = roomTracks.length || settings.questionCount || 10;
  const roundNumber = (room?.currentRoundIndex ?? 0) + 1;
  const progress = totalRounds > 0 ? (roundNumber / totalRounds) * 100 : 0;

  async function handleAnswer(answerId: string) {
    if (!room || !currentTrack || !currentPlayer || currentAnswer) {
      return;
    }

    setIsSubmitting(true);
    setActionError(null);

    const result = await submitRoomAnswer({
      answerValue: answerId,
      isCorrect: answerId === correctAnswerId,
      playerId: currentPlayer.id,
      roomId: room.id,
      roundIndex: room.currentRoundIndex,
    });

    setIsSubmitting(false);

    if (result.error) {
      setActionError(result.error);
      return;
    }

    await loadGame({ silent: true });
  }

  async function handleReveal() {
    if (!room || !isHost) {
      return;
    }

    setActionError(null);
    const result = await revealRoomRound(room.id);

    if (result.error) {
      setActionError(result.error);
      return;
    }

    audio.reset();
    await loadGame({ silent: true });
  }

  async function handleNextRound() {
    if (!room || !isHost) {
      return;
    }

    setActionError(null);
    const result = await advanceRoomRound({
      currentRoundIndex: room.currentRoundIndex,
      roomId: room.id,
      totalRounds,
    });

    if (result.error) {
      setActionError(result.error);
      return;
    }

    audio.reset();
    await loadGame({ silent: true });
  }

  function handleAudioToggle() {
    if (audio.status === "playing") {
      audio.pause();
      return;
    }

    void audio.play();
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Badge>Multijoueur</Badge>
        <p className="text-base leading-7 text-zinc-300">
          Chargement de la partie {code}...
        </p>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="space-y-5">
        <Badge>Partie indisponible</Badge>
        <h1 className="text-4xl font-semibold leading-tight text-white">
          Impossible d&apos;ouvrir cette partie.
        </h1>
        <p className="text-base leading-7 text-zinc-300">
          {error ?? "Session introuvable."}
        </p>
        <Button className="w-full sm:w-fit" href="/multiplayer/join">
          Rejoindre une autre session
        </Button>
      </div>
    );
  }

  if (!currentPlayer) {
    return (
      <div className="space-y-5">
        <Badge>Joueur inconnu</Badge>
        <h1 className="text-4xl font-semibold leading-tight text-white">
          Rejoins la room avant de jouer.
        </h1>
        <p className="text-base leading-7 text-zinc-300">
          Ton appareil n&apos;est pas associe a un joueur de cette session.
        </p>
        <Button className="w-full sm:w-fit" href={`/multiplayer/room/${room.code}`}>
          Retour au lobby
        </Button>
      </div>
    );
  }

  if (room.status === "lobby" || !currentTrack) {
    return (
      <div className="space-y-5">
        <Badge>En attente</Badge>
        <h1 className="text-4xl font-semibold leading-tight text-white">
          La partie n&apos;est pas encore lancee.
        </h1>
        <p className="text-base leading-7 text-zinc-300">
          Retourne au lobby ou attends que l&apos;hote demarre.
        </p>
        <Button
          className="w-full sm:w-fit"
          href={`/multiplayer/room/${room.code}?playerId=${currentPlayer.id}`}
        >
          Retour au lobby
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Badge>{room.status === "finished" ? "Score final" : modeLabels[mode]}</Badge>
        <Button
          className="w-full sm:w-fit"
          href={`/multiplayer/room/${room.code}?playerId=${currentPlayer.id}`}
          variant="ghost"
        >
          Lobby
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
            Room {room.code}
          </p>
          <h1 className="mt-2 text-3xl font-semibold leading-tight text-white sm:text-5xl">
            Question {Math.min(roundNumber, totalRounds)}/{totalRounds}
          </h1>
        </div>
        <div className="rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.05] p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
            Ton score
          </p>
          <p className="mt-1 text-lg font-semibold text-white">
            {scoreboard.find((entry) => entry.player.id === currentPlayer.id)?.score ?? 0} pts
          </p>
        </div>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,#67e8f9,#c084fc,#f0abfc)]"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>

      {room.status === "finished" ? (
        <div className="space-y-3 rounded-3xl border border-cyan-300/14 bg-cyan-300/[0.06] p-4">
          <p className="text-lg font-semibold text-white">Partie terminee.</p>
          <Scoreboard entries={scoreboard} />
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3 rounded-3xl border border-white/10 bg-black/20 p-3">
            <div
              className="bt-audio-disc flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/15 bg-[linear-gradient(145deg,rgba(34,211,238,0.16),rgba(217,70,239,0.12),rgba(15,23,42,0.92))]"
              data-state={isAudioMotionActive ? "playing" : "ready"}
            >
              <div className="bt-audio-disc-core h-11 w-11 rounded-full border-[9px] border-cyan-100 border-r-fuchsia-300 shadow-[0_0_24px_rgba(34,211,238,0.24)]" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
                Extrait audio
              </p>
              <div className="mt-2 flex items-center gap-3">
                <Button className="min-h-10 flex-1 px-4 text-sm" onClick={handleAudioToggle}>
                  {audio.status === "playing" ? "Pause audio" : "Ecouter"}
                </Button>
                <AudioEqualizer isActive={isAudioMotionActive} size="compact" />
              </div>
            </div>
          </div>

          {answerOptions.length < MIN_OPTION_COUNT ? (
            <p className="rounded-2xl border border-fuchsia-300/20 bg-fuchsia-300/[0.08] px-4 py-3 text-sm leading-6 text-fuchsia-100">
              Pas assez de propositions propres pour ce round.
            </p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {answerOptions.map((option, index) => {
                const isSelected = currentAnswer?.answerValue === option.id;
                const isCorrectOption =
                  room.status === "reveal" && option.id === correctAnswerId;
                const isWrongSelection =
                  room.status === "reveal" && isSelected && !isCorrectOption;

                return (
                  <button
                    className={`bt-interactive-lift flex min-h-14 items-center gap-2.5 rounded-2xl border px-3 py-2 text-left transition focus:outline-none focus:ring-2 focus:ring-cyan-300 disabled:cursor-default ${
                      isCorrectOption
                        ? "border-cyan-200/60 bg-cyan-300/[0.16]"
                        : isWrongSelection
                          ? "border-fuchsia-300/55 bg-fuchsia-300/[0.14]"
                          : isSelected
                            ? "border-cyan-200/45 bg-cyan-300/[0.11]"
                            : "border-cyan-300/12 bg-cyan-300/[0.045] hover:border-cyan-300/25"
                    }`}
                    disabled={Boolean(currentAnswer) || room.status !== "playing" || isSubmitting}
                    key={option.id}
                    onClick={() => void handleAnswer(option.id)}
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
          )}

          <div className="sticky bottom-2 z-10 grid gap-3 rounded-2xl border border-white/10 bg-[#050611]/90 p-2 backdrop-blur-md sm:static sm:grid-cols-[1fr_auto] sm:items-center sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
            <p className="text-sm leading-6 text-zinc-400">
              {currentAnswer
                ? currentAnswer.isCorrect
                  ? "Bonne reponse !"
                  : "Mauvaise reponse."
                : room.status === "reveal"
                  ? "Round revele."
                  : "Choisis une proposition, puis attends l'hote."}
            </p>

            {isHost ? (
              room.status === "reveal" ? (
                <Button className="w-full sm:w-fit" onClick={handleNextRound}>
                  {roundNumber >= totalRounds ? "Terminer" : "Question suivante"}
                </Button>
              ) : (
                <Button className="w-full sm:w-fit" onClick={handleReveal} variant="secondary">
                  Reveler
                </Button>
              )
            ) : (
              <button
                className="min-h-14 rounded-full border border-white/10 bg-white/[0.03] px-6 text-base font-semibold text-zinc-500"
                disabled
                type="button"
              >
                En attente de l&apos;hote
              </button>
            )}
          </div>
        </>
      )}

      {actionError ? (
        <p className="rounded-2xl border border-fuchsia-300/20 bg-fuchsia-300/[0.08] px-4 py-3 text-sm leading-6 text-fuchsia-100">
          {actionError}
        </p>
      ) : null}

      <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
          Scores
        </p>
        <Scoreboard entries={scoreboard} />
      </div>
    </div>
  );
}

function Scoreboard({ entries }: { entries: ReturnType<typeof getRoomScoreboard> }) {
  return (
    <div className="mt-3 space-y-2">
      {entries.map((entry, index) => (
        <div
          className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.035] px-3 py-2"
          key={entry.player.id}
        >
          <p className="min-w-0 text-sm font-semibold text-white">
            {index + 1}. {entry.player.nickname}
          </p>
          <p className="text-sm font-semibold text-cyan-100">{entry.score} pts</p>
        </div>
      ))}
    </div>
  );
}
