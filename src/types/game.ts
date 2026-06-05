export type GameStatus = "idle" | "playing" | "paused" | "finished";

export type UserAnswer = {
  trackId: string;
  selectedTrackId?: string;
  isCorrect: boolean;
  answeredAt: string;
  responseTimeMs: number;
};

export type GameSession = {
  id: string;
  playlistId: string;
  trackIds: string[];
  currentRoundIndex: number;
  status: GameStatus;
  startedAt: string;
  endedAt?: string;
  answers: UserAnswer[];
};

export type Score = {
  sessionId: string;
  totalRounds: number;
  correctAnswers: number;
  totalPoints: number;
  averageResponseTimeMs: number;
};
