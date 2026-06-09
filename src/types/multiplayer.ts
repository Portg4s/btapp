import type { MiniGameMode } from "@/types/game";
import type { MusicTrack, PlaylistDifficulty } from "@/types/music";

export type RoomStatus = "lobby" | "playing" | "reveal" | "finished";

export type MultiplayerGameSettings = {
  difficulty: PlaylistDifficulty;
  mode: MiniGameMode;
  questionCount: number;
  themeIds: string[];
  themes: string[];
};

export type Room = {
  code: string;
  createdAt: string;
  gameMode?: string | null;
  hostName: string;
  id: string;
  currentRoundIndex: number;
  finishedAt?: string | null;
  revealedAt?: string | null;
  roundStartedAt?: string | null;
  settings: Record<string, unknown>;
  status: RoomStatus;
  updatedAt: string;
};

export type RoomPlayer = {
  id: string;
  isHost: boolean;
  joinedAt: string;
  lastSeenAt: string;
  nickname: string;
  roomId: string;
};

export type CreateRoomInput = {
  hostName: string;
  gameMode?: string;
  settings?: Record<string, unknown>;
};

export type JoinRoomInput = {
  code: string;
  nickname: string;
};

export type RoomSession = {
  player: RoomPlayer;
  room: Room;
};

export type RoomTrack = {
  createdAt: string;
  id: string;
  roomId: string;
  roundIndex: number;
  track: MusicTrack;
};

export type RoomAnswer = {
  answerValue: string;
  createdAt: string;
  id: string;
  isCorrect: boolean;
  playerId: string;
  roomId: string;
  roundIndex: number;
};

export type RoomScoreboardEntry = {
  correctAnswers: number;
  player: RoomPlayer;
  score: number;
  totalAnswers: number;
};

export type MultiplayerResult<TData> =
  | { data: TData; error: null }
  | { data: null; error: string };
