import {
  DEFAULT_ANSWER_OPTION_COUNT,
  DEFAULT_SESSION_STARTED_AT,
  POINTS_PER_CORRECT_ANSWER,
} from "@/features/game/game.constants";
import type { GameSession, GameStatus, Score } from "@/types/game";
import type { MusicTrack, Playlist } from "@/types/music";

type CreateGameSessionOptions = {
  sessionId?: string;
  startedAt?: string;
  status?: GameStatus;
};

export type CurrentRound = {
  roundIndex: number;
  roundNumber: number;
  totalRounds: number;
  track: MusicTrack;
};

export type GameProgress = {
  currentRound: number;
  totalRounds: number;
  percentage: number;
};

export type AnswerOptions = MusicTrack[];

function uniqueTracksById(tracks: MusicTrack[]) {
  return tracks.filter(
    (track, index, source) =>
      source.findIndex((candidate) => candidate.id === track.id) === index,
  );
}

function getSafeOptionCount(optionCount: number) {
  return Math.max(Math.floor(optionCount), 0);
}

function getStableIndex(seed: string, length: number) {
  if (length <= 0) {
    return 0;
  }

  const total = seed
    .split("")
    .reduce((sum, character) => sum + character.charCodeAt(0), 0);

  return total % length;
}

export function createGameSession(
  playlist: Playlist | undefined,
  tracks: MusicTrack[],
  options: CreateGameSessionOptions = {},
): GameSession | null {
  if (!playlist) {
    return null;
  }

  const availableTrackIds = new Set(tracks.map((track) => track.id));
  const playableTrackIds = playlist.trackIds.filter((trackId, index, source) => {
    return availableTrackIds.has(trackId) && source.indexOf(trackId) === index;
  });

  if (playableTrackIds.length === 0) {
    return null;
  }

  const startedAt = options.startedAt ?? DEFAULT_SESSION_STARTED_AT;

  return {
    id: options.sessionId ?? `${playlist.id}-${startedAt}`,
    playlistId: playlist.id,
    trackIds: playableTrackIds,
    currentRoundIndex: 0,
    status: options.status ?? "idle",
    startedAt,
    answers: [],
  };
}

export function getCurrentRound(
  session: GameSession,
  tracks: MusicTrack[],
): CurrentRound | null {
  const totalRounds = session.trackIds.length;

  if (
    totalRounds === 0 ||
    session.status === "finished" ||
    session.currentRoundIndex < 0 ||
    session.currentRoundIndex >= totalRounds
  ) {
    return null;
  }

  const trackId = session.trackIds[session.currentRoundIndex];
  const track = tracks.find((candidate) => candidate.id === trackId);

  if (!track) {
    return null;
  }

  return {
    roundIndex: session.currentRoundIndex,
    roundNumber: session.currentRoundIndex + 1,
    totalRounds,
    track,
  };
}

export function createAnswerOptions(
  correctTrack: MusicTrack | undefined,
  tracks: MusicTrack[],
  optionCount = DEFAULT_ANSWER_OPTION_COUNT,
): AnswerOptions {
  const safeOptionCount = getSafeOptionCount(optionCount);

  if (!correctTrack || safeOptionCount === 0) {
    return [];
  }

  const uniqueTracks = uniqueTracksById(tracks);
  const wrongOptions = uniqueTracks
    .filter((track) => track.id !== correctTrack.id)
    .slice(0, Math.max(safeOptionCount - 1, 0));
  const options = [correctTrack, ...wrongOptions].slice(0, safeOptionCount);
  const correctTrackIndex = getStableIndex(correctTrack.id, options.length);

  return [
    ...options.slice(1, correctTrackIndex + 1),
    correctTrack,
    ...options.slice(correctTrackIndex + 1),
  ];
}

export function getGameProgress(session: GameSession): GameProgress {
  const totalRounds = session.trackIds.length;

  if (totalRounds === 0) {
    return {
      currentRound: 0,
      totalRounds,
      percentage: 0,
    };
  }

  const currentRound =
    session.status === "finished"
      ? totalRounds
      : Math.min(Math.max(session.currentRoundIndex + 1, 1), totalRounds);

  return {
    currentRound,
    totalRounds,
    percentage: Math.round((currentRound / totalRounds) * 100),
  };
}

export function calculateScore(session: GameSession): Score {
  const answeredRounds = session.answers.length;
  const correctAnswers = session.answers.filter((answer) => answer.isCorrect);
  const totalResponseTime = session.answers.reduce(
    (sum, answer) => sum + answer.responseTimeMs,
    0,
  );

  return {
    sessionId: session.id,
    totalRounds: session.trackIds.length,
    correctAnswers: correctAnswers.length,
    totalPoints: correctAnswers.length * POINTS_PER_CORRECT_ANSWER,
    averageResponseTimeMs:
      answeredRounds > 0 ? Math.round(totalResponseTime / answeredRounds) : 0,
  };
}
