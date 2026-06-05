import { getSupabaseBrowserClient, getSupabaseConfigError } from "@/lib/supabase/client";
import type {
  CreateRoomInput,
  JoinRoomInput,
  MultiplayerResult,
  Room,
  RoomPlayer,
  RoomStatus,
} from "@/types/multiplayer";

type RoomRow = {
  code: string;
  created_at: string;
  game_mode: string | null;
  host_name: string;
  id: string;
  settings: Record<string, unknown> | null;
  status: RoomStatus;
  updated_at: string;
};

type RoomPlayerRow = {
  id: string;
  is_host: boolean | null;
  joined_at: string;
  last_seen_at: string;
  nickname: string;
  room_id: string;
};

const roomCodeAlphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const roomCodeLength = 6;

export function generateRoomCode() {
  return Array.from({ length: roomCodeLength }, () =>
    roomCodeAlphabet.charAt(Math.floor(Math.random() * roomCodeAlphabet.length)),
  ).join("");
}

function getClientOrError() {
  const configError = getSupabaseConfigError();

  if (configError) {
    return { client: null, error: configError };
  }

  const client = getSupabaseBrowserClient();

  if (!client) {
    return {
      client: null,
      error: "Impossible d'initialiser Supabase dans ce navigateur.",
    };
  }

  return { client, error: null };
}

function normalizeName(value: string) {
  return value.trim().slice(0, 32);
}

function normalizeCode(value: string) {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
}

function toRoom(row: RoomRow): Room {
  return {
    code: row.code,
    createdAt: row.created_at,
    gameMode: row.game_mode,
    hostName: row.host_name,
    id: row.id,
    settings: row.settings ?? {},
    status: row.status,
    updatedAt: row.updated_at,
  };
}

function toRoomPlayer(row: RoomPlayerRow): RoomPlayer {
  return {
    id: row.id,
    isHost: Boolean(row.is_host),
    joinedAt: row.joined_at,
    lastSeenAt: row.last_seen_at,
    nickname: row.nickname,
    roomId: row.room_id,
  };
}

export async function getRoomByCode(
  code: string,
): Promise<MultiplayerResult<Room>> {
  const normalizedCode = normalizeCode(code);

  if (!normalizedCode) {
    return { data: null, error: "Code de session invalide." };
  }

  const { client, error } = getClientOrError();

  if (!client) {
    return { data: null, error };
  }

  const { data, error: queryError } = await client
    .from("rooms")
    .select("*")
    .eq("code", normalizedCode)
    .maybeSingle<RoomRow>();

  if (queryError) {
    return { data: null, error: queryError.message };
  }

  if (!data) {
    return { data: null, error: "Session introuvable." };
  }

  return { data: toRoom(data), error: null };
}

export async function getRoomPlayers(
  roomId: string,
): Promise<MultiplayerResult<RoomPlayer[]>> {
  const { client, error } = getClientOrError();

  if (!client) {
    return { data: null, error };
  }

  const { data, error: queryError } = await client
    .from("room_players")
    .select("*")
    .eq("room_id", roomId)
    .order("joined_at", { ascending: true })
    .returns<RoomPlayerRow[]>();

  if (queryError) {
    return { data: null, error: queryError.message };
  }

  return { data: (data ?? []).map(toRoomPlayer), error: null };
}

export async function createRoom({
  gameMode = "track",
  hostName,
  settings = {},
}: CreateRoomInput): Promise<MultiplayerResult<Room>> {
  const normalizedHostName = normalizeName(hostName);

  if (!normalizedHostName) {
    return { data: null, error: "Entre un pseudo hote." };
  }

  const { client, error } = getClientOrError();

  if (!client) {
    return { data: null, error };
  }

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = generateRoomCode();
    const { data, error: insertError } = await client
      .from("rooms")
      .insert({
        code,
        game_mode: gameMode,
        host_name: normalizedHostName,
        settings,
      })
      .select("*")
      .single<RoomRow>();

    if (insertError) {
      if (insertError.code === "23505") {
        continue;
      }

      return { data: null, error: insertError.message };
    }

    const room = toRoom(data);
    const playerResult = await addRoomPlayer({
      isHost: true,
      nickname: normalizedHostName,
      roomId: room.id,
    });

    if (playerResult.error) {
      return { data: null, error: playerResult.error };
    }

    return { data: room, error: null };
  }

  return {
    data: null,
    error: "Impossible de generer un code unique. Reessaie.",
  };
}

export async function joinRoom({
  code,
  nickname,
}: JoinRoomInput): Promise<MultiplayerResult<Room>> {
  const normalizedNickname = normalizeName(nickname);

  if (!normalizedNickname) {
    return { data: null, error: "Entre un pseudo joueur." };
  }

  const roomResult = await getRoomByCode(code);

  if (roomResult.error || !roomResult.data) {
    return { data: null, error: roomResult.error };
  }

  const playerResult = await addRoomPlayer({
    isHost: false,
    nickname: normalizedNickname,
    roomId: roomResult.data.id,
  });

  if (playerResult.error) {
    return { data: null, error: playerResult.error };
  }

  return { data: roomResult.data, error: null };
}

async function addRoomPlayer({
  isHost,
  nickname,
  roomId,
}: {
  isHost: boolean;
  nickname: string;
  roomId: string;
}): Promise<MultiplayerResult<RoomPlayer>> {
  const { client, error } = getClientOrError();

  if (!client) {
    return { data: null, error };
  }

  const { data, error: insertError } = await client
    .from("room_players")
    .insert({
      is_host: isHost,
      nickname,
      room_id: roomId,
    })
    .select("*")
    .single<RoomPlayerRow>();

  if (insertError) {
    return { data: null, error: insertError.message };
  }

  return { data: toRoomPlayer(data), error: null };
}
