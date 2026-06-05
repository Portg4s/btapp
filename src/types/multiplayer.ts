export type RoomStatus = "lobby" | "playing" | "finished";

export type Room = {
  code: string;
  createdAt: string;
  gameMode?: string | null;
  hostName: string;
  id: string;
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

export type MultiplayerResult<TData> =
  | { data: TData; error: null }
  | { data: null; error: string };
