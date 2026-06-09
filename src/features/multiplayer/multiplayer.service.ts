import { getSupabaseBrowserClient, getSupabaseConfigError } from "@/lib/supabase/client";
import type {
  CreateRoomInput,
  JoinRoomInput,
  MultiplayerGameSettings,
  MultiplayerResult,
  RoomAnswer,
  Room,
  RoomPlayer,
  RoomScoreboardEntry,
  RoomStatus,
  RoomSession,
  RoomTrack,
} from "@/types/multiplayer";
import type { MusicTrack } from "@/types/music";

type RoomRow = {
  code: string;
  created_at: string;
  game_mode: string | null;
  host_name: string;
  id: string;
  current_round_index: number | null;
  finished_at: string | null;
  revealed_at: string | null;
  round_started_at: string | null;
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

type RoomTrackRow = {
  created_at: string;
  id: string;
  room_id: string;
  round_index: number;
  track_data: MusicTrack;
};

type RoomAnswerRow = {
  answer_value: string;
  created_at: string;
  id: string;
  is_correct: boolean;
  player_id: string;
  room_id: string;
  round_index: number;
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

function toPublicError(message?: string | null) {
  if (!message) {
    return "Action impossible pour le moment. Reessaie dans quelques secondes.";
  }

  const lowerMessage = message.toLowerCase();

  if (
    lowerMessage.includes("supabase") ||
    lowerMessage.includes("failed to fetch") ||
    lowerMessage.includes("network")
  ) {
    return "Connexion au multijoueur indisponible. Verifie la configuration Supabase ou reessaie.";
  }

  if (
    lowerMessage.includes("room_tracks") ||
    lowerMessage.includes("room_answers") ||
    lowerMessage.includes("track_data") ||
    lowerMessage.includes("answer_value") ||
    lowerMessage.includes("relation") ||
    lowerMessage.includes("column")
  ) {
    return "Le multijoueur n'est pas pret. Verifie que le schema Supabase V1 a ete applique.";
  }

  return message;
}

function toRoom(row: RoomRow): Room {
  return {
    code: row.code,
    createdAt: row.created_at,
    gameMode: row.game_mode,
    hostName: row.host_name,
    id: row.id,
    currentRoundIndex: row.current_round_index ?? 0,
    finishedAt: row.finished_at,
    revealedAt: row.revealed_at,
    roundStartedAt: row.round_started_at,
    settings: row.settings ?? {},
    status: row.status,
    updatedAt: row.updated_at,
  };
}

function toRoomTrack(row: RoomTrackRow): RoomTrack {
  return {
    createdAt: row.created_at,
    id: row.id,
    roomId: row.room_id,
    roundIndex: row.round_index,
    track: row.track_data,
  };
}

function toRoomAnswer(row: RoomAnswerRow): RoomAnswer {
  return {
    answerValue: row.answer_value,
    createdAt: row.created_at,
    id: row.id,
    isCorrect: row.is_correct,
    playerId: row.player_id,
    roomId: row.room_id,
    roundIndex: row.round_index,
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
    return { data: null, error: toPublicError(queryError.message) };
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
    return { data: null, error: toPublicError(queryError.message) };
  }

  return { data: (data ?? []).map(toRoomPlayer), error: null };
}

export async function createRoom({
  gameMode = "track",
  hostName,
  settings = {},
}: CreateRoomInput): Promise<MultiplayerResult<RoomSession>> {
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

      return { data: null, error: toPublicError(insertError.message) };
    }

    const room = toRoom(data);
    const playerResult = await addRoomPlayer({
      isHost: true,
      nickname: normalizedHostName,
      roomId: room.id,
    });

    if (playerResult.error || !playerResult.data) {
      return {
        data: null,
        error: playerResult.error ?? "Impossible d'ajouter ce joueur.",
      };
    }

    return {
      data: {
        player: playerResult.data,
        room,
      },
      error: null,
    };
  }

  return {
    data: null,
    error: "Impossible de generer un code unique. Reessaie.",
  };
}

export async function joinRoom({
  code,
  nickname,
}: JoinRoomInput): Promise<MultiplayerResult<RoomSession>> {
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

  if (playerResult.error || !playerResult.data) {
    return {
      data: null,
      error: playerResult.error ?? "Impossible d'ajouter ce joueur.",
    };
  }

  return {
    data: {
      player: playerResult.data,
      room: roomResult.data,
    },
    error: null,
  };
}

export async function startMultiplayerGame({
  roomId,
  gameMode,
  settings,
  tracks,
}: {
  gameMode: string;
  roomId: string;
  settings: MultiplayerGameSettings;
  tracks: MusicTrack[];
}): Promise<MultiplayerResult<Room>> {
  if (tracks.length < settings.questionCount) {
    return {
      data: null,
      error: "Pas assez d'extraits pour lancer cette partie.",
    };
  }

  const { client, error } = getClientOrError();

  if (!client) {
    return { data: null, error };
  }

  const selectedTracks = tracks.slice(0, settings.questionCount);

  const { error: tracksDeleteError } = await client
    .from("room_tracks")
    .delete()
    .eq("room_id", roomId);

  if (tracksDeleteError) {
    return { data: null, error: toPublicError(tracksDeleteError.message) };
  }

  const { error: answersDeleteError } = await client
    .from("room_answers")
    .delete()
    .eq("room_id", roomId);

  if (answersDeleteError) {
    return { data: null, error: toPublicError(answersDeleteError.message) };
  }

  const { error: tracksInsertError } = await client.from("room_tracks").insert(
    selectedTracks.map((track, index) => ({
      room_id: roomId,
      round_index: index,
      track_data: track,
    })),
  );

  if (tracksInsertError) {
    return { data: null, error: toPublicError(tracksInsertError.message) };
  }

  const { data, error: updateError } = await client
    .from("rooms")
    .update({
      current_round_index: 0,
      finished_at: null,
      game_mode: gameMode,
      revealed_at: null,
      round_started_at: new Date().toISOString(),
      settings,
      status: "playing",
    })
    .eq("id", roomId)
    .select("*")
    .single<RoomRow>();

  if (updateError) {
    return { data: null, error: toPublicError(updateError.message) };
  }

  return { data: toRoom(data), error: null };
}

export async function getRoomTracks(
  roomId: string,
): Promise<MultiplayerResult<RoomTrack[]>> {
  const { client, error } = getClientOrError();

  if (!client) {
    return { data: null, error };
  }

  const { data, error: queryError } = await client
    .from("room_tracks")
    .select("*")
    .eq("room_id", roomId)
    .order("round_index", { ascending: true })
    .returns<RoomTrackRow[]>();

  if (queryError) {
    return { data: null, error: toPublicError(queryError.message) };
  }

  return { data: (data ?? []).map(toRoomTrack), error: null };
}

export async function submitRoomAnswer({
  answerValue,
  isCorrect,
  playerId,
  roomId,
  roundIndex,
}: {
  answerValue: string;
  isCorrect: boolean;
  playerId: string;
  roomId: string;
  roundIndex: number;
}): Promise<MultiplayerResult<RoomAnswer>> {
  const { client, error } = getClientOrError();

  if (!client) {
    return { data: null, error };
  }

  const { data, error: insertError } = await client
    .from("room_answers")
    .insert({
      answer_value: answerValue,
      is_correct: isCorrect,
      player_id: playerId,
      room_id: roomId,
      round_index: roundIndex,
    })
    .select("*")
    .single<RoomAnswerRow>();

  if (insertError) {
    if (insertError.code === "23505") {
      return { data: null, error: "Tu as deja repondu a cette question." };
    }

    return { data: null, error: toPublicError(insertError.message) };
  }

  return { data: toRoomAnswer(data), error: null };
}

export async function getRoomAnswers(
  roomId: string,
): Promise<MultiplayerResult<RoomAnswer[]>> {
  const { client, error } = getClientOrError();

  if (!client) {
    return { data: null, error };
  }

  const { data, error: queryError } = await client
    .from("room_answers")
    .select("*")
    .eq("room_id", roomId)
    .order("created_at", { ascending: true })
    .returns<RoomAnswerRow[]>();

  if (queryError) {
    return { data: null, error: toPublicError(queryError.message) };
  }

  return { data: (data ?? []).map(toRoomAnswer), error: null };
}

export async function revealRoomRound(
  roomId: string,
): Promise<MultiplayerResult<Room>> {
  const { client, error } = getClientOrError();

  if (!client) {
    return { data: null, error };
  }

  const { data, error: updateError } = await client
    .from("rooms")
    .update({
      revealed_at: new Date().toISOString(),
      status: "reveal",
    })
    .eq("id", roomId)
    .select("*")
    .single<RoomRow>();

  if (updateError) {
    return { data: null, error: toPublicError(updateError.message) };
  }

  return { data: toRoom(data), error: null };
}

export async function advanceRoomRound({
  currentRoundIndex,
  roomId,
  totalRounds,
}: {
  currentRoundIndex: number;
  roomId: string;
  totalRounds: number;
}): Promise<MultiplayerResult<Room>> {
  if (currentRoundIndex + 1 >= totalRounds) {
    return finishRoom(roomId);
  }

  const { client, error } = getClientOrError();

  if (!client) {
    return { data: null, error };
  }

  const { data, error: updateError } = await client
    .from("rooms")
    .update({
      current_round_index: currentRoundIndex + 1,
      revealed_at: null,
      round_started_at: new Date().toISOString(),
      status: "playing",
    })
    .eq("id", roomId)
    .select("*")
    .single<RoomRow>();

  if (updateError) {
    return { data: null, error: toPublicError(updateError.message) };
  }

  return { data: toRoom(data), error: null };
}

export async function finishRoom(
  roomId: string,
): Promise<MultiplayerResult<Room>> {
  const { client, error } = getClientOrError();

  if (!client) {
    return { data: null, error };
  }

  const { data, error: updateError } = await client
    .from("rooms")
    .update({
      finished_at: new Date().toISOString(),
      status: "finished",
    })
    .eq("id", roomId)
    .select("*")
    .single<RoomRow>();

  if (updateError) {
    return { data: null, error: toPublicError(updateError.message) };
  }

  return { data: toRoom(data), error: null };
}

export function getRoomScoreboard({
  answers,
  players,
}: {
  answers: RoomAnswer[];
  players: RoomPlayer[];
}): RoomScoreboardEntry[] {
  return players
    .map((player) => {
      const playerAnswers = answers.filter(
        (answer) => answer.playerId === player.id,
      );
      const correctAnswers = playerAnswers.filter(
        (answer) => answer.isCorrect,
      ).length;

      return {
        correctAnswers,
        player,
        score: correctAnswers * 100,
        totalAnswers: playerAnswers.length,
      };
    })
    .sort((left, right) => right.score - left.score);
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
    return { data: null, error: toPublicError(insertError.message) };
  }

  return { data: toRoomPlayer(data), error: null };
}
